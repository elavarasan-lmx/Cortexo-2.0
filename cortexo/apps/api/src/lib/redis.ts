import Redis from 'ioredis';

let redis: Redis | null = null;

/**
 * Get or create a Redis connection.
 * Used for: job queues, caching, rate limiting, real-time pub/sub.
 *
 * Connection config:
 * - Auto-reconnects with exponential backoff (up to 3s)
 * - lazyConnect disabled so connection is eagerly established
 * - Logs connection events for observability
 */
export function getRedis(): Redis {
  if (redis) return redis;

  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) {
        console.error('[Redis] Max reconnection attempts reached. Giving up.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 200, 3000);
      console.log(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
    lazyConnect: false,
    enableReadyCheck: true,
    reconnectOnError: (err) => {
      // Reconnect on READONLY errors (e.g. during Redis failover)
      return err.message.includes('READONLY');
    },
  });

  redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  redis.on('connect', () => {
    console.log('[Redis] Connected');
  });

  redis.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...');
  });

  redis.on('close', () => {
    console.warn('[Redis] Connection closed');
  });

  return redis;
}

/**
 * Test Redis connectivity.
 * Uses the existing shared connection rather than creating a new one.
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const r = getRedis();
    const pong = await r.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

// ─── Caching Helpers ────────────────────────────────────────────────────────

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get a cached value by key. Returns null if not found or expired.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    const cached = await r.get(`cortexo:${key}`);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with TTL (in seconds). Defaults to 5 minutes.
 */
export async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  try {
    const r = getRedis();
    await r.set(`cortexo:${key}`, JSON.stringify(value), 'EX', ttl);
  } catch {
    // Caching is best-effort — don't fail requests if Redis is down
  }
}

/**
 * Invalidate a cached key or pattern.
 */
export async function cacheInvalidate(pattern: string): Promise<void> {
  try {
    const r = getRedis();
    const keys = await r.keys(`cortexo:${pattern}`);
    if (keys.length > 0) {
      await r.del(...keys);
    }
  } catch {
    // Best-effort
  }
}

/**
 * Cache-aside pattern: get from cache, or execute fetcher and cache the result.
 */
export async function cacheFetch<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await cacheSet(key, fresh, ttl);
  return fresh;
}
