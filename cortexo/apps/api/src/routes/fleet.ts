import { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb } from '../lib/db.js';
import { projects, clientHealthScores, deployments, fixRollouts, errors } from '@cortexo/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { getOrgId } from '../lib/request-context.js';
import { z } from 'zod';

/**
 * Fleet & Health Routes — Sprint 5 (F31, F39)
 */
export async function fleetRoutes(app: FastifyInstance) {
  const db = await getDb();

  // ─── GET /fleet — get all clients with latest health score ──────
  app.get('/fleet', async (request: FastifyRequest) => {
    const orgId = getOrgId(request);

    // Get all projects for org with their latest health score
    const fleetQuery = await db.execute(sql`
      SELECT 
        p.id, 
        p.name, 
        p.repository_url as repo,
        (SELECT score FROM client_health_scores chs WHERE chs.project_id = p.id ORDER BY calculated_at DESC LIMIT 1) as health_score,
        (SELECT created_at FROM deployments d WHERE d.project_id = p.id AND d.status = 'success' ORDER BY created_at DESC LIMIT 1) as last_deploy,
        (SELECT COUNT(*) FROM fix_rollouts fr WHERE fr.client_project_id = p.id AND fr.status = 'pending') as pending_fixes,
        (SELECT COUNT(*) FROM errors e WHERE e.project_id = p.id AND e.status = 'open' AND e.severity IN ('critical', 'high')) as critical_errors
      FROM projects p
      WHERE p.org_id = ${orgId}
      ORDER BY health_score ASC NULLS LAST;
    `);

    return { data: fleetQuery.rows };
  });

  // ─── GET /fleet/:id/health-score — score history for one client ─
  app.get(
    '/fleet/:id/health-score',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;

      const history = await db
        .select()
        .from(clientHealthScores)
        .where(eq(clientHealthScores.projectId, id))
        .orderBy(desc(clientHealthScores.calculatedAt))
        .limit(30); // last 30 readings

      return { data: history };
    },
  );

  // ─── POST /fleet/:id/recalculate — force recalculate score ──────
  app.post(
    '/fleet/:id/recalculate',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;
      const orgId = getOrgId(request);

      // Simple placeholder logic for recalculation (full logic goes in health-scorer.ts worker)
      // Pull metrics
      const [errorCountResult] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(errors)
        .where(and(eq(errors.projectId, id), eq(errors.status, 'open')));
      
      const [pendingFixesResult] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(fixRollouts)
        .where(and(eq(fixRollouts.clientProjectId, id), eq(fixRollouts.status, 'pending')));

      const errorCount = errorCountResult?.count || 0;
      const pendingFixes = pendingFixesResult?.count || 0;

      // Base 100, subtract for issues
      let score = 100;
      
      // Error deduction (max 30)
      const errorScore = Math.max(0, 30 - (errorCount * 2));
      score -= (30 - errorScore);

      // Pending fix deduction (max 20)
      const pendingFixScore = Math.max(0, 20 - (pendingFixes * 5));
      score -= (20 - pendingFixScore);

      // Uptime/Dependency mock scores for now
      const uptimeScore = 30; // Perfect
      const dependencyScore = 20; // Perfect

      // Insert new reading
      const [newScore] = await db.insert(clientHealthScores).values({
        projectId: id,
        score: Math.max(0, score),
        errorScore,
        uptimeScore,
        dependencyScore,
        pendingFixScore,
      }).returning();

      return { data: newScore, message: 'Health score recalculated successfully' };
    },
  );
}
