import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import etag from '@fastify/etag';
import websocket from '@fastify/websocket';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/projects.js';
import { pipelineRoutes } from './routes/pipelines.js';
import { pipelineRunRoutes } from './routes/pipeline-runs.js';
import { deploymentRoutes } from './routes/deployments.js';
import { deployTargetRoutes } from './routes/deploy-targets.js';
import { errorRoutes } from './routes/errors.js';
import { webhookRoutes } from './routes/webhooks.js';
import { authRoutes } from './routes/auth.js';
import { notificationRoutes } from './routes/notifications.js';
import { logStreamRoutes } from './routes/log-stream.js';
import { integrationRoutes } from './routes/integrations.js';

import { credentialsRoutes } from './routes/credentials.js';
import { orgRoutes } from './routes/org.js';

import { syncRoutes } from './routes/sync.js';
import { serverRoutes } from './routes/servers.js';
import { logViewerRoutes } from './routes/log-viewer.js';
import { dbMigrationRoutes } from './routes/db-migration.js';

import { menuPermissionRoutes } from './routes/menu-permissions.js';
import { serverMountRoutes } from './routes/server-mounts.js';
import { deployConfigRoutes } from './routes/deploy-configs.js';
import { auditRoutes } from './routes/audit.js';
import { sourceRegistryRoutes } from './routes/source-registry.js';
import { profileRoutes } from './routes/profiles.js';
import { usageLimitsPlugin } from './middleware/usage-limits.js';
import { authPlugin } from './middleware/auth.js';

const PORT = parseInt(process.env.API_PORT || '4000', 10);
const HOST = process.env.API_HOST || '0.0.0.0';

async function start() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
    },
    // Structured logging: auto-generate request IDs for tracing
    genReqId: () => `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    requestIdLogLabel: 'requestId',
  });

  // --- Security: HTTP headers ---
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disabled for API-only server
  });

  // --- Performance: Response compression ---
  await app.register(compress, { global: true });

  // --- Performance: ETag caching ---
  await app.register(etag);

  // --- WebSocket support (for real-time log streaming, deploy progress) ---
  await app.register(websocket);

  // --- Security: Rate limiting ---
  await app.register(rateLimit, {
    max: 100,           // 100 requests per minute (global)
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
    // Stricter limits for auth endpoints (applied per-route below)
  });

  // --- CORS (hardened, multi-origin support) ---
  const corsOrigins = (process.env.CORS_ORIGINS || process.env.APP_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  await app.register(cors, {
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400, // Preflight cache: 24 hours
  });

  // --- JWT (registered at root scope so all routes can access app.jwt) ---
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    console.warn(
      '[Auth] JWT_SECRET is missing or too short (<32 chars). ' +
      'Set a strong JWT_SECRET in your .env for production security.'
    );
  }
  await app.register(jwt, {
    secret: jwtSecret || 'cortexo-dev-secret-change-in-production-32chars',
    sign: { expiresIn: '15m' },
  });

  // --- Auth Middleware (hooks only — JWT already registered above) ---
  await app.register(authPlugin);

  // --- Swagger API Documentation ---
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Cortexo API',
        description: 'DevOps Intelligence Platform API',
        version: '0.5.0',
      },
      servers: [{ url: `http://${HOST}:${PORT}`, description: 'Local' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { deepLinking: true, docExpansion: 'list' },
  });

  // --- Global Error Handler ---
  app.setErrorHandler((error: Error & { statusCode?: number; code?: string }, request, reply) => {
    const statusCode = error.statusCode || 500;
    const isServerError = statusCode >= 500;

    if (isServerError) {
      request.log.error({
        err: error,
        requestId: request.id,
        url: request.url,
        method: request.method,
      }, 'Unhandled server error');
    } else {
      request.log.warn({
        err: { message: error.message, code: error.code },
        requestId: request.id,
      }, 'Client error');
    }

    reply.code(statusCode).send({
      error: isServerError ? 'Internal Server Error' : error.message,
      statusCode,
      requestId: request.id,
      ...(process.env.NODE_ENV !== 'production' && isServerError ? { stack: error.stack } : {}),
    });
  });

  // --- API Routes (all prefixed with /v1) ---
  await app.register(healthRoutes, { prefix: '/v1' });
  await app.register(authRoutes, { prefix: '/v1' });
  await app.register(projectRoutes, { prefix: '/v1' });
  await app.register(pipelineRoutes, { prefix: '/v1' });
  await app.register(pipelineRunRoutes, { prefix: '/v1' });
  await app.register(deploymentRoutes, { prefix: '/v1' });
  await app.register(deployTargetRoutes, { prefix: '/v1' });
  await app.register(errorRoutes, { prefix: '/v1' });
  await app.register(webhookRoutes, { prefix: '/v1' });
  await app.register(notificationRoutes, { prefix: '/v1' });
  await app.register(logStreamRoutes, { prefix: '/v1' });
  await app.register(integrationRoutes, { prefix: '/v1' });

  await app.register(credentialsRoutes, { prefix: '/v1' });
  await app.register(orgRoutes, { prefix: '/v1' });

  await app.register(syncRoutes, { prefix: '/v1' });
  await app.register(serverRoutes, { prefix: '/v1' });
  await app.register(logViewerRoutes, { prefix: '/v1' });
  await app.register(dbMigrationRoutes, { prefix: '/v1' });

  await app.register(menuPermissionRoutes, { prefix: '/v1' });
  await app.register(serverMountRoutes, { prefix: '/v1' });
  await app.register(deployConfigRoutes, { prefix: '/v1' });
  await app.register(auditRoutes, { prefix: '/v1' });
  await app.register(sourceRegistryRoutes, { prefix: '/v1' });
  await app.register(profileRoutes, { prefix: '/v1' });
  // Note: usageLimitsPlugin uses addHook — must be registered at root scope, not prefixed
  await app.register(usageLimitsPlugin);

  // --- API index ---
  app.get('/', async () => ({
    service: 'cortexo-api',
    version: '0.5.0',
    endpoints: [
      'GET  /v1/health',
      'POST /v1/auth/register',
      'POST /v1/auth/login',
      'GET  /v1/auth/me',
      'GET  /v1/auth/github',
      'GET  /v1/auth/github/callback',
      'POST /v1/auth/refresh',
      'POST /v1/auth/forgot-password',
      'POST /v1/auth/reset-password',
      'GET  /v1/projects',
      'POST /v1/projects',
      'GET  /v1/projects/:id',
      'POST /v1/projects/:id/regenerate-key',
      'GET  /v1/pipelines',
      'POST /v1/pipelines',
      'POST /v1/pipelines/:id/run',
      'GET  /v1/pipeline-runs',
      'GET  /v1/pipeline-runs/:runId',
      'POST /v1/pipeline-runs/:runId/retry',
      'POST /v1/pipeline-runs/:runId/cancel',
      'GET  /v1/deployments',
      'POST /v1/deployments',
      'GET  /v1/deployments/:id',
      'GET  /v1/deployments/:id/logs',
      'GET  /v1/deployments/resolve/:projectId',
      'POST /v1/deployments/:id/rollback',
      'GET  /v1/deploy-targets',
      'POST /v1/deploy-targets',
      'POST /v1/deploy-targets/:id/test',
      'POST /v1/servers/:id/test-ssh',
      'GET  /v1/errors',
      'GET  /v1/errors/:id',
      'PATCH /v1/errors/:id',
      'POST /v1/errors/:id/assign',
      'GET  /v1/errors/:id/events',
      'POST /v1/ingest/error',
      'POST /v1/ingest/performance',
      'POST /v1/ingest/breadcrumb',
      'GET  /v1/notifications',
      'PATCH /v1/notifications/:id/read',
      'POST /v1/notifications/read-all',
      'POST /v1/webhooks/github',
      'POST /v1/webhooks/gitlab',
      'GET  /v1/org/members',
      'POST /v1/org/members/invite',
    ],
  }));

  // --- Start ---
  try {
    await app.listen({ port: PORT, host: HOST });
    const routeCount = app.printRoutes({ commonPrefix: false }).split('\n').filter(l => l.trim()).length;
    console.log(`
╔══════════════════════════════════════════╗
║  🚀 Cortexo API Server v0.5.0           ║
║  http://${HOST}:${PORT}                  ║
║  Endpoints: ${routeCount} routes registered      ║
╚══════════════════════════════════════════╝
`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // --- Graceful shutdown ---
  const shutdown = async (signal: string) => {
    app.log.info(`${signal} received — shutting down gracefully...`);
    try {
      await app.close();
      app.log.info('Server closed. Goodbye.');
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
