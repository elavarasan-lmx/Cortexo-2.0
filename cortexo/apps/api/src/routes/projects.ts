import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq, sql } from 'drizzle-orm';
import { projects } from '@cortexo/db/schema';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { cacheFetch, cacheInvalidate } from '../lib/redis.js';
import { getOrgId } from '../lib/request-context.js';
import { logAudit } from './audit.js';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  repoUrl: z.string().url().optional(),
  repoProvider: z.enum(['github', 'gitlab', 'bitbucket']).default('github'),
  defaultBranch: z.string().default('main'),
  stack: z.string().optional(),
  description: z.string().optional(),
  settings: z.string().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

/**
 * Projects API — /v1/projects
 * CRUD operations for connected repositories.
 */
export async function projectRoutes(app: FastifyInstance) {
  // List all projects (paginated, cached, org-isolated)
  app.get('/projects', async (request, reply) => {
    const { page, limit, offset } = parsePagination(request.query as Record<string, unknown>);
    const orgId = getOrgId(request);
    try {
      const db = await getDb();
      const cacheKey = `projects:list:${orgId}:p${page}:l${limit}`;
      const where = eq(projects.orgId, orgId);

      const result = await cacheFetch(cacheKey, async () => {
        const [rows, countResult] = await Promise.all([
          db.select().from(projects)
            .where(where)
            .orderBy(sql`created_at DESC`)
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(projects).where(where),
        ]);
        const total = Number(countResult[0]?.count || 0);
        return paginatedResponse(rows, total, page, limit);
      }, 300); // 5 minute cache

      return result;
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch projects' });
    }
  });

  // ─── Validate Uniqueness ────────────────────────────────────────────────────
  // Checks if clientSlug, dbName, ports, or serverPath already exist in any project
  app.post('/projects/validate-unique', async (request, reply) => {
    const body = request.body as {
      clientSlug?: string;
      dbName?: string;
      wsPort?: string;
      socketIoPort?: string;
      serverPath?: string;
      excludeProjectId?: string; // for edit mode — skip self
    };

    try {
      const db = await getDb();
      const orgId = getOrgId(request);

      // Get all projects in this org with their settings
      const allProjects = await db
        .select({ id: projects.id, name: projects.name, settings: projects.settings })
        .from(projects)
        .where(eq(projects.orgId, orgId));

      const conflicts: Record<string, { field: string; existingProject: string; existingValue: string }> = {};

      for (const proj of allProjects) {
        if (body.excludeProjectId && proj.id === body.excludeProjectId) continue;
        const s = (proj.settings || {}) as Record<string, unknown>;
        const db_ = (s.database || {}) as Record<string, unknown>;
        const sock = (s.socket || {}) as Record<string, unknown>;
        const deploy = (s.deploy || {}) as Record<string, unknown>;

        // Check clientSlug
        if (body.clientSlug && s.clientSlug && String(s.clientSlug).toLowerCase() === body.clientSlug.toLowerCase()) {
          conflicts.clientSlug = { field: 'Client Slug', existingProject: proj.name, existingValue: String(s.clientSlug) };
        }

        // Check dbName
        if (body.dbName && db_.name && String(db_.name).toLowerCase() === body.dbName.toLowerCase()) {
          conflicts.dbName = { field: 'Database Name', existingProject: proj.name, existingValue: String(db_.name) };
        }

        // Check wsPort
        if (body.wsPort && sock.wsPort && String(sock.wsPort) === body.wsPort) {
          conflicts.wsPort = { field: 'WS Port', existingProject: proj.name, existingValue: String(sock.wsPort) };
        }

        // Check socketIoPort
        if (body.socketIoPort && sock.socketIoPort && String(sock.socketIoPort) === body.socketIoPort) {
          conflicts.socketIoPort = { field: 'Socket.IO Port', existingProject: proj.name, existingValue: String(sock.socketIoPort) };
        }

        // Check serverPath (folder name)
        if (body.serverPath && deploy.serverPath && String(deploy.serverPath).toLowerCase() === body.serverPath.toLowerCase()) {
          conflicts.serverPath = { field: 'Server Path', existingProject: proj.name, existingValue: String(deploy.serverPath) };
        }
      }

      const hasConflicts = Object.keys(conflicts).length > 0;
      return { data: { valid: !hasConflicts, conflicts } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Validation check failed' });
    }
  });

  // Get single project
  app.get('/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const project = await db.query.projects.findFirst({
        where: (p, { eq }) => eq(p.id, id),
      });
      if (!project) return reply.code(404).send({ error: 'Project not found' });
      return { data: project };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch project' });
    }
  });

  // Create project
  app.post('/projects', async (request, reply) => {
    const parsed = createProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const db = await getDb();
      const user = (request as any).user;
      const id = crypto.randomUUID();
      const sdkKey = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      await db.insert(projects).values({
        id,
        ...parsed.data,
        orgId: user?.orgId || getOrgId(request),
        sdkApiKey: sdkKey,
      } as any);

      // Invalidate project list cache
      await cacheInvalidate('projects:list:*');

      logAudit({
        action: 'project.created',
        resource: 'project',
        resourceId: id,
        userId: user?.id || 'system',
        description: `Created project "${parsed.data.name}"`,
        metadata: { name: parsed.data.name },
      });

      return reply.code(201).send({ data: { id, ...parsed.data } });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create project' });
    }
  });

  // Update project settings (support both PUT and PATCH)
  const updateHandler = async (request: any, reply: any) => {
    const { id } = request.params as { id: string };
    const parsed = updateProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const existing = await db.query.projects.findFirst({
        where: (p, { eq: eqFn }) => eqFn(p.id, id),
      });
      if (!existing) return reply.code(404).send({ error: 'Project not found' });
      const updateData: Record<string, unknown> = { ...parsed.data };
      if (typeof updateData.settings === 'string') {
        try { updateData.settings = JSON.parse(updateData.settings as string); } catch { /* keep as string */ }
      }
      await db.update(projects).set(updateData as any).where(eq(projects.id, id));

      await cacheInvalidate('projects:*');

      logAudit({
        action: 'project.updated',
        resource: 'project',
        resourceId: id,
        userId: (request as any).user?.id || 'system',
        description: `Updated project "${existing.name}"`,
      });

      return { data: { id, ...parsed.data, message: 'Project updated' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update project' });
    }
  };
  app.put('/projects/:id', updateHandler);
  app.patch('/projects/:id', updateHandler);

  // Delete project (cascade related records)
  app.delete('/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      // Delete related records first (foreign key constraints)
      const schema = await import('@cortexo/db/schema');
      await db.delete(schema.errorEvents).where(eq(schema.errorEvents.projectId, id));
      await db.delete(schema.rootCauses).where(eq(schema.rootCauses.projectId, id));
      await db.delete(schema.errors).where(eq(schema.errors.projectId, id));
      await db.delete(schema.pipelineRuns).where(eq(schema.pipelineRuns.projectId, id));
      await db.delete(schema.pipelines).where(eq(schema.pipelines.projectId, id));
      await db.delete(schema.deployments).where(eq(schema.deployments.projectId, id));
      await db.delete(projects).where(eq(projects.id, id));

      await cacheInvalidate('projects:*');

      logAudit({
        action: 'project.deleted',
        resource: 'project',
        resourceId: id,
        userId: (request as any).user?.id || 'system',
        description: `Deleted project #${id.slice(0, 8)}`,
      });

      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete project' });
    }
  });

  // Regenerate SDK API key
  app.post('/projects/:id/regenerate-key', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const { randomBytes } = await import('crypto');
      const newKey = `ctx_proj_${randomBytes(16).toString('hex')}`;
      await db.update(projects).set({ sdkApiKey: newKey } as any).where(eq(projects.id, id));

      await cacheInvalidate('projects:*');
      return { data: { id, apiKey: newKey } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to regenerate key' });
    }
  });
}
