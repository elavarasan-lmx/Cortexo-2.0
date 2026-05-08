/**
 * RCA Worker — cortexo:rca (Root Cause Analysis)
 * Sprint 2 expanded — Uses the full AI root cause engine with deploy
 * correlation and similar bugs context for richer analysis.
 */
import type { Job } from 'bullmq';
import { createWorker, QUEUE_NAMES } from './shared.js';
import { analyzeRootCause } from '../lib/ai-root-cause.js';
import { correlateWithDeploy } from '../lib/deploy-correlator.js';
import { findSimilarBugs } from '../lib/similar-bugs.js';
import { getDb } from '../lib/db.js';
import { errors, rootCauses } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';

interface RCAJobData {
  orgId: string;
  errorId: string;
  rootCauseId?: string;       // if pre-created; otherwise worker creates one
  errorMessage?: string;
  stackTrace?: string;
  errorType?: string;
  filePath?: string;
  projectId?: string;
  environment?: string;
}

async function processRCAJob(job: Job<RCAJobData>): Promise<void> {
  const { errorId, orgId, rootCauseId } = job.data;

  console.log(`[RCAWorker] Starting analysis for error ${errorId}`);
  await job.updateProgress(5);

  const db = await getDb();

  // Step 1: Fetch error from DB for full context
  console.log(`[RCAWorker] Step 1: Fetching error details`);
  const [error] = await db
    .select()
    .from(errors)
    .where(eq(errors.id, errorId))
    .limit(1);

  if (!error) {
    console.error(`[RCAWorker] Error ${errorId} not found`);
    if (rootCauseId) {
      await db.update(rootCauses).set({
        status: 'failed',
        summary: 'Error not found in database',
      } as any).where(eq(rootCauses.id, rootCauseId));
    }
    return;
  }
  await job.updateProgress(15);

  const projectId = job.data.projectId || error.projectId;

  // Step 2: Create RCA record if not pre-created
  let rcaId = rootCauseId;
  if (!rcaId) {
    console.log(`[RCAWorker] Step 2: Creating RCA record`);
    const [rca] = await db
      .insert(rootCauses)
      .values({
        errorId,
        projectId,
        orgId,
        status: 'analyzing',
      })
      .returning();
    rcaId = rca.id;
  } else {
    await db.update(rootCauses).set({ status: 'analyzing' } as any).where(eq(rootCauses.id, rcaId));
  }
  await job.updateProgress(20);

  // Step 3: Deploy correlation
  console.log(`[RCAWorker] Step 3: Correlating with recent deployments`);
  let deployCorrelation = null;
  try {
    deployCorrelation = await correlateWithDeploy(
      projectId,
      error.firstSeenAt || new Date(),
    );
    if (deployCorrelation) {
      await db.update(rootCauses).set({
        deploymentId: deployCorrelation.deploymentId,
      } as any).where(eq(rootCauses.id, rcaId));
      console.log(`[RCAWorker] Deploy correlation found: ${deployCorrelation.deploymentId} (confidence: ${deployCorrelation.confidence}%)`);
    }
  } catch (err) {
    console.warn(`[RCAWorker] Deploy correlation failed:`, err);
  }
  await job.updateProgress(35);

  // Step 4: Find similar past bugs
  console.log(`[RCAWorker] Step 4: Finding similar bugs`);
  let similarBugIds: string[] = [];
  try {
    const similar = await findSimilarBugs(
      errorId,
      projectId,
      error.type,
      error.message || '',
      error.file,
      5,
    );
    similarBugIds = similar.map((s) => s.errorId);
    if (similar.length > 0) {
      console.log(`[RCAWorker] Found ${similar.length} similar bugs`);
      await db.update(rootCauses).set({
        similarBugs: similarBugIds,
      } as any).where(eq(rootCauses.id, rcaId));
    }
  } catch (err) {
    console.warn(`[RCAWorker] Similar bugs search failed:`, err);
  }
  await job.updateProgress(50);

  // Step 5: Run AI analysis via the existing engine
  console.log(`[RCAWorker] Step 5: Running AI root cause analysis`);
  try {
    await analyzeRootCause(errorId, rcaId, projectId, orgId);
    console.log(`[RCAWorker] AI analysis completed for error ${errorId}`);
  } catch (err) {
    console.error(`[RCAWorker] AI analysis failed for error ${errorId}:`, err);
    await db.update(rootCauses).set({
      status: 'failed',
      summary: `Analysis failed: ${(err as Error).message}`,
    } as any).where(eq(rootCauses.id, rcaId));
  }
  await job.updateProgress(100);

  console.log(`[RCAWorker] Analysis complete for error ${errorId} (RCA: ${rcaId})`);
}

export function startRCAWorker() {
  console.log('[RCAWorker] Starting...');
  return createWorker<RCAJobData>(QUEUE_NAMES.RCA, processRCAJob, 2);
}
