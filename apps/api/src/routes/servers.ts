import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq } from 'drizzle-orm';
import { servers } from '@cortexo/db/schema';

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
      const [result] = await db.insert(servers).values(parsed.data as any);
      const row = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, (result as any).insertId),
      });
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
      const result = await db.delete(servers)
        .where(eq(servers.id, parseInt(id)));
      if (!(result as any)[0]?.affectedRows) return reply.code(404).send({ error: 'Server not found' });
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
      // Dedupe by serverIp (keep latest)
      const seen = new Set<string>();
      const latest = rows.filter(r => {
        if (!r.serverIp || seen.has(r.serverIp)) return false;
        seen.add(r.serverIp);
        return true;
      });
      return { data: latest };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Get resource history for a specific server
  app.get('/servers/resources/:ip/history', async (request, reply) => {
    const { ip } = request.params as { ip: string };
    try {
      const db = await getDb();
      const rows = await db.query.serverResources.findMany({
        where: (r, { eq }) => eq(r.serverIp, ip),
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
}
