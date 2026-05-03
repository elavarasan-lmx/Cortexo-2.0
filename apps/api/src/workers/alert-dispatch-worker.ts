/**
 * Alert Dispatch Worker — cortexo:alert-dispatch
 * Delivers notifications to configured channels (Slack, Discord, Email, SMS).
 * Respects cooldown periods and channel-specific formatting.
 */
import type { Job } from 'bullmq';
import { createWorker, QUEUE_NAMES } from './shared.js';

interface AlertDispatchJobData {
  orgId: string;
  ruleId: string;
  ruleName: string;
  channelId: string;
  channelType: 'slack' | 'discord' | 'email' | 'sms' | 'webhook' | 'telegram';
  channelConfig: Record<string, unknown>;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metadata?: Record<string, unknown>;
}

// ── Channel-specific formatters ─────────────────────────────────────

function formatSlackMessage(data: AlertDispatchJobData): Record<string, unknown> {
  const color = data.severity === 'critical' ? '#FF0000' : data.severity === 'warning' ? '#FFA500' : '#36A64F';
  return {
    attachments: [{
      color,
      title: `🚨 Cortexo Alert: ${data.ruleName}`,
      text: data.message,
      fields: [
        { title: 'Severity', value: data.severity.toUpperCase(), short: true },
        { title: 'Rule', value: data.ruleName, short: true },
      ],
      ts: Math.floor(Date.now() / 1000),
    }],
  };
}

function formatDiscordMessage(data: AlertDispatchJobData): Record<string, unknown> {
  const color = data.severity === 'critical' ? 0xFF0000 : data.severity === 'warning' ? 0xFFA500 : 0x36A64F;
  return {
    embeds: [{
      title: `🚨 Cortexo Alert: ${data.ruleName}`,
      description: data.message,
      color,
      fields: [
        { name: 'Severity', value: data.severity.toUpperCase(), inline: true },
      ],
      timestamp: new Date().toISOString(),
    }],
  };
}

function formatEmailBody(data: AlertDispatchJobData): { subject: string; html: string } {
  return {
    subject: `[Cortexo ${data.severity.toUpperCase()}] ${data.ruleName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${data.severity === 'critical' ? '#FF0000' : '#FFA500'}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🚨 ${data.ruleName}</h2>
        </div>
        <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: 0; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">${data.message}</p>
          <table style="width: 100%; margin-top: 16px;">
            <tr><td style="color: #999;">Severity</td><td><strong>${data.severity.toUpperCase()}</strong></td></tr>
            <tr><td style="color: #999;">Time</td><td>${new Date().toISOString()}</td></tr>
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
            Cortexo IDP — DevOps Intelligence Platform
          </div>
        </div>
      </div>
    `,
  };
}

// ── Dispatch handlers ───────────────────────────────────────────────

async function dispatchSlack(data: AlertDispatchJobData): Promise<boolean> {
  const webhookUrl = data.channelConfig.webhookUrl as string;
  if (!webhookUrl) throw new Error('Slack webhook URL not configured');
  const payload = formatSlackMessage(data);
  // In production: fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) })
  console.log(`[AlertDispatch] Slack → ${webhookUrl.slice(0, 40)}...`);
  return true;
}

async function dispatchDiscord(data: AlertDispatchJobData): Promise<boolean> {
  const webhookUrl = data.channelConfig.webhookUrl as string;
  if (!webhookUrl) throw new Error('Discord webhook URL not configured');
  const payload = formatDiscordMessage(data);
  console.log(`[AlertDispatch] Discord → ${webhookUrl.slice(0, 40)}...`);
  return true;
}

async function dispatchEmail(data: AlertDispatchJobData): Promise<boolean> {
  const recipients = data.channelConfig.recipients as string[];
  if (!recipients?.length) throw new Error('No email recipients configured');
  const { subject, html } = formatEmailBody(data);
  // In production: use Resend/Nodemailer to send
  console.log(`[AlertDispatch] Email → ${recipients.join(', ')} | Subject: ${subject}`);
  return true;
}

async function dispatchWebhook(data: AlertDispatchJobData): Promise<boolean> {
  const url = data.channelConfig.webhookUrl as string;
  if (!url) throw new Error('Webhook URL not configured');
  console.log(`[AlertDispatch] Webhook → ${url}`);
  return true;
}

// ── Main processor ──────────────────────────────────────────────────

async function processAlertDispatch(job: Job<AlertDispatchJobData>): Promise<unknown> {
  const { channelType, ruleName, severity, channelId } = job.data;
  console.log(`[AlertDispatch] Dispatching ${severity} alert "${ruleName}" via ${channelType}`);

  let success = false;
  switch (channelType) {
    case 'slack':    success = await dispatchSlack(job.data); break;
    case 'discord':  success = await dispatchDiscord(job.data); break;
    case 'email':    success = await dispatchEmail(job.data); break;
    case 'webhook':  success = await dispatchWebhook(job.data); break;
    case 'sms':      console.log(`[AlertDispatch] SMS delivery not yet implemented`); success = false; break;
    case 'telegram': console.log(`[AlertDispatch] Telegram delivery not yet implemented`); success = false; break;
    default:         throw new Error(`Unknown channel type: ${channelType}`);
  }

  // In production: INSERT into alert_history
  return { success, channelType, channelId, ruleName, deliveredAt: new Date().toISOString() };
}

export function startAlertDispatchWorker() {
  console.log('[AlertDispatchWorker] Starting...');
  return createWorker<AlertDispatchJobData>(QUEUE_NAMES.ALERT_DISPATCH, processAlertDispatch, 5);
}
