import type { FastifyInstance } from 'fastify';
import { getDb } from '../../lib/db.js';
import { testTargets, testCases, testRuns, testResults } from '@cortexo/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getOrgId } from '../../lib/request-context.js';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Testing — Module Definitions & Module Runner Routes
 *
 * GET  /testing/module-definitions          — List available test modules
 * POST /testing/run-module                  — Run tests for a specific module
 * GET  /testing/runs/:id/module-results     — Get module test results
 */
export async function moduleDefRoutes(app: FastifyInstance) {
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
      icon: 'UserCheck',
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
      icon: 'KeyRound',
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
      icon: 'BarChart3',
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
      icon: 'Wallet',
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
