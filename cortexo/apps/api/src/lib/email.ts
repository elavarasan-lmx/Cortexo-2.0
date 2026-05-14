/**
 * Cortexo Email Service — lib/email.ts
 * Uses Resend (https://resend.com) for transactional email.
 * Falls back to console.log in development if RESEND_API_KEY is not set.
 *
 * Setup: Add RESEND_API_KEY and EMAIL_FROM to apps/api/.env
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Logimax Bullion DevOps <alerts@logimaxindia.com>';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    // Dev mode — log to console
    console.log('[Email] Would send email (no RESEND_API_KEY):', {
      to: payload.to,
      subject: payload.subject,
    });
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Email] Failed to send:', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Error:', err);
    return false;
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * Alert: New critical error detected in a project
 */
export async function sendCriticalErrorAlert(opts: {
  to: string | string[];
  errorType: string;
  errorMessage: string;
  projectName: string;
  errorId: string;
  occurrences: number;
  file?: string;
  line?: number;
}) {
  const errorUrl = `${APP_URL}/errors/${opts.errorId}`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #0f0f13; color: #e2e8f0; }
    .container { max-width: 560px; margin: 32px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; color: #fff; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px; }
    .body { padding: 28px 32px; }
    .badge { display: inline-block; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .error-type { font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
    .error-msg { color: #94a3b8; font-size: 14px; margin-bottom: 20px; line-height: 1.6; }
    .meta-row { display: flex; gap: 16px; margin-bottom: 20px; }
    .meta-box { flex: 1; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px 16px; }
    .meta-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 4px; }
    .meta-box .value { font-size: 16px; font-weight: 700; color: #f1f5f9; }
    .file-tag { font-family: monospace; font-size: 12px; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 6px; color: #818cf8; display: inline-block; margin-bottom: 24px; }
    .cta { display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; }
    .footer { padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.06); color: #475569; font-size: 11px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Critical Error Detected</h1>
      <p>Project: <strong>${opts.projectName}</strong></p>
    </div>
    <div class="body">
      <span class="badge">CRITICAL</span>
      <div class="error-type">${opts.errorType}</div>
      <div class="error-msg">${opts.errorMessage}</div>
      <div class="meta-row">
        <div class="meta-box">
          <div class="label">Occurrences</div>
          <div class="value">${opts.occurrences.toLocaleString()}</div>
        </div>
        <div class="meta-box">
          <div class="label">Project</div>
          <div class="value">${opts.projectName}</div>
        </div>
      </div>
      ${opts.file ? `<div class="file-tag">${opts.file}${opts.line ? `:${opts.line}` : ''}</div><br>` : ''}
      <a href="${errorUrl}" class="cta">View Error Details &amp; AI Root Cause →</a>
    </div>
    <div class="footer">Logimax Bullion DevOps · <a href="${APP_URL}/settings/notifications" style="color:#6366f1">Manage alerts</a></div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: opts.to,
    subject: `🚨 Critical: ${opts.errorType} in ${opts.projectName} (${opts.occurrences}× occurrences)`,
    html,
    text: `Critical error detected in ${opts.projectName}:\n${opts.errorType}: ${opts.errorMessage}\n\nView: ${errorUrl}`,
  });
}

/**
 * Alert: Deployment completed (success or failure)
 */
export async function sendDeploymentAlert(opts: {
  to: string | string[];
  projectName: string;
  environment: string;
  branch: string;
  status: 'success' | 'failed';
  deploymentId: string;
  durationMs?: number;
}) {
  const isSuccess = opts.status === 'success';
  const deployUrl = `${APP_URL}/deployments`;
  const duration = opts.durationMs ? `${Math.round(opts.durationMs / 1000)}s` : 'N/A';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; margin: 0; background: #0f0f13; color: #e2e8f0; }
    .container { max-width: 560px; margin: 32px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .header { background: ${isSuccess ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'}; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; color: #fff; }
    .body { padding: 28px 32px; }
    .meta-row { display: flex; gap: 16px; margin: 20px 0; }
    .meta-box { flex: 1; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px 16px; }
    .meta-box .label { font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .meta-box .value { font-size: 14px; font-weight: 700; color: #f1f5f9; }
    .cta { display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; }
    .footer { padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.06); color: #475569; font-size: 11px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isSuccess ? '✅ Deployment Successful' : '❌ Deployment Failed'}</h1>
    </div>
    <div class="body">
      <p style="color:#94a3b8;margin:0 0 16px">Deployment to <strong style="color:#f1f5f9">${opts.environment}</strong> for <strong style="color:#f1f5f9">${opts.projectName}</strong> has ${isSuccess ? 'completed successfully' : 'failed'}.</p>
      <div class="meta-row">
        <div class="meta-box"><div class="label">Branch</div><div class="value">${opts.branch}</div></div>
        <div class="meta-box"><div class="label">Duration</div><div class="value">${duration}</div></div>
        <div class="meta-box"><div class="label">Environment</div><div class="value">${opts.environment}</div></div>
      </div>
      <a href="${deployUrl}" class="cta">View Deployment →</a>
    </div>
    <div class="footer">Logimax Bullion DevOps</div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: opts.to,
    subject: `${isSuccess ? '✅' : '❌'} Deploy ${opts.status}: ${opts.projectName} → ${opts.environment}`,
    html,
    text: `Deployment ${opts.status} for ${opts.projectName} to ${opts.environment} from branch ${opts.branch}.\n\nView: ${deployUrl}`,
  });
}

/**
 * Alert: Error spike detected (error rate exceeded threshold)
 */
export async function sendErrorSpikeAlert(opts: {
  to: string | string[];
  projectName: string;
  errorType: string;
  count: number;
  windowMinutes: number;
  errorId: string;
}) {
  const errorUrl = `${APP_URL}/errors/${opts.errorId}`;
  return sendEmail({
    to: opts.to,
    subject: `⚡ Error Spike: ${opts.errorType} — ${opts.count} events in ${opts.windowMinutes}min`,
    html: `<p>${opts.errorType} spiked to ${opts.count} occurrences in the last ${opts.windowMinutes} minutes in ${opts.projectName}.</p><p><a href="${errorUrl}">View details</a></p>`,
    text: `Error spike in ${opts.projectName}: ${opts.errorType} — ${opts.count} events in ${opts.windowMinutes}min.\n\nView: ${errorUrl}`,
  });
}

/**
 * Password Reset — Send reset link to user
 */
export async function sendPasswordResetEmail(opts: {
  to: string;
  resetToken: string;
  userName: string;
}) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${opts.resetToken}`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #0f0f13; color: #e2e8f0; }
    .container { max-width: 560px; margin: 32px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .header { background: linear-gradient(135deg, #6366f1, #818cf8); padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; color: #fff; }
    .body { padding: 28px 32px; }
    .cta { display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; margin: 24px 0; }
    .token-box { font-family: 'Courier New', monospace; font-size: 13px; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px; color: #818cf8; word-break: break-all; margin: 16px 0; }
    .footer { padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.06); color: #475569; font-size: 11px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset</h1>
    </div>
    <div class="body">
      <p style="color:#94a3b8;margin:0 0 16px">Hi <strong style="color:#f1f5f9">${opts.userName}</strong>,</p>
      <p style="color:#94a3b8;margin:0 0 16px">We received a request to reset your Logimax Bullion DevOps password. Click the button below to set a new password:</p>
      <a href="${resetUrl}" class="cta">Reset Password →</a>
      <p style="color:#64748b;font-size:12px;margin:16px 0 0">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">Logimax Bullion DevOps · <a href="${APP_URL}" style="color:#6366f1">logimaxindia.com</a></div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: opts.to,
    subject: '🔐 Reset your Logimax Bullion DevOps password',
    html,
    text: `Hi ${opts.userName},\n\nReset your Logimax Bullion DevOps password:\n${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}
