// Cortexo Test Runner — Module Execution Engine
// Ported from BullionLite/Main.java's fail-forward orchestration pattern
// Key patterns: ModuleStat tracking, PASS/FAIL/PARTIAL/SKIP, fail-forward recovery
//
// Original Java: Main.java lines 22-419
// - ModuleStat inner class for per-module timing + status
// - Excel-driven execution flags
// - ANSI-colored terminal summary table
// - Popup clearing between modules
// - Cancel-button escape on failure

export type ModuleStatus = 'PASS' | 'FAIL' | 'PARTIAL' | 'SKIP' | 'RUNNING';

/**
 * Result of a single test module execution.
 * Ported from Main.ModuleStat inner class in Java.
 */
export interface ModuleStat {
  /** Module/test name */
  moduleName: string;
  /** ISO timestamp when execution started */
  startTime: string;
  /** ISO timestamp when execution ended */
  endTime: string;
  /** Whether the module was actually executed or skipped */
  execStatus: 'Executed' | 'Skipped';
  /** Final verdict: PASS, FAIL, PARTIAL (some pass + some fail), or SKIP */
  finalStatus: ModuleStatus;
  /** Short reason/comment for the status */
  comment: string;
  /** Number of passed assertions/actions */
  passCount: number;
  /** Number of failed assertions/actions */
  failCount: number;
  /** Duration in milliseconds */
  durationMs: number;
}

/**
 * Configuration for a test module to be executed.
 */
export interface TestModule {
  /** Human-readable module name */
  name: string;
  /** Whether this module should be executed (ported from Excel 'yes'/'no' flag) */
  enabled: boolean;
  /** The async function that runs the test module. Returns [passCount, failCount]. */
  execute: () => Promise<[number, number]>;
}

/**
 * Options for the test runner.
 */
export interface TestRunnerOptions {
  /** If true, continue executing remaining modules after a failure (ported from Main.java's FAIL-FORWARD) */
  failForward?: boolean;
  /** Maximum time per module in ms before force-timeout */
  moduleTimeoutMs?: number;
  /** Callback invoked before each module starts */
  onModuleStart?: (module: TestModule) => void;
  /** Callback invoked after each module completes */
  onModuleComplete?: (stat: ModuleStat) => void;
  /** Recovery function called after a module fails (ported from Main.java's Cancel-click escape) */
  onFailRecovery?: () => Promise<void>;
}

// ── ANSI Color Codes (ported from Main.java) ───────────────────────────────
const RESET = '\x1B[0m';
const GREEN = '\x1B[32m';
const RED = '\x1B[31m';
const ORANGE = '\x1B[38;5;208m';
const CYAN = '\x1B[36m';
const BOLD = '\x1B[1m';

/**
 * Execute a suite of test modules with fail-forward resilience.
 *
 * This is the TypeScript port of BullionLite's Main.main() orchestration loop.
 * Key behaviors ported:
 * - Per-module timing with ModuleStat tracking
 * - PASS/FAIL/PARTIAL/SKIP classification based on pass+fail counts
 * - Fail-forward: catch module exceptions, log error, attempt recovery, continue
 * - Error message truncation (60 char limit from Main.java line 305)
 * - ANSI-colored summary table output
 *
 * @param modules Array of test modules to execute
 * @param options Runner configuration
 * @returns Array of ModuleStat results
 */
export async function runTestSuite(
  modules: TestModule[],
  options: TestRunnerOptions = {},
): Promise<ModuleStat[]> {
  const { failForward = true, moduleTimeoutMs = 120_000, onModuleStart, onModuleComplete, onFailRecovery } = options;
  const stats: ModuleStat[] = [];

  console.log(`\n${CYAN}${BOLD}${'='.repeat(60)}${RESET}`);
  console.log(`${CYAN}${BOLD}  CORTEXO TEST SUITE — ${modules.length} module(s)${RESET}`);
  console.log(`${CYAN}${BOLD}${'='.repeat(60)}${RESET}\n`);

  for (const module of modules) {
    console.log(`\n${CYAN}${BOLD}${'='.repeat(40)}${RESET}`);
    console.log(`${CYAN}${BOLD}  MODULE: ${module.name}${RESET}`);
    console.log(`${CYAN}  EXEC  : ${module.enabled ? 'yes' : 'no'}${RESET}`);
    console.log(`${CYAN}${BOLD}${'='.repeat(40)}${RESET}`);

    const stat: ModuleStat = {
      moduleName: module.name,
      startTime: new Date().toISOString(),
      endTime: '',
      execStatus: 'Skipped',
      finalStatus: 'SKIP',
      comment: '',
      passCount: 0,
      failCount: 0,
      durationMs: 0,
    };

    // ── Skip disabled modules (ported from Main.java line 106-110) ──
    if (!module.enabled) {
      console.log(`${ORANGE}  ⏭ SKIP: ${module.name}${RESET}`);
      stat.endTime = new Date().toISOString();
      stat.comment = 'Exec flag = no';
      stats.push(stat);
      continue;
    }

    stat.execStatus = 'Executed';
    onModuleStart?.(module);

    const startMs = Date.now();

    try {
      // ── Execute with timeout ──
      const result = await Promise.race([
        module.execute(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Module timed out after ${moduleTimeoutMs}ms`)), moduleTimeoutMs),
        ),
      ]);

      stat.passCount = result[0];
      stat.failCount = result[1];
    } catch (moduleEx: unknown) {
      // ── FAIL-FORWARD: Log, attempt recovery, continue ──
      // (ported from Main.java lines 300-333)
      let shortErr = moduleEx instanceof Error ? moduleEx.message : 'Unknown error';

      // Clean error message (ported from Main.java line 303-305)
      shortErr = shortErr.split('\n')[0].replace(/\(Session info.*/, '').trim();
      if (shortErr.length > 60) shortErr = shortErr.substring(0, 60) + '...';

      stat.comment = shortErr;
      stat.failCount = 1;

      console.log(`${RED}[FAIL-FORWARD] Module '${module.name}' threw exception: ${shortErr}${RESET}`);

      // ── Recovery callback (equivalent to clicking Cancel + closePopupIfPresent) ──
      if (onFailRecovery) {
        try {
          await onFailRecovery();
          console.log(`${CYAN}[FAIL-FORWARD] Recovery completed.${RESET}`);
        } catch {
          console.log(`${ORANGE}[FAIL-FORWARD] Recovery failed, continuing...${RESET}`);
        }
      }

      if (!failForward) {
        stat.endTime = new Date().toISOString();
        stat.durationMs = Date.now() - startMs;
        stat.finalStatus = 'FAIL';
        stats.push(stat);
        onModuleComplete?.(stat);
        break; // Stop suite execution
      }
    }

    // ── Classify result (ported from Main.java lines 341-368) ──
    stat.endTime = new Date().toISOString();
    stat.durationMs = Date.now() - startMs;

    if (stat.passCount > 0 && stat.failCount === 0) {
      stat.finalStatus = 'PASS';
      if (!stat.comment) stat.comment = `${stat.passCount} action(s) passed`;
      console.log(`${GREEN}  ✔ PASS : ${stat.passCount}${RESET}`);
    } else if (stat.failCount > 0 && stat.passCount === 0) {
      stat.finalStatus = 'FAIL';
      if (!stat.comment) stat.comment = `${stat.failCount} action(s) failed`;
      console.log(`${RED}  ✘ FAIL : ${stat.failCount}${RESET}`);
    } else if (stat.passCount > 0 && stat.failCount > 0) {
      stat.finalStatus = 'PARTIAL';
      if (!stat.comment) stat.comment = `${stat.passCount} passed, ${stat.failCount} failed`;
      console.log(`${ORANGE}  ⚠ PARTIAL — Pass: ${stat.passCount} | Fail: ${stat.failCount}${RESET}`);
    } else {
      stat.finalStatus = 'SKIP';
      stat.comment = 'No result produced';
      console.log(`${ORANGE}  ⏭ SKIP (no result)${RESET}`);
    }

    stats.push(stat);
    onModuleComplete?.(stat);
  }

  // ── Print Summary Table (ported from Main.java lines 375-412) ──
  printSummaryTable(stats);

  return stats;
}

/**
 * Print formatted execution summary table.
 * Direct port of the ANSI-colored table from Main.java lines 375-412.
 */
function printSummaryTable(stats: ModuleStat[]): void {
  console.log('\n');
  console.log('='.repeat(90));
  console.log('                         MODULE EXECUTION SUMMARY');
  console.log('='.repeat(90));

  const header = [
    padRight('Module Name', 22),
    padRight('Duration', 12),
    padRight('Pass/Fail', 12),
    padRight('Status', 12),
    padRight('Comment', 28),
  ].join(' ');
  console.log(header);
  console.log('-'.repeat(90));

  for (const s of stats) {
    let resColor = RESET;
    let resSym = '';

    if (s.finalStatus === 'PASS') {
      resColor = GREEN;
      resSym = '[PASS]';
    } else if (s.finalStatus === 'FAIL' || s.finalStatus === 'PARTIAL') {
      resColor = RED;
      resSym = s.finalStatus === 'FAIL' ? '[FAIL]' : '[PART]';
    } else if (s.finalStatus === 'SKIP') {
      resColor = ORANGE;
      resSym = '[SKIP]';
    }

    const duration = s.durationMs > 0 ? `${(s.durationMs / 1000).toFixed(1)}s` : '-';
    const counts = s.execStatus === 'Executed' ? `${s.passCount}/${s.failCount}` : '-';
    const comment = s.comment.length > 28 ? s.comment.substring(0, 25) + '...' : s.comment;

    const line = [
      padRight(s.moduleName, 22),
      padRight(duration, 12),
      padRight(counts, 12),
      `${resColor}${padRight(resSym, 12)}${RESET}`,
      padRight(comment, 28),
    ].join(' ');
    console.log(line);
  }

  console.log('='.repeat(90));

  const total = stats.length;
  const passed = stats.filter((s) => s.finalStatus === 'PASS').length;
  const failed = stats.filter((s) => s.finalStatus === 'FAIL').length;
  const partial = stats.filter((s) => s.finalStatus === 'PARTIAL').length;
  const skipped = stats.filter((s) => s.finalStatus === 'SKIP').length;

  console.log(
    `${GREEN}${passed} passed${RESET} | ${RED}${failed} failed${RESET} | ` +
      `${ORANGE}${partial} partial${RESET} | ${ORANGE}${skipped} skipped${RESET} | ${total} total`,
  );
  console.log('='.repeat(90));
}

/**
 * Convert ModuleStat array to JSON-serializable report data.
 * Compatible with `cortexo report generate --type test-run`.
 */
export function statsToReportData(stats: ModuleStat[], suiteName: string = 'Test Suite'): object {
  const totalPass = stats.reduce((sum, s) => sum + s.passCount, 0);
  const totalFail = stats.reduce((sum, s) => sum + s.failCount, 0);
  const totalDuration = stats.reduce((sum, s) => sum + s.durationMs, 0);

  return {
    type: 'test-run',
    title: suiteName,
    timestamp: new Date().toISOString(),
    summary: {
      total: stats.length,
      passed: stats.filter((s) => s.finalStatus === 'PASS').length,
      failed: stats.filter((s) => s.finalStatus === 'FAIL').length,
      partial: stats.filter((s) => s.finalStatus === 'PARTIAL').length,
      skipped: stats.filter((s) => s.finalStatus === 'SKIP').length,
      totalAssertions: totalPass + totalFail,
      totalDurationMs: totalDuration,
    },
    modules: stats.map((s) => ({
      name: s.moduleName,
      status: s.finalStatus.toLowerCase(),
      passCount: s.passCount,
      failCount: s.failCount,
      durationMs: s.durationMs,
      comment: s.comment,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  };
}

function padRight(str: string, len: number): string {
  return str.length >= len ? str.substring(0, len) : str + ' '.repeat(len - str.length);
}
