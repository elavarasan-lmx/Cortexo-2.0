import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq, sql } from 'drizzle-orm';
import { servers, serverResources } from '@cortexo/db/schema';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const createServerSchema = z.object({
  name: z.string().min(1).max(100),
  privateIp: z.string().optional(),
  publicAddress: z.string().optional(),
  sshKey: z.string().optional(),
});

/**
 * Servers API — /v1/servers
 * EC2 server inventory + resource monitoring.
 * Ported from BullionDevops common.js server management.
 */
export async function serverRoutes(app: FastifyInstance) {

  // List all servers
  app.get('/servers', async (_request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.servers.findMany({
        orderBy: (s, { asc }) => [asc(s.name)],
      });
      return { data: rows, total: rows.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Get single server
  app.get('/servers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const row = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Server not found' });
      return { data: row };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Create server
  app.post('/servers', async (request, reply) => {
    const parsed = createServerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const [row] = await db.insert(servers).values(parsed.data as any).returning();
      return reply.code(201).send({ data: row });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Update server
  app.put('/servers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = createServerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      await db.update(servers)
        .set(parsed.data as any)
        .where(eq(servers.id, parseInt(id)));
      const row = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Server not found' });
      return { data: row };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Delete server
  app.delete('/servers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const deleted = await db.delete(servers)
        .where(eq(servers.id, parseInt(id)))
        .returning();
      if (!deleted.length) return reply.code(404).send({ error: 'Server not found' });
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Server Resources (metrics) ──────────────────────────────

  // Get latest metrics for all servers
  app.get('/servers/resources/latest', async (_request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.serverResources.findMany({
        orderBy: (r, { desc }) => [desc(r.checkedAt)],
      });
      // Dedupe by serverId (keep latest per server)
      const seen = new Set<number>();
      const latest = rows.filter(r => {
        if (!r.serverId || seen.has(r.serverId)) return false;
        seen.add(r.serverId);
        return true;
      });
      return { data: latest };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Get resource history for a specific server (by server ID)
  app.get('/servers/:id/resources/history', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const rows = await db.query.serverResources.findMany({
        where: (r, { eq }) => eq(r.serverId, parseInt(id)),
        orderBy: (r, { desc }) => [desc(r.checkedAt)],
        limit: 100,
      });
      return { data: rows };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Get per-server project counts (how many projects on each server)
  app.get('/servers/project-counts', async (_request, reply) => {
    try {
      const db = await getDb();
      const allServers = await db.query.servers.findMany();
      const allConfigs = await db.query.winbullConfigs.findMany();

      const counts: Record<string, number> = {};
      for (const config of allConfigs) {
        const ip = config.serverIp;
        if (ip) counts[ip] = (counts[ip] || 0) + 1;
      }

      const result = allServers.map(s => ({
        serverId: s.id,
        serverName: s.name,
        ip: s.privateIp,
        projectCount: counts[s.privateIp || ''] || 0,
      }));

      return { data: result };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Live Metrics Collector ──────────────────────────────────────
  // SSHes into each server, runs lightweight commands, stores results

  app.post('/servers/collect-metrics', async (_request, reply) => {
    try {
      const db = await getDb();

      // Get all servers with IPs from DB
      const allServers = await db.query.servers.findMany();
      const serversWithIp = allServers.filter(s => s.privateIp);
      const ips = serversWithIp.map(s => s.privateIp) as string[];

      if (ips.length === 0) {
        return reply.code(400).send({ error: 'No servers with IPs configured' });
      }

      // Build IP → server ID lookup map
      const ipToServerId = new Map<string, number>();
      for (const s of serversWithIp) {
        ipToServerId.set(s.privateIp!, s.id);
      }

      // Run collector script
      const scriptPath = path.resolve(__dirname, '../lib/collect-metrics.sh');
      const { stdout } = await execFileAsync('bash', [scriptPath, ...ips], {
        timeout: 60_000, // 60s max
        env: { ...process.env, HOME: process.env.HOME || '/root' },
      });

      let metrics: any[];
      try {
        metrics = JSON.parse(stdout);
      } catch {
        app.log.error('Failed to parse collector output: ' + stdout);
        return reply.code(500).send({ error: 'Failed to parse metrics output' });
      }

      // Insert fresh metrics with serverId FK
      let inserted = 0;
      for (const m of metrics) {
        if (!m.serverIp) continue;
        const serverId = ipToServerId.get(m.serverIp);
        if (!serverId) {
          app.log.warn(`Metrics received for unknown IP: ${m.serverIp}`);
          continue;
        }
        await db.insert(serverResources).values({
          serverId,
          serverIp: m.serverIp,  // Keep for backward compat
          cpuPercent: m.cpuPercent?.toString() || '0',
          ramUsedMb: m.ramUsedMb || 0,
          ramTotalMb: m.ramTotalMb || 0,
          diskUsedGb: m.diskUsedGb?.toString() || '0',
          diskTotalGb: m.diskTotalGb?.toString() || '0',
          loadAvg: m.loadAvg || '0 0 0',
          uptimeHours: m.uptimeHours || 0,
        } as any);
        inserted++;
      }

      // Prune old data (keep last 24h)
      await db.execute(
        sql`DELETE FROM server_resources WHERE checked_at < NOW() - INTERVAL '24 hours'`
      );

      return {
        success: true,
        collected: inserted,
        servers: ips.length,
        message: `Collected metrics from ${inserted} servers`,
      };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({
        error: 'Metrics collection failed',
        detail: err.message,
      });
    }
  });

  // ── SSH Connection Test ──────────────────────────────────────
  app.post('/servers/:id/test-connection', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const srv = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, parseInt(id)),
      });
      if (!srv) return reply.code(404).send({ error: 'Server not found' });
      if (!srv.privateIp) return reply.code(400).send({ error: 'No IP configured for this server' });

      const { Client } = await import('ssh2');
      const { readFileSync } = await import('fs');
      const { homedir } = await import('os');

      // Resolve SSH key — server-specific or default
      const resolveKey = (keyPath?: string | null): Buffer | undefined => {
        const p = (keyPath || '~/.ssh/prod-ec2-key.pem').replace('~', homedir());
        try { return readFileSync(p); } catch { return undefined; }
      };

      const privateKey = resolveKey(srv.sshKey);
      if (!privateKey) {
        return reply.code(400).send({ error: 'SSH key not found: ' + (srv.sshKey || '~/.ssh/prod-ec2-key.pem') });
      }

      // Jump host config (bastion/gateway)
      const JUMP_HOST = process.env.SSH_JUMP_HOST || '13.201.238.28';
      const JUMP_USER = process.env.SSH_JUMP_USER || 'ubuntu';

      const startMs = Date.now();

      const result = await new Promise<{ success: boolean; latencyMs: number; hostname?: string; uptime?: string; error?: string }>((resolve) => {
        const jumpConn = new Client();
        const timeout = setTimeout(() => {
          jumpConn.end();
          resolve({ success: false, latencyMs: Date.now() - startMs, error: 'Connection timed out (15s)' });
        }, 15000);

        jumpConn.on('ready', () => {
          // Tunnel through jump host to target server
          jumpConn.forwardOut('127.0.0.1', 0, srv.privateIp!, 22, (err, stream) => {
            if (err) {
              clearTimeout(timeout);
              jumpConn.end();
              resolve({ success: false, latencyMs: Date.now() - startMs, error: 'Tunnel failed: ' + err.message });
              return;
            }

            const targetConn = new Client();
            targetConn.on('ready', () => {
              const latencyMs = Date.now() - startMs;
              targetConn.exec('hostname && uptime -p 2>/dev/null || uptime', (execErr, execStream) => {
                if (execErr) {
                  clearTimeout(timeout);
                  targetConn.end();
                  jumpConn.end();
                  resolve({ success: true, latencyMs, error: 'Connected but command failed' });
                  return;
                }
                let output = '';
                execStream.on('data', (d: Buffer) => { output += d.toString(); });
                execStream.on('close', () => {
                  clearTimeout(timeout);
                  targetConn.end();
                  jumpConn.end();
                  const lines = output.trim().split('\n');
                  resolve({ success: true, latencyMs, hostname: lines[0], uptime: lines[1] || '' });
                });
              });
            });

            targetConn.on('error', (targetErr) => {
              clearTimeout(timeout);
              jumpConn.end();
              resolve({ success: false, latencyMs: Date.now() - startMs, error: 'Target SSH failed: ' + targetErr.message });
            });

            targetConn.connect({
              sock: stream,
              username: 'ubuntu',
              privateKey,
              readyTimeout: 10000,
            });
          });
        });

        jumpConn.on('error', (err) => {
          clearTimeout(timeout);
          resolve({ success: false, latencyMs: Date.now() - startMs, error: 'Jump host failed: ' + err.message });
        });

        jumpConn.connect({
          host: JUMP_HOST,
          port: 22,
          username: JUMP_USER,
          privateKey,
          readyTimeout: 10000,
        });
      });

      return { data: result };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: err.message || 'Test failed' });
    }
  });
}
