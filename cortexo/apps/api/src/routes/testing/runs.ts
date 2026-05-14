import type { FastifyInstance } from 'fastify';
import { getDb } from '../../lib/db.js';
import { testTargets, testCases, testRuns, testResults } from '@cortexo/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getOrgId } from '../../lib/request-context.js';

/**
 * Testing — Run History & Level Breakdown
 *
 * GET  /testing/runs              — List all test runs
 * GET  /testing/runs/:id          — Get single run details
 * GET  /testing/runs/:id/levels   — Level breakdown per run
 *
 * NOTE: POST /testing/run-full lives in runners.ts
 * NOTE: POST /testing/bugs/:runId/export lives in bugs.ts
 */
export async function runRoutes(app: FastifyInstance) {
  /* ─────────────────── RUN HISTORY ─────────────────── */

  app.get('/testing/runs', async () => {
    const db = await getDb();
    return db
      .select({
        id: testRuns.id, targetId: testRuns.targetId, status: testRuns.status,
        total: testRuns.total, passed: testRuns.passed, failed: testRuns.failed,
        skipped: testRuns.skipped, durationMs: testRuns.durationMs,
        triggeredBy: testRuns.triggeredBy, createdAt: testRuns.createdAt,
        targetName: testTargets.name, targetUrl: testTargets.baseUrl,
      })
      .from(testRuns)
      .leftJoin(testTargets, eq(testRuns.targetId, testTargets.id))
      .orderBy(desc(testRuns.createdAt))
      .limit(50);
  });

  app.get('/testing/runs/:id', async (request) => {
    const db = await getDb();
    const { id } = request.params as any;
    const runId = Number(id);

    const [run] = await db
      .select({
        id: testRuns.id, targetId: testRuns.targetId, status: testRuns.status,
        total: testRuns.total, passed: testRuns.passed, failed: testRuns.failed,
        skipped: testRuns.skipped, durationMs: testRuns.durationMs,
        createdAt: testRuns.createdAt, targetName: testTargets.name, targetUrl: testTargets.baseUrl,
      })
      .from(testRuns)
      .leftJoin(testTargets, eq(testRuns.targetId, testTargets.id))
      .where(eq(testRuns.id, runId));

    if (!run) return { error: 'Run not found' };

    const results = await db
      .select({
        id: testResults.id, status: testResults.status, statusCode: testResults.statusCode,
        latencyMs: testResults.latencyMs, error: testResults.error,
        caseName: testCases.name, caseEndpoint: testCases.endpoint,
        caseMethod: testCases.method, caseCategory: testCases.category, casePriority: testCases.priority,
      })
      .from(testResults)
      .leftJoin(testCases, eq(testResults.caseId, testCases.id))
      .where(eq(testResults.runId, runId))
      .orderBy(testResults.status, testCases.category);

    return { run, results };
  });

  // ──────────── GET /testing/runs/:id/levels — Level breakdown ────────────
  app.get('/testing/runs/:id/levels', async (request) => {
    const db = await getDb();
    const runId = Number((request.params as any).id);

    const results = await db.select().from(testResults).where(eq(testResults.runId, runId));

    const levels: Record<string, any> = {};
    for (const level of ['L1', 'L2', 'L3']) {
      const lr = results.filter(r => r.testLevel === level);
      if (lr.length === 0) continue;

      const byModule: Record<string, { passed: number; failed: number; issues: any[] }> = {};
      for (const r of lr) {
        const mod = r.businessModule || 'other';
        if (!byModule[mod]) byModule[mod] = { passed: 0, failed: 0, issues: [] };
        if (r.status === 'passed') byModule[mod].passed++;
        else {
          byModule[mod].failed++;
          byModule[mod].issues.push({
            endpoint: r.flowName || `Case #${r.caseId}`,
            statusCode: r.statusCode, latencyMs: r.latencyMs,
            severity: r.businessSeverity, securityIssue: r.securityIssue,
            schemaErrors: r.schemaErrors, error: r.error,
            responsePreview: (r.responseBody || '').substring(0, 200),
          });
        }
      }

      levels[level] = {
        total: lr.length,
        passed: lr.filter(r => r.status === 'passed').length,
        failed: lr.filter(r => r.status !== 'passed').length,
        modules: byModule,
      };
    }

    return { runId, levels };
  });
}
