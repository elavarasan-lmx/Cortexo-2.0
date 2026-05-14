// Cortexo Security Audit Command
// Ported from The VibeCode Bible's Security Scan feature
// Extended with claude-skills scanners + antigravity-awesome-skills risk classifier & skill validator

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { AppError } from '../client/app-error.js';
import { scanDependencies } from '../audit/dep-scanner.js';
import { scanTechDebt } from '../audit/debt-scanner.js';
import { scanSecrets } from '../audit/secrets-scanner.js';
import { classifyRisk, classifyBatch, type RiskLevel } from '../audit/risk-classifier.js';
import { validateSkillsDir, type SkillValidationResult } from '../audit/skill-validator.js';

const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434';

const TARGET_FILES = [
  '.env',
  '.env.example',
  '.env.local',
  '.env.production',
  'next.config.js',
  'next.config.mjs',
  'next.config.ts',
  'src/lib/supabase.ts',
  'src/lib/stripe.ts',
  'utils/db.ts',
  'config.ts',
  'config.js',
  'docker-compose.yml',
  'Dockerfile',
];

const SYSTEM_PROMPT = `You are a security auditor. Analyze the following code files for hardcoded secrets: API keys, passwords, JWT secrets, database credentials, private tokens. For each finding return: file name, secret type, severity (CRITICAL/HIGH/MEDIUM), risk description, and fix. Format as a clean CLI report. If nothing found, say so. Keep it concise.`;

function parseGitHubUrl(url: string): { owner: string; repo: string; branch: string } | null {
  try {
    const cleaned = url.trim().replace(/\/+$/, '').replace(/\.git$/, '');
    const urlObj = new URL(cleaned);
    if (urlObj.hostname !== 'github.com') return null;
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1], branch: 'main' };
  } catch {
    return null;
  }
}

async function fetchFileContent(owner: string, repo: string, branch: string, filePath: string): Promise<string | null> {
  const urls = [
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/${filePath}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        return await res.text();
      }
    } catch {
      // ignore fetch errors
    }
  }
  return null;
}

async function getFirstAvailableModel(): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    if (data.models && data.models.length > 0) {
      return data.models[0].name;
    }
    return null;
  } catch {
    return null;
  }
}

export function registerAuditCommand(program: Command): void {
  const auditCmd = program.command('audit').description('Perform security operations');

  auditCmd
    .command('repo <url>')
    .description('Scan a public GitHub repository for hardcoded secrets using local AI')
    .action(async (url: string) => {
      try {
        console.log(chalk.blue(`Initiating security audit for repository...`));
        
        const parsed = parseGitHubUrl(url);
        if (!parsed) {
          throw new AppError(400, 'Invalid GitHub URL. Format: https://github.com/owner/repo');
        }
        const { owner, repo, branch } = parsed;

        console.log(chalk.dim(`Checking local Ollama instance (${OLLAMA_BASE})...`));
        const model = await getFirstAvailableModel();
        if (!model) {
          throw new AppError(503, 'Ollama is not running or no models are installed. Start Ollama and pull a model first (e.g., ollama run llama3).');
        }
        console.log(chalk.green(`✔ Using local AI model: ${model}`));

        console.log(chalk.dim(`Fetching configuration files from GitHub...`));
        
        const results = await Promise.all(
          TARGET_FILES.map(async (filePath) => {
            const content = await fetchFileContent(owner, repo, branch, filePath);
            return { filePath, content };
          })
        );

        const foundFiles = results.filter((r) => r.content !== null);
        const skippedFiles = results.filter((r) => r.content === null);

        if (foundFiles.length === 0) {
          console.log(chalk.yellow(`\n⚠ No common configuration or environment files found in this repository.`));
          console.log(chalk.dim(`Checked: \n${TARGET_FILES.map(f => ` - ${f}`).join('\n')}`));
          return;
        }

        console.log(chalk.green(`✔ Found ${foundFiles.length} file(s) to analyze.`));
        console.log(chalk.dim(`Analyzing with ${model}... This may take a minute.`));

        const codeContext = foundFiles
          .map((f) => `--- FILE: ${f.filePath} ---\n${f.content}\n--- END FILE ---`)
          .join('\n\n');

        const userPrompt = `Repository: ${owner}/${repo}\nFiles found: ${foundFiles.map((f) => f.filePath).join(', ')}\nFiles not found (skipped): ${skippedFiles.map((r) => r.filePath).join(', ') || 'none'}\n\n${codeContext}`;

        const ollamaRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
            stream: false,
            options: { temperature: 0.3 },
          }),
        });

        if (!ollamaRes.ok) {
          throw new AppError(502, 'Ollama failed to process the request.');
        }

        const ollamaData = (await ollamaRes.json()) as any;
        const reportText = ollamaData.message?.content || 'No response from model.';

        console.log('\n' + chalk.bold.bgRed.white(' SECURITY AUDIT REPORT ') + '\n');
        
        // Simple CLI formatting for Ollama Markdown output
        const formattedReport = reportText
            .replace(/\*\*(.*?)\*\*/g, chalk.bold('$1'))
            .replace(/CRITICAL/g, chalk.bold.red('CRITICAL'))
            .replace(/HIGH/g, chalk.bold.magenta('HIGH'))
            .replace(/MEDIUM/g, chalk.bold.yellow('MEDIUM'));

        console.log(formattedReport);
        console.log('\n' + chalk.dim('Audit complete.'));
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error(chalk.red(`[Error] ${err.apiMessage}`));
        } else {
          console.error(chalk.red('Error:'), err.message);
        }
        process.exit(1);
      }
    });

  // ─── cortexo audit deps <path> ──────────────────────────────────────
  auditCmd
    .command('deps <path>')
    .description('Scan project dependencies for known vulnerabilities (npm/pypi/go/cargo/rubygems/composer)')
    .option('--json', 'Output raw JSON')
    .option('-o, --output <file>', 'Save JSON report to file')
    .action((targetPath: string, opts: { json?: boolean; output?: string }) => {
      try {
        const dir = resolve(targetPath);
        if (!existsSync(dir)) {
          console.error(chalk.red(`✘ Path not found: ${dir}`));
          process.exit(1);
        }

        console.log(chalk.cyan(`⚡ Scanning dependencies in ${dir}...`));
        const result = scanDependencies(dir);

        if (opts.json) {
          const json = JSON.stringify(result, null, 2);
          if (opts.output) {
            writeFileSync(resolve(opts.output), json, 'utf-8');
            console.log(chalk.green(`✔ Saved to ${opts.output}`));
          } else {
            console.log(json);
          }
          return;
        }

        // Pretty output
        console.log(chalk.bold(`\n📦 Dependency Scan Results\n`));
        console.log(`  Total Dependencies: ${chalk.bold.white(String(result.totalDependencies))}`);
        console.log(`  Direct: ${chalk.cyan(String(result.directDeps))}  |  Transitive: ${chalk.dim(String(result.transitDeps))}`);
        console.log(`  Ecosystems: ${result.ecosystems.map(e => chalk.magenta(e)).join(', ')}`);

        const v = result.vulnerabilities;
        const hasVulns = v.critical + v.high + v.medium + v.low > 0;
        if (hasVulns) {
          console.log(chalk.bold.red(`\n⚠ Vulnerabilities Found:\n`));
          if (v.critical > 0) console.log(`  ${chalk.bgRed.white(' CRITICAL ')} ${v.critical}`);
          if (v.high > 0)     console.log(`  ${chalk.red(' HIGH ')}     ${v.high}`);
          if (v.medium > 0)   console.log(`  ${chalk.yellow(' MEDIUM ')}   ${v.medium}`);
          if (v.low > 0)      console.log(`  ${chalk.dim(' LOW ')}      ${v.low}`);

          const vulnDeps = result.dependencies.filter(d => d.vulnerabilities.length > 0);
          console.log(chalk.bold(`\n  Affected Packages:\n`));
          for (const dep of vulnDeps) {
            console.log(`  ${chalk.cyan(dep.ecosystem)}/${chalk.white(dep.name)}@${chalk.dim(dep.version)}`);
            for (const vuln of dep.vulnerabilities) {
              const sevColor = vuln.severity === 'CRITICAL' ? chalk.bgRed.white : vuln.severity === 'HIGH' ? chalk.red : chalk.yellow;
              console.log(`    ${sevColor(vuln.severity)} ${vuln.id} — ${vuln.summary}`);
              if (vuln.fixedVersion) console.log(chalk.dim(`    Fix: upgrade to ${vuln.fixedVersion}`));
            }
          }
        } else {
          console.log(chalk.green(`\n✔ No known vulnerabilities detected.`));
        }

        if (opts.output) {
          writeFileSync(resolve(opts.output), JSON.stringify(result, null, 2), 'utf-8');
          console.log(chalk.dim(`\nJSON report saved: ${opts.output}`));
        }

        console.log(chalk.dim(`\nScanned at: ${result.scannedAt}`));
      } catch (err: any) {
        console.error(chalk.red('✘ Scan failed:'), err.message);
        process.exit(1);
      }
    });

  // ─── cortexo audit debt <path> ──────────────────────────────────────
  auditCmd
    .command('debt <path>')
    .description('Scan codebase for tech debt: TODOs, large functions, code smells, hardcoded secrets')
    .option('--json', 'Output raw JSON')
    .option('-o, --output <file>', 'Save JSON report to file')
    .option('--max-func <n>', 'Max function length (default: 50)', '50')
    .option('--max-depth <n>', 'Max nesting depth (default: 4)', '4')
    .option('--max-lines <n>', 'Max file length (default: 500)', '500')
    .action((targetPath: string, opts: { json?: boolean; output?: string; maxFunc?: string; maxDepth?: string; maxLines?: string }) => {
      try {
        const dir = resolve(targetPath);
        if (!existsSync(dir)) {
          console.error(chalk.red(`✘ Path not found: ${dir}`));
          process.exit(1);
        }

        console.log(chalk.cyan(`⚡ Scanning for tech debt in ${dir}...`));
        const result = scanTechDebt(dir, {
          maxFunctionLength: Number(opts.maxFunc) || 50,
          maxNestingDepth: Number(opts.maxDepth) || 4,
          maxFileLines: Number(opts.maxLines) || 500,
        });

        if (opts.json) {
          const json = JSON.stringify(result, null, 2);
          if (opts.output) {
            writeFileSync(resolve(opts.output), json, 'utf-8');
            console.log(chalk.green(`✔ Saved to ${opts.output}`));
          } else {
            console.log(json);
          }
          return;
        }

        // Pretty output
        console.log(chalk.bold(`\n🔍 Tech Debt Analysis\n`));
        console.log(`  Files Scanned: ${chalk.bold.white(String(result.totalFiles))}`);
        console.log(`  Total Debt Items: ${chalk.bold(result.totalDebt > 0 ? chalk.red(String(result.totalDebt)) : chalk.green('0'))}`);
        console.log(`  Debt Score: ${chalk.bold(result.debtScore > 50 ? chalk.red(String(result.debtScore)) : result.debtScore > 20 ? chalk.yellow(String(result.debtScore)) : chalk.green(String(result.debtScore)))}`);

        // Severity breakdown
        const sc = result.severityCounts;
        if (result.totalDebt > 0) {
          console.log(chalk.bold(`\n  Severity Breakdown:`));
          if (sc.CRITICAL > 0) console.log(`    ${chalk.bgRed.white(' CRITICAL ')} ${sc.CRITICAL}`);
          if (sc.HIGH > 0)     console.log(`    ${chalk.red(' HIGH ')}     ${sc.HIGH}`);
          if (sc.MEDIUM > 0)   console.log(`    ${chalk.yellow(' MEDIUM ')}   ${sc.MEDIUM}`);
          if (sc.LOW > 0)      console.log(`    ${chalk.dim(' LOW ')}      ${sc.LOW}`);
          if (sc.INFO > 0)     console.log(`    ${chalk.dim(' INFO ')}     ${sc.INFO}`);
        }

        // Type breakdown
        if (Object.keys(result.typeCounts).length > 0) {
          console.log(chalk.bold(`\n  By Category:`));
          const sorted = Object.entries(result.typeCounts).sort((a, b) => b[1] - a[1]);
          for (const [type, count] of sorted) {
            console.log(`    ${chalk.cyan(type.padEnd(20))} ${count}`);
          }
        }

        // Top files
        if (result.topFiles.length > 0) {
          console.log(chalk.bold(`\n  Top Files (most debt):`));
          for (const { file, count } of result.topFiles.slice(0, 5)) {
            console.log(`    ${chalk.dim(String(count).padStart(3))} ${chalk.white(file)}`);
          }
        }

        // Show critical/high items
        const critical = result.items.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
        if (critical.length > 0) {
          console.log(chalk.bold.red(`\n  ⚡ Priority Items (${critical.length}):\n`));
          for (const item of critical.slice(0, 15)) {
            const sevColor = item.severity === 'CRITICAL' ? chalk.bgRed.white : chalk.red;
            console.log(`  ${sevColor(` ${item.severity} `)} ${chalk.white(item.file)}:${item.line}`);
            console.log(chalk.dim(`    ${item.message}`));
            if (item.context) console.log(chalk.dim(`    → ${item.context.slice(0, 100)}`));
          }
          if (critical.length > 15) {
            console.log(chalk.dim(`\n  ... and ${critical.length - 15} more. Use --json for full report.`));
          }
        }

        if (opts.output) {
          writeFileSync(resolve(opts.output), JSON.stringify(result, null, 2), 'utf-8');
          console.log(chalk.dim(`\nJSON report saved: ${opts.output}`));
        }

        console.log(chalk.dim(`\nScanned at: ${result.scannedAt}`));
      } catch (err: any) {
        console.error(chalk.red('✘ Scan failed:'), err.message);
        process.exit(1);
      }
    });

  // ─── cortexo audit secrets <path> ───────────────────────────────────
  auditCmd
    .command('secrets <path>')
    .description('Scan codebase for leaked secrets, API keys, tokens, and credentials')
    .option('--json', 'Output raw JSON')
    .option('-o, --output <file>', 'Save JSON report to file')
    .action((targetPath: string, opts: { json?: boolean; output?: string }) => {
      try {
        const dir = resolve(targetPath);
        if (!existsSync(dir)) {
          console.error(chalk.red(`✘ Path not found: ${dir}`));
          process.exit(1);
        }

        console.log(chalk.cyan(`⚡ Scanning for leaked secrets in ${dir}...`));
        const result = scanSecrets(dir);

        if (opts.json) {
          const json = JSON.stringify(result, null, 2);
          if (opts.output) {
            writeFileSync(resolve(opts.output), json, 'utf-8');
            console.log(chalk.green(`✔ Saved to ${opts.output}`));
          } else {
            console.log(json);
          }
          return;
        }

        // Pretty output
        console.log(chalk.bold(`\n🔐 Secrets Audit Report\n`));
        console.log(`  Files Scanned: ${chalk.bold.white(String(result.filesScanned))}`);
        console.log(`  Total Findings: ${chalk.bold(result.totalFindings > 0 ? chalk.red(String(result.totalFindings)) : chalk.green('0'))}`);

        const sc = result.severityCounts;
        if (result.totalFindings > 0) {
          console.log(chalk.bold.red(`\n  ⚠ Leaked Secrets Detected:\n`));
          if (sc.CRITICAL > 0) console.log(`    ${chalk.bgRed.white(' CRITICAL ')} ${sc.CRITICAL}`);
          if (sc.HIGH > 0)     console.log(`    ${chalk.red(' HIGH ')}     ${sc.HIGH}`);
          if (sc.MEDIUM > 0)   console.log(`    ${chalk.yellow(' MEDIUM ')}   ${sc.MEDIUM}`);
          if (sc.LOW > 0)      console.log(`    ${chalk.dim(' LOW ')}      ${sc.LOW}`);

          console.log(chalk.bold(`\n  Findings:\n`));
          for (const finding of result.findings.slice(0, 25)) {
            const sevColor = finding.severity === 'CRITICAL' ? chalk.bgRed.white : finding.severity === 'HIGH' ? chalk.red : chalk.yellow;
            console.log(`  ${sevColor(` ${finding.severity} `)} ${chalk.cyan(finding.pattern)}`);
            console.log(`    ${chalk.white(finding.file)}:${finding.line}`);
            console.log(chalk.dim(`    ${finding.snippet.slice(0, 120)}`));
            console.log('');
          }
          if (result.findings.length > 25) {
            console.log(chalk.dim(`  ... and ${result.findings.length - 25} more. Use --json for full report.`));
          }
        } else {
          console.log(chalk.green(`\n✔ No leaked secrets detected. Clean codebase!`));
        }

        if (opts.output) {
          writeFileSync(resolve(opts.output), JSON.stringify(result, null, 2), 'utf-8');
          console.log(chalk.dim(`\nJSON report saved: ${opts.output}`));
        }

        console.log(chalk.dim(`\nScanned at: ${result.scannedAt}`));
      } catch (err: any) {
        console.error(chalk.red('✘ Scan failed:'), err.message);
        process.exit(1);
      }
    });

  // ─── cortexo audit risk <path|file> ─────────────────────────────────
  auditCmd
    .command('risk <target>')
    .description('Classify risk level of files or directories (offensive/critical/safe/none)')
    .option('--json', 'Output raw JSON')
    .option('-o, --output <file>', 'Save JSON report to file')
    .action((target: string, opts: { json?: boolean; output?: string }) => {
      try {
        const absTarget = resolve(target);
        if (!existsSync(absTarget)) {
          console.error(chalk.red(`✘ Path not found: ${absTarget}`));
          process.exit(1);
        }

        console.log(chalk.cyan(`⚡ Classifying risk in ${absTarget}...`));

        // If single file, classify directly
        const stat = require('node:fs').statSync(absTarget);
        if (stat.isFile()) {
          const content = readFileSync(absTarget, 'utf-8');
          const result = classifyRisk(content, { name: require('node:path').basename(absTarget) });

          if (opts.json) {
            const json = JSON.stringify({ file: absTarget, ...result }, null, 2);
            if (opts.output) {
              writeFileSync(resolve(opts.output), json, 'utf-8');
              console.log(chalk.green(`✔ Saved to ${opts.output}`));
            } else {
              console.log(json);
            }
            return;
          }

          console.log(chalk.bold(`\n🛡  Risk Classification\n`));
          console.log(`  File: ${chalk.white(absTarget)}`);
          console.log(`  Risk: ${riskBadge(result.risk)}`);
          if (result.reasons.length > 0) {
            console.log(chalk.bold(`\n  Reasons:`));
            for (const r of result.reasons) {
              console.log(`    ${chalk.dim('•')} ${r}`);
            }
          }
          console.log('');
          return;
        }

        // Directory: scan all .md/.sh/.ts/.js/.py files
        const { readdirSync } = require('node:fs');
        const items: Array<{ id: string; content: string; name: string }> = [];
        const scanExts = ['.md', '.sh', '.ts', '.js', '.py', '.yml', '.yaml', '.toml'];

        function walkDir(dir: string) {
          for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
              walkDir(full);
            } else if (entry.isFile() && scanExts.some(ext => entry.name.endsWith(ext))) {
              try {
                items.push({ id: full.replace(absTarget + '/', ''), content: readFileSync(full, 'utf-8'), name: entry.name });
              } catch { /* skip unreadable files */ }
            }
          }
        }
        walkDir(absTarget);

        const batch = classifyBatch(items);

        if (opts.json) {
          const json = JSON.stringify(batch, null, 2);
          if (opts.output) {
            writeFileSync(resolve(opts.output), json, 'utf-8');
            console.log(chalk.green(`✔ Saved to ${opts.output}`));
          } else {
            console.log(json);
          }
          return;
        }

        // Pretty output
        console.log(chalk.bold(`\n🛡  Risk Classification Report\n`));
        console.log(`  Files Scanned: ${chalk.bold.white(String(batch.total))}`);
        console.log(`  Offensive: ${batch.counts.offensive > 0 ? chalk.bgRed.white(` ${batch.counts.offensive} `) : chalk.green('0')}`);
        console.log(`  Critical:  ${batch.counts.critical > 0 ? chalk.red(String(batch.counts.critical)) : chalk.green('0')}`);
        console.log(`  Safe:      ${chalk.green(String(batch.counts.safe))}`);
        console.log(`  None:      ${chalk.dim(String(batch.counts.none))}`);

        // Show offensive and critical items
        const flagged = batch.results.filter(r => r.risk === 'offensive' || r.risk === 'critical');
        if (flagged.length > 0) {
          console.log(chalk.bold.red(`\n  ⚠ Flagged Files (${flagged.length}):\n`));
          for (const item of flagged.slice(0, 20)) {
            console.log(`  ${riskBadge(item.risk)} ${chalk.white(item.id)}`);
            for (const r of item.reasons.slice(0, 3)) {
              console.log(chalk.dim(`    • ${r}`));
            }
          }
          if (flagged.length > 20) {
            console.log(chalk.dim(`\n  ... and ${flagged.length - 20} more. Use --json for full report.`));
          }
        } else {
          console.log(chalk.green(`\n✔ No offensive or critical content detected.`));
        }

        if (opts.output) {
          writeFileSync(resolve(opts.output), JSON.stringify(batch, null, 2), 'utf-8');
          console.log(chalk.dim(`\nJSON report saved: ${opts.output}`));
        }

        console.log('');
      } catch (err: any) {
        console.error(chalk.red('✘ Risk scan failed:'), err.message);
        process.exit(1);
      }
    });

  // ─── cortexo audit skill-lint <path> ────────────────────────────────
  auditCmd
    .command('skill-lint <path>')
    .description('Validate SKILL.md files in a skills directory (frontmatter, naming, sections)')
    .option('--json', 'Output raw JSON')
    .option('-o, --output <file>', 'Save JSON report to file')
    .action((targetPath: string, opts: { json?: boolean; output?: string }) => {
      try {
        const dir = resolve(targetPath);
        if (!existsSync(dir)) {
          console.error(chalk.red(`✘ Path not found: ${dir}`));
          process.exit(1);
        }

        console.log(chalk.cyan(`⚡ Validating skills in ${dir}...`));
        const result = validateSkillsDir(dir);

        if (opts.json) {
          const json = JSON.stringify(result, null, 2);
          if (opts.output) {
            writeFileSync(resolve(opts.output), json, 'utf-8');
            console.log(chalk.green(`✔ Saved to ${opts.output}`));
          } else {
            console.log(json);
          }
          return;
        }

        // Pretty output
        console.log(chalk.bold(`\n📋 Skill Validation Report\n`));
        console.log(`  Total Skills:  ${chalk.bold.white(String(result.totalSkills))}`);
        console.log(`  Valid:         ${chalk.green(String(result.valid.length))}`);
        console.log(`  Invalid:       ${result.invalid.length > 0 ? chalk.red(String(result.invalid.length)) : chalk.green('0')}`);
        console.log(`  Errors:        ${result.errors > 0 ? chalk.red(String(result.errors)) : chalk.green('0')}`);
        console.log(`  Warnings:      ${result.warnings > 0 ? chalk.yellow(String(result.warnings)) : chalk.green('0')}`);

        // Section coverage
        const ms = result.missingSections;
        if (ms.useSection.length + ms.doNotUseSection.length + ms.instructionsSection.length > 0) {
          console.log(chalk.bold(`\n  Section Coverage:`));
          console.log(`    Missing "When to Use":   ${chalk.dim(String(ms.useSection.length))}`);
          console.log(`    Missing "Do not use":    ${chalk.dim(String(ms.doNotUseSection.length))}`);
          console.log(`    Missing "Instructions":  ${chalk.dim(String(ms.instructionsSection.length))}`);
        }

        if (result.longFiles.length > 0) {
          console.log(chalk.bold.yellow(`\n  Oversized Skills: ${result.longFiles.length}`));
          for (const f of result.longFiles.slice(0, 5)) {
            console.log(chalk.dim(`    • ${f}`));
          }
        }

        // Show errors
        const errorFindings = result.findings.filter(f => f.severity === 'error');
        if (errorFindings.length > 0) {
          console.log(chalk.bold.red(`\n  ✖ Errors (${errorFindings.length}):\n`));
          for (const f of errorFindings.slice(0, 20)) {
            console.log(`  ${chalk.red('ERR')} ${chalk.cyan(f.skillId)} — ${f.message}`);
          }
          if (errorFindings.length > 20) {
            console.log(chalk.dim(`\n  ... and ${errorFindings.length - 20} more. Use --json for full report.`));
          }
        }

        // Show warnings
        const warnFindings = result.findings.filter(f => f.severity === 'warning');
        if (warnFindings.length > 0) {
          console.log(chalk.bold.yellow(`\n  ⚠ Warnings (${warnFindings.length}):\n`));
          for (const f of warnFindings.slice(0, 10)) {
            console.log(`  ${chalk.yellow('WRN')} ${chalk.cyan(f.skillId)} — ${f.message}`);
          }
        }

        if (opts.output) {
          writeFileSync(resolve(opts.output), JSON.stringify(result, null, 2), 'utf-8');
          console.log(chalk.dim(`\nJSON report saved: ${opts.output}`));
        }

        console.log(chalk.dim(`\nScanned at: ${result.scannedAt}`));

        if (result.errors > 0) {
          process.exit(1);
        }
      } catch (err: any) {
        console.error(chalk.red('✘ Validation failed:'), err.message);
        process.exit(1);
      }
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function riskBadge(risk: RiskLevel): string {
  switch (risk) {
    case 'offensive': return chalk.bgRed.white(' OFFENSIVE ');
    case 'critical':  return chalk.red(' CRITICAL ');
    case 'safe':      return chalk.green(' SAFE ');
    case 'none':      return chalk.dim(' NONE ');
    default:          return chalk.dim(` ${risk} `);
  }
}
