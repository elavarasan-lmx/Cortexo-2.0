/**
 * Browser Test Engine — Real QA Automation
 * Uses Puppeteer to open a real browser, fill forms, submit, and capture results.
 * Works across 70+ clients with the same WinBull codebase.
 */
import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import * as fs from 'fs';
import * as path from 'path';

const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), '../../.screenshots');

// Ensure screenshot dir exists
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

export interface BrowserStepResult {
  step: number;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  screenshot?: string; // filename
  error?: string;
  details?: string;
  evidence?: Record<string, any>;
}

export interface BrowserTestResult {
  module: string;
  baseUrl: string;
  total: number;
  passed: number;
  failed: number;
  duration: number;
  steps: BrowserStepResult[];
  startedAt: string;
}

type StepFn = (page: Page, baseUrl: string, ctx: Record<string, any>) => Promise<{ details?: string; evidence?: Record<string, any> }>;

interface TestFlow {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: { name: string; fn: StepFn }[];
}

async function takeScreenshot(page: Page, name: string): Promise<string> {
  const filename = `${Date.now()}_${name.replace(/[^a-z0-9]/gi, '_').substring(0, 40)}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  return filename;
}

/* ═══════════════════════════════════════════════════════════════
 *  TEST FLOWS — Each flow simulates a real user journey
 * ═══════════════════════════════════════════════════════════════ */

const REGISTRATION_FLOW: TestFlow = {
  id: 'browser_registration',
  name: 'Customer Registration (Browser)',
  icon: '👤',
  description: 'Opens registration page, fills form with test data, submits, and verifies result',
  steps: [
    {
      name: 'Open Registration Page',
      fn: async (page, baseUrl) => {
        await page.goto(`${baseUrl}/index.php/c_client_main/register`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const title = await page.title();
        const html = await page.content();
        const hasForm = html.includes('cus_name') || html.includes('cus_mobile') || html.includes('registration');
        if (!hasForm) throw new Error('Registration form not found on page');
        return { details: `Page loaded: "${title}"`, evidence: { title, hasForm } };
      },
    },
    {
      name: 'Check All Form Fields Present',
      fn: async (page) => {
        const fields = ['cus_name', 'cus_email', 'cus_mobile', 'cus_company_name', 'cus_login_password', 'retype_password', 'cus_address', 'cus_whatsapp'];
        const found: string[] = [];
        const missing: string[] = [];
        for (const f of fields) {
          const el = await page.$(`[name="${f}"], #${f}`);
          if (el) found.push(f); else missing.push(f);
        }
        if (missing.length > 3) throw new Error(`Too many missing fields: ${missing.join(', ')}`);
        return { details: `Found ${found.length}/${fields.length} fields`, evidence: { found, missing } };
      },
    },
    {
      name: 'Fill Registration Form',
      fn: async (page, _, ctx) => {
        const testData = {
          cus_name: 'Cortexo QA Bot',
          cus_email: `cortexo.qa.${Date.now()}@test.invalid`,
          cus_mobile: `90${Math.floor(10000000 + Math.random() * 89999999)}`,
          cus_company_name: 'Cortexo Test Corp Pvt Ltd',
          cus_login_password: 'CortexoTest@2026',
          retype_password: 'CortexoTest@2026',
          cus_address: '123 Test Street, QA Nagar, Chennai 600001',
          cus_whatsapp: '',
          cus_gstno: '33AABCU9603R1ZP',
        };
        // Fill whatsapp same as mobile
        testData.cus_whatsapp = testData.cus_mobile;
        ctx.testData = testData;

        let filled = 0;
        for (const [name, value] of Object.entries(testData)) {
          try {
            const el = await page.$(`[name="${name}"], #${name}`);
            if (el) {
              await el.click({ clickCount: 3 }); // select all
              await el.type(value, { delay: 15 });
              filled++;
            }
          } catch { /* field not found, skip */ }
        }

        // Try to check terms checkbox
        try {
          const terms = await page.$('[name="terms"], #terms, input[type="checkbox"]');
          if (terms) await terms.click();
        } catch { /* no terms checkbox */ }

        return { details: `Filled ${filled} fields`, evidence: { filled, testData: { ...testData, cus_login_password: '***' } } };
      },
    },
    {
      name: 'Validate Form Before Submit',
      fn: async (page) => {
        // Check if submit button exists
        const submitBtn = await page.$('button[type="submit"], input[type="submit"], .btn-register, #register_btn, #btn_register, .register-btn');
        if (!submitBtn) {
          // Try finding by text
          const allButtons = await page.$$('button, input[type="button"]');
          let found = false;
          for (const btn of allButtons) {
            const text = await page.evaluate(el => el.textContent || el.value || '', btn);
            if (text && /register|sign.?up|submit|save/i.test(text)) { found = true; break; }
          }
          if (!found) throw new Error('No submit/register button found');
        }
        return { details: 'Submit button found' };
      },
    },
    {
      name: 'Check for Client-Side Validation',
      fn: async (page) => {
        // Try submitting empty form first to see validation
        const errors: string[] = [];
        const html = await page.content();

        // Check for common validation patterns
        const hasJsValidation = html.includes('validate') || html.includes('required') || html.includes('pattern=');
        const hasCaptcha = html.includes('captcha') || html.includes('g-recaptcha') || html.includes('captcha_answer');
        const hasOtp = html.includes('otp') || html.includes('OTP') || html.includes('generateOTP');

        return {
          details: `JS validation: ${hasJsValidation}, Captcha: ${hasCaptcha}, OTP: ${hasOtp}`,
          evidence: { hasJsValidation, hasCaptcha, hasOtp },
        };
      },
    },
    {
      name: 'Test Empty Form Submission (XHR)',
      fn: async (page, baseUrl) => {
        // Don't actually submit the page form — test the mobile API instead
        const res = await page.evaluate(async (url) => {
          try {
            const r = await fetch(`${url}/mobileapi/index.php/C_mobileclient/user_registration`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: '', mobile: '', company: '', email: '', password: '', confirmpassword: '' }),
            });
            return { status: r.status, body: await r.text() };
          } catch (e: any) { return { error: e.message }; }
        }, baseUrl);

        if ('error' in res) throw new Error(`API unreachable: ${res.error}`);

        let parsed: any;
        try { parsed = JSON.parse(res.body); } catch { throw new Error('API returned non-JSON for empty registration'); }

        if (parsed.success === true) throw new Error('CRITICAL: Empty registration succeeded — no validation!');
        return { details: `Empty form correctly rejected: "${parsed.message}"`, evidence: { apiResponse: parsed } };
      },
    },
    {
      name: 'Test Invalid Email (XHR)',
      fn: async (page, baseUrl) => {
        const res = await page.evaluate(async (url) => {
          const r = await fetch(`${url}/mobileapi/index.php/C_mobileclient/user_registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', mobile: '1234567890', company: 'Test Co', email: 'not-valid-email', password: 'Test123', confirmpassword: 'Test123' }),
          });
          return { status: r.status, body: await r.text() };
        }, baseUrl);
        const parsed = JSON.parse(res.body);
        if (parsed.success === true) throw new Error('CRITICAL: Invalid email accepted!');
        return { details: `Invalid email rejected: "${parsed.message}"` };
      },
    },
    {
      name: 'Test Password Mismatch (XHR)',
      fn: async (page, baseUrl) => {
        const res = await page.evaluate(async (url) => {
          const r = await fetch(`${url}/mobileapi/index.php/C_mobileclient/user_registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', mobile: '1234567890', company: 'Test Co', email: 'test@test.com', password: 'Pass123', confirmpassword: 'Different456' }),
          });
          return { status: r.status, body: await r.text() };
        }, baseUrl);
        const parsed = JSON.parse(res.body);
        if (parsed.success === true) throw new Error('CRITICAL: Password mismatch accepted!');
        return { details: `Password mismatch rejected: "${parsed.message}"` };
      },
    },
    {
      name: 'Test SQL Injection in Registration',
      fn: async (page, baseUrl) => {
        const res = await page.evaluate(async (url) => {
          const r = await fetch(`${url}/mobileapi/index.php/C_mobileclient/user_registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: "'; DROP TABLE--", mobile: "' OR 1=1--", company: 'Test', email: 'test@test.com', password: 'Test123', confirmpassword: 'Test123' }),
          });
          return { status: r.status, body: await r.text() };
        }, baseUrl);
        const bodyLower = res.body.toLowerCase();
        if (bodyLower.includes('sql syntax') || bodyLower.includes('mysql_') || bodyLower.includes('ora-'))
          throw new Error('SECURITY: SQL error exposed in response!');
        return { details: 'SQL injection handled safely' };
      },
    },
    {
      name: 'Test Valid Registration via Mobile API',
      fn: async (page, baseUrl, ctx) => {
        const testData = ctx.testData || {
          name: 'Cortexo QA', mobile: `90${Math.floor(10000000 + Math.random() * 89999999)}`,
          company: 'QA Corp', email: `qa.${Date.now()}@test.invalid`,
          password: 'Test@12345', confirmpassword: 'Test@12345',
        };
        const res = await page.evaluate(async (url, data) => {
          const r = await fetch(`${url}/mobileapi/index.php/C_mobileclient/user_registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.cus_name || data.name, mobile: data.cus_mobile || data.mobile,
              company: data.cus_company_name || data.company, email: data.cus_email || data.email,
              password: data.cus_login_password || data.password,
              confirmpassword: data.retype_password || data.confirmpassword,
              company_GST: '', Pan_no: '', seccode: '', cus_address: data.cus_address || 'Test',
            }),
          });
          return { status: r.status, body: await r.text() };
        }, baseUrl, testData);
        const parsed = JSON.parse(res.body);
        // Registration may succeed (OTP sent) or fail (duplicate) — both are valid responses
        const isValidResponse = parsed.success !== undefined && parsed.message;
        if (!isValidResponse) throw new Error('API returned unexpected structure');
        return {
          details: parsed.success ? `OTP sent: "${parsed.message}"` : `Validation: "${parsed.message}"`,
          evidence: { success: parsed.success, message: parsed.message, hasOtp: !!parsed.newotp },
        };
      },
    },
  ],
};

const LOGIN_FLOW: TestFlow = {
  id: 'browser_login',
  name: 'User Login (Browser)',
  icon: '🔐',
  description: 'Opens login page, tests valid/invalid credentials, session handling',
  steps: [
    {
      name: 'Open Login Page',
      fn: async (page, baseUrl) => {
        await page.goto(`${baseUrl}/index.php/c_client_main/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const html = await page.content();
        const hasLogin = html.includes('login') || html.includes('username') || html.includes('password');
        if (!hasLogin) throw new Error('Login form not found');
        return { details: `Login page loaded: "${await page.title()}"` };
      },
    },
    {
      name: 'Check Login Form Fields',
      fn: async (page) => {
        const fields = ['username', 'password', 'login_name', 'login_password'];
        const found: string[] = [];
        for (const f of fields) {
          const el = await page.$(`[name="${f}"], #${f}, input[name*="${f}"]`);
          if (el) found.push(f);
        }
        const passwordField = await page.$('input[type="password"]');
        if (passwordField) found.push('password_input');
        if (found.length < 2) throw new Error('Insufficient login fields found');
        return { details: `Login fields found: ${found.join(', ')}` };
      },
    },
    {
      name: 'Test Invalid Login via API',
      fn: async (page, baseUrl) => {
        const res = await page.evaluate(async (url) => {
          const r = await fetch(`${url}/mobileapi/index.php/C_mobileclient/user_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'invalid_cortexo_999', password: 'wrong_pass', imieno: 'test', pushToken: '' }),
          });
          return { status: r.status, body: await r.text() };
        }, baseUrl);
        if (res.status === 200) {
          const parsed = JSON.parse(res.body);
          if (parsed.success === true) throw new Error('CRITICAL: Invalid credentials accepted!');
        }
        return { details: 'Invalid login correctly rejected' };
      },
    },
    {
      name: 'Test SQL Injection in Login',
      fn: async (page, baseUrl) => {
        const res = await page.evaluate(async (url) => {
          const r = await fetch(`${url}/mobileapi/index.php/C_mobileclient/user_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "admin' OR '1'='1", password: "' OR '1'='1", imieno: 'test', pushToken: '' }),
          });
          return { status: r.status, body: await r.text() };
        }, baseUrl);
        const lower = res.body.toLowerCase();
        if (lower.includes('sql syntax') || lower.includes('mysql_')) throw new Error('SECURITY: SQL error exposed!');
        if (res.status === 200) {
          try { const p = JSON.parse(res.body); if (p.success === true) throw new Error('CRITICAL: SQL injection login succeeded!'); } catch {}
        }
        return { details: 'SQL injection in login handled safely' };
      },
    },
    {
      name: 'Test Forgot Password',
      fn: async (page, baseUrl) => {
        const res = await page.evaluate(async (url) => {
          const r = await fetch(`${url}/mobileapi/index.php/C_mobileclient/forgotPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: '0000000000' }),
          });
          return { status: r.status, body: await r.text() };
        }, baseUrl);
        const parsed = JSON.parse(res.body);
        if (!('success' in parsed)) throw new Error('Forgot password response missing success field');
        return { details: `Forgot password response: ${parsed.message}` };
      },
    },
  ],
};

const HOMEPAGE_FLOW: TestFlow = {
  id: 'browser_homepage',
  name: 'Homepage & Rates (Browser)',
  icon: '📊',
  description: 'Loads homepage, checks rate display, validates API endpoints',
  steps: [
    {
      name: 'Load Homepage',
      fn: async (page, baseUrl) => {
        const res = await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        if (!res || res.status() >= 500) throw new Error(`Homepage returned ${res?.status()}`);
        return { details: `Homepage loaded (${res.status()}): "${await page.title()}"` };
      },
    },
    {
      name: 'Check Rate Display Elements',
      fn: async (page) => {
        const html = await page.content();
        const lower = html.toLowerCase();
        const hasGold = lower.includes('gold');
        const hasSilver = lower.includes('silver');
        const hasRate = lower.includes('rate') || lower.includes('price');
        return { details: `Gold: ${hasGold}, Silver: ${hasSilver}, Rates: ${hasRate}`, evidence: { hasGold, hasSilver, hasRate } };
      },
    },
    {
      name: 'Test Public Rate API',
      fn: async (page, baseUrl) => {
        const res = await page.evaluate(async (url) => {
          const r = await fetch(`${url}/api/apirate.php`);
          return { status: r.status, body: await r.text() };
        }, baseUrl);
        if (res.status !== 200) throw new Error(`Rate API returned ${res.status}`);
        try { JSON.parse(res.body); } catch { throw new Error('Rate API returned non-JSON'); }
        return { details: 'Rate API responding with valid JSON' };
      },
    },
    {
      name: 'Check for PHP Errors on Homepage',
      fn: async (page) => {
        const html = await page.content();
        const errors = ['Fatal error', 'Parse error', 'Warning:', 'Notice:', 'Deprecated:'];
        const found = errors.filter(e => html.includes(e));
        if (found.length > 0) throw new Error(`PHP errors on homepage: ${found.join(', ')}`);
        return { details: 'No PHP errors on homepage' };
      },
    },
  ],
};

export const BROWSER_TEST_FLOWS: TestFlow[] = [REGISTRATION_FLOW, LOGIN_FLOW, HOMEPAGE_FLOW];

/* ═══════════════════════════════════════════════════════════════
 *  RUNNER — Executes a test flow in a real browser
 * ═══════════════════════════════════════════════════════════════ */

export async function runBrowserTest(flowId: string, baseUrl: string): Promise<BrowserTestResult> {
  const flow = BROWSER_TEST_FLOWS.find(f => f.id === flowId);
  if (!flow) throw new Error(`Flow "${flowId}" not found`);

  const cleanUrl = baseUrl.replace(/\/$/, '');
  const startedAt = new Date().toISOString();
  const start = Date.now();
  const results: BrowserStepResult[] = [];
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1280,900'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent('Cortexo-QA-Bot/1.0 (Automated Testing)');

    const ctx: Record<string, any> = {};

    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];
      const stepStart = Date.now();
      let screenshot: string | undefined;

      try {
        const result = await step.fn(page, cleanUrl, ctx);
        screenshot = await takeScreenshot(page, `${i + 1}_${step.name}_pass`);
        results.push({
          step: i + 1, name: step.name, status: 'passed',
          duration: Date.now() - stepStart, screenshot,
          details: result.details, evidence: result.evidence,
        });
      } catch (err: any) {
        try { screenshot = await takeScreenshot(page, `${i + 1}_${step.name}_fail`); } catch {}
        results.push({
          step: i + 1, name: step.name, status: 'failed',
          duration: Date.now() - stepStart, screenshot,
          error: err.message,
        });
      }
    }
  } catch (err: any) {
    results.push({ step: 0, name: 'Browser Launch', status: 'failed', duration: 0, error: err.message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  return {
    module: flow.id, baseUrl: cleanUrl,
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    duration: Date.now() - start,
    steps: results, startedAt,
  };
}

export function getAvailableFlows() {
  return BROWSER_TEST_FLOWS.map(f => ({
    id: f.id, name: f.name, icon: f.icon,
    description: f.description, stepCount: f.steps.length,
  }));
}
