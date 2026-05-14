// Cortexo Secrets Auditor — Scan repos for leaked credentials
// Ported from claude-skills/engineering/env-secrets-manager, adapted to TypeScript

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

// ── Types ───────────────────────────────────────────────────────────────────

export interface SecretFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  pattern: string;
  file: string;
  line: number;
  snippet: string;
}

export interface SecretsScanResult {
  root: string;
  totalFindings: number;
  severityCounts: Record<string, number>;
  findings: SecretFinding[];
  filesScanned: number;
  scannedAt: string;
}

// ── Detection Patterns ──────────────────────────────────────────────────────

const SECRET_PATTERNS: Array<[string, string, RegExp]> = [
  // Critical — API keys with known prefixes
  ['CRITICAL', 'openai_key',        /\bsk-[A-Za-z0-9]{20,}\b/],
  ['CRITICAL', 'github_pat',        /\bghp_[A-Za-z0-9]{20,}\b/],
  ['CRITICAL', 'github_ghs',        /\bghs_[A-Za-z0-9]{20,}\b/],
  ['CRITICAL', 'aws_access_key',    /\bAKIA[0-9A-Z]{16}\b/],
  ['CRITICAL', 'stripe_live_key',   /\bsk_live_[A-Za-z0-9]{24,}\b/],
  ['CRITICAL', 'stripe_pub_key',    /\bpk_live_[A-Za-z0-9]{24,}\b/],
  ['CRITICAL', 'razorpay_key',      /\brzp_live_[A-Za-z0-9]{14,}\b/],
  ['CRITICAL', 'google_api_key',    /\bAIza[A-Za-z0-9_-]{35}\b/],
  ['CRITICAL', 'twilio_key',        /\bSK[a-f0-9]{32}\b/],
  ['CRITICAL', 'sendgrid_key',      /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/],

  // High — structural patterns
  ['HIGH', 'private_key_block',     /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['HIGH', 'slack_token',           /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ['HIGH', 'bearer_token',          /\bBearer\s+[A-Za-z0-9_\-.]{20,}\b/],
  ['HIGH', 'generic_secret',        /(?:secret|token|password|passwd|api[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9_\-/.+=]{8,}/i],
  ['HIGH', 'database_url',          /(?:mysql|postgres|mongodb|redis):\/\/[^\s'"]+:[^\s'"]+@/i],

  // Medium — potential leaks
  ['MEDIUM', 'jwt_token',           /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['MEDIUM', 'basic_auth_header',   /\bBasic\s+[A-Za-z0-9+/=]{20,}\b/],
  ['MEDIUM', 'hex_secret',          /(?:secret|key|token)\s*[:=]\s*['"]?[a-f0-9]{32,}['"]?/i],
];

// ── File Filtering ──────────────────────────────────────────────────────────

const SOURCE_EXTS = new Set([
  '.env', '.py', '.ts', '.tsx', '.js', '.jsx', '.json',
  '.yaml', '.yml', '.toml', '.ini', '.sh', '.md', '.php',
  '.rb', '.go', '.rs', '.java', '.kt', '.conf', '.cfg',
  '.properties', '.xml',
]);

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build',
  'coverage', 'venv', '.venv', '__pycache__', 'vendor',
  '.turbo', '.cache',
]);

const IGNORED_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'composer.lock', 'Cargo.lock', 'Gemfile.lock',
]);

function isCandidate(fileName: string, ext: string): boolean {
  if (IGNORED_FILES.has(fileName)) return false;
  if (fileName.startsWith('.env')) return true;
  return SOURCE_EXTS.has(ext.toLowerCase());
}

// ── File Walker ─────────────────────────────────────────────────────────────

function* walkDir(dir: string, depth = 0, maxDepth = 5): Generator<string> {
  if (depth > maxDepth) return;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          yield* walkDir(fullPath, depth + 1, maxDepth);
        } else if (stat.size < 512 * 1024) { // Skip files > 512KB
          const ext = extname(entry);
          if (isCandidate(entry, ext)) {
            yield fullPath;
          }
        }
      } catch { /* permission denied */ }
    }
  } catch { /* unreadable dir */ }
}

// ── File Scanner ────────────────────────────────────────────────────────────

function scanFile(filePath: string, rootDir: string): SecretFinding[] {
  const findings: SecretFinding[] = [];

  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return findings;
  }

  const relPath = relative(rootDir, filePath);
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip comment-only lines that look like documentation
    if (/^\s*(?:\/\/|#|\/\*|\*)\s*(?:Example|Sample|Template|Placeholder|TODO)/i.test(line)) {
      continue;
    }

    for (const [severity, pattern, regex] of SECRET_PATTERNS) {
      if (regex.test(line)) {
        // Mask the actual secret in the snippet
        const snippet = line.trim().slice(0, 180);
        findings.push({
          severity: severity as SecretFinding['severity'],
          pattern,
          file: relPath,
          line: lineNum,
          snippet: maskSecret(snippet),
        });
      }
    }
  }

  return findings;
}

function maskSecret(text: string): string {
  // Replace obvious secret values with masked versions
  return text
    .replace(/\bsk-[A-Za-z0-9]{4}[A-Za-z0-9]+/g, (m) => m.slice(0, 6) + '***MASKED***')
    .replace(/\bghp_[A-Za-z0-9]{4}[A-Za-z0-9]+/g, (m) => m.slice(0, 7) + '***MASKED***')
    .replace(/\bAKIA[0-9A-Z]{4}[0-9A-Z]+/g, (m) => m.slice(0, 8) + '***MASKED***')
    .replace(/\bsk_live_[A-Za-z0-9]{4}[A-Za-z0-9]+/g, (m) => m.slice(0, 11) + '***MASKED***')
    .replace(/\brzp_live_[A-Za-z0-9]{4}[A-Za-z0-9]+/g, (m) => m.slice(0, 12) + '***MASKED***');
}

// ── Main Scanner ────────────────────────────────────────────────────────────

export function scanSecrets(rootDir: string): SecretsScanResult {
  const allFindings: SecretFinding[] = [];
  let filesScanned = 0;

  for (const filePath of walkDir(rootDir)) {
    filesScanned++;
    const findings = scanFile(filePath, rootDir);
    allFindings.push(...findings);
  }

  const severityCounts: Record<string, number> = {
    CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0,
  };
  for (const f of allFindings) {
    severityCounts[f.severity] = (severityCounts[f.severity] ?? 0) + 1;
  }

  return {
    root: rootDir,
    totalFindings: allFindings.length,
    severityCounts,
    findings: allFindings,
    filesScanned,
    scannedAt: new Date().toISOString(),
  };
}
