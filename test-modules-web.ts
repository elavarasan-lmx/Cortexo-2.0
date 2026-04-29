/**
 * Quick Web (User Side) Module Test Runner
 * Tests public-facing pages of a Winbull client
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CLIENT_URL = 'http://www.mkrjewellers.com';
const CLIENT_SLUG = 'mkrjewellers';
const CONTROLLERS_PATH = '/run/media/lmx/LMX/Winbull/Personal/Cortexo/Wibull/application/controllers';
const TIMEOUT_MS = 15_000;

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

function parseController(filePath: string, name: string) {
  const content = readFileSync(filePath, 'utf-8');
  const methods: { name: string; testUrl: string }[] = [];
  const modelMatch = content.match(/\$model_name\s*=\s*['"]([^'"]+)['"]/);
  const modelName = modelMatch ? modelMatch[1] : '';

  const methodRegex = /(?:(public|private|protected)\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  const seen = new Set<string>();
  while ((match = methodRegex.exec(content)) !== null) {
    const mName = match[2];
    if (mName === '__construct' || mName === 'DB_Controller' || seen.has(mName)) continue;
    seen.add(mName);
    // Skip methods that are clearly POST-only write operations
    const writeOps = ['booking_request', 'booking_request_update', 'booking_request_cancel',
      'notifyBooking', 'contactussubmitt', 'contactussubmit', 'register',
      'ratealertRequest', 'ratealertDelete', 'quotation_confirm',
      'delivery_otp_verify', 'quotation_otp_send', 'accountdelete',
      'send_orderStatus', 'send_ratealertStatus', 'limit_expire',
      'update_tradeonoff', 'registeruserdata', 'verifyuserregotp', 'resendotp',
      'enquiry_mail', 'check_userpwd', 'login_validation'];
    if (writeOps.includes(mName)) continue;

    let testUrl = `/${name}/${mName}`;
    if (mName === 'open_entryform' && modelName) testUrl = `/${name}/${mName}/${modelName}/add_new`;
    methods.push({ name: mName, testUrl });
  }
  return methods;
}

async function testEndpoint(baseUrl: string, controller: string, method: { name: string; testUrl: string }): Promise<TestResult> {
  const url = `${baseUrl}${method.testUrl}`;
  const start = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'Cortexo-ModuleTester/1.0', 'Accept': 'text/html,application/json' },
      signal: ctrl.signal,
      redirect: 'manual',
    });
    clearTimeout(timer);
    const body = await res.text();
    const httpStatus = res.status;
    const responseTimeMs = Date.now() - start;

    let status: TestResult['status'] = 'pass';
    let errorDetail: string | undefined;

    if (httpStatus >= 300 && httpStatus < 400) status = 'redirect';
    else if (httpStatus === 403 || httpStatus === 401) status = 'auth_required';
    else if (httpStatus >= 400) status = 'error';

    if (body.includes('login') && body.includes('password') && body.includes('form') && httpStatus === 200) {
      status = 'auth_required';
    }

    if (body.includes('Fatal error') || body.includes('Parse error')) {
      status = 'crash';
      const m = body.match(/(Fatal error|Parse error)[^<\n]*/);
      errorDetail = m ? m[0].substring(0, 300) : 'PHP Error';
    }
    if (body.includes('A Database Error Occurred')) {
      status = 'crash';
      errorDetail = 'Database error';
    }
    if (body.includes('404 Page Not Found') || body.includes('The page you requested was not found')) {
      status = 'error';
      errorDetail = 'CodeIgniter 404';
    }

    return { controller, method: method.name, url: method.testUrl, status, httpStatus, responseTimeMs, contentLength: body.length, errorDetail };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      controller, method: method.name, url: method.testUrl,
      status: err.name === 'AbortError' ? 'timeout' : 'crash',
      httpStatus: null, responseTimeMs: Date.now() - start, contentLength: 0,
      errorDetail: err.message,
    };
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  CORTEXO MODULE TESTER — User Side (Web)                    ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Client:  ${CLIENT_SLUG.padEnd(48)}║`);
  console.log(`║  URL:     ${CLIENT_URL.padEnd(48)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Also test key public pages directly
  const publicPages = [
    { name: 'Homepage', testUrl: '/' },
    { name: 'Login Page', testUrl: '/C_client_main/login' },
    { name: 'About Us', testUrl: '/C_client_main/Aboutus' },
    { name: 'Contact Us', testUrl: '/C_client_main/Contactus' },
    { name: 'Terms', testUrl: '/C_client_main/Terms' },
    { name: 'Privacy', testUrl: '/C_client_main/Privacy' },
    { name: 'Gallery', testUrl: '/C_client_main/Gallery' },
    { name: 'News', testUrl: '/C_client_main/News' },
    { name: 'Product', testUrl: '/C_client_main/Product' },
    { name: 'Gold Gallery', testUrl: '/C_client_main/Gold' },
    { name: 'Silver Gallery', testUrl: '/C_client_main/Silver' },
    { name: 'Booking Page', testUrl: '/C_booking/rates' },
    { name: 'Rate Data', testUrl: '/C_rates/rate_data' },
    { name: 'RP Rate Data', testUrl: '/C_rates/rp_rate_data' },
    { name: 'Get Commodities', testUrl: '/C_booking/getcommodities' },
    { name: 'Marquee Text', testUrl: '/C_booking/getmarqueetext' },
    { name: 'Advertisements', testUrl: '/C_booking/getadvertisements' },
    { name: 'Historical Data', testUrl: '/C_booking/historicaldata' },
  ];

  console.log('── Public Pages ──────────────────────────────────────────────\n');
  const publicResults: TestResult[] = [];

  for (const page of publicPages) {
    const result = await testEndpoint(CLIENT_URL, 'PUBLIC', page);
    publicResults.push(result);
    const icon = result.status === 'pass' ? '✅' :
                 result.status === 'auth_required' ? '🔒' :
                 result.status === 'redirect' ? '↩️' :
                 result.status === 'crash' ? '💀' : '❌';
    const time = `${result.responseTimeMs}ms`.padStart(6);
    console.log(`  ${icon} ${time} | HTTP ${String(result.httpStatus || '---').padEnd(3)} | ${page.name}`);
    if (result.errorDetail) console.log(`         ↳ ${result.errorDetail}`);
  }

  // Test controllers
  console.log('\n── Controller Methods ────────────────────────────────────────\n');
  const files = readdirSync(CONTROLLERS_PATH).filter(f => f.startsWith('C_') && f.endsWith('.php'));
  const allResults: TestResult[] = [];
  const moduleSummaries: Array<{ controller: string; total: number; pass: number; auth: number; error: number; crash: number; score: number }> = [];

  for (const file of files) {
    const controllerName = file.replace('.php', '');
    const methods = parseController(join(CONTROLLERS_PATH, file), controllerName);
    if (methods.length === 0) continue;

    process.stdout.write(`Testing ${controllerName.padEnd(35)}`);
    let pass = 0, auth = 0, error = 0, crash = 0;

    for (const method of methods) {
      const result = await testEndpoint(CLIENT_URL, controllerName, method);
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

  // Combined results
  const combined = [...publicResults, ...allResults];
  const totalPass = combined.filter(r => r.status === 'pass').length;
  const totalAuth = combined.filter(r => r.status === 'auth_required' || r.status === 'redirect').length;
  const totalError = combined.filter(r => r.status === 'error').length;
  const totalCrash = combined.filter(r => r.status === 'crash' || r.status === 'timeout').length;

  console.log('\n' + '═'.repeat(70));
  console.log('USER SIDE SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total Endpoints Tested: ${combined.length}`);
  console.log(`  ✅ Pass:          ${totalPass}`);
  console.log(`  🔒 Auth Required: ${totalAuth}`);
  console.log(`  ❌ Error:         ${totalError}`);
  console.log(`  💀 Crash/Timeout: ${totalCrash}`);

  // Show issues
  const issues = combined.filter(r => r.status === 'error' || r.status === 'crash' || r.status === 'timeout');
  if (issues.length > 0) {
    console.log('\n' + '═'.repeat(70));
    console.log('ISSUES FOUND');
    console.log('═'.repeat(70));
    for (const i of issues) {
      const icon = i.status === 'crash' ? '💀' : '❌';
      console.log(`  ${icon} ${i.controller} → ${i.method} | HTTP ${i.httpStatus || 'N/A'} | ${i.responseTimeMs}ms`);
      if (i.errorDetail) console.log(`    ↳ ${i.errorDetail}`);
    }
  }

  // Slowest
  const sorted = [...combined].sort((a, b) => b.responseTimeMs - a.responseTimeMs);
  console.log('\n' + '═'.repeat(70));
  console.log('🐢 SLOWEST ENDPOINTS (Top 10)');
  console.log('═'.repeat(70));
  for (const s of sorted.slice(0, 10)) {
    console.log(`  ${s.responseTimeMs}ms | ${s.controller} → ${s.method} (${s.status})`);
  }

  // Save
  const reportPath = '/run/media/lmx/LMX/Winbull/Personal/Cortexo/module-test-web-report.json';
  writeFileSync(reportPath, JSON.stringify({
    client: CLIENT_SLUG, url: CLIENT_URL, layer: 'web',
    testedAt: new Date().toISOString(),
    summary: { total: combined.length, pass: totalPass, auth: totalAuth, error: totalError, crash: totalCrash },
    publicPages: publicResults, modules: moduleSummaries, results: allResults,
  }, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

main().catch(console.error);
