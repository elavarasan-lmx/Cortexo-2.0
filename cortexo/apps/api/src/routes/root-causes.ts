import { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb } from '../lib/db.js';
import { rootCauses, errors, deployments } from '@cortexo/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { analyzeRootCause } from '../lib/ai-root-cause.js';
import { correlateWithDeploy } from '../lib/deploy-correlator.js';
import { findSimilarBugs } from '../lib/similar-bugs.js';

/**
 * Root Cause Analysis routes — Sprint 2 expanded (F8).
 * Owns: root_causes table
 * Reads: errors, deployments
 * Services: ai-root-cause, deploy-correlator, similar-bugs
 */
export async function rootCauseRoutes(app: FastifyInstance) {
  const db = await getDb();

  // ─── GET /root-causes — list all root cause analyses ────────────
  app.get('/root-causes', async (request: FastifyRequest) => {
    const results = await db
      .select()
      .from(rootCauses)
      .orderBy(desc(rootCauses.createdAt))
      .limit(100);

    // Enrich with error summary for display
    const enriched = await Promise.all(
      results.map(async (rca) => {
        let errorSummary = null;
        if (rca.errorId) {
          const [err] = await db
            .select({
              type: errors.type,
              message: errors.message,
              file: errors.file,
              severity: errors.severity,
            })
            .from(errors)
            .where(eq(errors.id, rca.errorId))
            .limit(1);
          errorSummary = err || null;
        }
        return {
          ...rca,
          summary: rca.summary || rca.analysis?.slice(0, 120) || errorSummary?.message || 'Untitled Analysis',
          explanation: rca.rootCause || rca.analysis,
          error: errorSummary,
        };
      }),
    );

    return { data: enriched };
  });

  // ─── GET /root-causes/:id — get single root cause detail ───────
  app.get('/root-causes/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const { id } = request.params;
    const [rca] = await db
      .select()
      .from(rootCauses)
      .where(eq(rootCauses.id, id))
      .limit(1);

    if (!rca) {
      return { error: 'Root cause not found', statusCode: 404 };
    }

    // Enrich with error details
    let errorDetail = null;
    if (rca.errorId) {
      const [err] = await db.select().from(errors).where(eq(errors.id, rca.errorId)).limit(1);
      errorDetail = err || null;
    }

    // Enrich with deploy info
    let deployDetail = null;
    if (rca.deploymentId) {
      const [dep] = await db.select().from(deployments).where(eq(deployments.id, rca.deploymentId)).limit(1);
      deployDetail = dep || null;
    }

    return {
      data: {
        ...rca,
        error: errorDetail,
        deployment: deployDetail,
      },
    };
  });

  // ─── POST /root-causes — create manual RCA ────────────────────
  const createSchema = z.object({
    errorId: z.string().uuid(),
    projectId: z.string().uuid(),
    analysis: z.string().optional(),
    suggestedFix: z.string().optional(),
    confidence: z.number().min(0).max(100).optional(),
    status: z.enum(['pending', 'confirmed', 'rejected', 'analyzing']).default('pending'),
  });

  app.post('/root-causes', async (request: FastifyRequest) => {
    const body = createSchema.parse(request.body);
    const [created] = await db
      .insert(rootCauses)
      .values({
        errorId: body.errorId,
        projectId: body.projectId,
        analysis: body.analysis,
        suggestedFix: body.suggestedFix,
        confidence: body.confidence,
        status: body.status,
      })
      .returning();

    return { data: created };
  });

  // ─── POST /root-causes/analyze — trigger AI analysis (F8) ─────
  const analyzeSchema = z.object({
    errorId: z.string().uuid(),
  });

  app.post('/root-causes/analyze', async (request: FastifyRequest) => {
    const { errorId } = analyzeSchema.parse(request.body);

    // Fetch the error to get projectId
    const [error] = await db
      .select()
      .from(errors)
      .where(eq(errors.id, errorId))
      .limit(1);

    if (!error) {
      return { error: 'Error not found', statusCode: 404 };
    }

    // Create a pending root cause entry
    const [rca] = await db
      .insert(rootCauses)
      .values({
        errorId,
        projectId: error.projectId,
        orgId: error.orgId,
        status: 'analyzing',
      })
      .returning();

    // Run analysis async (fire-and-forget)
    analyzeRootCause(errorId, rca.id, error.projectId, error.orgId).catch((err) => {
      console.error('[RCA] Background analysis failed:', err);
    });

    return { data: rca };
  });



  // ─── POST /root-causes/:id/feedback — submit feedback (F8) ────
  const feedbackSchema = z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
    verdict: z.enum(['correct', 'wrong']).optional(),
  });

  app.patch(
    '/root-causes/:id/feedback',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;
      const body = feedbackSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.rating !== undefined) updateData.feedbackRating = body.rating;
      if (body.comment !== undefined) updateData.feedbackComment = body.comment;
      if (body.verdict !== undefined) updateData.userFeedback = body.verdict;

      // If marked correct with high rating, auto-confirm
      if (body.verdict === 'correct' || (body.rating && body.rating >= 4)) {
        updateData.status = 'confirmed';
      } else if (body.verdict === 'wrong') {
        updateData.status = 'rejected';
      }

      const [updated] = await db
        .update(rootCauses)
        .set(updateData)
        .where(eq(rootCauses.id, id))
        .returning();

      if (!updated) {
        return { error: 'Root cause not found', statusCode: 404 };
      }

      return { data: updated };
    },
  );

  // ─── PATCH /root-causes/:id — general update ───────────────────
  const updateSchema = z.object({
    analysis: z.string().optional(),
    suggestedFix: z.string().optional(),
    confidence: z.number().min(0).max(100).optional(),
    feedbackRating: z.number().min(1).max(5).optional(),
    feedbackComment: z.string().optional(),
    status: z.enum(['pending', 'confirmed', 'rejected', 'analyzing', 'completed', 'failed']).optional(),
  });

  app.patch('/root-causes/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const { id } = request.params;
    const body = updateSchema.parse(request.body);

    const [updated] = await db
      .update(rootCauses)
      .set(body)
      .where(eq(rootCauses.id, id))
      .returning();

    if (!updated) {
      return { error: 'Root cause not found', statusCode: 404 };
    }

    return { data: updated };
  });

  // ─── GET /root-causes/similar/:errorId — find similar bugs (F8) 
  app.get(
    '/root-causes/similar/:errorId',
    async (request: FastifyRequest<{ Params: { errorId: string } }>) => {
      const { errorId } = request.params;

      const [error] = await db
        .select()
        .from(errors)
        .where(eq(errors.id, errorId))
        .limit(1);

      if (!error) {
        return { error: 'Error not found', statusCode: 404 };
      }

      const similar = await findSimilarBugs(
        errorId,
        error.projectId,
        error.type,
        error.message || '',
        error.file,
        10,
      );

      return { data: similar };
    },
  );

  // ─── POST /root-causes/:id/apply-fix — mark fix as applied (F8)
  app.post(
    '/root-causes/:id/apply-fix',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;

      const [updated] = await db
        .update(rootCauses)
        .set({ fixApplied: true, status: 'confirmed' })
        .where(eq(rootCauses.id, id))
        .returning();

      if (!updated) {
        return { error: 'Root cause not found', statusCode: 404 };
      }

      return { data: updated, message: 'Fix marked as applied' };
    },
  );

  // ─── GET /root-causes/stats — aggregate stats ─────────────────
  app.get('/root-causes/stats', async () => {
    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        confirmed: sql<number>`COUNT(*) FILTER (WHERE ${rootCauses.status} = 'confirmed')::int`,
        rejected: sql<number>`COUNT(*) FILTER (WHERE ${rootCauses.status} = 'rejected')::int`,
        pending: sql<number>`COUNT(*) FILTER (WHERE ${rootCauses.status} = 'pending')::int`,
        analyzing: sql<number>`COUNT(*) FILTER (WHERE ${rootCauses.status} = 'analyzing')::int`,
        avgConfidence: sql<number>`COALESCE(AVG(${rootCauses.confidence}), 0)::int`,
        withDeploy: sql<number>`COUNT(*) FILTER (WHERE ${rootCauses.deploymentId} IS NOT NULL)::int`,
        fixApplied: sql<number>`COUNT(*) FILTER (WHERE ${rootCauses.fixApplied} = true)::int`,
      })
      .from(rootCauses);

    return { data: stats };
  });
}
