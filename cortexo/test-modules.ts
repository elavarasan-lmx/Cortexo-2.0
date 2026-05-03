/**
 * Quick Module Test Runner — Tests all admin modules against a live client.
 * Run: npx tsx test-modules.ts
 */
import { readdirSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const CLIENT_URL = 'http://www.mkrjewellers.com/admin';
const CLIENT_SLUG = 'mkrjewellers';
const CONTROLLERS_PATH = '/run/media/lmx/LMX/Winbull/Personal/Cortexo/Wibull/admin/application/controllers';
const TIMEOUT_MS = 15_000;

interface MethodInfo {
  name: string;
  testUrl: string;
  httpMethod: 'GET' | 'POST';
}

interface TestResult {
  controller: string;
  method: string;
  url: string;
  status: 'pass' | 'auth_required' | 'redirect' | 'error' | 'crash' | 'timeout';
  httpStatus: number | null;
  responseTimeMs: number;
  contentLength: number;
  errorDetail?: string;
}

// Parse a controller file
function parseController(filePath: string, name: string): MethodInfo[] {
  const content = readFileSync(filePath, 'utf-8');
  const methods: MethodInfo[] = [];
  const modelMatch = content.match(/\$model_name\s*=\s*['"]([^'"]+)['"]/);
  const modelName = modelMatch ? modelMatch[1] : '';

  const methodRegex = /(?:(public|private|protected)\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const mName = match[2];
    if (mName === '__construct') continue;
    // Skip DB_Controller (write operations)
    if (mName === 'DB_Controller') continue;
    
    let testUrl = `/${name}/${mName}`;
    if (mName === 'open_entryform' && modelName) {
      testUrl = `/${name}/${mName}/${modelName}/add_new`;
    }
    methods.push({ name: mName, testUrl, httpMethod: 'GET' });
  }
  return methods;
}

// Test a single endpoint
async function testEndpoint(baseUrl: string, method: MethodInfo): Promise<TestResult & { controller: string }> {
  const url = `${baseUrl}${method.testUrl}`;
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'Cortexo-ModuleTester/1.0' },
      signal: controller.signal,
      redirect: 'manual',
    });
    clearTimeout(timer);
    const responseTimeMs = Date.now() - start;
    const body = await res.text();
    const httpStatus = res.status;

    let status: TestResult['status'] = 'pass';
    let errorDetail: string | undefined;

    if (httpStatus >= 300 && httpStatus < 400) status = 'redirect';
    else if (httpStatus === 403 || httpStatus === 401) status = 'auth_required';
    else if (httpStatus >= 400) status = 'error';

    // Check for login page
    if (body.includes('login') && body.includes('password') && body.includes('form')) status = 'auth_required';
    if (body.includes('access_denied') || body.includes('Access Denied')) status = 'auth_required';

    // Check for PHP crashes
    if (body.includes('Fatal error') || body.includes('Parse error')) {
      status = 'crash';
      const crashMatch = body.match(/(Fatal error|Parse error)[^<\n]*/);
      errorDetail = crashMatch ? crashMatch[0].substring(0, 200) : 'PHP Error detected';
    }
    if (body.includes('Exception') && body.includes('Stack trace')) {
      status = 'crash';
      errorDetail = 'PHP Exception with stack trace';
    }
    if (body.includes('A Database Error Occurred')) {
      status = 'crash';
      errorDetail = 'Database error';
    }

    return {
      controller: '', method: method.name, url: method.testUrl,
      status, httpStatus, responseTimeMs, contentLength: body.length, errorDetail,
    };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      controller: '', method: method.name, url: method.testUrl,
      status: err.name === 'AbortError' ? 'timeout' : 'crash',
      httpStatus: null, responseTimeMs: Date.now() - start, contentLength: 0,
      errorDetail: err.message,
    };
  }
}

// Main
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  CORTEXO MODULE TESTER — Live Client Scan                   ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Client:  ${CLIENT_SLUG.padEnd(48)}║`);
  console.log(`║  URL:     ${CLIENT_URL.padEnd(48)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Discover controllers
  const files = readdirSync(CONTROLLERS_PATH).filter(f => f.startsWith('C_') && f.endsWith('.php'));
  console.log(`Found ${files.length} admin controllers\n`);

  const allResults: TestResult[] = [];
  const moduleSummaries: Array<{ controller: string; total: number; pass: number; auth: number; error: number; crash: number; score: number }> = [];

  for (const file of files) {
    const controllerName = file.replace('.php', '');
    const methods = parseController(join(CONTROLLERS_PATH, file), controllerName);

    if (methods.length === 0) continue;

    process.stdout.write(`Testing ${controllerName.padEnd(35)}`);
    let pass = 0, auth = 0, error = 0, crash = 0;

    for (const method of methods) {
      const result = await testEndpoint(CLIENT_URL, method);
      result.controller = controllerName;
      allResults.push(result);

      if (result.status === 'pass') pass++;
      else if (result.status === 'auth_required' || result.status === 'redirect') auth++;
      else if (result.status === 'error') error++;
      else crash++;
    }

    const total = methods.length;
    const score = total > 0 ? Math.round(((pass * 100 + auth * 80) / (total * 100)) * 100) : 0;
    moduleSummaries.push({ controller: controllerName, total, pass, auth, error, crash, score });

    const icon = crash > 0 ? '💀' : error > 0 ? '❌' : pass > 0 ? '✅' : '🔒';
    console.log(`${icon} ${total} methods | ✅${pass} 🔒${auth} ❌${error} 💀${crash} | Score: ${score}%`);
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));

  const totalTests = allResults.length;
  const totalPass = allResults.filter(r => r.status === 'pass').length;
  const totalAuth = allResults.filter(r => r.status === 'auth_required' || r.status === 'redirect').length;
  const totalError = allResults.filter(r => r.status === 'error').length;
  const totalCrash = allResults.filter(r => r.status === 'crash' || r.status === 'timeout').length;
  const overallScore = moduleSummaries.length > 0
    ? Math.round(moduleSummaries.reduce((s, m) => s + m.score, 0) / moduleSummaries.length)
    : 0;

  console.log(`Total Endpoints Tested: ${totalTests}`);
  console.log(`  ✅ Pass:          ${totalPass}`);
  console.log(`  🔒 Auth Required: ${totalAuth}`);
  console.log(`  ❌ Error:         ${totalError}`);
  console.log(`  💀 Crash/Timeout: ${totalCrash}`);
  console.log(`  Overall Score:    ${overallScore}%`);

  // Show crashes and errors
  const crashes = allResults.filter(r => r.status === 'crash' || r.status === 'timeout');
  const errors = allResults.filter(r => r.status === 'error');

  if (crashes.length > 0) {
    console.log('\n' + '═'.repeat(70));
    console.log('💀 CRASHES & TIMEOUTS (needs immediate fix)');
    console.log('═'.repeat(70));
    for (const c of crashes) {
      console.log(`  ${c.controller} → ${c.method}`);
      console.log(`    URL: ${c.url}`);
      console.log(`    HTTP: ${c.httpStatus || 'N/A'} | ${c.responseTimeMs}ms`);
      if (c.errorDetail) console.log(`    Error: ${c.errorDetail}`);
      console.log();
    }
  }

  if (errors.length > 0) {
    console.log('\n' + '═'.repeat(70));
    console.log('❌ ERRORS (HTTP 4xx/5xx)');
    console.log('═'.repeat(70));
    for (const e of errors) {
      console.log(`  ${e.controller} → ${e.method} | HTTP ${e.httpStatus} | ${e.responseTimeMs}ms`);
    }
  }

  // Top 5 slowest endpoints
  const sorted = [...allResults].sort((a, b) => b.responseTimeMs - a.responseTimeMs);
  console.log('\n' + '═'.repeat(70));
  console.log('🐢 SLOWEST ENDPOINTS (Top 10)');
  console.log('═'.repeat(70));
  for (const s of sorted.slice(0, 10)) {
    console.log(`  ${s.responseTimeMs}ms | ${s.controller} → ${s.method} (${s.status})`);
  }

  // Save report
  const reportPath = '/run/media/lmx/LMX/Winbull/Personal/Cortexo/module-test-report.json';
  writeFileSync(reportPath, JSON.stringify({
    client: CLIENT_SLUG,
    url: CLIENT_URL,
    testedAt: new Date().toISOString(),
    overallScore,
    summary: { totalTests, pass: totalPass, auth: totalAuth, error: totalError, crash: totalCrash },
    modules: moduleSummaries,
    results: allResults,
  }, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

main().catch(console.error);
