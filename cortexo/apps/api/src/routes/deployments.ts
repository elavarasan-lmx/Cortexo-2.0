import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { logAudit } from './audit.js';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getOrgId, getUser } from '../lib/request-context.js';
import { deployments, deployTargets, servers, winbullConfigs, projects, deployConfigs } from '@cortexo/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { decrypt } from '../lib/crypto.js';
import type { SSHCredentials, DeployOptions } from '../lib/ssh-executor.js';
import { getDeployLogs, setDeployLogs, deleteDeployLogs } from '../lib/deploy-log-store.js';
import { executeDeployAsync } from '../lib/deploy-executor.js';

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
}).passthrough();  // Allow provisioning fields (database, nginx, pm2, permissions)

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
    try {
      const db = await getDb();
      const conditions: any[] = [];
      if (projectId) conditions.push(eq(deployments.projectId, projectId));
      if (status) conditions.push(eq(deployments.status, status as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;

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

    // 1. Try Redis first (live streaming logs)
    const entry = await getDeployLogs(id);
    if (entry) {
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
    }

    // 2. Fallback: Redis unavailable — check DB deployment status
    try {
      const db = await getDb();
      const deploy = await db.query.deployments.findFirst({
        where: (d: any, { eq: e }: any) => e(d.id, id),
      });

      if (!deploy) {
        return { logs: [], result: null, isRunning: false };
      }

      // Deploy finished (failed or success) — return full logs from DB
      if (deploy.status === 'failed' || deploy.status === 'success') {
        const dbLogs = (deploy as any).deployLogs || [];
        return {
          logs: dbLogs.length > 0
            ? dbLogs
            : deploy.commitMessage
              ? [{ step: deploy.status, command: '', stdout: deploy.commitMessage, stderr: '', exitCode: deploy.status === 'success' ? 0 : 1, durationMs: deploy.durationMs || 0, timestamp: (deploy.finishedAt || new Date()).toISOString() }]
              : [],
          result: {
            success: deploy.status === 'success',
            status: deploy.status,
            totalDurationMs: deploy.durationMs || 0,
            error: deploy.status === 'failed' ? (deploy.commitMessage || 'Deploy failed') : undefined,
            commitSha: deploy.commitSha || undefined,
          },
          isRunning: false,
        };
      }

      // Deploy still running in DB — tell frontend to keep polling
      return { logs: [], result: null, isRunning: true };
    } catch {
      // DB also failed — stop the spinner, don't leave it hanging
      return { logs: [], result: { success: false, status: 'failed', totalDurationMs: 0, error: 'Unable to fetch deploy status' }, isRunning: false };
    }
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

        const publicUser = server.publicAddress?.split('@')[0] || 'ubuntu';
        const publicHost = server.publicAddress?.split('@')[1] || '';
        targetName = server.name;

        // If server has BOTH publicAddress (jump host) and privateIp (target),
        // tunnel through the jump host to reach the private server.
        if (publicHost && server.privateIp) {
          sshCreds = {
            host: server.privateIp,
            port: 22,
            username: publicUser,
            privateKey: server.sshKey || undefined,
            jumpHost: {
              host: publicHost,
              port: 22,
              username: publicUser,
              privateKey: server.sshKey || undefined,
            },
          };
        } else {
          // Direct connection (no jump host)
          sshCreds = {
            host: publicHost || server.privateIp || '',
            port: 22,
            username: publicUser,
            privateKey: server.sshKey || undefined,
          };
        }
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
      // Look up project's repo URL for first-time clone
      const project = await db.query.projects.findFirst({
        where: (p, { eq }) => eq(p.id, parsed.data.projectId),
      });

      const deployOpts: DeployOptions & { _projectId?: string } = {
        remotePath: parsed.data.remotePath,
        repoUrl: project?.repoUrl || undefined,
        branch: parsed.data.branch,
        preDeployCmd: parsed.data.preDeployCmd,
        postDeployCmd: parsed.data.postDeployCmd,
        healthCheckUrl: parsed.data.healthCheckUrl,
        database: (parsed.data as any).database || undefined,
        sourceDatabase: (parsed.data as any).sourceDatabase || undefined,
        nginx: (parsed.data as any).nginx || undefined,
        permissions: (parsed.data as any).permissions || undefined,
        pm2: (parsed.data as any).pm2 || undefined,
        sourceTemplate: (parsed.data as any).sourceTemplate || undefined,
        _projectId: parsed.data.projectId,
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
