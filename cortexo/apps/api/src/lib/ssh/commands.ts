/**
 * SSH Commands — Command execution and step runner utilities.
 *
 * Provides `sshExec` for raw command execution and `runStep` for
 * structured deploy-step logging with timeout and error capture.
 */
import type { Client } from 'ssh2';
import type { DeployLog } from './types.js';

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
 * Run a single step in a deployment sequence.
 * Wraps `sshExec` with structured logging and error capture.
 */
export async function runStep(
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

/**
 * Test SSH connection — connect, run basic commands, disconnect.
 */
export async function testSSHConnection(
  creds: import('./types.js').SSHCredentials,
): Promise<{
  success: boolean;
  message: string;
  details?: { uptime: string; user: string; hostname: string };
  durationMs: number;
}> {
  const { sshConnect, sshDisconnect } = await import('./connection.js');
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
    sshDisconnect(conn);
  }
}
