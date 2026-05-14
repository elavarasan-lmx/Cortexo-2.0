/**
 * SSH Provision — Full client provisioning sequence over SSH.
 *
 * Executes: connect → clone source → clone DB → detect source identity →
 * file renames → sed replacements → global_configs.php update →
 * DB truncate → DB configure → nginx → PM2 → log cleanup → permissions.
 *
 * This is the "white-label" pipeline that takes a source template and
 * transforms it into a client-specific instance.
 */
import type { Client } from 'ssh2';
import type { SSHCredentials, ProvisionOptions, DeployLog, DeployResult, OnProgress } from './types.js';
import { createLogHelpers } from './types.js';
import { sshConnect, sshDisconnect } from './connection.js';
import { runStep } from './commands.js';

/**
 * Execute a full client provisioning sequence.
 */
export async function runProvisionSequence(
  creds: SSHCredentials,
  opts: ProvisionOptions,
  onProgress?: OnProgress,
): Promise<DeployResult> {
  const totalStart = Date.now();
  const logs: DeployLog[] = [];
  let conn: Client | null = null;
  const { pushLog, pushStarting } = createLogHelpers(logs, onProgress);

  // ── Derived constants ──
  const PATH = opts.remotePath;
  const SLUG = opts.clientSlug;
  const SLUG_UPPER = SLUG.toUpperCase();
  const NEW_DOMAIN = opts.domain;
  const db = opts.db;

  // Base template identity (auto-detected or overridden)
  let BASE = opts.baseSlug || 'lmxtrade';
  let BASE_UPPER = opts.baseSlugUpper || BASE.toUpperCase();
  let BASE_DOMAIN = opts.baseDomain || 'bullion_v4.logimaxindia.com';

  try {
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

      // 3a: Create target database
      await pushStarting('create_db', `Creating database ${db.targetName}...`);
      const createDbCmd = `mysql -h "${tgtHost}" -P ${tgtPort} -u "${tgtUser}" -p"${tgtPass}" -e "CREATE DATABASE IF NOT EXISTS \\\`${db.targetName}\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1`;
      const createLog = await runStep(conn, 'create_db', createDbCmd, 30_000);
      await pushLog(createLog);

      // 3b: mysqldump source → mysql target (RDS compatible)
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
      `mv client/${BASE}.enc client/${SLUG}.enc 2>/dev/null || true`,
      `mv client/${BASE}.txt client/${SLUG}.txt 2>/dev/null || true`,
      `mv client/${BASE}_rate.js client/${SLUG}_rate.js 2>/dev/null || true`,
      `mv client/${BASE}_rprate.js client/${SLUG}_rprate.js 2>/dev/null || true`,
      `mv client/${BASE}_rp_rate.txt client/${SLUG}_rp_rate.txt 2>/dev/null || true`,
      `mv client/${BASE}-ws.js client/${SLUG}-ws.js 2>/dev/null || true`,
      `mv ${BASE}/${BASE}winlitesocket.js ${BASE}/${SLUG}winlitesocket.js 2>/dev/null || true`,
      `mv ${BASE}/winbullliteapi/app/Http/Controllers/${BASE_UPPER}Controller.php ${BASE}/winbullliteapi/app/Http/Controllers/${SLUG_UPPER}Controller.php 2>/dev/null || true`,
      `for f in ${BASE}/winbullliteapi/app/Events/${BASE_UPPER}*.php; do mv "$f" "$(echo $f | sed "s/${BASE_UPPER}/${SLUG_UPPER}/g")" 2>/dev/null || true; done`,
      'echo "Files renamed"',
    ].join(' && ');
    const renameLog = await runStep(conn, 'rename_files', renameCmd, 60_000);
    await pushLog(renameLog);

    // ── Step 5: sed replacements ──
    await pushStarting('sed_replace', `Replacing ${BASE} → ${SLUG} in config files...`);
    const sedCmd = [
      `cd "${PATH}"`,
      `sed -i "s/${BASE_UPPER}/${SLUG_UPPER}/g" ${BASE}/winbullliteapi/config/global.php`,
      `sed -i "s/${BASE}/${SLUG}/g" ${BASE}/winbullliteapi/config/global.php`,
      `sed -i "s|/var/www/html/winbullSource|${PATH}|g" ${BASE}/winbullliteapi/config/global.php`,
      `sed -i "s/${BASE}/${SLUG}/g" ${BASE}/winbullliteapi/routes/web.php`,
      `sed -i "s/${BASE_UPPER}/${SLUG_UPPER}/g" ${BASE}/winbullliteapi/routes/web.php`,
      `find ${BASE}/winbullliteapi/app -name "*.php" -exec sed -i "s/${BASE_UPPER}/${SLUG_UPPER}/g" {} +`,
      `sed -i "s/${BASE}/${SLUG}/g" client/${SLUG}-ws.js 2>/dev/null || true`,
      `sed -i "s/${BASE}/${SLUG}/g" ${BASE}/${SLUG}winlitesocket.js 2>/dev/null || true`,
      'echo "sed replacements done"',
    ].join(' && ');
    const sedLog = await runStep(conn, 'sed_replace', sedCmd, 60_000);
    await pushLog(sedLog);

    // ── Step 6: Update global_configs.php ──
    await pushStarting('update_configs', `Updating global_configs.php...`);
    const title = opts.webTitle || opts.clientName;
    const copyright = opts.webCopyright || `© ${new Date().getFullYear()} ${opts.clientName}. All Rights Reserved`;
    const baseCompany = opts.baseCompanyName || 'LOGIMAX Bullion';
    const configCmd = [
      `cd "${PATH}"`,
      `sed -i "s|${BASE_DOMAIN}|${NEW_DOMAIN}|g" global_configs.php`,
      `sed -i "s|/${BASE}/|/${SLUG}/|g" global_configs.php`,
      `sed -i 's|\\$client = "${BASE}"|\\$client = "${SLUG}"|g' global_configs.php`,
      `sed -i 's|\\$bcclient.*= "${BASE}"|\\$bcclient    = "${SLUG}"|g' global_configs.php`,
      `sed -i 's|\\$database = ".*"|\\$database = "${db.targetName}"|g' global_configs.php`,
      `sed -i 's|\\$hostname = ".*"|\\$hostname = "${db.host}"|g' global_configs.php`,
      `sed -i 's|\\$username = ".*"|\\$username = "${db.user}"|g' global_configs.php`,
      `sed -i 's|\\$password = ".*"|\\$password = "${db.password}"|g' global_configs.php`,
      `sed -i 's|\\$web_title.*= ".*"|\\$web_title     = "${title}"|g' global_configs.php`,
      `sed -i 's|\\$web_copyright.*= ".*"|\\$web_copyright = "${copyright}"|g' global_configs.php`,
      `sed -i 's|\\$path = ".*"|\\$path = "${PATH}/client/${SLUG}.enc"|g' global_configs.php`,
      `sed -i "s/${BASE_UPPER}/${SLUG_UPPER}/g" global_configs.php`,
      `sed -i "s/${BASE}update/${SLUG}update/g" global_configs.php`,
      `sed -i "s/${BASE}terminate/${SLUG}terminate/g" global_configs.php`,
      `sed -i 's|\\$notification_title .*= ".*"|\\$notification_title             = "${opts.clientName}"|g' global_configs.php`,
      `sed -i 's|\\$notification_subtitle .*= ".*"|\\$notification_subtitle          = "From ${opts.clientName}"|g' global_configs.php`,
      `sed -i 's|\\$notification_title_admin .*= ".*"|\\$notification_title_admin       = "${opts.clientName} Admin App"|g' global_configs.php`,
      `sed -i 's|\\$notification_subtitle_admin .*= ".*"|\\$notification_subtitle_admin     = "From ${opts.clientName} Admin App"|g' global_configs.php`,
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

    // ── Step 8: DB configure (company settings, admin creds) ──
    await pushStarting('db_configure', `Configuring ${db.targetName} for ${opts.clientName}...`);
    const adminUser = opts.adminUser || 'admin';
    const adminPwd = opts.adminPassword || 'admin@123';
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
      `pm2 delete "${SLUG}-ws" 2>/dev/null || true`,
      `pm2 delete "${SLUG}-socketio" 2>/dev/null || true`,
      `WS_FILE="client/${SLUG}-ws.js"; [ ! -f "$WS_FILE" ] && WS_FILE=$(find client/ -name '*-ws.js' -o -name '*_rate.js' | head -1); [ -f "$WS_FILE" ] && pm2 start "$WS_FILE" --name "${SLUG}-ws" && echo "Started: $WS_FILE" || echo "No WS file found, skipping"`,
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
    sshDisconnect(conn);
  }
}
