import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { winbullConfigs } from '@cortexo/db/schema';
import { getOrgId, getUserId } from '../lib/request-context.js';
import { createNotification } from './notifications.js';

// ── Schemas ────────────────────────────────────────────────────────
const createWinbullSchema = z.object({
  clientSlug: z.string().min(1).max(100),
  clientId: z.string().min(1).max(100),
  displayName: z.string().min(1).max(200),
  domain: z.string().max(255).optional(),
  configJson: z.record(z.unknown()).optional(),
  serverIp: z.string().max(45).optional(),
  migrationStatus: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
});

const updateWinbullSchema = createWinbullSchema.partial();

const batchUpdateSchema = z.object({
  slugs: z.array(z.string().min(1)).min(1, 'slugs array required'),
  updates: z.object({
    migrationStatus: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
    serverIp: z.string().max(45).optional(),
  }),
});

/**
 * WinBull Config Manager — /v1/winbull
 * Manages WinBull client configurations for deployment lookups.
 * Uses Drizzle ORM typed queries — NO raw SQL string concatenation.
 */
export async function winbullRoutes(app: FastifyInstance) {

  // ── List all configs ────────────────────────────────────────────
  app.get('/winbull', async (request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.select().from(winbullConfigs).orderBy(desc(winbullConfigs.createdAt));
      return { data: rows };
    } catch (err) {
      app.log.error(err, 'Failed to fetch winbull_configs');
      return reply.code(500).send({ error: 'Database error fetching configs' });
    }
  });

  // ── Get single config by slug ───────────────────────────────────
  app.get('/winbull/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    try {
      const db = await getDb();
      const [row] = await db.select().from(winbullConfigs).where(eq(winbullConfigs.clientSlug, slug)).limit(1);
      if (!row) return reply.code(404).send({ error: 'WinBull config not found' });
      return { data: row };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Create config ───────────────────────────────────────────────
  app.post('/winbull', async (request, reply) => {
    const parsed = createWinbullSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const userId = getUserId(request);
    try {
      const db = await getDb();
      const data = parsed.data;
      const [row] = await db.insert(winbullConfigs).values({
        clientSlug: data.clientSlug,
        clientId: data.clientId,
        displayName: data.displayName,
        domain: data.domain || null,
        configJson: data.configJson || {},
        serverIp: data.serverIp || null,
        migrationStatus: data.migrationStatus,
      }).returning();

      await createNotification({
        orgId: getOrgId(request),
        userId,
        type: 'config',
        title: 'WinBull Config Created',
        message: `Config for "${data.displayName}" (${data.clientSlug}) created`,
        link: `/clients`,
      });

      return reply.code(201).send({ data: row });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create config' });
    }
  });

  // ── Update config (parameterized — NO raw SQL) ─────────────────
  app.put('/winbull/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const parsed = updateWinbullSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const data = parsed.data;

      // Build update object with only provided fields
      const updates: Record<string, unknown> = {};
      if (data.displayName !== undefined) updates.displayName = data.displayName;
      if (data.domain !== undefined) updates.domain = data.domain;
      if (data.serverIp !== undefined) updates.serverIp = data.serverIp;
      if (data.migrationStatus !== undefined) updates.migrationStatus = data.migrationStatus;
      if (data.configJson !== undefined) updates.configJson = data.configJson;
      if (data.clientId !== undefined) updates.clientId = data.clientId;

      if (Object.keys(updates).length === 0) {
        return reply.code(400).send({ error: 'No fields to update' });
      }

      // Always set updatedAt on modification
      updates.updatedAt = new Date();

      const result = await db.update(winbullConfigs)
        .set(updates)
        .where(eq(winbullConfigs.clientSlug, slug))
        .returning();

      if (result.length === 0) {
        return reply.code(404).send({ error: 'Config not found' });
      }

      return { data: result[0], success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update config' });
    }
  });

  // ── Delete config ───────────────────────────────────────────────
  app.delete('/winbull/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    try {
      const db = await getDb();
      const deleted = await db.delete(winbullConfigs)
        .where(eq(winbullConfigs.clientSlug, slug))
        .returning();
      if (deleted.length === 0) {
        return reply.code(404).send({ error: 'Config not found' });
      }
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete config' });
    }
  });

  // ── Clone config ────────────────────────────────────────────────
  app.post('/winbull/:slug/clone', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const body = request.body as { newSlug: string; newName: string };
    if (!body.newSlug || !body.newName) {
      return reply.code(400).send({ error: 'newSlug and newName are required' });
    }
    try {
      const db = await getDb();
      // Fetch original using Drizzle
      const [src] = await db.select().from(winbullConfigs).where(eq(winbullConfigs.clientSlug, slug)).limit(1);
      if (!src) return reply.code(404).send({ error: 'Source config not found' });

      const [row] = await db.insert(winbullConfigs).values({
        clientSlug: body.newSlug,
        clientId: `${src.clientId}-clone`,
        displayName: body.newName,
        domain: src.domain,
        configJson: src.configJson || {},
        serverIp: src.serverIp,
        migrationStatus: 'pending',
      }).returning();

      return reply.code(201).send({ data: row });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to clone config' });
    }
  });

  // ── Validate config ─────────────────────────────────────────────
  app.post('/winbull/validate', async (request, reply) => {
    const parsed = createWinbullSchema.safeParse(request.body);
    if (!parsed.success) {
      return { valid: false, errors: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) };
    }
    return { valid: true, errors: [] };
  });

  // ── Batch update (parameterized — NO raw SQL) ──────────────────
  app.post('/winbull/batch/update', async (request, reply) => {
    const parsed = batchUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const { slugs, updates } = parsed.data;

      const updateFields: Record<string, unknown> = {};
      if (updates.migrationStatus !== undefined) updateFields.migrationStatus = updates.migrationStatus;
      if (updates.serverIp !== undefined) updateFields.serverIp = updates.serverIp;

      if (Object.keys(updateFields).length === 0) {
        return reply.code(400).send({ error: 'No valid update fields' });
      }

      updateFields.updatedAt = new Date();

      await db.update(winbullConfigs)
        .set(updateFields)
        .where(inArray(winbullConfigs.clientSlug, slugs));

      return { updated: slugs.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Batch update failed' });
    }
  });

  // ── Stats summary ───────────────────────────────────────────────
  app.get('/winbull/stats/summary', async (request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.select().from(winbullConfigs);

      const stats = {
        total: rows.length,
        completed: rows.filter(r => r.migrationStatus === 'completed').length,
        in_progress: rows.filter(r => r.migrationStatus === 'in_progress').length,
        pending: rows.filter(r => r.migrationStatus === 'pending').length,
        failed: rows.filter(r => r.migrationStatus === 'failed').length,
      };
      return stats;
    } catch (err) {
      app.log.error(err, 'Stats query failed');
      return reply.code(500).send({ error: 'Failed to fetch stats' });
    }
  });

  // ── Changelog ───────────────────────────────────────────────────
  app.get('/winbull/changelog', async (request, reply) => {
    const query = request.query as Record<string, string>;
    const limitVal = Math.min(parseInt(query.limit || '20', 10), 100);
    try {
      const db = await getDb();
      const [rows] = await db.execute(sql`
        SELECT * FROM audit_logs 
        WHERE action LIKE '%winbull%' OR action LIKE '%config%'
        ORDER BY created_at DESC 
        LIMIT ${limitVal}
      `) as any;
      return { data: rows || [] };
    } catch (err) {
      app.log.warn(err, 'Changelog query failed');
      return { data: [] };
    }
  });
}
