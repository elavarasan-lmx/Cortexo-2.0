import type { FastifyInstance } from 'fastify';
import { getDb } from '../lib/db.js';
import { testTargets, testCases, testRuns, testResults, errors, errorEvents, projects } from '@cortexo/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getOrgId } from '../lib/request-context.js';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Testing Module API — /v1/testing
 *
 * Targets:  GET/POST/DELETE /testing/targets
 * Scan:     POST /testing/scan
 * Cases:    GET/DELETE /testing/cases
 * Run:      POST /testing/run
 * History:  GET /testing/runs, GET /testing/runs/:id
 */
export async function testingRoutes(app: FastifyInstance) {

  /* ─────────────────── TARGETS (Client URLs) ─────────────────── */

  app.get('/testing/targets', async () => {
    const db = await getDb();
    return db.select().from(testTargets).orderBy(desc(testTargets.createdAt));
  });

  app.post('/testing/targets', async (request) => {
    const db = await getDb();
    const body = request.body as any;
    const [row] = await db.insert(testTargets).values({
      name: body.name,
      baseUrl: (body.baseUrl || '').replace(/\/$/, ''),
      environment: body.environment || 'staging',
    }).returning();
    return row;
  });

  app.delete('/testing/targets/:id', async (request) => {
    const db = await getDb();
    const { id } = request.params as any;
    await db.delete(testTargets).where(eq(testTargets.id, Number(id)));
    return { success: true };
  });

  /* ─────────────────── SCAN PROJECT ─────────────────── */

  app.post('/testing/scan', async (request) => {
    const db = await getDb();
    const body = (request.body || {}) as any;
    const projectPath = body.projectPath || '/run/media/lmx/LMX/Winbull/Personal/Devops/Project/Web';

    const discovered: Array<{
      name: string; endpoint: string; method: string;
      category: string; sourceFile: string; priority: string;
    }> = [];

    // 1. Scan /api/ — each PHP file is a direct endpoint
    const apiDir = path.join(projectPath, 'api');
    if (fs.existsSync(apiDir)) {
      const files = fs.readdirSync(apiDir).filter((f: string) => f.endsWith('.php') && !f.includes('test_'));
      for (const file of files) {
        const name = file.replace('.php', '');
        discovered.push({
          name: `API: ${name}`,
          endpoint: `/api/${file}`,
          method: 'GET',
          category: 'api',
          sourceFile: `api/${file}`,
          priority: name.includes('rate') ? 'high' : 'medium',
        });
      }
    }

    // 2. Scan /mobileapi/application/controllers/ — CI REST controllers
    const mobileDir = path.join(projectPath, 'mobileapi/application/controllers');
    if (fs.existsSync(mobileDir)) {
      const files = fs.readdirSync(mobileDir).filter((f: string) => f.endsWith('.php') && f.startsWith('C_'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(mobileDir, file), 'utf8');
        const className = file.replace('.php', '').replace('C_', '');
        const methodRegex = /function\s+(\w+?)_(get|post)\s*\(/g;
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
          const methodName = match[1];
          const httpMethod = match[2].toUpperCase();
          discovered.push({
            name: `Mobile: ${className}/${methodName}`,
            endpoint: `/mobileapi/index.php/${className}/${methodName}`,
            method: httpMethod,
            category: 'mobileapi',
            sourceFile: `mobileapi/application/controllers/${file}`,
            priority: methodName.includes('login') || methodName.includes('booking') ? 'high' : 'medium',
          });
        }
      }
    }

    // 3. Scan /application/controllers/ — main web controllers
    const mainDir = path.join(projectPath, 'application/controllers');
    if (fs.existsSync(mainDir)) {
      const files = fs.readdirSync(mainDir).filter((f: string) => f.endsWith('.php') && f.startsWith('C_'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(mainDir, file), 'utf8');
        const className = file.replace('.php', '').replace('C_', '');
        const methodRegex = /function\s+(\w+)\s*\(/g;
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
          const methodName = match[1];
          if (methodName === '__construct' || methodName.startsWith('_') || methodName.startsWith('validate')) continue;
          discovered.push({
            name: `Web: ${className}/${methodName}`,
            endpoint: `/index.php/${className}/${methodName}`,
            method: 'GET',
            category: 'controller',
            sourceFile: `application/controllers/${file}`,
            priority: 'low',
          });
        }
      }
    }

    // 4. Scan /admin/application/controllers/
    const adminDir = path.join(projectPath, 'admin/application/controllers');
    if (fs.existsSync(adminDir)) {
      const files = fs.readdirSync(adminDir).filter((f: string) => f.endsWith('.php') && f.startsWith('C_'));
      for (const file of files) {
        const className = file.replace('.php', '').replace('C_', '');
        discovered.push({
          name: `Admin: ${className}`,
          endpoint: `/admin/index.php/${className}`,
          method: 'GET',
          category: 'admin',
          sourceFile: `admin/application/controllers/${file}`,
          priority: 'low',
        });
      }
    }

    // Upsert — skip duplicates
    let inserted = 0;
    let skipped = 0;
    for (const d of discovered) {
      const existing = await db.select({ id: testCases.id })
        .from(testCases)
        .where(eq(testCases.endpoint, d.endpoint))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(testCases).values({
          name: d.name,
          endpoint: d.endpoint,
          method: d.method,
          category: d.category,
          sourceFile: d.sourceFile,
          priority: d.priority,
          isAuto: true,
        });
        inserted++;
      } else {
        skipped++;
      }
    }

    return {
      discovered: discovered.length,
      inserted,
      skipped,
      categories: {
        api: discovered.filter(d => d.category === 'api').length,
        mobileapi: discovered.filter(d => d.category === 'mobileapi').length,
        controller: discovered.filter(d => d.category === 'controller').length,
        admin: discovered.filter(d => d.category === 'admin').length,
      },
    };
  });

  /* ─────────────────── TEST CASES ─────────────────── */

  app.get('/testing/cases', async (request) => {
    const db = await getDb();
    const { category } = request.query as any;
    const conditions: any[] = [];
    if (category) conditions.push(eq(testCases.category, category));
    return db.select().from(testCases)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(testCases.category, testCases.name);
  });

  app.delete('/testing/cases/:id', async (request) => {
    const db = await getDb();
    const { id } = request.params as any;
    await db.delete(testCases).where(eq(testCases.id, Number(id)));
    return { success: true };
  });

  app.delete('/testing/cases', async () => {
    const db = await getDb();
    await db.delete(testCases).where(eq(testCases.isAuto, true));
    return { success: true };
  });

  /* ─────────────────── RUN TESTS ─────────────────── */

  app.post('/testing/run', async (request) => {
    const db = await getDb();
    const body = request.body as any;
    const targetId = Number(body.targetId);

    const [target] = await db.select().from(testTargets).where(eq(testTargets.id, targetId));
    if (!target) return { error: 'Target not found' };

    const cases = await db.select().from(testCases).where(eq(testCases.isActive, true));
    if (cases.length === 0) return { error: 'No test cases. Run /scan first.' };

    const [run] = await db.insert(testRuns).values({
      targetId,
      status: 'running',
      total: cases.length,
      triggeredBy: 'manual',
    }).returning();

    const startTime = Date.now();
    let passed = 0, failed = 0, skipped = 0;

    for (const tc of cases) {
      const url = `${target.baseUrl}${tc.endpoint}`;
      const caseStart = Date.now();
      let statusCode: number | null = null;
      let responseBody = '';
      let error = '';
      let resultStatus = 'passed';

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const fetchOpts: RequestInit = {
          method: tc.method || 'GET',
          signal: controller.signal,
          headers: { 'User-Agent': 'Cortexo-Tester/1.0' },
          redirect: 'follow' as RequestRedirect,
        };

        if (tc.method === 'POST' && tc.payload) {
          (fetchOpts.headers as Record<string, string>)['Content-Type'] = 'application/json';
          fetchOpts.body = JSON.stringify(tc.payload);
        }

        const res = await fetch(url, fetchOpts);
        clearTimeout(timeout);
        statusCode = res.status;

        const text = await res.text();
        responseBody = text.substring(0, 2000);

        if (tc.expectedStatus && statusCode !== tc.expectedStatus) {
          resultStatus = 'failed';
        } else if (statusCode >= 500) {
          resultStatus = 'failed';
        } else if (tc.expectedContains && !responseBody.includes(tc.expectedContains)) {
          resultStatus = 'failed';
        }
      } catch (err: any) {
        resultStatus = 'failed';
        error = err.message || 'Request failed';
        if (err.name === 'AbortError') error = 'Timeout (15s)';
      }

      const latency = Date.now() - caseStart;
      if (resultStatus === 'passed') passed++;
      else failed++;

      await db.insert(testResults).values({
        runId: run.id,
        caseId: tc.id,
        status: resultStatus,
        statusCode,
        latencyMs: latency,
        responseBody: responseBody.substring(0, 2000),
        error: error || null,
      });
    }

    const durationMs = Date.now() - startTime;
    await db.update(testRuns)
      .set({ status: 'completed', passed, failed, skipped, durationMs })
      .where(eq(testRuns.id, run.id));

    return { runId: run.id, targetName: target.name, total: cases.length, passed, failed, skipped, durationMs };
  });

  /* ─────────────────── BUG ANALYSIS ─────────────────── */

  /**
   * GET /testing/bugs/:runId
   *
   * Smart bug finder that classifies test results into:
   *  - server_error:   HTTP 500+ (real server crash / PHP fatal)
   *  - timeout:        request took > 15s (perf bug)
   *  - broken_json:    expected JSON but got HTML/error page
   *  - redirect_loop:  3xx but body suggests infinite loop
   *  - empty_response: 200 but empty body (likely missing logic)
   *  - auth_expected:  302/401/403 on admin/controller (expected, not a bug)
   *  - client_error:   4xx on API endpoints (real bug, should work)
   */
  app.get('/testing/bugs/:runId', async (request) => {
    const db = await getDb();
    const { runId } = request.params as any;

    const results = await db
      .select({
        id: testResults.id, status: testResults.status,
        statusCode: testResults.statusCode, latencyMs: testResults.latencyMs,
        error: testResults.error, responseBody: testResults.responseBody,
        caseName: testCases.name, caseEndpoint: testCases.endpoint,
        caseMethod: testCases.method, caseCategory: testCases.category,
        casePriority: testCases.priority, sourceFile: testCases.sourceFile,
      })
      .from(testResults)
      .leftJoin(testCases, eq(testResults.caseId, testCases.id))
      .where(eq(testResults.runId, Number(runId)));

    const bugs: Array<{
      id: number; severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      type: string; title: string; description: string; endpoint: string;
      method: string; category: string; statusCode: number | null;
      latencyMs: number; sourceFile: string | null; responsePreview: string;
    }> = [];

    const authExpected: typeof bugs = [];

    for (const r of results) {
      if (r.status === 'passed' && (r.latencyMs || 0) < 3000) continue;

      const body = r.responseBody || '';
      const code = r.statusCode;
      const isAdminOrController = ['admin', 'controller'].includes(r.caseCategory || '');

      // ── Server Error (500+) — always a bug ──
      if (code && code >= 500) {
        bugs.push({
          id: r.id, severity: 'critical',
          type: 'server_error',
          title: `${code} Server Error — ${r.caseEndpoint}`,
          description: body.includes('Fatal error') ? 'PHP Fatal Error detected in response' :
                       body.includes('Exception') ? 'Unhandled exception in server response' :
                       body.includes('Error') ? 'Server returned error response' :
                       'Server returned 5xx status indicating a server-side failure',
          endpoint: r.caseEndpoint!, method: r.caseMethod!,
          category: r.caseCategory!, statusCode: code,
          latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
          responsePreview: body.substring(0, 500),
        });
        continue;
      }

      // ── Timeout — performance bug ──
      if (r.error?.includes('Timeout') || (r.latencyMs && r.latencyMs > 10000)) {
        bugs.push({
          id: r.id, severity: 'high',
          type: 'timeout',
          title: `Timeout — ${r.caseEndpoint}`,
          description: `Request exceeded timeout limit (${r.latencyMs}ms). Possible infinite loop, heavy query, or deadlock.`,
          endpoint: r.caseEndpoint!, method: r.caseMethod!,
          category: r.caseCategory!, statusCode: code,
          latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
          responsePreview: r.error || '',
        });
        continue;
      }

      // ── Slow response (>3s) on passed — performance warning ──
      if (r.status === 'passed' && r.latencyMs && r.latencyMs >= 3000) {
        bugs.push({
          id: r.id, severity: 'medium',
          type: 'slow_response',
          title: `Slow Response (${r.latencyMs}ms) — ${r.caseEndpoint}`,
          description: `Endpoint responded successfully but took ${r.latencyMs}ms. Consider optimizing queries or caching.`,
          endpoint: r.caseEndpoint!, method: r.caseMethod!,
          category: r.caseCategory!, statusCode: code,
          latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
          responsePreview: '',
        });
        continue;
      }

      // ── API 404 — real bug (public API should be accessible) ──
      if (r.caseCategory === 'api' && code === 404) {
        bugs.push({
          id: r.id, severity: 'high',
          type: 'missing_endpoint',
          title: `Missing API Endpoint — ${r.caseEndpoint}`,
          description: 'Public API file exists in codebase but returns 404 on server. File may not be deployed or path routing is incorrect.',
          endpoint: r.caseEndpoint!, method: r.caseMethod!,
          category: r.caseCategory!, statusCode: code,
          latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
          responsePreview: body.substring(0, 300),
        });
        continue;
      }

      // ── API returning non-JSON (broken response) ──
      if (r.caseCategory === 'api' && code === 200 && body.trim().startsWith('<')) {
        bugs.push({
          id: r.id, severity: 'medium',
          type: 'broken_json',
          title: `API returns HTML instead of JSON — ${r.caseEndpoint}`,
          description: 'Expected JSON response but received HTML. Likely a PHP error page or misconfigured endpoint.',
          endpoint: r.caseEndpoint!, method: r.caseMethod!,
          category: r.caseCategory!, statusCode: code,
          latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
          responsePreview: body.substring(0, 300),
        });
        continue;
      }

      // ── Empty response on 200 ──
      if (code === 200 && body.trim() === '') {
        bugs.push({
          id: r.id, severity: 'low',
          type: 'empty_response',
          title: `Empty Response — ${r.caseEndpoint}`,
          description: 'Server returned 200 OK but with an empty body. Missing logic or broken output buffer.',
          endpoint: r.caseEndpoint!, method: r.caseMethod!,
          category: r.caseCategory!, statusCode: code,
          latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
          responsePreview: '',
        });
        continue;
      }

      // ── MobileAPI errors that aren't auth — real bug ──
      if (r.caseCategory === 'mobileapi' && code && code >= 400 && code < 500) {
        // Check if response says "login required" / "unauthorized"
        const isAuth = body.toLowerCase().includes('login') || body.toLowerCase().includes('unauthorized') ||
                       body.toLowerCase().includes('session') || code === 401 || code === 403;
        if (!isAuth) {
          bugs.push({
            id: r.id, severity: 'medium',
            type: 'client_error',
            title: `${code} Error — ${r.caseEndpoint}`,
            description: `Mobile API returned ${code}. This may indicate a broken endpoint or missing parameters.`,
            endpoint: r.caseEndpoint!, method: r.caseMethod!,
            category: r.caseCategory!, statusCode: code,
            latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
            responsePreview: body.substring(0, 300),
          });
          continue;
        }
      }

      // ── Auth-expected (admin/controller 302/401/403/404) — not a bug ──
      if (isAdminOrController && code && (code === 302 || code === 401 || code === 403 || code === 404)) {
        authExpected.push({
          id: r.id, severity: 'info',
          type: 'auth_expected',
          title: `Auth Required — ${r.caseEndpoint}`,
          description: `Admin/controller route requires login. Status ${code} is expected without session.`,
          endpoint: r.caseEndpoint!, method: r.caseMethod!,
          category: r.caseCategory!, statusCode: code,
          latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
          responsePreview: '',
        });
        continue;
      }

      // ── Connection errors ──
      if (r.error && !r.error.includes('Timeout')) {
        bugs.push({
          id: r.id, severity: 'high',
          type: 'connection_error',
          title: `Connection Failed — ${r.caseEndpoint}`,
          description: r.error,
          endpoint: r.caseEndpoint!, method: r.caseMethod!,
          category: r.caseCategory!, statusCode: code,
          latencyMs: r.latencyMs!, sourceFile: r.sourceFile || null,
          responsePreview: '',
        });
      }
    }

    // Sort bugs by severity
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    bugs.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Summary by type
    const summary: Record<string, number> = {};
    for (const b of bugs) summary[b.type] = (summary[b.type] || 0) + 1;

    return {
      totalBugs: bugs.length,
      authExpectedCount: authExpected.length,
      summary,
      bugs,
      bySeverity: {
        critical: bugs.filter(b => b.severity === 'critical').length,
        high: bugs.filter(b => b.severity === 'high').length,
        medium: bugs.filter(b => b.severity === 'medium').length,
        low: bugs.filter(b => b.severity === 'low').length,
      },
    };
  });

  /* ─────────────────── MODULE TESTS ─────────────────── */

  /**
   * GET /testing/modules
   *
   * Groups test cases into business modules for organized testing.
   * Maps endpoint patterns to business domains like Auth, Rates, Trade, etc.
   */
  app.get('/testing/modules', async () => {
    const db = await getDb();
    const allCases = await db.select().from(testCases).where(eq(testCases.isActive, true));

    const MODULE_PATTERNS: Record<string, { keywords: string[]; description: string }> = {
      'Authentication': {
        keywords: ['login', 'logout', 'session', 'auth', 'register', 'password', 'otp', 'captcha', 'psw'],
        description: 'Login, registration, session management, OTP verification',
      },
      'Rate Engine': {
        keywords: ['rate', 'rates', 'premium', 'spot', 'mjdma', 'commodity', 'prem_group', 'com_group'],
        description: 'Live rates, historical rates, commodities, premium calculation',
      },
      'Booking & Trade': {
        keywords: ['booking', 'trade', 'order', 'quotation', 'contract', 'hedge', 'delivery'],
        description: 'Trade booking, delivery, contracts, hedging',
      },
      'User Management': {
        keywords: ['user', 'customer', 'client', 'admin_user', 'kyc', 'account'],
        description: 'User profiles, KYC, customer management',
      },
      'Communication': {
        keywords: ['sms', 'email', 'whatsapp', 'notification', 'push', 'marquee', 'message'],
        description: 'SMS, Email, WhatsApp, push notifications',
      },
      'Content & Pages': {
        keywords: ['news', 'gallery', 'popup', 'banner', 'video', 'career', 'page', 'event', 'advertisement'],
        description: 'CMS content, galleries, popups, videos',
      },
      'Settings & Config': {
        keywords: ['setting', 'config', 'logo', 'maintenance', 'general', 'api_key', 'rpanel'],
        description: 'System configuration, branding, maintenance mode',
      },
      'Reports': {
        keywords: ['report', 'log', 'history', 'analytics', 'stats', 'calendar'],
        description: 'Business reports, rate history, booking reports',
      },
    };

    const modules: Array<{
      name: string; description: string; cases: typeof allCases;
      totalCount: number; categories: Record<string, number>;
    }> = [];

    const assignedIds = new Set<number>();

    for (const [moduleName, config] of Object.entries(MODULE_PATTERNS)) {
      const matched = allCases.filter(c => {
        if (assignedIds.has(c.id)) return false;
        const endpoint = (c.endpoint || '').toLowerCase();
        const name = (c.name || '').toLowerCase();
        return config.keywords.some(k => endpoint.includes(k) || name.includes(k));
      });
      matched.forEach(c => assignedIds.add(c.id));

      const catCounts: Record<string, number> = {};
      matched.forEach(c => { catCounts[c.category || 'other'] = (catCounts[c.category || 'other'] || 0) + 1; });

      modules.push({
        name: moduleName,
        description: config.description,
        cases: matched,
        totalCount: matched.length,
        categories: catCounts,
      });
    }

    // Unmatched → "Other"
    const unmatched = allCases.filter(c => !assignedIds.has(c.id));
    if (unmatched.length > 0) {
      const catCounts: Record<string, number> = {};
      unmatched.forEach(c => { catCounts[c.category || 'other'] = (catCounts[c.category || 'other'] || 0) + 1; });
      modules.push({
        name: 'Other',
        description: 'Uncategorized endpoints',
        cases: unmatched,
        totalCount: unmatched.length,
        categories: catCounts,
      });
    }

    return modules.filter(m => m.totalCount > 0);
  });

  /**
   * GET /testing/modules/:runId
   *
   * Module-level results from a specific run — bugs grouped by business module.
   */
  app.get('/testing/modules/:runId', async (request) => {
    const db = await getDb();
    const { runId } = request.params as any;

    const results = await db
      .select({
        id: testResults.id, status: testResults.status,
        statusCode: testResults.statusCode, latencyMs: testResults.latencyMs,
        error: testResults.error,
        caseName: testCases.name, caseEndpoint: testCases.endpoint,
        caseMethod: testCases.method, caseCategory: testCases.category,
      })
      .from(testResults)
      .leftJoin(testCases, eq(testResults.caseId, testCases.id))
      .where(eq(testResults.runId, Number(runId)));

    const MODULE_KEYWORDS: Record<string, string[]> = {
      'Authentication': ['login', 'logout', 'session', 'auth', 'register', 'password', 'otp', 'captcha', 'psw'],
      'Rate Engine': ['rate', 'rates', 'premium', 'spot', 'mjdma', 'commodity', 'prem_group', 'com_group'],
      'Booking & Trade': ['booking', 'trade', 'order', 'quotation', 'contract', 'hedge', 'delivery'],
      'User Management': ['user', 'customer', 'client', 'admin_user', 'kyc', 'account'],
      'Communication': ['sms', 'email', 'whatsapp', 'notification', 'push', 'marquee', 'message'],
      'Content & Pages': ['news', 'gallery', 'popup', 'banner', 'video', 'career', 'page', 'event', 'advertisement'],
      'Settings & Config': ['setting', 'config', 'logo', 'maintenance', 'general', 'api_key', 'rpanel'],
      'Reports': ['report', 'log', 'history', 'analytics', 'stats', 'calendar'],
    };

    const moduleResults: Array<{
      name: string; total: number; passed: number; failed: number;
      passRate: number; avgLatency: number;
      criticalEndpoints: Array<{ endpoint: string; statusCode: number | null; error: string | null }>;
    }> = [];

    const assignedIds = new Set<number>();

    for (const [moduleName, keywords] of Object.entries(MODULE_KEYWORDS)) {
      const matched = results.filter(r => {
        if (assignedIds.has(r.id)) return false;
        const endpoint = (r.caseEndpoint || '').toLowerCase();
        return keywords.some(k => endpoint.includes(k));
      });
      matched.forEach(r => assignedIds.add(r.id));

      if (matched.length === 0) continue;

      const passed = matched.filter(r => r.status === 'passed').length;
      const failed = matched.filter(r => r.status === 'failed').length;
      const totalLatency = matched.reduce((s, r) => s + (r.latencyMs || 0), 0);

      moduleResults.push({
        name: moduleName,
        total: matched.length,
        passed,
        failed,
        passRate: matched.length > 0 ? Math.round((passed / matched.length) * 100) : 0,
        avgLatency: matched.length > 0 ? Math.round(totalLatency / matched.length) : 0,
        criticalEndpoints: matched
          .filter(r => r.status === 'failed' && r.statusCode && r.statusCode >= 500)
          .map(r => ({ endpoint: r.caseEndpoint!, statusCode: r.statusCode, error: r.error })),
      });
    }

    // Unmatched
    const unmatched = results.filter(r => !assignedIds.has(r.id));
    if (unmatched.length > 0) {
      const passed = unmatched.filter(r => r.status === 'passed').length;
      moduleResults.push({
        name: 'Other',
        total: unmatched.length,
        passed,
        failed: unmatched.length - passed,
        passRate: Math.round((passed / unmatched.length) * 100),
        avgLatency: Math.round(unmatched.reduce((s, r) => s + (r.latencyMs || 0), 0) / unmatched.length),
        criticalEndpoints: unmatched
          .filter(r => r.status === 'failed' && r.statusCode && r.statusCode >= 500)
          .map(r => ({ endpoint: r.caseEndpoint!, statusCode: r.statusCode, error: r.error })),
      });
    }

    return moduleResults.sort((a, b) => a.passRate - b.passRate);
  });

  /* ─────────────────── RUN HISTORY ─────────────────── */

  app.get('/testing/runs', async () => {
    const db = await getDb();
    return db
      .select({
        id: testRuns.id, targetId: testRuns.targetId, status: testRuns.status,
        total: testRuns.total, passed: testRuns.passed, failed: testRuns.failed,
        skipped: testRuns.skipped, durationMs: testRuns.durationMs,
        triggeredBy: testRuns.triggeredBy, createdAt: testRuns.createdAt,
        targetName: testTargets.name, targetUrl: testTargets.baseUrl,
      })
      .from(testRuns)
      .leftJoin(testTargets, eq(testRuns.targetId, testTargets.id))
      .orderBy(desc(testRuns.createdAt))
      .limit(50);
  });

  app.get('/testing/runs/:id', async (request) => {
    const db = await getDb();
    const { id } = request.params as any;
    const runId = Number(id);

    const [run] = await db
      .select({
        id: testRuns.id, targetId: testRuns.targetId, status: testRuns.status,
        total: testRuns.total, passed: testRuns.passed, failed: testRuns.failed,
        skipped: testRuns.skipped, durationMs: testRuns.durationMs,
        createdAt: testRuns.createdAt, targetName: testTargets.name, targetUrl: testTargets.baseUrl,
      })
      .from(testRuns)
      .leftJoin(testTargets, eq(testRuns.targetId, testTargets.id))
      .where(eq(testRuns.id, runId));

    if (!run) return { error: 'Run not found' };

    const results = await db
      .select({
        id: testResults.id, status: testResults.status, statusCode: testResults.statusCode,
        latencyMs: testResults.latencyMs, error: testResults.error,
        caseName: testCases.name, caseEndpoint: testCases.endpoint,
        caseMethod: testCases.method, caseCategory: testCases.category, casePriority: testCases.priority,
      })
      .from(testResults)
      .leftJoin(testCases, eq(testResults.caseId, testCases.id))
      .where(eq(testResults.runId, runId))
      .orderBy(testResults.status, testCases.category);

    return { run, results };
  });

  // ═══════════════════════════════════════════════════════════════════════
  // POST /testing/bugs/:runId/export — Push detected bugs into Bug Tracker
  // ═══════════════════════════════════════════════════════════════════════
  app.post('/testing/bugs/:runId/export', async (request, reply) => {
    const runId = Number((request.params as any).runId);
    const { severity: minSeverity } = (request.query as any) || {};
    const orgId = getOrgId(request);

    try {
      const db = await getDb();

      // ── 1. Get the test run and its target ──
      const [run] = await db.select().from(testRuns).where(eq(testRuns.id, runId));
      if (!run) return reply.code(404).send({ error: 'Run not found' });

      const [target] = await db.select().from(testTargets).where(eq(testTargets.id, run.targetId));
      if (!target) return reply.code(404).send({ error: 'Target not found' });

      // ── 2. Find or create a project for this test target ──
      let project = await db.query.projects.findFirst({
        where: (p: any, { and: andFn, eq: eqFn }: any) =>
          andFn(eqFn(p.orgId, orgId), eqFn(p.name, `Testing: ${target.name}`)),
      });

      if (!project) {
        const projectId = crypto.randomUUID();
        const sdkKey = `test_${crypto.randomBytes(24).toString('hex')}`;
        await db.insert(projects).values({
          id: projectId,
          orgId,
          name: `Testing: ${target.name}`,
          description: `Auto-created project for endpoint testing of ${target.baseUrl}`,
          repoProvider: 'testing',
          repoUrl: target.baseUrl,
          sdkApiKey: sdkKey,
        } as any);
        project = await db.query.projects.findFirst({
          where: (p: any, { eq: eqFn }: any) => eqFn(p.id, projectId),
        });
      }

      if (!project) return reply.code(500).send({ error: 'Failed to create tracking project' });

      // ── 3. Get the smart bug analysis results ──
      const results = await db.select({
        id: testResults.id, status: testResults.status, statusCode: testResults.statusCode,
        latencyMs: testResults.latencyMs, responseBody: testResults.responseBody,
        error: testResults.error,
        caseEndpoint: testCases.endpoint, caseMethod: testCases.method,
        caseCategory: testCases.category, sourceFile: testCases.sourceFile,
        caseName: testCases.name,
      })
      .from(testResults)
      .leftJoin(testCases, eq(testResults.caseId, testCases.id))
      .where(eq(testResults.runId, runId));

      // ── 4. Run bug classification (mirrors GET /testing/bugs/:runId logic) ──
      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const minSevNum = severityOrder[minSeverity as string] ?? 3; // Default: export all

      const bugsToExport: Array<{
        type: string; message: string; file: string; severity: string;
        endpoint: string; method: string; statusCode: number; latencyMs: number;
        responsePreview: string;
      }> = [];

      for (const r of results) {
        const code = r.statusCode || 0;
        const body = r.responseBody || '';
        const endpoint = r.caseEndpoint || '';
        const isAdminOrController = /\/(admin|controller|panel|manage|index\.php\/(admin|controller))/i.test(endpoint);

        // Skip auth-expected
        if (isAdminOrController && [302, 401, 403, 404].includes(code)) continue;

        // Server error → critical
        if (code >= 500) {
          if (severityOrder['critical'] <= minSevNum) {
            bugsToExport.push({
              type: `HTTP ${code} Server Error`, message: `Endpoint ${r.caseMethod} ${endpoint} returned ${code}. Server-side failure detected during automated testing.`,
              file: r.sourceFile || endpoint.replace(/^\//, ''), severity: 'critical',
              endpoint, method: r.caseMethod || 'GET', statusCode: code,
              latencyMs: r.latencyMs || 0, responsePreview: body.substring(0, 500),
            });
          }
          continue;
        }

        // Timeout
        if (r.error?.includes('Timeout') || r.error?.includes('timeout')) {
          if (severityOrder['high'] <= minSevNum) {
            bugsToExport.push({
              type: 'Request Timeout', message: `Endpoint ${endpoint} timed out. ${r.error}`,
              file: r.sourceFile || endpoint.replace(/^\//, ''), severity: 'warning',
              endpoint, method: r.caseMethod || 'GET', statusCode: code,
              latencyMs: r.latencyMs || 0, responsePreview: '',
            });
          }
          continue;
        }

        // Connection errors
        if (r.error && !r.error.includes('Timeout')) {
          if (severityOrder['high'] <= minSevNum) {
            bugsToExport.push({
              type: 'Connection Error', message: `Failed to connect to ${endpoint}. ${r.error}`,
              file: r.sourceFile || endpoint.replace(/^\//, ''), severity: 'error',
              endpoint, method: r.caseMethod || 'GET', statusCode: code,
              latencyMs: r.latencyMs || 0, responsePreview: '',
            });
          }
          continue;
        }

        // Broken JSON (API returning HTML)
        if (r.caseCategory === 'api' && code === 200 && body.trim().startsWith('<')) {
          if (severityOrder['medium'] <= minSevNum) {
            bugsToExport.push({
              type: 'Broken JSON Response', message: `API ${endpoint} returned HTML instead of JSON. Likely a PHP error page.`,
              file: r.sourceFile || endpoint.replace(/^\//, ''), severity: 'warning',
              endpoint, method: r.caseMethod || 'GET', statusCode: code,
              latencyMs: r.latencyMs || 0, responsePreview: body.substring(0, 300),
            });
          }
          continue;
        }

        // MobileAPI client errors (not auth-related)
        if (r.caseCategory === 'mobileapi' && code >= 400 && code < 500) {
          const isAuth = body.toLowerCase().includes('login') || body.toLowerCase().includes('unauthorized') ||
                         body.toLowerCase().includes('session') || code === 401 || code === 403;
          if (!isAuth && severityOrder['medium'] <= minSevNum) {
            bugsToExport.push({
              type: `HTTP ${code} Client Error`, message: `Mobile API endpoint ${endpoint} returned ${code}. Broken endpoint or missing parameters.`,
              file: r.sourceFile || endpoint.replace(/^\//, ''), severity: 'warning',
              endpoint, method: r.caseMethod || 'GET', statusCode: code,
              latencyMs: r.latencyMs || 0, responsePreview: body.substring(0, 300),
            });
          }
        }
      }

      // ── 5. Insert into errors table with fingerprint deduplication ──
      let created = 0, updated = 0, skipped = 0;

      for (const bug of bugsToExport) {
        const fingerprint = crypto
          .createHash('sha256')
          .update(`testing:${bug.type}:${bug.endpoint}:${bug.statusCode}`)
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
            type: bug.type,
            message: bug.message,
            file: bug.file,
            severity: bug.severity,
            status: 'unresolved',
            eventCount: 1,
            tags: JSON.stringify(['testing', `run-${runId}`, target.name]) as any,
            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
          } as any);

          // Also create an error event with context
          await db.insert(errorEvents).values({
            errorId,
            projectId: project!.id,
            stackTrace: null,
            context: JSON.stringify({
              source: 'testing',
              runId,
              targetName: target.name,
              targetUrl: target.baseUrl,
              endpoint: bug.endpoint,
              method: bug.method,
              statusCode: bug.statusCode,
              latencyMs: bug.latencyMs,
              responsePreview: bug.responsePreview,
            }),
            environment: target.environment || 'staging',
            url: `${target.baseUrl}${bug.endpoint}`,
            method: bug.method,
          } as any);

          created++;
        }
      }

      return {
        success: true,
        exported: { created, updated, skipped: bugsToExport.length - created - updated },
        total: bugsToExport.length,
        project: { id: project!.id, name: project!.name },
        message: `Exported ${created} new bugs, updated ${updated} existing ones to Bug Tracker`,
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to export bugs to tracker' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // LEVEL 2 & 3 — Business Flow + Security Test Engine
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Business module mapping — classifies endpoints by business domain
   */
  const MODULE_MAP: Record<string, { keywords: string[]; severity: string }> = {
    auth:     { keywords: ['login','logout','session','register','password','otp','captcha','psw','CheckAppVersion'], severity: 'high' },
    rates:    { keywords: ['rate','rates','premium','spot','commodity','apirate','bcencdata','txtdata','broadcastrate','chart_data','ratehistory'], severity: 'critical' },
    trading:  { keywords: ['booking','trade','order','quotation','contract','hedge','bookingRequest','updatebook','limitupdate','bookupdate','gettradecommodities','tradable_status','trade_summery'], severity: 'critical' },
    delivery: { keywords: ['delivery','delv','unfix','pendingdelv','customerDelivery'], severity: 'high' },
    margin:   { keywords: ['margin','balance','limit','transaction','fund'], severity: 'high' },
    kyc:      { keywords: ['kyc','userregistration','customer_group','customerservice'], severity: 'medium' },
    reports:  { keywords: ['report','history','historical','calendar','log','analytics','chart'], severity: 'medium' },
    notif:    { keywords: ['sms','email','whatsapp','notification','push','marquee','message','alert','onesignal'], severity: 'medium' },
    config:   { keywords: ['setting','config','logo','maintenance','general','rpanel','getsettings','bankdetails','aboutus','contactus','socialshare'], severity: 'low' },
  };

  function classifyEndpoint(endpoint: string): { module: string; severity: string } {
    const ep = endpoint.toLowerCase();
    for (const [mod, cfg] of Object.entries(MODULE_MAP)) {
      if (cfg.keywords.some(k => ep.includes(k.toLowerCase()))) return { module: mod, severity: cfg.severity };
    }
    return { module: 'other', severity: 'low' };
  }

  function validateJsonSchema(body: string, endpoint: string): { valid: boolean; errors: string[] } {
    const errs: string[] = [];
    try {
      const json = JSON.parse(body);
      // Mobile API must have { success, message, data }
      if (endpoint.includes('mobileapi')) {
        if (typeof json.success === 'undefined') errs.push('Missing "success" field');
        if (typeof json.message === 'undefined' && typeof json.data === 'undefined') errs.push('Missing "message" or "data" field');
      }
      // Public API must return valid JSON object/array
      if (endpoint.includes('/api/') && typeof json !== 'object') errs.push('Expected JSON object/array');
    } catch {
      if (body.trim().startsWith('<')) errs.push('Returns HTML instead of JSON');
      else if (body.trim() === '') errs.push('Empty response body');
      else errs.push('Invalid JSON response');
    }
    return { valid: errs.length === 0, errors: errs };
  }

  // ──────────── POST /testing/run-full — Run all 3 levels ────────────
  app.post('/testing/run-full', async (request) => {
    const db = await getDb();
    const body = request.body as any;
    const targetId = Number(body.targetId);
    const levels = body.levels || ['L1', 'L2', 'L3']; // which levels to run

    const [target] = await db.select().from(testTargets).where(eq(testTargets.id, targetId));
    if (!target) return { error: 'Target not found' };

    const cases = await db.select().from(testCases).where(eq(testCases.isActive, true));
    if (cases.length === 0) return { error: 'No test cases. Run /scan first.' };

    // Create run
    const totalEstimate = cases.length + (levels.includes('L2') ? 8 : 0) + (levels.includes('L3') ? cases.length : 0);
    const [run] = await db.insert(testRuns).values({
      targetId, status: 'running', total: totalEstimate,
      runType: levels.length === 3 ? 'full' : levels.join('+'),
      triggeredBy: 'manual',
    }).returning();

    const startTime = Date.now();
    let passed = 0, failed = 0, skipped = 0;
    const levelSummary: Record<string, { passed: number; failed: number; total: number }> = {};

    // Helper to make requests
    async function doFetch(url: string, method: string, payload?: any, headers?: Record<string, string>, cookies?: string): Promise<{ status: number; body: string; latency: number; error?: string }> {
      const caseStart = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const opts: RequestInit = {
          method, signal: controller.signal, redirect: 'manual' as RequestRedirect,
          headers: { 'User-Agent': 'Cortexo-Tester/2.0', ...(headers || {}) },
        };
        if (cookies) (opts.headers as any)['Cookie'] = cookies;
        if (method === 'POST' && payload) {
          (opts.headers as any)['Content-Type'] = 'application/json';
          opts.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
        }
        const res = await fetch(url, opts);
        clearTimeout(timeout);
        const text = await res.text();
        return { status: res.status, body: text.substring(0, 2000), latency: Date.now() - caseStart };
      } catch (err: any) {
        return { status: 0, body: '', latency: Date.now() - caseStart, error: err.name === 'AbortError' ? 'Timeout (15s)' : err.message };
      }
    }

    // ════════════════════ LEVEL 1: Enhanced Endpoint + Schema ════════════════════
    if (levels.includes('L1')) {
      const l1 = { passed: 0, failed: 0, total: cases.length };
      for (const tc of cases) {
        const url = `${target.baseUrl}${tc.endpoint}`;
        const { module: bMod, severity: bSev } = classifyEndpoint(tc.endpoint);
        const res = await doFetch(url, tc.method || 'GET', tc.payload);

        let resultStatus = 'passed';
        let schemaResult = { valid: true, errors: [] as string[] };

        if (res.error) { resultStatus = 'failed'; }
        else if (res.status >= 500) { resultStatus = 'failed'; }
        else if (tc.expectedStatus && res.status !== tc.expectedStatus) { resultStatus = 'failed'; }
        else if (tc.expectedContains && !res.body.includes(tc.expectedContains)) { resultStatus = 'failed'; }

        // Schema validation for API/mobile endpoints
        if (resultStatus === 'passed' && (tc.category === 'api' || tc.category === 'mobileapi') && res.status === 200) {
          schemaResult = validateJsonSchema(res.body, tc.endpoint);
          if (!schemaResult.valid) resultStatus = 'failed';
        }

        if (resultStatus === 'passed') { passed++; l1.passed++; }
        else { failed++; l1.failed++; }

        await db.insert(testResults).values({
          runId: run.id, caseId: tc.id, status: resultStatus,
          statusCode: res.status || null, latencyMs: res.latency,
          responseBody: res.body.substring(0, 2000), error: res.error || null,
          testLevel: 'L1', businessModule: bMod, businessSeverity: bSev,
          schemaValid: schemaResult.valid, schemaErrors: schemaResult.errors.length > 0 ? schemaResult.errors : null,
        });
      }
      levelSummary['L1'] = l1;
    }

    // ════════════════════ LEVEL 2: Business Flow Tests ════════════════════
    if (levels.includes('L2')) {
      const flows = [
        { name: 'Guest Rate View', steps: [
          { desc: 'Load homepage', endpoint: '/index.php/C_booking', method: 'GET', expect: 200, critical: false },
          { desc: 'Fetch rate data', endpoint: '/index.php/C_rates/rate_data', method: 'GET', expect: 200, critical: true },
          { desc: 'Check API rates', endpoint: '/api/apirate.php', method: 'GET', expect: 200, critical: true },
        ]},
        { name: 'Mobile App Init', steps: [
          { desc: 'Check app version', endpoint: '/mobileapi/index.php/C_mobileclient/CheckAppVersion', method: 'GET', expect: 200, critical: false },
          { desc: 'Get settings', endpoint: '/api/getsettings.php', method: 'GET', expect: 200, critical: true },
          { desc: 'Get bank details', endpoint: '/api/bankdetails.php', method: 'GET', expect: 200, critical: false },
          { desc: 'Get advertisements', endpoint: '/mobileapi/index.php/C_mobileclienttrade/advertisements', method: 'GET', expect: 200, critical: false },
        ]},
        { name: 'Public Content', steps: [
          { desc: 'About us', endpoint: '/api/aboutusdetails.php', method: 'GET', expect: 200, critical: false },
          { desc: 'Contact details', endpoint: '/api/contactusdetails.php', method: 'GET', expect: 200, critical: false },
          { desc: 'Social links', endpoint: '/api/socialshare.php', method: 'GET', expect: 200, critical: false },
          { desc: 'Phone numbers', endpoint: '/api/phonenumberdetails.php', method: 'GET', expect: 200, critical: false },
        ]},
        { name: 'Trade Commodities (Unauthenticated)', steps: [
          { desc: 'Get commodities without auth', endpoint: '/mobileapi/index.php/C_mobileclienttrade/gettradecommodities?cusid=0', method: 'GET', expect: 200, critical: true },
          { desc: 'Trade summary without auth', endpoint: '/mobileapi/index.php/C_mobileclienttrade/trade_summery?cusid=0', method: 'GET', expect: 200, critical: true },
          { desc: 'Open orders without auth', endpoint: '/mobileapi/index.php/C_mobileclienttrade/customerAllOpenorders?cusid=0', method: 'GET', expect: 200, critical: true },
        ]},
      ];

      const l2 = { passed: 0, failed: 0, total: 0 };
      for (const flow of flows) {
        for (let i = 0; i < flow.steps.length; i++) {
          const step = flow.steps[i];
          l2.total++;
          const url = `${target.baseUrl}${step.endpoint}`;
          const res = await doFetch(url, step.method);

          let resultStatus = 'passed';
          if (res.error) resultStatus = 'failed';
          else if (res.status >= 500) resultStatus = 'failed';
          else if (step.expect && res.status !== step.expect && res.status !== 302) resultStatus = 'failed';

          // Schema check for 200 responses
          let schemaResult = { valid: true, errors: [] as string[] };
          if (resultStatus === 'passed' && res.status === 200 && step.endpoint.includes('api')) {
            schemaResult = validateJsonSchema(res.body, step.endpoint);
          }

          if (resultStatus === 'passed') { passed++; l2.passed++; }
          else { failed++; l2.failed++; }

          // Use a dummy caseId (0) for flow tests
          await db.insert(testResults).values({
            runId: run.id, caseId: 0, status: resultStatus,
            statusCode: res.status || null, latencyMs: res.latency,
            responseBody: res.body.substring(0, 2000), error: res.error || null,
            testLevel: 'L2', businessModule: classifyEndpoint(step.endpoint).module,
            businessSeverity: step.critical ? 'critical' : 'medium',
            flowStep: i + 1, flowName: `${flow.name}: ${step.desc}`,
          });
        }
      }
      levelSummary['L2'] = l2;
    }

    // ════════════════════ LEVEL 3: Security Tests ════════════════════
    if (levels.includes('L3')) {
      const l3 = { passed: 0, failed: 0, total: 0 };

      // 3A: Auth Bypass — protected endpoints should NOT return 200 without session
      const protectedEndpoints = [
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/bookingRequest', method: 'POST', name: 'Booking without auth' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/changePassword', method: 'POST', name: 'Password change without auth' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/updateProfile', method: 'POST', name: 'Profile update without auth' },
        { endpoint: '/index.php/C_trade/booking_request', method: 'POST', name: 'Web booking without session' },
        { endpoint: '/admin/index.php/C_booking', method: 'GET', name: 'Admin panel without login' },
        { endpoint: '/admin/index.php/C_clients', method: 'GET', name: 'Client list without login' },
        { endpoint: '/admin/index.php/C_marginmanagement', method: 'GET', name: 'Margin mgmt without login' },
      ];

      for (const ep of protectedEndpoints) {
        l3.total++;
        const url = `${target.baseUrl}${ep.endpoint}`;
        const payload = ep.method === 'POST' ? { test: 'security_probe' } : undefined;
        const res = await doFetch(url, ep.method, payload);

        // If protected endpoint returns 200 with actual data (not login page), that's a security issue
        let issue: string | null = null;
        let resultStatus = 'passed';
        if (res.status === 200 && !res.body.toLowerCase().includes('login') && !res.body.toLowerCase().includes('sign in')) {
          issue = 'auth_bypass';
          resultStatus = 'failed';
        }

        if (resultStatus === 'passed') { passed++; l3.passed++; }
        else { failed++; l3.failed++; }

        await db.insert(testResults).values({
          runId: run.id, caseId: 0, status: resultStatus,
          statusCode: res.status || null, latencyMs: res.latency,
          responseBody: res.body.substring(0, 500), error: res.error || null,
          testLevel: 'L3', businessModule: classifyEndpoint(ep.endpoint).module,
          businessSeverity: 'critical', securityIssue: issue,
          flowName: `Security: ${ep.name}`,
        });
      }

      // 3B: SQL Injection probes on key endpoints
      const sqliTargets = [
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/booking_report?cusid=1%27%20OR%201%3D1--&from=2024-01-01&to=2025-01-01', method: 'GET', name: 'SQLi on booking_report cusid' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/trade_summery?cusid=1%27%20OR%201%3D1--', method: 'GET', name: 'SQLi on trade_summery cusid' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/gettradecommodities?cusid=1%27%20UNION%20SELECT%201--', method: 'GET', name: 'SQLi UNION on gettradecommodities' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/customerAllOpenorders?cusid=-1', method: 'GET', name: 'Negative cusid on open orders' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/customerOrderCancel?cusid=1&orderid=0%27%20OR%201%3D1', method: 'GET', name: 'SQLi on order cancel' },
      ];

      for (const ep of sqliTargets) {
        l3.total++;
        const url = `${target.baseUrl}${ep.endpoint}`;
        const res = await doFetch(url, ep.method);

        let issue: string | null = null;
        let resultStatus = 'passed';
        const bodyLower = res.body.toLowerCase();

        // SQL errors in response = vulnerability
        if (bodyLower.includes('sql') || bodyLower.includes('mysql') || bodyLower.includes('syntax error') ||
            bodyLower.includes('query') || bodyLower.includes('unknown column') || bodyLower.includes('table')) {
          issue = 'sql_injection';
          resultStatus = 'failed';
        }
        // Server crash = potential vulnerability
        if (res.status >= 500) {
          issue = 'sqli_crash';
          resultStatus = 'failed';
        }

        if (resultStatus === 'passed') { passed++; l3.passed++; }
        else { failed++; l3.failed++; }

        await db.insert(testResults).values({
          runId: run.id, caseId: 0, status: resultStatus,
          statusCode: res.status || null, latencyMs: res.latency,
          responseBody: res.body.substring(0, 500), error: res.error || null,
          testLevel: 'L3', businessModule: classifyEndpoint(ep.endpoint).module,
          businessSeverity: 'critical', securityIssue: issue,
          flowName: `Security: ${ep.name}`,
        });
      }

      // 3C: Input validation — invalid/boundary values
      const inputTests = [
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/bookingRequest', method: 'POST', payload: {}, name: 'Empty booking payload' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/bookingRequest', method: 'POST', payload: { request_type: -1, book_qty: -999 }, name: 'Negative qty booking' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/changePassword', method: 'POST', payload: { userid: '', oldpassword: '', newpassword: '', confirmpassword: '' }, name: 'Empty password change' },
        { endpoint: '/mobileapi/index.php/C_mobileclienttrade/ratealertRequest', method: 'POST', payload: { uuid: '', comid: 0, alertrate: -1, alerttype: 99 }, name: 'Invalid rate alert' },
      ];

      for (const ep of inputTests) {
        l3.total++;
        const url = `${target.baseUrl}${ep.endpoint}`;
        const res = await doFetch(url, ep.method, ep.payload);

        let issue: string | null = null;
        let resultStatus = 'passed';

        // Server should gracefully reject bad input (200 with success:false or 400), NOT crash
        if (res.status >= 500) {
          issue = 'input_crash';
          resultStatus = 'failed';
        }
        // If it returns success:true with bad data, that's a logic bug
        try {
          const json = JSON.parse(res.body);
          if (json.success === true && ep.name.includes('Empty')) {
            issue = 'missing_validation';
            resultStatus = 'failed';
          }
        } catch {}

        if (resultStatus === 'passed') { passed++; l3.passed++; }
        else { failed++; l3.failed++; }

        await db.insert(testResults).values({
          runId: run.id, caseId: 0, status: resultStatus,
          statusCode: res.status || null, latencyMs: res.latency,
          responseBody: res.body.substring(0, 500), error: res.error || null,
          testLevel: 'L3', businessModule: classifyEndpoint(ep.endpoint).module,
          businessSeverity: 'high', securityIssue: issue,
          flowName: `Validation: ${ep.name}`,
        });
      }

      levelSummary['L3'] = l3;
    }

    // ──── Finalize run ────
    const total = passed + failed + skipped;
    const durationMs = Date.now() - startTime;
    await db.update(testRuns)
      .set({ status: 'completed', passed, failed, skipped, total, durationMs, summary: levelSummary as any })
      .where(eq(testRuns.id, run.id));

    return {
      runId: run.id, targetName: target.name,
      total, passed, failed, skipped, durationMs,
      levels: levelSummary,
    };
  });

  // ──────────── GET /testing/runs/:id/levels — Level breakdown ────────────
  app.get('/testing/runs/:id/levels', async (request) => {
    const db = await getDb();
    const runId = Number((request.params as any).id);

    const results = await db.select().from(testResults).where(eq(testResults.runId, runId));

    const levels: Record<string, any> = {};
    for (const level of ['L1', 'L2', 'L3']) {
      const lr = results.filter(r => r.testLevel === level);
      if (lr.length === 0) continue;

      const byModule: Record<string, { passed: number; failed: number; issues: any[] }> = {};
      for (const r of lr) {
        const mod = r.businessModule || 'other';
        if (!byModule[mod]) byModule[mod] = { passed: 0, failed: 0, issues: [] };
        if (r.status === 'passed') byModule[mod].passed++;
        else {
          byModule[mod].failed++;
          byModule[mod].issues.push({
            endpoint: r.flowName || `Case #${r.caseId}`,
            statusCode: r.statusCode, latencyMs: r.latencyMs,
            severity: r.businessSeverity, securityIssue: r.securityIssue,
            schemaErrors: r.schemaErrors, error: r.error,
            responsePreview: (r.responseBody || '').substring(0, 200),
          });
        }
      }

      levels[level] = {
        total: lr.length,
        passed: lr.filter(r => r.status === 'passed').length,
        failed: lr.filter(r => r.status !== 'passed').length,
        modules: byModule,
      };
    }

    return { runId, levels };
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GET /testing/bugs/exported — List bugs that came from testing runs
  // ═══════════════════════════════════════════════════════════════════════
  app.get('/testing/bugs/exported', async (request, reply) => {
    const orgId = getOrgId(request);
    try {
      const db = await getDb();

      // Find projects created by testing module
      const testingProjects = await db.select()
        .from(projects)
        .where(and(
          eq((projects as any).orgId, orgId),
          sql`${projects.name} LIKE 'Testing:%'`,
        ));

      if (testingProjects.length === 0) {
        return { data: [], total: 0 };
      }

      const projectIds = testingProjects.map(p => p.id);
      const allErrors: any[] = [];

      for (const pid of projectIds) {
        const rows = await db.select()
          .from(errors)
          .where(eq(errors.projectId, pid))
          .orderBy(desc(errors.lastSeenAt));
        allErrors.push(...rows);
      }

      return {
        data: allErrors,
        total: allErrors.length,
        projects: testingProjects.map(p => ({ id: p.id, name: p.name })),
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch exported bugs' });
    }
  });


  /* ═══════════════════════════════════════════════════════════════════
   *  MODULE TESTING ENGINE — Test specific business modules
   *  Run targeted test suites for individual workflows like
   *  Customer Registration, Login, Trading, etc.
   * ═══════════════════════════════════════════════════════════════════ */

  // ── Available Modules Definition ──────────────────────────────────
  interface ModuleTestStep {
    name: string;
    method: 'GET' | 'POST';
    path: string;
    payload?: any;
    expect: {
      status?: number[];     // acceptable status codes
      bodyContains?: string[]; // response body must contain one of these
      bodyNotContains?: string[]; // response must NOT contain these (security)
      isJson?: boolean;
      hasField?: string[];   // JSON fields that must exist
    };
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
  }

  interface ModuleDefinition {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    steps: ModuleTestStep[];
  }

  const MODULE_DEFINITIONS: ModuleDefinition[] = [
    {
      id: 'customer_registration',
      name: 'Customer Registration',
      icon: '👤',
      description: 'Full customer signup flow: form validation, OTP generation, duplicate checks, final registration',
      category: 'kyc',
      steps: [
        // Step 1: Registration page loads
        {
          name: 'Registration Page Loads',
          method: 'GET',
          path: '/index.php/c_client_main/register',
          expect: { status: [200], bodyContains: ['registration', 'register', 'signup', 'cus_name', 'cus_mobile'] },
          severity: 'critical',
          description: 'Verify the registration page renders with all required form fields',
        },
        // Step 2: Empty form submission
        {
          name: 'Empty Form Rejection',
          method: 'POST',
          path: '/index.php/C_userregistration/DB_Controller/add_new',
          payload: {},
          expect: { status: [200, 302], bodyNotContains: ['Fatal error', 'Exception'] },
          severity: 'high',
          description: 'Submit empty registration form — should redirect with error, NOT crash',
        },
        // Step 3: Duplicate email check
        {
          name: 'Duplicate Email Validation (AJAX)',
          method: 'POST',
          path: '/index.php/C_userregistration/chech_email',
          payload: { group_id: 'test@example.com' },
          expect: { status: [200], bodyNotContains: ['Fatal error', 'Exception', 'SQL'] },
          severity: 'high',
          description: 'Check if email duplicate validation endpoint works without errors',
        },
        // Step 4: Duplicate phone check
        {
          name: 'Duplicate Phone Validation (AJAX)',
          method: 'POST',
          path: '/index.php/C_userregistration/chech_phoneno',
          payload: { mob_id: '9999999999' },
          expect: { status: [200], bodyNotContains: ['Fatal error', 'Exception', 'SQL'] },
          severity: 'high',
          description: 'Check if phone number duplicate validation works without errors',
        },
        // Step 5: Username uniqueness
        {
          name: 'Username Uniqueness Check',
          method: 'POST',
          path: '/index.php/C_userregistration/checkuserunique',
          payload: { username: 'test_cortexo_unique_' + Date.now() },
          expect: { status: [200], bodyNotContains: ['Fatal error', 'Exception'] },
          severity: 'medium',
          description: 'Verify username uniqueness check returns valid response',
        },
        // Step 6: OTP Generation (Mobile API)
        {
          name: 'Mobile API Registration + OTP',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_registration',
          payload: {
            name: 'Cortexo Test User',
            mobile: '0000000000',
            company: 'Cortexo Test Corp',
            email: 'cortexo-test-noexist@test.invalid',
            password: 'Test@123456',
            confirmpassword: 'Test@123456',
            cus_address: 'Test Address Line 1',
            company_GST: '',
            Pan_no: '',
            seccode: '',
          },
          expect: { status: [200], isJson: true },
          severity: 'critical',
          description: 'Mobile API registration with test data — should validate and respond (not crash)',
        },
        // Step 7: Mobile API validation — missing fields
        {
          name: 'Mobile API — Missing Fields Rejection',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_registration',
          payload: { name: '', mobile: '', company: '', email: '', password: '', confirmpassword: '' },
          expect: { status: [200], isJson: true, hasField: ['success', 'message'] },
          severity: 'high',
          description: 'Empty payload should return success:false with validation message',
        },
        // Step 8: Mobile API validation — invalid email
        {
          name: 'Mobile API — Invalid Email Rejection',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_registration',
          payload: { name: 'Test', mobile: '1234567890', company: 'Test Co', email: 'not-an-email', password: 'Test123', confirmpassword: 'Test123' },
          expect: { status: [200], isJson: true, bodyContains: ['email'] },
          severity: 'medium',
          description: 'Invalid email format should be caught by server-side validation',
        },
        // Step 9: Mobile API validation — password mismatch
        {
          name: 'Mobile API — Password Mismatch',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_registration',
          payload: { name: 'Test', mobile: '1234567890', company: 'Test Co', email: 'test@valid.com', password: 'Pass123', confirmpassword: 'Different456' },
          expect: { status: [200], isJson: true, bodyContains: ['password'] },
          severity: 'medium',
          description: 'Mismatched passwords should be rejected',
        },
        // Step 10: Mobile API validation — short password
        {
          name: 'Mobile API — Short Password',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_registration',
          payload: { name: 'Test', mobile: '1234567890', company: 'Test Co', email: 'test@valid.com', password: '12', confirmpassword: '12' },
          expect: { status: [200], isJson: true, bodyContains: ['password', 'minimum'] },
          severity: 'medium',
          description: 'Password under 6 chars should be rejected',
        },
        // Step 11: Mobile number validation API
        {
          name: 'Mobile Number Availability Check',
          method: 'GET',
          path: '/mobileapi/index.php/C_mobileclient/mobilenumbervalidation?mobile=0000000000',
          expect: { status: [200], isJson: true, hasField: ['success'] },
          severity: 'medium',
          description: 'Check if mobile number availability API responds correctly',
        },
        // Step 12: Resend OTP
        {
          name: 'Resend OTP Endpoint',
          method: 'GET',
          path: '/mobileapi/index.php/C_mobileclient/resendotp?mobile=0000000000&email=test@test.com',
          expect: { status: [200], isJson: true },
          severity: 'medium',
          description: 'Resend OTP endpoint should respond without crash',
        },
        // Step 13: SQL Injection on registration
        {
          name: 'SQLi Probe — Registration Mobile Field',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_registration',
          payload: { name: "Test'; DROP TABLE--", mobile: "' OR 1=1--", company: 'Test', email: 'test@test.com', password: 'Test123', confirmpassword: 'Test123' },
          expect: { status: [200, 400, 403, 500], bodyNotContains: ['SQL syntax', 'mysql_', 'ORA-', 'pg_query'] },
          severity: 'critical',
          description: 'SQL injection attempt should be safely handled without DB error exposure',
        },
        // Step 14: XSS in name field
        {
          name: 'XSS Probe — Name Field',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_registration',
          payload: { name: '<script>alert(1)</script>', mobile: '1234567890', company: 'Test', email: 'test@test.com', password: 'Test123', confirmpassword: 'Test123' },
          expect: { status: [200, 400], bodyNotContains: ['<script>'] },
          severity: 'high',
          description: 'Script tags in name field should be sanitized or rejected',
        },
        // Step 15: Invalid GST number
        {
          name: 'Invalid GST Number Validation',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_registration',
          payload: { name: 'Test', mobile: '1234567890', company: 'Test Co', email: 'test@valid.com', password: 'Test123', confirmpassword: 'Test123', company_GST: 'INVALIDGST' },
          expect: { status: [200], isJson: true, bodyContains: ['GST'] },
          severity: 'medium',
          description: 'Invalid GST number format should be rejected by validation',
        },
      ],
    },
    {
      id: 'user_login',
      name: 'User Login & Session',
      icon: '🔐',
      description: 'Login flow, session management, password recovery, and logout',
      category: 'auth',
      steps: [
        {
          name: 'Login Page Loads',
          method: 'GET',
          path: '/index.php/c_client_main/login',
          expect: { status: [200], bodyContains: ['login', 'password', 'username'] },
          severity: 'critical',
          description: 'Login page renders with username/password fields',
        },
        {
          name: 'Mobile API — Login with Invalid Credentials',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_login',
          payload: { username: 'invalid_user_999', password: 'wrong_pass', imieno: 'test', pushToken: '' },
          expect: { status: [200, 400], bodyNotContains: ['Fatal error', 'Exception', 'SQL'] },
          severity: 'critical',
          description: 'Invalid login should fail gracefully without exposing errors',
        },
        {
          name: 'Mobile API — Empty Login',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_login',
          payload: { username: '', password: '', imieno: '', pushToken: '' },
          expect: { status: [200, 400], bodyNotContains: ['Fatal error', 'SQL'] },
          severity: 'high',
          description: 'Empty login payload should be rejected safely',
        },
        {
          name: 'Forgot Password — Valid Flow',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/forgotPassword',
          payload: { username: '0000000000' },
          expect: { status: [200], isJson: true, hasField: ['success', 'message'] },
          severity: 'high',
          description: 'Forgot password should respond with success/failure message',
        },
        {
          name: 'Forgot Password — Empty Input',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/forgotPassword',
          payload: { username: '' },
          expect: { status: [200], isJson: true, bodyContains: ['Mobile No'] },
          severity: 'medium',
          description: 'Empty forgot password should prompt for mobile number',
        },
        {
          name: 'SQLi Probe — Login Username',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclient/user_login',
          payload: { username: "admin' OR '1'='1", password: "' OR '1'='1", imieno: 'test', pushToken: '' },
          expect: { status: [200, 400], bodyNotContains: ['SQL syntax', 'mysql_', 'ORA-'] },
          severity: 'critical',
          description: 'SQL injection in login fields should not expose DB errors',
        },
        {
          name: 'Username Check API',
          method: 'GET',
          path: '/mobileapi/index.php/C_mobileclient/checkusername?username=nonexistent_test_user',
          expect: { status: [200], isJson: true },
          severity: 'medium',
          description: 'Username availability check should respond with valid JSON',
        },
      ],
    },
    {
      id: 'rate_engine',
      name: 'Rate Engine & Live Prices',
      icon: '📊',
      description: 'Live rate feeds, commodity prices, API rate endpoints',
      category: 'rates',
      steps: [
        {
          name: 'Public Rate API',
          method: 'GET',
          path: '/api/apirate.php',
          expect: { status: [200], isJson: true },
          severity: 'critical',
          description: 'Main public rate API must respond with live rates',
        },
        {
          name: 'Homepage Loads',
          method: 'GET',
          path: '/',
          expect: { status: [200], bodyContains: ['gold', 'silver', 'rate', 'Gold', 'Silver', 'Rate'] },
          severity: 'critical',
          description: 'Homepage should contain rate display elements',
        },
        {
          name: 'Settings API',
          method: 'GET',
          path: '/api/getsettings.php',
          expect: { status: [200] },
          severity: 'high',
          description: 'Public settings API should be accessible',
        },
        {
          name: 'Mobile — App Version Check',
          method: 'GET',
          path: '/mobileapi/index.php/C_mobileclient/CheckAppVersion?version=1.2.9',
          expect: { status: [200], isJson: true, hasField: ['success'] },
          severity: 'high',
          description: 'App version check endpoint must return success field',
        },
        {
          name: 'Mobile — Marquee News',
          method: 'GET',
          path: '/mobileapi/index.php/C_mobileclient/MarqueNews',
          expect: { status: [200], isJson: true, hasField: ['success'] },
          severity: 'medium',
          description: 'Marquee news feed should return valid JSON',
        },
      ],
    },
    {
      id: 'trading_booking',
      name: 'Trading & Booking',
      icon: '💰',
      description: 'Commodity booking, trade operations, order management (requires auth)',
      category: 'trading',
      steps: [
        {
          name: 'Trade Commodities List (No Auth)',
          method: 'GET',
          path: '/mobileapi/index.php/C_mobileclienttrade/gettradecommodities',
          expect: { status: [200, 401, 403] },
          severity: 'high',
          description: 'Trade commodities endpoint behavior without authentication',
        },
        {
          name: 'Booking Without Auth — Should Block',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclienttrade/bookingRequest',
          payload: { cusid: '1', commodity: 'gold', weight: '10', type: 'buy' },
          expect: { status: [200, 401, 403], bodyNotContains: ['successfully', 'booked'] },
          severity: 'critical',
          description: 'Booking without login session must NOT succeed',
        },
        {
          name: 'Order Summary Without Auth',
          method: 'GET',
          path: '/mobileapi/index.php/C_mobileclienttrade/getOrderSummary',
          expect: { status: [200, 401, 403] },
          severity: 'high',
          description: 'Order summary should require authentication',
        },
        {
          name: 'Open Orders Without Auth',
          method: 'GET',
          path: '/mobileapi/index.php/C_mobileclienttrade/getOpenOrders',
          expect: { status: [200, 401, 403] },
          severity: 'high',
          description: 'Open orders list should require authentication',
        },
        {
          name: 'SQLi Probe — Booking cusid',
          method: 'POST',
          path: '/mobileapi/index.php/C_mobileclienttrade/bookingRequest',
          payload: { cusid: "1' OR 1=1--", commodity: 'gold', weight: '10' },
          expect: { status: [200, 400, 403, 500], bodyNotContains: ['SQL syntax', 'mysql_'] },
          severity: 'critical',
          description: 'SQL injection in booking customer ID field',
        },
      ],
    },
  ];

  // ── List available modules ──────────────────────────────────────
  app.get('/testing/module-definitions', async () => {
    return {
      data: MODULE_DEFINITIONS.map(m => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        description: m.description,
        category: m.category,
        stepCount: m.steps.length,
        criticalCount: m.steps.filter(s => s.severity === 'critical').length,
        highCount: m.steps.filter(s => s.severity === 'high').length,
      })),
    };
  });

  // ── Run module test ──────────────────────────────────────────────
  app.post('/testing/run-module', async (request, reply) => {
    const db = await getDb();
    const body = request.body as { targetId: number; moduleId: string };

    const module = MODULE_DEFINITIONS.find(m => m.id === body.moduleId);
    if (!module) return reply.code(400).send({ error: `Module "${body.moduleId}" not found` });

    // Get target
    const targets = await db.select().from(testTargets).where(eq(testTargets.id, body.targetId));
    if (!targets.length) return reply.code(404).send({ error: 'Target not found' });
    const baseUrl = targets[0].baseUrl.replace(/\/$/, '');

    // Create run record
    const [run] = await db.insert(testRuns).values({
      targetId: body.targetId,
      status: 'running',
      runType: 'module',
      total: module.steps.length,
    } as any).returning();

    const startTime = Date.now();
    const results: any[] = [];

    // Execute each step
    for (let i = 0; i < module.steps.length; i++) {
      const step = module.steps[i];
      const stepStart = Date.now();
      let status = 'passed';
      let statusCode: number | null = null;
      let error: string | null = null;
      let responseBody = '';
      let securityIssue: string | null = null;
      let schemaValid: boolean | null = null;
      const schemaErrors: string[] = [];

      try {
        const url = `${baseUrl}${step.path}`;
        const fetchOpts: RequestInit = {
          method: step.method,
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Cortexo-ModuleTester/1.0' },
          redirect: 'manual',
          signal: AbortSignal.timeout(15000),
        };

        if (step.method === 'POST' && step.payload) {
          fetchOpts.body = JSON.stringify(step.payload);
        }

        const res = await fetch(url, fetchOpts);
        statusCode = res.status;
        responseBody = await res.text().catch(() => '');

        // Check status code
        if (step.expect.status && !step.expect.status.includes(statusCode)) {
          // For redirects, accept them
          if (statusCode >= 300 && statusCode < 400) {
            // OK — redirect is acceptable
          } else {
            status = 'failed';
            error = `Expected status ${step.expect.status.join('|')}, got ${statusCode}`;
          }
        }

        // Check body contains
        if (step.expect.bodyContains && status === 'passed') {
          const bodyLower = responseBody.toLowerCase();
          const found = step.expect.bodyContains.some(s => bodyLower.includes(s.toLowerCase()));
          if (!found) {
            status = 'failed';
            error = `Response missing expected content: ${step.expect.bodyContains.join(' or ')}`;
          }
        }

        // Check body NOT contains (security)
        if (step.expect.bodyNotContains) {
          const bodyLower = responseBody.toLowerCase();
          for (const bad of step.expect.bodyNotContains) {
            if (bodyLower.includes(bad.toLowerCase())) {
              status = 'failed';
              securityIssue = bad.includes('SQL') || bad.includes('mysql') ? 'sql_exposure' :
                              bad.includes('script') ? 'xss_vulnerability' :
                              bad.includes('Fatal') ? 'php_fatal_error' : 'info_disclosure';
              error = `Response contains dangerous content: "${bad}"`;
              break;
            }
          }
        }

        // Check JSON validity
        if (step.expect.isJson && status === 'passed') {
          try {
            const json = JSON.parse(responseBody);
            schemaValid = true;

            // Check required fields
            if (step.expect.hasField) {
              for (const field of step.expect.hasField) {
                if (!(field in json)) {
                  schemaErrors.push(`Missing field: ${field}`);
                  schemaValid = false;
                }
              }
              if (!schemaValid) {
                status = 'failed';
                error = `Missing JSON fields: ${schemaErrors.join(', ')}`;
              }
            }
          } catch {
            status = 'failed';
            schemaValid = false;
            error = 'Expected JSON response but got non-JSON';
          }
        }

      } catch (err: any) {
        status = 'failed';
        error = err.name === 'TimeoutError' ? 'Request timed out (15s)' : err.message;
      }

      const latencyMs = Date.now() - stepStart;

      // Create a test case entry if not exists
      const caseKey = `${module.id}:${step.name}`;
      let caseRows = await db.select().from(testCases).where(
        and(eq(testCases.name, step.name), eq(testCases.category, module.category))
      );

      let caseId: number;
      if (caseRows.length === 0) {
        const [newCase] = await db.insert(testCases).values({
          name: step.name,
          endpoint: step.path,
          method: step.method,
          category: module.category,
          testType: 'module',
          businessModule: module.category,
          businessSeverity: step.severity,
        } as any).returning();
        caseId = newCase.id;
      } else {
        caseId = caseRows[0].id;
      }

      // Store result
      const [result] = await db.insert(testResults).values({
        runId: run.id,
        caseId,
        status,
        statusCode,
        latencyMs,
        responseBody: responseBody.slice(0, 2000),
        error,
        testLevel: 'L2',
        businessModule: module.category,
        businessSeverity: step.severity,
        schemaValid,
        schemaErrors: schemaErrors.length ? schemaErrors : null,
        securityIssue,
        flowStep: i + 1,
        flowName: `${module.name} — ${step.name}`,
      } as any).returning();

      results.push({
        step: i + 1,
        name: step.name,
        description: step.description,
        status,
        statusCode,
        latencyMs,
        error,
        severity: step.severity,
        securityIssue,
        schemaValid,
        schemaErrors: schemaErrors.length ? schemaErrors : undefined,
      });
    }

    const durationMs = Date.now() - startTime;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;

    // Build summary
    const summary = {
      module: module.id,
      moduleName: module.name,
      total: module.steps.length,
      passed,
      failed,
      criticalFails: results.filter(r => r.status === 'failed' && r.severity === 'critical').length,
      highFails: results.filter(r => r.status === 'failed' && r.severity === 'high').length,
      securityIssues: results.filter(r => r.securityIssue).map(r => ({
        step: r.name,
        issue: r.securityIssue,
        error: r.error,
      })),
      steps: results,
    };

    // Update run
    await db.update(testRuns).set({
      status: 'completed',
      passed,
      failed,
      durationMs,
      summary,
    } as any).where(eq(testRuns.id, run.id));

    return {
      data: {
        runId: run.id,
        module: module.id,
        moduleName: module.name,
        icon: module.icon,
        durationMs,
        total: module.steps.length,
        passed,
        failed,
        passRate: module.steps.length > 0 ? Math.round((passed / module.steps.length) * 100) : 0,
        criticalFails: summary.criticalFails,
        securityIssues: summary.securityIssues,
        steps: results,
      },
    };
  });

  // ── Get module test results for a run ────────────────────────────
  app.get('/testing/runs/:id/module-results', async (request, reply) => {
    const db = await getDb();
    const { id } = request.params as { id: string };

    const runs = await db.select().from(testRuns).where(eq(testRuns.id, Number(id)));
    if (!runs.length) return reply.code(404).send({ error: 'Run not found' });

    const run = runs[0];
    return {
      data: {
        runId: run.id,
        runType: (run as any).runType,
        status: run.status,
        total: run.total,
        passed: run.passed,
        failed: run.failed,
        durationMs: run.durationMs,
        summary: (run as any).summary,
        createdAt: run.createdAt,
      },
    };
  });
}

