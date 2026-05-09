'use client';

import { useState } from 'react';
import { Users, X, Loader2 } from 'lucide-react';

interface AddClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.04em', marginBottom: '6px', color: 'rgb(var(--text-muted))',
};

export default function AddClientForm({ open, onClose, onSave }: AddClientFormProps) {
  const [form, setForm] = useState({
    name: '', slug: '', contactName: '', contactEmail: '', contactPhone: '',
    plan: 'lite', status: 'active', website: '', notes: '',
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
        width: '520px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px',
        backgroundColor: 'rgb(var(--card))', border: '1px solid rgb(var(--border))',
        boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid rgba(var(--border),0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Add New Client</h2>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Create a new client profile</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Client Name *</label><input style={inputStyle} placeholder="GoldStar Traders" value={form.name} onChange={e => u('name', e.target.value)} /></div>
            <div><label style={labelStyle}>Client Slug *</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="goldstar" value={form.slug} onChange={e => u('slug', e.target.value)} /></div>
          </div>
          <div><label style={labelStyle}>Contact Person</label><input style={inputStyle} placeholder="John Smith" value={form.contactName} onChange={e => u('contactName', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Email</label><input style={inputStyle} placeholder="contact@company.com" value={form.contactEmail} onChange={e => u('contactEmail', e.target.value)} /></div>
            <div><label style={labelStyle}>Phone</label><input style={inputStyle} placeholder="+91 98765 43210" value={form.contactPhone} onChange={e => u('contactPhone', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Plan</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.plan} onChange={e => u('plan', e.target.value)}>
                <option value="lite">Lite</option><option value="trade">Trade</option><option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div><label style={labelStyle}>Status</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => u('status', e.target.value)}>
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="trial">Trial</option>
              </select>
            </div>
          </div>
          <div><label style={labelStyle}>Website</label><input style={inputStyle} placeholder="https://company.com" value={form.website} onChange={e => u('website', e.target.value)} /></div>
          <div><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Additional notes..." value={form.notes} onChange={e => u('notes', e.target.value)} /></div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid rgba(var(--border),0.5)' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-primary))', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#fff', fontSize: '13px', fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer', opacity: !form.name ? 0.5 : 1,
          }}>
            {saving && <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
            {saving ? 'Saving...' : 'Add Client'}
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
