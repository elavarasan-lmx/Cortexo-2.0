/**
 * Smoke Test Engine — Playwright-powered browser automation for DevOps health checks
 *
 * Test Types:
 *   - probe:      HTTP HEAD request (no browser needed)
 *   - login:      Fill credentials, submit form, check redirect
 *   - responsive: Test 3 viewport sizes with screenshots
 *   - links:      Scan for broken links on a page
 *
 * Adapted from packages/cli/src/testing/browser-helpers.ts for server-side execution.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';

const SCREENSHOT_DIR = resolve(process.cwd(), '../../.screenshots');

// Ensure screenshot dir exists
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SmokeTestResult {
  testType: string;
  url: string;
  success: boolean;
  durationMs: number;
  timestamp: string;
  details: Record<string, unknown>;
  screenshots: string[];
  errors: string[];
}

export interface LoginConfig {
  loginUrl: string;
  username: string;
  password: string;
  userSelector: string;
  passSelector: string;
  submitSelector: string;
}

// ─── Probe Test (no browser) ────────────────────────────────────────────────

export async function runProbeTest(url: string): Promise<SmokeTestResult> {
  const start = Date.now();
  const errors: string[] = [];

  try {
    const status = await httpHead(url, 8000);
    const durationMs = Date.now() - start;

    return {
      testType: 'probe',
      url,
      success: status !== null && status < 500,
      durationMs,
      timestamp: new Date().toISOString(),
      details: {
        httpStatus: status,
        statusText: status !== null ? (status < 400 ? 'OK' : 'Error') : 'Unreachable',
      },
      screenshots: [],
      errors: status === null ? ['Connection timed out or refused'] : [],
    };
  } catch (err: any) {
    return {
      testType: 'probe',
      url,
      success: false,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { error: err.message },
      screenshots: [],
      errors: [err.message],
    };
  }
}

// ─── Login Test (Playwright) ────────────────────────────────────────────────

export async function runLoginTest(
  url: string,
  config: LoginConfig
): Promise<SmokeTestResult> {
  const start = Date.now();
  const screenshots: string[] = [];
  const errors: string[] = [];
  let playwright: any;

  try {
    playwright = await import('playwright');
  } catch {
    return {
      testType: 'login',
      url,
      success: false,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { error: 'Playwright not installed. Run: npx playwright install chromium' },
      screenshots: [],
      errors: ['Playwright not available'],
    };
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    // Navigate to login page
    const targetUrl = config.loginUrl.startsWith('http')
      ? config.loginUrl
      : `${url.replace(/\/$/, '')}${config.loginUrl.startsWith('/') ? '' : '/'}${config.loginUrl}`;

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Screenshot before login
    const preScreenshot = `smoke-login-before-${crypto.randomBytes(4).toString('hex')}.png`;
    await page.screenshot({ path: join(SCREENSHOT_DIR, preScreenshot), fullPage: true });
    screenshots.push(preScreenshot);

    // Fill form
    const usernameInput = page.locator(config.userSelector).first();
    const passwordInput = page.locator(config.passSelector).first();

    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill(config.username);
    await passwordInput.fill(config.password);

    // Submit
    await page.locator(config.submitSelector).first().click();

    // Wait for navigation
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    const title = await page.title();

    // Screenshot after login
    const postScreenshot = `smoke-login-after-${crypto.randomBytes(4).toString('hex')}.png`;
    await page.screenshot({ path: join(SCREENSHOT_DIR, postScreenshot), fullPage: true });
    screenshots.push(postScreenshot);

    const loginSuccess = !finalUrl.toLowerCase().includes('login');

    return {
      testType: 'login',
      url: targetUrl,
      success: loginSuccess,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: {
        loginUrl: targetUrl,
        redirectedTo: finalUrl,
        pageTitle: title,
        loginSuccess,
      },
      screenshots,
      errors,
    };
  } catch (err: any) {
    errors.push(err.message);
    return {
      testType: 'login',
      url,
      success: false,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { error: err.message },
      screenshots,
      errors,
    };
  } finally {
    if (browser) await browser.close();
  }
}

// ─── Responsive Test (Playwright) ───────────────────────────────────────────

export async function runResponsiveTest(url: string): Promise<SmokeTestResult> {
  const start = Date.now();
  const screenshots: string[] = [];
  const errors: string[] = [];
  let playwright: any;

  try {
    playwright = await import('playwright');
  } catch {
    return {
      testType: 'responsive',
      url,
      success: false,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { error: 'Playwright not installed' },
      screenshots: [],
      errors: ['Playwright not available'],
    };
  }

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    const vpResults: any[] = [];

    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        ignoreHTTPSErrors: true,
      });
      const page = await context.newPage();
      const vpStart = Date.now();

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const loadTime = Date.now() - vpStart;

        const filename = `smoke-responsive-${vp.name.toLowerCase()}-${crypto.randomBytes(4).toString('hex')}.png`;
        await page.screenshot({ path: join(SCREENSHOT_DIR, filename), fullPage: true });
        screenshots.push(filename);

        vpResults.push({
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          loadTimeMs: loadTime,
          screenshot: filename,
          success: true,
        });
      } catch (err: any) {
        vpResults.push({
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          success: false,
          error: err.message,
        });
        errors.push(`${vp.name}: ${err.message}`);
      } finally {
        await context.close();
      }
    }

    return {
      testType: 'responsive',
      url,
      success: vpResults.every((v) => v.success),
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { viewports: vpResults },
      screenshots,
      errors,
    };
  } catch (err: any) {
    return {
      testType: 'responsive',
      url,
      success: false,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { error: err.message },
      screenshots,
      errors: [err.message],
    };
  } finally {
    if (browser) await browser.close();
  }
}

// ─── Links Test (Playwright) ────────────────────────────────────────────────

export async function runLinksTest(url: string): Promise<SmokeTestResult> {
  const start = Date.now();
  const errors: string[] = [];
  let playwright: any;

  try {
    playwright = await import('playwright');
  } catch {
    return {
      testType: 'links',
      url,
      success: false,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { error: 'Playwright not installed' },
      screenshots: [],
      errors: ['Playwright not available'],
    };
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Gather all links
    const hrefs: string[] = await page.locator('a[href]').evaluateAll(
      (links: HTMLAnchorElement[]) => links.map((l) => l.href).filter(Boolean)
    );

    const unique = [...new Set(hrefs)].filter(
      (h) => h.startsWith('http') && !h.startsWith('javascript:') && !h.startsWith('mailto:')
    );

    let working = 0;
    const broken: { url: string; status?: number; error?: string }[] = [];
    let internal = 0;
    let external = 0;

    const hostname = new URL(url).hostname;

    for (const link of unique.slice(0, 50)) {
      // Cap at 50 to prevent excessive test duration
      const isExt = !link.includes(hostname);
      if (isExt) external++;
      else internal++;

      const status = await httpHead(link, 5000);
      if (status !== null && status < 400) {
        working++;
      } else {
        broken.push({ url: link, status: status ?? undefined, error: status === null ? 'Unreachable' : undefined });
      }
    }

    return {
      testType: 'links',
      url,
      success: broken.length === 0,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: {
        total: unique.length,
        checked: Math.min(unique.length, 50),
        working,
        broken,
        internal,
        external,
      },
      screenshots: [],
      errors,
    };
  } catch (err: any) {
    return {
      testType: 'links',
      url,
      success: false,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { error: err.message },
      screenshots: [],
      errors: [err.message],
    };
  } finally {
    if (browser) await browser.close();
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function httpHead(url: string, timeoutMs: number): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const req = client.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'HEAD',
          timeout: timeoutMs,
          rejectUnauthorized: false,
        },
        (res) => resolve(res.statusCode ?? null)
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

// ─── Export available test types ────────────────────────────────────────────

export function getAvailableSmokeTests() {
  return [
    { id: 'probe', name: 'Health Probe', description: 'Quick HTTP status check (no browser)', requiresBrowser: false },
    { id: 'login', name: 'Login Flow', description: 'Automated login form submission + redirect check', requiresBrowser: true },
    { id: 'responsive', name: 'Responsive Design', description: 'Desktop/Tablet/Mobile viewport testing', requiresBrowser: true },
    { id: 'links', name: 'Link Checker', description: 'Scan page for broken links', requiresBrowser: true },
  ];
}
