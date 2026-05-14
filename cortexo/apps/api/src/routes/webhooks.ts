import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { deployments } from '@cortexo/db/schema';

// ── Schema for incoming webhook payload ─────────────────────────────────────
const deployLogSchema = z.object({
  client_id:      z.string().min(1),
  client_name:    z.string().min(1),
  environment:    z.enum(['staging', 'production', 'dev', 'qa']).or(z.string()),
  status:         z.enum(['success', 'failed']),
  branch:         z.string().min(1),
  commit_sha:     z.string().min(1),
  commit_message: z.string().default(''),
  triggered_by:   z.string().default('webhook'),
  trigger_type:   z.enum(['webhook', 'manual', 'cron']).default('webhook'),
  deploy_type:    z.string().default('git_pull'),
  log_tail:       z.string().default(''),
});

type DeployLogPayload = z.infer<typeof deployLogSchema>;

// ── Route plugin ─────────────────────────────────────────────────────────────
export async function webhookRoutes(app: FastifyInstance) {

  /**
   * POST /api/webhooks/deploy-log
   * Receives deploy notifications from winbull/etail webhook handlers.
   * Stores the log entry and broadcasts via SSE to connected dashboard clients.
   *
   * Security: validated via X-Webhook-Secret header (same as DEVOPS_WEBHOOK_SECRET env var)
   * Auth: NOT protected by JWT — uses its own secret-based auth
   */
  app.post('/api/webhooks/deploy-log', {
    config: { skipAuth: true },   // bypasses authMiddleware JWT check
  }, async (request, reply) => {
    // ── Validate webhook secret ───────────────────────────────────
    const incomingSecret = request.headers['x-webhook-secret'] as string || '';
    const expectedSecret = process.env.DEVOPS_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || '';

    if (!expectedSecret) {
      request.log.warn('DEVOPS_WEBHOOK_SECRET not set — all webhook requests accepted (dev mode)');
    } else if (!incomingSecret || incomingSecret !== expectedSecret) {
      request.log.warn({ ip: request.ip }, 'Webhook: invalid secret');
      return reply.code(403).send({ error: 'Invalid webhook secret' });
    }

    // ── Parse body ───────────────────────────────────────────────
    const parsed = deployLogSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: parsed.error.flatten(),
      });
    }

    const payload: DeployLogPayload = parsed.data;

    // ── Log to console (always) ───────────────────────────────────
    request.log.info({
      client:      payload.client_id,
      environment: payload.environment,
      status:      payload.status,
      branch:      payload.branch,
      commit:      payload.commit_sha.slice(0, 7),
      by:          payload.triggered_by,
    }, `Deploy webhook received: ${payload.status.toUpperCase()} [${payload.client_id}/${payload.environment}]`);

    // ── Persist to DB (deployments table) ────────────────────────
    let deploymentId: string | null = null;
    try {
      const db = await getDb();

      // Find the most recent running/pending deployment for this client+branch
      // and update it, OR create a new record from the webhook data
      const now = new Date();
      const insertResult = await db.insert(deployments).values({
        projectId:     0,                          // unknown from webhook — no project context
        serverId:      null,
        status:        payload.status as any,
        branch:        payload.branch,
        commitSha:     payload.commit_sha,
        commitMessage: payload.commit_message,
        triggeredBy:   payload.triggered_by,
        startedAt:     now,
        finishedAt:    now,
        environment:   payload.environment,
        notes:         [
          `client: ${payload.client_id}`,
          `trigger: ${payload.trigger_type}`,
          `deploy_type: ${payload.deploy_type}`,
          payload.log_tail ? `log: ${payload.log_tail.slice(0, 500)}` : '',
        ].filter(Boolean).join('\n'),
      } as any).returning({ id: deployments.id });

      deploymentId = insertResult[0]?.id ?? null;

      request.log.info({ deploymentId }, 'Deploy log persisted to DB');
    } catch (err) {
      // Non-fatal: log but still return 200 so deploy.php doesn't retry forever
      request.log.error({ err }, 'Failed to persist deploy log to DB');
    }

    // ── Return success ────────────────────────────────────────────
    return reply.code(200).send({
      received:      true,
      deployment_id: deploymentId,
      client:        payload.client_id,
      environment:   payload.environment,
      status:        payload.status,
      message:       `Deploy log recorded: ${payload.status} [${payload.branch}@${payload.commit_sha.slice(0, 7)}]`,
    });
  });

  /**
   * GET /api/webhooks/deploy-log/recent
   * Returns the 20 most recent webhook-triggered deployments.
   * Used by the Deployments page to show recent activity.
   * Protected by JWT (normal auth).
   */
  app.get('/api/webhooks/deploy-log/recent', async (request, reply) => {
    try {
      const db = await getDb();

      const recent = await db.query.deployments.findMany({
        orderBy: (d, { desc }) => [desc(d.startedAt)],
        limit: 20,
        where: (d: any, { eq }: any) => eq(d.triggeredBy, 'webhook'),
      });

      return reply.send({ deployments: recent });
    } catch (err) {
      request.log.error({ err }, 'Failed to fetch recent webhook deployments');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
