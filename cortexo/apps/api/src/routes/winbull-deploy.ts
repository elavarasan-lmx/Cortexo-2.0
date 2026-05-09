import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { Client as SSHClient } from 'ssh2';
import { readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';

// ── Deploy Request Schema ────────────────────────────────────────────
const deploySchema = z.object({
  projectId: z.union([z.string(), z.number()]),
  serverId: z.union([z.string(), z.number()]).transform(v => Number(v)),
  settings: z.object({
    clientSlug: z.string().min(1),
    name: z.string().min(1),
    domain: z.string().min(1),
    webTitle: z.string().optional(),
    webCopyright: z.string().optional(),
    serverPath: z.string().min(1),
    repoUrl: z.string().optional(),
    branch: z.string().default('development'),
    // Database
    dbHost: z.string().min(1),
    dbUser: z.string().min(1),
    dbPassword: z.string().min(1),
    dbName: z.string().min(1),
    dbPort: z.string().default('3306'),
    // Ports
    wsPort: z.string().min(1),
    socketIoPort: z.string().min(1),
    // Admin
    adminUser: z.string().min(1),
    adminPassword: z.string().min(1),
  }),
});

type DeploySettings = z.infer<typeof deploySchema>['settings'];

// ── Step Definitions ─────────────────────────────────────────────────
interface StepResult {
  step: string;
  status: 'success' | 'failed' | 'skipped';
  output?: string;
  error?: string;
  duration?: number;
}

// ── SSH Command Runner ───────────────────────────────────────────────
function sshExec(conn: SSHClient, command: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (data: Buffer) => { stdout += data.toString(); });
      stream.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
      stream.on('close', (code: number) => {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code: code || 0 });
      });
    });
  });
}

// ── Step Builders ────────────────────────────────────────────────────
function buildGitCloneCmd(s: DeploySettings): string {
  return `git clone ${s.repoUrl || ''} -b ${s.branch} ${s.serverPath}`;
}

function buildFileRenamesCmds(s: DeploySettings): string[] {
  const slug = s.clientSlug;
  const SLUG = slug.toUpperCase();
  return [
    `cd ${s.serverPath}`,
    // Client folder renames
    `mv client/lmxtrade.enc client/${slug}.enc 2>/dev/null || true`,
    `mv client/lmxtrade.txt client/${slug}.txt 2>/dev/null || true`,
    `mv client/lmxtrade_rate.js client/${slug}_rate.js 2>/dev/null || true`,
    `mv client/lmxtrade_rprate.js client/${slug}_rprate.js 2>/dev/null || true`,
    `mv client/lmxtrade_rp_rate.txt client/${slug}_rp_rate.txt 2>/dev/null || true`,
    `mv client/lmxtrade-ws.js client/${slug}-ws.js 2>/dev/null || true`,
    // Socket JS
    `mv lmxtrade/lmxtradewinlitesocket.js lmxtrade/${slug}winlitesocket.js 2>/dev/null || true`,
    // Laravel controllers + events
    `mv lmxtrade/winbullliteapi/app/Http/Controllers/LMXTRADEController.php lmxtrade/winbullliteapi/app/Http/Controllers/${SLUG}Controller.php 2>/dev/null || true`,
    `for f in lmxtrade/winbullliteapi/app/Events/LMXTRADE*.php; do mv "$f" "$(echo $f | sed 's/LMXTRADE/${SLUG}/g')" 2>/dev/null || true; done`,
  ];
}

function buildSedCmds(s: DeploySettings): string[] {
  const slug = s.clientSlug;
  const SLUG = slug.toUpperCase();
  return [
    `cd ${s.serverPath}`,
    // global.php (Laravel)
    `sed -i "s/LMXTRADE/${SLUG}/g" lmxtrade/winbullliteapi/config/global.php`,
    `sed -i "s/lmxtrade/${slug}/g" lmxtrade/winbullliteapi/config/global.php`,
    `sed -i "s|/var/www/html/winbullSource|${s.serverPath}|g" lmxtrade/winbullliteapi/config/global.php`,
    // routes/web.php
    `sed -i "s/lmxtrade/${slug}/g" lmxtrade/winbullliteapi/routes/web.php`,
    `sed -i "s/LMXTRADE/${SLUG}/g" lmxtrade/winbullliteapi/routes/web.php`,
    // All PHP class names
    `find lmxtrade/winbullliteapi/app -name "*.php" -exec sed -i "s/LMXTRADE/${SLUG}/g" {} +`,
    // Socket JS internals
    `sed -i "s/lmxtrade/${slug}/g" client/${slug}-ws.js`,
    `sed -i "s/lmxtrade/${slug}/g" lmxtrade/${slug}winlitesocket.js`,
    // global_configs.php
    `sed -i "s|bullion_v4.logimaxindia.com|www.${s.domain}|g" global_configs.php`,
    `sed -i 's|\\$database = "winbullSource"|\\$database = "${s.dbName}"|g' global_configs.php`,
    `sed -i 's|\\$web_title = ".*"|\\$web_title = "${s.webTitle || s.name}"|g' global_configs.php`,
    `sed -i 's|\\$web_copyright = ".*"|\\$web_copyright = "${s.webCopyright || '© 2025 ' + s.name}"|g' global_configs.php`,
    `sed -i 's|\\$client = "lmxtrade"|\\$client = "${slug}"|g' global_configs.php`,
  ];
}

function buildNginxConfig(s: DeploySettings): string {
  const ratePort = String(Number(s.wsPort) - 1);
  return `server {
    listen 80;
    server_name www.${s.domain};

    root ${s.serverPath};
    index index.php index.html;

    # Main Socket (port ${s.socketIoPort})
    location /socket.io/ {
        proxy_pass http://localhost:${s.socketIoPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_cache_bypass \\$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Rate Socket (port ${ratePort})
    location /ratesocket/ {
        proxy_pass http://localhost:${ratePort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_cache_bypass \\$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Native WebSocket (port ${s.wsPort})
    location /ws {
        proxy_pass http://127.0.0.1:${s.wsPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_cache_bypass \\$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Admin Panel
    location /admin {
        try_files \\$uri \\$uri/ /admin/index.php?\\$query_string;
    }

    # Laravel API
    location /lmxtrade/winbullliteapi {
        try_files \\$uri \\$uri/ /lmxtrade/winbullliteapi/public/index.php?\\$query_string;
    }

    # Mobile API
    location /mobileapi {
        try_files \\$uri \\$uri/ /mobileapi/index.php?\\$query_string;
    }

    # CI routes
    location / {
        try_files \\$uri \\$uri/ /index.php?\\$query_string;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \\$document_root\\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\\.ht {
        deny all;
    }
}`;
}

function buildTruncateSQL(s: DeploySettings): string {
  const tables = [
    'ci_usersessions', 'ci_sessions', 'dt_admin_log', 'dt_adminsessions',
    'dt_cus_commodity', 'dt_booking', 'dt_booking_tracking', 'dt_transaction',
    'dt_marginmanagement', 'dt_customerdelivery', 'dt_customer_deliveryinvoice',
    'dt_customergroupitems', 'dt_customer', 'dt_customergroup',
    'dt_historicaldata', 'dt_historical_avg', 'dt_ratealert', 'dt_hedge_log',
    'dt_usersessions', 'dt_user_device', 'dt_quotation', 'dt_fundtransfer',
    'dt_knockoff', 'dt_unfix', 'dt_coverupmcx', 'order_logs',
    'dt_popup', 'dt_marqueetext', 'dt_news', 'dt_admininfo', 'dt_com_master',
    'dt_appevents', 'dt_appvideos', 'dt_advertisements', 'dt_gallery', 'dt_events',
  ];

  const truncates = tables.map(t => `TRUNCATE ${t};`).join('\n');
  const NAME = s.name;
  const SLUG = s.clientSlug;

  return `USE ${s.dbName};
SET FOREIGN_KEY_CHECKS = 0;
${truncates}
SET FOREIGN_KEY_CHECKS = 1;

-- Update general settings
UPDATE dt_generalsettings SET
  admin_company_name = '${NAME}',
  admin_mail = '', admin_mail_server = '', admin_mail_password = '',
  admin_mob1 = '', admin_mob2 = '', admin_mob3 = '', admin_mob4 = '', admin_mob5 = '',
  is_admin_mob1 = 0, is_admin_mob2 = 0, is_admin_mob3 = 0, is_admin_mob4 = 0, is_admin_mob5 = 0,
  invoice_comp_name = '', address = '', city = '', state = '', pincode = 0,
  mobile = '', email = '', gst_no = '', pan_no = '',
  website_logo = 'logo.png', admin_logo = NULL, website_favicon = 'favicon.ico'
WHERE genid = 1;

-- Update client admin (bullion user, id=3)
UPDATE dt_admin_user SET
  admin_user_name = '${s.adminUser}',
  admin_user_password = MD5('${s.adminPassword}')
WHERE admin_user_id = 3;

-- Email templates
UPDATE dt_email_settings SET
  email_content = REPLACE(email_content, 'LOGIMAX Bullion', '${NAME}'),
  email_signature = REPLACE(email_signature, 'LOGIMAX Bullion', '${NAME}');

-- SMS templates
UPDATE dt_sms_settings SET
  sms_footer = REPLACE(sms_footer, 'LOGIMAX BULLION', '${NAME.toUpperCase()}');

-- WhatsApp templates
UPDATE dt_whatsapp_settings SET
  whatsapp_footer = REPLACE(whatsapp_footer, 'Logimax', '${NAME}');`;
}

function buildLogCleanupCmds(s: DeploySettings): string[] {
  return [
    `cd ${s.serverPath}`,
    `> lmxtrade/winbullliteapi/storage/logs/lumen.log 2>/dev/null || true`,
    `rm -f application/logs/log-*.php 2>/dev/null || true`,
    `rm -f admin/application/logs/log-*.php 2>/dev/null || true`,
    `rm -rf lmxtrade/winbullliteapi/storage/framework/cache/data/* 2>/dev/null || true`,
    `rm -rf lmxtrade/winbullliteapi/storage/framework/sessions/* 2>/dev/null || true`,
    `rm -rf lmxtrade/winbullliteapi/storage/framework/views/* 2>/dev/null || true`,
  ];
}

// ── Deploy Route ─────────────────────────────────────────────────────
export async function winbullDeployRoutes(app: FastifyInstance) {

  /**
   * POST /v1/winbull/deploy
   * Executes full deployment for a WinBull client project.
   * Steps: Git Clone → File Renames → Sed Replacements → Nginx → PM2 → DB Setup → Log Cleanup
   */
  app.post('/winbull/deploy', async (request, reply) => {
    const parsed = deploySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { serverId, settings: s } = parsed.data;
    const results: StepResult[] = [];

    // ── Get server SSH details ────────────────────────────────────
    const db = await getDb();
    const server = await db.query.servers.findFirst({
      where: (sv, { eq }) => eq(sv.id, serverId),
    });

    if (!server) {
      return reply.code(404).send({ error: 'Server not found' });
    }

    const sshHost = server.privateIp || server.publicAddress;
    if (!sshHost) {
      return reply.code(400).send({ error: 'Server has no IP configured' });
    }

    // ── SSE Stream Setup ──────────────────────────────────────────
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const sendEvent = (data: Record<string, unknown>) => {
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent({ type: 'status', message: '🔌 Connecting to server via SSH...' });

    // ── Connect via SSH ───────────────────────────────────────────
    const conn = new SSHClient();

    try {
      await new Promise<void>((resolve, reject) => {
        conn.on('ready', resolve);
        conn.on('error', reject);

        const sshConfig: Record<string, unknown> = {
          host: sshHost,
          port: 22,
          username: 'ubuntu',
          readyTimeout: 10000,
        };

        // Try SSH key from server record, then fall back to default
        if (server.sshKey) {
          sshConfig.privateKey = server.sshKey;
        } else {
          try {
            sshConfig.privateKey = readFileSync(pathResolve(process.env.HOME || '~', '.ssh/id_rsa'));
          } catch {
            return reject(new Error('No SSH key available for this server'));
          }
        }

        conn.connect(sshConfig as any);
      });

      sendEvent({ type: 'status', message: `✅ SSH connected to ${sshHost}` });
      app.log.info({ server: sshHost, slug: s.clientSlug }, 'SSH connected — starting deployment');

      // ── Step 1: Git Clone ──────────────────────────────────────
      sendEvent({ type: 'step_start', step: 'Git Clone', index: 0 });
      const step1Start = Date.now();
      try {
        const checkPath = await sshExec(conn, `test -d ${s.serverPath} && echo "EXISTS" || echo "EMPTY"`);
        if (checkPath.stdout.includes('EXISTS')) {
          const r: StepResult = { step: 'Git Clone', status: 'skipped', output: `${s.serverPath} already exists — skipping clone` };
          results.push(r);
          sendEvent({ type: 'step_done', ...r, index: 0 });
        } else if (s.repoUrl) {
          const gitResult = await sshExec(conn, buildGitCloneCmd(s));
          const r: StepResult = { step: 'Git Clone', status: gitResult.code === 0 ? 'success' : 'failed', output: gitResult.stdout, error: gitResult.stderr || undefined, duration: Date.now() - step1Start };
          results.push(r);
          sendEvent({ type: 'step_done', ...r, index: 0 });
          if (gitResult.code !== 0) throw new Error(`Git clone failed: ${gitResult.stderr}`);
        } else {
          const r: StepResult = { step: 'Git Clone', status: 'skipped', output: 'No repo URL provided' };
          results.push(r);
          sendEvent({ type: 'step_done', ...r, index: 0 });
        }
      } catch (e: any) {
        const r: StepResult = { step: 'Git Clone', status: 'failed', error: e.message, duration: Date.now() - step1Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 0 });
        throw e;
      }

      // ── Step 2: File Renames ───────────────────────────────────
      sendEvent({ type: 'step_start', step: 'File Renames', index: 1 });
      const step2Start = Date.now();
      try {
        const cmds = buildFileRenamesCmds(s);
        await sshExec(conn, cmds.join(' && '));
        const r: StepResult = { step: 'File Renames', status: 'success', output: `${cmds.length - 1} files renamed`, duration: Date.now() - step2Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 1 });
      } catch (e: any) {
        const r: StepResult = { step: 'File Renames', status: 'failed', error: e.message, duration: Date.now() - step2Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 1 });
      }

      // ── Step 3: Sed Replacements ───────────────────────────────
      sendEvent({ type: 'step_start', step: 'Config Replacements', index: 2 });
      const step3Start = Date.now();
      try {
        const cmds = buildSedCmds(s);
        const result = await sshExec(conn, cmds.join(' && '));
        const r: StepResult = { step: 'Config Replacements', status: result.code === 0 ? 'success' : 'failed', output: `${cmds.length - 1} files updated`, error: result.stderr || undefined, duration: Date.now() - step3Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 2 });
      } catch (e: any) {
        const r: StepResult = { step: 'Config Replacements', status: 'failed', error: e.message, duration: Date.now() - step3Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 2 });
      }

      // ── Step 4: Nginx Config ───────────────────────────────────
      sendEvent({ type: 'step_start', step: 'Nginx Config', index: 3 });
      const step4Start = Date.now();
      try {
        const nginxConf = buildNginxConfig(s);
        const escapedConf = nginxConf.replace(/'/g, "'\\''");
        const nginxFile = `/etc/nginx/sites-available/${s.clientSlug}`;
        const cmds = [
          `echo '${escapedConf}' | sudo tee ${nginxFile}`,
          `sudo ln -sf ${nginxFile} /etc/nginx/sites-enabled/${s.clientSlug}`,
          `sudo nginx -t`,
          `sudo systemctl reload nginx`,
        ];
        const result = await sshExec(conn, cmds.join(' && '));
        const r: StepResult = { step: 'Nginx Config', status: result.code === 0 ? 'success' : 'failed', output: `Created ${nginxFile}`, error: result.stderr || undefined, duration: Date.now() - step4Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 3 });
      } catch (e: any) {
        const r: StepResult = { step: 'Nginx Config', status: 'failed', error: e.message, duration: Date.now() - step4Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 3 });
      }

      // ── Step 5: PM2 Processes ──────────────────────────────────
      sendEvent({ type: 'step_start', step: 'PM2 Processes', index: 4 });
      const step5Start = Date.now();
      try {
        const cmds = [
          `pm2 start ${s.serverPath}/client/${s.clientSlug}-ws.js --name "${s.clientSlug}-ws"`,
          `pm2 start ${s.serverPath}/lmxtrade/${s.clientSlug}winlitesocket.js --name "${s.clientSlug}-socketio"`,
          `pm2 save`,
        ];
        const result = await sshExec(conn, cmds.join(' && '));
        const r: StepResult = { step: 'PM2 Processes', status: result.code === 0 ? 'success' : 'failed', output: `Started ${s.clientSlug}-ws and ${s.clientSlug}-socketio`, error: result.stderr || undefined, duration: Date.now() - step5Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 4 });
      } catch (e: any) {
        const r: StepResult = { step: 'PM2 Processes', status: 'failed', error: e.message, duration: Date.now() - step5Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 4 });
      }

      // ── Step 6: Database Setup ─────────────────────────────────
      sendEvent({ type: 'step_start', step: 'Database Setup', index: 5 });
      const step6Start = Date.now();
      try {
        const sqlScript = buildTruncateSQL(s);
        const escapedSQL = sqlScript.replace(/'/g, "'\\''");
        const result = await sshExec(conn, `mysql -h ${s.dbHost} -u ${s.dbUser} -p'${s.dbPassword}' -e '${escapedSQL}'`);
        const r: StepResult = { step: 'Database Setup', status: result.code === 0 ? 'success' : 'failed', output: 'Truncated 37 tables + updated configs', error: result.stderr || undefined, duration: Date.now() - step6Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 5 });
      } catch (e: any) {
        const r: StepResult = { step: 'Database Setup', status: 'failed', error: e.message, duration: Date.now() - step6Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 5 });
      }

      // ── Step 7: Log Cleanup ────────────────────────────────────
      sendEvent({ type: 'step_start', step: 'Log Cleanup', index: 6 });
      const step7Start = Date.now();
      try {
        const cmds = buildLogCleanupCmds(s);
        await sshExec(conn, cmds.join(' && '));
        const r: StepResult = { step: 'Log Cleanup', status: 'success', output: 'Logs cleared', duration: Date.now() - step7Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 6 });
      } catch (e: any) {
        const r: StepResult = { step: 'Log Cleanup', status: 'failed', error: e.message, duration: Date.now() - step7Start };
        results.push(r);
        sendEvent({ type: 'step_done', ...r, index: 6 });
      }

      conn.end();

      const summary = {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: results.filter(r => r.status === 'skipped').length,
      };
      const allSuccess = results.every(r => r.status === 'success' || r.status === 'skipped');

      sendEvent({ type: 'complete', success: allSuccess, slug: s.clientSlug, server: sshHost, steps: results, summary });
      reply.raw.end();

    } catch (err: any) {
      conn.end();
      app.log.error(err, 'Deployment failed');
      sendEvent({ type: 'complete', success: false, error: err.message, steps: results });
      reply.raw.end();
    }
  });
}

