'use client';

import { useState } from 'react';
import { Clock, X, Loader2 } from 'lucide-react';

interface AddCronJobFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'rgb(var(--text-muted))' };

export default function AddCronJobForm({ open, onClose, onSave }: AddCronJobFormProps) {
  const [form, setForm] = useState({
    name: '', schedule: '0 2 * * *', command: '', server: '', enabled: true,
    timeout: '300', retries: '3', notifyOnFail: true, description: '',
  });
  const [saving, setSaving] = useState(false);
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  if (!open) return null;

  const presets = [
    { label: 'Every minute', cron: '* * * * *' },
    { label: 'Every hour', cron: '0 * * * *' },
    { label: 'Daily at 2 AM', cron: '0 2 * * *' },
    { label: 'Weekly (Sun)', cron: '0 0 * * 0' },
    { label: 'Monthly', cron: '0 0 1 * *' },
  ];

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(var(--border),0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Add Cron Job</h2>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Schedule a recurring task</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex' }}><X style={{ width: '16px', height: '16px' }} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={labelStyle}>Job Name *</label><input style={inputStyle} placeholder="Daily DB Cleanup" value={form.name} onChange={e => u('name', e.target.value)} /></div>

          <div>
            <label style={labelStyle}>Cron Schedule *</label>
            <input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 600 }} placeholder="0 2 * * *" value={form.schedule} onChange={e => u('schedule', e.target.value)} />
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {presets.map(p => (
                <button key={p.cron} onClick={() => u('schedule', p.cron)} style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                  border: form.schedule === p.cron ? '1px solid rgb(var(--primary))' : '1px solid rgb(var(--border))',
                  backgroundColor: form.schedule === p.cron ? 'rgba(var(--primary),0.08)' : 'transparent',
                  color: form.schedule === p.cron ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                }}>{p.label}</button>
              ))}
            </div>
          </div>

          <div><label style={labelStyle}>Command *</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="/usr/bin/php artisan cleanup:run" value={form.command} onChange={e => u('command', e.target.value)} /></div>

          <div><label style={labelStyle}>Server</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.server} onChange={e => u('server', e.target.value)}>
              <option value="">Select server...</option>
              <option value="prod-api-01">prod-api-01</option><option value="prod-api-02">prod-api-02</option><option value="staging-01">staging-01</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Timeout (seconds)</label><input style={inputStyle} value={form.timeout} onChange={e => u('timeout', e.target.value)} /></div>
            <div><label style={labelStyle}>Max Retries</label><input style={inputStyle} value={form.retries} onChange={e => u('retries', e.target.value)} /></div>
          </div>

          <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} placeholder="What does this job do?" value={form.description} onChange={e => u('description', e.target.value)} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid rgba(var(--border),0.5)' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-primary))', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={async () => { setSaving(true); await new Promise(r => setTimeout(r, 800)); onSave?.(form); setSaving(false); onClose(); }}
            disabled={saving || !form.name || !form.command} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)', color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer', opacity: (!form.name || !form.command) ? 0.5 : 1,
            }}>
            {saving && <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
            {saving ? 'Creating...' : 'Create Job'}
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
