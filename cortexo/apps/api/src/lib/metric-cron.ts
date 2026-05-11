/**
 * Scheduled Metric Collection + Slack Alerting
 *
 * Automated cron that:
 *  1. SSHes into all configured servers every N minutes
 *  2. Collects CPU, RAM, Disk metrics
 *  3. Stores them in server_resources table
 *  4. Fires Slack webhook when thresholds are breached
 *
 * Controlled via .env:
 *   METRIC_CRON_SCHEDULE  — cron expression (default: every 5 min)
 *   CPU_ALERT_THRESHOLD   — CPU% to trigger alert (default: 85)
 *   DISK_ALERT_THRESHOLD  — Disk% to trigger alert (default: 90)
 *   SLACK_WEBHOOK_URL     — Slack incoming webhook
 */

import { CronJob } from 'cron';
import { getDb } from './db.js';
import { serverResources } from '@cortexo/db/schema';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { sql } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ──────────────────────────────────────────────
const CRON_SCHEDULE = process.env.METRIC_CRON_SCHEDULE || '*/5 * * * *';
const CPU_THRESHOLD = parseInt(process.env.CPU_ALERT_THRESHOLD || '85', 10);
const DISK_THRESHOLD = parseInt(process.env.DISK_ALERT_THRESHOLD || '90', 10);
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || '';

let cronJob: CronJob | null = null;
let isRunning = false;

// ─── Slack Alerting ──────────────────────────────────────
async function sendSlackAlert(alerts: { server: string; ip: string; metric: string; value: string; threshold: number }[]) {
  if (!SLACK_WEBHOOK) return;

  const blocks = alerts.map(a => `• *${a.server}* (${a.ip}): ${a.metric} at *${a.value}* (threshold: ${a.threshold}%)`);

  const payload = {
    text: `🚨 *Cortexo Server Alert*`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🚨 Server Resource Alert', emoji: true },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: blocks.join('\n'),
        },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `_${new Date().toISOString()} — Cortexo Monitoring_` },
        ],
      },
    ],
  };

  try {
    await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[Cron] Failed to send Slack alert:', err);
  }
}

// ─── Metric Collection ──────────────────────────────────
async function collectMetrics() {
  if (isRunning) {
    console.log('[Cron] Metrics collection already in progress — skipping');
    return;
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    const db = await getDb();

    // Get all servers with IPs
    const allServers = await db.query.servers.findMany();
    const serversWithIp = allServers.filter(s => s.privateIp);
    const ips = serversWithIp.map(s => s.privateIp) as string[];

    if (ips.length === 0) {
      console.log('[Cron] No servers with IPs configured — skipping');
      return;
    }

    // Build IP → server lookup
    const ipToServer = new Map<string, { id: number; name: string }>();
    for (const s of serversWithIp) {
      ipToServer.set(s.privateIp!, { id: s.id, name: s.name });
    }

    // Run collector script
    const scriptPath = path.resolve(__dirname, './collect-metrics.sh');
    const { stdout } = await execFileAsync('bash', [scriptPath, ...ips], {
      timeout: 90_000,
      env: { ...process.env, HOME: process.env.HOME || '/root' },
    });

    let metrics: any[];
    try {
      metrics = JSON.parse(stdout);
    } catch {
      console.error('[Cron] Failed to parse collector output:', stdout.substring(0, 200));
      return;
    }

    // Insert metrics + check thresholds
    let inserted = 0;
    const alerts: { server: string; ip: string; metric: string; value: string; threshold: number }[] = [];

    for (const m of metrics) {
      if (!m.serverIp) continue;
      const serverInfo = ipToServer.get(m.serverIp);
      if (!serverInfo) continue;

      await db.insert(serverResources).values({
        serverId: serverInfo.id,
        serverIp: m.serverIp,
        cpuPercent: m.cpuPercent?.toString() || '0',
        ramUsedMb: m.ramUsedMb || 0,
        ramTotalMb: m.ramTotalMb || 0,
        diskUsedGb: m.diskUsedGb?.toString() || '0',
        diskTotalGb: m.diskTotalGb?.toString() || '0',
        loadAvg: m.loadAvg || '0 0 0',
        uptimeHours: m.uptimeHours || 0,
      } as any);
      inserted++;

      // Check CPU threshold
      const cpuVal = parseFloat(m.cpuPercent || '0');
      if (cpuVal >= CPU_THRESHOLD) {
        alerts.push({
          server: serverInfo.name,
          ip: m.serverIp,
          metric: 'CPU',
          value: `${cpuVal.toFixed(1)}%`,
          threshold: CPU_THRESHOLD,
        });
      }

      // Check Disk threshold
      const diskUsed = parseFloat(m.diskUsedGb || '0');
      const diskTotal = parseFloat(m.diskTotalGb || '1');
      const diskPercent = (diskUsed / diskTotal) * 100;
      if (diskPercent >= DISK_THRESHOLD) {
        alerts.push({
          server: serverInfo.name,
          ip: m.serverIp,
          metric: 'Disk',
          value: `${diskPercent.toFixed(1)}%`,
          threshold: DISK_THRESHOLD,
        });
      }
    }

    // Prune old data (keep last 24h)
    await db.execute(
      sql`DELETE FROM server_resources WHERE checked_at < NOW() - INTERVAL '24 hours'`
    );

    const elapsed = Date.now() - startTime;
    console.log(`[Cron] ✅ Collected ${inserted}/${ips.length} server metrics in ${elapsed}ms`);

    // Fire Slack alerts if thresholds breached
    if (alerts.length > 0) {
      console.log(`[Cron] ⚠️  ${alerts.length} threshold alert(s) — sending Slack notification`);
      await sendSlackAlert(alerts);
    }
  } catch (err) {
    console.error('[Cron] ❌ Metric collection failed:', err);
  } finally {
    isRunning = false;
  }
}

// ─── Lifecycle ──────────────────────────────────────────
export function startMetricsCron() {
  if (cronJob) {
    console.log('[Cron] Metric cron already running');
    return;
  }

  cronJob = new CronJob(CRON_SCHEDULE, collectMetrics, null, false, 'Asia/Kolkata');
  cronJob.start();

  console.log(`[Cron] 📊 Server metric collection started — schedule: "${CRON_SCHEDULE}"`);
  if (SLACK_WEBHOOK) {
    console.log(`[Cron] 🔔 Slack alerting enabled — CPU>${CPU_THRESHOLD}% / Disk>${DISK_THRESHOLD}%`);
  } else {
    console.log('[Cron] ℹ️  No SLACK_WEBHOOK_URL set — alerting disabled');
  }

  // Run immediately on first start
  setTimeout(() => collectMetrics(), 5000);
}

export function stopMetricsCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('[Cron] Metric collection stopped');
  }
}
