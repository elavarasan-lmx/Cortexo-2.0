// Cortexo Backup/Restore — System Archive Manager
// Ported from GoClaw's internal/backup/backup.go pattern
//
// Produces versioned tar.gz archives of:
//  - PostgreSQL database dump (via pg_dump)
//  - Config directory (~/.cortexo/)
//  - Skills knowledge base
//  - Manifest with version, timestamps, and stats
//
// Archives are self-documenting via manifest.json at the root level.

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const CORTEXO_DIR = join(homedir(), '.cortexo');
const BACKUP_DIR = join(CORTEXO_DIR, 'backups');

/** Manifest embedded in every backup archive */
export interface BackupManifest {
  version: string;
  cortexoVersion: string;
  createdAt: string;
  hostname: string;
  nodeVersion: string;
  components: {
    database: boolean;
    config: boolean;
    skills: boolean;
  };
  stats: {
    totalFiles: number;
    totalBytes: number;
    databaseSize?: string;
  };
}

/** Preflight check result */
interface PreflightResult {
  ok: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * Run preflight checks before creating a backup.
 * Validates: disk space, pg_dump availability, config directory existence.
 */
export function preflightCheck(includeDb: boolean, dbUrl?: string): PreflightResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check config directory exists
  if (!existsSync(CORTEXO_DIR)) {
    issues.push(`Config directory not found: ${CORTEXO_DIR}`);
  }

  // Check backup directory is writable
  if (!existsSync(BACKUP_DIR)) {
    try {
      mkdirSync(BACKUP_DIR, { recursive: true });
    } catch (err) {
      issues.push(`Cannot create backup directory: ${BACKUP_DIR} — ${(err as Error).message}`);
    }
  }

  // Check pg_dump availability
  if (includeDb) {
    const pgDump = spawnSync('pg_dump', ['--version'], { encoding: 'utf8' });
    if (pgDump.status !== 0) {
      issues.push('pg_dump not found — install PostgreSQL client tools to include database backups');
    }
    if (!dbUrl) {
      issues.push('Database URL not provided — use --db-url or set CORTEXO_DATABASE_URL');
    }
  }

  // Check disk space (need at least 100MB free)
  try {
    const dfOutput = execSync(`df -B1 "${BACKUP_DIR}" | tail -1`, { encoding: 'utf8' });
    const parts = dfOutput.trim().split(/\s+/);
    const available = parseInt(parts[3], 10);
    if (available < 100 * 1024 * 1024) {
      warnings.push(`Low disk space: ${(available / 1024 / 1024).toFixed(0)}MB available (recommend 100MB+)`);
    }
  } catch {
    warnings.push('Could not check disk space');
  }

  return {
    ok: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * Create a full system backup archive.
 *
 * @param options.includeDb - Include PostgreSQL database dump
 * @param options.dbUrl - PostgreSQL connection URL
 * @param options.outputPath - Custom output path (defaults to ~/.cortexo/backups/)
 * @returns Path to the created archive
 */
export async function createBackup(options: {
  includeDb?: boolean;
  dbUrl?: string;
  outputPath?: string;
  cortexoVersion?: string;
}): Promise<{ archivePath: string; manifest: BackupManifest }> {
  const { includeDb = false, dbUrl, cortexoVersion = '0.1.0' } = options;

  // Generate archive name with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const archiveName = `cortexo-backup-${timestamp}.tar.gz`;
  const archivePath = options.outputPath ?? join(BACKUP_DIR, archiveName);

  // Ensure output directory exists
  const outputDir = resolve(archivePath, '..');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Staging directory for archive contents
  const stagingDir = join(BACKUP_DIR, `.staging-${Date.now()}`);
  mkdirSync(stagingDir, { recursive: true });

  let totalFiles = 0;
  let totalBytes = 0;
  let databaseSize: string | undefined;

  try {
    // 1. Config files
    const configSrc = CORTEXO_DIR;
    const configDst = join(stagingDir, 'config');
    mkdirSync(configDst, { recursive: true });

    if (existsSync(configSrc)) {
      const configFiles = ['config.json', 'credentials.json'];
      for (const file of configFiles) {
        const src = join(configSrc, file);
        if (existsSync(src)) {
          const content = readFileSync(src);
          writeFileSync(join(configDst, file), content);
          totalFiles++;
          totalBytes += content.length;
        }
      }
    }

    // 2. Skills knowledge base
    const skillsDir = join(CORTEXO_DIR, 'skills');
    if (existsSync(skillsDir)) {
      const skillsDst = join(stagingDir, 'skills');
      mkdirSync(skillsDst, { recursive: true });

      const skillFiles = readdirSync(skillsDir).filter(f => f.endsWith('.json'));
      for (const file of skillFiles) {
        const src = join(skillsDir, file);
        const content = readFileSync(src);
        writeFileSync(join(skillsDst, file), content);
        totalFiles++;
        totalBytes += content.length;
      }
    }

    // 3. Database dump (optional)
    const hasDb = includeDb && dbUrl;
    if (hasDb) {
      const dumpPath = join(stagingDir, 'database.sql');
      const dumpResult = spawnSync('pg_dump', [
        '--no-owner',
        '--no-privileges',
        '--format=plain',
        '--file', dumpPath,
        dbUrl!,
      ], { encoding: 'utf8', timeout: 120_000 });

      if (dumpResult.status !== 0) {
        throw new Error(`pg_dump failed: ${dumpResult.stderr}`);
      }

      if (existsSync(dumpPath)) {
        const stat = statSync(dumpPath);
        totalFiles++;
        totalBytes += stat.size;
        databaseSize = `${(stat.size / 1024 / 1024).toFixed(2)} MB`;
      }
    }

    // 4. Write manifest
    const manifest: BackupManifest = {
      version: '1.0',
      cortexoVersion,
      createdAt: new Date().toISOString(),
      hostname: execSync('hostname', { encoding: 'utf8' }).trim(),
      nodeVersion: process.version,
      components: {
        database: !!hasDb,
        config: true,
        skills: existsSync(join(stagingDir, 'skills')),
      },
      stats: {
        totalFiles,
        totalBytes,
        databaseSize,
      },
    };

    writeFileSync(join(stagingDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    totalFiles++;

    // 5. Create tar.gz archive using system tar (zero dependencies)
    execSync(
      `tar -czf "${archivePath}" -C "${stagingDir}" .`,
      { encoding: 'utf8', timeout: 60_000 },
    );

    return { archivePath, manifest };
  } finally {
    // Cleanup staging directory
    try {
      execSync(`rm -rf "${stagingDir}"`, { encoding: 'utf8' });
    } catch {
      // Best-effort cleanup
    }
  }
}

/**
 * List available backup archives in ~/.cortexo/backups/
 */
export function listBackups(): Array<{
  name: string;
  path: string;
  size: string;
  created: string;
}> {
  if (!existsSync(BACKUP_DIR)) return [];

  return readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.tar.gz') && f.startsWith('cortexo-backup-'))
    .sort()
    .reverse()
    .map(name => {
      const fullPath = join(BACKUP_DIR, name);
      const stat = statSync(fullPath);
      return {
        name,
        path: fullPath,
        size: `${(stat.size / 1024 / 1024).toFixed(2)} MB`,
        created: stat.mtime.toISOString(),
      };
    });
}
