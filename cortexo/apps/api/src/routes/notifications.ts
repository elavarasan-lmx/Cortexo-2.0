import type { FastifyInstance } from 'fastify';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { notifications } from '@cortexo/db/schema';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getOrgId } from '../lib/request-context.js';

/**
 * Notifications API — /v1/notifications
 */
export async function notificationRoutes(app: FastifyInstance) {
  // List notifications (paginated, org-isolated)
  app.get('/notifications', async (request, reply) => {
    const { page, limit, offset } = parsePagination(request.query as Record<string, unknown>);
    const orgId = getOrgId(request);
    try {
      const db = await getDb();
      const where = eq(notifications.orgId, orgId);

      const [rows, countResult] = await Promise.all([
        db.select().from(notifications)
          .where(where)
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(notifications).where(where),
      ]);
      const total = Number(countResult[0]?.count || 0);
      const unread = rows.filter((n: any) => !n.readAt).length;
      return { ...paginatedResponse(rows, total, page, limit), unread };
    } catch {
      // DB not available — return empty
      return { data: [], total: 0, unread: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false };
    }
  });

  // Mark a notification as read
  app.patch('/notifications/:id/read', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      await db.update(notifications)
        .set({ readAt: new Date() } as any)
        .where(eq(notifications.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to mark as read' });
    }
  });

  // Mark all as read (org-scoped)
  app.post('/notifications/read-all', async (request, reply) => {
    const orgId = getOrgId(request);
    try {
      const db = await getDb();
      await db.update(notifications)
        .set({ readAt: new Date() } as any)
        .where(eq(notifications.orgId, orgId));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to mark all read' });
    }
  });
}

/**
 * Helper: create a notification in the DB (called internally).
 */
export async function createNotification(data: {
  orgId: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    const { getDb } = await import('../lib/db.js');
    const { notifications } = await import('@cortexo/db/schema');
    const db = await getDb();
    const id = crypto.randomUUID();
    await db.insert(notifications).values({
      id,
      orgId: data.orgId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    } as any);
    return id;
  } catch {
    // Best-effort — never throw from notification helper
  }
}
