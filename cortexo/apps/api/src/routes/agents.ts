import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { agents, agentRuns } from '@cortexo/db/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';

/**
 * AI Agents API — /v1/agents
 */
export async function agentRoutes(app: FastifyInstance) {

  // ── helpers ──
  function getOrgId(request: any): string {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = JSON.parse(Buffer.from(authHeader.replace('Bearer ', ''), 'base64url').toString());
        return payload.orgId || '';
      } catch {}
    }
    return '';
  }

  // GET /agents — List all agents
  app.get('/agents', async (request, reply) => {
    const orgId = getOrgId(request);
    if (!orgId) return reply.code(401).send({ error: 'Unauthorized' });
    try {
      const db = await getDb();
      const rows = await db.select().from(agents)
        .where(eq(agents.orgId, orgId))
        .orderBy(desc(agents.lastActiveAt));
      return { data: rows, total: rows.length };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch agents' });
    }
  });

  // GET /agents/:id — Get single agent
  app.get('/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const [agent] = await db.select().from(agents).where(eq(agents.id, id));
      if (!agent) return reply.code(404).send({ error: 'Agent not found' });
      return { data: agent };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch agent' });
    }
  });

  // POST /agents — Create agent
  const createSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['deployment', 'error_detection', 'security', 'monitoring', 'compliance', 'infrastructure', 'performance', 'custom']).default('custom'),
    description: z.string().optional(),
    avatar: z.string().optional(),
    config: z.record(z.unknown()).optional(),
    skills: z.array(z.string()).optional(),
  });

  app.post('/agents', async (request, reply) => {
    const orgId = getOrgId(request);
    if (!orgId) return reply.code(401).send({ error: 'Unauthorized' });
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    try {
      const db = await getDb();
      const [agent] = await db.insert(agents).values({
        orgId,
        ...parsed.data,
      } as any).returning();
      return reply.code(201).send({ data: agent });
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create agent' });
    }
  });

  // PUT /agents/:id — Update agent
  app.put('/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      const db = await getDb();
      const [agent] = await db.update(agents).set({
        ...body,
        updatedAt: new Date(),
      } as any).where(eq(agents.id, id)).returning();
      return { data: agent };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update agent' });
    }
  });

  // DELETE /agents/:id
  app.delete('/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      await db.delete(agents).where(eq(agents.id, id));
      return { success: true };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete agent' });
    }
  });

  // GET /agents/:id/runs — Get agent run history
  app.get('/agents/:id/runs', async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { limit?: string };
    const limit = Math.min(parseInt(query.limit || '50'), 200);
    try {
      const db = await getDb();
      const rows = await db.select().from(agentRuns)
        .where(eq(agentRuns.agentId, id))
        .orderBy(desc(agentRuns.createdAt))
        .limit(limit);
      return { data: rows, total: rows.length };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch runs' });
    }
  });

  // POST /agents/:id/run — Trigger a run
  app.post('/agents/:id/run', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body || {}) as Record<string, unknown>;
    try {
      const db = await getDb();
      const [run] = await db.insert(agentRuns).values({
        agentId: id,
        trigger: (body.trigger as string) || 'manual',
        input: body.input as any || {},
      } as any).returning();

      // Update agent stats
      await db.update(agents).set({
        totalRuns: sql`${agents.totalRuns} + 1`,
        lastActiveAt: new Date(),
        status: 'active',
        updatedAt: new Date(),
      } as any).where(eq(agents.id, id));

      return reply.code(201).send({ data: run });
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to trigger run' });
    }
  });

  // GET /agents/stats — Aggregate stats
  app.get('/agents/stats', async (request, reply) => {
    const orgId = getOrgId(request);
    if (!orgId) return reply.code(401).send({ error: 'Unauthorized' });
    try {
      const db = await getDb();
      const all = await db.select().from(agents).where(eq(agents.orgId, orgId));
      const totalAgents = all.length;
      const activeNow = all.filter(a => a.status === 'active').length;
      const totalRuns = all.reduce((s, a) => s + (a.totalRuns || 0), 0);
      const avgAccuracy = totalAgents > 0
        ? (all.reduce((s, a) => s + (a.accuracy || 0), 0) / totalAgents / 10).toFixed(1)
        : '0';
      return { data: { totalAgents, activeNow, totalRuns, avgAccuracy } };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to get stats' });
    }
  });
}
