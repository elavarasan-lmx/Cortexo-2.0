import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and, desc, like, or, ne, sql } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { errors, errorEvents, deployments, rootCauses } from '@cortexo/db/schema';
// AI root cause analysis deferred — stub function
const analyzeRootCause = async (..._args: unknown[]) => {
  console.log('[AI] Root cause analysis not yet implemented');
};
import crypto from 'crypto';
import { sendCriticalErrorAlert } from '../lib/email.js';
import { incrementErrorCount } from '../middleware/usage-limits.js';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getOrgId } from '../lib/request-context.js';

// Post Slack error alert (non-blocking)
async function postSlackErrorAlert(opts: { errorType: string; message: string; projectName: string; errorId: string; severity: string }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  const color = opts.severity === 'critical' ? '#ef4444' : '#f97316';
  const emoji = opts.severity === 'critical' ? '🚨' : '⚠️';
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [{
          color,
          blocks: [
            { type: 'section', text: { type: 'mrkdwn', text: `${emoji} *New ${opts.severity} error in ${opts.projectName}*` } },
            { type: 'section', fields: [
              { type: 'mrkdwn', text: `*Type:*\n\`${opts.errorType}\`` },
              { type: 'mrkdwn', text: `*Message:*\n${opts.message.slice(0, 100)}` },
            ]},
            { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'View Error →' }, url: `${process.env.APP_URL || 'http://localhost:3000'}/errors/${opts.errorId}` }] },
          ],
        }],
      }),
    });
  } catch { /* Slack is best-effort */ }
}

// SDK error ingest payload schema
const ingestSchema = z.object({
  type: z.string().min(1),
  message: z.string().min(1),
  file: z.string().optional(),
  line: z.number().optional(),
  stackTrace: z.string().optional(),
  severity: z.enum(['critical', 'error', 'warning', 'info']).default('error'),
  context: z.record(z.unknown()).optional(),
  breadcrumbs: z.array(z.object({
    message: z.string(),
    category: z.string().optional(),
    data: z.record(z.unknown()).optional(),
    timestamp: z.string().optional(),
  })).optional(),
  userContext: z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
  environment: z.string().optional(),
  release: z.string().optional(),
  serverName: z.string().optional(),
  url: z.string().optional(),
  method: z.string().optional(),
  sdkVersion: z.string().optional(),
});

/**
 * Errors API — /v1/errors + /v1/ingest/error
 * Error tracking CRUD + SDK ingest endpoint.
 */
export async function errorRoutes(app: FastifyInstance) {
  // List errors (grouped, paginated, org-isolated)
  app.get('/errors', async (request, reply) => {
    const { projectId, status, severity } = request.query as {
      projectId?: string; status?: string; severity?: string;
    };
    const { page, limit, offset } = parsePagination(request.query as Record<string, unknown>);
    const orgId = getOrgId(request);
    try {
      const db = await getDb();
      const conditions = [eq(errors.orgId, orgId)];
      if (projectId) conditions.push(eq(errors.projectId, projectId));
      if (status) conditions.push(eq(errors.status, status as any));
      if (severity) conditions.push(eq(errors.severity, severity as any));

      const where = and(...conditions);

      const [rows, countResult] = await Promise.all([
        db.select().from(errors)
          .where(where)
          .orderBy(desc(errors.lastSeenAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(errors).where(where),
      ]);
      const total = Number(countResult[0]?.count || 0);
      return paginatedResponse(rows, total, page, limit);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch errors' });
    }
  });

  // Get single error with events
  app.get('/errors/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const error = await db.query.errors.findFirst({
        where: (e, { eq }) => eq(e.id, id),
      });
      if (!error) return reply.code(404).send({ error: 'Error not found' });

      const events = await db.query.errorEvents.findMany({
        where: (ev, { eq }) => eq(ev.errorId, id),
        orderBy: (ev, { desc }) => [desc(ev.createdAt)],
        limit: 20,
      });

      return { data: { ...error, events } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch error' });
    }
  });

  const errorUpdateSchema = z.object({
    status: z.string().optional(),
    assignedTo: z.string().optional(),
  });

  // Update error status (resolve, ignore, etc.) — PATCH
  app.patch('/errors/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = errorUpdateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { status, assignedTo } = parsed.data;
    try {
      const db = await getDb();
      await db.update(errors)
        .set({ status, assignedTo } as any)
        .where(eq(errors.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update error' });
    }
  });

  // PUT /errors/:id — Update error status (alias for PATCH, per API spec)
  app.put('/errors/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = errorUpdateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { status, assignedTo } = parsed.data;
    try {
      const db = await getDb();
      await db.update(errors)
        .set({ status, assignedTo } as any)
        .where(eq(errors.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update error' });
    }
  });

  /**
   * SDK Error Ingest — POST /v1/ingest/error
   *
   * Authenticated via X-Api-Key header (project SDK key).
   * Groups errors by fingerprint (type + file + line) for deduplication.
   * Increments event count on recurring errors.
   */
  app.post('/ingest/error', async (request, reply) => {
    const apiKey = request.headers['x-api-key'] as string;
    if (!apiKey) {
      return reply.code(401).send({ error: 'Missing X-Api-Key header' });
    }

    const parsed = ingestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const data = parsed.data;

    try {
      const db = await getDb();

      // Resolve project from SDK API key
      const project = await db.query.projects.findFirst({
        where: (p, { eq }) => eq(p.sdkApiKey, apiKey),
      });

      if (!project) {
        return reply.code(401).send({ error: 'Invalid API key' });
      }

      const { id: projectId, orgId } = project;

      // Fingerprint = sha256(type:file:line) — deduplicates same error location
      const fingerprint = crypto
        .createHash('sha256')
        .update(`${data.type}:${data.file || ''}:${data.line || ''}`)
        .digest('hex')
        .substring(0, 16);

      // Check if this error group already exists for this project
      const existing = await db.query.errors.findFirst({
        where: (e, { and, eq }) =>
          and(eq(e.projectId, projectId), eq(e.fingerprint, fingerprint)),
      });

      let errorId: string;

      if (existing) {
        // Recurring error — increment count + update timestamp
        errorId = existing.id;
        await db.update(errors)
          .set({
            eventCount: (existing.eventCount || 0) + 1,
            lastSeenAt: new Date(),
          } as any)
          .where(eq(errors.id, errorId));
      } else {
        // New error group
        errorId = crypto.randomUUID();
        await db.insert(errors).values({
          id: errorId,
          projectId,
          orgId,
          fingerprint,
          type: data.type,
          message: data.message,
          file: data.file,
          line: data.line,
          severity: data.severity,
          status: 'unresolved',
          eventCount: 1,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
        } as any);
      }

      // Always insert the individual event
      await db.insert(errorEvents).values({
        errorId,
        projectId,
        stackTrace: data.stackTrace,
        context: data.context ? JSON.stringify(data.context) : null,
        breadcrumbs: data.breadcrumbs ? JSON.stringify(data.breadcrumbs) : null,
        userContext: data.userContext ? JSON.stringify(data.userContext) : null,
        environment: data.environment,
        release: data.release,
        serverName: data.serverName,
        url: data.url,
        method: data.method,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        sdkVersion: data.sdkVersion,
      } as any);

      app.log.info({ fingerprint, errorId, type: data.type, project: project.name }, 'Error ingested');

      // Increment usage counter (for plan enforcement)
      incrementErrorCount((project as any).orgId || 'default');

      // ── Error → Deploy auto-correlation ─────────────────────────────────
      // Link this error to the most recent deployment for this project
      if (!existing) {
        try {
          const recentDeploy = await db.query.deployments?.findFirst({
            where: (d: any, { eq: eqFn }: any) => eqFn(d.projectId, projectId),
            orderBy: (d: any, { desc: descFn }: any) => [descFn(d.createdAt)],
          } as any);
          if (recentDeploy) {
            await db.update(errors)
              .set({ linkedDeployId: recentDeploy.id } as any)
              .where(eq(errors.id, errorId));
            app.log.info({ errorId, deployId: recentDeploy.id }, 'Error linked to deployment');
          }
        } catch { /* correlation is best-effort */ }
      }

      // Send email + Slack alert for NEW critical/error events (non-blocking)
      if (!existing && (data.severity === 'critical' || data.severity === 'error')) {
        const alertEmail = process.env.ALERT_EMAIL || (project as any).alertEmail;
        if (alertEmail) {
          sendCriticalErrorAlert({
            to: alertEmail,
            errorType: data.type,
            errorMessage: data.message,
            projectName: project.name,
            errorId,
            occurrences: 1,
            file: data.file,
            line: data.line,
          }).catch((e: Error) => app.log.warn('Email alert failed: ' + e.message));
        }
        // Slack alert (non-blocking)
        postSlackErrorAlert({
          errorType: data.type,
          message: data.message,
          projectName: project.name,
          errorId,
          severity: data.severity,
        }).catch(() => {});
      }

      return reply.code(202).send({
        status: 'received',
        fingerprint,
        errorId,
        isNew: !existing,
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to ingest error' });
    }
  });

  // ── Similar Bug Finder ────────────────────────────────────────────────────
  app.get('/errors/:id/similar', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const target = await db.query.errors.findFirst({ where: (e: any, { eq: eqFn }: any) => eqFn(e.id, id) });
      if (!target) return reply.code(404).send({ error: 'Error not found' });

      // Find errors with same type prefix OR same file
      const typePrefix = (target as any).type?.split('\\').pop()?.split('::')[0] || target.type;
      const similar = await db.select().from(errors)
        .where(
          and(
            ne(errors.id, id),
            eq(errors.projectId, (target as any).projectId),
            or(
              like(errors.type, `%${typePrefix}%`),
              (target as any).file ? like(errors.file as any, `%${(target as any).file?.split('/').pop()}%`) : undefined,
            ) as any,
          )
        )
        .orderBy(desc(errors.lastSeenAt))
        .limit(5);

      return { data: similar, query: { type: typePrefix, file: (target as any).file } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to find similar errors' });
    }
  });

  // Assign error to team member
  const assignSchema = z.object({
    userId: z.string().min(1),
    userName: z.string().optional(),
  });

  app.post('/errors/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = assignSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { userId, userName } = parsed.data;
    try {
      const db = await getDb();
      await db.update(errors).set({
        assignedTo: userId,
        assignedToName: userName || null,
      } as any).where(eq(errors.id, id));
      return { data: { id, assignedTo: userId } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to assign error' });
    }
  });

  // Get individual error occurrences/events
  app.get('/errors/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const row = await db.select().from(errors).where(eq(errors.id, id)).limit(1);
      if (!row[0]) return reply.code(404).send({ error: 'Error not found' });

      // Return event-level data from the error's metadata
      const events = (row[0] as any).events || [];
      return { data: events, total: events.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch events' });
    }
  });

  // POST /ingest/performance — Receive performance metrics from SDK
  app.post('/ingest/performance', async (request, reply) => {
    const payload = request.body as any;
    if (!payload) return reply.code(400).send({ error: 'Missing payload' });

    app.log.info({ type: 'performance_ingest', payload }, 'Performance data received');
    // TODO: Store to time-series DB
    return { status: 'received' };
  });

  // POST /ingest/breadcrumb — Batch breadcrumbs from SDK
  const breadcrumbSchema = z.object({
    breadcrumbs: z.array(z.any()).min(1),
    apiKey: z.string().optional(),
  });

  app.post('/ingest/breadcrumb', async (request, reply) => {
    const parsed = breadcrumbSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });

    app.log.info({ type: 'breadcrumb_ingest', count: parsed.data.breadcrumbs.length }, 'Breadcrumbs received');
    // TODO: Associate breadcrumbs with error events
    return { status: 'received', count: parsed.data.breadcrumbs.length };
  });

  // Fetch AI Root Cause
  app.get('/errors/:id/root-cause', async (request, reply) => {
    const { id } = request.params as { id: string };
    const orgId = getOrgId(request);

    try {
      const db = await getDb();
      
      const analysis = await db.query.rootCauses.findFirst({
        where: (rc, { eq, and }) => and(eq(rc.errorId, id), eq(rc.orgId, orgId)),
        orderBy: (rc, { desc }) => [desc(rc.createdAt)]
      });

      if (!analysis) {
        return reply.code(404).send({ error: 'Root cause analysis not found for this error' });
      }

      return { data: analysis };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch root cause analysis' });
    }
  });

  // Trigger AI Root Cause Analysis
  app.post('/errors/:id/analyze', async (request, reply) => {
    const { id } = request.params as { id: string };
    const orgId = getOrgId(request);

    try {
      const db = await getDb();
      const errorGroup = await db.query.errors.findFirst({
        where: (e, { eq, and }) => and(eq(e.id, id), eq(e.orgId, orgId))
      });

      if (!errorGroup) {
        return reply.code(404).send({ error: 'Error not found' });
      }

      const existingPending = await db.query.rootCauses.findFirst({
        where: (rc, { eq, and }) => and(
          eq(rc.errorId, id),
          eq(rc.status, 'pending')
        )
      });

      if (existingPending) {
        return reply.code(409).send({ error: 'An analysis is already pending for this error' });
      }

      const rootCauseId = crypto.randomUUID();
      await db.insert(rootCauses).values({
        id: rootCauseId,
        errorId: id,
        projectId: errorGroup.projectId,
        orgId: errorGroup.orgId,
        status: 'pending'
      } as any);

      analyzeRootCause(id, rootCauseId, errorGroup.projectId, orgId).catch((err) => {
        app.log.error(err, `Root cause analysis failed for error ${id}`);
      });

      return reply.code(202).send({ 
        message: 'Root cause analysis triggered',
        rootCauseId 
      });
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to trigger analysis' });
    }
  });

  // ── Cross-Client Error Intelligence ──────────────────────────────────────
  /**
   * Find this error's fingerprint across ALL projects/clients.
   * Since all 70+ Winbull clients run the same codebase, the same bug
   * will produce the same fingerprint on every affected client.
   *
   * Returns: list of projects/clients where this error also occurs,
   * with event counts and last-seen timestamps.
   */
  app.get('/errors/:id/cross-client', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();

      // Get the target error's fingerprint
      const target = await db.query.errors.findFirst({
        where: (e: any, { eq: eqFn }: any) => eqFn(e.id, id),
      });
      if (!target) return reply.code(404).send({ error: 'Error not found' });

      // Find all errors with the same fingerprint across ALL projects
      const matches = await db.select({
        id: errors.id,
        projectId: errors.projectId,
        fingerprint: errors.fingerprint,
        type: errors.type,
        message: errors.message,
        file: errors.file,
        line: errors.line,
        severity: errors.severity,
        status: errors.status,
        eventCount: errors.eventCount,
        firstSeenAt: errors.firstSeenAt,
        lastSeenAt: errors.lastSeenAt,
      })
        .from(errors)
        .where(eq(errors.fingerprint, target.fingerprint))
        .orderBy(desc(errors.lastSeenAt))
        .limit(100);

      // Resolve project names for context
      const projectIds = [...new Set(matches.map(m => m.projectId))];
      let projectLookup: Record<string, string> = {};
      if (projectIds.length > 0) {
        try {
          const { projects } = await import('@cortexo/db/schema');
          for (const pid of projectIds) {
            const proj = await db.query.projects.findFirst({
              where: (p: any, { eq: eqFn }: any) => eqFn(p.id, pid),
            });
            if (proj) projectLookup[pid] = proj.name;
          }
        } catch { /* project lookup is best-effort */ }
      }

      const enriched = matches.map(m => ({
        ...m,
        projectName: projectLookup[m.projectId] || m.projectId,
        isSelf: m.id === id,
      }));

      const totalAffected = enriched.filter(e => !e.isSelf).length;
      const totalEvents = enriched.reduce((sum, e) => sum + (e.eventCount || 0), 0);

      return reply.send({
        data: {
          fingerprint: target.fingerprint,
          type: target.type,
          affectedClients: totalAffected,
          totalEventsAcrossClients: totalEvents,
          isFleetWideBug: totalAffected >= 3,
          matches: enriched,
        },
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to find cross-client errors' });
    }
  });
}

