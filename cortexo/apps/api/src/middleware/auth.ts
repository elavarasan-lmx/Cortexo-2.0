import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

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
  const isPublic = publicPaths.some((p) => request.url.startsWith(p));
  if (isPublic || request.url === '/') return;

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Development bypass — only when explicitly opted in via env flag
    if (process.env.UNSAFE_DEV_AUTH === 'true') {
      (request as any).user = {
        sub: 'dev-user',
        email: 'dev@cortexo.local',
        name: 'Dev User',
        orgId: 'default-org',
        role: 'admin',
      } satisfies JwtUser;
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

/**
 * Auth plugin — registers preHandler hook.
 * JWT is registered separately at root scope (in index.ts) so all
 * route plugins can access app.jwt for signing tokens.
 */
export async function authPlugin(app: FastifyInstance) {
  // Decorate request with user type (guard against duplicates —
  // @fastify/jwt may already decorate 'user')
  if (!app.hasRequestDecorator('user')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.decorateRequest('user', null as any);
  }

  // Add auth check hook
  app.addHook('preHandler', authMiddleware);
}
