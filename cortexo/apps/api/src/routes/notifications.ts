import type { FastifyInstance } from 'fastify';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { notifications, notificationPreferences } from '@cortexo/db/schema';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getPreferences, upsertPreference } from '../lib/push-notifications.js';
import { z } from 'zod';

// ─── All supported notification events ──────────────────────────────

const NOTIFICATION_EVENTS = [
  { key: 'deploy.success',       label: 'Deploy Succeeded',        category: 'CI/CD' },
  { key: 'deploy.failed',        label: 'Deploy Failed',           category: 'CI/CD' },
  { key: 'deploy.rollback',      label: 'Deploy Rolled Back',      category: 'CI/CD' },
  { key: 'error.new',            label: 'New Error Detected',      category: 'Bugs' },
  { key: 'error.spike',          label: 'Error Spike Alert',       category: 'Bugs' },
  { key: 'error.resolved',       label: 'Error Resolved',          category: 'Bugs' },
  { key: 'scan.complete',        label: 'Scan Completed',          category: 'Monitoring' },
  { key: 'code_review.complete', label: 'Code Review Done',        category: 'Monitoring' },
  { key: 'rca.complete',         label: 'Root Cause Found',        category: 'Bugs' },
  { key: 'fix.propagated',       label: 'Fix Propagated',          category: 'Fleet' },
  { key: 'health.degraded',      label: 'Health Degraded',         category: 'Infrastructure' },
  { key: 'alert.triggered',      label: 'Alert Triggered',         category: 'Infrastructure' },
  { key: 'agent.complete',       label: 'Agent Task Complete',     category: 'AI' },
  { key: 'security.vulnerability', label: 'Vulnerability Found',   category: 'Security' },
];

/**
 * Notifications API — /v1/notifications
 * Channels: In-App + Email only
 */
export async function notificationRoutes(app: FastifyInstance) {
  // ─── LIST notifications (paginated) ────────────────────────────
  app.get('/notifications', async (request, reply) => {
    const { page, limit, offset } = parsePagination(request.query as Record<string, unknown>);
    try {
      const db = await getDb();

      const [rows, countResult] = await Promise.all([
        db.select().from(notifications)
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(notifications),
      ]);
      const total = Number(countResult[0]?.count || 0);
      const unread = rows.filter((n: any) => !n.isRead && !n.readAt).length;
      return { ...paginatedResponse(rows, total, page, limit), unread };
    } catch {
      return { data: [], total: 0, unread: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false };
    }
  });

  // ─── MARK notification as read ─────────────────────────────────
  app.patch('/notifications/:id/read', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      await db.update(notifications)
        .set({ isRead: true } as any)
        .where(eq(notifications.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to mark as read' });
    }
  });

  // ─── MARK ALL as read ─────────────────────────────────────────
  app.post('/notifications/read-all', async (request, reply) => {
    try {
      const db = await getDb();
      await db.update(notifications)
        .set({ isRead: true } as any);
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to mark all read' });
    }
  });

  // ─── GET preferences ──────────────────────────────────────────
  app.get('/notifications/preferences', async (request) => {
    const userId = (request as any).userId || 'system';
    try {
      const prefs = await getPreferences(userId);

      // Merge with full event list for UI display
      const merged = NOTIFICATION_EVENTS.map((evt) => {
        const pref = prefs.find((p: any) => p.event === evt.key);
        return {
          event: evt.key,
          label: evt.label,
          category: evt.category,
          inApp: pref?.inApp ?? true,
          email: pref?.email ?? false,
        };
      });

      return { data: merged };
    } catch {
      return { data: NOTIFICATION_EVENTS.map((e) => ({
        event: e.key, label: e.label, category: e.category,
        inApp: true, email: false,
      })) };
    }
  });

  // ─── UPDATE preferences ────────────────────────────────────────
  const prefSchema = z.object({
    preferences: z.array(z.object({
      event: z.string(),
      inApp: z.boolean().optional(),
      email: z.boolean().optional(),
    })),
  });

  app.put('/notifications/preferences', async (request) => {
    const userId = (request as any).userId || 'system';
    const body = prefSchema.parse(request.body);

    for (const pref of body.preferences) {
      await upsertPreference(userId, pref.event, {
        inApp: pref.inApp,
        email: pref.email,
      });
    }

    return { success: true, message: `Updated ${body.preferences.length} preferences` };
  });

  // ─── GET supported events list ─────────────────────────────────
  app.get('/notifications/events', async () => {
    return { data: NOTIFICATION_EVENTS };
  });
}

/**
 * Helper: create a notification in the DB (called internally).
 */
export async function createNotification(data: {
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
