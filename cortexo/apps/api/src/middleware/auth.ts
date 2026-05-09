import type { FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../lib/db.js';

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000000';

/**
 * JWT user payload — the decoded token content attached to every request.
 */
export interface JwtUser {
  sub: string;
  email: string;
  name: string;
  orgId: string;
  role: string;
}

/**
 * Auth middleware — verifies signed JWT tokens.
 * Extracts user info and attaches to request.
 *
 * Public paths are skipped (health, webhooks, ingest, auth).
 * Development bypass is controlled by UNSAFE_DEV_AUTH=true env flag.
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Skip auth for health checks, webhooks, SDK ingest, and auth endpoints
  const publicPaths = ['/v1/health', '/v1/webhooks/', '/v1/ingest/', '/v1/auth/'];
  const protectedAuthPaths = ['/v1/auth/me', '/v1/auth/profile', '/v1/auth/change-password'];
  const isProtectedAuth = protectedAuthPaths.some((p) => request.url.startsWith(p));
  const isPublic = !isProtectedAuth && publicPaths.some((p) => request.url.startsWith(p));

  if (isPublic || request.url === '/') return;

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Development bypass — only when explicitly opted in via env flag
    if (process.env.UNSAFE_DEV_AUTH === 'true') {
      // Load real user from database for dev mode so queries work correctly
      try {
        const db = await getDb();
        const devUser = await db.query.users.findFirst();
        if (devUser) {
          (request as any).user = {
            sub: devUser.id,
            email: devUser.email,
            name: devUser.name,
            orgId: devUser.orgId || DEV_ORG_ID,
            role: devUser.role || 'admin',
          } satisfies JwtUser;
        } else {
          (request as any).user = {
            sub: 'dev-user',
            email: 'dev@cortexo.local',
            name: 'Dev User',
            orgId: DEV_ORG_ID,
            role: 'admin',
          } satisfies JwtUser;
        }
      } catch {
        (request as any).user = {
          sub: 'dev-user',
          email: 'dev@cortexo.local',
          name: 'Dev User',
          orgId: DEV_ORG_ID,
          role: 'admin',
        } satisfies JwtUser;
      }
      return;
    }

    return reply.code(401).send({ error: 'Missing or invalid authorization header' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = request.server.jwt.verify<JwtUser>(token);
    (request as any).user = decoded;
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }
}


