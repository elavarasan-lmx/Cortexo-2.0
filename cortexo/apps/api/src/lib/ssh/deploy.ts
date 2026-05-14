/**
 * SSH Deploy — Full deployment sequence over SSH.
 *
 * Executes: connect → verify path → pre-deploy → git → DB → nginx →
 * permissions → post-deploy → PM2 → health check → commit SHA.
 */
import type { Client } from 'ssh2';
import type { SSHCredentials, DeployOptions, DeployLog, DeployResult, OnProgress } from './types.js';
import { createLogHelpers } from './types.js';
import { sshConnect, sshDisconnect } from './connection.js';
import { runStep } from './commands.js';

/**
 * Execute a full deployment sequence over SSH:
 *
 *  1. Connect to server
 *  2. Verify remote path exists
 *  3. Run pre-deploy command (optional)
 *  4. Git fetch + checkout + pull
 *  5. Database provisioning (optional)
 *  6. Nginx config (optional)
 *  7. File permissions (optional)
 *  8. Run post-deploy command (optional)
 *  9. PM2 processes (optional)
 * 10. Health check (optional)
 * 11. Capture final commit SHA
 */
export async function runDeploySequence(
  creds: SSHCredentials,
  opts: DeployOptions,
  onProgress?: OnProgress,
): Promise<DeployResult> {
  const totalStart = Date.now();
  const logs: DeployLog[] = [];
  let conn: Client | null = null;
  const { pushLog, pushStarting } = createLogHelpers(logs, onProgress);

  try {
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

        // Push source code to client repo
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

      const lines: string[] = [];
      lines.push('server {');
      lines.push('    listen 80;');
      lines.push(`    server_name ${ng.domain};`);
      lines.push('');
      lines.push(`    root ${root};`);
      lines.push('    index index.php index.html;');
      lines.push('');

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

      if (ng.enableAdmin) {
        lines.push('    # Admin panel');
        lines.push('    location /admin/ {');
        lines.push('        try_files $uri $uri/ /admin/index.php?$query_string;');
        lines.push('    }');
        lines.push('');
      }

      lines.push('    # CodeIgniter routing');
      lines.push('    location / {');
      lines.push('        try_files $uri $uri/ /index.php?$query_string;');
      lines.push('    }');
      lines.push('');

      if (ng.enableMobileApi) {
        lines.push('    # Mobile API');
        lines.push('    location /mobileapi/ {');
        lines.push('        try_files $uri $uri/ /mobileapi/index.php?$query_string;');
        lines.push('    }');
        lines.push('');
      }

      if (ng.enableLaravel !== false) {
        lines.push('    # Laravel');
        lines.push('    location /lmxtrade/winbullliteapi/ {');
        lines.push('        try_files $uri $uri/ /lmxtrade/winbullliteapi/index.php?$query_string;');
        lines.push('    }');
        lines.push('');
      }

      lines.push('    # PHP processing');
      lines.push('    location ~ \\.php$ {');
      lines.push('        include snippets/fastcgi-php.conf;');
      lines.push(`        fastcgi_pass unix:/run/php/php${phpVer}-fpm.sock;`);
      lines.push('    }');
      lines.push('');

      if (ng.extraDirectives) {
        lines.push(`    ${ng.extraDirectives}`);
        lines.push('');
      }

      lines.push('    location ~ /\\.ht {');
      lines.push('        deny all;');
      lines.push('    }');
      lines.push('}');

      const vhostContent = lines.join('\\n');
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

      cmds.push(`sudo chown ${p.recursive !== false ? '-R' : ''} ${permUser}:${permGroup} "${opts.remotePath}"`);
      if (p.dirMode) cmds.push(`sudo find "${opts.remotePath}" -type d -exec chmod ${p.dirMode} {} +`);
      if (p.fileMode) cmds.push(`sudo find "${opts.remotePath}" -type f -exec chmod ${p.fileMode} {} +`);
      if (p.writablePaths) {
        for (const wp of p.writablePaths.split(',').map(s => s.trim()).filter(Boolean)) {
          cmds.push(`sudo chmod -R 775 "${opts.remotePath}/${wp}" 2>/dev/null || true`);
        }
      }
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
    sshDisconnect(conn);
  }
}
