import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import tls from 'node:tls';
import { getDb } from '../lib/db.js';

interface SslResult {
  domain: string;
  clientName: string;
  valid: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  issuer: string | null;
  subject: string | null;
  serialNumber: string | null;
  protocol: string | null;
  error: string | null;
  status: 'valid' | 'expiring' | 'expired' | 'error';
  checkedAt: string;
}

/**
 * Connect to a domain via TLS and extract real certificate details.
 */
function checkCertificate(domain: string, timeoutMs = 8000): Promise<Omit<SslResult, 'clientName'>> {
  return new Promise((resolve) => {
    const hostname = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').split(':')[0];

    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,        // SNI
        rejectUnauthorized: false,   // We want to read even expired certs
        timeout: timeoutMs,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          if (!cert || !cert.valid_to) {
            socket.destroy();
            return resolve({
              domain: hostname,
              valid: false,
              expiresAt: null,
              daysLeft: null,
              issuer: null,
              subject: null,
              serialNumber: null,
              protocol: null,
              error: 'No certificate returned',
              status: 'error',
              checkedAt: new Date().toISOString(),
            });
          }

          const expiresAt = new Date(cert.valid_to);
          const now = new Date();
          const daysLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 86_400_000);
          const isAuthorized = socket.authorized;

          // Parse issuer org
          const rawIssuer = cert.issuer?.O || cert.issuer?.CN || 'Unknown';
          const issuerOrg = Array.isArray(rawIssuer) ? rawIssuer[0] : rawIssuer;
          const rawSubject = cert.subject?.CN || hostname;
          const subjectCN = Array.isArray(rawSubject) ? rawSubject[0] : rawSubject;
          const serial = cert.serialNumber || null;
          const proto = socket.getProtocol() || null;

          let status: SslResult['status'] = 'valid';
          if (!isAuthorized) status = 'error';
          else if (daysLeft <= 0) status = 'expired';
          else if (daysLeft <= 30) status = 'expiring';

          socket.destroy();
          resolve({
            domain: hostname,
            valid: isAuthorized && daysLeft > 0,
            expiresAt: expiresAt.toISOString(),
            daysLeft,
            issuer: issuerOrg,
            subject: subjectCN,
            serialNumber: serial,
            protocol: proto,
            error: isAuthorized ? null : 'Certificate not trusted',
            status,
            checkedAt: new Date().toISOString(),
          });
        } catch (err: any) {
          socket.destroy();
          resolve({
            domain: hostname,
            valid: false,
            expiresAt: null,
            daysLeft: null,
            issuer: null,
            subject: null,
            serialNumber: null,
            protocol: null,
            error: err.message || 'Certificate parse error',
            status: 'error',
            checkedAt: new Date().toISOString(),
          });
        }
      },
    );

    socket.on('error', (err) => {
      socket.destroy();
      resolve({
        domain: hostname,
        valid: false,
        expiresAt: null,
        daysLeft: null,
        issuer: null,
        subject: null,
        serialNumber: null,
        protocol: null,
        error: err.message || 'Connection failed',
        status: 'error',
        checkedAt: new Date().toISOString(),
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        domain: hostname,
        valid: false,
        expiresAt: null,
        daysLeft: null,
        issuer: null,
        subject: null,
        serialNumber: null,
        protocol: null,
        error: 'Connection timed out',
        status: 'error',
        checkedAt: new Date().toISOString(),
      });
    });
  });
}

/**
 * SSL Check API — /v1/ssl
 * Server-side SSL certificate verification using Node.js TLS.
 */
export async function sslCheckRoutes(app: FastifyInstance) {

  // ── POST /ssl/check — check a single domain ─────────────────
  app.post('/ssl/check', async (request, reply) => {
    const parsed = z.object({ domain: z.string().min(1) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });

    const result = await checkCertificate(parsed.data.domain);
    return { data: { ...result, clientName: '' } };
  });

  // ── POST /ssl/check-bulk — check multiple domains ───────────
  const bulkSslSchema = z.object({
    domains: z.array(z.object({ domain: z.string().min(1), clientName: z.string() })),
  });

  app.post('/ssl/check-bulk', async (request, reply) => {
    const parsed = bulkSslSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { domains } = parsed.data;

    // Check all in parallel (max 10 concurrency)
    const CONCURRENCY = 10;
    const results: SslResult[] = [];

    for (let i = 0; i < domains.length; i += CONCURRENCY) {
      const batch = domains.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(async (d) => {
          const result = await checkCertificate(d.domain);
          return { ...result, clientName: d.clientName } as SslResult;
        }),
      );
      results.push(...batchResults);
    }

    const summary = {
      total: results.length,
      valid: results.filter((r) => r.status === 'valid').length,
      expiring: results.filter((r) => r.status === 'expiring').length,
      expired: results.filter((r) => r.status === 'expired').length,
      error: results.filter((r) => r.status === 'error').length,
    };

    return { data: results, summary };
  });

  // ── GET /ssl/scan — auto-scan all provisioned clients ───────
  app.get('/ssl/scan', async (_request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.provisionRuns.findMany({
        where: (r, { eq }) => eq(r.status, 'success'),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        limit: 100,
      });

      // Deduplicate by slug
      const seen = new Set<string>();
      const clients: { domain: string; clientName: string }[] = [];
      for (const r of rows) {
        if (seen.has(r.clientSlug)) continue;
        seen.add(r.clientSlug);
        if (r.domain) {
          clients.push({ domain: r.domain, clientName: r.clientName });
        }
      }

      if (clients.length === 0) {
        return { data: [], summary: { total: 0, valid: 0, expiring: 0, expired: 0, error: 0 } };
      }

      // Check all certs
      const CONCURRENCY = 10;
      const results: SslResult[] = [];

      for (let i = 0; i < clients.length; i += CONCURRENCY) {
        const batch = clients.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(
          batch.map(async (c) => {
            const result = await checkCertificate(c.domain);
            return { ...result, clientName: c.clientName } as SslResult;
          }),
        );
        results.push(...batchResults);
      }

      const summary = {
        total: results.length,
        valid: results.filter((r) => r.status === 'valid').length,
        expiring: results.filter((r) => r.status === 'expiring').length,
        expired: results.filter((r) => r.status === 'expired').length,
        error: results.filter((r) => r.status === 'error').length,
      };

      return { data: results, summary };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to scan SSL certificates' });
    }
  });
}
