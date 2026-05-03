import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { desc, eq, and, gte, lte, like, sql } from 'drizzle-orm';
import { auditLogs } from '@cortexo/db/schema';

/**
 * Audit Trail API — /v1/audit
 *
 * GET  /audit           — list audit logs (paginated, filterable)
 * POST /audit           — create an audit log entry
 * GET  /audit/stats     — summary stats (actions by type, top users)
 * GET  /audit/user/:id  — logs for a specific user
 */
export async function auditRoutes(app: FastifyInstance) {

  // ── GET /audit — list with filters ──────────────────────────
  app.get('/audit', async (request) => {
    const {
      page = '1',
      limit = '50',
      action,
      resource,
      userId,
      from,
      to,
      search,
    } = request.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    try {
      const db = await getDb();

      // Build conditions
      const conditions: any[] = [];
      if (action) conditions.push(eq(auditLogs.action, action));
      if (resource) conditions.push(eq(auditLogs.resource, resource));
      if (userId) conditions.push(eq(auditLogs.userId, userId));
      if (from) conditions.push(gte(auditLogs.createdAt, new Date(from)));
      if (to) conditions.push(lte(auditLogs.createdAt, new Date(to)));
      if (search) conditions.push(like(auditLogs.description, `%${search}%`));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db.select().from(auditLogs)
          .where(where)
          .orderBy(desc(auditLogs.createdAt))
          .limit(limitNum)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(auditLogs).where(where),
      ]);

      return {
        data: rows,
        total: (countResult[0] as any)?.count || 0,
        page: pageNum,
        limit: limitNum,
      };
    } catch (err: any) {
      // Table may not exist yet
      return { data: [], total: 0, page: pageNum, limit: limitNum };
    }
  });

  // ── POST /audit — create entry ──────────────────────────────
  const createAuditSchema = z.object({
    action: z.string().min(1),
    resource: z.string().min(1),
    resourceId: z.string().optional(),
    description: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  });

  app.post('/audit', async (request, reply) => {
    const user = (request as any).user;
    const parsed = createAuditSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const body = parsed.data;

    try {
      const db = await getDb();

      await db.insert(auditLogs).values({
        userId: user?.id || 'dev-user',
        userName: user?.name || 'LMX',
        action: body.action,
        resource: body.resource,
        resourceId: body.resourceId || null,
        description: body.description || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
        ipAddress: (request.ip || request.headers['x-forwarded-for'] || '') as string,
      } as any);

      return { message: 'Audit log created' };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // ── GET /audit/stats — summary ──────────────────────────────
  app.get('/audit/stats', async () => {
    try {
      const db = await getDb();

      const [actionCounts, recentCount, userCounts] = await Promise.all([
        db.select({
          action: auditLogs.action,
          count: sql<number>`count(*)`,
        }).from(auditLogs).groupBy(auditLogs.action).orderBy(desc(sql`count(*)`)).limit(10),

        db.select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(gte(auditLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))),

        db.select({
          userName: auditLogs.userName,
          count: sql<number>`count(*)`,
        }).from(auditLogs).groupBy(auditLogs.userName).orderBy(desc(sql`count(*)`)).limit(5),
      ]);

      return {
        actionBreakdown: actionCounts,
        last24h: (recentCount[0] as any)?.count || 0,
        topUsers: userCounts,
      };
    } catch {
      return { actionBreakdown: [], last24h: 0, topUsers: [] };
    }
  });

  // ── GET /audit/user/:id — user-specific logs ────────────────
  app.get('/audit/user/:id', async (request) => {
    const { id } = request.params as { id: string };
    const { page = '1', limit = '30' } = request.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));

    try {
      const db = await getDb();

      const rows = await db.select().from(auditLogs)
        .where(eq(auditLogs.userId, id))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limitNum)
        .offset((pageNum - 1) * limitNum);

      return { data: rows, page: pageNum };
    } catch {
      return { data: [], page: pageNum };
    }
  });
}

/**
 * Helper: log an audit event from anywhere in the API.
 * Call this from other route handlers to record actions.
 */
export async function logAudit(params: {
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    const db = await getDb();
    await db.insert(auditLogs).values({
      userId: params.userId,
      userName: params.userName,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId || null,
      description: params.description || null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      ipAddress: params.ipAddress || null,
    } as any);
  } catch {
    // Silent fail — audit logging should never break main flow
  }
}
