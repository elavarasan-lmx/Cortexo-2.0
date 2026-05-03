/**
 * Cortexo Worker Infrastructure — Shared utilities
 * BullMQ queue definitions, connection configs, and worker helpers.
 */
import { Queue, Worker, type Job, type ConnectionOptions } from 'bullmq';

// ── Redis connection (shared across all workers) ────────────────────
export function getRedisConnection(): ConnectionOptions {
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  };
}

// ── Queue names ─────────────────────────────────────────────────────
export const QUEUE_NAMES = {
  SYNC: 'cortexo:sync',
  PROVISION: 'cortexo:provision',
  ALERT_DISPATCH: 'cortexo:alert-dispatch',
  RCA: 'cortexo:rca',
  CRON: 'cortexo:cron',
  DEPRECATION_SCAN: 'cortexo:deprecation-scan',
  JUDGE_SCORE: 'cortexo:judge-score',
} as const;

// ── Queue factory ───────────────────────────────────────────────────
export function createQueue(name: string): Queue {
  return new Queue(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    },
  });
}

// ── Worker factory ──────────────────────────────────────────────────
export function createWorker<T = unknown>(
  name: string,
  processor: (job: Job<T>) => Promise<unknown>,
  concurrency = 3,
): Worker<T> {
  const worker = new Worker<T>(name, processor, {
    connection: getRedisConnection(),
    concurrency,
    limiter: {
      max: 10,
      duration: 1000, // 10 jobs/sec max
    },
  });

  worker.on('completed', (job) => {
    console.log(`[${name}] ✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[${name}] ❌ Job ${job?.id} failed: ${err.message}`);
  });

  worker.on('error', (err) => {
    console.error(`[${name}] 🔥 Worker error: ${err.message}`);
  });

  return worker;
}

// ── Idempotency helper (BullMQ at-least-once delivery) ──────────────
export async function ensureIdempotent(jobId: string, checkFn: () => Promise<boolean>): Promise<boolean> {
  const alreadyProcessed = await checkFn();
  if (alreadyProcessed) {
    console.log(`[Idempotent] Job ${jobId} already processed — skipping`);
    return true;
  }
  return false;
}
