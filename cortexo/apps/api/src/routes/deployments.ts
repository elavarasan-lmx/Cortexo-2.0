import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { logAudit } from './audit.js';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getOrgId, getUser } from '../lib/request-context.js';
import { deployments, deployTargets, servers, winbullConfigs, projects, deployConfigs } from '@cortexo/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { decrypt } from '../lib/crypto.js';
import { runDeploySequence, type DeployLog, type DeployResult, type SSHCredentials, type DeployOptions } from '../lib/ssh-executor.js';
import { getRedis } from '../lib/redis.js';

// ── Redis-backed deploy log store ────────────────────────────────────────
// Survives server restarts. Logs expire after 2 hours via TTL.
const DEPLOY_LOG_PREFIX = 'cortexo:deploy-logs:';
const DEPLOY_LOG_TTL = 7200; // 2 hours

async function getDeployLogs(deploymentId: string): Promise<{ logs: DeployLog[]; result?: DeployResult } | null> {
  try {
    const redis = getRedis();
    const data = await redis.get(`${DEPLOY_LOG_PREFIX}${deploymentId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function setDeployLogs(deploymentId: string, entry: { logs: DeployLog[]; result?: DeployResult }): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(`${DEPLOY_LOG_PREFIX}${deploymentId}`, JSON.stringify(entry), 'EX', DEPLOY_LOG_TTL);
  } catch { /* best-effort — don't fail deploys if Redis has issues */ }
}

async function deleteDeployLogs(deploymentId: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(`${DEPLOY_LOG_PREFIX}${deploymentId}`);
  } catch { /* best-effort */ }
}

const createDeploySchema = z.object({
  projectId: z.string().min(1),
  branch: z.string().default('main'),
  environment: z.enum(['production', 'staging', 'development']).default('production'),
  // SSH target — either a deploy target ID or server ID
  deployTargetId: z.string().optional(),
  serverId: z.number().optional(),
  // Deploy config
  remotePath: z.string().min(1),
  preDeployCmd: z.string().optional(),
  postDeployCmd: z.string().optional(),
  healthCheckUrl: z.string().optional(),
});

/**
 * Deployments API — /v1/deployments
 * Real SSH deployment execution + management.
 */
export async function deploymentRoutes(app: FastifyInstance) {
  // ── Resolve deploy info for a project ───────────────────────
  // Maps project → server via WinBull config's serverIp field
  app.get('/deployments/resolve/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    try {
      const db = await getDb();

      // Get the project
      const project = await db.query.projects.findFirst({
        where: (p, { eq }) => eq(p.id, projectId),
      });
      if (!project) return reply.code(404).send({ error: 'Project not found' });

      // Extract slug from description (format: "Lite | ajbullion | https://...")
      const descParts = (project.description || '').split('|').map((s: string) => s.trim());
      const clientSlug = descParts[1] || project.name.toLowerCase().replace(/\s+/g, '');

      // 1. Check deploy_configs table first (canonical source)
      let dcConfig: any = null;
      try {
        const dcRows = await db.select().from(deployConfigs)
          .where(eq(deployConfigs.projectId, projectId))
          .limit(1);
        dcConfig = dcRows[0] || null;
      } catch { /* deploy_configs table may not exist yet */ }

      // 2. If deploy_configs has a serverId, use it directly
      let matchedServer: any = null;
      if (dcConfig?.serverId) {
        const srvRows = await db.select().from(servers)
          .where(eq(servers.id, dcConfig.serverId))
          .limit(1);
        matchedServer = srvRows[0] || null;
      }

      // 3. Fall back to WinBull config if no deploy_config match
      let wbConfig: any = null;
      if (!matchedServer) {
        try {
          const wbRows = await db.select().from(winbullConfigs)
            .where(eq(winbullConfigs.clientSlug, clientSlug))
            .limit(1);
          wbConfig = wbRows[0] || null;
        } catch { /* winbull_configs table may not exist yet */ }

        if (wbConfig?.serverIp) {
          const allServers = await db.select().from(servers);
          matchedServer = allServers.find(
            (s: any) => s.privateIp === wbConfig.serverIp || s.publicAddress?.includes(wbConfig.serverIp)
          );
        }
      }

      // Smart defaults for PHP projects
      const defaultPostDeploy = [
        'composer install --no-dev --optimize-autoloader 2>/dev/null || true',
        'php artisan config:clear 2>/dev/null || true',
        'php artisan cache:clear 2>/dev/null || true',
        'php artisan view:clear 2>/dev/null || true',
        'sudo systemctl reload php8.1-fpm 2>/dev/null || sudo systemctl reload php8.2-fpm 2>/dev/null || true',
      ].join(' && ');

      // Resolve domain from deploy_configs or winbull
      const domain = dcConfig?.domain || wbConfig?.domain || null;
      const deployPath = dcConfig?.deployPath || `/var/www/html/${clientSlug}`;
      const gitBranch = dcConfig?.gitBranch || project.defaultBranch || 'main';

      return {
        data: {
          projectId: project.id,
          projectName: project.name,
          clientSlug,
          branch: gitBranch,
          // Server mapping
          matchedServerId: matchedServer?.id || null,
          matchedServerName: matchedServer?.name || null,
          matchedServerIp: dcConfig?.serverIp || wbConfig?.serverIp || matchedServer?.privateIp || null,
          // Deploy defaults
          remotePath: deployPath,
          postDeployCmd: defaultPostDeploy,
          healthCheckUrl: domain ? `https://${domain.replace(/^https?:\/\//, '')}` : null,
          // Source info
          source: dcConfig ? 'deploy_configs' : wbConfig ? 'winbull_configs' : 'defaults',
          winbullStatus: wbConfig?.status || null,
          domain,
          // Extra from deploy_configs
          dbHost: dcConfig?.dbHost || null,
          dbName: dcConfig?.dbName || null,
          appFramework: dcConfig?.appFramework || null,
        },
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to resolve deploy info' });
    }
  });

  // ── List deployments (paginated, org-isolated) ─────────────
  app.get('/deployments', async (request, reply) => {
    const { projectId, status } = request.query as {
      projectId?: string; status?: string;
    };
    const { page, limit, offset } = parsePagination(request.query as Record<string, unknown>);
    const orgId = getOrgId(request);
    try {
      const db = await getDb();
      const conditions = [eq(deployments.orgId, orgId)];
      if (projectId) conditions.push(eq(deployments.projectId, projectId));
      if (status) conditions.push(eq(deployments.status, status as any));
      const where = and(...conditions);

      const [rows, countResult] = await Promise.all([
        db.select().from(deployments)
          .where(where)
          .orderBy(desc(deployments.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(deployments).where(where),
      ]);
      const total = Number(countResult[0]?.count || 0);
      return paginatedResponse(rows, total, page, limit);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch deployments' });
    }
  });

  // ── Get single deployment ──────────────────────────────────
  app.get('/deployments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const deployment = await db.query.deployments.findFirst({
        where: (d, { eq }) => eq(d.id, id),
      });
      if (!deployment) return reply.code(404).send({ error: 'Deployment not found' });
      return { data: deployment };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch deployment' });
    }
  });

  // ── Get deployment logs (from Redis) ────────────────────────
  app.get('/deployments/:id/logs', async (request, reply) => {
    const { id } = request.params as { id: string };
    const entry = await getDeployLogs(id);
    if (!entry) {
      return { logs: [], status: 'no_logs', message: 'No logs available for this deployment' };
    }
    return {
      logs: entry.logs,
      result: entry.result ? {
        success: entry.result.success,
        status: entry.result.status,
        totalDurationMs: entry.result.totalDurationMs,
        error: entry.result.error,
        commitSha: entry.result.commitSha,
      } : null,
      isRunning: !entry.result,
    };
  });

  // Delete a deployment record
  app.delete('/deployments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const existing = await db.query.deployments.findFirst({
        where: (d, { eq }) => eq(d.id, id),
      });
      if (!existing) return reply.code(404).send({ error: 'Deployment not found' });

      await db.delete(deployments).where(eq(deployments.id, id));
      await deleteDeployLogs(id);

      const user = getUser(request);
      logAudit({
        userId: user.sub,
        userName: user.name,
        action: 'delete',
        resource: 'deployment',
        resourceId: id,
        description: `Deleted deployment ${id}`,
        metadata: {},
        ipAddress: (request.ip || '') as string,
      });

      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete deployment' });
    }
  });

  // Update deployment details
  const updateDeploySchema = z.object({
    environment: z.string().optional(),
    branch: z.string().optional(),
    commitMessage: z.string().optional(),
    status: z.string().optional(),
    strategy: z.string().optional(),
  });

  app.put('/deployments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateDeploySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const existing = await db.query.deployments.findFirst({
        where: (d, { eq }) => eq(d.id, id),
      });
      if (!existing) return reply.code(404).send({ error: 'Deployment not found' });

      await db.update(deployments).set(parsed.data as any).where(eq(deployments.id, id));

      const updated = await db.query.deployments.findFirst({
        where: (d, { eq }) => eq(d.id, id),
      });
      return { data: updated };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update deployment' });
    }
  });

  // ── Execute deployment (real SSH) ──────────────────────────
  app.post('/deployments', async (request, reply) => {
    const parsed = createDeploySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const user = getUser(request);
    const orgId = getOrgId(request);

    try {
      const db = await getDb();
      const id = crypto.randomUUID();

      // ── Resolve SSH credentials ──
      let sshCreds: SSHCredentials | null = null;
      let targetName = 'unknown';

      if (parsed.data.serverId) {
        // Use server table
        const server = await db.query.servers.findFirst({
          where: (s, { eq }) => eq(s.id, parsed.data.serverId!),
        });
        if (!server) return reply.code(404).send({ error: 'Server not found' });

        const host = server.publicAddress?.split('@')[1] || server.privateIp || '';
        const username = server.publicAddress?.split('@')[0] || 'ubuntu';
        targetName = server.name;

        sshCreds = {
          host,
          port: 22,
          username,
          privateKey: server.sshKey || undefined,
        };
      } else if (parsed.data.deployTargetId) {
        // Use deploy target table (encrypted credentials)
        const target = await db.query.deployTargets.findFirst({
          where: (t, { eq }) => eq(t.id, parsed.data.deployTargetId!),
        });
        if (!target) return reply.code(404).send({ error: 'Deploy target not found' });

        targetName = target.name;
        sshCreds = {
          host: target.host,
          port: target.port || 22,
          username: target.username,
          privateKey: target.encryptedKey ? decrypt(target.encryptedKey) : undefined,
          password: target.encryptedPassword ? decrypt(target.encryptedPassword) : undefined,
        };
      } else {
        return reply.code(400).send({ error: 'Either serverId or deployTargetId is required' });
      }

      // ── Create deployment record ──
      await db.insert(deployments).values({
        id,
        projectId: parsed.data.projectId,
        orgId,
        deployTargetId: parsed.data.deployTargetId || null,
        environment: parsed.data.environment,
        status: 'running',
        branch: parsed.data.branch,
        deployedBy: user.sub,
        strategy: 'rolling',
        startedAt: new Date(),
      } as any);

      app.log.info({ id, projectId: parsed.data.projectId, target: targetName }, '🚀 Deployment started');

      // Initialize log store in Redis
      await setDeployLogs(id, { logs: [] });

      // ── Execute async (don't block HTTP response) ──
      const deployOpts: DeployOptions = {
        remotePath: parsed.data.remotePath,
        branch: parsed.data.branch,
        preDeployCmd: parsed.data.preDeployCmd,
        postDeployCmd: parsed.data.postDeployCmd,
        healthCheckUrl: parsed.data.healthCheckUrl,
      };

      // Fire and forget — the deploy runs in the background
      executeDeployAsync(app, db, id, sshCreds, deployOpts, user, targetName).catch(err => {
        app.log.error({ deploymentId: id, err }, 'Deploy async execution failed');
      });

      // Audit log
      logAudit({
        userId: user.sub,
        userName: user.name,
        action: 'deploy',
        resource: 'deployment',
        resourceId: id,
        description: `Started deploy of ${parsed.data.branch} to ${targetName} (${parsed.data.environment})`,
        metadata: { environment: parsed.data.environment, branch: parsed.data.branch, target: targetName },
        ipAddress: (request.ip || '') as string,
      });

      return reply.code(201).send({
        data: { id, status: 'running', branch: parsed.data.branch, environment: parsed.data.environment, target: targetName },
        message: `Deployment started on ${targetName}`,
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create deployment' });
    }
  });

  // ── Rollback deployment ────────────────────────────────────
  app.post('/deployments/:id/rollback', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const original = await db.query.deployments.findFirst({
        where: (d, { eq }) => eq(d.id, id),
      });
      if (!original) return reply.code(404).send({ error: 'Deployment not found' });

      const rollbackId = crypto.randomUUID();
      const user = getUser(request);

      await db.insert(deployments).values({
        id: rollbackId,
        projectId: original.projectId,
        orgId: original.orgId,
        deployTargetId: original.deployTargetId,
        environment: original.environment,
        branch: original.branch,
        commitSha: original.commitSha,
        commitMessage: `ROLLBACK: ${original.commitMessage || ''}`,
        status: 'pending',
        strategy: 'rolling',
        rollbackFromId: id,
        deployedBy: user.sub,
      } as any);

      app.log.info({ rollbackId, originalId: id }, 'Rollback deployment created');

      logAudit({
        userId: user.sub,
        userName: user.name,
        action: 'rollback',
        resource: 'deployment',
        resourceId: rollbackId,
        description: `Rolled back deployment ${id}`,
        metadata: { originalId: id },
        ipAddress: (request.ip || '') as string,
      });

      return reply.code(201).send({
        data: { id: rollbackId, status: 'pending', rollbackFrom: id },
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to rollback' });
    }
  });
}

// ── Background deploy executor ───────────────────────────────────

async function executeDeployAsync(
  app: FastifyInstance,
  db: any,
  deploymentId: string,
  creds: SSHCredentials,
  opts: DeployOptions,
  user: { sub: string; name: string },
  targetName: string,
) {
  try {
    const result = await runDeploySequence(creds, opts);

    // Store logs in Redis (survives restarts)
    await setDeployLogs(deploymentId, {
      logs: result.logs,
      result,
    });

    // Update deployment record
    await db.update(deployments)
      .set({
        status: result.success ? 'success' : 'failed',
        commitSha: result.commitSha || null,
        finishedAt: new Date(),
        durationMs: result.totalDurationMs,
        commitMessage: result.error || (result.success ? `Deployed ${opts.branch || 'main'} successfully` : null),
      } as any)
      .where(eq(deployments.id, deploymentId));

    if (result.success) {
      app.log.info({ deploymentId, durationMs: result.totalDurationMs, commitSha: result.commitSha }, '✅ Deployment succeeded');
    } else {
      app.log.error({ deploymentId, error: result.error }, '❌ Deployment failed');
    }

    // Audit the result
    logAudit({
      userId: user.sub,
      userName: user.name,
      action: result.success ? 'deploy_success' : 'deploy_failed',
      resource: 'deployment',
      resourceId: deploymentId,
      description: result.success
        ? `Deploy to ${targetName} completed in ${(result.totalDurationMs / 1000).toFixed(1)}s`
        : `Deploy to ${targetName} failed: ${result.error}`,
      metadata: { target: targetName, durationMs: result.totalDurationMs },
    });

    // Logs auto-expire via Redis TTL (2 hours) — no cleanup needed

  } catch (err: any) {
    app.log.error({ deploymentId, err }, 'Deploy execution threw');

    await db.update(deployments)
      .set({
        status: 'failed',
        finishedAt: new Date(),
        commitMessage: 'Internal deploy error',
      } as any)
      .where(eq(deployments.id, deploymentId));
  }
}
