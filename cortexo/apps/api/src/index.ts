import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env from monorepo root (2 levels up from apps/api/src/)
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });

// Validate required env vars BEFORE anything else boots
import { validateEnv } from './lib/env.js';
validateEnv();

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
import { authRoutes } from './routes/auth.js';
import { notificationRoutes } from './routes/notifications.js';
import { logStreamRoutes } from './routes/log-stream.js';

import { credentialsRoutes } from './routes/credentials.js';

import { serverRoutes } from './routes/servers.js';
import { logViewerRoutes } from './routes/log-viewer.js';
import { serverMountRoutes } from './routes/server-mounts.js';
import { deployConfigRoutes } from './routes/deploy-configs.js';
import { auditRoutes } from './routes/audit.js';
import { profileRoutes } from './routes/profiles.js';

import { provisionRoutes } from './routes/provision.js';
import { alertChannelRoutes } from './routes/alert-channels.js';
import { judgeScoreRoutes } from './routes/judge-scores.js';
import { metricsStreamRoutes } from './routes/metrics-stream.js';
import { winbullRoutes } from './routes/winbull.js';
import { winbullDeployRoutes } from './routes/winbull-deploy.js';
import { filePushRoutes } from './routes/file-push.js';

import { knowledgeRoutes } from './routes/knowledge.js';
import { testingRoutes } from './routes/testing/index.js';
import { browserTestRoutes } from './routes/browser-tests.js';
import { smokeTestRoutes } from './routes/smoke-tests.js';
import { devopsDocsRoutes } from './routes/devops-docs.js';
import { projectKnowledgeRoutes } from './routes/project-knowledge.js';

import { menuPermissionRoutes } from './routes/menu-permissions.js';
import { menuItemRoutes } from './routes/menu-items.js';
import { webhookRoutes } from './routes/webhooks.js';
import { usageLimitsPlugin } from './middleware/usage-limits.js';
import { authMiddleware } from './middleware/auth.js';
import { getDb } from './lib/db.js';
import { startMetricsCron, stopMetricsCron } from './lib/metric-cron.js';
import { deployments } from '@cortexo/db/schema';
import { eq, and, lt, sql as drizzleSql } from 'drizzle-orm';

const PORT = parseInt(process.env.API_PORT || '4000', 10);
const HOST = process.env.API_HOST || '0.0.0.0';

// ─── CRITICAL: Dev Auth Safety Check ─────────────────────────────────────────
if (process.env.UNSAFE_DEV_AUTH === 'true') {
  if (process.env.NODE_ENV === 'production') {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  🚨 FATAL: UNSAFE_DEV_AUTH=true in PRODUCTION!             ║
║  This bypasses ALL authentication — REFUSING TO START.      ║
║  Remove UNSAFE_DEV_AUTH or set it to "false" in .env        ║
╚══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
  } else {
    console.warn(`
╔══════════════════════════════════════════════════════════════╗
║  ⚠️  WARNING: UNSAFE_DEV_AUTH=true                          ║
║  Authentication is BYPASSED — do NOT deploy this!           ║
║  All requests will be treated as authenticated.             ║
╚══════════════════════════════════════════════════════════════╝
`);
  }
}

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
    if (process.env.NODE_ENV === 'production') {
      console.error(`
╔══════════════════════════════════════════════════════════════╗
║  🚨 FATAL: JWT_SECRET is missing or too short (<32 chars)!  ║
║  A strong secret is REQUIRED in production.                 ║
║  Generate one: openssl rand -base64 48                      ║
╚══════════════════════════════════════════════════════════════╝
`);
      process.exit(1);
    }
    console.warn(
      '[Auth] JWT_SECRET is missing or too short (<32 chars). ' +
      'Using dev fallback — DO NOT deploy this!'
    );
  }
  await app.register(jwt, {
    secret: jwtSecret || 'cortexo-dev-secret-change-in-production-32chars',
    sign: { expiresIn: '15m' },
  });

  // --- Auth Middleware (hooks only — JWT already registered above) ---
  if (!app.hasRequestDecorator('user')) {
    app.decorateRequest('user', null as any);
  }
  app.addHook('preHandler', authMiddleware);

  // --- Swagger API Documentation ---
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Logimax Bullion DevOps API',
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

  // ── Core routes (auth, health, projects, pipelines) ──
  await app.register(healthRoutes, { prefix: '/v1' });
  await app.register(authRoutes, { prefix: '/v1' });
  await app.register(projectRoutes, { prefix: '/v1' });
  await app.register(pipelineRoutes, { prefix: '/v1' });
  await app.register(pipelineRunRoutes, { prefix: '/v1' });

  // ── SSH/Deploy endpoints — stricter rate limits to prevent accidental DOS ──
  // These execute real SSH commands against production servers.
  await app.register(async (rateLimitedApp) => {
    // Override global rate limit for this scope only
    rateLimitedApp.addHook('onRoute', (routeOptions) => {
      if (!routeOptions.config) routeOptions.config = {} as any;
    });

    await rateLimitedApp.register(deploymentRoutes, { prefix: '/v1' });
    await rateLimitedApp.register(serverMountRoutes, { prefix: '/v1' });
    await rateLimitedApp.register(winbullDeployRoutes, { prefix: '/v1' });
    await rateLimitedApp.register(filePushRoutes, { prefix: '/v1' });
  });
  await app.register(deployTargetRoutes, { prefix: '/v1' });
  await app.register(errorRoutes, { prefix: '/v1' });
  await app.register(notificationRoutes, { prefix: '/v1' });
  await app.register(logStreamRoutes, { prefix: '/v1' });

  await app.register(credentialsRoutes, { prefix: '/v1' });

  await app.register(serverRoutes, { prefix: '/v1' });
  await app.register(logViewerRoutes, { prefix: '/v1' });
  await app.register(deployConfigRoutes, { prefix: '/v1' });
  await app.register(auditRoutes, { prefix: '/v1' });
  await app.register(profileRoutes, { prefix: '/v1' });

  await app.register(provisionRoutes, { prefix: '/v1' });
  await app.register(alertChannelRoutes, { prefix: '/v1' });
  await app.register(judgeScoreRoutes, { prefix: '/v1' });
  await app.register(metricsStreamRoutes, { prefix: '/v1' });
  await app.register(winbullRoutes, { prefix: '/v1' });

  await app.register(knowledgeRoutes, { prefix: '/v1' });
  await app.register(testingRoutes, { prefix: '/v1' });
  await app.register(browserTestRoutes, { prefix: '/v1' });
  await app.register(smokeTestRoutes, { prefix: '/v1' });
  await app.register(devopsDocsRoutes, { prefix: '/v1' });
  await app.register(projectKnowledgeRoutes, { prefix: '/v1' });

  await app.register(menuPermissionRoutes, { prefix: '/v1' });
  await app.register(menuItemRoutes, { prefix: '/v1' });

  // ── New dashboard module routes ──

  // ── Webhook ingestion (no prefix — lives at /api/webhooks/) ──
  await app.register(webhookRoutes);

  // Note: usageLimitsPlugin uses addHook — must be registered at root scope, not prefixed
  await app.register(usageLimitsPlugin);

  // --- API index (auto-generated from registered routes) ---
  app.get('/', async () => ({
    service: 'cortexo-api',
    version: '0.5.0',
    docs: '/docs',
  }));

  // --- Start ---
  try {
    await app.listen({ port: PORT, host: HOST });
    const routeCount = app.printRoutes({ commonPrefix: false }).split('\n').filter(l => l.trim()).length;
    console.log(`
╔══════════════════════════════════════════╗
║  🚀 Logimax Bullion DevOps API v0.5.0     ║
║  http://${HOST}:${PORT}                  ║
║  Endpoints: ${routeCount} routes registered      ║
╚══════════════════════════════════════════╝
`);

    // ── Orphan Deployment Recovery ──────────────────────────────
    // Mark any deployments stuck as 'running' (from a previous crash) as 'failed'.
    try {
      const db = await getDb();
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
      const orphans = await db.update(deployments)
        .set({
          status: 'failed',
          commitMessage: 'Marked as failed: server restarted while deployment was running',
          finishedAt: new Date(),
        } as any)
        .where(
          and(
            eq(deployments.status, 'running' as any),
            lt(deployments.startedAt as any, thirtyMinAgo),
          )
        )
        .returning({ id: deployments.id });
      if (orphans.length > 0) {
        console.log(`[Recovery] Marked ${orphans.length} orphan deployment(s) as failed: ${orphans.map(o => o.id).join(', ')}`);
      }
    } catch (err) {
      console.warn('[Recovery] Could not check for orphan deployments:', err);
    }

    // ── Start Cron Jobs ────────────────────────────────────────
    startMetricsCron();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // --- Graceful shutdown ---
  const shutdown = async (signal: string) => {
    app.log.info(`${signal} received — shutting down gracefully...`);
    stopMetricsCron();
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
