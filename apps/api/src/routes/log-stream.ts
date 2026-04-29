import type { FastifyInstance } from 'fastify';
import { getRedis } from '../lib/redis.js';

/**
 * WebSocket Live Log Streaming — /v1/logs/stream/:runId
 *
 * Streams pipeline build logs in real-time to the browser.
 * The pipeline executor pushes logs to Redis pub/sub channel: cortexo:logs:{runId}
 * This route subscribes and forwards to the WebSocket client.
 *
 * Setup: npm install @fastify/websocket
 */
export async function logStreamRoutes(app: FastifyInstance) {
  // SSE (Server-Sent Events) endpoint — works without @fastify/websocket
  // GET /v1/logs/stream/:runId
  app.get('/logs/stream/:runId', async (request, reply) => {
    const { runId } = request.params as { runId: string };

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.raw.flushHeaders();

    const send = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial connection event
    send('connected', { runId, timestamp: new Date().toISOString() });

    let subscriber: ReturnType<typeof getRedis> | null = null;
    let closed = false;

    try {
      // Create a dedicated subscriber connection (redis requires separate connection for subscribe)
      const redis = getRedis();
      // Duplicate the connection for pub/sub
      subscriber = redis.duplicate ? redis.duplicate() : redis;

      const channel = `cortexo:logs:${runId}`;

      // Subscribe to log channel
      await (subscriber as any).subscribe(channel, (message: string) => {
        if (closed) return;
        try {
          const parsed = JSON.parse(message);
          send('log', parsed);
          // If pipeline finished, close stream
          if (parsed.type === 'complete' || parsed.type === 'failed') {
            send('done', { status: parsed.type, runId });
            reply.raw.end();
            closed = true;
          }
        } catch {
          send('log', { line: message, timestamp: new Date().toISOString() });
        }
      });

      // Also stream any buffered logs from Redis list (catch-up)
      const bufferedLogs = await redis.lrange(`cortexo:log-buffer:${runId}`, 0, -1);
      for (const log of bufferedLogs) {
        try {
          send('log', JSON.parse(log));
        } catch {
          send('log', { line: log, timestamp: new Date().toISOString() });
        }
      }

      // Heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        if (closed) { clearInterval(heartbeat); return; }
        reply.raw.write(': heartbeat\n\n');
      }, 15000);

      // Auto-close after 30 minutes
      const timeout = setTimeout(() => {
        if (!closed) {
          send('done', { status: 'timeout', runId });
          reply.raw.end();
          closed = true;
        }
        clearInterval(heartbeat);
      }, 30 * 60 * 1000);

      // Clean up on client disconnect
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
      send('error', { message: 'Failed to connect to log stream' });
      reply.raw.end();
    }

    // Keep request hanging (SSE streams)
    await new Promise(() => {});
  });

  // Get buffered logs for a run (REST fallback)
  app.get('/logs/:runId', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    try {
      const redis = getRedis();
      const logs = await redis.lrange(`cortexo:log-buffer:${runId}`, 0, -1);
      const parsed = logs.map((l: string) => {
        try { return JSON.parse(l); } catch { return { line: l }; }
      });
      return { data: parsed, total: parsed.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch logs' });
    }
  });
}

/**
 * Helper: push a log line to Redis for streaming + buffering.
 * Called from the pipeline executor during builds.
 */
export async function publishLog(runId: string, logEntry: {
  line: string;
  stage?: string;
  level?: 'info' | 'error' | 'warn' | 'debug';
  timestamp?: string;
  type?: 'log' | 'complete' | 'failed';
}) {
  try {
    const redis = getRedis();
    const entry = {
      ...logEntry,
      timestamp: logEntry.timestamp || new Date().toISOString(),
      type: logEntry.type || 'log',
    };
    const payload = JSON.stringify(entry);
    // Publish to live subscribers
    await redis.publish(`cortexo:logs:${runId}`, payload);
    // Buffer last 500 lines for catch-up (30min TTL)
    await redis.rpush(`cortexo:log-buffer:${runId}`, payload);
    await redis.ltrim(`cortexo:log-buffer:${runId}`, -500, -1);
    await redis.expire(`cortexo:log-buffer:${runId}`, 1800);
  } catch {
    // Non-critical — don't throw
  }
}
