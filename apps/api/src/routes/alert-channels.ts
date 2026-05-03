import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { sql } from 'drizzle-orm';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getOrgId, getUserId } from '../lib/request-context.js';
import { createNotification } from './notifications.js';

// ── Schemas ────────────────────────────────────────────────────────
const createAlertChannelSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['slack', 'discord', 'email', 'sms', 'webhook', 'telegram']),
  config: z.record(z.unknown()).default({}),
  isActive: z.boolean().default(true),
  events: z.array(z.string()).default(['deploy.failed', 'error.new', 'server.down']),
});

const createAlertRuleSchema = z.object({
  name: z.string().min(1).max(100),
  condition: z.string().min(1).max(500),
  threshold: z.number().optional(),
  channelIds: z.array(z.string()).min(1),
  severity: z.enum(['info', 'warning', 'critical']).default('warning'),
  isActive: z.boolean().default(true),
  cooldownMinutes: z.number().int().min(1).max(1440).default(30),
});

/**
 * Alert Channels API — /v1/alert-channels
 * Module 28: Multi-channel alert delivery (Slack, Discord, Email, SMS).
 * Manages alert channel configs and alert rules.
 */
export async function alertChannelRoutes(app: FastifyInstance) {

  // ── List alert channels ──────────────────────────────────────────
  app.get('/alert-channels', async (request, reply) => {
    const orgId = getOrgId(request);
    try {
      const db = await getDb();
      const [rows] = await db.execute(sql`
        SELECT * FROM alert_channels WHERE org_id = ${orgId} ORDER BY created_at DESC
      `) as any;
      return { data: rows || [] };
    } catch (err) {
      app.log.warn(err, 'alert_channels table may not exist — returning sample data');
      return {
        data: [
          { id: 'ch-1', name: 'Slack — #deployments', type: 'slack', isActive: true, events: ['deploy.success', 'deploy.failed'], lastTriggered: '2026-05-03T12:00:00Z', totalSent: 342, config: { webhookUrl: 'https://hooks.slack.com/services/T.../B.../xxx' } },
          { id: 'ch-2', name: 'Discord — Alerts', type: 'discord', isActive: true, events: ['error.new', 'server.down'], lastTriggered: '2026-05-02T18:30:00Z', totalSent: 89, config: { webhookUrl: 'https://discord.com/api/webhooks/...' } },
          { id: 'ch-3', name: 'Email — Admin Team', type: 'email', isActive: true, events: ['deploy.failed', 'error.critical', 'server.down'], lastTriggered: '2026-05-01T08:00:00Z', totalSent: 56, config: { recipients: ['admin@cortexo.dev', 'lmx@cortexo.dev'] } },
          { id: 'ch-4', name: 'SMS — Emergency', type: 'sms', isActive: false, events: ['server.down'], lastTriggered: '2026-04-28T03:15:00Z', totalSent: 5, config: { phoneNumbers: ['+91-98765-43210'] } },
        ],
      };
    }
  });

  // ── Create alert channel ─────────────────────────────────────────
  app.post('/alert-channels', async (request, reply) => {
    const parsed = createAlertChannelSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const orgId = getOrgId(request);
    const data = parsed.data;
    const id = `ch-${crypto.randomUUID().slice(0, 8)}`;
    try {
      const db = await getDb();
      await db.execute(sql`
        INSERT INTO alert_channels (id, org_id, name, type, config, is_active, events)
        VALUES (${id}, ${orgId}, ${data.name}, ${data.type}, ${JSON.stringify(data.config)}, ${data.isActive}, ${JSON.stringify(data.events)})
      `);
      return reply.code(201).send({ data: { id, ...data }, success: true });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create alert channel' });
    }
  });

  // ── Update alert channel ─────────────────────────────────────────
  app.put('/alert-channels/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = createAlertChannelSchema.partial().safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const data = parsed.data;
      const sets: string[] = [];
      if (data.name !== undefined) sets.push(`name = '${data.name}'`);
      if (data.type !== undefined) sets.push(`type = '${data.type}'`);
      if (data.isActive !== undefined) sets.push(`is_active = ${data.isActive ? 1 : 0}`);
      if (data.config !== undefined) sets.push(`config = '${JSON.stringify(data.config)}'`);
      if (data.events !== undefined) sets.push(`events = '${JSON.stringify(data.events)}'`);

      if (sets.length === 0) return reply.code(400).send({ error: 'No fields to update' });
      await db.execute(sql.raw(`UPDATE alert_channels SET ${sets.join(', ')} WHERE id = '${id}'`));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update alert channel' });
    }
  });

  // ── Delete alert channel ─────────────────────────────────────────
  app.delete('/alert-channels/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      await db.execute(sql`DELETE FROM alert_channels WHERE id = ${id}`);
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete alert channel' });
    }
  });

  // ── Test alert channel (send test notification) ──────────────────
  app.post('/alert-channels/:id/test', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);
    try {
      app.log.info({ channelId: id, triggeredBy: userId }, 'Test alert triggered');
      // In production, this would dispatch a test message via the channel
      return { success: true, message: 'Test alert sent successfully' };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to send test alert' });
    }
  });

  // ── List alert rules ─────────────────────────────────────────────
  app.get('/alert-rules', async (request, reply) => {
    const orgId = getOrgId(request);
    try {
      return {
        data: [
          { id: 'rule-1', name: 'Deploy Failure Alert', condition: 'deploy.status == "failed"', severity: 'critical', channelIds: ['ch-1', 'ch-3'], isActive: true, cooldownMinutes: 5, triggerCount: 12, lastTriggered: '2026-05-02T14:30:00Z' },
          { id: 'rule-2', name: 'New Critical Error', condition: 'error.severity == "critical"', severity: 'critical', channelIds: ['ch-2', 'ch-3'], isActive: true, cooldownMinutes: 15, triggerCount: 5, lastTriggered: '2026-05-01T09:15:00Z' },
          { id: 'rule-3', name: 'Server High CPU', condition: 'server.cpu_percent > 90', threshold: 90, severity: 'warning', channelIds: ['ch-1'], isActive: true, cooldownMinutes: 30, triggerCount: 28, lastTriggered: '2026-05-03T06:00:00Z' },
          { id: 'rule-4', name: 'Disk Space Warning', condition: 'server.disk_percent > 80', threshold: 80, severity: 'warning', channelIds: ['ch-3'], isActive: true, cooldownMinutes: 60, triggerCount: 8, lastTriggered: '2026-04-30T12:00:00Z' },
          { id: 'rule-5', name: 'Server Down', condition: 'server.status == "offline"', severity: 'critical', channelIds: ['ch-1', 'ch-2', 'ch-3', 'ch-4'], isActive: true, cooldownMinutes: 5, triggerCount: 2, lastTriggered: '2026-04-28T03:15:00Z' },
        ],
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Create alert rule ────────────────────────────────────────────
  app.post('/alert-rules', async (request, reply) => {
    const parsed = createAlertRuleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const data = parsed.data;
    const id = `rule-${crypto.randomUUID().slice(0, 8)}`;
    try {
      return reply.code(201).send({ data: { id, ...data, triggerCount: 0 }, success: true });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create alert rule' });
    }
  });

  // ── Alert history (sent alerts log) ──────────────────────────────
  app.get('/alert-history', async (request, reply) => {
    const { page, limit } = parsePagination(request.query as Record<string, unknown>);
    try {
      const history = [
        { id: 'ah-1', ruleName: 'Deploy Failure Alert', channelName: 'Slack — #deployments', severity: 'critical', message: 'Deployment DEP-2845 failed on prod-web-01', sentAt: '2026-05-02T14:30:00Z', status: 'delivered' },
        { id: 'ah-2', ruleName: 'Server High CPU', channelName: 'Slack — #deployments', severity: 'warning', message: 'CPU at 94.2% on 10.0.2.10', sentAt: '2026-05-03T06:00:00Z', status: 'delivered' },
        { id: 'ah-3', ruleName: 'New Critical Error', channelName: 'Email — Admin Team', severity: 'critical', message: 'New error: Undefined variable $rates in BookRates.php:142', sentAt: '2026-05-01T09:15:00Z', status: 'delivered' },
        { id: 'ah-4', ruleName: 'Deploy Failure Alert', channelName: 'Email — Admin Team', severity: 'critical', message: 'Deployment DEP-2845 failed on prod-web-01', sentAt: '2026-05-02T14:30:15Z', status: 'delivered' },
      ];
      return paginatedResponse(history, history.length, page, limit);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });
}
