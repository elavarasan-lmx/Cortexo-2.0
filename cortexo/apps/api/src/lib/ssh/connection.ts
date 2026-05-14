/**
 * SSH Connection — Connection management with jump host tunneling.
 *
 * Handles SSH key resolution, direct connections, and bastion/jump-host
 * tunneling (equivalent to `ssh -J`).
 */
import { Client } from 'ssh2';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { SSHCredentials } from './types.js';

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
 * Establish a direct SSH connection (no jump host).
 */
function sshConnectDirect(creds: { host: string; port?: number; username: string; privateKey?: string; password?: string; passphrase?: string }, sock?: any): Promise<Client> {
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
      sock,  // If provided, use existing stream (tunnel)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      hostVerifier: (_hashedKey: Buffer) => true,
    } as any);
  });
}

/**
 * Establish an SSH connection — supports jump host tunneling.
 * If creds.jumpHost is set, first connects to the bastion, then
 * tunnels through to the target host (like `ssh -J`).
 */
export async function sshConnect(creds: SSHCredentials): Promise<Client> {
  if (!creds.jumpHost) {
    return sshConnectDirect(creds);
  }

  // Step 1: Connect to jump host
  const jumpConn = await sshConnectDirect(creds.jumpHost);

  // Step 2: Create TCP tunnel from jump host → target
  const stream = await new Promise<any>((resolve, reject) => {
    jumpConn.forwardOut(
      '127.0.0.1', 0,
      creds.host, creds.port || 22,
      (err, channel) => {
        if (err) {
          jumpConn.end();
          reject(new Error(`Jump host tunnel failed: ${err.message}`));
        } else {
          resolve(channel);
        }
      },
    );
  });

  // Step 3: Connect to target through the tunnel
  const targetConn = await sshConnectDirect(creds, stream);

  // Store jump connection for cleanup
  (targetConn as any).__jumpConn = jumpConn;

  return targetConn;
}

/**
 * Safely disconnect an SSH client (including jump host if present).
 */
export function sshDisconnect(conn: Client | null) {
  if (!conn) return;
  try { (conn as any).__jumpConn?.end(); } catch (_) { /* ignore */ }
  try { conn.end(); } catch (_) { /* ignore */ }
}
