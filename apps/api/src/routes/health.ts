import type { FastifyInstance } from 'fastify';
import { testDbConnection } from '../lib/db.js';
import { testRedisConnection } from '../lib/redis.js';

/**
 * Health check routes — /v1/health
 */
export async function healthRoutes(app: FastifyInstance) {
  // Quick liveness probe
  app.get('/health', async () => ({
    status: 'ok',
    service: 'cortexo-api',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  // Deep readiness probe — checks all dependencies
  app.get('/health/ready', async () => {
    const [dbOk, redisOk] = await Promise.all([
      testDbConnection(),
      testRedisConnection(),
    ]);

    const status = dbOk && redisOk ? 'ready' : 'degraded';

    return {
      status,
      checks: {
        database: dbOk ? 'connected' : 'disconnected',
        redis: redisOk ? 'connected' : 'disconnected',
      },
      timestamp: new Date().toISOString(),
    };
  });
}
