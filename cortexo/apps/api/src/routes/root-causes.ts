import { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb } from '../lib/db.js';
import { rootCauses, errors } from '@cortexo/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Root Cause Analysis routes.
 * Owns: root_causes table
 * Reads: errors (for linked error info)
 */
export async function rootCauseRoutes(app: FastifyInstance) {
  const db = await getDb();

  // GET /root-causes — list all root cause analyses for the org
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
          summary: rca.analysis?.slice(0, 120) || errorSummary?.message || 'Untitled Analysis',
          explanation: rca.analysis,
          error: errorSummary,
        };
      }),
    );

    return { data: enriched };
  });

  // GET /root-causes/:id — get single root cause detail
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

    return { data: rca };
  });

  // POST /root-causes — create a new manual RCA
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

  // PATCH /root-causes/:id — update RCA (feedback, status change)
  const updateSchema = z.object({
    analysis: z.string().optional(),
    suggestedFix: z.string().optional(),
    confidence: z.number().min(0).max(100).optional(),
    feedbackRating: z.number().min(1).max(5).optional(),
    feedbackComment: z.string().optional(),
    status: z.enum(['pending', 'confirmed', 'rejected', 'analyzing']).optional(),
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
}
