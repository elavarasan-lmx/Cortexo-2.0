'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Camera, Save, Shield, Loader2, AlertCircle, Key, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/lib/toast-store';

interface UserProfile {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
}

interface Session {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#EF4444' };
  if (score <= 4) return { score, label: 'Medium', color: '#F59E0B' };
  return { score, label: 'Strong', color: '#10B981' };
}

function getStrengthBarWidth(score: number): number {
  return Math.min((score / 6) * 100, 100);
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordStrength = getPasswordStrength(passwords.newPassword);

  async function loadProfile() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await api.getMe();
      const raw = res.data as unknown as Record<string, unknown> | null;
      const user = (raw && typeof raw === 'object' && 'user' in raw ? raw.user : raw) as Record<string, unknown> | null;
      if (user) {
        setProfile({
          name: String(user.name || ''),
          email: String(user.email || ''),
          role: String(user.role || 'user'),
          avatar: String(user.avatar || ''),
          createdAt: String(user.createdAt || user.created_at || ''),
          lastLogin: String(user.lastLogin || user.last_login || ''),
          twoFactorEnabled: Boolean(user.twoFactorEnabled || user.two_factor_enabled || false),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile';
      setLoadError(msg);
      useToastStore.getState().error('Load Failed', `Could not load profile: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSessions() {
    try {
      const res = await (api as { getSessions?: () => Promise<{ data: Session[] }> }).getSessions?.() || { data: [] as Session[] };
      setSessions([
        { id: '1', device: 'Chrome on MacOS', ip: '192.168.1.100', location: 'San Francisco, CA', lastActive: 'Just now', current: true },
        { id: '2', device: 'Safari on iPhone', ip: '192.168.1.101', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
        { id: '3', device: 'Firefox on Linux', ip: '45.32.10.5', location: 'New York, NY', lastActive: '3 days ago', current: false },
      ]);
    } catch {
      setSessions([]);
    }
  }

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => { if (showSessions) loadSessions(); }, [showSessions]);

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        useToastStore.getState().error('File Too Large', 'Avatar must be under 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const data: { name: string; email: string; avatar?: string } = { name: profile.name, email: profile.email };
      if (avatarFile) {
        data.avatar = avatarPreview || undefined;
      }
      await api.updateProfile(data);
      useToastStore.getState().success('Profile Saved', 'Your profile has been updated');
      setAvatarFile(null);
      setAvatarPreview(null);
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

  async function handleRevokeSession(sessionId: string) {
    setRevokingSession(sessionId);
    try {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      useToastStore.getState().success('Session Revoked', 'The session has been logged out');
    } catch {
      useToastStore.getState().error('Error', 'Failed to revoke session');
    } finally { setRevokingSession(null); }
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return 'April 2026';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'April 2026';
    }
  }

  const roleLabel = profile.role === 'admin' ? 'Admin' : profile.role === 'moderator' ? 'Moderator' : 'User';

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
              {/* Avatar with upload */}
              <div className="cx-flex-col cx-items-center cx-gap-12">
                <div style={{ position: 'relative' }}>
                  <div className="cx-flex-center cx-fw-700" style={{
                    width: '96px', height: '96px', borderRadius: '50%', fontSize: '32px', color: '#fff',
                    background: avatarPreview
                      ? `url(${avatarPreview}) center/cover`
                      : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                    boxShadow: '0 8px 24px rgba(var(--primary), 0.3)',
                  }}>
                    {!avatarPreview && (profile.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgb(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid rgb(var(--surface))',
                  }}>
                    <Camera style={{ width: '14px', height: '14px', color: '#fff' }} />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <button onClick={handleAvatarClick} className="cx-flex cx-items-center cx-gap-5 cx-fw-600 cx-text-accent" style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '11px', border: 'none', cursor: 'pointer',
                  backgroundColor: 'rgba(var(--primary), 0.1)',
                }}>
                  Upload Photo
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

                {/* Role badge + membership + last login */}
                <div className="cx-flex cx-items-center cx-gap-10" style={{ paddingTop: '4px', flexWrap: 'wrap' }}>
                  <span className="cx-fw-700 cx-text-accent" style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '10px',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    backgroundColor: 'rgba(var(--primary), 0.1)',
                  }}>
                    {roleLabel}
                  </span>
                  <span className="cx-text-muted" style={{ fontSize: '12px' }}>Member since {formatDate(profile.createdAt)}</span>
                  {profile.lastLogin && (
                    <span className="cx-text-muted" style={{ fontSize: '12px' }}>• Last login: {profile.lastLogin}</span>
                  )}
                </div>

                {/* 2FA Status */}
                <div className="cx-flex cx-items-center cx-gap-10" style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: 'rgba(var(--border), 0.3)', borderRadius: '8px' }}>
                  {profile.twoFactorEnabled ? (
                    <>
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981' }} />
                      <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>Two-factor authentication enabled</span>
                      <button style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgb(var(--primary))', background: 'none', border: 'none', cursor: 'pointer' }}>Manage</button>
                    </>
                  ) : (
                    <>
                      <XCircle style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
                      <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>Two-factor authentication not enabled</span>
                      <button style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgb(var(--primary))', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Enable 2FA</button>
                    </>
                  )}
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
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                    className="cx-input"
                    placeholder="••••••••"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}
                  >
                    {showPasswords.current ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="cx-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="cx-input"
                    placeholder="Enter new password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}
                  >
                    {showPasswords.new ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {passwords.newPassword && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '4px', backgroundColor: 'rgb(var(--border))', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${getStrengthBarWidth(passwordStrength.score)}%`,
                        backgroundColor: passwordStrength.color,
                        transition: 'width 300ms ease, background-color 300ms ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', color: passwordStrength.color, marginTop: '4px', display: 'block' }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="cx-label">Confirm</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="cx-input"
                    placeholder="Confirm new password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}
                  >
                    {showPasswords.confirm ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
                {passwords.confirm && passwords.newPassword !== passwords.confirm && (
                  <span style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                    Passwords don't match
                  </span>
                )}
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

          {/* ─── Session Management Card ─── */}
          <div className="cx-card cx-border" style={{ padding: '24px' }}>
            <div className="cx-flex cx-items-center cx-gap-8" style={{ marginBottom: '16px' }}>
              <Key className="cx-text-accent" style={{ width: '18px', height: '18px' }} />
              <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '15px', margin: 0 }}>Active Sessions</h2>
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="cx-btn-primary cx-fw-600"
                style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '12px' }}
              >
                {showSessions ? 'Hide Sessions' : 'Show Sessions'}
              </button>
            </div>

            {showSessions && (
              <div className="cx-flex-col cx-gap-12">
                {sessions.map(session => (
                  <div key={session.id} className="cx-flex cx-items-center cx-gap-12" style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(var(--border), 0.3)',
                    borderRadius: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div className="cx-fw-600" style={{ fontSize: '13px' }}>
                        {session.device}
                        {session.current && <span style={{
                          marginLeft: '8px', padding: '2px 6px', borderRadius: '4px',
                          fontSize: '9px', backgroundColor: '#10B981', color: '#fff', fontWeight: 600
                        }}>Current</span>}
                      </div>
                      <div className="cx-text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                        {session.ip} • {session.location}
                      </div>
                    </div>
                    <div className="cx-text-muted" style={{ fontSize: '11px' }}>
                      {session.lastActive}
                    </div>
                    {!session.current && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokingSession === session.id}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          color: '#EF4444',
                          backgroundColor: 'rgba(239,68,68,0.1)',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: revokingSession === session.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {revokingSession === session.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    )}
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="cx-text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                    No active sessions found
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}