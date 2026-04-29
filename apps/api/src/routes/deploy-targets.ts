import type { FastifyInstance } from 'fastify';
import { deployTargets } from '@cortexo/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { encrypt, decrypt } from '../lib/crypto.js';
import { testSSHConnection } from '../lib/ssh-executor.js';

const createTargetSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['ssh', 'sftp']).default('ssh'),
  host: z.string().min(1),
  port: z.number().default(22),
  username: z.string().min(1),
  authMethod: z.enum(['key', 'password']).default('key'),
  privateKey: z.string().optional(),
  password: z.string().optional(),
  remotePath: z.string().optional(),
  preDeployCmd: z.string().optional(),
  postDeployCmd: z.string().optional(),
});

/**
 * Deploy Targets API — /v1/deploy-targets
 * CRUD for SSH/SFTP server configurations.
 * Credentials are encrypted at rest.
 */
export async function deployTargetRoutes(app: FastifyInstance) {
  // List deploy targets (credentials omitted)
  app.get('/deploy-targets', async (request, reply) => {
    try {
      const db = await getDb();
      const targets = await db.query.deployTargets.findMany({
        orderBy: (t, { asc }) => [asc(t.name)],
      });

      // Strip encrypted fields
      const safe = targets.map(({ encryptedKey, encryptedPassword, ...t }) => ({
        ...t,
        hasKey: !!encryptedKey,
        hasPassword: !!encryptedPassword,
      }));

      return { data: safe, total: safe.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch deploy targets' });
    }
  });

  // Create deploy target
  app.post('/deploy-targets', async (request, reply) => {
    const parsed = createTargetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { privateKey, password, ...data } = parsed.data;

    try {
      const db = await getDb();
      const id = crypto.randomUUID();

      await db.insert(deployTargets).values({
        id,
        orgId: 'default-org',
        ...data,
        encryptedKey: privateKey ? encrypt(privateKey) : null,
        encryptedPassword: password ? encrypt(password) : null,
      } as any);

      app.log.info({ id, name: data.name, host: data.host }, 'Deploy target created');

      return reply.code(201).send({
        data: { id, ...data, hasKey: !!privateKey, hasPassword: !!password },
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create deploy target' });
    }
  });

  // Delete deploy target
  app.delete('/deploy-targets/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      await db.delete(deployTargets).where(eq(deployTargets.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete deploy target' });
    }
  });

  // ── Test SSH connection ────────────────────────────────────
  app.post('/deploy-targets/:id/test', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const target = await db.query.deployTargets.findFirst({
        where: (t, { eq }) => eq(t.id, id),
      });
      if (!target) return reply.code(404).send({ error: 'Deploy target not found' });

      app.log.info({ id, host: target.host }, 'Testing SSH connection');

      const result = await testSSHConnection({
        host: target.host,
        port: target.port || 22,
        username: target.username,
        privateKey: target.encryptedKey ? decrypt(target.encryptedKey) : undefined,
        password: target.encryptedPassword ? decrypt(target.encryptedPassword) : undefined,
      });

      return {
        success: result.success,
        message: result.message,
        details: result.details,
        durationMs: result.durationMs,
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Connection test failed' });
    }
  });

  // ── Test server connection (by server ID) ──────────────────
  app.post('/servers/:id/test-ssh', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const server = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, parseInt(id)),
      });
      if (!server) return reply.code(404).send({ error: 'Server not found' });

      const host = server.publicAddress?.split('@')[1] || server.privateIp || '';
      const username = server.publicAddress?.split('@')[0] || 'ubuntu';

      app.log.info({ id, host, username }, 'Testing SSH to server');

      const result = await testSSHConnection({
        host,
        port: 22,
        username,
        privateKey: server.sshKey || undefined,
      });

      return {
        success: result.success,
        message: result.message,
        details: result.details,
        durationMs: result.durationMs,
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Connection test failed' });
    }
  });
}
