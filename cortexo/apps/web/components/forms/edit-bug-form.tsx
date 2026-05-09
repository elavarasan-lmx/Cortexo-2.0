'use client';

import { useState } from 'react';
import { Bug, X, Loader2 } from 'lucide-react';

interface EditBugFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  bug?: { id: string; title: string; severity: string; status: string; assignee: string; module: string; description: string };
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'rgb(var(--text-muted))' };

export default function EditBugForm({ open, onClose, onSave, bug }: EditBugFormProps) {
  const [form, setForm] = useState({
    title: bug?.title || 'Margin calculation error in order flow',
    severity: bug?.severity || 'high',
    status: bug?.status || 'open',
    assignee: bug?.assignee || 'Arjun Sharma',
    module: bug?.module || 'Trading Engine',
    description: bug?.description || 'The margin calculation is returning incorrect values when processing limit orders with partial fills.',
    labels: 'bug, trading, critical-path',
  });
  const [saving, setSaving] = useState(false);
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(var(--border),0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #EF4444, #F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Edit Bug #{bug?.id || '423'}</h2>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Update bug details and status</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex' }}><X style={{ width: '16px', height: '16px' }} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={labelStyle}>Title</label><input style={inputStyle} value={form.title} onChange={e => u('title', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Severity</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.severity} onChange={e => u('severity', e.target.value)}>
                <option value="critical">🔴 Critical</option><option value="high">🟠 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
              </select>
            </div>
            <div><label style={labelStyle}>Status</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => u('status', e.target.value)}>
                <option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Assignee</label><input style={inputStyle} value={form.assignee} onChange={e => u('assignee', e.target.value)} /></div>
            <div><label style={labelStyle}>Module</label><input style={inputStyle} value={form.module} onChange={e => u('module', e.target.value)} /></div>
          </div>
          <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => u('description', e.target.value)} /></div>
          <div><label style={labelStyle}>Labels (comma-separated)</label><input style={inputStyle} value={form.labels} onChange={e => u('labels', e.target.value)} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid rgba(var(--border),0.5)' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-primary))', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={async () => { setSaving(true); await new Promise(r => setTimeout(r, 800)); onSave?.(form); setSaving(false); onClose(); }}
            disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #EF4444, #F97316)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
            }}>
            {saving && <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
            {saving ? 'Saving...' : 'Update Bug'}
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
