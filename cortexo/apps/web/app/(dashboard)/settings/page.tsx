'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, Shield, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';

export default function SettingsPage() {
  useAutoLoadToken();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadProfile() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await api.getMe();
      const user = (res.data as any)?.user || res.data;
      if (user) setProfile({ name: user.name || '', email: user.email || '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile';
      setLoadError(msg);
      useToastStore.getState().error('Load Failed', `Could not load profile: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadProfile(); }, []);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await api.updateProfile({ name: profile.name, email: profile.email });
      useToastStore.getState().success('Profile Saved', 'Your profile has been updated');
    } catch (err: unknown) {
      useToastStore.getState().error('Save Failed', err instanceof Error ? err.message : 'Failed to save profile');
    } finally { setSaving(false); }
  }

  async function handleChangePassword() {
    if (!passwords.current || !passwords.newPassword) {
      useToastStore.getState().error('Validation', 'Fill in all password fields'); return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      useToastStore.getState().error('Validation', 'New passwords do not match'); return;
    }
    if (passwords.newPassword.length < 8) {
      useToastStore.getState().error('Validation', 'New password must be at least 8 characters'); return;
    }
    setChangingPw(true);
    try {
      await api.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPassword });
      useToastStore.getState().success('Password Changed', 'Your password has been updated');
      setPasswords({ current: '', newPassword: '', confirm: '' });
    } catch (err: unknown) {
      useToastStore.getState().error('Password Failed', err instanceof Error ? err.message : 'Failed to change password');
    } finally { setChangingPw(false); }
  }

  return (
    <div className="cx-flex-col cx-gap-20">

      {/* ─── Loading Skeleton ─── */}
      {isLoading && (
        <div className="cx-card cx-border" style={{ padding: '24px' }}>
          <div className="cx-flex-col cx-gap-20">
            <div className="cx-skeleton" style={{ width: '150px', height: '18px', borderRadius: '8px' }} />
            <div className="cx-flex cx-gap-28" style={{ flexWrap: 'wrap' }}>
              <div className="cx-skeleton" style={{ width: '96px', height: '96px', borderRadius: '50%' }} />
              <div className="cx-flex-col cx-gap-14" style={{ flex: 1 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="cx-skeleton" style={{ height: '42px', borderRadius: '10px', animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Error Banner ─── */}
      {!isLoading && loadError && (
        <div className="cx-card cx-flex-between" style={{
          padding: '24px', gap: '12px', flexWrap: 'wrap',
          backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px',
        }}>
          <div className="cx-flex cx-items-center cx-gap-10">
            <AlertCircle style={{ width: '18px', height: '18px', color: '#EF4444', flexShrink: 0 }} />
            <div>
              <p className="cx-fw-600" style={{ margin: 0, fontSize: '13px', color: '#EF4444' }}>Failed to load profile</p>
              <p className="cx-text-muted" style={{ margin: '2px 0 0', fontSize: '12px' }}>{loadError}</p>
            </div>
          </div>
          <button onClick={loadProfile} className="cx-btn-primary cx-fw-600" style={{ padding: '8px 18px', fontSize: '12px' }}>
            ↻ Retry
          </button>
        </div>
      )}

      {/* ─── Profile + Password Cards ─── */}
      {!isLoading && !loadError && (
        <>
          {/* ─── Profile Information Card ─── */}
          <div className="cx-card cx-border" style={{ padding: '24px' }}>
            <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '15px', margin: '0 0 20px' }}>
              Profile Information
            </h2>

            <div className="cx-flex cx-gap-28" style={{ flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div className="cx-flex-col cx-items-center cx-gap-12">
                <div className="cx-flex-center cx-fw-700" style={{
                  width: '96px', height: '96px', borderRadius: '50%', fontSize: '32px', color: '#fff',
                  background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                  boxShadow: '0 8px 24px rgba(var(--primary), 0.3)',
                }}>
                  {(profile.name || 'U').charAt(0).toUpperCase()}
                </div>
                <button className="cx-flex cx-items-center cx-gap-5 cx-fw-600 cx-text-accent" style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '11px', border: 'none', cursor: 'pointer',
                  backgroundColor: 'rgba(var(--primary), 0.1)',
                }}>
                  <Camera style={{ width: '12px', height: '12px' }} /> Upload
                </button>
              </div>

              {/* Fields grid */}
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* Full Name */}
                  <div>
                    <label className="cx-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User className="cx-input-icon cx-text-muted" style={{ width: '16px', height: '16px' }} />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="cx-input cx-input-icon-left"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="cx-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail className="cx-input-icon cx-text-muted" style={{ width: '16px', height: '16px' }} />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="cx-input cx-input-icon-left"
                      />
                    </div>
                  </div>
                </div>

                {/* Role badge + membership */}
                <div className="cx-flex cx-items-center cx-gap-10" style={{ paddingTop: '4px' }}>
                  <span className="cx-fw-700 cx-text-accent" style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '10px',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    backgroundColor: 'rgba(var(--primary), 0.1)',
                  }}>
                    Admin
                  </span>
                  <span className="cx-text-muted" style={{ fontSize: '12px' }}>Member since April 2026</span>
                </div>
              </div>
            </div>

            {/* Save Profile */}
            <div className="cx-flex" style={{ justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgb(var(--border))' }}>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="cx-btn-primary cx-flex cx-items-center cx-gap-8"
                style={{ padding: '10px 24px', fontSize: '13px', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving
                  ? <><Loader2 className="cx-spin" style={{ width: '15px', height: '15px' }} /> Saving...</>
                  : <><Save style={{ width: '15px', height: '15px' }} /> Save Profile</>}
              </button>
            </div>
          </div>

          {/* ─── Change Password Card ─── */}
          <div className="cx-card cx-border" style={{ padding: '24px' }}>
            <div className="cx-flex cx-items-center cx-gap-8" style={{ marginBottom: '20px' }}>
              <Shield className="cx-text-accent" style={{ width: '18px', height: '18px' }} />
              <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '15px', margin: 0 }}>Change Password</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label className="cx-label">Current Password</label>
                <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="cx-input" placeholder="••••••••" />
              </div>
              <div>
                <label className="cx-label">New Password</label>
                <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className="cx-input" placeholder="Enter new password" />
              </div>
              <div>
                <label className="cx-label">Confirm</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="cx-input" placeholder="Confirm new password" />
              </div>
            </div>

            {/* Change Password button */}
            <div className="cx-flex" style={{ justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgb(var(--border))' }}>
              <button
                onClick={handleChangePassword}
                disabled={changingPw}
                className="cx-btn-primary cx-flex cx-items-center cx-gap-8"
                style={{ padding: '10px 24px', fontSize: '13px', opacity: changingPw ? 0.7 : 1, cursor: changingPw ? 'not-allowed' : 'pointer' }}
              >
                {changingPw
                  ? <><Loader2 className="cx-spin" style={{ width: '15px', height: '15px' }} /> Updating...</>
                  : <><Shield style={{ width: '15px', height: '15px' }} /> Change Password</>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
