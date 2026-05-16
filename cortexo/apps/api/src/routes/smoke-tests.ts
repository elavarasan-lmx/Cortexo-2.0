/**
 * Smoke Testing Routes — Playwright-powered DevOps health checks
 *
 * POST /smoke-tests/run            — Run a smoke test (probe/login/responsive/links)
 * GET  /smoke-tests/types          — List available test types
 * GET  /smoke-tests/runs           — Get smoke test run history
 * GET  /smoke-tests/runs/:id       — Get a specific run's details
 * GET  /smoke-tests/screenshot/:filename — Serve screenshot
 */
import type { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import {
  runProbeTest,
  runLoginTest,
  runResponsiveTest,
  runLinksTest,
  getAvailableSmokeTests,
  type SmokeTestResult,
  type LoginConfig,
} from '../lib/smoke-test-engine.js';
import { getDb } from '../lib/db.js';
import { testTargets, testRuns } from '@cortexo/db/schema';
import { eq, desc } from 'drizzle-orm';

const SCREENSHOT_DIR = path.resolve(process.cwd(), '../../.screenshots');

// In-memory store for smoke test results (lightweight, no new DB tables needed)
// We reuse testRuns table with runType = 'smoke-*'
const recentSmokeRuns: SmokeTestResult[] = [];
const MAX_RECENT = 50;

function pushResult(result: SmokeTestResult) {
  recentSmokeRuns.unshift(result);
  if (recentSmokeRuns.length > MAX_RECENT) recentSmokeRuns.pop();
}

export async function smokeTestRoutes(app: FastifyInstance) {

  // List available smoke test types
  app.get('/smoke-tests/types', async () => {
    return { data: getAvailableSmokeTests() };
  });

  // Run a smoke test
  app.post('/smoke-tests/run', async (request, reply) => {
    const body = request.body as {
      testType: string;
      targetId?: number;
      baseUrl?: string;
      loginConfig?: LoginConfig;
    };

    const { testType } = body;
    if (!testType) return reply.code(400).send({ error: 'testType is required (probe, login, responsive, links)' });

    // Resolve URL
    let baseUrl = body.baseUrl;
    if (body.targetId && !baseUrl) {
      const db = await getDb();
      const targets = await db.select().from(testTargets).where(eq(testTargets.id, body.targetId));
      if (targets.length) baseUrl = targets[0].baseUrl;
    }
    if (!baseUrl) return reply.code(400).send({ error: 'No baseUrl or valid targetId provided' });

    let result: SmokeTestResult;

    try {
      switch (testType) {
        case 'probe':
          result = await runProbeTest(baseUrl);
          break;

        case 'login':
          if (!body.loginConfig) {
            return reply.code(400).send({
              error: 'loginConfig is required for login tests',
              expected: { loginUrl: '/admin', username: '', password: '', userSelector: '#user_name', passSelector: '#user_password', submitSelector: '#login' },
            });
          }
          result = await runLoginTest(baseUrl, body.loginConfig);
          break;

        case 'responsive':
          result = await runResponsiveTest(baseUrl);
          break;

        case 'links':
          result = await runLinksTest(baseUrl);
          break;

        default:
          return reply.code(400).send({ error: `Unknown test type: ${testType}. Available: probe, login, responsive, links` });
      }

      // Store in DB using testRuns table
      try {
        const db = await getDb();
        const [run] = await db.insert(testRuns).values({
          targetId: body.targetId || 0,
          status: 'completed',
          runType: `smoke-${testType}` as any,
          total: 1,
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          durationMs: result.durationMs,
          triggeredBy: 'dashboard',
          summary: {
            testType,
            url: result.url,
            success: result.success,
            details: result.details,
            screenshots: result.screenshots,
            errors: result.errors,
          } as any,
        }).returning();

        // Push to in-memory recent list
        pushResult(result);

        return { data: { ...result, runId: run.id } };
      } catch (dbErr: any) {
        // Still return result even if DB save fails
        pushResult(result);
        return { data: result, warning: `Test ran successfully but DB save failed: ${dbErr.message}` };
      }
    } catch (err: any) {
      return reply.code(500).send({ error: `Test execution failed: ${err.message}` });
    }
  });

  // Get smoke test run history
  app.get('/smoke-tests/runs', async (_request, reply) => {
    try {
      const db = await getDb();
      const runs = await db
        .select()
        .from(testRuns)
        .orderBy(desc(testRuns.createdAt))
        .limit(50);

      // Filter in JS since drizzle LIKE syntax varies
      const smokeRuns = runs.filter((r: any) => r.runType?.startsWith('smoke-'));

      return { data: smokeRuns };
    } catch (err: any) {
      // Fallback to in-memory
      return { data: recentSmokeRuns };
    }
  });

  // Get a specific run
  app.get('/smoke-tests/runs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const runId = parseInt(id, 10);
    if (isNaN(runId)) return reply.code(400).send({ error: 'Invalid run ID' });

    try {
      const db = await getDb();
      const [run] = await db.select().from(testRuns).where(eq(testRuns.id, runId));
      if (!run) return reply.code(404).send({ error: 'Run not found' });
      return { data: run };
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });

  // Serve smoke test screenshots
  app.get('/smoke-tests/screenshot/:filename', async (request, reply) => {
    const { filename } = request.params as { filename: string };
    const safeName = path.basename(filename);
    const filePath = path.join(SCREENSHOT_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return reply.code(404).send({ error: 'Screenshot not found' });
    }

    const stream = fs.createReadStream(filePath);
    return reply.type('image/png').send(stream);
  });
}
