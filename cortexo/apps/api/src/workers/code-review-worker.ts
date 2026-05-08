/**
 * Code Review Worker — BullMQ background job processor.
 * Triggered after pipeline clone step or manually via API.
 * Scans source files against rule-based engine and saves findings to DB.
 */
import type { Job } from 'bullmq';
import { createWorker, QUEUE_NAMES } from './shared.js';
import { getDb } from '../lib/db.js';
import { codeReviews, codeReviewFindings } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';
import { runRuleBasedReview, filterSupportedFiles, type SourceFile } from '../lib/code-review-engine.js';

// ── Job data shape ──────────────────────────────────────────────────

export interface CodeReviewJobData {
  reviewId: string;
  projectId: string;
  orgId: string;
  files: SourceFile[];
  commitSha?: string;
  branch?: string;
  aiEnabled?: boolean;
}

// ── Processor ───────────────────────────────────────────────────────

async function processCodeReview(job: Job<CodeReviewJobData>) {
  const { reviewId, projectId, orgId, files, aiEnabled } = job.data;
  const db = await getDb();

  console.log(`[CodeReview] Starting review ${reviewId} — ${files.length} files`);

  try {
    // Update status to running
    await db
      .update(codeReviews)
      .set({ status: 'running' })
      .where(eq(codeReviews.id, reviewId));

    // Filter supported files
    const supported = filterSupportedFiles(files);
    if (supported.length === 0) {
      await db
        .update(codeReviews)
        .set({
          status: 'completed',
          filesScanned: 0,
          totalFindings: 0,
          completedAt: new Date(),
        })
        .where(eq(codeReviews.id, reviewId));
      console.log(`[CodeReview] Review ${reviewId} — no supported files, completing empty`);
      return { reviewId, findings: 0 };
    }

    // Run rule-based review
    const result = runRuleBasedReview(supported);

    // Bulk insert findings
    if (result.findings.length > 0) {
      const findingRows = result.findings.map((f) => ({
        reviewId,
        projectId,
        file: f.file,
        line: f.line,
        endLine: f.endLine || null,
        column: f.column || null,
        ruleId: f.ruleId,
        ruleName: f.ruleName,
        category: f.category,
        severity: f.severity,
        message: f.message,
        snippet: f.snippet,
        suggestion: f.suggestion,
        suggestedFix: f.suggestedFix || null,
        autoFixable: f.autoFixable,
        status: 'open',
        source: f.source,
      }));

      await db.insert(codeReviewFindings).values(findingRows);
    }

    // Update review with results
    await db
      .update(codeReviews)
      .set({
        status: 'completed',
        totalFindings: result.totalFindings,
        criticalCount: result.criticalCount,
        highCount: result.highCount,
        mediumCount: result.mediumCount,
        lowCount: result.lowCount,
        infoCount: result.infoCount,
        filesScanned: result.filesScanned,
        durationMs: result.durationMs,
        completedAt: new Date(),
      })
      .where(eq(codeReviews.id, reviewId));

    console.log(
      `[CodeReview] ✅ Review ${reviewId} completed: ${result.totalFindings} findings in ${result.filesScanned} files (${result.durationMs}ms)`,
    );

    return {
      reviewId,
      findings: result.totalFindings,
      critical: result.criticalCount,
      high: result.highCount,
    };
  } catch (err) {
    // Mark as failed
    await db
      .update(codeReviews)
      .set({ status: 'failed', completedAt: new Date() })
      .where(eq(codeReviews.id, reviewId));

    console.error(`[CodeReview] ❌ Review ${reviewId} failed:`, err);
    throw err;
  }
}

// ── Worker starter ──────────────────────────────────────────────────

export function startCodeReviewWorker() {
  return createWorker<CodeReviewJobData>(
    QUEUE_NAMES.CODE_REVIEW,
    processCodeReview,
    2, // concurrency
  );
}
