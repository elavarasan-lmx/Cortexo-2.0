/**
 * Request helpers — extract user context from authenticated requests.
 * Centralizes the (request as any).user pattern into typed helpers.
 */
import type { FastifyRequest } from 'fastify';
import type { JwtUser } from '../middleware/auth.js';

/**
 * Get the authenticated user from the request.
 * Returns the dev-user defaults when UNSAFE_DEV_AUTH is active.
 */
export function getUser(request: FastifyRequest): JwtUser {
  return (request as any).user || {
    sub: '00000000-0000-0000-0000-000000000000',
    email: 'dev@cortexo.local',
    name: 'Dev User',
    orgId: '00000000-0000-0000-0000-000000000000',
    role: 'admin',
  };
}

/**
 * Get the orgId from the authenticated user.
 * This is the primary function for data isolation — every list query
 * should filter by this value.
 */
export function getOrgId(request: FastifyRequest): string {
  return getUser(request).orgId;
}

/**
 * Get the userId from the authenticated user.
 */
export function getUserId(request: FastifyRequest): string {
  return getUser(request).sub;
}
