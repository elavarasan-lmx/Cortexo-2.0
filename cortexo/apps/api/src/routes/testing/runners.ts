import type { FastifyInstance } from 'fastify';
import { getDb } from '../../lib/db.js';
import { testTargets, testCases, testRuns, testResults } from '@cortexo/db/schema';
import { eq, desc } from 'drizzle-orm';
import { classifyEndpoint, validateJsonSchema, doFetch } from './types.js';

/**
 * Testing — Test Runners (L1, L2, L3)
 *
 * POST /testing/run      — L1 quick run
 * POST /testing/run-full — All levels (L1+L2+L3)
 */
export async function runnerRoutes(app: FastifyInstance) {

  /* ─────────────────── L1 Quick Run ─────────────────── */

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

  /* ─────────────────── Full Run (L1 + L2 + L3) ─────────────────── */

  app.post('/testing/run-full', async (request) => {
    const db = await getDb();
    const body = request.body as any;
    const targetId = Number(body.targetId);
    const levels = body.levels || ['L1', 'L2', 'L3'];

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

        if (bodyLower.includes('sql') || bodyLower.includes('mysql') || bodyLower.includes('syntax error') ||
            bodyLower.includes('query') || bodyLower.includes('unknown column') || bodyLower.includes('table')) {
          issue = 'sql_injection';
          resultStatus = 'failed';
        }
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

        if (res.status >= 500) {
          issue = 'input_crash';
          resultStatus = 'failed';
        }
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
}
