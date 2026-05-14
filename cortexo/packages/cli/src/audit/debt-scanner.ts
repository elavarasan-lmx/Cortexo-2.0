// Cortexo Tech Debt Scanner — AST-aware code quality analysis
// Ported from claude-skills/engineering/tech-debt-tracker, adapted to TypeScript

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

// ── Types ───────────────────────────────────────────────────────────────────

export interface DebtItem {
  file: string;
  line: number;
  type: DebtType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  message: string;
  context?: string;
}

export type DebtType =
  | 'todo-fixme'
  | 'large-function'
  | 'deep-nesting'
  | 'large-file'
  | 'empty-catch'
  | 'console-debug'
  | 'hardcoded-secret'
  | 'magic-number'
  | 'commented-code'
  | 'code-smell';

export interface DebtConfig {
  maxFunctionLength: number;
  maxNestingDepth: number;
  maxFileLines: number;
  ignorePatterns: string[];
}

export interface DebtScanResult {
  root: string;
  totalFiles: number;
  totalDebt: number;
  debtScore: number;
  severityCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  items: DebtItem[];
  topFiles: Array<{ file: string; count: number }>;
  scannedAt: string;
}

// ── Default Configuration ───────────────────────────────────────────────────

const DEFAULT_CONFIG: DebtConfig = {
  maxFunctionLength: 50,
  maxNestingDepth: 4,
  maxFileLines: 500,
  ignorePatterns: [
    'node_modules', '.git', 'dist', 'build', '.next',
    'coverage', '__pycache__', '.venv', 'vendor',
    '*.min.js', '*.map', '*.lock',
  ],
};

// ── Regex Patterns ──────────────────────────────────────────────────────────

const PATTERNS = {
  todoFixme: /(?:\/\/|#|\/\*|\*)\s*(TODO|FIXME|HACK|XXX|BUG)[\s:]+(.+)/i,
  emptyTryCatch: /catch\s*\([^)]*\)\s*\{\s*\}/,
  emptyExceptPass: /except[^:]*:\s*pass\s*$/,
  consoleDebug: /console\.(log|debug|warn|info)\s*\(/,
  printDebug: /print\s*\([^)]*debug[^)]*\)/i,
  hardcodedSecret: /(?:password|secret|api_key|apikey|token|private_key)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  magicNumber: /(?<!\w)(?:0x[0-9a-f]{4,}|\d{4,})(?!\w)/i,
  commentedCode: /^\s*(?:\/\/|#)\s*(?:const |let |var |function |class |import |export |if |for |while |return |def |async )/,
  sqlInjection: /(?:execute|query|raw)\s*\([^)]*[`'"]\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b/i,
  evalUsage: /\beval\s*\(/,
  documentWrite: /document\.write\s*\(/,
};

const SUPPORTED_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.go',
  '.rs', '.java', '.kt', '.php', '.cs', '.cpp', '.c', '.h',
]);

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next',
  'coverage', '__pycache__', '.venv', 'venv', 'vendor',
]);

// ── Scanner Logic ───────────────────────────────────────────────────────────

function scanFile(filePath: string, rootDir: string, config: DebtConfig): DebtItem[] {
  const items: DebtItem[] = [];
  const relPath = relative(rootDir, filePath);

  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return items;
  }

  const lines = content.split('\n');

  // Large file check
  if (lines.length > config.maxFileLines) {
    items.push({
      file: relPath,
      line: 1,
      type: 'large-file',
      severity: lines.length > config.maxFileLines * 2 ? 'HIGH' : 'MEDIUM',
      message: `File has ${lines.length} lines (max: ${config.maxFileLines})`,
    });
  }

  // Line-by-line scanning
  let braceDepth = 0;
  let maxDepthInFile = 0;
  let currentFuncStart = 0;
  let currentFuncName = '';
  let inFunction = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // TODO/FIXME/HACK
    const todoMatch = line.match(PATTERNS.todoFixme);
    if (todoMatch) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'todo-fixme',
        severity: todoMatch[1].toUpperCase() === 'FIXME' || todoMatch[1].toUpperCase() === 'BUG' ? 'HIGH' : 'MEDIUM',
        message: `${todoMatch[1].toUpperCase()}: ${todoMatch[2].trim()}`,
        context: line.trim(),
      });
    }

    // Empty catch blocks
    if (PATTERNS.emptyTryCatch.test(line) || PATTERNS.emptyExceptPass.test(line)) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'empty-catch',
        severity: 'HIGH',
        message: 'Empty catch/except block swallows errors silently',
        context: line.trim(),
      });
    }

    // Console/print debug
    if (PATTERNS.consoleDebug.test(line) || PATTERNS.printDebug.test(line)) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'console-debug',
        severity: 'LOW',
        message: 'Debug logging left in production code',
        context: line.trim(),
      });
    }

    // Hardcoded secrets
    if (PATTERNS.hardcodedSecret.test(line)) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'hardcoded-secret',
        severity: 'CRITICAL',
        message: 'Potential hardcoded secret/credential detected',
        context: line.trim().slice(0, 80) + '...',
      });
    }

    // Commented-out code
    if (PATTERNS.commentedCode.test(line)) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'commented-code',
        severity: 'LOW',
        message: 'Commented-out code should be removed (use version control instead)',
        context: line.trim(),
      });
    }

    // Code smells: eval(), document.write(), SQL injection risk
    if (PATTERNS.evalUsage.test(line)) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'code-smell',
        severity: 'CRITICAL',
        message: 'eval() usage is a security risk — use safe alternatives',
        context: line.trim(),
      });
    }
    if (PATTERNS.documentWrite.test(line)) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'code-smell',
        severity: 'HIGH',
        message: 'document.write() blocks rendering — use DOM APIs instead',
        context: line.trim(),
      });
    }
    if (PATTERNS.sqlInjection.test(line)) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'code-smell',
        severity: 'CRITICAL',
        message: 'Potential SQL injection — use parameterized queries',
        context: line.trim().slice(0, 100),
      });
    }

    // Nesting depth tracking (brace-based for JS/TS/Java/C/etc.)
    const openBraces = (line.match(/\{/g) ?? []).length;
    const closeBraces = (line.match(/\}/g) ?? []).length;
    braceDepth += openBraces - closeBraces;
    if (braceDepth > maxDepthInFile) maxDepthInFile = braceDepth;

    if (braceDepth > config.maxNestingDepth && openBraces > 0) {
      items.push({
        file: relPath,
        line: lineNum,
        type: 'deep-nesting',
        severity: braceDepth > config.maxNestingDepth + 2 ? 'HIGH' : 'MEDIUM',
        message: `Nesting depth ${braceDepth} exceeds max ${config.maxNestingDepth}`,
        context: line.trim(),
      });
    }

    // Function length detection (simple heuristic for JS/TS)
    const funcMatch = line.match(/(?:function\s+(\w+)|(\w+)\s*(?:=|:)\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/);
    if (funcMatch || line.match(/^\s*(?:def|func|fn)\s+(\w+)/)) {
      if (inFunction && (lineNum - currentFuncStart) > config.maxFunctionLength) {
        items.push({
          file: relPath,
          line: currentFuncStart,
          type: 'large-function',
          severity: (lineNum - currentFuncStart) > config.maxFunctionLength * 2 ? 'HIGH' : 'MEDIUM',
          message: `Function '${currentFuncName}' is ${lineNum - currentFuncStart} lines (max: ${config.maxFunctionLength})`,
        });
      }
      inFunction = true;
      currentFuncStart = lineNum;
      currentFuncName = (funcMatch?.[1] ?? funcMatch?.[2] ?? line.match(/(?:def|func|fn)\s+(\w+)/)?.[1] ?? 'anonymous');
    }
  }

  return items;
}

function* walkDir(dir: string, depth = 0, maxDepth = 5): Generator<string> {
  if (depth > maxDepth) return;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry) || entry.startsWith('.')) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          yield* walkDir(fullPath, depth + 1, maxDepth);
        } else if (SUPPORTED_EXTS.has(extname(entry).toLowerCase())) {
          // Skip very large files (>1MB)
          if (stat.size < 1_048_576) {
            yield fullPath;
          }
        }
      } catch { /* permission denied */ }
    }
  } catch { /* unreadable dir */ }
}

// ── Main Scanner ────────────────────────────────────────────────────────────

export function scanTechDebt(rootDir: string, config?: Partial<DebtConfig>): DebtScanResult {
  const cfg: DebtConfig = { ...DEFAULT_CONFIG, ...config };
  const allItems: DebtItem[] = [];
  let totalFiles = 0;

  for (const filePath of walkDir(rootDir)) {
    totalFiles++;
    const items = scanFile(filePath, rootDir, cfg);
    allItems.push(...items);
  }

  // Severity counts
  const severityCounts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
  const typeCounts: Record<string, number> = {};
  const fileCounts: Record<string, number> = {};

  for (const item of allItems) {
    severityCounts[item.severity] = (severityCounts[item.severity] ?? 0) + 1;
    typeCounts[item.type] = (typeCounts[item.type] ?? 0) + 1;
    fileCounts[item.file] = (fileCounts[item.file] ?? 0) + 1;
  }

  // Top files by debt count
  const topFiles = Object.entries(fileCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([file, count]) => ({ file, count }));

  // Debt score (weighted)
  const weights: Record<string, number> = { CRITICAL: 10, HIGH: 7, MEDIUM: 5, LOW: 2, INFO: 1 };
  const debtScore = allItems.reduce((sum, item) => sum + (weights[item.severity] ?? 1), 0);

  return {
    root: rootDir,
    totalFiles,
    totalDebt: allItems.length,
    debtScore,
    severityCounts,
    typeCounts,
    items: allItems,
    topFiles,
    scannedAt: new Date().toISOString(),
  };
}
