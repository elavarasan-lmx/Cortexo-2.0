import type { FastifyInstance } from 'fastify';
import { getDb } from '../../lib/db.js';
import { testCases, testResults, testRuns } from '@cortexo/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Testing — Module Grouping Routes
 *
 * GET /testing/modules         — Group test cases by business module
 * GET /testing/modules/:runId  — Get module results for a specific run
 */
export async function moduleRoutes(app: FastifyInstance) {
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
}
