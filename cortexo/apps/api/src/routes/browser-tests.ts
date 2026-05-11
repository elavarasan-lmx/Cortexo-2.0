/**
 * Browser Testing Routes — Real QA Automation via Puppeteer
 * POST /browser-tests/run     — Run a browser test flow
 * GET  /browser-tests/flows   — List available flows
 * GET  /browser-tests/screenshot/:filename — Serve screenshot
 */
import type { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { runBrowserTest, getAvailableFlows } from '../lib/browser-test-engine.js';
import { getDb } from '../lib/db.js';
import { testTargets, testRuns } from '@cortexo/db/schema';
import { eq, desc } from 'drizzle-orm';

const SCREENSHOT_DIR = path.resolve(process.cwd(), '../../.screenshots');

export async function browserTestRoutes(app: FastifyInstance) {

  // List available browser test flows
  app.get('/browser-tests/flows', async () => {
    return { data: getAvailableFlows() };
  });

  // Run a browser test
  app.post('/browser-tests/run', async (request, reply) => {
    const body = request.body as { flowId: string; targetId?: number; baseUrl?: string };

    let baseUrl = body.baseUrl;

    // If targetId provided, look up the URL
    if (body.targetId && !baseUrl) {
      const db = await getDb();
      const targets = await db.select().from(testTargets).where(eq(testTargets.id, body.targetId));
      if (targets.length) baseUrl = targets[0].baseUrl;
    }

    if (!baseUrl) return reply.code(400).send({ error: 'No baseUrl or valid targetId provided' });

    try {
      const result = await runBrowserTest(body.flowId, baseUrl);

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
    const body = request.body as { flowId: string; targetIds: number[] };
    const db = await getDb();
    const targets = await db.select().from(testTargets).orderBy(desc(testTargets.createdAt));
    const selectedTargets = body.targetIds?.length
      ? targets.filter(t => body.targetIds.includes(t.id))
      : targets;

    if (!selectedTargets.length) return reply.code(400).send({ error: 'No targets found' });

    const results: any[] = [];
    for (const target of selectedTargets) {
      try {
        const result = await runBrowserTest(body.flowId, target.baseUrl);
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
}
