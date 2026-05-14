// Cortexo CLI — Report Command Suite
// Generates beautiful, self-contained HTML reports from test/bug/audit data.
// Ported architecture from frontend-slides: zero-dep HTML, PDF via Playwright.

import { Command } from 'commander';
import chalk from 'chalk';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { homedir } from 'node:os';
import {
  generateTestRunReport,
  generateBugReport,
  generateAuditReport,
  generateDeploymentReport,
  generateFromJSON,
} from '../reports/report-generator.js';
import { exportToPDF, canExportPDF } from '../reports/pdf-exporter.js';

const REPORTS_DIR = join(homedir(), '.cortexo', 'reports');

export function registerReportCommand(parent: Command): void {
  const report = parent
    .command('report')
    .description('Generate beautiful HTML/PDF reports from test runs, bugs, audits, and deployments');

  // ─── cortexo report generate ─────────────────────────────────────
  report
    .command('generate <source>')
    .description('Generate an HTML report from a JSON data file')
    .option('-t, --type <type>', 'Report type: test-run | bugs | audit | deployment (auto-detects if omitted)')
    .option('-o, --output <path>', 'Custom output path for the HTML report')
    .option('--title <title>', 'Custom report title')
    .option('--server <server>', 'Server name for context')
    .action(async (source: string, opts: { type?: string; output?: string; title?: string; server?: string }) => {
      try {
        const sourcePath = resolve(source);
        if (!existsSync(sourcePath)) {
          console.error(chalk.red(`✘ Source file not found: ${sourcePath}`));
          process.exit(1);
        }

        console.log(chalk.cyan('⚡ Generating report...'));

        let reportPath: string;

        if (opts.type) {
          const raw = readFileSync(sourcePath, 'utf-8');
          const data = JSON.parse(raw);

          switch (opts.type) {
            case 'test-run':
              reportPath = generateTestRunReport(data, opts.output);
              break;
            case 'bugs':
              reportPath = generateBugReport(
                Array.isArray(data) ? data : [data],
                { title: opts.title, server: opts.server },
                opts.output,
              );
              break;
            case 'audit':
              reportPath = generateAuditReport(
                Array.isArray(data) ? data : [data],
                opts.server,
                opts.output,
              );
              break;
            case 'deployment':
              reportPath = generateDeploymentReport(data, opts.output);
              break;
            default:
              console.error(chalk.red(`✘ Unknown type: ${opts.type}`));
              console.error(chalk.dim('  Valid types: test-run, bugs, audit, deployment'));
              process.exit(1);
              return;
          }
        } else {
          // Auto-detect
          reportPath = generateFromJSON(sourcePath, opts.output);
        }

        console.log(chalk.green(`\n✔ Report generated successfully!\n`));
        console.log(chalk.bold(`  📄 ${reportPath}`));
        console.log(chalk.dim(`  Size: ${(statSync(reportPath).size / 1024).toFixed(1)} KB`));
        console.log(chalk.dim('\n  Open in browser to view. Export to PDF with:'));
        console.log(chalk.dim(`  cortexo report export-pdf "${reportPath}"`));
      } catch (err: any) {
        console.error(chalk.red('✘ Report generation failed:'), err.message);
        process.exit(1);
      }
    });

  // ─── cortexo report export-pdf ───────────────────────────────────
  report
    .command('export-pdf <htmlFile>')
    .description('Export an HTML report to PDF using Playwright')
    .option('-o, --output <path>', 'Custom output path for the PDF')
    .option('--compact', 'Use compact 1280×720 viewport (smaller file)')
    .option('--format <format>', 'Paper format: A4 | Letter | A3', 'A4')
    .action(async (htmlFile: string, opts: { output?: string; compact?: boolean; format?: string }) => {
      try {
        // Preflight
        const check = canExportPDF();
        if (!check.ok) {
          console.error(chalk.red(`✘ ${check.reason}`));
          process.exit(1);
        }

        const htmlPath = resolve(htmlFile);
        if (!existsSync(htmlPath)) {
          console.error(chalk.red(`✘ HTML file not found: ${htmlPath}`));
          process.exit(1);
        }

        console.log(chalk.cyan('⚡ Exporting to PDF...'));
        console.log(chalk.dim(`  Source: ${htmlPath}`));
        console.log(chalk.dim(`  Viewport: ${opts.compact ? '1280×720' : '1920×1080'}`));
        console.log(chalk.dim(`  Format: ${opts.format ?? 'A4'}`));

        const result = await exportToPDF({
          htmlPath,
          outputPath: opts.output,
          compact: opts.compact,
          format: (opts.format as 'A4' | 'Letter' | 'A3') ?? 'A4',
          printBackground: true,
        });

        if (result.success && result.pdfPath) {
          const pdfSize = statSync(result.pdfPath).size;
          console.log(chalk.green(`\n✔ PDF exported successfully!\n`));
          console.log(chalk.bold(`  📎 ${result.pdfPath}`));
          console.log(chalk.dim(`  Size: ${(pdfSize / 1024).toFixed(1)} KB`));
          console.log(chalk.dim(`  Duration: ${(result.durationMs / 1000).toFixed(1)}s`));
        } else {
          console.error(chalk.red(`\n✘ PDF export failed:`), result.error);
          process.exit(1);
        }
      } catch (err: any) {
        console.error(chalk.red('✘ Export failed:'), err.message);
        process.exit(1);
      }
    });

  // ─── cortexo report list ─────────────────────────────────────────
  report
    .command('list')
    .description('List all generated reports')
    .action(() => {
      if (!existsSync(REPORTS_DIR)) {
        console.log(chalk.yellow('No reports found.'));
        console.log(chalk.dim('  Generate one with: cortexo report generate <data.json>'));
        return;
      }

      const files = readdirSync(REPORTS_DIR)
        .filter(f => f.endsWith('.html') || f.endsWith('.pdf'))
        .sort()
        .reverse();

      if (files.length === 0) {
        console.log(chalk.yellow('No reports found.'));
        return;
      }

      console.log(chalk.bold(`\n📄 ${files.length} report(s) in ${REPORTS_DIR}\n`));

      for (const file of files) {
        const filePath = join(REPORTS_DIR, file);
        const stat = statSync(filePath);
        const sizeKb = (stat.size / 1024).toFixed(1);
        const ext = file.endsWith('.pdf') ? chalk.magenta('PDF') : chalk.cyan('HTML');
        const created = stat.mtime.toISOString().slice(0, 19).replace('T', ' ');

        console.log(`  ${ext} ${chalk.white(file)}`);
        console.log(chalk.dim(`      Size: ${sizeKb} KB  |  Created: ${created}`));
        console.log(chalk.dim(`      Path: ${filePath}\n`));
      }
    });

  // ─── cortexo report demo ─────────────────────────────────────────
  report
    .command('demo')
    .description('Generate a demo report with sample data to preview the design')
    .option('-o, --output <path>', 'Output path for the demo report')
    .action((opts: { output?: string }) => {
      try {
        console.log(chalk.cyan('⚡ Generating demo report...'));

        // Sample test run data
        const demoData = {
          id: 'demo-001',
          server: 'winbull-production',
          startedAt: new Date(Date.now() - 120_000).toISOString(),
          completedAt: new Date().toISOString(),
          totalTests: 12,
          passed: 9,
          failed: 2,
          skipped: 1,
          endpoints: [
            { method: 'GET', path: '/api/v1/menu-items', status: 200, latencyMs: 145, passed: true },
            { method: 'GET', path: '/api/v1/rates', status: 200, latencyMs: 89, passed: true },
            { method: 'POST', path: '/api/v1/auth/login', status: 200, latencyMs: 312, passed: true },
            { method: 'GET', path: '/api/v1/users/profile', status: 200, latencyMs: 178, passed: true },
            { method: 'POST', path: '/api/v1/booking/create', status: 200, latencyMs: 456, passed: true },
            { method: 'GET', path: '/api/v1/transactions', status: 200, latencyMs: 234, passed: true },
            { method: 'PUT', path: '/api/v1/settings/general', status: 200, latencyMs: 189, passed: true },
            { method: 'GET', path: '/api/v1/reports/daily', status: 200, latencyMs: 567, passed: true },
            { method: 'POST', path: '/api/v1/payments/process', status: 500, latencyMs: 2100, passed: false, error: 'Payment gateway timeout — Razorpay API returned 504' },
            { method: 'DELETE', path: '/api/v1/booking/cancel', status: 500, latencyMs: 890, passed: false, error: 'FK constraint violation on cancel_reason_id' },
            { method: 'GET', path: '/api/v1/kyc/documents', status: 200, latencyMs: 320, passed: true },
            { method: 'GET', path: '/api/v1/notifications', status: 0, latencyMs: 0, passed: false },
          ],
        };

        const reportPath = generateTestRunReport(demoData, opts.output);

        console.log(chalk.green(`\n✔ Demo report generated!\n`));
        console.log(chalk.bold(`  📄 ${reportPath}`));
        console.log(chalk.dim(`  Size: ${(statSync(reportPath).size / 1024).toFixed(1)} KB`));
        console.log(chalk.dim('\n  Open in your browser to see the design:'));
        console.log(chalk.dim(`  xdg-open "${reportPath}"`));
      } catch (err: any) {
        console.error(chalk.red('✘ Demo generation failed:'), err.message);
        process.exit(1);
      }
    });
}
