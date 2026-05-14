// Cortexo Responsive Validator — Ported from BullionLite Mobile Testing Suite
// Original sources:
//   - MobileScreenValidator.java — structured responsive check suite
//   - MobileViewUtil.java — viewport meta, overflow, hamburger detection, popup handling
//   - Bfun.closePopupIfPresent() — multi-locator modal dismissal with JS fallback
//
// Adapted for Playwright (TypeScript) instead of Selenium (Java).
// All checks are browser-based via Playwright's evaluate() — zero external deps.

import type { DeviceProfile } from './device-profiles.js';

/**
 * Individual responsive check result.
 */
export interface ResponsiveCheck {
  /** Name of the check */
  name: string;
  /** Whether the check passed */
  passed: boolean;
  /** Which device profile was used */
  device: string;
  /** Page/URL being validated */
  page: string;
  /** Optional detail message */
  detail?: string;
  /** Severity: 'critical' = blocks functionality, 'warning' = visual issue */
  severity: 'critical' | 'warning' | 'info';
}

/**
 * Full responsive validation report for a page.
 */
export interface ResponsiveValidationResult {
  /** URL or page name tested */
  pageName: string;
  /** Device profile used */
  device: DeviceProfile;
  /** Individual check results */
  checks: ResponsiveCheck[];
  /** Whether all critical checks passed */
  allCriticalPassed: boolean;
  /** Screenshot path if captured */
  screenshotPath?: string;
}

// ── ANSI Color Codes (ported from MobileViewUtil.java) ──
const RESET = '\x1B[0m';
const GREEN = '\x1B[32m';
const ORANGE = '\x1B[38;5;208m';

/**
 * Log a responsive check to console.
 * Ported from MobileViewUtil.logCheck() in Java.
 */
function logCheck(checkName: string, passed: boolean, deviceName: string): void {
  const prefix = `[${deviceName}] ${checkName}`;
  if (passed) {
    console.log(`${GREEN}[PASS] ${RESET}${prefix}`);
  } else {
    console.log(`${ORANGE}[WARN] ${RESET}${prefix} -> NOT RESPONSIVE`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// JS snippets to evaluate inside Playwright page context
// These are the TypeScript equivalents of MobileViewUtil's Selenium JS calls
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Check if viewport meta tag exists and is valid.
 * Ported from MobileViewUtil.hasViewportMetaTag() — line 137-148 of Java.
 */
export const JS_CHECK_VIEWPORT_META = `
  (() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return { found: false, content: '' };
    const content = meta.getAttribute('content') || '';
    return { found: true, content, valid: content.includes('width=device-width') };
  })()
`;

/**
 * Check for horizontal overflow (broken responsive layout).
 * Ported from MobileViewUtil.hasHorizontalOverflow() — line 157-170 of Java.
 */
export const JS_CHECK_HORIZONTAL_OVERFLOW = `
  (() => {
    const scrollWidth = document.body.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    return { scrollWidth, clientWidth, overflow: scrollWidth > clientWidth };
  })()
`;

/**
 * Check if a hamburger/toggle menu is visible.
 * Ported from MobileViewUtil.isHamburgerMenuVisible() — line 109-128 of Java.
 */
export const JS_CHECK_HAMBURGER = `
  (() => {
    const selectors = [
      '.navbar-toggle', '.navbar-toggler', '.hamburger',
      'button.toggle', 'button[data-toggle="collapse"]',
      'button[data-bs-toggle="collapse"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) {
        return { found: true, selector: sel };
      }
    }
    return { found: false, selector: '' };
  })()
`;

/**
 * Check if page body is loaded and non-empty.
 * Ported from MobileScreenValidator.java — line 58-65.
 */
export const JS_CHECK_BODY_LOADED = `
  (() => {
    const body = document.querySelector('body');
    if (!body) return { loaded: false, textLength: 0 };
    const text = body.innerText.trim();
    return { loaded: text.length > 0, textLength: text.length };
  })()
`;

/**
 * Check for duplicate visible menus (responsive layout issue).
 * Ported from MobileScreenValidator.verifyNoDuplicateMenus() — line 88-108 of Java.
 */
export const JS_CHECK_DUPLICATE_MENUS = `
  (() => {
    const menuSelectors = ['.navbar-nav', '.side-menu', '#sidebar', '.main-menu'];
    const results = [];
    for (const sel of menuSelectors) {
      const elements = document.querySelectorAll(sel);
      let visibleCount = 0;
      elements.forEach(el => { if (el.offsetParent !== null) visibleCount++; });
      if (visibleCount > 0) {
        results.push({ selector: sel, visibleCount, duplicate: visibleCount > 1 });
      }
    }
    return results;
  })()
`;

/**
 * Force-close modals and popups.
 * Combined from Bfun.closePopupIfPresent() (line 22-61) and
 * MobileViewUtil.handleCommonPopups() (line 200-258).
 * The JS fallback pattern is critical for bullion platform testing because
 * the live rate page always triggers a popup on load.
 */
export const JS_CLOSE_POPUPS = `
  (() => {
    let closed = 0;

    // 1. Click visible close buttons (ported from Bfun's closeLocators array)
    const closeXpaths = [
      'button.close[data-dismiss="modal"]',
      'button.close[data-bs-dismiss="modal"]',
      '.modal-header button.close',
      '.modal button.close',
      'button.close',
      'div.mfp-close',
      '#common_popup_modal button',
      '#popup_modal button'
    ];
    for (const sel of closeXpaths) {
      const btns = document.querySelectorAll(sel);
      btns.forEach(btn => {
        if (btn.offsetParent !== null) {
          btn.click();
          closed++;
        }
      });
    }

    // 2. Force-hide remaining modals (ported from Bfun's JS executor fallback)
    const modals = document.querySelectorAll(
      '.modal.show, .modal.in, #common_popup_modal, #popup_modal, .mfp-wrap, .mfp-overlay'
    );
    modals.forEach(m => {
      m.style.display = 'none';
      m.classList.remove('show', 'in');
    });

    // 3. Remove backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop, .mfp-bg');
    backdrops.forEach(bd => bd.remove());

    // 4. Restore body scrolling
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';

    return { closedButtons: closed, removedModals: modals.length, removedBackdrops: backdrops.length };
  })()
`;

/**
 * Check if a specific element's width exceeds the viewport.
 * Ported from MobileScreenValidator.validateElementFitsViewport() — line 197-213 of Java.
 *
 * @param selector CSS selector of the element to check
 */
export function jsCheckElementFitsViewport(selector: string): string {
  return `
    (() => {
      const el = document.querySelector('${selector}');
      if (!el) return { found: false, fits: true, elWidth: 0, viewWidth: 0 };
      const elWidth = el.getBoundingClientRect().width;
      const viewWidth = document.documentElement.clientWidth;
      return { found: true, fits: elWidth <= viewWidth, elWidth, viewWidth };
    })()
  `;
}

/**
 * Run the full responsive validation suite against a page.
 * This is the Playwright equivalent of MobileScreenValidator.validatePage().
 *
 * Accepts a Playwright Page-like object with evaluate() method.
 * Designed to work with any Playwright-compatible page instance.
 *
 * @param evaluator Object with an evaluate(script) method (Playwright Page)
 * @param device Device profile being tested
 * @param pageName Human-readable page name
 * @returns ResponsiveValidationResult with all check results
 */
export async function validateResponsivePage(
  evaluator: { evaluate: (script: string) => Promise<any>; title: () => Promise<string> },
  device: DeviceProfile,
  pageName: string,
): Promise<ResponsiveValidationResult> {
  console.log(`\n[ResponsiveValidator] ── ${pageName} | ${device.displayName} (${device.width}x${device.height}) ──`);

  const checks: ResponsiveCheck[] = [];

  // ── Check 1: Viewport Meta Tag ──
  try {
    const vpResult = await evaluator.evaluate(JS_CHECK_VIEWPORT_META);
    const passed = vpResult.found && vpResult.valid;
    logCheck(`Viewport Meta Tag [${pageName}]`, passed, device.displayName);
    checks.push({
      name: 'Viewport Meta Tag',
      passed,
      device: device.displayName,
      page: pageName,
      detail: vpResult.found ? `content="${vpResult.content}"` : 'No viewport meta tag found',
      severity: 'critical',
    });
  } catch (e) {
    checks.push({ name: 'Viewport Meta Tag', passed: false, device: device.displayName, page: pageName, detail: 'Error evaluating', severity: 'critical' });
  }

  // ── Check 2: No Horizontal Overflow ──
  try {
    const ovResult = await evaluator.evaluate(JS_CHECK_HORIZONTAL_OVERFLOW);
    const passed = !ovResult.overflow;
    logCheck(`No Horizontal Overflow [${pageName}]`, passed, device.displayName);
    checks.push({
      name: 'No Horizontal Overflow',
      passed,
      device: device.displayName,
      page: pageName,
      detail: `scrollWidth=${ovResult.scrollWidth} clientWidth=${ovResult.clientWidth}`,
      severity: 'critical',
    });
  } catch (e) {
    checks.push({ name: 'No Horizontal Overflow', passed: false, device: device.displayName, page: pageName, severity: 'critical' });
  }

  // ── Check 3: Hamburger Menu (phones < 768px only) ──
  if (device.width < 768) {
    try {
      const hbResult = await evaluator.evaluate(JS_CHECK_HAMBURGER);
      logCheck(`Hamburger Menu Present [${pageName}]`, hbResult.found, device.displayName);
      checks.push({
        name: 'Hamburger Menu Present',
        passed: hbResult.found,
        device: device.displayName,
        page: pageName,
        detail: hbResult.found ? `Found via ${hbResult.selector}` : 'No hamburger toggle found',
        severity: 'warning', // Advisory, not critical
      });
    } catch {
      checks.push({ name: 'Hamburger Menu Present', passed: false, device: device.displayName, page: pageName, severity: 'warning' });
    }
  }

  // ── Check 4: Page Title Present ──
  try {
    const title = await evaluator.title();
    const hasTitle = !!title?.trim();
    logCheck(`Page Title Present [${pageName}]`, hasTitle, device.displayName);
    checks.push({
      name: 'Page Title Present',
      passed: hasTitle,
      device: device.displayName,
      page: pageName,
      detail: hasTitle ? `"${title}"` : 'Empty or missing title',
      severity: 'info',
    });
  } catch {
    checks.push({ name: 'Page Title Present', passed: false, device: device.displayName, page: pageName, severity: 'info' });
  }

  // ── Check 5: Page Body Loaded ──
  try {
    const bodyResult = await evaluator.evaluate(JS_CHECK_BODY_LOADED);
    logCheck(`Page Body Loaded [${pageName}]`, bodyResult.loaded, device.displayName);
    checks.push({
      name: 'Page Body Loaded',
      passed: bodyResult.loaded,
      device: device.displayName,
      page: pageName,
      detail: `${bodyResult.textLength} characters`,
      severity: 'critical',
    });
  } catch {
    checks.push({ name: 'Page Body Loaded', passed: false, device: device.displayName, page: pageName, severity: 'critical' });
  }

  // ── Check 6: No Duplicate Menus ──
  try {
    const menuResults = (await evaluator.evaluate(JS_CHECK_DUPLICATE_MENUS)) as Array<{
      selector: string;
      visibleCount: number;
      duplicate: boolean;
    }>;
    for (const mr of menuResults) {
      const passed = !mr.duplicate;
      logCheck(`No Duplicate Menus (${mr.selector})`, passed, device.displayName);
      checks.push({
        name: `No Duplicate Menus (${mr.selector})`,
        passed,
        device: device.displayName,
        page: pageName,
        detail: `${mr.visibleCount} visible instances`,
        severity: 'warning',
      });
    }
  } catch {
    // Non-critical — skip silently
  }

  const allCriticalPassed = checks.filter((c) => c.severity === 'critical').every((c) => c.passed);

  // ── Summary ──
  const totalChecks = checks.length;
  const passedChecks = checks.filter((c) => c.passed).length;
  const failedChecks = totalChecks - passedChecks;

  if (allCriticalPassed) {
    console.log(`${GREEN}[${device.displayName}] All responsive checks PASSED -> ${pageName}${RESET}`);
  } else {
    console.log(
      `${ORANGE}[${device.displayName}] Responsive issues on ${pageName}: ${failedChecks} check(s) failed${RESET}`,
    );
  }

  return { pageName, device, checks, allCriticalPassed };
}

/**
 * Close popups/modals on a page.
 * Ported from Bfun.closePopupIfPresent() + MobileViewUtil.handleCommonPopups().
 *
 * @param evaluator Object with evaluate() method (Playwright Page)
 * @returns Summary of what was closed
 */
export async function closePopups(evaluator: { evaluate: (script: string) => Promise<any> }): Promise<{
  closedButtons: number;
  removedModals: number;
  removedBackdrops: number;
}> {
  return evaluator.evaluate(JS_CLOSE_POPUPS);
}

/**
 * Detect toast/notification messages on a page.
 * Ported from Bfun.getToastMessageIfPresent() — line 158-185 of Java.
 * Uses the same ordered locator array for speed.
 */
export const JS_DETECT_TOAST = `
  (() => {
    const selectors = [
      '.toast-body',
      '.toast-message',
      '#toast-container .toast-message',
      '#toastContainer',
      '.text-break',
      '.jq-toast-single',
      '[id*="toast-container"]',
      '.toast'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) {
        const text = el.textContent.trim();
        if (text) return { found: true, selector: sel, text };
      }
    }
    return { found: false, selector: '', text: '' };
  })()
`;

/**
 * Read any visible toast message from the page.
 * Ported from Bfun.getToastMessageIfPresent().
 */
export async function getToastMessage(evaluator: { evaluate: (script: string) => Promise<any> }): Promise<string> {
  const result = await evaluator.evaluate(JS_DETECT_TOAST);
  if (result.found) {
    console.log(`[Toast] Found via ${result.selector}: ${result.text}`);
  }
  return result.text || '';
}
