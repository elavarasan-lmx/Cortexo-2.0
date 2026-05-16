import type { FastifyInstance } from 'fastify';
import { deployments } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '../routes/audit.js';
import { createNotification } from '../routes/notifications.js';
import { setDeployLogs } from './deploy-log-store.js';
import {
  runDeploySequence,
  runProvisionSequence,
  type DeployLog,
  type DeployResult,
  type SSHCredentials,
  type DeployOptions,
  type ProvisionOptions,
} from './ssh-executor.js';

/**
 * Background deploy executor — runs SSH deployment asynchronously
 * after the HTTP response is sent. Updates Redis logs for live terminal
 * streaming, then persists final result to DB + sends notifications.
 */
export async function executeDeployAsync(
  app: FastifyInstance,
  db: any,
  deploymentId: string,
  creds: SSHCredentials,
  opts: DeployOptions,
  user: { sub: string; name: string; orgId?: string },
  targetName: string,
) {
  try {
    // Progress callback: update Redis after each step so frontend sees live logs
    const onProgress = async (stepLogs: DeployLog[]) => {
      await setDeployLogs(deploymentId, { logs: [...stepLogs] });
    };

    // Determine if this is a first-time provisioning deploy (has sourceTemplate)
    let result: DeployResult;
    if (opts.sourceTemplate) {
      // Build ProvisionOptions from DeployOptions + project data
      const project = await db.query.projects.findFirst({
        where: (p: any, { eq }: any) => eq(p.id, (opts as any)._projectId),
      });
      const descParts = (project?.description || '').split('|').map((s: string) => s.trim());
      const clientSlug = descParts[1] || project?.name?.toLowerCase().replace(/\s+/g, '') || opts.remotePath.split('/').filter(Boolean).pop() || 'client';
      const clientName = project?.name || clientSlug;

      const provisionOpts: ProvisionOptions = {
        clientSlug,
        clientName,
        productType: (descParts[0]?.toLowerCase() || 'lite') as 'lite' | 'trade',
        remotePath: opts.remotePath,
        sourceTemplate: opts.sourceTemplate,  // Git-based clone (preferred)
        baseSourcePath: '/var/www/html/winbullSource',  // local fallback
        domain: opts.nginx?.domain || '',
        webTitle: (opts as any).webTitle,
        webCopyright: (opts as any).webCopyright,
        adminUser: (opts as any).adminUser,
        adminPassword: (opts as any).adminPassword,
        db: {
          host: opts.database?.host || '',
          port: opts.database?.port,
          user: opts.database?.user || '',
          password: opts.database?.password || '',
          targetName: opts.database?.name || clientSlug,
        },
        sourceDb: opts.sourceDatabase ? {
          host: opts.sourceDatabase.host,
          port: opts.sourceDatabase.port,
          user: opts.sourceDatabase.user,
          password: opts.sourceDatabase.password,
          name: opts.sourceDatabase.name,
        } : undefined,
        wsPort: opts.nginx?.wsPort || '',
        socketIoPort: opts.nginx?.socketPort || '',
        nginx: { phpVer: opts.nginx?.phpVer, autoGenerate: opts.nginx?.autoGenerate },
      };

      result = await runProvisionSequence(creds, provisionOpts, onProgress);
    } else {
      result = await runDeploySequence(creds, opts, onProgress);
    }

    // Store logs in Redis (survives restarts)
    await setDeployLogs(deploymentId, {
      logs: result.logs,
      result,
    });

    // Update deployment record — persist full logs to DB
    await db.update(deployments)
      .set({
        status: result.success ? 'success' : 'failed',
        commitSha: result.commitSha || null,
        finishedAt: new Date(),
        durationMs: result.totalDurationMs,
        commitMessage: result.error || (result.success ? `Deployed ${opts.branch || 'main'} successfully` : null),
        deployLogs: result.logs,
      } as any)
      .where(eq(deployments.id, deploymentId));

    if (result.success) {
      app.log.info({ deploymentId, durationMs: result.totalDurationMs, commitSha: result.commitSha }, '✅ Deployment succeeded');

      // In-app notification
      try {
        await createNotification({
          orgId: user.orgId,
          userId: user.sub,
          type: 'deploy.success',
          title: '✅ Deployment Successful',
          message: `Deploy to ${targetName} completed in ${(result.totalDurationMs / 1000).toFixed(1)}s${result.commitSha ? ` • ${result.commitSha}` : ''}`,
          link: `/deployments?id=${deploymentId}`,
        });
        app.log.info({ deploymentId }, '🔔 Deploy success notification created');
      } catch (notifErr) {
        app.log.warn({ notifErr }, '🔔 Failed to create notification');
      }

      // Email notification
      try {
        const { sendDeployEmail } = await import('./mailer.js');
        const emailTo = (user as any).email || undefined;
        app.log.info({ emailTo, userName: user.name }, '📧 Attempting deploy email...');
        await sendDeployEmail({
          to: emailTo,
          status: 'success',
          target: targetName,
          branch: opts.branch || 'main',
          commitSha: result.commitSha,
          durationMs: result.totalDurationMs,
          deploymentId,
        });
      } catch (emailErr) {
        app.log.warn({ emailErr }, '📧 Deploy email notification failed (non-fatal)');
      }
    } else {
      app.log.error({ deploymentId, error: result.error }, '❌ Deployment failed');

      // In-app notification
      try {
        await createNotification({
          orgId: user.orgId,
          userId: user.sub,
          type: 'deploy.failed',
          title: '❌ Deployment Failed',
          message: `Deploy to ${targetName} failed: ${result.error || 'Unknown error'}`,
          link: `/deployments?id=${deploymentId}`,
        });
        app.log.info({ deploymentId }, '🔔 Deploy failed notification created');
      } catch (notifErr) {
        app.log.warn({ notifErr }, '🔔 Failed to create notification');
      }

      // Email notification
      try {
        const { sendDeployEmail } = await import('./mailer.js');
        const emailTo = (user as any).email || undefined;
        await sendDeployEmail({
          to: emailTo,
          status: 'failed',
          target: targetName,
          branch: opts.branch || 'main',
          error: result.error,
          durationMs: result.totalDurationMs,
          deploymentId,
        });
      } catch (emailErr) {
        app.log.warn({ emailErr }, '📧 Deploy email notification failed (non-fatal)');
      }
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
