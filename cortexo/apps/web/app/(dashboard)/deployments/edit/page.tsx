'use client';

import { useState } from 'react';
import { Rocket, ArrowLeft, Save, Loader2, Trash2, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = { borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'rgb(var(--text-muted))' };

export default function EditDeployPage() {
  useAutoLoadToken();
  const [form, setForm] = useState({
    project: 'winbull-api', branch: 'main', server: 'prod-api-01', environment: 'production',
    buildCmd: 'npm run build', deployCmd: './deploy.sh', preDeployHook: 'npm test', postDeployHook: 'pm2 restart all',
    autoRollback: true, notifySlack: true, healthCheck: '/api/health',
  });
  const [saving, setSaving] = useState(false);
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Link href="/deployments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none' }}><ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Deployments</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Rocket style={{ width: '20px', height: '20px', color: '#fff' }} /></div>
          <div><h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0 }}>✏️ Edit Deploy #1284</h1><span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.1)' }}>Live</span></div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #EF4444', backgroundColor: 'transparent', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}><Trash2 style={{ width: '14px', height: '14px' }} /> Delete</button>
          <button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 800); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />} {saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}><h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Deploy Target</h3></div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Project</label><input style={inputStyle} value={form.project} onChange={e => u('project', e.target.value)} /></div>
              <div><label style={labelStyle}>Branch</label><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><GitBranch style={{ width: '14px', height: '14px', color: '#7C3AED' }} /><input style={{ ...inputStyle, flex: 1 }} value={form.branch} onChange={e => u('branch', e.target.value)} /></div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Server</label><input style={inputStyle} value={form.server} onChange={e => u('server', e.target.value)} /></div>
              <div><label style={labelStyle}>Environment</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.environment} onChange={e => u('environment', e.target.value)}><option>production</option><option>staging</option><option>development</option></select></div>
            </div>
            <div><label style={labelStyle}>Health Check URL</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.healthCheck} onChange={e => u('healthCheck', e.target.value)} /></div>
          </div>
        </div>
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}><h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Build & Hooks</h3></div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={labelStyle}>Build Command</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.buildCmd} onChange={e => u('buildCmd', e.target.value)} /></div>
            <div><label style={labelStyle}>Deploy Command</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.deployCmd} onChange={e => u('deployCmd', e.target.value)} /></div>
            <div><label style={labelStyle}>Pre-Deploy Hook</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.preDeployHook} onChange={e => u('preDeployHook', e.target.value)} /></div>
            <div><label style={labelStyle}>Post-Deploy Hook</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.postDeployHook} onChange={e => u('postDeployHook', e.target.value)} /></div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
