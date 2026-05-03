/**
 * Cortexo Worker Runner — starts all BullMQ workers.
 * Run separately from the API server: `npx tsx src/workers/index.ts`
 */
import { startSyncWorker } from './sync-worker.js';
import { startProvisionWorker } from './provision-worker.js';
import { startAlertDispatchWorker } from './alert-dispatch-worker.js';
import { startRCAWorker } from './rca-worker.js';

async function main() {
  console.log(`
╔══════════════════════════════════════════╗
║  ⚙️  Cortexo Worker Pool v0.5.0         ║
║  Starting background job processors...  ║
╚══════════════════════════════════════════╝
`);

  const workers = [
    startSyncWorker(),
    startProvisionWorker(),
    startAlertDispatchWorker(),
    startRCAWorker(),
  ];

  console.log(`[WorkerPool] ${workers.length} workers started ✅`);
  console.log('[WorkerPool] Queues:');
  console.log('  - cortexo:sync           (concurrency: 2)');
  console.log('  - cortexo:provision      (concurrency: 1)');
  console.log('  - cortexo:alert-dispatch (concurrency: 5)');
  console.log('  - cortexo:rca            (concurrency: 2)');
  console.log('[WorkerPool] Waiting for jobs...\n');

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[WorkerPool] ${signal} received — shutting down workers...`);
    await Promise.all(workers.map(w => w.close()));
    console.log('[WorkerPool] All workers stopped. Goodbye.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[WorkerPool] Fatal error:', err);
  process.exit(1);
});
