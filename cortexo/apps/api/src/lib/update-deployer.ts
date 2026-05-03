/**
 * Update Deployer — Push base code changes to one or all clients.
 *
 * Workflow:
 *   1. Detect which files changed in the base (via checksum diff)
 *   2. For each selected client, SSH in and rsync only changed files
 *   3. Skip per-client files (global_configs.php, .env, *.enc)
 *   4. Log each deployment in config_change_history
 *
 * Uses the existing ssh-executor for SSH connections.
 */
import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { sshConnect, sshExec, type SSHCredentials } from './ssh-executor.js';
import type { Client as SSHClient } from 'ssh2';

// Files that should NEVER be overwritten on clients
const PROTECTED_FILES = [
  'global_configs.php',
  'cortexo-sdk.php',
  '.env',
  '.htaccess',
  'client/*.enc',
  'client/*.txt',
];

// Directories to skip
const SKIP_DIRS = ['node_modules', '.git', 'vendor', 'application/logs', 'application/cache'];

export interface ChangedFile {
  path: string;
  changeType: 'added' | 'modified' | 'deleted';
  oldHash?: string;
  newHash?: string;
  size: number;
}

export interface UpdatePlan {
  changedFiles: ChangedFile[];
  protectedSkips: string[];
  totalSize: number;
  baseVersion: string;
}

export interface ClientDeployResult {
  clientSlug: string;
  success: boolean;
  filesDeployed: number;
  filesSkipped: number;
  durationMs: number;
  error?: string;
}

export interface BulkDeployResult {
  totalClients: number;
  successful: number;
  failed: number;
  results: ClientDeployResult[];
  totalDurationMs: number;
}

// ── Checksum manifest ───────────────────────────────────────────────

const MANIFEST_FILE = '.cortexo-checksums.json';

type ChecksumManifest = Record<string, { hash: string; size: number; mtime: string }>;

function computeFileHash(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash('md5').update(content).digest('hex');
}

function shouldSkipDir(dir: string): boolean {
  return SKIP_DIRS.some(skip => dir.includes(skip));
}

function isProtected(filePath: string): boolean {
  for (const pattern of PROTECTED_FILES) {
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '[^/]*') + '$'
      );
      if (regex.test(filePath)) return true;
    } else if (filePath === pattern || filePath.endsWith('/' + pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Scan the base directory and build a checksum manifest.
 */
function scanDirectory(baseDir: string, subDir = ''): ChecksumManifest {
  const manifest: ChecksumManifest = {};
  const fullDir = subDir ? join(baseDir, subDir) : baseDir;

  if (!existsSync(fullDir)) return manifest;

  try {
    const entries = readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = subDir ? `${subDir}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (shouldSkipDir(relPath)) continue;
        Object.assign(manifest, scanDirectory(baseDir, relPath));
      } else if (entry.isFile()) {
        try {
          const fullPath = join(baseDir, relPath);
          const stat = statSync(fullPath);
          manifest[relPath] = {
            hash: computeFileHash(fullPath),
            size: stat.size,
            mtime: stat.mtime.toISOString(),
          };
        } catch { /* skip unreadable */ }
      }
    }
  } catch { /* skip unreadable dirs */ }

  return manifest;
}

/**
 * Detect which files changed in the base since the last snapshot.
 */
export function prepareUpdate(basePath: string): UpdatePlan {
  const manifestPath = join(basePath, MANIFEST_FILE);
  const currentManifest = scanDirectory(basePath);

  // Load previous manifest (if exists)
  let previousManifest: ChecksumManifest = {};
  if (existsSync(manifestPath)) {
    try {
      previousManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    } catch { /* corrupt manifest, treat as fresh */ }
  }

  const changedFiles: ChangedFile[] = [];
  const protectedSkips: string[] = [];
  let totalSize = 0;

  // Check for new/modified files
  for (const [filePath, current] of Object.entries(currentManifest)) {
    if (filePath === MANIFEST_FILE) continue;
    const prev = previousManifest[filePath];

    if (isProtected(filePath)) {
      if (!prev || prev.hash !== current.hash) {
        protectedSkips.push(filePath);
      }
      continue;
    }

    if (!prev) {
      changedFiles.push({ path: filePath, changeType: 'added', newHash: current.hash, size: current.size });
      totalSize += current.size;
    } else if (prev.hash !== current.hash) {
      changedFiles.push({ path: filePath, changeType: 'modified', oldHash: prev.hash, newHash: current.hash, size: current.size });
      totalSize += current.size;
    }
  }

  // Check for deleted files
  for (const filePath of Object.keys(previousManifest)) {
    if (filePath === MANIFEST_FILE) continue;
    if (!currentManifest[filePath] && !isProtected(filePath)) {
      changedFiles.push({ path: filePath, changeType: 'deleted', oldHash: previousManifest[filePath].hash, size: 0 });
    }
  }

  // Read version from manifest.json
  let baseVersion = 'unknown';
  try {
    const manifestData = JSON.parse(readFileSync(join(basePath, '..', 'manifest.json'), 'utf-8'));
    baseVersion = manifestData.version || 'unknown';
  } catch { /* no manifest */ }

  return { changedFiles, protectedSkips, totalSize, baseVersion };
}

/**
 * Save the current state as the new baseline (after successful deploy).
 */
export function saveCheckpointManifest(basePath: string): void {
  const manifest = scanDirectory(basePath);
  const manifestPath = join(basePath, MANIFEST_FILE);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Deploy changed files to a single client via SSH + scp.
 */
export async function deployToClient(
  creds: SSHCredentials,
  remotePath: string,
  clientSlug: string,
  basePath: string,
  changedFiles: ChangedFile[],
): Promise<ClientDeployResult> {
  const start = Date.now();
  let conn: SSHClient | null = null;
  let filesDeployed = 0;
  let filesSkipped = 0;

  try {
    conn = await sshConnect(creds);

    for (const file of changedFiles) {
      if (file.changeType === 'deleted') {
        // Remove deleted file from remote
        const { exitCode } = await sshExec(conn, `rm -f "${join(remotePath, file.path)}"`, 10_000);
        if (exitCode === 0) filesDeployed++;
        else filesSkipped++;
        continue;
      }

      // Read local file content
      const localPath = join(basePath, file.path);
      if (!existsSync(localPath)) { filesSkipped++; continue; }

      const content = readFileSync(localPath);
      const base64Content = content.toString('base64');

      // Ensure remote directory exists
      const remoteDir = join(remotePath, file.path).replace(/\/[^/]+$/, '');
      await sshExec(conn, `mkdir -p "${remoteDir}"`, 5_000);

      // Write file via base64 decode (works on any Linux server)
      const remoteFile = join(remotePath, file.path);
      const { exitCode } = await sshExec(
        conn,
        `echo "${base64Content}" | base64 -d > "${remoteFile}"`,
        30_000,
      );

      if (exitCode === 0) filesDeployed++;
      else filesSkipped++;
    }

    return {
      clientSlug,
      success: true,
      filesDeployed,
      filesSkipped,
      durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      clientSlug,
      success: false,
      filesDeployed,
      filesSkipped,
      durationMs: Date.now() - start,
      error: err.message,
    };
  } finally {
    if (conn) { try { conn.end(); } catch { /* ignore */ } }
  }
}
