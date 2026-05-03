/**
 * Module Tester — Discovers PHP controllers and tests each module endpoint
 * against a selected client's live server.
 *
 * Workflow:
 *   1. Scan the Winbull base code to discover all PHP controllers
 *   2. Parse each controller's methods (open_listingform, open_entryform, DB_Controller, etc.)
 *   3. Hit each endpoint via HTTP against the selected client's URL
 *   4. Classify results: pass (2xx), redirect (3xx), auth-required (login page), error (4xx/5xx), crash (timeout/exception)
 *   5. Return a detailed per-module report
 *
 * Usage:
 *   const report = await testModule('maharaj', 'http://maharaj.com/admin', 'C_marqueetext');
 *   const fullReport = await testAllModules('maharaj', 'http://maharaj.com/admin');
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ── Types ──────────────────────────────────────────────────────────

export interface ModuleInfo {
  controller: string;       // e.g. 'C_marqueetext'
  file: string;             // e.g. 'C_marqueetext.php'
  layer: 'admin' | 'web';   // which app layer
  methods: MethodInfo[];
  menuCode: number | null;
  modelName: string | null;
}

export interface MethodInfo {
  name: string;
  visibility: 'public' | 'private' | 'protected' | 'default';
  params: string[];
  testUrl: string;            // relative URL to test
  isCrud: boolean;            // is it a standard CRUD method
  method: 'GET' | 'POST';    // HTTP method to use for testing
}

export interface EndpointTestResult {
  method: string;
  url: string;
  httpMethod: 'GET' | 'POST';
  status: 'pass' | 'auth_required' | 'redirect' | 'error' | 'crash' | 'timeout';
  httpStatus: number | null;
  responseTimeMs: number;
  contentLength: number;
  hasHtml: boolean;           // did it return HTML content
  hasJson: boolean;           // did it return JSON
  errorMessage?: string;
}

export interface ModuleTestReport {
  clientSlug: string;
  clientUrl: string;
  controller: string;
  layer: 'admin' | 'web';
  testedAt: string;
  durationMs: number;
  methods: MethodInfo[];
  results: EndpointTestResult[];
  summary: {
    total: number;
    pass: number;
    authRequired: number;
    redirect: number;
    error: number;
    crash: number;
  };
  score: number;              // 0-100 health score
}

export interface FullTestReport {
  clientSlug: string;
  clientUrl: string;
  testedAt: string;
  totalDurationMs: number;
  modulesScanned: number;
  modulesTested: number;
  overallScore: number;
  modules: ModuleTestReport[];
  summary: {
    totalEndpoints: number;
    pass: number;
    authRequired: number;
    error: number;
    crash: number;
  };
}

// ── Module Discovery ────────────────────────────────────────────────

/**
 * Parse a PHP controller file to extract methods and metadata.
 */
function parseController(filePath: string, controllerName: string, layer: 'admin' | 'web'): ModuleInfo {
  const content = readFileSync(filePath, 'utf-8');
  const methods: MethodInfo[] = [];

  // Extract menu_code
  const menuMatch = content.match(/\$menu_code\s*=\s*(\d+)/);
  const menuCode = menuMatch ? parseInt(menuMatch[1]) : null;

  // Extract model_name
  const modelMatch = content.match(/\$model_name\s*=\s*['"]([^'"]+)['"]/);
  const modelName = modelMatch ? modelMatch[1] : null;

  // Extract methods using regex
  const methodRegex = /(?:(public|private|protected)\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;

  while ((match = methodRegex.exec(content)) !== null) {
    const visibility = (match[1] || 'default') as MethodInfo['visibility'];
    const name = match[2];
    const paramsRaw = match[3].trim();
    const params = paramsRaw ? paramsRaw.split(',').map(p => p.trim().replace(/\$/, '').split('=')[0].trim()) : [];

    // Skip constructor and internal helpers
    if (name === '__construct') continue;

    // Determine if it's a standard CRUD method
    const crudMethods = ['open_listingform', 'open_entryform', 'DB_Controller', 'index'];
    const isCrud = crudMethods.includes(name);

    // Determine HTTP method
    const httpMethod: 'GET' | 'POST' = name === 'DB_Controller' ? 'POST' : 'GET';

    // Build test URL
    let testUrl = `/${controllerName}/${name}`;
    if (name === 'open_entryform' && modelName) {
      testUrl = `/${controllerName}/${name}/${modelName}/add_new`;
    }

    methods.push({ name, visibility, params, testUrl, isCrud, method: httpMethod });
  }

  return { controller: controllerName, file: `${controllerName}.php`, layer, methods, menuCode, modelName };
}

/**
 * Discover all PHP controllers in the Winbull base code.
 */
export function discoverModules(basePath: string): ModuleInfo[] {
  const modules: ModuleInfo[] = [];

  // Scan admin controllers
  const adminControllerPath = join(basePath, 'admin', 'application', 'controllers');
  if (existsSync(adminControllerPath)) {
    const files = readdirSync(adminControllerPath).filter(f => f.startsWith('C_') && f.endsWith('.php'));
    for (const file of files) {
      const controllerName = file.replace('.php', '');
      try {
        const module = parseController(join(adminControllerPath, file), controllerName, 'admin');
        modules.push(module);
      } catch { /* skip unparseable */ }
    }
  }

  // Scan web controllers
  const webControllerPath = join(basePath, 'application', 'controllers');
  if (existsSync(webControllerPath)) {
    const files = readdirSync(webControllerPath).filter(f => f.startsWith('C_') && f.endsWith('.php'));
    for (const file of files) {
      const controllerName = file.replace('.php', '');
      try {
        const module = parseController(join(webControllerPath, file), controllerName, 'web');
        modules.push(module);
      } catch { /* skip unparseable */ }
    }
  }

  return modules;
}

// ── Endpoint Testing ────────────────────────────────────────────────

/**
 * Test a single endpoint against a client's live server.
 */
async function testEndpoint(
  baseUrl: string,
  method: MethodInfo,
  sessionCookie?: string,
  timeoutMs = 15_000,
): Promise<EndpointTestResult> {
  const url = `${baseUrl}${method.testUrl}`;
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Cortexo-ModuleTester/1.0',
      'Accept': 'text/html,application/json',
    };
    if (sessionCookie) headers['Cookie'] = sessionCookie;

    const res = await fetch(url, {
      method: method.method,
      headers,
      signal: controller.signal,
      redirect: 'manual',  // Don't follow redirects — we want to detect them
    });
    clearTimeout(timer);

    const responseTimeMs = Date.now() - start;
    const contentType = res.headers.get('content-type') || '';
    const body = await res.text();
    const httpStatus = res.status;

    // Classify the result
    let status: EndpointTestResult['status'] = 'pass';

    if (httpStatus >= 300 && httpStatus < 400) {
      status = 'redirect';
    } else if (httpStatus === 403 || httpStatus === 401) {
      status = 'auth_required';
    } else if (httpStatus >= 400) {
      status = 'error';
    }

    // Check if response is a login page (auth redirect via HTML)
    const isLoginPage = body.includes('login') && body.includes('password') && body.includes('form');
    const isAccessDenied = body.includes('access_denied') || body.includes('Access Denied');
    if (isLoginPage || isAccessDenied) {
      status = 'auth_required';
    }

    // Check for PHP fatal errors in response
    const hasPhpError = body.includes('Fatal error') || body.includes('Parse error') ||
                        body.includes('Exception') || body.includes('Stack trace');
    if (hasPhpError && httpStatus < 400) {
      status = 'crash';
    }

    return {
      method: method.name,
      url: method.testUrl,
      httpMethod: method.method,
      status,
      httpStatus,
      responseTimeMs,
      contentLength: body.length,
      hasHtml: contentType.includes('html') || body.includes('<html'),
      hasJson: contentType.includes('json'),
      errorMessage: hasPhpError ? body.substring(0, 500) : undefined,
    };
  } catch (err: any) {
    clearTimeout(timer);
    const responseTimeMs = Date.now() - start;

    return {
      method: method.name,
      url: method.testUrl,
      httpMethod: method.method,
      status: err.name === 'AbortError' ? 'timeout' : 'crash',
      httpStatus: null,
      responseTimeMs,
      contentLength: 0,
      hasHtml: false,
      hasJson: false,
      errorMessage: err.message,
    };
  }
}

// ── Module Testing ──────────────────────────────────────────────────

/**
 * Test a single module against a client's live server.
 */
export async function testModule(
  clientSlug: string,
  clientUrl: string,
  module: ModuleInfo,
  sessionCookie?: string,
): Promise<ModuleTestReport> {
  const start = Date.now();
  const results: EndpointTestResult[] = [];

  // Only test GET methods (safe to test without side effects)
  // Skip DB_Controller (POST/write operations) to avoid data modification
  const testable = module.methods.filter(m =>
    m.method === 'GET' && m.visibility !== 'private' && m.name !== '__construct'
  );

  for (const method of testable) {
    const result = await testEndpoint(clientUrl, method, sessionCookie);
    results.push(result);
  }

  const summary = {
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    authRequired: results.filter(r => r.status === 'auth_required').length,
    redirect: results.filter(r => r.status === 'redirect').length,
    error: results.filter(r => r.status === 'error').length,
    crash: results.filter(r => r.status === 'crash' || r.status === 'timeout').length,
  };

  // Score: pass = 100%, auth_required = 80% (expected for admin), error = 0%, crash = 0%
  const maxScore = results.length * 100;
  const earned = summary.pass * 100 + summary.authRequired * 80 + summary.redirect * 60;
  const score = maxScore > 0 ? Math.round(earned / maxScore) : 0;

  return {
    clientSlug,
    clientUrl,
    controller: module.controller,
    layer: module.layer,
    testedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
    methods: module.methods,
    results,
    summary,
    score,
  };
}

/**
 * Test ALL modules against a client's live server.
 */
export async function testAllModules(
  clientSlug: string,
  clientUrl: string,
  basePath: string,
  sessionCookie?: string,
  layer?: 'admin' | 'web',
): Promise<FullTestReport> {
  const start = Date.now();
  const allModules = discoverModules(basePath);
  const filteredModules = layer ? allModules.filter(m => m.layer === layer) : allModules;
  const reports: ModuleTestReport[] = [];

  for (const module of filteredModules) {
    const report = await testModule(clientSlug, clientUrl, module, sessionCookie);
    reports.push(report);
  }

  const totalEndpoints = reports.reduce((s, r) => s + r.summary.total, 0);
  const totalPass = reports.reduce((s, r) => s + r.summary.pass, 0);
  const totalAuth = reports.reduce((s, r) => s + r.summary.authRequired, 0);
  const totalError = reports.reduce((s, r) => s + r.summary.error, 0);
  const totalCrash = reports.reduce((s, r) => s + r.summary.crash, 0);
  const overallScore = reports.length > 0
    ? Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length)
    : 0;

  return {
    clientSlug,
    clientUrl,
    testedAt: new Date().toISOString(),
    totalDurationMs: Date.now() - start,
    modulesScanned: allModules.length,
    modulesTested: filteredModules.length,
    overallScore,
    modules: reports.sort((a, b) => a.score - b.score), // worst first
    summary: {
      totalEndpoints,
      pass: totalPass,
      authRequired: totalAuth,
      error: totalError,
      crash: totalCrash,
    },
  };
}
