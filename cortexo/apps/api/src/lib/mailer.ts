import nodemailer from 'nodemailer';
import { getVaultCredentials } from '../routes/credentials.js';

// ── Transporter (lazily initialized from vault) ───────────────────
let transporter: nodemailer.Transporter | null = null;
let transporterInitialized = false;

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporterInitialized) return transporter;

  try {
    const creds = await getVaultCredentials(
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL'
    );

    const host = creds.SMTP_HOST;
    const user = creds.SMTP_USERNAME;
    const pass = creds.SMTP_PASSWORD;
    const port = parseInt(creds.SMTP_PORT || '587', 10);

    if (!host || !user) {
      console.log('[Mailer] SMTP not configured in vault — email disabled');
      transporterInitialized = true;
      return null;
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: pass || '' },
    });

    transporterInitialized = true;
    console.log(`[Mailer] ✅ SMTP configured: ${host}:${port} (user: ${user})`);
    return transporter;
  } catch (err) {
    console.error('[Mailer] Failed to initialize SMTP:', err);
    transporterInitialized = true;
    return null;
  }
}

// Allow re-initialization if credentials change
export function resetMailer() {
  transporter = null;
  transporterInitialized = false;
}

// ── Deploy email ──────────────────────────────────────────────────

interface DeployEmailData {
  to?: string;
  status: 'success' | 'failed';
  target: string;
  branch: string;
  commitSha?: string;
  error?: string;
  durationMs?: number;
  deploymentId: string;
}

export async function sendDeployEmail(data: DeployEmailData): Promise<void> {
  const transport = await getTransporter();
  if (!transport) return;

  // Get from-email from vault
  const creds = await getVaultCredentials('SMTP_FROM_EMAIL', 'SMTP_USERNAME');
  const fromEmail = creds.SMTP_FROM_EMAIL || creds.SMTP_USERNAME || 'noreply@cortexo.dev';
  const recipient = data.to || fromEmail; // Default: send to self

  const isSuccess = data.status === 'success';
  const emoji = isSuccess ? '✅' : '❌';
  const statusText = isSuccess ? 'Successful' : 'Failed';
  const statusColor = isSuccess ? '#10B981' : '#EF4444';
  const bgColor = isSuccess ? '#ecfdf5' : '#fef2f2';
  const duration = data.durationMs ? `${(data.durationMs / 1000).toFixed(1)}s` : 'N/A';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:${statusColor};padding:24px 32px;color:#fff;">
      <h1 style="margin:0;font-size:20px;font-weight:700;">${emoji} Deployment ${statusText}</h1>
      <p style="margin:8px 0 0;font-size:13px;opacity:0.9;">Cortexo DevOps • ${new Date().toLocaleString()}</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 0;color:#64748b;width:120px;">Target</td>
          <td style="padding:10px 0;font-weight:600;color:#1e293b;">${data.target}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;">Branch</td>
          <td style="padding:10px 0;font-weight:600;color:#1e293b;">${data.branch}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;">Duration</td>
          <td style="padding:10px 0;font-weight:600;color:#1e293b;">${duration}</td>
        </tr>
        ${data.commitSha ? `
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;">Commit</td>
          <td style="padding:10px 0;font-family:monospace;font-weight:600;color:#1e293b;">${data.commitSha}</td>
        </tr>` : ''}
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;">Status</td>
          <td style="padding:10px 0;">
            <span style="display:inline-block;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:700;background:${bgColor};color:${statusColor};">
              ${statusText.toUpperCase()}
            </span>
          </td>
        </tr>
      </table>

      ${data.error ? `
      <div style="margin-top:20px;padding:14px 18px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#991b1b;font-size:13px;">
        <strong>Error:</strong> ${data.error}
      </div>` : ''}
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        Deployment ID: <code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;">${data.deploymentId}</code>
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">
        Sent by Cortexo DevOps Platform
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transport.sendMail({
      from: `Cortexo DevOps <${fromEmail}>`,
      to: recipient,
      subject: `${emoji} Deploy ${statusText}: ${data.target} (${data.branch})`,
      html,
    });
    console.log(`[Mailer] Deploy ${data.status} email sent to ${recipient}`);
  } catch (err) {
    console.error('[Mailer] Failed to send deploy email:', err);
  }
}

// ── Generic email sender ──────────────────────────────────────────

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const transport = await getTransporter();
  if (!transport) return false;

  const creds = await getVaultCredentials('SMTP_FROM_EMAIL', 'SMTP_USERNAME');
  const fromEmail = creds.SMTP_FROM_EMAIL || creds.SMTP_USERNAME || 'noreply@cortexo.dev';

  try {
    await transport.sendMail({
      from: `Cortexo DevOps <${fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err);
    return false;
  }
}
