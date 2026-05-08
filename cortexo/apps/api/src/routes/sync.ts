import type { FastifyInstance } from 'fastify';
import { syncHistory, syncClients, syncExcludeRules, monoDeployments, deploymentApprovals } from '@cortexo/db/schema';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import { getUser } from '../lib/request-context.js';

// ── Validation Schemas ─────────────────────────────────────────

const triggerSyncSchema = z.object({
  clientIds: z.array(z.string().min(1)).min(1),
  sourceBranch: z.string().default('main'),
  files: z.array(z.string()).optional().default([]),
  cherryPickSha: z.string().optional(),
});

const excludeRuleSchema = z.object({
  appCategory: z.string().default('all'),
  layer: z.string().default('all'),
  pattern: z.string().min(1),
  reason: z.string().optional(),
});

const deploySchema = z.object({
  clientId: z.string().min(1),
  clientName: z.string().optional(),
  environment: z.enum(['staging', 'production', 'support']),
  deployNotes: z.string().optional(),
});

const syncClientSchema = z.object({
  clientId: z.string().min(1),
  clientName: z.string().min(1),
  repoOrg: z.string().optional(),
  repoName: z.string().optional(),
  branch: z.string().default('STAGING'),
  clientType: z.string().default('retail'),
});

/**
 * Source Sync API — /v1/sync
 * Multi-client code synchronization from hub repo to client repos.
 * Ported from BullionDevops sync.routes.js (679 lines, ~15 endpoints).
 */
export async function syncRoutes(app: FastifyInstance) {

  // ══════════════════════════════════════════════════════════════
  //  SYNC HISTORY
  // ══════════════════════════════════════════════════════════════

  // GET /sync — list sync history with filters
  app.get('/sync', async (request, reply) => {
    const { status, client_id, limit = '50', offset = '0' } = request.query as Record<string, string>;
    try {
      const db = await getDb();
      const rows = await db.query.syncHistory.findMany({
        orderBy: (s, { desc }) => [desc(s.createdAt)],
        limit: Math.min(parseInt(limit) || 50, 200),
        offset: parseInt(offset) || 0,
        ...(status ? { where: (s: any, { eq }: any) => eq(s.status, status) } : {}),
      });
      const allRows = await db.query.syncHistory.findMany();
      return { success: true, data: { syncs: rows, pagination: { total: allRows.length, limit: parseInt(limit), offset: parseInt(offset) } } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // POST /sync/trigger — trigger sync for multiple clients
  app.post('/sync/trigger', async (request, reply) => {
    const parsed = triggerSyncSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const { clientIds, sourceBranch } = parsed.data;
      const results: any[] = [];

      for (const clientId of clientIds) {
        // Look up client config
        const client = await db.query.syncClients.findFirst({
          where: (c, { eq }) => eq(c.clientId, clientId),
        });

        // Create sync history entry
        const [insertResult] = await db.insert(syncHistory).values({
          clientId,
          clientName: client?.clientName || clientId,
          sourceBranch,
          targetBranch: client?.branch || 'STAGING',
          status: 'pending',
          triggeredBy: getUser(request).sub,
        } as any).returning();

        const syncId = (insertResult as any).id;

        // In production: trigger GitHub Actions workflow here
        // For now, mark as syncing (simulated)
        await db.update(syncHistory)
          .set({ status: 'syncing' } as any)
          .where(eq(syncHistory.id, syncId));

        results.push({
          clientId,
          syncId,
          triggered: true,
        });
      }

      return {
        success: true,
        data: { results },
        message: `Sync triggered for ${results.length}/${clientIds.length} clients`,
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Sync trigger failed' });
    }
  });

  // POST /sync/status — webhook to update sync status (from GitHub Actions)
  app.post('/sync/status', async (request, reply) => {
    const { syncId, status, pr_number, pr_url, error_message, commit_sha } = request.body as any;
    try {
      const db = await getDb();
      const updates: Record<string, unknown> = { status };
      if (pr_number) updates.prNumber = pr_number;
      if (pr_url) updates.prUrl = pr_url;
      if (error_message) updates.errorMessage = error_message;
      if (commit_sha) updates.commitSha = commit_sha;
      if (['success', 'failed', 'conflict'].includes(status)) {
        updates.completedAt = new Date();
      }

      await db.update(syncHistory)
        .set(updates as any)
        .where(eq(syncHistory.id, syncId));

      return { success: true, data: { status } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Status update failed' });
    }
  });

  // POST /sync/cleanup-stale — fail stale syncs older than 15 min
  app.post('/sync/cleanup-stale', async (_request, reply) => {
    try {
      const db = await getDb();
      const result = await db.update(syncHistory)
        .set({ status: 'failed', errorMessage: 'Timed out (no response)' } as any)
        .where(
          and(
            inArray(syncHistory.status, ['syncing', 'pending']),
            sql`${syncHistory.createdAt} < DATE_SUB(NOW(), INTERVAL 15 MINUTE)`
          )
        );
      return { success: true, data: { cleaned: (result as any)[0]?.affectedRows || 0 } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Cleanup failed' });
    }
  });

  // ══════════════════════════════════════════════════════════════
  //  SYNC CLIENTS CRUD
  // ══════════════════════════════════════════════════════════════

  app.get('/sync/clients', async (_request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.syncClients.findMany({
        orderBy: (c, { asc }) => [asc(c.clientName)],
      });
      return { success: true, data: { clients: rows } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  app.post('/sync/clients', async (request, reply) => {
    const parsed = syncClientSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      await db.insert(syncClients).values(parsed.data as any);
      return reply.code(201).send({ success: true, message: 'Client added' });
    } catch (err: any) {
      if (err?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: 'Client ID already exists' });
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ══════════════════════════════════════════════════════════════
  //  EXCLUDE RULES CRUD
  // ══════════════════════════════════════════════════════════════

  app.get('/sync/exclude-rules', async (_request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.syncExcludeRules.findMany({
        orderBy: (r, { asc }) => [asc(r.appCategory), asc(r.pattern)],
      });
      return { success: true, data: { rules: rows } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  app.get('/sync/exclude-rules/active-patterns', async (request, reply) => {
    const { app: appFilter } = request.query as { app?: string };
    try {
      const db = await getDb();
      let rows = await db.query.syncExcludeRules.findMany({
        where: (r, { eq }) => eq(r.isActive, true),
      });
      if (appFilter && appFilter !== 'all') {
        rows = rows.filter(r => r.appCategory === appFilter || r.appCategory === 'all');
      }
      return { success: true, data: { patterns: rows.map(r => r.pattern) } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  app.post('/sync/exclude-rules', async (request, reply) => {
    const parsed = excludeRuleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const [result] = await db.insert(syncExcludeRules).values({
        ...parsed.data,
        createdBy: 'admin',
      } as any).returning();
      return reply.code(201).send({ success: true, data: { id: (result as any).id } });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  app.patch('/sync/exclude-rules/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { is_active } = request.body as { is_active: boolean };
    try {
      const db = await getDb();
      await db.update(syncExcludeRules)
        .set({ isActive: is_active } as any)
        .where(eq(syncExcludeRules.id, parseInt(id)));
      return { success: true, message: `Rule ${is_active ? 'activated' : 'deactivated'}` };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  app.delete('/sync/exclude-rules/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      await db.delete(syncExcludeRules)
        .where(eq(syncExcludeRules.id, parseInt(id)));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ══════════════════════════════════════════════════════════════
  //  DIVERGENCE ANALYSIS
  // ══════════════════════════════════════════════════════════════

  app.get('/sync/analyze/latest', async (_request, reply) => {
    try {
      const db = await getDb();
      // Get the latest analysis for each client
      const rows = await db.query.divergenceAnalyses.findMany({
        orderBy: (a, { desc }) => [desc(a.analyzedAt)],
      });
      // Dedupe by clientId (keep latest)
      const seen = new Set<string>();
      const latest = rows.filter(r => {
        if (seen.has(r.clientId)) return false;
        seen.add(r.clientId);
        return true;
      });
      return { success: true, data: { analyses: latest } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  app.get('/sync/analyze/:clientId', async (request, reply) => {
    const { clientId } = request.params as { clientId: string };
    try {
      const db = await getDb();
      const row = await db.query.divergenceAnalyses.findFirst({
        where: (a, { eq }) => eq(a.clientId, clientId),
        orderBy: (a, { desc }) => [desc(a.analyzedAt)],
      });
      if (!row) return reply.code(404).send({ error: 'No analysis found' });
      return { success: true, data: { analysis: row } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ══════════════════════════════════════════════════════════════
  //  MONO-REPO DEPLOYMENTS & APPROVALS
  // ══════════════════════════════════════════════════════════════

  app.get('/sync/deployments', async (request, reply) => {
    const { environment, status } = request.query as Record<string, string>;
    try {
      const db = await getDb();
      let rows = await db.query.monoDeployments.findMany({
        orderBy: (d, { desc }) => [desc(d.createdAt)],
        limit: 100,
      });
      if (environment) rows = rows.filter(r => r.environment === environment);
      if (status) rows = rows.filter(r => r.status === status);
      return { success: true, data: { deployments: rows } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  app.post('/sync/deploy', async (request, reply) => {
    const parsed = deploySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const branch = parsed.data.environment === 'production' ? 'PRODUCTION' : 'support';
      const [result] = await db.insert(monoDeployments).values({
        ...parsed.data,
        branch,
        status: 'pending_approval',
        triggeredBy: 'admin',
      } as any).returning();
      const dep = await db.query.monoDeployments.findFirst({
        where: (d, { eq }) => eq(d.id, (result as any).id),
      });
      return { success: true, data: { deployment: dep }, message: 'Deployment submitted for approval' };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Approve deployment
  app.post('/sync/approvals/:id/approve', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const dep = await db.query.monoDeployments.findFirst({
        where: (d, { eq }) => eq(d.id, parseInt(id)),
      });
      if (!dep) return reply.code(404).send({ error: 'Deployment not found' });
      if (dep.status !== 'pending_approval') return reply.code(400).send({ error: 'Only pending deployments can be approved' });

      await db.update(monoDeployments)
        .set({ status: 'running' } as any)
        .where(eq(monoDeployments.id, parseInt(id)));

      await db.insert(deploymentApprovals).values({
        deploymentId: parseInt(id),
        action: 'approved',
        actedBy: 'admin',
      } as any);

      return { success: true, data: { id: parseInt(id) }, message: 'Deployment approved' };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Reject deployment
  app.post('/sync/approvals/:id/reject', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { reason } = (request.body as any) || {};
    try {
      const db = await getDb();
      await db.update(monoDeployments)
        .set({ status: 'cancelled', completedAt: new Date() } as any)
        .where(eq(monoDeployments.id, parseInt(id)));

      await db.insert(deploymentApprovals).values({
        deploymentId: parseInt(id),
        action: 'rejected',
        actedBy: 'admin',
        reason: reason || '',
      } as any);

      return { success: true, data: { id: parseInt(id) }, message: 'Deployment rejected' };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });
}
