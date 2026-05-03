/**
 * Usage Limits Enforcement Middleware
 * Checks plan limits before creating projects, triggering pipelines, or ingesting errors.
 * Applied as a Fastify plugin registered at root scope (no prefix).
 *
 * Uses Redis for persistent, multi-instance-safe usage counters.
 */
import type { FastifyInstance } from 'fastify';
import { getRedis } from '../lib/redis.js';

// Plan limits
const PLAN_LIMITS = {
  free:    { projects: 1,  errors_per_day: 1000,  ai_calls_per_day: 5,   deploys_per_day: 5   },
  starter: { projects: 3,  errors_per_day: 10000, ai_calls_per_day: 50,  deploys_per_day: 20  },
  pro:     { projects: 20, errors_per_day: 100000, ai_calls_per_day: 500, deploys_per_day: 200 },
  team:    { projects: -1, errors_per_day: -1,     ai_calls_per_day: -1,  deploys_per_day: -1  },
};

type PlanKey = keyof typeof PLAN_LIMITS;

// Redis key for daily usage counters
function usageKey(orgId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `cortexo:usage:${orgId}:${today}`;
}

/**
 * Get current usage counters from Redis.
 * Returns zeros if the key doesn't exist yet (new day).
 */
async function getCounter(orgId: string) {
  try {
    const redis = getRedis();
    const key = usageKey(orgId);
    const data = await redis.hgetall(key);
    return {
      errors: parseInt(data.errors || '0', 10),
      aiCalls: parseInt(data.aiCalls || '0', 10),
      deploys: parseInt(data.deploys || '0', 10),
    };
  } catch {
    // Fallback to zeros if Redis is down — don't block requests
    return { errors: 0, aiCalls: 0, deploys: 0 };
  }
}

/**
 * Atomically increment a usage counter in Redis.
 * Sets TTL to 48h on first write (auto-cleanup old days).
 */
async function incrementCounter(orgId: string, field: 'errors' | 'aiCalls' | 'deploys') {
  try {
    const redis = getRedis();
    const key = usageKey(orgId);
    await redis.hincrby(key, field, 1);
    // Set TTL only if it's a new key (first event of the day)
    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      await redis.expire(key, 172800); // 48 hours
    }
  } catch {
    // Best-effort — don't fail requests if Redis is down
  }
}

// Exported functions for route handlers to call
export function incrementErrorCount(orgId: string) { return incrementCounter(orgId, 'errors'); }
export function incrementAiCallCount(orgId: string) { return incrementCounter(orgId, 'aiCalls'); }
export function incrementDeployCount(orgId: string) { return incrementCounter(orgId, 'deploys'); }

export async function getUsage(orgId: string) {
  const c = await getCounter(orgId);
  const today = new Date().toISOString().slice(0, 10);
  return { errors: c.errors, aiCalls: c.aiCalls, deploys: c.deploys, date: today };
}

// Get org plan from env (replace with DB lookup in production)
function getOrgPlan(orgId: string): PlanKey {
  const envPlan = process.env.DEFAULT_PLAN;
  if (envPlan && envPlan in PLAN_LIMITS) return envPlan as PlanKey;
  return 'starter';
}

export async function usageLimitsPlugin(app: FastifyInstance) {
  // Usage limit check hook
  app.addHook('onRequest', async (request, reply) => {
    const orgId = (request as any).orgId || 'default';
    const { method, url } = request;
    const limits = PLAN_LIMITS[getOrgPlan(orgId)];
    const usage = await getCounter(orgId);

    // Error ingest limit
    if (method === 'POST' && url.includes('/ingest/error')) {
      if (limits.errors_per_day !== -1 && usage.errors >= limits.errors_per_day) {
        return reply.code(429).send({
          error: 'Daily error ingest limit reached',
          limit: limits.errors_per_day,
          used: usage.errors,
          upgradeUrl: 'http://localhost:3000/settings',
        });
      }
    }

    // AI call limit
    if (method === 'POST' && (url.includes('/root-causes/analyze') || url.includes('/agent/run'))) {
      if (limits.ai_calls_per_day !== -1 && usage.aiCalls >= limits.ai_calls_per_day) {
        return reply.code(429).send({
          error: 'Daily AI call limit reached',
          limit: limits.ai_calls_per_day,
          used: usage.aiCalls,
          upgradeUrl: 'http://localhost:3000/settings',
        });
      }
    }

    // Deploy limit
    if (method === 'POST' && url.includes('/trigger')) {
      if (limits.deploys_per_day !== -1 && usage.deploys >= limits.deploys_per_day) {
        return reply.code(429).send({
          error: 'Daily deploy limit reached',
          limit: limits.deploys_per_day,
          used: usage.deploys,
          upgradeUrl: 'http://localhost:3000/settings',
        });
      }
    }
  });

  // Usage stats endpoint
  app.get('/v1/usage', async (request) => {
    const orgId = (request as any).orgId || 'default';
    const plan = getOrgPlan(orgId);
    const usage = await getCounter(orgId);
    const limits = PLAN_LIMITS[plan];
    return {
      plan,
      usage: { errors: usage.errors, aiCalls: usage.aiCalls, deploys: usage.deploys },
      limits,
      remaining: {
        errors:  limits.errors_per_day   === -1 ? -1 : limits.errors_per_day   - usage.errors,
        aiCalls: limits.ai_calls_per_day === -1 ? -1 : limits.ai_calls_per_day - usage.aiCalls,
        deploys: limits.deploys_per_day  === -1 ? -1 : limits.deploys_per_day  - usage.deploys,
      },
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
    };
  });
}
