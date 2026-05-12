/**
 * Browser Testing Routes — Real QA Automation via Puppeteer
 * POST /browser-tests/run           — Run a browser test flow
 * GET  /browser-tests/flows         — List available flows
 * GET  /browser-tests/screenshot/:filename — Serve screenshot
 * POST /browser-tests/export-bugs   — Push failed steps to Bug Tracker
 * GET  /browser-tests/runs/:runId   — Get a stored browser test run
 */
import type { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { runBrowserTest, getAvailableFlows } from '../lib/browser-test-engine.js';
import { getDb } from '../lib/db.js';
import { testTargets, testRuns, errors, errorEvents, projects } from '@cortexo/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getOrgId } from '../lib/request-context.js';

const SCREENSHOT_DIR = path.resolve(process.cwd(), '../../.screenshots');

export async function browserTestRoutes(app: FastifyInstance) {

  // List available browser test flows
  app.get('/browser-tests/flows', async () => {
    return { data: getAvailableFlows() };
  });

  // Run a browser test
  app.post('/browser-tests/run', async (request, reply) => {
    const body = request.body as { flowId: string; targetId?: number; baseUrl?: string; customData?: Record<string, any> };

    let baseUrl = body.baseUrl;

    // If targetId provided, look up the URL
    if (body.targetId && !baseUrl) {
      const db = await getDb();
      const targets = await db.select().from(testTargets).where(eq(testTargets.id, body.targetId));
      if (targets.length) baseUrl = targets[0].baseUrl;
    }

    if (!baseUrl) return reply.code(400).send({ error: 'No baseUrl or valid targetId provided' });

    try {
      const result = await runBrowserTest(body.flowId, baseUrl, body.customData);

      // Store as a test run
      const db = await getDb();
      const [run] = await db.insert(testRuns).values({
        targetId: body.targetId || null,
        status: 'completed',
        runType: 'browser',
        total: result.total,
        passed: result.passed,
        failed: result.failed,
        durationMs: result.duration,
        summary: result as any,
      } as any).returning();

      return { data: { ...result, runId: run.id } };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  });

  // Run browser tests across multiple clients
  app.post('/browser-tests/run-multi', async (request, reply) => {
    const body = request.body as { flowId: string; targetIds: number[]; customData?: Record<string, any> };
    const db = await getDb();
    const targets = await db.select().from(testTargets).orderBy(desc(testTargets.createdAt));
    const selectedTargets = body.targetIds?.length
      ? targets.filter(t => body.targetIds.includes(t.id))
      : targets;

    if (!selectedTargets.length) return reply.code(400).send({ error: 'No targets found' });

    const results: any[] = [];
    for (const target of selectedTargets) {
      try {
        const result = await runBrowserTest(body.flowId, target.baseUrl, body.customData);
        results.push({ target: target.name, baseUrl: target.baseUrl, ...result });
      } catch (err: any) {
        results.push({ target: target.name, baseUrl: target.baseUrl, error: err.message, passed: 0, failed: 1 });
      }
    }

    return {
      data: {
        flow: body.flowId,
        totalClients: results.length,
        allPassed: results.filter(r => r.failed === 0).length,
        someFailed: results.filter(r => r.failed > 0).length,
        results,
      },
    };
  });

  // Serve screenshots
  app.get('/browser-tests/screenshot/:filename', async (request, reply) => {
    const { filename } = request.params as { filename: string };
    const filepath = path.join(SCREENSHOT_DIR, filename);
    if (!fs.existsSync(filepath)) return reply.code(404).send({ error: 'Screenshot not found' });
    const stream = fs.createReadStream(filepath);
    return reply.type('image/png').send(stream);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GET /browser-tests/runs/:runId — Fetch a stored browser test run
  // ═══════════════════════════════════════════════════════════════════════
  app.get('/browser-tests/runs/:runId', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const db = await getDb();

    const [run] = await db.select().from(testRuns).where(eq(testRuns.id, Number(runId)));
    if (!run) return reply.code(404).send({ error: 'Run not found' });

    // The summary field contains the full BrowserTestResult
    return { data: { ...(run.summary as any), runId: run.id } };
  });

  // ═══════════════════════════════════════════════════════════════════════
  // POST /browser-tests/export-bugs — Push failed steps to Bug Tracker
  // ═══════════════════════════════════════════════════════════════════════
  app.post('/browser-tests/export-bugs', async (request, reply) => {
    const body = request.body as {
      runId?: number;
      result?: {
        module: string; baseUrl: string; steps: Array<{
          step: number; name: string; status: string;
          duration: number; screenshot?: string;
          error?: string; details?: string;
          evidence?: Record<string, any>;
        }>;
      };
    };

    const orgId = getOrgId(request);

    try {
      const db = await getDb();

      // Get the result — either from the request body or from the DB
      let testResult = body.result;
      let runId = body.runId;

      if (!testResult && runId) {
        const [run] = await db.select().from(testRuns).where(eq(testRuns.id, runId));
        if (!run) return reply.code(404).send({ error: 'Run not found' });
        testResult = run.summary as any;
      }

      if (!testResult) return reply.code(400).send({ error: 'No result data or runId provided' });

      // Filter only failed steps
      const failedSteps = testResult.steps.filter(s => s.status === 'failed');
      if (failedSteps.length === 0) {
        return { success: true, exported: { created: 0, updated: 0, skipped: 0 }, total: 0, message: 'No failed steps to export' };
      }

      // Find the target name from the baseUrl
      const baseUrl = testResult.baseUrl || '';
      const allTargets = await db.select().from(testTargets);
      const matchedTarget = allTargets.find(t => baseUrl.includes(t.baseUrl) || t.baseUrl.includes(baseUrl));
      const targetName = matchedTarget?.name || new URL(baseUrl).hostname;

      // Find or create a project for browser testing
      let project = await db.query.projects.findFirst({
        where: (p: any, { and: andFn, eq: eqFn }: any) =>
          andFn(eqFn(p.orgId, orgId), eqFn(p.name, `Browser Testing: ${targetName}`)),
      });

      if (!project) {
        const projectId = crypto.randomUUID();
        const sdkKey = `browser_${crypto.randomBytes(24).toString('hex')}`;
        await db.insert(projects).values({
          id: projectId,
          orgId,
          name: `Browser Testing: ${targetName}`,
          description: `Auto-created project for browser test bugs from ${baseUrl}`,
          repoProvider: 'testing',
          repoUrl: baseUrl,
          sdkApiKey: sdkKey,
        } as any);
        project = await db.query.projects.findFirst({
          where: (p: any, { eq: eqFn }: any) => eqFn(p.id, projectId),
        });
      }

      if (!project) return reply.code(500).send({ error: 'Failed to create tracking project' });

      // Classify severity based on step error content
      function classifySeverity(step: typeof failedSteps[0]): string {
        const err = (step.error || '').toLowerCase();
        if (err.includes('critical') || err.includes('security') || err.includes('sql injection')) return 'critical';
        if (err.includes('empty registration succeeded') || err.includes('invalid') && err.includes('accepted')) return 'critical';
        if (err.includes('auth_bypass') || err.includes('password mismatch accepted')) return 'critical';
        if (err.includes('not found') || err.includes('missing') || err.includes('unreachable')) return 'error';
        if (err.includes('php error') || err.includes('500') || err.includes('server error')) return 'error';
        return 'warning';
      }

      // Classify bug type based on step name and error
      function classifyType(step: typeof failedSteps[0]): string {
        const err = (step.error || '').toLowerCase();
        const name = (step.name || '').toLowerCase();
        if (err.includes('sql injection') || err.includes('sql error')) return 'SQL Injection Vulnerability';
        if (err.includes('auth_bypass') || err.includes('accepted') && (name.includes('invalid') || name.includes('empty'))) return 'Input Validation Failure';
        if (err.includes('unreachable') || err.includes('connection')) return 'Connection Error';
        if (err.includes('not found') || err.includes('missing')) return 'Missing UI Element';
        if (err.includes('php error') || err.includes('fatal')) return 'PHP Runtime Error';
        if (name.includes('submit') || name.includes('form')) return 'Form Submission Error';
        if (name.includes('login') || name.includes('auth')) return 'Authentication Error';
        if (name.includes('register') || name.includes('registration')) return 'Registration Error';
        return 'Browser Test Failure';
      }

      // Insert into errors table with fingerprint deduplication
      let created = 0, updated = 0;

      for (const step of failedSteps) {
        const bugType = classifyType(step);
        const severity = classifySeverity(step);

        const fingerprint = crypto
          .createHash('sha256')
          .update(`browser:${testResult.module}:${step.name}:${step.error || ''}`)
          .digest('hex')
          .substring(0, 16);

        const existing = await db.query.errors.findFirst({
          where: (e: any, { and: andFn, eq: eqFn }: any) =>
            andFn(eqFn(e.projectId, project!.id), eqFn(e.fingerprint, fingerprint)),
        });

        if (existing) {
          // Update occurrence count + last seen
          await db.update(errors)
            .set({
              eventCount: (existing.eventCount || 0) + 1,
              lastSeenAt: new Date(),
            } as any)
            .where(eq(errors.id, existing.id));
          updated++;
        } else {
          // Create new error entry
          const errorId = crypto.randomUUID();
          await db.insert(errors).values({
            id: errorId,
            projectId: project!.id,
            orgId,
            fingerprint,
            type: bugType,
            message: `[Browser Test] Step #${step.step} "${step.name}" failed: ${step.error || 'Unknown error'}`,
            file: `${testResult.module}/${step.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
            severity,
            status: 'unresolved',
            module: testResult.module.replace('browser_', ''),
            eventCount: 1,
            tags: JSON.stringify([
              'browser-test',
              testResult.module,
              targetName,
              ...(runId ? [`run-${runId}`] : []),
            ]) as any,
            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
          } as any);

          // Create error event with full context
          await db.insert(errorEvents).values({
            errorId,
            projectId: project!.id,
            stackTrace: null,
            context: JSON.stringify({
              source: 'browser-test',
              runId: runId || null,
              flowModule: testResult.module,
              targetName,
              targetUrl: baseUrl,
              stepNumber: step.step,
              stepName: step.name,
              stepDuration: step.duration,
              screenshot: step.screenshot || null,
              screenshotUrl: step.screenshot ? `/v1/browser-tests/screenshot/${step.screenshot}` : null,
              error: step.error,
              details: step.details || null,
              evidence: step.evidence || null,
            }),
            environment: matchedTarget?.environment || 'staging',
            url: baseUrl,
            method: 'BROWSER',
          } as any);

          created++;
        }
      }

      return {
        success: true,
        exported: { created, updated, skipped: failedSteps.length - created - updated },
        total: failedSteps.length,
        project: { id: project!.id, name: project!.name },
        message: `Exported ${created} new bugs, updated ${updated} existing ones to Bug Tracker`,
      };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to export bugs to tracker' });
    }
  });
}
