'use client';

import { useState } from 'react';
import { Server, X, Loader2, Globe, Key, HardDrive } from 'lucide-react';

interface AddServerFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 200ms',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.04em', marginBottom: '6px', color: 'rgb(var(--text-muted))',
};

export default function AddServerForm({ open, onClose, onSave }: AddServerFormProps) {
  const [form, setForm] = useState({
    name: '', ip: '', port: '22', user: 'root', provider: 'aws',
    sshKey: '', region: '', os: 'Ubuntu 22.04', tags: '',
  });
  const [saving, setSaving] = useState(false);

  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    onSave?.(form);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 99998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        width: '540px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px',
        backgroundColor: 'rgb(var(--card))', border: '1px solid rgb(var(--border))',
        boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid rgba(var(--border),0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Add New Server</h2>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Configure connection details</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={labelStyle}>Server Name *</label><input style={inputStyle} placeholder="prod-api-03" value={form.name} onChange={e => u('name', e.target.value)} /></div>
            <div><label style={labelStyle}>IP Address *</label><input style={inputStyle} placeholder="192.168.1.100" value={form.ip} onChange={e => u('ip', e.target.value)} /></div>
          </div>
          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={labelStyle}>SSH Port</label><input style={inputStyle} placeholder="22" value={form.port} onChange={e => u('port', e.target.value)} /></div>
            <div><label style={labelStyle}>SSH User</label><input style={inputStyle} placeholder="root" value={form.user} onChange={e => u('user', e.target.value)} /></div>
          </div>
          {/* Provider */}
          <div>
            <label style={labelStyle}>Provider</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.provider} onChange={e => u('provider', e.target.value)}>
              <option value="aws">AWS (EC2)</option>
              <option value="gcp">Google Cloud</option>
              <option value="azure">Azure</option>
              <option value="digitalocean">DigitalOcean</option>
              <option value="hetzner">Hetzner</option>
              <option value="custom">Custom / Bare Metal</option>
            </select>
          </div>
          {/* Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={labelStyle}>Region</label><input style={inputStyle} placeholder="ap-south-1" value={form.region} onChange={e => u('region', e.target.value)} /></div>
            <div><label style={labelStyle}>Operating System</label><input style={inputStyle} placeholder="Ubuntu 22.04" value={form.os} onChange={e => u('os', e.target.value)} /></div>
          </div>
          {/* SSH Key */}
          <div>
            <label style={labelStyle}>SSH Private Key / Path</label>
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }} placeholder="~/.ssh/id_rsa or paste key..." value={form.sshKey} onChange={e => u('sshKey', e.target.value)} />
          </div>
          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input style={inputStyle} placeholder="production, api, backend" value={form.tags} onChange={e => u('tags', e.target.value)} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          padding: '16px 24px', borderTop: '1px solid rgba(var(--border),0.5)',
        }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-primary))', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name || !form.ip} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff', fontSize: '13px', fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer', opacity: (!form.name || !form.ip) ? 0.5 : 1,
          }}>
            {saving && <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
            {saving ? 'Adding...' : 'Add Server'}
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
