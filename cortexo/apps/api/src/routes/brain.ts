import { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb } from '../lib/db.js';
import { projectBrains, brainPatterns, brainViolations, projects } from '@cortexo/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { getOrgId } from '../lib/request-context.js';

async function requireProjectAccess(request: FastifyRequest, projectId: string) {
  const db = await getDb();
  const orgId = getOrgId(request);
  const [project] = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, orgId)));
  if (!project) throw new Error('Project not found or unauthorized');
  return project;
}

/**
 * Source Code Brain Routes — Sprint 6 (F9, F10, F11)
 */
export async function brainRoutes(app: FastifyInstance) {
  const db = await getDb();

  // ─── GET /projects/:id/brain — get brain status ──────────────────
  app.get(
    '/projects/:id/brain',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;
      await requireProjectAccess(request, id);

      const [brain] = await db
        .select()
        .from(projectBrains)
        .where(eq(projectBrains.projectId, id))
        .limit(1);

      if (!brain) {
        // Create initial pending brain if it doesn't exist
        const [newBrain] = await db.insert(projectBrains).values({
          projectId: id,
          status: 'pending',
          freshness: 0,
        }).returning();
        return { data: newBrain };
      }

      return { data: brain };
    },
  );

  // ─── POST /projects/:id/brain/scan — trigger full codebase scan ─
  app.post(
    '/projects/:id/brain/scan',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;
      await requireProjectAccess(request, id);

      // Update status to scanning
      const [brain] = await db
        .update(projectBrains)
        .set({ status: 'scanning' })
        .where(eq(projectBrains.projectId, id))
        .returning();

      // In a real app, this would enqueue a BullMQ job to run brain-scanner-worker
      // For now, we simulate a scan returning some default patterns
      
      // ... Worker simulation placeholder ...
      setTimeout(async () => {
        const _db = await getDb();
        await _db.update(projectBrains).set({
          status: 'ready',
          freshness: 100,
          lastScannedAt: new Date(),
          totalFilesScanned: 154,
          patternsDetected: 3,
        }).where(eq(projectBrains.projectId, id));
      }, 3000);

      return { data: brain, message: 'Scan initiated' };
    },
  );

  // ─── GET /projects/:id/brain/patterns — list all detected patterns
  app.get(
    '/projects/:id/brain/patterns',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;
      await requireProjectAccess(request, id);

      const [brain] = await db.select({ id: projectBrains.id }).from(projectBrains).where(eq(projectBrains.projectId, id)).limit(1);
      if (!brain) return { data: [] };

      const patterns = await db
        .select()
        .from(brainPatterns)
        .where(eq(brainPatterns.brainId, brain.id))
        .orderBy(desc(brainPatterns.createdAt));

      return { data: patterns };
    },
  );

  // ─── PUT /brain/patterns/:id — toggle/update pattern rule ───────
  const updatePatternSchema = z.object({
    enabled: z.boolean().optional(),
    severity: z.string().optional(),
    ruleRegex: z.string().optional(),
  });

  app.put(
    '/brain/patterns/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;
      const body = updatePatternSchema.parse(request.body);

      const [pattern] = await db
        .update(brainPatterns)
        .set(body)
        .where(eq(brainPatterns.id, id))
        .returning();

      if (!pattern) return { error: 'Pattern not found', statusCode: 404 };

      return { data: pattern };
    },
  );

  // ─── GET /projects/:id/brain/violations — list violations ───────
  app.get(
    '/projects/:id/brain/violations',
    async (request: FastifyRequest<{ Params: { id: string }, Querystring: { status?: string } }>) => {
      const { id } = request.params;
      const { status } = request.query;
      await requireProjectAccess(request, id);

      const [brain] = await db.select({ id: projectBrains.id }).from(projectBrains).where(eq(projectBrains.projectId, id)).limit(1);
      if (!brain) return { data: [] };

      const conditions = [eq(brainViolations.brainId, brain.id)];
      if (status) {
        conditions.push(eq(brainViolations.status, status));
      }

      const violations = await db
        .select({
          violation: brainViolations,
          pattern: brainPatterns,
        })
        .from(brainViolations)
        .leftJoin(brainPatterns, eq(brainPatterns.id, brainViolations.patternId))
        .where(and(...conditions))
        .orderBy(desc(brainViolations.createdAt));

      return { data: violations.map(v => ({ ...v.violation, pattern: v.pattern })) };
    },
  );

  // ─── POST /brain/violations/:id/ignore — ignore a violation ─────
  app.post(
    '/brain/violations/:id/ignore',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;

      const [violation] = await db
        .update(brainViolations)
        .set({ status: 'ignored' })
        .where(eq(brainViolations.id, id))
        .returning();

      if (!violation) return { error: 'Violation not found', statusCode: 404 };

      return { data: violation };
    },
  );

  // ─── GET /projects/:id/brain/docs — get AI-generated docs ───────
  app.get(
    '/projects/:id/brain/docs',
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = request.params;
      await requireProjectAccess(request, id);
      
      // Placeholder for F11 Docs feature
      return { 
        data: [
          { path: '/src/main.ts', docs: '# Main Entry Point\\nInitializes the app.' },
          { path: '/src/utils.ts', docs: '# Utils\\nHelper functions.' }
        ] 
      };
    },
  );
}
