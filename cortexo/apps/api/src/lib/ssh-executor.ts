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
  // Jump host (bastion) — if set, connect to jumpHost first then tunnel to host
  jumpHost?: {
    host: string;
    port?: number;
    username: string;
    privateKey?: string;
  };
}

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
  onProgress?: (logs: DeployLog[]) => void | Promise<void>,
): Promise<DeployResult> {
  const totalStart = Date.now();
  const logs: DeployLog[] = [];
  let conn: Client | null = null;

  try {
    // Helper: push log + notify progress
    const pushLog = async (log: DeployLog) => {
      // Remove any 'pending' placeholder for this step
      const pendingIdx = logs.findIndex(l => l.step === log.step && l.exitCode === null);
      if (pendingIdx >= 0) logs.splice(pendingIdx, 1);
      logs.push(log);
      try { await onProgress?.(logs); } catch { /* best-effort */ }
    };

    // Helper: push a "running" indicator before a step starts
    const pushStarting = async (step: string, msg: string) => {
      logs.push({ step, stdout: msg, stderr: '', exitCode: null, durationMs: 0, timestamp: new Date().toISOString() });
      try { await onProgress?.(logs); } catch { /* best-effort */ }
    };

    // ── Step 1: Connect ──
    await pushStarting('connect', 'Connecting to server...');
    const connectStart = Date.now();
    conn = await sshConnect(creds);
    await pushLog({
      step: 'connect',
      stdout: creds.jumpHost
        ? `Connected to ${creds.host}:${creds.port || 22} via jump host ${creds.jumpHost.host} as ${creds.username}`
        : `Connected to ${creds.host}:${creds.port || 22} as ${creds.username}`,
      stderr: '',
      exitCode: 0,
      durationMs: Date.now() - connectStart,
      timestamp: new Date().toISOString(),
    });

    // ── Step 2: Verify / create remote path ──
    await pushStarting('verify_path', `Verifying path ${opts.remotePath}...`);
    const verifyLog = await runStep(conn, 'verify_path', `test -d "${opts.remotePath}" && echo "OK" || (sudo mkdir -p "${opts.remotePath}" && sudo chown ${creds.username}:${creds.username} "${opts.remotePath}" && echo "CREATED")`);
    await pushLog(verifyLog);
    if (verifyLog.exitCode !== 0) {
      return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: `Failed to verify/create remote path: ${opts.remotePath}` };
    }

    // ── Step 3: Pre-deploy command ──
    if (opts.preDeployCmd) {
      await pushStarting('pre_deploy', 'Running pre-deploy commands...');
      const preLog = await runStep(conn, 'pre_deploy', `cd "${opts.remotePath}" && ${opts.preDeployCmd}`);
      await pushLog(preLog);
      if (preLog.exitCode !== 0) {
        return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: `Pre-deploy command failed: ${preLog.stderr || preLog.stdout}` };
      }
    }

    // ── Step 4: Git clone or pull ──
    await pushStarting('git_check', 'Checking git repository...');
    const branch = opts.branch || 'main';
    const gitCheckLog = await runStep(conn, 'git_check', `test -d "${opts.remotePath}/.git" && echo "EXISTS" || echo "EMPTY"`);
    await pushLog(gitCheckLog);
    const isFirstDeploy = !gitCheckLog.stdout.includes('EXISTS');

    if (isFirstDeploy) {
      if (!opts.repoUrl) {
        return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: 'First-time deploy requires a git repo URL' };
      }
      let clientUrl = opts.repoUrl;
      const ghMatch = clientUrl.match(/^https?:\/\/github\.com\/(.+?)(?:\.git)?$/);
      if (ghMatch) clientUrl = `git@github.com:${ghMatch[1]}.git`;

      if (opts.sourceTemplate?.repoUrl) {
        // ── Source Template + Client Git overlay flow ──
        // 1. Clone source template (latest base framework)
        let srcUrl = opts.sourceTemplate.repoUrl;
        const srcMatch = srcUrl.match(/^https?:\/\/github\.com\/(.+?)(?:\.git)?$/);
        if (srcMatch) srcUrl = `git@github.com:${srcMatch[1]}.git`;
        const srcBranch = opts.sourceTemplate.branch || 'main';

        await pushStarting('git_clone_source', `Cloning source template (${srcBranch})...`);
        const srcCloneCmd = `cd "${opts.remotePath}" && git clone -b ${srcBranch} "${srcUrl}" .`;
        const srcCloneLog = await runStep(conn, 'git_clone_source', srcCloneCmd, 300_000);
        await pushLog(srcCloneLog);
        if (srcCloneLog.exitCode !== 0) {
          return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: `Source template clone failed: ${srcCloneLog.stderr || srcCloneLog.stdout}` };
        }

        // 2. Remove source .git, re-init with client git, push source code to client repo
        await pushStarting('git_push_client', `Pushing source code to client git (${branch})...`);
        const pushCmd = [
          `cd "${opts.remotePath}"`,
          `rm -rf .git`,
          `git init`,
          `git remote add origin "${clientUrl}"`,
          `git add .`,
          `git commit -m "Initial provisioning from source template"`,
          `git push -u origin ${branch} --force`,
          `echo "Source code pushed to client git"`,
        ].join(' && ');
        const pushLog2 = await runStep(conn, 'git_push_client', pushCmd, 300_000);
        await pushLog(pushLog2);
        if (pushLog2.exitCode !== 0) {
          return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: `Client git push failed: ${pushLog2.stderr || pushLog2.stdout}` };
        }
      } else {
        // No source template — plain client git clone
        const cloneCmd = `cd "${opts.remotePath}" && git clone -b ${branch} "${clientUrl}" .`;
        await pushStarting('git_clone', `Cloning repository (${branch} branch)...`);
        const cloneLog = await runStep(conn, 'git_clone', cloneCmd, 300_000);
        await pushLog(cloneLog);
        if (cloneLog.exitCode !== 0) {
          return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: `Git clone failed: ${cloneLog.stderr || cloneLog.stdout}` };
        }
      }
    } else {
      await pushStarting('git_pull', `Pulling latest changes (${branch})...`);
      const gitCmd = `cd "${opts.remotePath}" && git fetch origin && git checkout ${branch} && git pull origin ${branch}`;
      const gitLog = await runStep(conn, 'git_pull', gitCmd, 180_000);
      await pushLog(gitLog);
      if (gitLog.exitCode !== 0) {
        return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: `Git pull failed: ${gitLog.stderr || gitLog.stdout}` };
      }
    }

    // ── Step 5: Database provisioning ──
    if (opts.database?.name && opts.database?.host) {
      const db = opts.database;
      await pushStarting('database', `Creating database ${db.name}...`);
      const createDbCmd = [
        `mysql -h "${db.host}" -P ${db.port || '3306'} -u "${db.user}" -p"${db.password}" -e "CREATE DATABASE IF NOT EXISTS \\\`${db.name}\\\`; SHOW DATABASES LIKE '${db.name}';" 2>&1`,
      ].join(' && ');
      const dbLog = await runStep(conn, 'database', createDbCmd, 30_000);
      await pushLog(dbLog);
      // Non-fatal: log but continue (DB may already exist)

      // Clone from source database (mysqldump source | mysql target)
      if (opts.sourceDatabase?.name && opts.sourceDatabase?.host) {
        const src = opts.sourceDatabase;
        await pushStarting('db_clone', `Cloning database ${src.name} → ${db.name}...`);
        const srcPassFlag = src.password ? `-p"${src.password}"` : `-p"${db.password}"`;
        const cloneCmd = `mysqldump -h "${src.host}" -P ${src.port || '3306'} -u "${src.user}" ${srcPassFlag} --single-transaction --routines --triggers "${src.name}" 2>/dev/null | mysql -h "${db.host}" -P ${db.port || '3306'} -u "${db.user}" -p"${db.password}" "${db.name}" 2>&1 && echo "Database cloned successfully"`;
        const cloneLog = await runStep(conn, 'db_clone', cloneCmd, 600_000);
        await pushLog(cloneLog);
        if (cloneLog.exitCode !== 0) {
          return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: `Database clone failed: ${cloneLog.stderr || cloneLog.stdout}` };
        }
      }

      // Import SQL if configured
      if (db.importSql && db.sqlPath) {
        await pushStarting('db_import', `Importing SQL from ${db.sqlPath}...`);
        const importCmd = `mysql -h "${db.host}" -P ${db.port || '3306'} -u "${db.user}" -p"${db.password}" "${db.name}" < "${db.sqlPath}" 2>&1 && echo "SQL imported"`;
        const importLog = await runStep(conn, 'db_import', importCmd, 120_000);
        await pushLog(importLog);
      }
    }

    // ── Step 6: Nginx ──
    if (opts.nginx?.domain && opts.nginx?.autoGenerate) {
      const ng = opts.nginx;
      const slug = opts.remotePath.split('/').filter(Boolean).pop() || 'app';
      const phpVer = ng.phpVer || '8.2';
      const root = ng.root || opts.remotePath;

      // Build proper multi-line nginx vhost config
      const lines: string[] = [];
      lines.push('server {');
      lines.push('    listen 80;');
      lines.push(`    server_name ${ng.domain};`);
      lines.push('');
      lines.push(`    root ${root};`);
      lines.push('    index index.php index.html;');
      lines.push('');

      // WebSocket locations first (most specific)
      if (ng.socketPort) {
        lines.push('    # Main Socket');
        lines.push('    location /socket.io/ {');
        lines.push(`        proxy_pass http://localhost:${ng.socketPort};`);
        lines.push('        proxy_http_version 1.1;');
        lines.push('        proxy_set_header Upgrade $http_upgrade;');
        lines.push('        proxy_set_header Connection "upgrade";');
        lines.push('        proxy_set_header Host $host;');
        lines.push('        proxy_set_header X-Real-IP $remote_addr;');
        lines.push('        proxy_cache_bypass $http_upgrade;');
        lines.push('        proxy_read_timeout 86400;');
        lines.push('    }');
        lines.push('');
      }

      if (ng.rateSocketPort) {
        lines.push('    # Rate Socket');
        lines.push('    location /ratesocket/ {');
        lines.push(`        proxy_pass http://localhost:${ng.rateSocketPort};`);
        lines.push('        proxy_http_version 1.1;');
        lines.push('        proxy_set_header Upgrade $http_upgrade;');
        lines.push('        proxy_set_header Connection "upgrade";');
        lines.push('        proxy_set_header Host $host;');
        lines.push('        proxy_set_header X-Real-IP $remote_addr;');
        lines.push('        proxy_cache_bypass $http_upgrade;');
        lines.push('        proxy_read_timeout 86400;');
        lines.push('    }');
        lines.push('');
      }

      if (ng.wsPort) {
        lines.push('    # Native WebSocket');
        lines.push('    location /ws/ {');
        lines.push(`        proxy_pass http://127.0.0.1:${ng.wsPort};`);
        lines.push('        proxy_http_version 1.1;');
        lines.push('        proxy_set_header Upgrade $http_upgrade;');
        lines.push('        proxy_set_header Connection "upgrade";');
        lines.push('        proxy_set_header Host $host;');
        lines.push('        proxy_read_timeout 86400;');
        lines.push('        proxy_send_timeout 86400;');
        lines.push('        proxy_buffering off;');
        lines.push('    }');
        lines.push('');
      }

      // Admin panel
      if (ng.enableAdmin) {
        lines.push('    # Admin panel');
        lines.push('    location /admin/ {');
        lines.push('        try_files $uri $uri/ /admin/index.php?$query_string;');
        lines.push('    }');
        lines.push('');
      }

      // CodeIgniter routing (main)
      lines.push('    # CodeIgniter routing');
      lines.push('    location / {');
      lines.push('        try_files $uri $uri/ /index.php?$query_string;');
      lines.push('    }');
      lines.push('');

      // Mobile API
      if (ng.enableMobileApi) {
        lines.push('    # Mobile API');
        lines.push('    location /mobileapi/ {');
        lines.push('        try_files $uri $uri/ /mobileapi/index.php?$query_string;');
        lines.push('    }');
        lines.push('');
      }

      // Laravel (lmxtrade)
      if (ng.enableLaravel !== false) {
        lines.push('    # Laravel');
        lines.push('    location /lmxtrade/winbullliteapi/ {');
        lines.push('        try_files $uri $uri/ /lmxtrade/winbullliteapi/index.php?$query_string;');
        lines.push('    }');
        lines.push('');
      }

      // PHP processing
      lines.push('    # PHP processing');
      lines.push('    location ~ \.php$ {');
      lines.push('        include snippets/fastcgi-php.conf;');
      lines.push(`        fastcgi_pass unix:/run/php/php${phpVer}-fpm.sock;`);
      lines.push('    }');
      lines.push('');

      // Extra directives
      if (ng.extraDirectives) {
        lines.push(`    ${ng.extraDirectives}`);
        lines.push('');
      }

      // Deny hidden files
      lines.push('    location ~ /\.ht {');
      lines.push('        deny all;');
      lines.push('    }');
      lines.push('}');

      const vhostContent = lines.join('\n');

      // Heredoc with quoted delimiter prevents shell from expanding $uri etc
      const confPath = `/etc/nginx/sites-available/${slug}`;
      await pushStarting('nginx', `Configuring Nginx for ${ng.domain}...`);
      const nginxCmd = `sudo tee ${confPath} > /dev/null << 'CORTEXO_NGINX'\n${vhostContent}\nCORTEXO_NGINX\nsudo ln -sf ${confPath} /etc/nginx/sites-enabled/${slug} && sudo nginx -t 2>&1 && sudo systemctl reload nginx && echo "Nginx configured for ${ng.domain}"`;
      const nginxLog = await runStep(conn, 'nginx', nginxCmd, 30_000);
      await pushLog(nginxLog);
    }

    // ── Step 7: File permissions ──
    if (opts.permissions) {
      const p = opts.permissions;
      const permUser = p.user || 'www-data';
      const permGroup = p.group || 'www-data';
      const cmds: string[] = [];

      // Ownership
      cmds.push(`sudo chown ${p.recursive !== false ? '-R' : ''} ${permUser}:${permGroup} "${opts.remotePath}"`);
      // File & dir modes
      if (p.dirMode) cmds.push(`sudo find "${opts.remotePath}" -type d -exec chmod ${p.dirMode} {} +`);
      if (p.fileMode) cmds.push(`sudo find "${opts.remotePath}" -type f -exec chmod ${p.fileMode} {} +`);
      // Writable paths (storage, cache, logs)
      if (p.writablePaths) {
        for (const wp of p.writablePaths.split(',').map(s => s.trim()).filter(Boolean)) {
          cmds.push(`sudo chmod -R 775 "${opts.remotePath}/${wp}" 2>/dev/null || true`);
        }
      }
      // Custom folder permissions
      if (p.folders?.length) {
        for (const f of p.folders) {
          if (f.path) {
            cmds.push(`sudo mkdir -p "${opts.remotePath}/${f.path}" && sudo chown ${f.owner || permUser}:${f.group || permGroup} "${opts.remotePath}/${f.path}" && sudo chmod ${f.perm || '755'} "${opts.remotePath}/${f.path}"`);
          }
        }
      }

      if (cmds.length) {
        await pushStarting('permissions', 'Setting file permissions...');
        const permLog = await runStep(conn, 'permissions', cmds.join(' && ') + ' && echo "Permissions applied"');
        await pushLog(permLog);
      }
    }

    // ── Step 8: Post-deploy command ──
    if (opts.postDeployCmd) {
      await pushStarting('post_deploy', 'Running post-deploy commands...');
      const postLog = await runStep(conn, 'post_deploy', `cd "${opts.remotePath}" && ${opts.postDeployCmd}`, 180_000);
      await pushLog(postLog);
      if (postLog.exitCode !== 0) {
        return { success: false, status: 'failed' as const, logs, totalDurationMs: Date.now() - totalStart, error: `Post-deploy command failed: ${postLog.stderr || postLog.stdout}` };
      }
    }

    // ── Step 9: PM2 processes ──
    if (opts.pm2?.name && opts.pm2?.script) {
      const pm = opts.pm2;
      await pushStarting('pm2', `Starting PM2 process ${pm.name}...`);
      const pm2Cmd = `cd "${opts.remotePath}" && pm2 delete "${pm.name}" 2>/dev/null; pm2 start "${pm.script}" --name "${pm.name}" ${pm.interpreter ? `--interpreter ${pm.interpreter}` : ''} ${pm.instances && pm.instances > 1 ? `-i ${pm.instances}` : ''} ${pm.args || ''} && pm2 save && echo "PM2 process ${pm.name} started"`;
      const pm2Log = await runStep(conn, 'pm2', pm2Cmd, 30_000);
      await pushLog(pm2Log);
    }

    // ── Step 10: Health check ──
    if (opts.healthCheckUrl) {
      await pushStarting('health_check', `Checking health at ${opts.healthCheckUrl}...`);
      const healthLog = await runStep(conn, 'health_check', `HTTP_CODE=$(curl -skL -o /dev/null -w "%{http_code}" "${opts.healthCheckUrl}" 2>/dev/null); if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then echo "OK ($HTTP_CODE)"; else echo "FAIL ($HTTP_CODE)"; fi`, 30_000);
      await pushLog(healthLog);
    }

    // ── Step 11: Capture commit SHA ──
    await pushStarting('commit_sha', 'Capturing commit SHA...');
    const shaLog = await runStep(conn, 'commit_sha', `cd "${opts.remotePath}" && git rev-parse --short HEAD`);
    await pushLog(shaLog);

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
      try { (conn as any).__jumpConn?.end(); } catch (_) { /* ignore */ }
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

// ── Provisioning Sequence ────────────────────────────────────────

/**
 * Run a full new-client provisioning sequence over SSH:
 *
 *  1. Connect to server
 *  2. Clone base source files → new directory
 *  3. Clone base DB → new DB (mysqldump | mysql)
 *  4. Rename client files (lmxtrade → clientSlug)
 *  5. sed replacements (config files, class names, paths)
 *  6. Update global_configs.php (domain, DB, title)
 *  7. DB truncate (sessions, bookings, customers, etc.)
 *  8. DB update (company name, admin creds, templates)
 *  9. Nginx vhost
 * 10. PM2 processes (ws + socket.io)
 * 11. Log cleanup
 * 12. File permissions
 */
export async function runProvisionSequence(
  creds: SSHCredentials,
  opts: ProvisionOptions,
  onProgress?: (logs: DeployLog[]) => void | Promise<void>,
): Promise<DeployResult> {
  const totalStart = Date.now();
  const logs: DeployLog[] = [];
  let conn: Client | null = null;

  let BASE = opts.baseSlug || 'lmxtrade';
  let BASE_UPPER = opts.baseSlugUpper || 'LMXTRADE';
  const SLUG = opts.clientSlug;
  const SLUG_UPPER = SLUG.toUpperCase();
  let BASE_DOMAIN = opts.baseDomain || 'bullion_v4.logimaxindia.com';
  const NEW_DOMAIN = `www.${opts.domain}`;
  const PATH = opts.remotePath;
  const db = opts.db;

  try {
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

    // ── Step 1: Connect ──
    await pushStarting('connect', 'Connecting to server...');
    const connectStart = Date.now();
    conn = await sshConnect(creds);
    await pushLog({
      step: 'connect',
      stdout: creds.jumpHost
        ? `Connected to ${creds.host}:${creds.port || 22} via jump ${creds.jumpHost.host}`
        : `Connected to ${creds.host}:${creds.port || 22} as ${creds.username}`,
      stderr: '', exitCode: 0,
      durationMs: Date.now() - connectStart,
      timestamp: new Date().toISOString(),
    });

    // ── Step 2: Clone base source files ──
    if (opts.sourceTemplate?.repoUrl) {
      // Git clone from source template repo (latest code)
      await pushStarting('clone_files', `Git cloning ${opts.sourceTemplate.repoUrl} (${opts.sourceTemplate.branch}) → ${PATH}...`);
      const cloneCmd = [
        `sudo rm -rf "${PATH}" 2>/dev/null || true`,
        `git clone --branch "${opts.sourceTemplate.branch}" --depth 1 "${opts.sourceTemplate.repoUrl}" "${PATH}" 2>&1`,
        `sudo chown -R ${creds.username}:${creds.username} "${PATH}"`,
        'echo "Files cloned from git"',
      ].join(' && ');
      const cloneLog = await runStep(conn, 'clone_files', cloneCmd, 600_000);
      await pushLog(cloneLog);
      if (cloneLog.exitCode !== 0) {
        return { success: false, status: 'failed', logs, totalDurationMs: Date.now() - totalStart, error: `Git clone failed: ${cloneLog.stderr || cloneLog.stdout}` };
      }
    } else if (opts.baseSourcePath) {
      // Fallback: local cp -a
      await pushStarting('clone_files', `Cloning ${opts.baseSourcePath} → ${PATH}...`);
      const cloneCmd = `sudo cp -a "${opts.baseSourcePath}" "${PATH}" && sudo chown -R ${creds.username}:${creds.username} "${PATH}" && echo "Files cloned"`;
      const cloneLog = await runStep(conn, 'clone_files', cloneCmd, 300_000);
      await pushLog(cloneLog);
      if (cloneLog.exitCode !== 0) {
        return { success: false, status: 'failed', logs, totalDurationMs: Date.now() - totalStart, error: `File clone failed: ${cloneLog.stderr}` };
      }
    }

    // ── Step 3: Clone source DB → target DB ──
    if (opts.sourceDb?.name) {
      const src = opts.sourceDb;
      const srcPass = src.password || db.password;
      const srcHost = src.host;
      const srcPort = src.port || '3306';
      const srcUser = src.user;
      const tgtHost = db.host;
      const tgtPort = db.port || '3306';
      const tgtUser = db.user;
      const tgtPass = db.password;

      // Step 3a: Create target database
      await pushStarting('create_db', `Creating database ${db.targetName}...`);
      const createDbCmd = `mysql -h "${tgtHost}" -P ${tgtPort} -u "${tgtUser}" -p"${tgtPass}" -e "CREATE DATABASE IF NOT EXISTS \\\`${db.targetName}\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1`;
      const createLog = await runStep(conn, 'create_db', createDbCmd, 30_000);
      await pushLog(createLog);

      // Step 3b: mysqldump source → mysql target (RDS compatible: strip DEFINER, skip GTID)
      await pushStarting('clone_db', `Cloning DB ${src.name} → ${db.targetName} (cross-host)...`);
      const dumpCmd = [
        `mysqldump -h "${srcHost}" -P ${srcPort} -u "${srcUser}" -p"${srcPass}"`,
        `--single-transaction --routines --triggers --set-gtid-purged=OFF --no-tablespaces --column-statistics=0`,
        `"${src.name}" 2>/dev/null`,
        `| sed 's/DEFINER=[^*]*\\*/\\*/g; s/DEFINER=[^*]*PROCEDURE/PROCEDURE/g; s/DEFINER=[^*]*FUNCTION/FUNCTION/g; s/DEFINER=[^*]*TRIGGER/TRIGGER/g; s/DEFINER=[^*]*EVENT/EVENT/g; s/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g; s/utf8mb4_0900_as_cs/utf8mb4_unicode_ci/g; s/utf8mb3_unicode_ci/utf8_unicode_ci/g; s/CHARSET=utf8mb3/CHARSET=utf8/g'`,
        `| mysql -h "${tgtHost}" -P ${tgtPort} -u "${tgtUser}" -p"${tgtPass}" "${db.targetName}" 2>&1`,
        `&& echo "DB cloned successfully"`,
      ].join(' ');
      const dbCloneLog = await runStep(conn, 'clone_db', dumpCmd, 600_000);
      await pushLog(dbCloneLog);
      if (dbCloneLog.exitCode !== 0) {
        return { success: false, status: 'failed', logs, totalDurationMs: Date.now() - totalStart, error: `DB clone failed: ${dbCloneLog.stderr || dbCloneLog.stdout}` };
      }
    }

    // ── Step 3c: Auto-detect source slug & domain from cloned global_configs.php ──
    await pushStarting('detect_source', 'Detecting source template identity...');
    const detectCmd = [
      `cd "${PATH}"`,
      `SRC_CLIENT=$(grep -oP '\\$client\\s*=\\s*"\\K[^"]+' global_configs.php | head -1)`,
      `SRC_DOMAIN=$(grep -oP '\\$web_base_url\\s*=\\s*"https?://\\K[^"/]+' global_configs.php | head -1)`,
      `echo "SOURCE_CLIENT=$SRC_CLIENT"`,
      `echo "SOURCE_DOMAIN=$SRC_DOMAIN"`,
    ].join(' && ');
    const detectLog = await runStep(conn, 'detect_source', detectCmd, 10_000);
    await pushLog(detectLog);

    // Parse detected values from stdout
    const srcClientMatch = detectLog.stdout.match(/SOURCE_CLIENT=(\S+)/);
    const srcDomainMatch = detectLog.stdout.match(/SOURCE_DOMAIN=(\S+)/);
    if (srcClientMatch?.[1]) {
      BASE = srcClientMatch[1];
      BASE_UPPER = BASE.toUpperCase();
    }
    if (srcDomainMatch?.[1]) {
      BASE_DOMAIN = srcDomainMatch[1];
    }

    // ── Step 4: File renames (${BASE} → clientSlug) ──
    await pushStarting('rename_files', `Renaming files: ${BASE} → ${SLUG}...`);
    const renameCmd = [
      `cd "${PATH}"`,
      // Client folder files
      `mv client/${BASE}.enc client/${SLUG}.enc 2>/dev/null || true`,
      `mv client/${BASE}.txt client/${SLUG}.txt 2>/dev/null || true`,
      `mv client/${BASE}_rate.js client/${SLUG}_rate.js 2>/dev/null || true`,
      `mv client/${BASE}_rprate.js client/${SLUG}_rprate.js 2>/dev/null || true`,
      `mv client/${BASE}_rp_rate.txt client/${SLUG}_rp_rate.txt 2>/dev/null || true`,
      `mv client/${BASE}-ws.js client/${SLUG}-ws.js 2>/dev/null || true`,
      // Socket JS
      `mv ${BASE}/${BASE}winlitesocket.js ${BASE}/${SLUG}winlitesocket.js 2>/dev/null || true`,
      // Laravel Controllers & Events
      `mv ${BASE}/winbullliteapi/app/Http/Controllers/${BASE_UPPER}Controller.php ${BASE}/winbullliteapi/app/Http/Controllers/${SLUG_UPPER}Controller.php 2>/dev/null || true`,
      `for f in ${BASE}/winbullliteapi/app/Events/${BASE_UPPER}*.php; do mv "$f" "$(echo $f | sed "s/${BASE_UPPER}/${SLUG_UPPER}/g")" 2>/dev/null || true; done`,
      'echo "Files renamed"',
    ].join(' && ');
    const renameLog = await runStep(conn, 'rename_files', renameCmd, 60_000);
    await pushLog(renameLog);

    // ── Step 5: sed replacements (config files, class names) ──
    await pushStarting('sed_replace', `Replacing ${BASE} → ${SLUG} in config files...`);
    const sedCmd = [
      `cd "${PATH}"`,
      // global.php (Laravel config)
      `sed -i "s/${BASE_UPPER}/${SLUG_UPPER}/g" ${BASE}/winbullliteapi/config/global.php`,
      `sed -i "s/${BASE}/${SLUG}/g" ${BASE}/winbullliteapi/config/global.php`,
      `sed -i "s|/var/www/html/winbullSource|${PATH}|g" ${BASE}/winbullliteapi/config/global.php`,
      // routes/web.php
      `sed -i "s/${BASE}/${SLUG}/g" ${BASE}/winbullliteapi/routes/web.php`,
      `sed -i "s/${BASE_UPPER}/${SLUG_UPPER}/g" ${BASE}/winbullliteapi/routes/web.php`,
      // All Controller + Event PHP class names
      `find ${BASE}/winbullliteapi/app -name "*.php" -exec sed -i "s/${BASE_UPPER}/${SLUG_UPPER}/g" {} +`,
      // Socket JS files (client slug + paths)
      `sed -i "s/${BASE}/${SLUG}/g" client/${SLUG}-ws.js 2>/dev/null || true`,
      `sed -i "s/${BASE}/${SLUG}/g" ${BASE}/${SLUG}winlitesocket.js 2>/dev/null || true`,
      'echo "sed replacements done"',
    ].join(' && ');
    const sedLog = await runStep(conn, 'sed_replace', sedCmd, 60_000);
    await pushLog(sedLog);

    // ── Step 6: Update global_configs.php (comprehensive) ──
    // Real file has ~50+ properties referencing base domain/slug/company.
    // We do a multi-pass sed: first bulk-replace domain + slug, then targeted field updates.
    await pushStarting('update_configs', `Updating global_configs.php...`);
    const title = opts.webTitle || opts.clientName;
    const copyright = opts.webCopyright || `© ${new Date().getFullYear()} ${opts.clientName}. All Rights Reserved`;
    const baseCompany = opts.baseCompanyName || 'LOGIMAX Bullion';
    const configCmd = [
      `cd "${PATH}"`,
      // Bulk domain replacement — catches ALL URLs (web_base_url, app_base_url, socket_base_url, all event URLs, broadcast URLs, etc.)
      `sed -i "s|${BASE_DOMAIN}|${NEW_DOMAIN}|g" global_configs.php`,
      // Client slug in URLs, paths, event names (covers $client, $path, $bcclient, socket events)
      `sed -i "s|/${BASE}/|/${SLUG}/|g" global_configs.php`,
      // Slug as standalone value ($client, $bcclient)
      `sed -i 's|\\$client = "${BASE}"|\\$client = "${SLUG}"|g' global_configs.php`,
      `sed -i 's|\\$bcclient.*= "${BASE}"|\\$bcclient    = "${SLUG}"|g' global_configs.php`,
      // Database name
      `sed -i 's|\\$database = ".*"|\\$database = "${db.targetName}"|g' global_configs.php`,
      // DB host + credentials
      `sed -i 's|\\$hostname = ".*"|\\$hostname = "${db.host}"|g' global_configs.php`,
      `sed -i 's|\\$username = ".*"|\\$username = "${db.user}"|g' global_configs.php`,
      `sed -i 's|\\$password = ".*"|\\$password = "${db.password}"|g' global_configs.php`,
      // Web title + copyright
      `sed -i 's|\\$web_title.*= ".*"|\\$web_title     = "${title}"|g' global_configs.php`,
      `sed -i 's|\\$web_copyright.*= ".*"|\\$web_copyright = "${copyright}"|g' global_configs.php`,
      // Encrypted file path — /var/www/html/BASE/client/BASE.enc → PATH/client/SLUG.enc
      `sed -i 's|\\$path = ".*"|\\$path = "${PATH}/client/${SLUG}.enc"|g' global_configs.php`,
      // Socket event class names (e.g. LMXTRADECommodityUpdates → CLIENTSLUGCommodityUpdates)
      `sed -i "s/${BASE_UPPER}/${SLUG_UPPER}/g" global_configs.php`,
      // Socket event channel names (e.g. lmxtradeupdatecommodity → clientslug...)
      `sed -i "s/${BASE}update/${SLUG}update/g" global_configs.php`,
      `sed -i "s/${BASE}terminate/${SLUG}terminate/g" global_configs.php`,
      // Notification titles
      `sed -i 's|\\$notification_title .*= ".*"|\\$notification_title             = "${opts.clientName}"|g' global_configs.php`,
      `sed -i 's|\\$notification_subtitle .*= ".*"|\\$notification_subtitle          = "From ${opts.clientName}"|g' global_configs.php`,
      `sed -i 's|\\$notification_title_admin .*= ".*"|\\$notification_title_admin       = "${opts.clientName} Admin App"|g' global_configs.php`,
      `sed -i 's|\\$notification_subtitle_admin .*= ".*"|\\$notification_subtitle_admin     = "From ${opts.clientName} Admin App"|g' global_configs.php`,
      // Clear credentials that should be per-client (OneSignal, WhatsApp instance, etc.)
      `sed -i 's|\\$app_id .*= ".*"|\\$app_id                         = ""|g' global_configs.php`,
      `sed -i 's|\\$onesignalauth .*= ".*"|\\$onesignalauth                  = ""|g' global_configs.php`,
      `sed -i 's|\\$instanceid .*= ".*"|\\$instanceid  = ""|g' global_configs.php`,
      'echo "global_configs.php updated"',
    ].join(' && ');
    const configLog = await runStep(conn, 'update_configs', configCmd, 30_000);
    await pushLog(configLog);

    // ── Step 7: DB truncate (fresh client) ──
    await pushStarting('db_truncate', `Truncating transactional tables in ${db.targetName}...`);
    const truncateTables = [
      'ci_usersessions', 'ci_sessions', 'dt_admin_log', 'dt_adminsessions',
      'dt_cus_commodity', 'dt_booking', 'dt_booking_tracking', 'dt_transaction',
      'dt_marginmanagement', 'dt_customerdelivery', 'dt_customer_deliveryinvoice',
      'dt_customergroupitems', 'dt_customer', 'dt_customergroup',
      'dt_historicaldata', 'dt_historical_avg', 'dt_ratealert', 'dt_hedge_log',
      'dt_usersessions', 'dt_user_device', 'dt_quotation', 'dt_fundtransfer',
      'dt_knockoff', 'dt_unfix', 'dt_coverupmcx', 'order_logs',
      'dt_popup', 'dt_marqueetext', 'dt_news', 'dt_admininfo',
      'dt_com_master', 'dt_appevents', 'dt_appvideos',
      'dt_advertisements', 'dt_gallery', 'dt_events',
    ];
    const truncateSql = `SET FOREIGN_KEY_CHECKS=0; ${truncateTables.map(t => `TRUNCATE ${t};`).join(' ')} SET FOREIGN_KEY_CHECKS=1;`;
    const truncateCmd = `mysql -h "${db.host}" -P ${db.port || '3306'} -u "${db.user}" -p"${db.password}" "${db.targetName}" -e "${truncateSql}" 2>&1 && echo "Tables truncated"`;
    const truncateLog = await runStep(conn, 'db_truncate', truncateCmd, 60_000);
    await pushLog(truncateLog);

    // ── Step 8: DB update (company settings, admin creds, templates) ──
    await pushStarting('db_configure', `Configuring ${db.targetName} for ${opts.clientName}...`);
    const adminUser = opts.adminUser || 'admin';
    const adminPwd = opts.adminPassword || 'admin@123';
    // Run each UPDATE separately so one missing column/table doesn't block all
    const dbUpdates = [
      { label: 'general_settings', sql: `UPDATE dt_generalsettings SET admin_company_name='${opts.clientName}', admin_mail='', admin_mail_server='', admin_mail_password='', admin_mob1='', admin_mob2='', admin_mob3='', admin_mob4='', admin_mob5='', is_admin_mob1=0, is_admin_mob2=0, is_admin_mob3=0, is_admin_mob4=0, is_admin_mob5=0, invoice_comp_name='', address='', city='', state='', pincode=0, mobile='', email='', gst_no='', pan_no='' WHERE genid=1;` },
      { label: 'admin_user', sql: `UPDATE dt_admin_user SET admin_user_name='${adminUser}', admin_user_password=MD5('${adminPwd}') WHERE admin_user_id=3;` },
      { label: 'email_settings', sql: `UPDATE dt_email_settings SET email_content=REPLACE(REPLACE(email_content,'${baseCompany}','${opts.clientName}'),'${BASE_UPPER}','${SLUG_UPPER}'), email_signature=REPLACE(REPLACE(email_signature,'${baseCompany}','${opts.clientName}'),'${BASE_UPPER}','${SLUG_UPPER}');` },
      { label: 'sms_settings', sql: `UPDATE dt_sms_settings SET sms_footer=REPLACE(sms_footer,'${baseCompany.toUpperCase()}','${opts.clientName.toUpperCase()}');` },
      { label: 'whatsapp_settings', sql: `UPDATE dt_whatsapp_settings SET whatsapp_footer=REPLACE(whatsapp_footer,'${baseCompany}','${opts.clientName}');` },
    ];
    const dbConfigParts = dbUpdates.map(u =>
      `mysql -h "${db.host}" -P ${db.port || '3306'} -u "${db.user}" -p"${db.password}" "${db.targetName}" -e "${u.sql}" 2>&1 && echo "${u.label}: OK" || echo "${u.label}: SKIPPED"`
    );
    const updateCmd = dbConfigParts.join(' && ') + ' && echo "DB configured"';
    const updateLog = await runStep(conn, 'db_configure', updateCmd, 60_000);
    await pushLog(updateLog);

    // ── Step 9: Nginx vhost ──
    if (opts.nginx?.autoGenerate && opts.domain) {
      const phpVer = opts.nginx.phpVer || '8.2';
      const rateSocketPort = opts.wsPort ? String(Number(opts.wsPort) - 1) : '';

      const vhostContent = [
        'server {',
        '    listen 80;',
        `    server_name ${NEW_DOMAIN};`,
        `    root ${PATH};`,
        '    index index.php index.html;',
        '',
        `    # Socket.IO (port ${opts.socketIoPort})`,
        '    location /socket.io/ {',
        `        proxy_pass http://localhost:${opts.socketIoPort};`,
        '        proxy_http_version 1.1;',
        '        proxy_set_header Upgrade $http_upgrade;',
        '        proxy_set_header Connection "upgrade";',
        '        proxy_set_header Host $host;',
        '        proxy_set_header X-Real-IP $remote_addr;',
        '        proxy_cache_bypass $http_upgrade;',
        '        proxy_read_timeout 86400;',
        '    }',
        '',
        rateSocketPort ? [
          `    # Rate Socket (port ${rateSocketPort})`,
          '    location /ratesocket/ {',
          `        proxy_pass http://localhost:${rateSocketPort};`,
          '        proxy_http_version 1.1;',
          '        proxy_set_header Upgrade $http_upgrade;',
          '        proxy_set_header Connection "upgrade";',
          '        proxy_set_header Host $host;',
          '        proxy_set_header X-Real-IP $remote_addr;',
          '        proxy_cache_bypass $http_upgrade;',
          '        proxy_read_timeout 86400;',
          '    }',
        ].join('\n') : '',
        '',
        `    # Native WebSocket (port ${opts.wsPort})`,
        '    location /ws {',
        `        proxy_pass http://127.0.0.1:${opts.wsPort};`,
        '        proxy_http_version 1.1;',
        '        proxy_set_header Upgrade $http_upgrade;',
        '        proxy_set_header Connection "upgrade";',
        '        proxy_set_header Host $host;',
        '        proxy_read_timeout 86400;',
        '        proxy_send_timeout 86400;',
        '        proxy_buffering off;',
        '    }',
        '',
        '    location /admin/ { try_files $uri $uri/ /admin/index.php?$query_string; }',
        '    location / { try_files $uri $uri/ /index.php?$query_string; }',
        '    location /mobileapi/ { try_files $uri $uri/ /mobileapi/index.php?$query_string; }',
        `    location /${BASE}/winbullliteapi/ { try_files $uri $uri/ /${BASE}/winbullliteapi/index.php?$query_string; }`,
        `    location ~ \\.php$ { include snippets/fastcgi-php.conf; fastcgi_pass unix:/run/php/php${phpVer}-fpm.sock; }`,
        '    location ~ /\\. { deny all; }',
        '}',
      ].filter(Boolean).join('\n');

      const confPath = `/etc/nginx/sites-available/${SLUG}`;
      await pushStarting('nginx', `Configuring Nginx for ${NEW_DOMAIN}...`);
      const nginxCmd = `sudo tee ${confPath} > /dev/null << 'CORTEXO_NGINX'\n${vhostContent}\nCORTEXO_NGINX\nsudo ln -sf ${confPath} /etc/nginx/sites-enabled/${SLUG} && sudo nginx -t 2>&1 && sudo systemctl reload nginx && echo "Nginx configured for ${NEW_DOMAIN}"`;
      const nginxLog = await runStep(conn, 'nginx', nginxCmd, 30_000);
      await pushLog(nginxLog);
    }

    // ── Step 10: PM2 processes ──
    await pushStarting('pm2', `Starting PM2 processes for ${SLUG}...`);
    const pm2Cmd = [
      `cd "${PATH}"`,
      // Delete existing processes if any
      `pm2 delete "${SLUG}-ws" 2>/dev/null || true`,
      `pm2 delete "${SLUG}-socketio" 2>/dev/null || true`,
      // Native WebSocket — try renamed file first, then detect from client/
      `WS_FILE="client/${SLUG}-ws.js"; [ ! -f "$WS_FILE" ] && WS_FILE=$(find client/ -name '*-ws.js' -o -name '*_rate.js' | head -1); [ -f "$WS_FILE" ] && pm2 start "$WS_FILE" --name "${SLUG}-ws" && echo "Started: $WS_FILE" || echo "No WS file found, skipping"`,
      // Socket.IO — try renamed file first, then detect from BASE/ folder
      `SIO_FILE="${BASE}/${SLUG}winlitesocket.js"; [ ! -f "$SIO_FILE" ] && SIO_FILE=$(find ${BASE}/ -name '*winlitesocket.js' -o -name '*socket*.js' | head -1) 2>/dev/null; [ -f "$SIO_FILE" ] && pm2 start "$SIO_FILE" --name "${SLUG}-socketio" && echo "Started: $SIO_FILE" || echo "No Socket.IO file found, skipping"`,
      'pm2 save',
      'echo "PM2 processes configured"',
    ].join(' && ');
    const pm2Log = await runStep(conn, 'pm2', pm2Cmd, 30_000);
    await pushLog(pm2Log);

    // ── Step 11: Log cleanup ──
    await pushStarting('log_cleanup', 'Cleaning logs and caches...');
    const cleanCmd = [
      `> "${PATH}/${BASE}/winbullliteapi/storage/logs/lumen.log" 2>/dev/null || true`,
      `find "${PATH}/application/logs" -name 'log-*.php' -exec truncate -s 0 {} + 2>/dev/null || true`,
      `find "${PATH}/admin/application/logs" -name 'log-*.php' -exec truncate -s 0 {} + 2>/dev/null || true`,
      `rm -rf "${PATH}/${BASE}/winbullliteapi/storage/framework/cache/data/"* 2>/dev/null || true`,
      `rm -rf "${PATH}/${BASE}/winbullliteapi/storage/framework/sessions/"* 2>/dev/null || true`,
      `rm -rf "${PATH}/${BASE}/winbullliteapi/storage/framework/views/"* 2>/dev/null || true`,
      `pm2 flush "${SLUG}-ws" 2>/dev/null || true`,
      `pm2 flush "${SLUG}-socketio" 2>/dev/null || true`,
      'echo "Logs cleaned"',
    ].join(' && ');
    const cleanLog = await runStep(conn, 'log_cleanup', cleanCmd, 30_000);
    await pushLog(cleanLog);

    // ── Step 12: File permissions ──
    const permOwner = opts.permUser || creds.username;
    const permGrp = opts.permGroup || permOwner;
    await pushStarting('permissions', `Setting file permissions (${permOwner}:${permGrp})...`);
    const permCmd = [
      `sudo chown -R ${permOwner}:${permGrp} "${PATH}"`,
      `sudo find "${PATH}" -type d -exec chmod 755 {} +`,
      `sudo find "${PATH}" -type f -exec chmod 644 {} +`,
      `sudo chmod -R 775 "${PATH}/${BASE}/winbullliteapi/storage" 2>/dev/null || true`,
      `sudo chmod -R 775 "${PATH}/uploads" 2>/dev/null || true`,
      'echo "Permissions set"',
    ].join(' && ');
    const permLog = await runStep(conn, 'permissions', permCmd, 60_000);
    await pushLog(permLog);

    return {
      success: true,
      status: 'success',
      logs,
      totalDurationMs: Date.now() - totalStart,
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
      try { (conn as any).__jumpConn?.end(); } catch (_) { /* ignore */ }
      try { conn.end(); } catch (_) { /* ignore */ }
    }
  }
}
