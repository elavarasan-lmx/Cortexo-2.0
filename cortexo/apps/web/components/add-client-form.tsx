'use client';

import { useState } from 'react';
import { X, Users, Save, Loader2 } from 'lucide-react';

interface AddClientFormProps {
  onSave: (data: any) => void;
  onClose: () => void;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none',
  fontFamily: "'Inter', sans-serif", transition: 'border-color 200ms',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '6px', color: 'rgb(var(--text-muted))',
};

export default function AddClientForm({ onSave, onClose }: AddClientFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSave({ name, email, environment, domain });
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
        width: '520px', maxWidth: '90vw', borderRadius: '18px',
        backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)', overflow: 'hidden',
        animation: 'slideUp 200ms cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{
          padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(var(--border),0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '16px', height: '16px', color: '#3B82F6' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Add New Client</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lbl}>Client Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Acme Corporation" style={inp} />
          </div>
          <div>
            <label style={lbl}>Contact Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@acme.com" type="email" style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>Environment</label>
              <select value={environment} onChange={e => setEnvironment(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Domain</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="acme.com" style={inp} />
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px',
          borderTop: '1px solid rgba(var(--border),0.15)',
        }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !name} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            color: '#fff', backgroundColor: '#3B82F6', border: 'none', cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !name ? 0.6 : 1, boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}>
            {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            Add Client
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
