/**
 * SSH Executor — Real deployment execution over SSH.
 *
 * Uses the ssh2 library to connect to servers and run deploy commands.
 * Supports both key-based and password auth with encrypted credential storage.
 *
 * Usage:
 *   const result = await runDeploySequence({ host, port, username, privateKey }, {
 *     remotePath: '/var/www/myapp',
 *     branch: 'main',
 *     preDeployCmd: 'php artisan down',
 *     postDeployCmd: 'php artisan up && php artisan cache:clear',
 *   });
 */
import { Client } from 'ssh2';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ── Types ────────────────────────────────────────────────────────

export interface SSHCredentials {
  host: string;
  port?: number;
  username: string;
  privateKey?: string;  // PEM string or file path
  password?: string;
  passphrase?: string;
}

export interface DeployOptions {
  remotePath: string;
  branch?: string;
  preDeployCmd?: string;
  postDeployCmd?: string;
  healthCheckUrl?: string;
  timeoutMs?: number;
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

/**
 * Resolve an SSH private key — priority order:
 *  1. Explicit keyInput (PEM string or file path)
 *  2. SSH_PEM_KEY_PATH from .env (best for EC2 instances)
 *  3. System SSH keys (~/.ssh/id_ed25519, id_rsa)
 */
function resolvePrivateKey(keyInput?: string): Buffer | undefined {
  // 1. If a key string is provided explicitly
  if (keyInput) {
    // File path
    if (!keyInput.includes('-----BEGIN') && existsSync(keyInput)) {
      return readFileSync(keyInput);
    }
    // Raw PEM content
    if (keyInput.includes('-----BEGIN')) {
      return Buffer.from(keyInput);
    }
  }

  // 2. PEM key path from environment (recommended for EC2)
  const envPemPath = process.env.SSH_PEM_KEY_PATH;
  if (envPemPath && existsSync(envPemPath)) {
    return readFileSync(envPemPath);
  }

  // 3. Fallback: try system SSH keys
  const sshDir = join(homedir(), '.ssh');
  const candidates = ['prod-ec2-key.pem', 'key_Logimaxcbe.pem', 'app-server-lmx.pem', 'id_ed25519', 'id_rsa', 'id_ecdsa'];
  for (const name of candidates) {
    const keyPath = join(sshDir, name);
    if (existsSync(keyPath)) {
      return readFileSync(keyPath);
    }
  }

  return undefined;
}

/**
 * Establish an SSH connection.
 */
export function sshConnect(creds: SSHCredentials): Promise<Client> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const timeout = setTimeout(() => {
      conn.end();
      reject(new Error(`SSH connection timeout to ${creds.host}:${creds.port || 22}`));
    }, 15_000);

    conn.on('ready', () => {
      clearTimeout(timeout);
      resolve(conn);
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`SSH connection failed: ${err.message}`));
    });

    const privateKey = resolvePrivateKey(creds.privateKey);

    conn.connect({
      host: creds.host,
      port: creds.port || 22,
      username: creds.username,
      privateKey,
      password: creds.password,
      passphrase: creds.passphrase,
      readyTimeout: 15_000,
      // Accept all host keys in dev — in production, use known_hosts
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      hostVerifier: (_hashedKey: Buffer) => true,
    } as any);
  });
}

/**
 * Execute a command over SSH and capture stdout/stderr.
 */
export function sshExec(
  conn: Client,
  command: string,
  timeoutMs = 120_000,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Command timed out after ${timeoutMs / 1000}s: ${command}`));
    }, timeoutMs);

    conn.exec(command, (err, stream) => {
      if (err) {
        clearTimeout(timer);
        return reject(err);
      }

      let stdout = '';
      let stderr = '';

      stream.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      stream.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      stream.on('close', (code: number) => {
        clearTimeout(timer);
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code ?? 0 });
      });

      stream.on('error', (streamErr: Error) => {
        clearTimeout(timer);
        reject(streamErr);
      });
    });
  });
}

/**
 * Run a single step in the deployment sequence.
 */
async function runStep(
  conn: Client,
  step: string,
  command: string,
  timeoutMs?: number,
): Promise<DeployLog> {
  const start = Date.now();
  try {
    const result = await sshExec(conn, command, timeoutMs);
    return {
      step,
      command,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      step,
      command,
      stdout: '',
      stderr: err.message || 'Unknown error',
      exitCode: -1,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  }
}

// ── Main Deploy Sequence ─────────────────────────────────────────

/**
 * Execute a full deployment sequence over SSH:
 *
 *  1. Connect to server
 *  2. Verify remote path exists
 *  3. Run pre-deploy command (optional)
 *  4. Git fetch + checkout + pull
 *  5. Run post-deploy command (optional)
 *  6. Health check (optional)
 *  7. Capture final commit SHA
 */
export async function runDeploySequence(
  creds: SSHCredentials,
  opts: DeployOptions,
): Promise<DeployResult> {
  const totalStart = Date.now();
  const logs: DeployLog[] = [];
  let conn: Client | null = null;

  try {
    // ── Step 1: Connect ──
    const connectStart = Date.now();
    conn = await sshConnect(creds);
    logs.push({
      step: 'connect',
      stdout: `Connected to ${creds.host}:${creds.port || 22} as ${creds.username}`,
      stderr: '',
      exitCode: 0,
      durationMs: Date.now() - connectStart,
      timestamp: new Date().toISOString(),
    });

    // ── Step 2: Verify remote path ──
    const verifyLog = await runStep(conn, 'verify_path', `test -d "${opts.remotePath}" && echo "OK" || echo "NOT_FOUND"`);
    logs.push(verifyLog);
    if (verifyLog.stdout.includes('NOT_FOUND') || verifyLog.exitCode !== 0) {
      return {
        success: false,
        status: 'failed',
        logs,
        totalDurationMs: Date.now() - totalStart,
        error: `Remote path not found: ${opts.remotePath}`,
      };
    }

    // ── Step 3: Pre-deploy command ──
    if (opts.preDeployCmd) {
      const preLog = await runStep(
        conn,
        'pre_deploy',
        `cd "${opts.remotePath}" && ${opts.preDeployCmd}`,
      );
      logs.push(preLog);
      if (preLog.exitCode !== 0) {
        return {
          success: false,
          status: 'failed',
          logs,
          totalDurationMs: Date.now() - totalStart,
          error: `Pre-deploy command failed: ${preLog.stderr || preLog.stdout}`,
        };
      }
    }

    // ── Step 4: Git pull ──
    const branch = opts.branch || 'main';
    const gitCmd = [
      `cd "${opts.remotePath}"`,
      `git fetch origin`,
      `git checkout ${branch}`,
      `git pull origin ${branch}`,
    ].join(' && ');
    const gitLog = await runStep(conn, 'git_pull', gitCmd, 180_000);
    logs.push(gitLog);
    if (gitLog.exitCode !== 0) {
      return {
        success: false,
        status: 'failed',
        logs,
        totalDurationMs: Date.now() - totalStart,
        error: `Git pull failed: ${gitLog.stderr || gitLog.stdout}`,
      };
    }

    // ── Step 5: Post-deploy command ──
    if (opts.postDeployCmd) {
      const postLog = await runStep(
        conn,
        'post_deploy',
        `cd "${opts.remotePath}" && ${opts.postDeployCmd}`,
        180_000,
      );
      logs.push(postLog);
      if (postLog.exitCode !== 0) {
        return {
          success: false,
          status: 'failed',
          logs,
          totalDurationMs: Date.now() - totalStart,
          error: `Post-deploy command failed: ${postLog.stderr || postLog.stdout}`,
        };
      }
    }

    // ── Step 6: Health check ──
    if (opts.healthCheckUrl) {
      const healthLog = await runStep(
        conn,
        'health_check',
        `curl -sf -o /dev/null -w "%{http_code}" "${opts.healthCheckUrl}" || echo "FAIL"`,
        30_000,
      );
      logs.push(healthLog);
      // Non-fatal — just log it
    }

    // ── Step 7: Capture commit SHA ──
    const shaLog = await runStep(conn, 'commit_sha', `cd "${opts.remotePath}" && git rev-parse --short HEAD`);
    logs.push(shaLog);

    return {
      success: true,
      status: 'success',
      logs,
      totalDurationMs: Date.now() - totalStart,
      commitSha: shaLog.stdout.trim() || undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      logs,
      totalDurationMs: Date.now() - totalStart,
      error: err.message || 'Unknown error',
    };
  } finally {
    if (conn) {
      try { conn.end(); } catch (_) { /* ignore */ }
    }
  }
}

/**
 * Test SSH connection — connect, run basic commands, disconnect.
 */
export async function testSSHConnection(creds: SSHCredentials): Promise<{
  success: boolean;
  message: string;
  details?: { uptime: string; user: string; hostname: string };
  durationMs: number;
}> {
  const start = Date.now();
  let conn: Client | null = null;
  try {
    conn = await sshConnect(creds);
    const { stdout } = await sshExec(conn, 'echo "OK" && uptime -p && whoami && hostname', 10_000);
    const lines = stdout.split('\n');
    return {
      success: true,
      message: 'Connection successful',
      details: {
        uptime: lines[1]?.trim() || 'unknown',
        user: lines[2]?.trim() || creds.username,
        hostname: lines[3]?.trim() || creds.host,
      },
      durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Connection failed',
      durationMs: Date.now() - start,
    };
  } finally {
    if (conn) {
      try { conn.end(); } catch (_) { /* ignore */ }
    }
  }
}
