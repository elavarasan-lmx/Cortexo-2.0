// Cortexo Bug Reporter — Standardized Test Failure Reporting
// Ported from BullionLite/Utils/BugReporter.java
// Key patterns: severity-tagged console logs, auto-screenshot on failure, step tracking
//
// This module provides a lightweight, dependency-free bug/step reporting
// utility that integrates with the Cortexo test runner and report generator.

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Severity levels for reported issues.
 * Ported from BugReporter.java's Status enum mapping.
 */
export type ReportSeverity = 'pass' | 'fail' | 'warning' | 'blocked' | 'info';

/**
 * A single reported step/event.
 */
export interface ReportEntry {
  timestamp: string;
  severity: ReportSeverity;
  module: string;
  action: string;
  detail: string;
  screenshotPath?: string;
}

/**
 * Cortexo Bug Reporter — tracks pass/fail steps during test execution.
 * Ported from BugReporter.java.
 *
 * Key differences from Java original:
 * - No WebDriver dependency — screenshot path is passed in, not captured internally
 * - Thread-safe by design (Node.js single-threaded)
 * - Auto-persists entries to disk for report generation
 */
export class BugReporter {
  private entries: ReportEntry[] = [];
  private currentModule: string = '';
  private readonly outputDir: string;

  constructor(outputDir?: string) {
    this.outputDir = outputDir ?? path.join(os.homedir(), '.cortexo', 'reports', 'bugs');
  }

  /**
   * Set the current module context for subsequent reports.
   */
  setModule(moduleName: string): void {
    this.currentModule = moduleName;
  }

  /**
   * Report a successful step.
   * Ported from BugReporter.reportStepSuccess() — line 52-57.
   */
  reportStepSuccess(stepMessage: string): void {
    const entry: ReportEntry = {
      timestamp: new Date().toISOString(),
      severity: 'pass',
      module: this.currentModule,
      action: 'step',
      detail: stepMessage,
    };
    this.entries.push(entry);
    console.log(`\x1B[32m[PASS]\x1B[0m ${stepMessage}`);
  }

  /**
   * Report missing data for a field.
   * Ported from BugReporter.reportMissingData() — line 14-19.
   */
  reportMissingData(fieldName: string, module?: string): void {
    const mod = module ?? this.currentModule;
    const msg = `${fieldName} is empty in ${mod}`;
    const entry: ReportEntry = {
      timestamp: new Date().toISOString(),
      severity: 'warning',
      module: mod,
      action: 'missing-data',
      detail: msg,
    };
    this.entries.push(entry);
    console.log(`\x1B[38;5;208m[MISSING DATA]\x1B[0m ${msg}`);
  }

  /**
   * Report an action failure with optional screenshot.
   * Ported from BugReporter.reportFailure() — line 22-35.
   *
   * @param action What was being attempted
   * @param locator Where the failure occurred (element, API endpoint, etc.)
   * @param errorMsg Error message
   * @param screenshotPath Optional path to a screenshot captured at failure time
   */
  reportFailure(action: string, locator: string, errorMsg: string, screenshotPath?: string): void {
    const msg = `Action '${action}' failed on ${locator}. Error: ${errorMsg}`;
    const entry: ReportEntry = {
      timestamp: new Date().toISOString(),
      severity: 'fail',
      module: this.currentModule,
      action,
      detail: msg,
      screenshotPath,
    };
    this.entries.push(entry);
    console.log(`\x1B[31m[FAILURE]\x1B[0m ${msg}`);
  }

  /**
   * Report a blocked step with reason.
   * Ported from BugReporter.reportBlocked() — line 37-49.
   */
  reportBlocked(step: string, reason: string, screenshotPath?: string): void {
    const msg = `Step '${step}' is blocked. Reason: ${reason}`;
    const entry: ReportEntry = {
      timestamp: new Date().toISOString(),
      severity: 'blocked',
      module: this.currentModule,
      action: step,
      detail: msg,
      screenshotPath,
    };
    this.entries.push(entry);
    console.log(`\x1B[31m[BLOCKED]\x1B[0m ${msg}`);
  }

  /**
   * Log an informational note.
   */
  reportInfo(message: string): void {
    const entry: ReportEntry = {
      timestamp: new Date().toISOString(),
      severity: 'info',
      module: this.currentModule,
      action: 'info',
      detail: message,
    };
    this.entries.push(entry);
    console.log(`\x1B[36m[INFO]\x1B[0m ${message}`);
  }

  /**
   * Get all reported entries.
   */
  getEntries(): ReportEntry[] {
    return [...this.entries];
  }

  /**
   * Get counts by severity.
   */
  getSummary(): Record<ReportSeverity, number> {
    return {
      pass: this.entries.filter((e) => e.severity === 'pass').length,
      fail: this.entries.filter((e) => e.severity === 'fail').length,
      warning: this.entries.filter((e) => e.severity === 'warning').length,
      blocked: this.entries.filter((e) => e.severity === 'blocked').length,
      info: this.entries.filter((e) => e.severity === 'info').length,
    };
  }

  /**
   * Persist the report entries to a JSON file.
   * Creates the output directory if it doesn't exist.
   */
  save(filename?: string): string {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fname = filename ?? `bug-report-${timestamp}.json`;
    const filePath = path.join(this.outputDir, fname);

    const data = {
      generatedAt: new Date().toISOString(),
      summary: this.getSummary(),
      entries: this.entries,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n\x1B[36m[BugReporter]\x1B[0m Saved ${this.entries.length} entries to ${filePath}`);
    return filePath;
  }

  /**
   * Convert entries to report-compatible format.
   * Compatible with `cortexo report generate --type bugs`.
   */
  toReportData(): object {
    const summary = this.getSummary();
    return {
      type: 'bugs',
      title: `Bug Report — ${this.currentModule || 'Test Suite'}`,
      timestamp: new Date().toISOString(),
      summary,
      issues: this.entries
        .filter((e) => e.severity === 'fail' || e.severity === 'blocked')
        .map((e, idx) => ({
          id: `BUG-${String(idx + 1).padStart(3, '0')}`,
          severity: e.severity === 'blocked' ? 'critical' : 'high',
          module: e.module,
          action: e.action,
          detail: e.detail,
          timestamp: e.timestamp,
          screenshot: e.screenshotPath || null,
        })),
      warnings: this.entries
        .filter((e) => e.severity === 'warning')
        .map((e) => ({
          module: e.module,
          field: e.action,
          detail: e.detail,
        })),
    };
  }

  /**
   * Reset all entries (for reuse across modules).
   */
  clear(): void {
    this.entries = [];
  }
}

/**
 * Singleton convenience — global bug reporter instance.
 */
let _globalReporter: BugReporter | null = null;

export function getGlobalReporter(): BugReporter {
  if (!_globalReporter) {
    _globalReporter = new BugReporter();
  }
  return _globalReporter;
}
