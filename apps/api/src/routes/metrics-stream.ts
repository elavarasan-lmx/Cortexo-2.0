import type { FastifyInstance } from 'fastify';
import { getRedis } from '../lib/redis.js';

/**
 * Real-Time Metrics Stream — /v1/metrics/stream
 *
 * SSE endpoint that pushes live platform metrics to the dashboard.
 * Workers & cron jobs publish to Redis channel: cortexo:metrics:live
 *
 * Metric payload shape:
 *   { type: 'server_health' | 'deploy_activity' | 'alert_count' | 'kpi_update' | 'worker_status',
 *     data: { ... },
 *     timestamp: ISO string }
 */
export async function metricsStreamRoutes(app: FastifyInstance) {

  // ── SSE Live Stream ───────────────────────────────────────────────────
  app.get('/metrics/stream', async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.raw.flushHeaders();

    const send = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send('connected', { timestamp: new Date().toISOString() });

    let subscriber: ReturnType<typeof getRedis> | null = null;
    let closed = false;

    try {
      const redis = getRedis();
      subscriber = redis.duplicate ? redis.duplicate() : redis;

      const channel = 'cortexo:metrics:live';

      await (subscriber as any).subscribe(channel, (message: string) => {
        if (closed) return;
        try {
          const parsed = JSON.parse(message);
          send(parsed.type || 'metric', parsed);
        } catch {
          send('metric', { raw: message, timestamp: new Date().toISOString() });
        }
      });

      // Heartbeat every 20s
      const heartbeat = setInterval(() => {
        if (closed) { clearInterval(heartbeat); return; }
        reply.raw.write(': heartbeat\n\n');
      }, 20000);

      // Auto-close after 2 hours (dashboard will reconnect)
      const timeout = setTimeout(() => {
        if (!closed) {
          send('reconnect', { reason: 'timeout', timestamp: new Date().toISOString() });
          reply.raw.end();
          closed = true;
        }
        clearInterval(heartbeat);
      }, 2 * 60 * 60 * 1000);

      // Cleanup on client disconnect
      request.raw.on('close', () => {
        closed = true;
        clearInterval(heartbeat);
        clearTimeout(timeout);
        if (subscriber && (subscriber as any).unsubscribe) {
          (subscriber as any).unsubscribe(channel).catch(() => {});
        }
      });

    } catch (err) {
      app.log.error(err);
      send('error', { message: 'Failed to connect to metrics stream' });
      reply.raw.end();
    }

    await new Promise(() => {});
  });

  // ── REST Snapshot (current metrics) ───────────────────────────────────
  app.get('/metrics/snapshot', async (_request, reply) => {
    try {
      const redis = getRedis();

      // Read the latest cached metrics from Redis hashes
      const [serverHealth, deployActivity, alertCount, workerStatus] = await Promise.all([
        redis.get('cortexo:metrics:server_health'),
        redis.get('cortexo:metrics:deploy_activity'),
        redis.get('cortexo:metrics:alert_count'),
        redis.get('cortexo:metrics:worker_status'),
      ]);

      const parse = (v: string | null) => {
        if (!v) return null;
        try { return JSON.parse(v); } catch { return null; }
      };

      return {
        data: {
          serverHealth: parse(serverHealth),
          deployActivity: parse(deployActivity),
          alertCount: parse(alertCount),
          workerStatus: parse(workerStatus),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch metrics snapshot' });
    }
  });
}

/**
 * Helper: publish a metric update to Redis for live streaming.
 * Called from workers, cron handlers, and alert processors.
 *
 * Usage:
 *   import { publishMetric } from './routes/metrics-stream.js';
 *   await publishMetric('server_health', { serverId: 1, cpu: 45, memory: 72, disk: 38 });
 */
export async function publishMetric(
  type: 'server_health' | 'deploy_activity' | 'alert_count' | 'kpi_update' | 'worker_status',
  data: Record<string, unknown>,
) {
  try {
    const redis = getRedis();
    const payload = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString(),
    });

    // Publish to live subscribers
    await redis.publish('cortexo:metrics:live', payload);

    // Cache latest value per type (for snapshot REST endpoint)
    await redis.set(`cortexo:metrics:${type}`, JSON.stringify(data), 'EX', 300);
  } catch {
    // Non-critical — don't throw
  }
}
