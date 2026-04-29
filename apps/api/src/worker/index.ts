import 'dotenv/config';
import { Worker, Job, QueueEvents } from 'bullmq';
import { getRedis } from '../lib/redis.js';
import { executePipeline } from './pipeline-executor.js';

/**
 * Cortexo Pipeline Worker (BullMQ)
 * =================================
 * Runs as a separate process alongside the API server.
 * Uses BullMQ for robust job processing with:
 *   - Automatic retries with exponential backoff
 *   - Job progress tracking
 *   - Dead letter queue for failed jobs
 *   - Concurrency control
 *   - Job event logging
 *
 * Usage: npx tsx src/worker/index.ts
 */

const QUEUE_NAME = 'cortexo:pipeline';

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  🧠 Cortexo Pipeline Worker (BullMQ)         ║');
  console.log('║  Listening for pipeline jobs...               ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  const redis = getRedis();

  // BullMQ Worker — processes pipeline jobs with concurrency control
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      console.log(`[Worker] Picked up job: ${job.id} (run=${job.data.runId} pipeline=${job.data.pipelineId})`);

      try {
        await job.updateProgress(10);
        await executePipeline(job.data);
        await job.updateProgress(100);
        console.log(`[Worker] Job ${job.id} completed successfully`);
        return { success: true, runId: job.data.runId };
      } catch (err: any) {
        console.error(`[Worker] Job ${job.id} failed:`, err.message);
        throw err; // BullMQ will handle retry logic
      }
    },
    {
      connection: redis.duplicate(),
      concurrency: 2, // Process up to 2 pipeline jobs simultaneously
      limiter: {
        max: 10,
        duration: 60_000, // Max 10 jobs per minute
      },
      removeOnComplete: {
        age: 86400, // Keep completed jobs for 24 hours
        count: 100, // Keep last 100 completed jobs
      },
      removeOnFail: {
        age: 604800, // Keep failed jobs for 7 days
        count: 200, // Keep last 200 failed jobs
      },
    },
  );

  // BullMQ event listeners
  worker.on('completed', (job) => {
    console.log(`[Worker] ✅ Job ${job.id} completed (run=${job.data.runId})`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] ❌ Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[Worker] Error:', err.message);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`[Worker] ⚠ Job ${jobId} stalled — will be retried`);
  });

  // Queue events (global event listeners)
  const queueEvents = new QueueEvents(QUEUE_NAME, {
    connection: redis.duplicate(),
  });

  queueEvents.on('waiting', ({ jobId }) => {
    console.log(`[Queue] Job ${jobId} is waiting`);
  });

  queueEvents.on('active', ({ jobId }) => {
    console.log(`[Queue] Job ${jobId} is now active`);
  });

  queueEvents.on('progress', ({ jobId, data }) => {
    console.log(`[Queue] Job ${jobId} progress: ${data}%`);
  });

  console.log('[Worker] Ready — processing pipeline jobs ✅');
  console.log(`[Worker] Queue: ${QUEUE_NAME} | Concurrency: 2 | Rate limit: 10/min`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Worker] ${signal} received, finishing current jobs...`);

    // Close worker gracefully — waits for current jobs to finish
    await worker.close();
    await queueEvents.close();

    console.log('[Worker] Shut down gracefully ✅');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[Worker] Fatal error:', err);
  process.exit(1);
});
