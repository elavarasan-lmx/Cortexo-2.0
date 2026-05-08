import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { users } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Organization / Team Management API — /v1/org
 */
export async function orgRoutes(app: FastifyInstance) {

  // GET /org/members — List team members
  app.get('/org/members', async (request, reply) => {
    try {
      const db = await getDb();
      const orgId = (request as any).user?.orgId || '';

      // If orgId is set, filter by org; otherwise return all users (single-tenant / dev mode)
      const members = orgId
        ? await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            avatarUrl: users.avatarUrl,
            createdAt: users.createdAt,
            lastLoginAt: users.lastLoginAt,
          }).from(users).where(eq(users.orgId, orgId))
        : await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            avatarUrl: users.avatarUrl,
            createdAt: users.createdAt,
            lastLoginAt: users.lastLoginAt,
          }).from(users);

      return { data: members, total: members.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch members' });
    }
  });

  // POST /org/members/invite — Invite member by email
  const inviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'member', 'viewer']).default('member'),
  });

  app.post('/org/members/invite', async (request, reply) => {
    const parsed = inviteSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { email, role } = parsed.data;

    try {
      const db = await getDb();
      const orgId = (request as any).user?.orgId || 'default-org';

      // Check if user already exists
      const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (existing) return reply.code(409).send({ error: 'User already exists' });

      const inviteToken = crypto.randomBytes(32).toString('hex');
      const userId = crypto.randomUUID();

      await db.insert(users).values({
        id: userId,
        orgId,
        name: email.split('@')[0],
        email,
        role: role || 'member',
        inviteToken,
        invitedAt: new Date(),
      } as any);

      app.log.info(`Invite sent to ${email}, token: ${inviteToken}`);
      return reply.code(201).send({ data: { id: userId, email, role: role || 'member', status: 'invited' } });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to invite member' });
    }
  });

  // PUT /org/members/:id/role — Change member role
  const roleSchema = z.object({
    role: z.enum(['admin', 'member', 'viewer']),
  });

  app.put('/org/members/:id/role', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = roleSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { role } = parsed.data;

    try {
      const db = await getDb();
      await db.update(users).set({ role }).where(eq(users.id, id));
      return { data: { id, role } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update role' });
    }
  });

  // DELETE /org/members/:id — Remove member
  app.delete('/org/members/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      await db.delete(users).where(eq(users.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to remove member' });
    }
  });
}
