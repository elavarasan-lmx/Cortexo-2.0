import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq } from 'drizzle-orm';
import { deployConfigs } from '@cortexo/db/schema';

const createConfigSchema = z.object({
  projectId: z.string().uuid(),
  serverId: z.number().nullable().optional(),
  clientSlug: z.string().max(100).nullable().optional(),
  domain: z.string().max(255).nullable().optional(),
  protocol: z.string().max(10).default('https'),
  deployPath: z.string().max(500).nullable().optional(),
  deployUser: z.string().max(50).default('ubuntu'),
  dbHost: z.string().max(255).nullable().optional(),
  dbName: z.string().max(100).nullable().optional(),
  dbUser: z.string().max(100).nullable().optional(),
  dbPort: z.number().default(3306),
  gitRepo: z.string().max(500).nullable().optional(),
  gitBranch: z.string().max(100).default('main'),
  appFramework: z.string().max(50).nullable().optional(),
  appVersion: z.string().max(20).nullable().optional(),
  socketIoPort: z.number().nullable().optional(),
  wsPort: z.number().nullable().optional(),
  ratePort: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const updateConfigSchema = createConfigSchema.partial();

/**
 * Deploy Configs API — /v1/deploy-configs
 * Manage per-project deployment source configurations:
 * Git repos, databases, deploy paths, versions, ports.
 */
export async function deployConfigRoutes(app: FastifyInstance) {

  // ── List all deploy configs ──────────────────────────────
  app.get('/deploy-configs', async (_request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.deployConfigs.findMany({
        orderBy: (c: any, { asc }: any) => [asc(c.clientSlug)],
      });

      // Enrich with project + server names
      const projects = await db.query.projects.findMany();
      const servers = await db.query.servers.findMany();
      const projMap = projects.reduce((a: any, p: any) => { a[p.id] = p; return a; }, {} as any);
      const srvMap = servers.reduce((a: any, s: any) => { a[s.id] = s; return a; }, {} as any);

      const enriched = rows.map((row: any) => ({
        ...row,
        projectName: projMap[row.projectId]?.name || null,
        serverName: srvMap[row.serverId]?.name || null,
        serverIp: srvMap[row.serverId]?.privateIp || srvMap[row.serverId]?.publicAddress || null,
      }));

      return { data: enriched, total: enriched.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Get single config ────────────────────────────────────
  app.get('/deploy-configs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const row = await db.query.deployConfigs.findFirst({
        where: (c: any, { eq }: any) => eq(c.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Deploy config not found' });

      // Get related data
      const project = await db.query.projects.findFirst({
        where: (p: any, { eq }: any) => eq(p.id, row.projectId),
      });
      const server = row.serverId ? await db.query.servers.findFirst({
        where: (s: any, { eq }: any) => eq(s.id, row.serverId),
      }) : null;

      return {
        data: {
          ...row,
          project: project || null,
          server: server || null,
        },
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Create config ────────────────────────────────────────
  app.post('/deploy-configs', async (request, reply) => {
    const parsed = createConfigSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const [row] = await db.insert(deployConfigs).values(parsed.data as any).returning();
      return reply.code(201).send({ data: row });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Update config ────────────────────────────────────────
  app.put('/deploy-configs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateConfigSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      await db.update(deployConfigs)
        .set(parsed.data as any)
        .where(eq(deployConfigs.id, parseInt(id)));
      const row = await db.query.deployConfigs.findFirst({
        where: (c: any, { eq }: any) => eq(c.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Deploy config not found' });
      return { data: row };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Delete config ────────────────────────────────────────
  app.delete('/deploy-configs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const result = await db.delete(deployConfigs)
        .where(eq(deployConfigs.id, parseInt(id)));
      if (!(result as any)[0]?.affectedRows) {
        return reply.code(404).send({ error: 'Deploy config not found' });
      }
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });
}
