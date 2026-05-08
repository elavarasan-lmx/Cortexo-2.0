'use client';
import { useState } from 'react';
import { Mail, Send, Plus } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '12px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--card))', overflow: 'hidden',
};
const labelStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))',
  marginBottom: '6px', display: 'block',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};

const templates = [
  { name: 'Deploy Success', desc: 'Sent after successful deploy', color: '#10B981' },
  { name: 'Build Failure Alert', desc: 'CI/CD build failure notification', color: '#EF4444' },
  { name: 'Server Down', desc: 'Heartbeat failure detected', color: '#F59E0B' },
  { name: 'Bug Auto-Detected', desc: 'AI detected production error', color: '#8B5CF6' },
  { name: 'Weekly Digest', desc: 'Weekly platform summary', color: '#3B82F6' },
  { name: 'Onit Alert', desc: 'On-call incident escalation', color: '#EC4899' },
];

export default function EmailConfigPage() {
  useAutoLoadToken();
  const [form, setForm] = useState({
    host: 'smtp.gmail.com', port: '587', encryption: 'TLS',
    email: 'noreply@cortexo.co', password: '', fromName: 'Cortexo Platform',
  });
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail style={{ width: '24px', height: '24px', color: '#3B82F6' }} /> Email Configuration
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Configure SMTP, notification templates, and delivery settings.
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Send style={{ width: '14px', height: '14px' }} /> Send Test Email
        </button>
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Left: SMTP Settings */}
        <div style={card}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>SMTP Settings</h3>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={labelStyle}>SMTP Host</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.host} onChange={e => u('host', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Port</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.port} onChange={e => u('port', e.target.value)} /></div>
              <div><label style={labelStyle}>Encryption</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.encryption} onChange={e => u('encryption', e.target.value)}>
                  <option>TLS</option><option>SSL</option><option>None</option>
                </select>
              </div>
            </div>
            <div><label style={labelStyle}>Sender Email</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.email} onChange={e => u('email', e.target.value)} /></div>
            <div><label style={labelStyle}>Password / App Key</label><input type="password" style={inputStyle} placeholder="••••••••" value={form.password} onChange={e => u('password', e.target.value)} /></div>
            <div><label style={labelStyle}>From Name</label><input style={inputStyle} value={form.fromName} onChange={e => u('fromName', e.target.value)} /></div>
            <button style={{ alignSelf: 'flex-end', padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save SMTP</button>
          </div>
        </div>

        {/* Right: Notification Templates */}
        <div style={card}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Notification Templates</h3>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {templates.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.08)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ width: '4px', height: '36px', borderRadius: '2px', backgroundColor: t.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '2px' }}>{t.desc}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: t.color, padding: '3px 8px', borderRadius: '4px', backgroundColor: `${t.color}12` }}>Active</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(var(--border),0.4)' }}>
            <button style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Add Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
