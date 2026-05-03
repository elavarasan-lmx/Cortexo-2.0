import { Client } from 'ssh2';
import { eq } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { deployTargets, deployments } from '@cortexo/db/schema';
import { decrypt } from '../lib/crypto.js';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

interface DeployOptions {
  runId: string;
  projectId: string;
  deployTargetId: string;
  branch: string;
  commitSha?: string;
  command?: string;
}

/**
 * Deploy to a remote server via SSH.
 * Loads target config from DB, decrypts credentials, executes commands.
 */
export async function deploySsh(options: DeployOptions): Promise<void> {
  const db = await getDb();

  const target = await db.query.deployTargets.findFirst({
    where: (t, { eq }) => eq(t.id, options.deployTargetId),
  });

  if (!target) {
    throw new Error(`Deploy target not found: ${options.deployTargetId}`);
  }

  console.log(`  │  🖥  Target: ${target.name} (${target.host}:${target.port})`);
  console.log(`  │  📂 Remote: ${target.remotePath || '~'}`);

  const deployId = crypto.randomUUID();
  const deployStart = new Date();

  // Create deployment record
  await db.insert(deployments).values({
    id: deployId,
    projectId: options.projectId,
    orgId: target.orgId,
    pipelineRunId: options.runId,
    deployTargetId: options.deployTargetId,
    environment: 'production',
    status: 'deploying',
    branch: options.branch,
    commitSha: options.commitSha,
    deployedBy: 'worker',
    strategy: 'rolling',
    startedAt: deployStart,
  } as any);

  try {
    const sshConfig = await buildSshConfig(target);
    await executeRemote(sshConfig, target, options.command);

    const duration = Date.now() - deployStart.getTime();
    await db.update(deployments)
      .set({ status: 'success', finishedAt: new Date(), durationMs: duration })
      .where(eq(deployments.id, deployId));

    await db.update(deployTargets)
      .set({ lastUsedAt: new Date() })
      .where(eq(deployTargets.id, options.deployTargetId));

    console.log(`  │  ✅ Deployment ${deployId} succeeded (${duration}ms)`);
  } catch (err: any) {
    const duration = Date.now() - deployStart.getTime();
    await db.update(deployments)
      .set({ status: 'failed', finishedAt: new Date(), durationMs: duration })
      .where(eq(deployments.id, deployId));

    throw new Error(`SSH deploy failed: ${err.message}`);
  }
}

/**
 * Build SSH connection config from a deploy target.
 * Priority: vault key → vault password → SSH agent → ~/.ssh/id_ed25519 → ~/.ssh/id_rsa
 */
async function buildSshConfig(target: any): Promise<any> {
  const config: any = {
    host: target.host,
    port: target.port || 22,
    username: target.username,
    readyTimeout: 30_000,
    keepaliveInterval: 10_000,
  };

  if (target.encryptedKey) {
    try {
      config.privateKey = decrypt(target.encryptedKey);
      console.log(`  │  🔑 Using encrypted key from vault`);
      return config;
    } catch (err: any) {
      console.log(`  │  ⚠  Failed to decrypt stored key: ${err.message}`);
    }
  }

  if (target.encryptedPassword) {
    try {
      config.password = decrypt(target.encryptedPassword);
      console.log(`  │  🔑 Using encrypted password from vault`);
      return config;
    } catch (err: any) {
      console.log(`  │  ⚠  Failed to decrypt stored password: ${err.message}`);
    }
  }

  if (process.env.SSH_AUTH_SOCK) {
    config.agent = process.env.SSH_AUTH_SOCK;
    console.log(`  │  🔑 Using SSH agent`);
    return config;
  }

  const sshDir = join(homedir(), '.ssh');
  for (const keyFile of ['id_ed25519', 'id_rsa']) {
    const keyPath = join(sshDir, keyFile);
    if (existsSync(keyPath)) {
      config.privateKey = readFileSync(keyPath, 'utf8');
      console.log(`  │  🔑 Using ~/.ssh/${keyFile}`);
      return config;
    }
  }

  throw new Error('No SSH authentication method available. Store a key in the vault or configure SSH agent.');
}

/**
 * Connect via SSH and run the deploy command chain.
 */
function executeRemote(sshConfig: any, target: any, deployCommand?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const commands: string[] = [];

    if (target.preDeployCmd) commands.push(target.preDeployCmd);
    if (deployCommand) commands.push(deployCommand);
    if (target.postDeployCmd) commands.push(target.postDeployCmd);

    if (commands.length === 0) {
      console.log(`  │  ⚠  No commands to execute — skipping`);
      resolve();
      return;
    }

    const fullCommand = commands.join(' && ');
    console.log(`  │  $ ${fullCommand}`);

    conn.on('ready', () => {
      console.log(`  │  🔗 SSH connected to ${target.host}`);
      conn.exec(fullCommand, (err, stream) => {
        if (err) { conn.end(); reject(err); return; }

        let stderr = '';
        let stdout = '';

        stream.on('data', (data: Buffer) => {
          stdout += data.toString();
          data.toString().split('\n').filter(Boolean).forEach((l) => console.log(`  │  [remote] ${l}`));
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
          data.toString().split('\n').filter(Boolean).forEach((l) => console.log(`  │  [remote:err] ${l}`));
        });

        stream.on('close', (code: number) => {
          conn.end();
          code === 0
            ? resolve()
            : reject(new Error(`Remote command exited with code ${code}: ${stderr || stdout}`));
        });
      });
    });

    conn.on('error', (err) => reject(new Error(`SSH connection failed: ${err.message}`)));
    conn.connect(sshConfig);
  });
}
