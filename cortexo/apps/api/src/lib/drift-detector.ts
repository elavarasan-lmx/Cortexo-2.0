/**
 * Drift Detector — Compares a deployed client's files against the golden base.
 *
 * Uses SSH to generate checksums on the remote server, then compares
 * them against local base checksums to detect unauthorized changes,
 * missing files, or config drift.
 *
 * Classification:
 *   - expected: per-client files (global_configs.php, .env, *.enc)
 *   - drift:    files that differ from the base (manual hacks, bugs)
 *   - missing:  files in base but not on server
 *   - extra:    files on server but not in base (uploads, logs, etc.)
 */
import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { sshConnect, sshExec, type SSHCredentials } from './ssh-executor.js';
import type { Client } from 'ssh2';

// ── Types ──────────────────────────────────────────────────────────

export interface DriftFile {
  path: string;
  status: 'modified' | 'missing' | 'extra' | 'expected';
  baseHash?: string;
  remoteHash?: string;
  sizeBase?: number;
  sizeRemote?: number;
  category: string;     // e.g. 'application', 'admin', 'system'
}

export interface DriftReport {
  clientSlug: string;
  scanDurationMs: number;
  scannedAt: string;
  totalFilesScanned: number;
  summary: {
    clean: number;
    modified: number;
    missing: number;
    extra: number;
    expected: number;
  };
  divergenceScore: number;  // 0-100, higher = more drift
  files: DriftFile[];
  moduleSummary: Record<string, { modified: number; missing: number; extra: number }>;
  error?: string;
}

// Files that are EXPECTED to differ per-client (not flagged as drift)
const PER_CLIENT_PATTERNS = [
  'global_configs.php',
  '.env',
  '.htaccess',
  '*.enc',
  'client/*.txt',
  'client/*.enc',
  'cortexo-sdk.php',
  // Uploaded user content
  'assets/uploads/**',
  'assets/images/logo*',
  // Logs and cache
  'application/logs/**',
  'application/cache/**',
  'system/logs/**',
];

// Directories to SKIP entirely (large, irrelevant, or generated)
const SKIP_DIRS = [
  'node_modules', '.git', 'vendor', 'storage/logs',
  'storage/framework/cache', 'storage/framework/sessions',
  'storage/framework/views',
];

// ── Helpers ─────────────────────────────────────────────────────────

function matchesPattern(filePath: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern.includes('**')) {
      // Directory prefix match (e.g. "assets/uploads/**")
      const prefix = pattern.replace('/**', '');
      if (filePath.startsWith(prefix)) return true;
    } else if (pattern.includes('*')) {
      // Glob match (e.g. "*.enc" or "client/*.txt")
      const regex = new RegExp(
        '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '[^/]*') + '$'
      );
      if (regex.test(filePath)) return true;
    } else {
      // Exact match
      if (filePath === pattern) return true;
      if (filePath.endsWith('/' + pattern)) return true;
    }
  }
  return false;
}

function categorizeFile(filePath: string): string {
  if (filePath.startsWith('application/')) return 'application';
  if (filePath.startsWith('admin/')) return 'admin';
  if (filePath.startsWith('system/')) return 'system';
  if (filePath.startsWith('assets/')) return 'assets';
  if (filePath.startsWith('api/')) return 'api';
  if (filePath.startsWith('lmxtrade/')) return 'tradeEngine';
  if (filePath.startsWith('mobileapi/')) return 'mobileapi';
  if (filePath.startsWith('client/')) return 'client';
  return 'root';
}

function shouldSkipDir(dirPath: string): boolean {
  return SKIP_DIRS.some(skip => dirPath.includes(skip));
}

/**
 * Recursively compute MD5 checksums for all files in a local directory.
 * Returns a map: relativePath → md5hash
 */
function getLocalChecksums(baseDir: string, subDir = ''): Map<string, { hash: string; size: number }> {
  const result = new Map<string, { hash: string; size: number }>();
  const fullDir = subDir ? join(baseDir, subDir) : baseDir;

  if (!existsSync(fullDir)) return result;

  try {
    const entries = readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = subDir ? `${subDir}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (shouldSkipDir(relPath)) continue;
        const subResults = getLocalChecksums(baseDir, relPath);
        subResults.forEach((v, k) => result.set(k, v));
      } else if (entry.isFile()) {
        try {
          const fullPath = join(baseDir, relPath);
          const stat = statSync(fullPath);
          const content = readFileSync(fullPath);
          const hash = createHash('md5').update(content).digest('hex');
          result.set(relPath, { hash, size: stat.size });
        } catch {
          // Skip unreadable files
        }
      }
    }
  } catch {
    // Skip unreadable directories
  }

  return result;
}

/**
 * Get file checksums from a remote server via SSH.
 * Uses `find + md5sum` for efficiency.
 */
async function getRemoteChecksums(
  conn: Client,
  remotePath: string,
): Promise<Map<string, { hash: string; size: number }>> {
  const result = new Map<string, { hash: string; size: number }>();

  // Build find command with skip filters
  const skipArgs = SKIP_DIRS.map(d => `-not -path '*/${d}/*'`).join(' ');
  const cmd = `cd "${remotePath}" && find . -type f ${skipArgs} -exec md5sum {} \\; 2>/dev/null`;

  const { stdout } = await sshExec(conn, cmd, 120_000);

  if (!stdout) return result;

  for (const line of stdout.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // md5sum output: "hash  ./path/to/file"
    const match = trimmed.match(/^([a-f0-9]{32})\s+\.\/(.+)$/);
    if (match) {
      result.set(match[2], { hash: match[1], size: 0 });
    }
  }

  // Get file sizes separately (faster than combining)
  const sizeCmd = `cd "${remotePath}" && find . -type f ${skipArgs} -printf '%s %P\n' 2>/dev/null`;
  try {
    const { stdout: sizeOut } = await sshExec(conn, sizeCmd, 60_000);
    for (const line of sizeOut.split('\n')) {
      const match = line.trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        const existing = result.get(match[2]);
        if (existing) {
          existing.size = parseInt(match[1]);
        }
      }
    }
  } catch {
    // Size collection is best-effort
  }

  return result;
}

// ── Main Drift Detection ────────────────────────────────────────────

/**
 * Run a full drift scan for a client.
 *
 * @param creds SSH credentials for the client's server
 * @param remotePath Absolute path to the client's Winbull installation
 * @param clientSlug The client identifier
 * @param basePath Local path to the golden base code
 */
export async function detectDrift(
  creds: SSHCredentials,
  remotePath: string,
  clientSlug: string,
  basePath: string,
): Promise<DriftReport> {
  const start = Date.now();
  const files: DriftFile[] = [];
  const moduleSummary: Record<string, { modified: number; missing: number; extra: number }> = {};

  let conn: Client | null = null;

  try {
    // 1. Connect to remote server
    conn = await sshConnect(creds);

    // 2. Get checksums from both sides (in parallel)
    const [localChecksums, remoteChecksums] = await Promise.all([
      Promise.resolve(getLocalChecksums(basePath)),
      getRemoteChecksums(conn, remotePath),
    ]);

    // 3. Compare: check all base files against remote
    for (const [filePath, local] of localChecksums) {
      const category = categorizeFile(filePath);
      if (!moduleSummary[category]) {
        moduleSummary[category] = { modified: 0, missing: 0, extra: 0 };
      }

      const remote = remoteChecksums.get(filePath);

      if (!remote) {
        // File exists in base but not on server
        files.push({
          path: filePath,
          status: 'missing',
          baseHash: local.hash,
          sizeBase: local.size,
          category,
        });
        moduleSummary[category].missing++;
      } else if (remote.hash !== local.hash) {
        // File exists on both sides but differs
        const isExpected = matchesPattern(filePath, PER_CLIENT_PATTERNS);
        files.push({
          path: filePath,
          status: isExpected ? 'expected' : 'modified',
          baseHash: local.hash,
          remoteHash: remote.hash,
          sizeBase: local.size,
          sizeRemote: remote.size,
          category,
        });
        if (!isExpected) {
          moduleSummary[category].modified++;
        }
      }
      // If hashes match → clean, don't add to report

      // Remove from remote set (remaining = extra files)
      remoteChecksums.delete(filePath);
    }

    // 4. Check for extra files (on server but not in base)
    for (const [filePath, remote] of remoteChecksums) {
      const isExpected = matchesPattern(filePath, PER_CLIENT_PATTERNS);
      if (isExpected) continue; // Don't flag expected per-client files

      const category = categorizeFile(filePath);
      if (!moduleSummary[category]) {
        moduleSummary[category] = { modified: 0, missing: 0, extra: 0 };
      }

      files.push({
        path: filePath,
        status: 'extra',
        remoteHash: remote.hash,
        sizeRemote: remote.size,
        category,
      });
      moduleSummary[category].extra++;
    }

    // 5. Calculate divergence score
    const totalBase = localChecksums.size;
    const modified = files.filter(f => f.status === 'modified').length;
    const missing = files.filter(f => f.status === 'missing').length;
    const extra = files.filter(f => f.status === 'extra').length;
    const expected = files.filter(f => f.status === 'expected').length;
    const clean = totalBase - modified - missing - expected;

    // Score: modified files weighted 3x, missing 2x, extra 1x
    const driftWeight = (modified * 3 + missing * 2 + extra * 1);
    const maxWeight = totalBase * 3;
    const divergenceScore = maxWeight > 0
      ? Math.min(100, Math.round((driftWeight / maxWeight) * 100))
      : 0;

    return {
      clientSlug,
      scanDurationMs: Date.now() - start,
      scannedAt: new Date().toISOString(),
      totalFilesScanned: totalBase + remoteChecksums.size,
      summary: { clean, modified, missing, extra, expected },
      divergenceScore,
      files: files.sort((a, b) => {
        // Sort: modified first, then missing, then extra, then expected
        const order = { modified: 0, missing: 1, extra: 2, expected: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      }),
      moduleSummary,
    };
  } catch (err: any) {
    return {
      clientSlug,
      scanDurationMs: Date.now() - start,
      scannedAt: new Date().toISOString(),
      totalFilesScanned: 0,
      summary: { clean: 0, modified: 0, missing: 0, extra: 0, expected: 0 },
      divergenceScore: -1,
      files: [],
      moduleSummary: {},
      error: err.message || 'Drift scan failed',
    };
  } finally {
    if (conn) {
      try { conn.end(); } catch { /* ignore */ }
    }
  }
}
