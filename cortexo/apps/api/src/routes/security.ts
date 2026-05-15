import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';

/**
 * Security Center API — /v1/security
 * Encrypt/Decrypt, PII Redaction, SSRF Guard, Backup Management
 */
export async function securityRoutes(app: FastifyInstance) {

  // ── Encrypt text ──────────────────────────────────────────────
  const encryptSchema = z.object({
    text: z.string().min(1),
    algorithm: z.enum(['aes-256-gcm', 'aes-256-cbc']).default('aes-256-gcm'),
  });

  app.post('/security/encrypt', async (request, reply) => {
    const parsed = encryptSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { text, algorithm } = parsed.data;

    try {
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'cortexo-dev-key', 'salt', 32);
      const iv = crypto.randomBytes(16);

      if (algorithm === 'aes-256-gcm') {
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return { data: { encrypted, iv: iv.toString('hex'), authTag, algorithm } };
      } else {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { data: { encrypted, iv: iv.toString('hex'), algorithm } };
      }
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Encryption failed' });
    }
  });

  // ── Decrypt text ──────────────────────────────────────────────
  const decryptSchema = z.object({
    encrypted: z.string().min(1),
    iv: z.string().min(1),
    authTag: z.string().optional(),
    algorithm: z.enum(['aes-256-gcm', 'aes-256-cbc']).default('aes-256-gcm'),
  });

  app.post('/security/decrypt', async (request, reply) => {
    const parsed = decryptSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { encrypted, iv, authTag, algorithm } = parsed.data;

    try {
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'cortexo-dev-key', 'salt', 32);
      const ivBuf = Buffer.from(iv, 'hex');

      if (algorithm === 'aes-256-gcm') {
        if (!authTag) return reply.code(400).send({ error: 'authTag required for aes-256-gcm' });
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuf);
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return { data: { decrypted } };
      } else {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuf);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return { data: { decrypted } };
      }
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Decryption failed' });
    }
  });

  // ── PII Redaction ─────────────────────────────────────────────
  const piiSchema = z.object({
    text: z.string().min(1),
  });

  app.post('/security/redact-pii', async (request, reply) => {
    const parsed = piiSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed' });

    const { text } = parsed.data;
    const patterns: { label: string; regex: RegExp; mask: string }[] = [
      { label: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, mask: '[EMAIL]' },
      { label: 'phone', regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, mask: '[PHONE]' },
      { label: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g, mask: '[SSN]' },
      { label: 'credit-card', regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, mask: '[CARD]' },
      { label: 'aadhaar', regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, mask: '[AADHAAR]' },
      { label: 'pan', regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g, mask: '[PAN]' },
      { label: 'ip-address', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, mask: '[IP]' },
    ];

    let redacted = text;
    const matches: { label: string; count: number }[] = [];

    for (const p of patterns) {
      const found = text.match(p.regex);
      if (found && found.length > 0) {
        matches.push({ label: p.label, count: found.length });
        redacted = redacted.replace(p.regex, p.mask);
      }
    }

    return { data: { redacted, matches, totalRedacted: matches.reduce((s, m) => s + m.count, 0) } };
  });

  // ── SSRF Guard — Validate URL ─────────────────────────────────
  const ssrfSchema = z.object({
    url: z.string().url(),
  });

  app.post('/security/ssrf-check', async (request, reply) => {
    const parsed = ssrfSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed' });
    const { url } = parsed.data;

    const blocked: string[] = [];
    try {
      const parsed_url = new URL(url);
      const hostname = parsed_url.hostname;

      // Block private/internal ranges
      if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(hostname)) blocked.push('private-ip');
      if (/^(localhost|metadata\.google|169\.254\.)/.test(hostname)) blocked.push('reserved-hostname');
      if (parsed_url.protocol === 'file:') blocked.push('file-protocol');
      if (/\.internal$|\.local$|\.corp$/.test(hostname)) blocked.push('internal-domain');
      if (parsed_url.port && ['22', '3306', '5432', '6379', '27017'].includes(parsed_url.port)) blocked.push('dangerous-port');

      return {
        data: {
          url,
          safe: blocked.length === 0,
          blocked,
          hostname,
          protocol: parsed_url.protocol,
          port: parsed_url.port || 'default',
        },
      };
    } catch (err) {
      return reply.code(400).send({ error: 'Invalid URL' });
    }
  });

  // ── Security scan summary (in-memory stats) ───────────────────
  app.get('/security/stats', async () => {
    return {
      data: {
        encryptionsToday: 0,
        decryptionsToday: 0,
        piiRedactions: 0,
        ssrfBlocked: 0,
        lastBackup: null,
        status: 'operational',
      },
    };
  });
}
