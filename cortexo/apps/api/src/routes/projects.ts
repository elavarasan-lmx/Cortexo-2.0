import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq, sql } from 'drizzle-orm';
import { projects } from '@cortexo/db/schema';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { cacheFetch, cacheInvalidate } from '../lib/redis.js';
import { logAudit } from './audit.js';
import { encrypt, decrypt } from '../lib/crypto.js';

// ─── Settings Encryption ─────────────────────────────────────────────────────
// Sensitive fields inside the JSONB `settings` column are encrypted at rest.
const SENSITIVE_TOP_KEYS = ['adminPassword'] as const;
const SENSITIVE_DB_KEYS = ['password'] as const;

function encryptSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const s = { ...settings };
  for (const key of SENSITIVE_TOP_KEYS) {
    if (s[key] && typeof s[key] === 'string') s[key] = encrypt(s[key] as string);
  }
  if (s.database && typeof s.database === 'object') {
    const db = { ...(s.database as Record<string, unknown>) };
    for (const key of SENSITIVE_DB_KEYS) {
      if (db[key] && typeof db[key] === 'string') db[key] = encrypt(db[key] as string);
    }
    s.database = db;
  }
  return s;
}

function decryptSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const s = { ...settings };
  for (const key of SENSITIVE_TOP_KEYS) {
    if (s[key] && typeof s[key] === 'string') {
      try { s[key] = decrypt(s[key] as string); } catch { /* not encrypted or legacy */ }
    }
  }
  if (s.database && typeof s.database === 'object') {
    const db = { ...(s.database as Record<string, unknown>) };
    for (const key of SENSITIVE_DB_KEYS) {
      if (db[key] && typeof db[key] === 'string') {
        try { db[key] = decrypt(db[key] as string); } catch { /* not encrypted or legacy */ }
      }
    }
    s.database = db;
  }
  return s;
}

function decryptProjectRow(row: Record<string, unknown>): Record<string, unknown> {
  if (row.settings && typeof row.settings === 'object') {
    return { ...row, settings: decryptSettings(row.settings as Record<string, unknown>) };
  }
  return row;
}

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  repoUrl: z.string().url().optional(),
  repoProvider: z.enum(['github', 'gitlab', 'bitbucket']).default('github'),
  defaultBranch: z.string().default('main'),
  stack: z.string().optional(),
  description: z.string().optional(),
  settings: z.string().optional(),
  healthScore: z.number().int().min(0).max(100).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

/**
 * Validates that settings.deploy.serverId references a real server.
 * Returns error message or null if valid.
 */
async function validateServerId(settings: Record<string, unknown>): Promise<string | null> {
  const deploy = settings?.deploy as Record<string, unknown> | undefined;
  if (!deploy?.serverId) return null;
  const serverId = parseInt(String(deploy.serverId));
  if (isNaN(serverId)) return `Invalid serverId: ${deploy.serverId}`;
  const db = await getDb();
  const { servers } = await import('@cortexo/db/schema');
  const server = await db.query.servers.findFirst({
    where: (s, { eq: eqFn }) => eqFn(s.id, serverId),
  });
  if (!server) return `Server #${serverId} not found — check server ID`;
  return null;
}

/**
 * Projects API — /v1/projects
 * CRUD operations for connected repositories.
 */
export async function projectRoutes(app: FastifyInstance) {
  // List all projects (paginated, cached, org-isolated)
  app.get('/projects', async (request, reply) => {
    const { page, limit, offset } = parsePagination(request.query as Record<string, unknown>);
    try {
      const db = await getDb();
      const cacheKey = `projects:list:p${page}:l${limit}`;

      const result = await cacheFetch(cacheKey, async () => {
        const [rows, countResult] = await Promise.all([
          db.select().from(projects)
            .orderBy(sql`created_at DESC`)
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(projects),
        ]);
        const total = Number(countResult[0]?.count || 0);
        const decrypted = rows.map(r => decryptProjectRow(r as Record<string, unknown>));
        return paginatedResponse(decrypted, total, page, limit);
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

      // Get all projects in this org with their settings
      const allProjects = await db
        .select({ id: projects.id, name: projects.name, settings: projects.settings })
        .from(projects);

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
      return { data: decryptProjectRow(project as Record<string, unknown>) };
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
      const insertData: Record<string, unknown> = {
        id,
        ...parsed.data,
        sdkApiKey: sdkKey,
      };
      // Validate serverId reference if present
      let settingsObj = insertData.settings;
      if (typeof settingsObj === 'string') { try { settingsObj = JSON.parse(settingsObj); } catch { settingsObj = null; } }
      if (settingsObj && typeof settingsObj === 'object') {
        const serverErr = await validateServerId(settingsObj as Record<string, unknown>);
        if (serverErr) return reply.code(400).send({ error: serverErr });
      }
      // Encrypt sensitive settings before storing
      if (insertData.settings && typeof insertData.settings === 'object') {
        insertData.settings = encryptSettings(insertData.settings as Record<string, unknown>);
      } else if (typeof insertData.settings === 'string') {
        try {
          const parsed = JSON.parse(insertData.settings as string);
          insertData.settings = encryptSettings(parsed);
        } catch { /* keep as string */ }
      }
      await db.insert(projects).values(insertData as any);

      // Invalidate project list cache
      await cacheInvalidate('projects:list:*');

      logAudit({
        action: 'project.created',
        resource: 'project',
        resourceId: id,
        userId: user?.id || 'system',
        userName: user?.name || 'System',
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
      const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
      if (typeof updateData.settings === 'string') {
        try { updateData.settings = JSON.parse(updateData.settings as string); } catch { /* keep as string */ }
      }
      // Validate serverId reference if present
      if (updateData.settings && typeof updateData.settings === 'object') {
        const serverErr = await validateServerId(updateData.settings as Record<string, unknown>);
        if (serverErr) return reply.code(400).send({ error: serverErr });
      }
      // Encrypt sensitive settings before storing
      if (updateData.settings && typeof updateData.settings === 'object') {
        updateData.settings = encryptSettings(updateData.settings as Record<string, unknown>);
      }
      await db.update(projects).set(updateData as any).where(eq(projects.id, id));

      await cacheInvalidate('projects:*');

      logAudit({
        action: 'project.updated',
        resource: 'project',
        resourceId: id,
        userId: (request as any).user?.id || 'system',
        userName: (request as any).user?.name || 'System',
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
      // ON DELETE CASCADE in schema handles related records automatically
      // (errors, errorEvents, rootCauses, pipelines, pipelineRuns, deployments)
      await db.delete(projects).where(eq(projects.id, id));

      await cacheInvalidate('projects:*');

      logAudit({
        action: 'project.deleted',
        resource: 'project',
        resourceId: id,
        userId: (request as any).user?.id || 'system',
        userName: (request as any).user?.name || 'System',
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
