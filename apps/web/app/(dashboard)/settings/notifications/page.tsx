'use client';

import { useState } from 'react';
import { Bell, BellOff, Mail, AlertTriangle, CheckCircle, Save, Zap, Bug, Rocket, FileText } from 'lucide-react';

const card: React.CSSProperties = { backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '24px' };

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
      backgroundColor: on ? 'rgb(var(--primary))' : 'rgba(var(--border), 0.8)',
      position: 'relative', transition: 'background-color 200ms', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: '2px', left: on ? '20px' : '2px',
        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
        transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

const notifications = [
  { key: 'deployFail', label: 'Deploy failures', desc: 'Alert when a deployment fails or rolls back', icon: <Rocket style={{ width: 15, height: 15, color: '#EF4444' }} />, default: true },
  { key: 'errorSpike', label: 'Error spikes', desc: 'Alert when error rate exceeds 5x baseline', icon: <Bug style={{ width: 15, height: 15, color: '#F59E0B' }} />, default: true },
  { key: 'pipelineDone', label: 'Pipeline completed', desc: 'Notify when CI/CD pipeline finishes', icon: <CheckCircle style={{ width: 15, height: 15, color: '#10B981' }} />, default: false },
  { key: 'dailyDigest', label: 'Daily digest', desc: 'Summary of all activity across projects', icon: <Mail style={{ width: 15, height: 15, color: '#6366F1' }} />, default: true },
  { key: 'slackAlerts', label: 'Slack alerts', desc: 'Send critical alerts to connected Slack channel', icon: <Zap style={{ width: 15, height: 15, color: '#E01E5A' }} />, default: true },
  { key: 'emailAlerts', label: 'Email alerts', desc: 'Receive email for every notification', icon: <Mail style={{ width: 15, height: 15, color: '#818CF8' }} />, default: false },
  { key: 'weeklyReport', label: 'Weekly report', desc: 'Weekly summary of errors, deploys, and performance', icon: <FileText style={{ width: 15, height: 15, color: '#10B981' }} />, default: true },
  { key: 'securityAlerts', label: 'Security alerts', desc: 'Immediate notification for security vulnerabilities', icon: <AlertTriangle style={{ width: 15, height: 15, color: '#EF4444' }} />, default: true },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(notifications.map(n => [n.key, n.default]))
  );
  const [saved, setSaved] = useState(false);

  const enabledCount = Object.values(notifs).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Notification Preferences</h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
          {enabledCount} of {notifications.length} notifications enabled
        </p>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {notifications.map((n, i) => (
            <div key={n.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px', borderRadius: '10px', transition: 'background-color 150ms',
              borderBottom: i < notifications.length - 1 ? '1px solid rgba(var(--border), 0.4)' : 'none',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '9px', backgroundColor: 'rgba(var(--border), 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.icon}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{n.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{n.desc}</div>
                </div>
              </div>
              <Toggle on={notifs[n.key]} onChange={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Webhook URLs */}
      <div style={card}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 16px' }}>Webhook URLs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>Slack Webhook URL</label>
            <input placeholder="https://hooks.slack.com/services/..." style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>Discord Webhook URL</label>
            <input placeholder="https://discord.com/api/webhooks/..." style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>Custom Webhook URL (JSON POST)</label>
            <input placeholder="https://your-api.com/webhooks/cortexo" style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>Webhooks receive a JSON POST with: {'{'} event, project, status, message, timestamp {'}'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: saved ? '#10B981' : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 14px rgba(var(--primary), 0.3)', transition: 'all 200ms' }}>
          <Save style={{ width: 15, height: 15 }} /> {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
