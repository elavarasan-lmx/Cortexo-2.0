/**
 * Cortexo — Structured Error Codes
 *
 * Centralized, machine-readable error codes for API responses.
 * Usage: return reply.code(401).send({ error: ERR.AUTH_INVALID_CREDENTIALS, code: 'AUTH_INVALID_CREDENTIALS' });
 *
 * Naming convention: DOMAIN_SPECIFIC_ERROR
 *   AUTH_*       → Authentication / authorization
 *   PROJECT_*    → Projects domain
 *   DEPLOY_*     → Deployments domain
 *   PIPELINE_*   → Pipelines domain
 *   VALIDATION_* → Input validation
 *   SERVER_*     → Infrastructure / servers
 *   RATE_LIMIT_* → Rate limiting
 */

export const ERR = {
  // ── Auth ───────────────────────────────────────────────────────────────
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_EMAIL_ALREADY_EXISTS: 'Email already registered',
  AUTH_NOT_AUTHENTICATED: 'Not authenticated',
  AUTH_TOKEN_EXPIRED: 'Token expired, please log in again',
  AUTH_TOKEN_INVALID: 'Invalid or expired token',
  AUTH_FORBIDDEN: 'You do not have permission to perform this action',
  AUTH_PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  AUTH_WRONG_CURRENT_PASSWORD: 'Current password is incorrect',
  AUTH_OAUTH_FAILED: 'OAuth authentication failed',
  AUTH_REFRESH_INVALID: 'Invalid token type. Use a refresh token.',
  AUTH_USER_NOT_FOUND: 'User not found',

  // ── Validation ─────────────────────────────────────────────────────────
  VALIDATION_FAILED: 'Validation failed',
  VALIDATION_MISSING_FIELD: 'Required field is missing',
  VALIDATION_INVALID_FORMAT: 'Invalid field format',

  // ── Projects ───────────────────────────────────────────────────────────
  PROJECT_NOT_FOUND: 'Project not found',
  PROJECT_CREATE_FAILED: 'Failed to create project',
  PROJECT_DELETE_FAILED: 'Failed to delete project',
  PROJECT_NAME_TAKEN: 'A project with this name already exists',

  // ── Deployments ────────────────────────────────────────────────────────
  DEPLOY_NOT_FOUND: 'Deployment not found',
  DEPLOY_IN_PROGRESS: 'A deployment is already in progress',
  DEPLOY_FAILED: 'Deployment failed',
  DEPLOY_ROLLBACK_FAILED: 'Rollback failed',
  DEPLOY_TARGET_UNREACHABLE: 'Deploy target is unreachable',
  DEPLOY_SSH_CONNECTION_FAILED: 'SSH connection to server failed',

  // ── Pipelines ──────────────────────────────────────────────────────────
  PIPELINE_NOT_FOUND: 'Pipeline not found',
  PIPELINE_RUN_FAILED: 'Pipeline run failed',
  PIPELINE_ALREADY_RUNNING: 'Pipeline is already running',

  // ── Servers ────────────────────────────────────────────────────────────
  SERVER_NOT_FOUND: 'Server not found',
  SERVER_CONNECTION_FAILED: 'Failed to connect to server',
  SERVER_MOUNT_FAILED: 'Failed to mount server filesystem',

  // ── Errors ─────────────────────────────────────────────────────────────
  ERROR_NOT_FOUND: 'Error record not found',
  ERROR_ANALYSIS_FAILED: 'Root cause analysis failed',

  // ── Rate Limiting ──────────────────────────────────────────────────────
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',

  // ── Generic ────────────────────────────────────────────────────────────
  INTERNAL_ERROR: 'An internal server error occurred',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
} as const;

export type ErrorCode = keyof typeof ERR;

/**
 * Create a structured error response body.
 * Use: return reply.code(400).send(apiError('VALIDATION_FAILED', parsed.error.flatten()));
 */
export function apiError(code: ErrorCode, details?: unknown) {
  return {
    error: ERR[code],
    code,
    ...(details ? { details } : {}),
  };
}
