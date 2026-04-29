'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, Shield, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  paddingLeft: '40px',
  fontSize: '13px',
  borderRadius: '10px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))',
  outline: 'none',
  transition: 'border-color 200ms',
};

const inputNoPad: React.CSSProperties = {
  ...inputBase,
  paddingLeft: '14px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
  padding: '24px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'rgb(var(--text-muted))',
  marginBottom: '6px',
};

type Toast = { type: 'success' | 'error'; message: string } | null;

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  // Load user profile on mount via internal Next.js API route
  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setProfile({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      setToast({ type: 'success', message: 'Profile saved successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!passwords.current || !passwords.newPassword) {
      setToast({ type: 'error', message: 'Fill in all password fields' });
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      setToast({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (passwords.newPassword.length < 8) {
      setToast({ type: 'error', message: 'New password must be at least 8 characters' });
      return;
    }
    setChangingPw(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setToast({ type: 'success', message: 'Password changed successfully' });
      setPasswords({ current: '', newPassword: '', confirm: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setToast({ type: 'error', message });
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─── Toast notification ─── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 18px', borderRadius: '12px',
          fontSize: '13px', fontWeight: 600, color: '#fff',
          backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          animation: 'fadeIn 200ms ease',
        }}>
          {toast.type === 'success'
            ? <CheckCircle style={{ width: '16px', height: '16px' }} />
            : <AlertCircle style={{ width: '16px', height: '16px' }} />}
          {toast.message}
        </div>
      )}

      {/* ─── Profile Information Card ─── */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 20px 0' }}>
          Profile Information
        </h2>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 700,
              color: '#fff',
              boxShadow: '0 8px 24px rgba(var(--primary), 0.3)',
            }}>
              {(profile.name || 'U').charAt(0).toUpperCase()}
            </div>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'rgba(var(--primary), 0.1)',
              color: 'rgb(var(--primary))',
            }}>
              <Camera style={{ width: '12px', height: '12px' }} /> Upload
            </button>
          </div>

          {/* Fields grid */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '16px', height: '16px', color: 'rgb(var(--text-muted))',
                  }} />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    style={inputBase}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '16px', height: '16px', color: 'rgb(var(--text-muted))',
                  }} />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    style={inputBase}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '16px', height: '16px', color: 'rgb(var(--text-muted))',
                  }} />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    style={inputBase}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Role badge + membership */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
              <span style={{
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                backgroundColor: 'rgba(var(--primary), 0.1)',
                color: 'rgb(var(--primary))',
              }}>
                Admin
              </span>
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                Member since April 2026
              </span>
            </div>
          </div>
        </div>

        {/* Save Profile button inside card */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgb(var(--border))' }}>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
              boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
              opacity: saving ? 0.7 : 1,
              transition: 'all 200ms',
            }}
          >
            {saving
              ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Saving...</>
              : <><Save style={{ width: '15px', height: '15px' }} /> Save Profile</>}
          </button>
        </div>
      </div>

      {/* ─── Change Password Card ─── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Shield style={{ width: '18px', height: '18px', color: 'rgb(var(--primary))' }} />
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
            Change Password
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={e => setPasswords({ ...passwords, current: e.target.value })}
              style={inputNoPad}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              style={inputNoPad}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
              style={inputNoPad}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        {/* Change Password button inside card */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgb(var(--border))' }}>
          <button
            onClick={handleChangePassword}
            disabled={changingPw}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              border: 'none',
              cursor: changingPw ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
              boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
              opacity: changingPw ? 0.7 : 1,
              transition: 'all 200ms',
            }}
          >
            {changingPw
              ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Updating...</>
              : <><Shield style={{ width: '15px', height: '15px' }} /> Change Password</>}
          </button>
        </div>
      </div>
    </div>
  );
}
