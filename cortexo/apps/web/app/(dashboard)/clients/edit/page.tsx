'use client';

import { useState } from 'react';
import { Users, Save, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = { borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'rgb(var(--text-muted))' };

export default function EditClientPage() {
  useAutoLoadToken();
  const [form, setForm] = useState({
    name: 'WinBull Trading', slug: 'winbull', contactName: 'Jerry Kumar', contactEmail: 'jerry@winbull.com',
    contactPhone: '+91 98765 43210', plan: 'trade', status: 'active', website: 'https://winbull.com',
    notes: 'Primary trading platform client with custom deployment pipeline', apiKey: 'wbl_live_xxxxx',
  });
  const [saving, setSaving] = useState(false);
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Link href="/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Clients
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700 }}>W</div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0 }}>✏️ Edit Client: {form.name}</h1>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.1)' }}>Active</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #EF4444', backgroundColor: 'transparent', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Trash2 style={{ width: '14px', height: '14px' }} /> Delete
          </button>
          <button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 800); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Client Details</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Client Name</label><input style={inputStyle} value={form.name} onChange={e => u('name', e.target.value)} /></div>
              <div><label style={labelStyle}>Slug</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.slug} onChange={e => u('slug', e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Plan</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.plan} onChange={e => u('plan', e.target.value)}><option value="lite">Lite</option><option value="trade">Trade</option><option value="enterprise">Enterprise</option></select></div>
              <div><label style={labelStyle}>Status</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => u('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="trial">Trial</option></select></div>
            </div>
            <div><label style={labelStyle}>Website</label><input style={inputStyle} value={form.website} onChange={e => u('website', e.target.value)} /></div>
            <div><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => u('notes', e.target.value)} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Contact Information</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={labelStyle}>Contact Person</label><input style={inputStyle} value={form.contactName} onChange={e => u('contactName', e.target.value)} /></div>
              <div><label style={labelStyle}>Email</label><input style={inputStyle} value={form.contactEmail} onChange={e => u('contactEmail', e.target.value)} /></div>
              <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.contactPhone} onChange={e => u('contactPhone', e.target.value)} /></div>
            </div>
          </div>
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>API Access</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <label style={labelStyle}>API Key</label>
              <input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.apiKey} readOnly />
              <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '6px 0 0' }}>Used for webhook and integration endpoints</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
