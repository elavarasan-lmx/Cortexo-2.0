'use client';

import { useState } from 'react';
import { X, Server, Save, Loader2, Shield } from 'lucide-react';

interface AddServerFormProps {
  onSave: (data: any) => void;
  onClose: () => void;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none',
  fontFamily: "'JetBrains Mono', monospace", transition: 'border-color 200ms',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '6px', color: 'rgb(var(--text-muted))',
};

export default function AddServerForm({ onSave, onClose }: AddServerFormProps) {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('root');
  const [authMethod, setAuthMethod] = useState<'key' | 'password'>('key');
  const [environment, setEnvironment] = useState('production');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSave({ name, host, port, username, authMethod, environment });
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 150ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '540px', maxWidth: '90vw', borderRadius: '18px',
        backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)', overflow: 'hidden',
        animation: 'slideUp 200ms cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(var(--border),0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server style={{ width: '16px', height: '16px', color: '#F97316' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Add New Server</h3>
              <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>Configure server connection details</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>Server Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="prod-api-01" style={inp} />
            </div>
            <div>
              <label style={lbl}>Environment</label>
              <select value={environment} onChange={e => setEnvironment(e.target.value)} style={{ ...inp, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>Host / IP</label>
              <input value={host} onChange={e => setHost(e.target.value)} placeholder="192.168.1.100" style={inp} />
            </div>
            <div>
              <label style={lbl}>SSH Port</label>
              <input value={port} onChange={e => setPort(e.target.value)} placeholder="22" style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="root" style={inp} />
            </div>
            <div>
              <label style={lbl}>Auth Method</label>
              <select value={authMethod} onChange={e => setAuthMethod(e.target.value as any)} style={{ ...inp, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                <option value="key">SSH Key</option>
                <option value="password">Password</option>
              </select>
            </div>
          </div>

          {/* SSH indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px',
            backgroundColor: 'rgba(var(--border),0.2)',
            border: '1px solid rgba(var(--border),0.3)',
          }}>
            <Shield style={{ width: '16px', height: '16px', color: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>
              Connection will be verified using {authMethod === 'key' ? 'SSH key authentication' : 'password authentication'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '16px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px',
          borderTop: '1px solid rgba(var(--border),0.15)',
        }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading || !name || !host} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            color: '#fff', backgroundColor: '#F97316', border: 'none', cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !name || !host ? 0.6 : 1, boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
          }}>
            {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            Add Server
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
