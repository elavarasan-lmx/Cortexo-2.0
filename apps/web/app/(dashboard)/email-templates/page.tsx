'use client';

import { useState } from 'react';
import { Mail, Copy, Eye, Code, CheckCircle } from 'lucide-react';

const EMAIL_TEMPLATES = [
  { id: 'reset', label: 'Password Reset', subject: 'Reset Your Password' },
  { id: 'welcome', label: 'Welcome', subject: 'Welcome to Cortexo' },
  { id: 'deploy', label: 'Deploy Alert', subject: 'Deployment Notification' },
  { id: 'incident', label: 'Incident', subject: 'Incident Report' },
];

export default function EmailTemplatePage() {
  const [selected, setSelected] = useState('reset');
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const template = EMAIL_TEMPLATES.find(t => t.id === selected)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(getHtmlCode(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '32px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            backgroundColor: 'rgba(124,58,237,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mail style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
              Email Templates
            </h1>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              Transactional email templates used by Cortexo
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
        {/* Sidebar */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {EMAIL_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              style={{
                padding: '10px 14px', borderRadius: '10px',
                textAlign: 'left', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: selected === t.id ? 600 : 500,
                backgroundColor: selected === t.id ? 'rgba(var(--primary),0.1)' : 'transparent',
                color: selected === t.id ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                transition: 'all 150ms',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Preview area */}
        <div>
          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['preview', 'code'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                    textTransform: 'capitalize',
                    backgroundColor: view === v ? 'rgba(var(--primary),0.1)' : 'transparent',
                    color: view === v ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                  }}
                >
                  {v === 'preview' ? <Eye style={{ width: '12px', height: '12px' }} /> : <Code style={{ width: '12px', height: '12px' }} />}
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px',
                fontSize: '12px', fontWeight: 600,
                color: copied ? '#10B981' : 'rgb(var(--text-muted))',
                backgroundColor: copied ? 'rgba(16,185,129,0.08)' : 'rgba(var(--border),0.3)',
                border: 'none', cursor: 'pointer',
              }}
            >
              {copied ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
              {copied ? 'Copied!' : 'Copy HTML'}
            </button>
          </div>

          {/* Content */}
          {view === 'preview' ? (
            <div style={{
              backgroundColor: '#F1F5F9', borderRadius: '16px',
              padding: '40px', display: 'flex', justifyContent: 'center',
              minHeight: '500px',
            }}>
              <div style={{
                width: '560px', maxWidth: '100%',
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}>
                {/* Email header */}
                <div style={{
                  padding: '32px 32px 20px', textAlign: 'center',
                  borderBottom: '1px solid #F1F5F9',
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: '#7C3AED', margin: '0 0 8px' }}>
                    ◉ Cortexo
                  </p>
                </div>

                {/* Body */}
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', margin: '0 0 16px' }}>
                    {template.subject}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, margin: '0 0 24px' }}>
                    Hi Jerry,<br /><br />
                    {selected === 'reset' && 'We received a request to reset your password.\nClick the button below to create a new password.'}
                    {selected === 'welcome' && 'Welcome to Cortexo! Your workspace is ready.\nGet started by connecting your first server.'}
                    {selected === 'deploy' && 'Deployment #1284 has been completed successfully.\nAll health checks passed on prod-api-01.'}
                    {selected === 'incident' && 'An incident has been detected on your infrastructure.\nOur AI agent is investigating the root cause.'}
                  </p>
                  <div style={{
                    display: 'inline-block',
                    padding: '14px 36px', borderRadius: '8px',
                    backgroundColor: '#7C3AED', color: '#fff',
                    fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    {selected === 'reset' ? 'Reset Password' : selected === 'welcome' ? 'Get Started' : selected === 'deploy' ? 'View Deploy' : 'View Incident'}
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  padding: '20px 32px', textAlign: 'center',
                  borderTop: '1px solid #F1F5F9',
                }}>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.6 }}>
                    If you didn&apos;t request this, ignore this email.<br />
                    © 2026 Cortexo. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <pre style={{
              backgroundColor: '#0B1120', color: '#A5B4FC',
              padding: '24px', borderRadius: '12px',
              fontSize: '12px', lineHeight: 1.6,
              overflow: 'auto', maxHeight: '500px',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {getHtmlCode(selected)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function getHtmlCode(id: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Cortexo - ${id === 'reset' ? 'Reset Password' : id === 'welcome' ? 'Welcome' : id === 'deploy' ? 'Deploy Alert' : 'Incident'}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Inter,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="560" style="background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr>
            <td style="padding:32px;text-align:center;border-bottom:1px solid #F1F5F9">
              <span style="font-size:24px;font-weight:800;color:#7C3AED">◉ Cortexo</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;text-align:center">
              <h2 style="color:#1E293B;font-size:22px;margin:0 0 16px">${id === 'reset' ? 'Reset Your Password' : id === 'welcome' ? 'Welcome to Cortexo' : id === 'deploy' ? 'Deployment Notification' : 'Incident Report'}</h2>
              <p style="color:#64748B;font-size:14px;line-height:1.7">...</p>
              <a href="#" style="display:inline-block;padding:14px 36px;background:#7C3AED;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
                Action Button
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;text-align:center;border-top:1px solid #F1F5F9">
              <p style="color:#94A3B8;font-size:12px;margin:0">© 2026 Cortexo. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
