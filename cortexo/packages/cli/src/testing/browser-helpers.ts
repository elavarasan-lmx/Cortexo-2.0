// Cortexo Browser Testing — Helper utilities
// Ported from playwright-skill/lib/helpers.js, adapted for DevOps server health checks
// Uses Playwright programmatically for headless smoke tests against deployed servers

import { existsSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execSync, ExecSyncOptionsWithBufferEncoding } from 'node:child_process';
import http from 'node:http';

const TEMP_DIR = join(homedir(), '.cortexo', 'test-runs');

// ──────────────────────────────────────────────────────────────────────────────
// Dev Server / Port Scanning (ported from helpers.js detectDevServers)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Probe a single URL to check if it's alive.
 * Returns HTTP status code or null if unreachable.
 */
export async function probeUrl(url: string, timeoutMs = 5000): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const req = http.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
          path: parsedUrl.pathname || '/',
          method: 'HEAD',
          timeout: timeoutMs,
        },
        (res) => {
          resolve(res.statusCode ?? null);
        }
      );
      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
      req.end();
    } catch {
      resolve(null);
    }
  });
}

/**
 * Detect running dev servers on common ports (from playwright-skill helpers).
 * Scans localhost for running web services.
 */
export async function detectLocalServers(
  customPorts: number[] = []
): Promise<Array<{ port: number; url: string }>> {
  const commonPorts = [3000, 3001, 3002, 5173, 8080, 8000, 4200, 5000, 9000, 1234, 4000, 8888];
  const allPorts = [...new Set([...commonPorts, ...customPorts])];
  const found: Array<{ port: number; url: string }> = [];

  const checks = allPorts.map(async (port) => {
    const status = await probeUrl(`http://localhost:${port}`, 1000);
    if (status !== null && status < 500) {
      found.push({ port, url: `http://localhost:${port}` });
    }
  });

  await Promise.all(checks);
  return found.sort((a, b) => a.port - b.port);
}

// ──────────────────────────────────────────────────────────────────────────────
// Playwright Script Execution (ported from run.js universal executor)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Check if Playwright is installed system-wide or in cortexo dir
 */
export function isPlaywrightInstalled(): boolean {
  try {
    execSync('npx playwright --version 2>/dev/null', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wrap inline Playwright code in a complete executable script.
 * Ported from run.js wrapCodeIfNeeded() — handles partial snippets.
 */
function wrapPlaywrightCode(code: string, headless: boolean): string {
  const hasRequire = code.includes('require(');
  const hasAsyncIIFE = code.includes('(async () =>') || code.includes('(async()=>');

  if (hasRequire && hasAsyncIIFE) return code;

  if (!hasRequire) {
    return `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: ${headless} });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  try {
    ${code}
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
`;
  }

  return code;
}

/**
 * Execute a Playwright script and return stdout/stderr.
 * Ported from run.js execution pipeline — temp file strategy.
 */
export function executePlaywrightScript(
  code: string,
  opts: { headless?: boolean; timeout?: number; cwd?: string } = {}
): { success: boolean; output: string; error?: string } {
  if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
  }

  const headless = opts.headless ?? true; // Default headless for CI/DevOps
  const wrapped = wrapPlaywrightCode(code, headless);
  const tempFile = join(TEMP_DIR, `.cortexo-test-${Date.now()}.js`);

  try {
    writeFileSync(tempFile, wrapped, 'utf-8');

    const execOpts: ExecSyncOptionsWithBufferEncoding = {
      encoding: 'buffer',
      timeout: opts.timeout || 60_000,
      cwd: opts.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    };

    const result = execSync(`node "${tempFile}"`, execOpts);
    return { success: true, output: result.toString('utf-8') };
  } catch (err: any) {
    const stdout = err.stdout?.toString('utf-8') || '';
    const stderr = err.stderr?.toString('utf-8') || '';
    return { success: false, output: stdout, error: stderr || err.message };
  } finally {
    // Safe cleanup (ported from run.js cleanupOldTempFiles pattern)
    try {
      if (existsSync(tempFile)) unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Smoke Test Templates — Pre-built Playwright scripts for DevOps
// ──────────────────────────────────────────────────────────────────────────────

/** Generate a health-check / smoke test script for a given URL */
export function generateSmokeTestScript(targetUrl: string): string {
  return `
// Cortexo Auto-Generated Smoke Test
const startTime = Date.now();

await page.goto('${targetUrl}', {
  waitUntil: 'domcontentloaded',
  timeout: 30000,
});

const loadTime = Date.now() - startTime;
const title = await page.title();
const statusCode = (await page.evaluate(() => window.performance?.getEntriesByType('navigation')?.[0]?.responseStatus)) || 'N/A';

console.log(JSON.stringify({
  url: '${targetUrl}',
  status: 'ok',
  title: title,
  loadTimeMs: loadTime,
  httpStatus: statusCode,
  timestamp: new Date().toISOString(),
}));

// Check for JS errors
const jsErrors = [];
page.on('pageerror', (err) => jsErrors.push(err.message));

// Check for console errors
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

// Wait a beat for dynamic content
await page.waitForTimeout(2000);

if (jsErrors.length > 0) {
  console.log(JSON.stringify({ jsErrors }));
}
if (consoleErrors.length > 0) {
  console.log(JSON.stringify({ consoleErrors }));
}

await page.screenshot({
  path: '/tmp/cortexo-smoke-${Date.now()}.png',
  fullPage: true,
});
`;
}

/** Generate a login flow test script */
export function generateLoginTestScript(
  targetUrl: string,
  credentials: { username: string; password: string },
  selectors?: { username?: string; password?: string; submit?: string }
): string {
  const usernameSelector = selectors?.username || 'input[name="email"], input[name="username"], #email, #username';
  const passwordSelector = selectors?.password || 'input[name="password"], #password';
  const submitSelector = selectors?.submit || 'button[type="submit"], input[type="submit"]';

  return `
// Cortexo Auto-Generated Login Flow Test
await page.goto('${targetUrl}', { waitUntil: 'domcontentloaded' });

// Fill login form (using safe patterns from playwright-skill helpers)
const usernameInput = page.locator('${usernameSelector}').first();
const passwordInput = page.locator('${passwordSelector}').first();

await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
await usernameInput.fill('${credentials.username}');
await passwordInput.fill('${credentials.password}');

await page.locator('${submitSelector}').first().click();

// Wait for navigation
await page.waitForTimeout(3000);

const finalUrl = page.url();
const title = await page.title();

console.log(JSON.stringify({
  loginUrl: '${targetUrl}',
  redirectedTo: finalUrl,
  pageTitle: title,
  loginSuccess: !finalUrl.includes('login'),
  timestamp: new Date().toISOString(),
}));

await page.screenshot({ path: '/tmp/cortexo-login-result.png', fullPage: true });
`;
}

/** Generate a responsive viewport test script */
export function generateResponsiveTestScript(targetUrl: string): string {
  return `
// Cortexo Auto-Generated Responsive Test
const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
];

const results = [];

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const startTime = Date.now();
  await page.goto('${targetUrl}', { waitUntil: 'domcontentloaded' });
  const loadTime = Date.now() - startTime;

  const screenshotPath = '/tmp/cortexo-responsive-' + vp.name.toLowerCase() + '.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  results.push({
    viewport: vp.name,
    width: vp.width,
    height: vp.height,
    loadTimeMs: loadTime,
    screenshot: screenshotPath,
  });
}

console.log(JSON.stringify({ url: '${targetUrl}', viewports: results }));
`;
}

/** Generate a broken links checker script */
export function generateLinkCheckScript(targetUrl: string): string {
  return `
// Cortexo Auto-Generated Link Checker
await page.goto('${targetUrl}', { waitUntil: 'domcontentloaded' });

const links = await page.locator('a[href]').all();
const results = { total: links.length, working: 0, broken: [], internal: 0, external: 0 };

for (const link of links) {
  const href = await link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) continue;

  const isExternal = href.startsWith('http') && !href.includes(new URL('${targetUrl}').hostname);
  if (isExternal) { results.external++; } else { results.internal++; }

  try {
    const fullUrl = href.startsWith('http') ? href : new URL(href, '${targetUrl}').href;
    const response = await page.request.head(fullUrl, { timeout: 5000 });
    if (response.ok()) {
      results.working++;
    } else {
      results.broken.push({ url: fullUrl, status: response.status() });
    }
  } catch (e) {
    results.broken.push({ url: href, error: e.message });
  }
}

console.log(JSON.stringify(results));
`;
}
