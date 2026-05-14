import type { FastifyInstance } from 'fastify';
import { getDb } from '../../lib/db.js';
import { testTargets, testCases, testRuns, testResults, errors, errorEvents, projects } from '@cortexo/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getOrgId } from '../../lib/request-context.js';
import crypto from 'crypto';

/**
 * Testing — Bug Analysis & Export Routes
 *
 * GET  /testing/bugs/:runId        — Smart bug classification
 * POST /testing/bugs/:runId/export — Export bugs to error tracker
 * GET  /testing/bugs/exported      — List exported bugs
 */
export async function bugRoutes(app: FastifyInstance) {
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

}
