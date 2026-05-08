/**
 * Code Review Engine — Core scanning service.
 * Runs rule-based analysis against source files and produces findings.
 * Used by the code-review API routes and the BullMQ code-review worker.
 */

import { getRulesForFile, type ReviewRule } from './code-review-rules.js';

// ─── Types ────────────────────────────────────────────────────────

export interface SourceFile {
  path: string;
  content: string;
}

export interface Finding {
  file: string;
  line: number;
  endLine?: number;
  column?: number;
  ruleId: string;
  ruleName: string;
  category: string;
  severity: string;
  message: string;
  snippet: string;
  suggestion: string;
  suggestedFix?: string;
  autoFixable: boolean;
  source: 'rule' | 'ai';
}

export interface ReviewSummary {
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  filesScanned: number;
  findings: Finding[];
  durationMs: number;
}

// ─── Engine ───────────────────────────────────────────────────────

/**
 * Run rule-based code review on a set of source files.
 * Applies all matching rules to each file line by line.
 */
export function runRuleBasedReview(files: SourceFile[]): ReviewSummary {
  const start = Date.now();
  const findings: Finding[] = [];

  for (const file of files) {
    const rules = getRulesForFile(file.path);
    if (rules.length === 0) continue;

    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          findings.push({
            file: file.path,
            line: lineNum,
            column: line.search(rule.pattern) + 1,
            ruleId: rule.id,
            ruleName: rule.name,
            category: rule.category,
            severity: rule.severity,
            message: rule.message,
            snippet: extractSnippet(lines, i),
            suggestion: rule.suggestion,
            autoFixable: rule.autoFixable,
            source: 'rule',
          });
        }
      }
    }
  }

  // Sort by severity: critical → high → medium → low → info
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };
  findings.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));

  const durationMs = Date.now() - start;

  return {
    totalFindings: findings.length,
    criticalCount: findings.filter(f => f.severity === 'critical').length,
    highCount: findings.filter(f => f.severity === 'high').length,
    mediumCount: findings.filter(f => f.severity === 'medium').length,
    lowCount: findings.filter(f => f.severity === 'low').length,
    infoCount: findings.filter(f => f.severity === 'info').length,
    filesScanned: files.length,
    findings,
    durationMs,
  };
}

/**
 * Scan a single file and return findings.
 * Convenience wrapper for single-file reviews.
 */
export function scanFile(filePath: string, content: string): Finding[] {
  const result = runRuleBasedReview([{ path: filePath, content }]);
  return result.findings;
}

/**
 * Check if a file extension is supported for code review.
 */
export function isSupportedFile(filePath: string): boolean {
  const supportedExtensions = ['.php', '.js', '.ts', '.tsx', '.jsx', '.py', '.json', '.yml', '.yaml'];
  const ext = '.' + filePath.split('.').pop()?.toLowerCase();
  return supportedExtensions.includes(ext);
}

/**
 * Filter files to only those supported by the review engine.
 */
export function filterSupportedFiles(files: SourceFile[]): SourceFile[] {
  return files.filter(f => isSupportedFile(f.path));
}

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Extract a 5-line snippet centered on the finding line.
 * Shows 2 lines before and 2 lines after for context.
 */
function extractSnippet(lines: string[], lineIndex: number, contextLines: number = 2): string {
  const start = Math.max(0, lineIndex - contextLines);
  const end = Math.min(lines.length - 1, lineIndex + contextLines);

  const snippetLines: string[] = [];
  for (let i = start; i <= end; i++) {
    const prefix = i === lineIndex ? '>>>' : '   ';
    snippetLines.push(`${prefix} ${i + 1} | ${lines[i]}`);
  }
  return snippetLines.join('\n');
}

/**
 * Compute a severity summary label from counts.
 */
export function getSeverityLabel(summary: ReviewSummary): string {
  if (summary.criticalCount > 0) return 'critical';
  if (summary.highCount > 0) return 'high';
  if (summary.mediumCount > 0) return 'medium';
  if (summary.lowCount > 0) return 'low';
  if (summary.infoCount > 0) return 'info';
  return 'clean';
}
