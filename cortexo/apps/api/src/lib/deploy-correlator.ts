/**
 * Deploy Correlation Engine — Sprint 2 (F8)
 *
 * Links errors to recent deployments by finding deploys that occurred
 * within a configurable window of the error's first_seen_at timestamp.
 * Extracts diff context from the correlated deployment for RCA enrichment.
 */

import { getDb } from './db.js';
import { deployments } from '@cortexo/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

// ─── Types ──────────────────────────────────────────────────────────

export interface DeployCorrelation {
  deploymentId: string;
  commitSha: string | null;
  branch: string | null;
  environment: string | null;
  deployedAt: string | null;
  status: string | null;
  timeDeltaMs: number;       // time between deploy and error first_seen
  confidence: number;         // 0-100 confidence this deploy caused the error
}

// ─── Configuration ──────────────────────────────────────────────────

const CORRELATION_WINDOW_MS = 30 * 60 * 1000;  // 30 minutes
const LOOKBACK_MS = 24 * 60 * 60 * 1000;       // 24 hours max lookback

// ─── Functions ──────────────────────────────────────────────────────

/**
 * Find deployments that occurred within a time window before the error.
 * The closer the deploy is to the error, the higher the correlation confidence.
 */
export async function correlateWithDeploy(
  projectId: string,
  errorFirstSeenAt: Date,
): Promise<DeployCorrelation | null> {
  const db = await getDb();

  // Look for deploys in the window: [error - 24h, error + 5min]
  // (error might be detected slightly before deploy completes)
  const windowStart = new Date(errorFirstSeenAt.getTime() - LOOKBACK_MS);
  const windowEnd = new Date(errorFirstSeenAt.getTime() + 5 * 60 * 1000);

  const recentDeploys = await db
    .select()
    .from(deployments)
    .where(
      and(
        eq(deployments.projectId, projectId),
        gte(deployments.createdAt, windowStart),
        lte(deployments.createdAt, windowEnd),
      ),
    )
    .orderBy(desc(deployments.createdAt))
    .limit(5);

  if (recentDeploys.length === 0) return null;

  // Score each deploy by proximity to error
  const scored = recentDeploys.map((deploy) => {
    const deployTime = new Date(deploy.createdAt).getTime();
    const errorTime = errorFirstSeenAt.getTime();
    const timeDelta = Math.abs(errorTime - deployTime);

    // Confidence formula:
    // - Deploy within 5 min before error → 95%
    // - Deploy within 30 min → 80%
    // - Deploy within 2h → 60%
    // - Deploy within 24h → 30%
    let confidence = 20;
    if (timeDelta < 5 * 60 * 1000) confidence = 95;
    else if (timeDelta < CORRELATION_WINDOW_MS) confidence = 80;
    else if (timeDelta < 2 * 60 * 60 * 1000) confidence = 60;
    else if (timeDelta < LOOKBACK_MS) confidence = 30;

    // Boost confidence if deploy happened just before error (causal direction)
    if (deployTime < errorTime && timeDelta < CORRELATION_WINDOW_MS) {
      confidence = Math.min(100, confidence + 10);
    }

    // Boost for 'completed' status (deploy finished before error)
    if (deploy.status === 'completed' || deploy.status === 'success') {
      confidence = Math.min(100, confidence + 5);
    }

    return {
      deploymentId: deploy.id,
      commitSha: (deploy as any).commitSha || null,
      branch: (deploy as any).branch || null,
      environment: (deploy as any).environment || null,
      deployedAt: deploy.createdAt?.toISOString() || null,
      status: deploy.status,
      timeDeltaMs: timeDelta,
      confidence,
    };
  });

  // Return highest confidence match
  scored.sort((a, b) => b.confidence - a.confidence);
  return scored[0] || null;
}

/**
 * Find all recent deployments for a project to include in RCA context.
 * Used when building the AI prompt for richer context.
 */
export async function getRecentDeploys(
  projectId: string,
  limit = 5,
): Promise<Array<{ id: string; commitSha: string | null; branch: string | null; status: string | null; createdAt: string }>> {
  const db = await getDb();

  const deploys = await db
    .select({
      id: deployments.id,
      commitSha: sql<string | null>`${deployments}.commit_sha`,
      branch: sql<string | null>`${deployments}.branch`,
      status: deployments.status,
      createdAt: deployments.createdAt,
    })
    .from(deployments)
    .where(eq(deployments.projectId, projectId))
    .orderBy(desc(deployments.createdAt))
    .limit(limit);

  return deploys.map((d) => ({
    id: d.id,
    commitSha: d.commitSha,
    branch: d.branch,
    status: d.status,
    createdAt: d.createdAt?.toISOString() || '',
  }));
}
