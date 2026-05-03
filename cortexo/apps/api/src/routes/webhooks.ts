import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { getRedis } from '../lib/redis.js';

/**
 * Webhook routes — /v1/webhooks
 * GitHub push/PR events → trigger pipeline runs.
 * PR events also post a status comment back to GitHub via API.
 */

// Post a comment to a GitHub PR (non-blocking, best-effort)
async function postPrComment(repoFullName: string, prNumber: number, body: string): Promise<void> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token || !repoFullName || !prNumber) return;
  try {
    await fetch(`https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    });
  } catch { /* PR comment is best-effort */ }
}

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/webhooks/github', async (request, reply) => {
    const signature = request.headers['x-hub-signature-256'] as string;
    const event = request.headers['x-github-event'] as string;
    const deliveryId = request.headers['x-github-delivery'] as string;

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (secret && signature) {
      const body = JSON.stringify(request.body);
      const expected = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return reply.code(401).send({ error: 'Invalid webhook signature' });
      }
    }

    const payload = request.body as Record<string, any>;

    switch (event) {
      case 'push': {
        const branch = (payload.ref as string)?.replace('refs/heads/', '');
        const headCommit = payload.head_commit || payload.commits?.[0];
        const repo = payload.repository;

        app.log.info({ event: 'github.push', repo: repo?.full_name, branch, commit: headCommit?.id?.substring(0, 7) });

        const redis = getRedis();
        await redis.lpush('cortexo:webhook:queue', JSON.stringify({
          event: 'push', deliveryId,
          repoFullName: repo?.full_name, branch,
          commitSha: headCommit?.id, commitMessage: headCommit?.message,
          authorName: headCommit?.author?.name, authorEmail: headCommit?.author?.email,
          timestamp: new Date().toISOString(),
        }));

        return { status: 'queued', event: 'push', branch, commit: headCommit?.id?.substring(0, 7) };
      }

      case 'pull_request': {
        const action = payload.action;
        const pr = payload.pull_request;
        const repo = payload.repository;

        app.log.info({ event: 'github.pull_request', action, number: pr?.number, title: pr?.title?.substring(0, 60) });

        if (action === 'opened' || action === 'synchronize') {
          const redis = getRedis();
          await redis.lpush('cortexo:webhook:queue', JSON.stringify({
            event: 'pull_request', action, deliveryId,
            repoFullName: repo?.full_name, prNumber: pr?.number,
            branch: pr?.head?.ref, baseBranch: pr?.base?.ref,
            commitSha: pr?.head?.sha, title: pr?.title,
            timestamp: new Date().toISOString(),
          }));

          // Post CI status comment to PR
          const appUrl = process.env.APP_URL || 'http://localhost:3000';
          const commentBody = [
            `## 🧠 Cortexo CI/CD`,
            ``,
            `| | |`,
            `|---|---|`,
            `| **Branch** | \`${pr?.head?.ref}\` |`,
            `| **Commit** | \`${pr?.head?.sha?.slice(0, 7)}\` |`,
            `| **Status** | ⏳ Pipeline queued |`,
            ``,
            `[View pipeline logs →](${appUrl}/pipelines/runs)`,
            ``,
            `> *Powered by [Cortexo](${appUrl}) — AI-powered DevOps*`,
          ].join('\n');

          postPrComment(repo?.full_name, pr?.number, commentBody).catch(() => {});
        }

        return { status: 'received', event: 'pull_request', action };
      }

      case 'ping':
        app.log.info({ zen: payload.zen }, 'GitHub ping received');
        return { status: 'pong', zen: payload.zen };

      default:
        return { status: 'ignored', event };
    }
  });

  /**
   * POST /webhooks/gitlab — GitLab push/MR events
   */
  app.post('/webhooks/gitlab', async (request, reply) => {
    const payload = request.body as any;
    const event = request.headers['x-gitlab-event'] as string;

    app.log.info({ event }, 'GitLab webhook received');

    switch (event) {
      case 'Push Hook': {
        const branch = (payload.ref || '').replace('refs/heads/', '');
        const commits = payload.commits || [];
        const headCommit = commits[0];
        app.log.info({ branch, commitCount: commits.length }, 'GitLab push event');

        // Look up project by GitLab project ID and trigger pipeline
        try {
          const { getDb } = await import('../lib/db.js');
          const { projects } = await import('@cortexo/db/schema');
          const { eq } = await import('drizzle-orm');
          const db = await getDb();

          const project = await db.query.projects.findFirst({
            where: (p: any, { eq: eqFn }: any) => eqFn(p.gitlabProjectId, String(payload.project?.id)),
          });

          if (project) {
            const redis = getRedis();
            await redis.lpush('cortexo:webhook:queue', JSON.stringify({
              event: 'push',
              source: 'gitlab',
              deliveryId: request.headers['x-gitlab-event-uuid'] || crypto.randomUUID(),
              repoFullName: payload.project?.path_with_namespace,
              branch,
              commitSha: headCommit?.id,
              commitMessage: headCommit?.message,
              authorName: headCommit?.author?.name,
              authorEmail: headCommit?.author?.email,
              projectId: project.id,
              timestamp: new Date().toISOString(),
            }));
            app.log.info({ projectId: project.id, branch }, 'GitLab push queued for pipeline');
          } else {
            app.log.warn({ gitlabProjectId: payload.project?.id }, 'No matching Cortexo project for GitLab push');
          }
        } catch (err) {
          app.log.error(err, 'Failed to process GitLab push event');
        }

        return {
          status: 'received',
          event: 'push',
          branch,
          commits: commits.length,
          projectId: payload.project?.id,
        };
      }

      case 'Merge Request Hook': {
        const action = payload.object_attributes?.action || 'unknown';
        const mrTitle = payload.object_attributes?.title || '';
        const sourceBranch = payload.object_attributes?.source_branch || '';
        app.log.info({ action, mrTitle, sourceBranch }, 'GitLab MR event');

        return {
          status: 'received',
          event: 'merge_request',
          action,
          title: mrTitle,
          sourceBranch,
        };
      }

      default:
        return { status: 'ignored', event };
    }
  });
}
