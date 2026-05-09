'use client';

import { useState } from 'react';
import { Brain, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = { borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'rgb(var(--text-muted))' };

const capabilities = ['Code Review', 'Bug Detection', 'Root Cause Analysis', 'Auto-Fix', 'Performance Audit', 'Security Scan', 'Dependency Check', 'Drift Detection'];

export default function AddAIAgentPage() {
  useAutoLoadToken();
  const [form, setForm] = useState({ name: '', type: 'code_review', model: 'gpt-4o', schedule: 'on_push', systemPrompt: '', maxTokens: '4096', temperature: '0.3', capabilities: ['Code Review', 'Bug Detection'] as string[] });
  const [saving, setSaving] = useState(false);
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const toggleCap = (cap: string) => setForm(p => ({ ...p, capabilities: p.capabilities.includes(cap) ? p.capabilities.filter(c => c !== cap) : [...p.capabilities, cap] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Link href="/agents" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none' }}><ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to AI Agents</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div><h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>🤖 New AI Agent</h1><p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>Configure and deploy a new AI agent</p></div>
        <button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 800); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7C3AED, #6366F1)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />} {saving ? 'Creating...' : 'Create Agent'}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}><h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Agent Configuration</h3></div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={labelStyle}>Agent Name *</label><input style={inputStyle} placeholder="CodeGuard Agent" value={form.name} onChange={e => u('name', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Agent Type</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={e => u('type', e.target.value)}><option value="code_review">Code Review</option><option value="bug_detection">Bug Detection</option><option value="security">Security</option><option value="performance">Performance</option><option value="rca">Root Cause</option></select></div>
              <div><label style={labelStyle}>AI Model</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.model} onChange={e => u('model', e.target.value)}><option value="gpt-4o">GPT-4o</option><option value="gpt-4o-mini">GPT-4o Mini</option><option value="claude-3.5">Claude 3.5</option><option value="gemini-pro">Gemini Pro</option></select></div>
            </div>
            <div><label style={labelStyle}>Trigger</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.schedule} onChange={e => u('schedule', e.target.value)}><option value="on_push">On Push</option><option value="on_pr">On PR</option><option value="on_deploy">On Deploy</option><option value="scheduled">Scheduled</option><option value="manual">Manual</option></select></div>
            <div><label style={labelStyle}>System Prompt</label><textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }} placeholder="You are a code review agent..." value={form.systemPrompt} onChange={e => u('systemPrompt', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Max Tokens</label><input style={inputStyle} value={form.maxTokens} onChange={e => u('maxTokens', e.target.value)} /></div>
              <div><label style={labelStyle}>Temperature</label><input style={inputStyle} value={form.temperature} onChange={e => u('temperature', e.target.value)} /></div>
            </div>
          </div>
        </div>
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}><h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Capabilities</h3></div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {capabilities.map(cap => (
              <button key={cap} onClick={() => toggleCap(cap)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', border: 'none', width: '100%', textAlign: 'left', backgroundColor: form.capabilities.includes(cap) ? 'rgba(124,58,237,0.08)' : 'transparent', cursor: 'pointer' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: form.capabilities.includes(cap) ? '2px solid #7C3AED' : '2px solid rgb(var(--border))', backgroundColor: form.capabilities.includes(cap) ? '#7C3AED' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{form.capabilities.includes(cap) && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}</div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))' }}>{cap}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
