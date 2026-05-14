/**
 * SSH Types — Shared type definitions for the SSH executor modules.
 *
 * All interfaces used across ssh-connection, ssh-commands, ssh-deploy,
 * and ssh-provision are defined here to avoid circular dependencies.
 */

// ── Connection Types ─────────────────────────────────────────────

export interface SSHCredentials {
  host: string;
  port?: number;
  username: string;
  privateKey?: string;  // PEM string or file path
  password?: string;
  passphrase?: string;
  // Jump host (bastion) — if set, connect to jumpHost first then tunnel to host
  jumpHost?: {
    host: string;
    port?: number;
    username: string;
    privateKey?: string;
  };
}

// ── Deploy Types ─────────────────────────────────────────────────

export interface DeployOptions {
  remotePath: string;
  repoUrl?: string;      // Client Git repo URL
  sourceTemplate?: { repoUrl: string; branch: string };  // Source template repo — cloned FIRST, then client git overlays
  branch?: string;
  preDeployCmd?: string;
  postDeployCmd?: string;
  healthCheckUrl?: string;
  timeoutMs?: number;
  // ── Provisioning config (optional) ──
  database?: { host: string; port?: string; name: string; user: string; password: string; migrate?: boolean; migrateCmd?: string; importSql?: boolean; sqlPath?: string };
  sourceDatabase?: { host: string; port?: string; name: string; user: string; password?: string };
  nginx?: { domain: string; port?: string; root?: string; phpVer?: string; socketPort?: string; rateSocketPort?: string; wsPort?: string; sslCert?: string; sslKey?: string; enableAdmin?: boolean; enableMobileApi?: boolean; enableLaravel?: boolean; laravelPath?: string; extraDirectives?: string; autoGenerate?: boolean };
  permissions?: { user?: string; group?: string; fileMode?: string; dirMode?: string; writablePaths?: string; recursive?: boolean; folders?: { path: string; perm: string; owner: string; group: string }[] };
  pm2?: { name?: string; script?: string; interpreter?: string; instances?: number; autoRestart?: boolean; args?: string };
}

export interface DeployLog {
  step: string;
  command?: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  timestamp: string;
}

export interface DeployResult {
  success: boolean;
  status: 'success' | 'failed' | 'timeout';
  logs: DeployLog[];
  totalDurationMs: number;
  error?: string;
  commitSha?: string;
}

// ── Provisioning Types ───────────────────────────────────────────

export interface ProvisionOptions {
  /** Client identity */
  clientSlug: string;          // e.g. "trustbullion"
  clientName: string;          // e.g. "Trust Bullion"
  productType: 'lite' | 'trade';

  /** Server paths */
  remotePath: string;          // e.g. "/var/www/html/trustbullion"
  baseSourcePath?: string;     // local fallback: e.g. "/var/www/html/winbullSource"
  sourceTemplate?: { repoUrl: string; branch: string };  // Git-based source clone

  /** Domain & URLs */
  domain: string;              // e.g. "trustbullion.com"
  webTitle?: string;
  webCopyright?: string;
  adminUser?: string;
  adminPassword?: string;

  /** Target Database (client's new DB) */
  db: {
    host: string;
    port?: string;
    user: string;
    password: string;
    targetName: string;        // new DB name (e.g. "trustbullion")
  };

  /** Source Database (clone FROM here) */
  sourceDb?: {
    host: string;
    port?: string;
    user: string;
    password?: string;         // falls back to db.password if not provided
    name: string;              // source DB name (e.g. "maharaj")
  };

  /** Socket ports */
  wsPort: string;              // Native WebSocket port
  socketIoPort: string;        // Socket.IO (Redis) port

  /** Nginx */
  nginx?: {
    phpVer?: string;           // e.g. "8.2"
    autoGenerate?: boolean;
  };

  /** Permissions */
  permUser?: string;           // defaults to SSH username (e.g. "ubuntu")
  permGroup?: string;          // defaults to same as permUser

  /** Optional overrides */
  baseSlug?: string;           // defaults to "lmxtrade"
  baseSlugUpper?: string;      // defaults to "LMXTRADE"
  baseDomain?: string;         // defaults to "bullion_v4.logimaxindia.com"
  baseCompanyName?: string;    // defaults to "LOGIMAX Bullion"

  /** Timeouts */
  timeoutMs?: number;
}

// ── Progress Helper Types ────────────────────────────────────────

export type OnProgress = (logs: DeployLog[]) => void | Promise<void>;

/** Helper to push a completed step log + notify progress */
export function createLogHelpers(logs: DeployLog[], onProgress?: OnProgress) {
  const pushLog = async (log: DeployLog) => {
    const pendingIdx = logs.findIndex(l => l.step === log.step && l.exitCode === null);
    if (pendingIdx >= 0) logs.splice(pendingIdx, 1);
    logs.push(log);
    try { await onProgress?.(logs); } catch { /* best-effort */ }
  };

  const pushStarting = async (step: string, msg: string) => {
    logs.push({ step, stdout: msg, stderr: '', exitCode: null, durationMs: 0, timestamp: new Date().toISOString() });
    try { await onProgress?.(logs); } catch { /* best-effort */ }
  };

  return { pushLog, pushStarting };
}
