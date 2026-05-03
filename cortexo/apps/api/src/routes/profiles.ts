/**
 * Profiles API — /v1/source-profiles & /v1/db-profiles
 * CRUD for reusable source repo and database credentials.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq } from 'drizzle-orm';
import { sourceProfiles, dbProfiles } from '@cortexo/db/schema';

const sourceSchema = z.object({
  name: z.string().min(1),
  repoUrl: z.string().min(1),
  branch: z.string().optional(),
  authType: z.enum(['token', 'ssh']).optional(),
  authValue: z.string().optional(),
  notes: z.string().optional(),
});

const dbSchema = z.object({
  name: z.string().min(1),
  host: z.string().min(1),
  port: z.number().optional(),
  username: z.string().min(1),
  password: z.string().optional(),
  databaseName: z.string().optional(),
  notes: z.string().optional(),
});

export async function profileRoutes(app: FastifyInstance) {

  // ═══════════════════════════════════════════════════════════════════
  //  SOURCE PROFILES
  // ═══════════════════════════════════════════════════════════════════

  app.get('/source-profiles', async (_req, reply) => {
    try {
      const db = await getDb();
      const rows = await db.select().from(sourceProfiles);
      return { data: rows };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch source profiles' });
    }
  });

  app.get('/source-profiles/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const db = await getDb();
      const [row] = await db.select().from(sourceProfiles).where(eq(sourceProfiles.id, id));
      if (!row) return reply.code(404).send({ error: 'Not found' });
      return { data: row };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch source profile' });
    }
  });

  app.post('/source-profiles', async (req, reply) => {
    const parsed = sourceSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    try {
      const db = await getDb();
      const id = crypto.randomUUID();
      await db.insert(sourceProfiles).values({ id, orgId: 'default-org', ...parsed.data });
      return { data: { id, ...parsed.data, message: 'Source profile created' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create source profile' });
    }
  });

  const updateSource = async (req: any, reply: any) => {
    const { id } = req.params as { id: string };
    const parsed = sourceSchema.partial().safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed' });
    try {
      const db = await getDb();
      await db.update(sourceProfiles).set(parsed.data as any).where(eq(sourceProfiles.id, id));
      return { data: { id, message: 'Source profile updated' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update source profile' });
    }
  };
  app.put('/source-profiles/:id', updateSource);
  app.patch('/source-profiles/:id', updateSource);

  app.delete('/source-profiles/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const db = await getDb();
      await db.delete(sourceProfiles).where(eq(sourceProfiles.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete source profile' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  //  DB PROFILES
  // ═══════════════════════════════════════════════════════════════════

  app.get('/db-profiles', async (_req, reply) => {
    try {
      const db = await getDb();
      const rows = await db.select().from(dbProfiles);
      return { data: rows };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch DB profiles' });
    }
  });

  app.get('/db-profiles/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const db = await getDb();
      const [row] = await db.select().from(dbProfiles).where(eq(dbProfiles.id, id));
      if (!row) return reply.code(404).send({ error: 'Not found' });
      return { data: row };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch DB profile' });
    }
  });

  app.post('/db-profiles', async (req, reply) => {
    const parsed = dbSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    try {
      const db = await getDb();
      const id = crypto.randomUUID();
      await db.insert(dbProfiles).values({ id, orgId: 'default-org', ...parsed.data });
      return { data: { id, ...parsed.data, message: 'DB profile created' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create DB profile' });
    }
  });

  const updateDb = async (req: any, reply: any) => {
    const { id } = req.params as { id: string };
    const parsed = dbSchema.partial().safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed' });
    try {
      const db = await getDb();
      await db.update(dbProfiles).set(parsed.data as any).where(eq(dbProfiles.id, id));
      return { data: { id, message: 'DB profile updated' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update DB profile' });
    }
  };
  app.put('/db-profiles/:id', updateDb);
  app.patch('/db-profiles/:id', updateDb);

  app.delete('/db-profiles/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const db = await getDb();
      await db.delete(dbProfiles).where(eq(dbProfiles.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete DB profile' });
    }
  });
}
