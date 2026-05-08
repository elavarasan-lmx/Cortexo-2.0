import { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb } from '../lib/db.js';
import { fixRecipes, fixRollouts, projects } from '@cortexo/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getOrgId } from '../lib/request-context.js';

/**
 * Fix Library routes — Sprint 4 (F29, F30, F32, F34)
 * Manages fix recipes and their propagation to client projects.
 */
export async function fixLibraryRoutes(app: FastifyInstance) {
  const db = await getDb();

  // ─── GET /fix-recipes — list all recipes ──────────────────────
  app.get('/fix-recipes', async (request: FastifyRequest) => {
    const orgId = getOrgId(request);
    const recipes = await db
      .select()
      .from(fixRecipes)
      .where(eq(fixRecipes.orgId, orgId))
      .orderBy(desc(fixRecipes.createdAt))
      .limit(100);

    return { data: recipes };
  });

  // ─── POST /fix-recipes — create recipe ────────────────────────
  const createSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    affectedFiles: z.array(z.string()).optional(),
    diffPatch: z.string().optional(),
    errorPattern: z.string().optional(),
    sourceProjectId: z.string().uuid().optional(),
  });

  app.post('/fix-recipes', async (request: FastifyRequest) => {
    const orgId = getOrgId(request);
    const body = createSchema.parse(request.body);

    // Count total target projects in org (excluding source)
    const allProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.orgId, orgId));

    const totalTargets = body.sourceProjectId
      ? allProjects.filter((p) => p.id !== body.sourceProjectId).length
      : allProjects.length;

    const [created] = await db
      .insert(fixRecipes)
      .values({
        orgId,
        title: body.title,
        description: body.description,
        affectedFiles: body.affectedFiles || [],
        diffPatch: body.diffPatch,
        errorPattern: body.errorPattern,
        sourceProjectId: body.sourceProjectId,
        totalTargets,
        status: 'active',
      })
      .returning();

    return { data: created };
  });

  // ─── GET /fix-recipes/:id — recipe detail + rollouts ──────────
  app.get(
    '/fix-recipes/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;

      const [recipe] = await db
        .select()
        .from(fixRecipes)
        .where(eq(fixRecipes.id, id))
        .limit(1);

      if (!recipe) return { error: 'Recipe not found', statusCode: 404 };

      // Get rollout summary
      const [summary] = await db
        .select({
          total: sql<number>`COUNT(*)::int`,
          applied: sql<number>`COUNT(*) FILTER (WHERE ${fixRollouts.status} = 'applied')::int`,
          pending: sql<number>`COUNT(*) FILTER (WHERE ${fixRollouts.status} = 'pending')::int`,
          failed: sql<number>`COUNT(*) FILTER (WHERE ${fixRollouts.status} = 'failed')::int`,
          rolledBack: sql<number>`COUNT(*) FILTER (WHERE ${fixRollouts.status} = 'rolled-back')::int`,
          skipped: sql<number>`COUNT(*) FILTER (WHERE ${fixRollouts.status} = 'skipped')::int`,
        })
        .from(fixRollouts)
        .where(eq(fixRollouts.recipeId, id));

      return { data: { ...recipe, rolloutSummary: summary } };
    },
  );

  // ─── POST /fix-recipes/:id/propagate — start propagation ──────
  const propagateSchema = z.object({
    clientIds: z.array(z.string().uuid()).optional(), // if empty → all eligible
  });

  app.post(
    '/fix-recipes/:id/propagate',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;
      const body = propagateSchema.parse(request.body);
      const orgId = getOrgId(request);

      const [recipe] = await db
        .select()
        .from(fixRecipes)
        .where(eq(fixRecipes.id, id))
        .limit(1);

      if (!recipe) return { error: 'Recipe not found', statusCode: 404 };

      // Get target projects
      let targets = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(eq(projects.orgId, orgId));

      // Exclude source project
      if (recipe.sourceProjectId) {
        targets = targets.filter((p) => p.id !== recipe.sourceProjectId);
      }

      // Filter by clientIds if specified
      if (body.clientIds && body.clientIds.length > 0) {
        targets = targets.filter((p) => body.clientIds!.includes(p.id));
      }

      // Create rollout entries for each target
      const rollouts = [];
      for (const target of targets) {
        // Check if rollout already exists
        const [existing] = await db
          .select()
          .from(fixRollouts)
          .where(
            and(
              eq(fixRollouts.recipeId, id),
              eq(fixRollouts.clientProjectId, target.id),
            ),
          )
          .limit(1);

        if (existing) {
          rollouts.push(existing);
          continue;
        }

        // Analyze compatibility (simplified — full version uses SSH file check)
        const conflictType = 'safe'; // TODO: use fix-propagator.ts for real analysis

        const [rollout] = await db
          .insert(fixRollouts)
          .values({
            recipeId: id,
            clientProjectId: target.id,
            conflictType,
            status: 'pending',
          })
          .returning();

        rollouts.push(rollout);
      }

      // Update recipe applied count
      await db.update(fixRecipes).set({
        totalTargets: targets.length,
      }).where(eq(fixRecipes.id, id));

      return {
        data: rollouts,
        message: `Propagation started for ${rollouts.length} clients`,
      };
    },
  );

  // ─── GET /fix-recipes/:id/rollouts — per-client status ────────
  app.get(
    '/fix-recipes/:id/rollouts',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;

      const rollouts = await db
        .select({
          id: fixRollouts.id,
          clientProjectId: fixRollouts.clientProjectId,
          status: fixRollouts.status,
          conflictType: fixRollouts.conflictType,
          failureReason: fixRollouts.failureReason,
          appliedAt: fixRollouts.appliedAt,
          rolledBackAt: fixRollouts.rolledBackAt,
          createdAt: fixRollouts.createdAt,
          projectName: projects.name,
        })
        .from(fixRollouts)
        .leftJoin(projects, eq(projects.id, fixRollouts.clientProjectId))
        .where(eq(fixRollouts.recipeId, id))
        .orderBy(fixRollouts.status);

      return { data: rollouts };
    },
  );

  // ─── POST /fix-rollouts/:id/rollback — rollback one client ────
  app.post(
    '/fix-rollouts/:id/rollback',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;

      const [updated] = await db
        .update(fixRollouts)
        .set({
          status: 'rolled-back',
          rolledBackAt: new Date(),
        })
        .where(eq(fixRollouts.id, id))
        .returning();

      if (!updated) return { error: 'Rollout not found', statusCode: 404 };

      return { data: updated };
    },
  );

  // ─── POST /fix-rollouts/rollback-all/:recipeId — rollback all ─
  app.post(
    '/fix-rollouts/rollback-all/:recipeId',
    async (request: FastifyRequest<{ Params: { recipeId: string } }>) => {
      const { recipeId } = request.params;

      await db
        .update(fixRollouts)
        .set({
          status: 'rolled-back',
          rolledBackAt: new Date(),
        })
        .where(
          and(
            eq(fixRollouts.recipeId, recipeId),
            eq(fixRollouts.status, 'applied'),
          ),
        );

      return { success: true, message: 'All applied rollouts rolled back' };
    },
  );

  // ─── GET /fix-recipes/stats — aggregate stats ─────────────────
  app.get('/fix-recipes/stats', async (request: FastifyRequest) => {
    const orgId = getOrgId(request);

    const [stats] = await db
      .select({
        totalRecipes: sql<number>`COUNT(*)::int`,
        activeRecipes: sql<number>`COUNT(*) FILTER (WHERE ${fixRecipes.status} = 'active')::int`,
        totalApplied: sql<number>`COALESCE(SUM(${fixRecipes.appliedCount}), 0)::int`,
        avgSuccessRate: sql<number>`COALESCE(AVG(${fixRecipes.successRate}), 0)::int`,
      })
      .from(fixRecipes)
      .where(eq(fixRecipes.orgId, orgId));

    return { data: stats };
  });
}
