'use client';

import { useState, useEffect } from 'react';
import {
  User, Mail, Shield, Calendar, Key, Activity, Globe,
  Edit3, Save, Camera, MapPin, Phone, Briefcase, Loader2,
} from 'lucide-react';
import { api, type AuthUser } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '6px', color: 'rgb(var(--text-muted))',
};
const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none',
  fontFamily: "'Inter', sans-serif", transition: 'border-color 200ms',
};

export default function UserProfilePage() {
  useAutoLoadToken();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    api.getMe().then(res => {
      if (res.data?.user) {
        setUser(res.data.user);
        setForm({ name: res.data.user.name, email: res.data.user.email });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await api.updateProfile(form);
      if (res.data?.user) {
        setUser(res.data.user);
        setForm({ name: res.data.user.name, email: res.data.user.email });
      }
      setEditing(false);
      setSaveMsg('Profile updated!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err: any) {
      setSaveMsg(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '10px' }}>
        <Loader2 style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>Loading profile...</span>
      </div>
    );
  }

  const name = user?.name || 'User';
  const email = user?.email || '';
  const role = user?.role || 'member';

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>User Profile</h1>
      <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', margin: '0 0 24px' }}>Manage your account and preferences</p>

      {saveMsg && (
        <div style={{ padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, backgroundColor: saveMsg.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: saveMsg.includes('Failed') ? '#EF4444' : '#10B981' }}>
          {saveMsg}
        </div>
      )}

      {/* Hero Card */}
      <div style={{
        ...card, marginBottom: '20px',
        background: 'linear-gradient(135deg, rgba(var(--primary),0.06) 0%, rgba(var(--agent),0.04) 100%)',
      }}>
        <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 700, color: '#fff', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(var(--primary),0.3)',
            }}>
              {name.charAt(0).toUpperCase()}
            </div>
            {user?.avatarUrl && (
              <img src={user.avatarUrl} alt="avatar" style={{ position: 'absolute', top: 0, left: 0, width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <button style={{
              position: 'absolute', bottom: '-2px', right: '-2px',
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: 'rgb(var(--surface))', border: '2px solid rgb(var(--border))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Camera style={{ width: '12px', height: '12px', color: 'rgb(var(--text-muted))' }} />
            </button>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>{name}</h2>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '0 0 8px' }}>{email}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(var(--primary),0.1)', color: 'rgb(var(--primary))', textTransform: 'capitalize' }}>{role}</span>
              {user?.orgId && (
                <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  Org: {user.orgId.slice(0, 8)}
                </span>
              )}
            </div>
          </div>

          <button onClick={() => setEditing(!editing)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            backgroundColor: editing ? 'transparent' : 'rgb(var(--primary))',
            color: editing ? 'rgb(var(--text-secondary))' : '#fff',
            border: editing ? '1px solid rgb(var(--border))' : 'none',
          }}>
            <Edit3 style={{ width: '14px', height: '14px' }} /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Personal Info */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Personal Information</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {editing ? (
              <>
                <div><label style={lbl}>Full Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} /></div>
                <button onClick={handleSave} disabled={saving} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, color: '#fff',
                  background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                }}>
                  {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                {[
                  { icon: User, label: 'Name', value: name },
                  { icon: Mail, label: 'Email', value: email },
                  { icon: Shield, label: 'Role', value: role },
                  { icon: Globe, label: 'User ID', value: user?.id?.slice(0, 12) + '...' || '-' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgb(var(--text-muted))' }}>
                      <row.icon style={{ width: '14px', height: '14px' }} /> {row.label}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{row.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Account & Security */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Account & Security</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: Shield, label: 'Role', value: role },
              { icon: Globe, label: 'Organization', value: user?.orgId?.slice(0, 8) || '-' },
              { icon: Calendar, label: 'User ID', value: user?.id || '-' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgb(var(--text-muted))' }}>
                  <row.icon style={{ width: '14px', height: '14px' }} /> {row.label}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{row.value}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid rgba(var(--border),0.15)', paddingTop: '16px', display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>
                Change Password
              </button>
              <button style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>
                Revoke All Sessions
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
