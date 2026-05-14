// Cortexo Report Generator — Transforms test/bug/audit data into beautiful HTML reports
// Produces self-contained, zero-dependency HTML files ready for sharing

import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import {
  generateReportHTML,
  generateTableHTML,
  badge,
  type StatCard,
  type ReportSection,
  type ReportMetadata,
} from './report-styles.js';

// ── Types ───────────────────────────────────────────────────────────────────

export type ReportType = 'test-run' | 'bugs' | 'audit' | 'deployment' | 'custom';

interface TestRunData {
  id: string;
  server: string;
  startedAt: string;
  completedAt?: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  endpoints: Array<{
    method: string;
    path: string;
    status: number;
    latencyMs: number;
    passed: boolean;
    error?: string;
  }>;
}

interface BugData {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  module: string;
  status: string;
  foundAt: string;
  description?: string;
  recommendation?: string;
}

interface AuditFinding {
  file: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  recommendation: string;
}

interface DeploymentData {
  server: string;
  environment: string;
  deployedAt: string;
  branch: string;
  commit: string;
  status: 'success' | 'failed' | 'partial';
  steps: Array<{
    name: string;
    status: 'success' | 'failed' | 'skipped';
    durationMs: number;
    message?: string;
  }>;
}

// ── Report Output Dir ───────────────────────────────────────────────────────

const REPORTS_DIR = join(homedir(), '.cortexo', 'reports');

function ensureReportsDir(): void {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

// ── Generator Functions ─────────────────────────────────────────────────────

/**
 * Generate a Test Run report from structured data.
 */
export function generateTestRunReport(data: TestRunData, outputPath?: string): string {
  const passRate = data.totalTests > 0
    ? ((data.passed / data.totalTests) * 100).toFixed(1)
    : '0';

  const avgLatency = data.endpoints.length > 0
    ? Math.round(data.endpoints.reduce((sum, e) => sum + e.latencyMs, 0) / data.endpoints.length)
    : 0;

  const stats: StatCard[] = [
    { label: 'Total Tests', value: data.totalTests, color: 'blue' },
    { label: 'Passed', value: data.passed, color: 'green' },
    { label: 'Failed', value: data.failed, color: data.failed > 0 ? 'red' : 'green' },
    { label: 'Skipped', value: data.skipped, color: 'yellow' },
    { label: 'Pass Rate', value: `${passRate}%`, color: Number(passRate) >= 90 ? 'green' : Number(passRate) >= 70 ? 'yellow' : 'red' },
    { label: 'Avg Latency', value: `${avgLatency}ms`, color: avgLatency < 500 ? 'cyan' : avgLatency < 2000 ? 'yellow' : 'red' },
  ];

  const tableHtml = generateTableHTML(
    [
      { key: 'method', label: 'Method' },
      { key: 'path', label: 'Endpoint' },
      { key: 'status', label: 'HTTP Status' },
      { key: 'latencyMs', label: 'Latency (ms)' },
      { key: 'passed', label: 'Result' },
      { key: 'error', label: 'Error' },
    ],
    data.endpoints.map(e => ({
      method: e.method,
      path: e.path,
      status: e.status,
      latencyMs: e.latencyMs,
      passed: e.passed,
      error: e.error ?? null,
    })),
  );

  // Find failed endpoints
  const failedEndpoints = data.endpoints.filter(e => !e.passed);
  const failedSection: ReportSection[] = failedEndpoints.length > 0
    ? [{
        title: 'Failed Endpoints',
        icon: '🔻',
        content: failedEndpoints.map(e => `
          <div class="stat-card" style="border-left: 3px solid var(--accent-red); margin-bottom: 0.5rem;">
            <div style="font-family: var(--font-mono); color: var(--accent-red); font-weight: 700;">
              ${escapeHtml(e.method)} ${escapeHtml(e.path)}
            </div>
            <div style="color: var(--text-secondary); margin-top: 0.5rem; font-size: var(--small-size);">
              ${e.error ? escapeHtml(e.error) : 'No error details available'}
            </div>
          </div>`).join(''),
      }]
    : [];

  const sections: ReportSection[] = [
    { title: 'All Endpoints', icon: '📡', content: tableHtml },
    ...failedSection,
  ];

  const metadata: ReportMetadata = {
    generatedAt: new Date().toISOString(),
    server: data.server,
    runId: data.id,
    startedAt: data.startedAt,
    ...(data.completedAt ? { completedAt: data.completedAt } : {}),
  };

  const html = generateReportHTML({
    title: 'Test Run Report',
    subtitle: `${data.server} — ${data.totalTests} endpoints tested`,
    metadata,
    stats,
    sections,
  });

  return writeReport(html, outputPath, `test-run-${data.id}`);
}

/**
 * Generate a Bug Report from structured data.
 */
export function generateBugReport(
  bugs: BugData[],
  context: { title?: string; server?: string } = {},
  outputPath?: string,
): string {
  const critical = bugs.filter(b => b.severity === 'CRITICAL').length;
  const high = bugs.filter(b => b.severity === 'HIGH').length;
  const medium = bugs.filter(b => b.severity === 'MEDIUM').length;
  const low = bugs.filter(b => b.severity === 'LOW').length;

  const stats: StatCard[] = [
    { label: 'Total Bugs', value: bugs.length, color: 'blue' },
    { label: 'Critical', value: critical, color: critical > 0 ? 'red' : 'green' },
    { label: 'High', value: high, color: high > 0 ? 'red' : 'green' },
    { label: 'Medium', value: medium, color: 'yellow' },
    { label: 'Low', value: low, color: 'green' },
  ];

  const tableHtml = generateTableHTML(
    [
      { key: 'id', label: 'ID' },
      { key: 'severity', label: 'Severity' },
      { key: 'module', label: 'Module' },
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status' },
      { key: 'foundAt', label: 'Found' },
    ],
    bugs.map(b => ({
      id: b.id,
      severity: badge(b.severity, b.severity.toLowerCase()),
      module: b.module,
      title: b.title,
      status: b.status,
      foundAt: b.foundAt,
    })),
  );

  // Detailed cards for critical/high bugs
  const priorityBugs = bugs.filter(b => b.severity === 'CRITICAL' || b.severity === 'HIGH');
  const detailsSection: ReportSection[] = priorityBugs.length > 0
    ? [{
        title: 'Priority Bug Details',
        icon: '⚡',
        content: priorityBugs.map(b => `
          <div class="stat-card" style="border-left: 3px solid ${b.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-orange)'}; margin-bottom: 0.75rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; color: var(--text-primary);">${escapeHtml(b.title)}</span>
              ${badge(b.severity, b.severity.toLowerCase())}
            </div>
            ${b.description ? `<div style="color: var(--text-secondary); font-size: var(--small-size); margin-bottom: 0.5rem;">${escapeHtml(b.description)}</div>` : ''}
            ${b.recommendation ? `<div style="color: var(--accent-cyan); font-size: var(--small-size);">💡 ${escapeHtml(b.recommendation)}</div>` : ''}
          </div>`).join(''),
      }]
    : [];

  const sections: ReportSection[] = [
    { title: 'Bug Summary', icon: '🐛', content: tableHtml },
    ...detailsSection,
  ];

  const html = generateReportHTML({
    title: context.title ?? 'Bug Report',
    subtitle: `${bugs.length} issues detected`,
    metadata: {
      generatedAt: new Date().toISOString(),
      ...(context.server ? { server: context.server } : {}),
      totalBugs: String(bugs.length),
      criticalCount: String(critical),
    },
    stats,
    sections,
  });

  return writeReport(html, outputPath, 'bug-report');
}

/**
 * Generate a Security Audit report from findings.
 */
export function generateAuditReport(
  findings: AuditFinding[],
  repoUrl?: string,
  outputPath?: string,
): string {
  const critical = findings.filter(f => f.severity === 'CRITICAL').length;
  const high = findings.filter(f => f.severity === 'HIGH').length;
  const medium = findings.filter(f => f.severity === 'MEDIUM').length;
  const low = findings.filter(f => f.severity === 'LOW').length;

  const riskScore = Math.min(100, critical * 30 + high * 15 + medium * 5 + low * 1);

  const stats: StatCard[] = [
    { label: 'Findings', value: findings.length, color: 'blue' },
    { label: 'Risk Score', value: `${riskScore}/100`, color: riskScore > 60 ? 'red' : riskScore > 30 ? 'yellow' : 'green' },
    { label: 'Critical', value: critical, color: critical > 0 ? 'red' : 'green' },
    { label: 'High', value: high, color: high > 0 ? 'red' : 'green' },
    { label: 'Medium', value: medium, color: 'yellow' },
    { label: 'Low', value: low, color: 'green' },
  ];

  const tableHtml = generateTableHTML(
    [
      { key: 'severity', label: 'Severity' },
      { key: 'file', label: 'File' },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description' },
    ],
    findings.map(f => ({
      severity: badge(f.severity, f.severity.toLowerCase()),
      file: f.file,
      type: f.type,
      description: f.description,
    })),
  );

  // Recommendations section
  const recsHtml = findings
    .filter(f => f.recommendation)
    .map(f => `
      <div class="stat-card" style="border-left: 3px solid var(--accent-cyan); margin-bottom: 0.5rem;">
        <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.25rem;">
          ${badge(f.severity, f.severity.toLowerCase())}
          <span style="font-family: var(--font-mono); color: var(--text-secondary); font-size: var(--small-size);">${escapeHtml(f.file)}</span>
        </div>
        <div style="color: var(--accent-cyan); font-size: var(--small-size);">💡 ${escapeHtml(f.recommendation)}</div>
      </div>`)
    .join('');

  const sections: ReportSection[] = [
    { title: 'Findings Overview', icon: '🔍', content: tableHtml },
    ...(recsHtml ? [{ title: 'Recommendations', icon: '💡', content: recsHtml }] : []),
  ];

  const html = generateReportHTML({
    title: 'Security Audit Report',
    subtitle: repoUrl ? `Repository: ${repoUrl}` : `${findings.length} findings across ${new Set(findings.map(f => f.file)).size} files`,
    metadata: {
      generatedAt: new Date().toISOString(),
      ...(repoUrl ? { repository: repoUrl } : {}),
      totalFindings: String(findings.length),
      riskScore: `${riskScore}/100`,
    },
    stats,
    sections,
  });

  return writeReport(html, outputPath, 'audit-report');
}

/**
 * Generate a Deployment report.
 */
export function generateDeploymentReport(data: DeploymentData, outputPath?: string): string {
  const successSteps = data.steps.filter(s => s.status === 'success').length;
  const failedSteps = data.steps.filter(s => s.status === 'failed').length;
  const totalDuration = data.steps.reduce((sum, s) => sum + s.durationMs, 0);

  const stats: StatCard[] = [
    { label: 'Status', value: data.status.toUpperCase(), color: data.status === 'success' ? 'green' : data.status === 'failed' ? 'red' : 'yellow' },
    { label: 'Steps Passed', value: successSteps, color: 'green' },
    { label: 'Steps Failed', value: failedSteps, color: failedSteps > 0 ? 'red' : 'green' },
    { label: 'Total Duration', value: `${(totalDuration / 1000).toFixed(1)}s`, color: 'cyan' },
  ];

  const tableHtml = generateTableHTML(
    [
      { key: 'name', label: 'Step' },
      { key: 'status', label: 'Status' },
      { key: 'durationMs', label: 'Duration (ms)' },
      { key: 'message', label: 'Message' },
    ],
    data.steps.map(s => ({
      name: s.name,
      status: badge(s.status.toUpperCase(), s.status === 'success' ? 'pass' : s.status === 'failed' ? 'fail' : 'skip'),
      durationMs: s.durationMs,
      message: s.message ?? null,
    })),
  );

  const sections: ReportSection[] = [
    { title: 'Deployment Steps', icon: '🚀', content: tableHtml },
  ];

  const html = generateReportHTML({
    title: 'Deployment Report',
    subtitle: `${data.server} — ${data.environment}`,
    metadata: {
      generatedAt: new Date().toISOString(),
      server: data.server,
      environment: data.environment,
      branch: data.branch,
      commit: data.commit.substring(0, 8),
      deployedAt: data.deployedAt,
    },
    stats,
    sections,
  });

  return writeReport(html, outputPath, `deploy-${data.environment}`);
}

/**
 * Generate a report from a raw JSON file.
 * Attempts to auto-detect the report type from the structure.
 */
export function generateFromJSON(jsonPath: string, outputPath?: string): string {
  if (!existsSync(jsonPath)) {
    throw new Error(`File not found: ${jsonPath}`);
  }

  const raw = readFileSync(jsonPath, 'utf-8');
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in: ${jsonPath}`);
  }

  // Auto-detect type
  if (data.endpoints && data.totalTests !== undefined) {
    return generateTestRunReport(data, outputPath);
  }
  if (Array.isArray(data) && data[0]?.severity && data[0]?.title) {
    return generateBugReport(data, {}, outputPath);
  }
  if (Array.isArray(data) && data[0]?.severity && data[0]?.file) {
    return generateAuditReport(data, undefined, outputPath);
  }
  if (data.steps && data.branch) {
    return generateDeploymentReport(data, outputPath);
  }

  throw new Error('Could not auto-detect report type. Use --type to specify.');
}

// ── Write Helper ────────────────────────────────────────────────────────────

function writeReport(html: string, outputPath: string | undefined, defaultPrefix: string): string {
  ensureReportsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const finalPath = outputPath
    ? resolve(outputPath)
    : join(REPORTS_DIR, `${defaultPrefix}-${timestamp}.html`);

  writeFileSync(finalPath, html, 'utf-8');
  return finalPath;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
