'use client';
import { Lock, Users, Shield, UserPlus, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

const roleConfig: Record<string, { color: string; perms: string[] }> = {
  owner:     { color: '#A78BFA', perms: ['Full Access', 'Billing', 'Delete Resources'] },
  admin:     { color: '#3B82F6', perms: ['Manage Servers', 'Deployments', 'Team Management'] },
  developer: { color: '#10B981', perms: ['Deploy', 'View Logs', 'Edit Configs'] },
  member:    { color: '#F59E0B', perms: ['Deploy', 'View Logs'] },
  viewer:    { color: '#6B7280', perms: ['Read-Only Access'] },
};

export default function AccessControlPage() {
  useAutoLoadToken();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const { data: members, loading, error, refetch } = useApiData(
    () => api.getUsers(),
    { default: [] as any[] }
  );

  // Group by role
  const roleGroups: Record<string, any[]> = {};
  (members || []).forEach((m: any) => {
    const role = (m.role || 'member').toLowerCase();
    if (!roleGroups[role]) roleGroups[role] = [];
    roleGroups[role].push(m);
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await api.inviteMember({ email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      refetch();
    } catch {}
    setInviting(false);
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this member?')) return;
    try { await api.removeMember(id); refetch(); } catch {}
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading access control...</p>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock style={{ width: '22px', height: '22px', color: '#EF4444' }} /> Access Control
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Manage roles and permissions · {(members || []).length} members
          </p>
        </div>
        <button onClick={() => refetch()} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
        </button>
      </div>

      {/* Invite */}
      <div style={{ padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', display: 'block', marginBottom: '5px' }}>Invite Member</label>
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@example.com" style={{ width: '100%', padding: '9px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none' }}>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
        <button onClick={handleInvite} disabled={!inviteEmail || inviting} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: inviteEmail ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', opacity: inviteEmail ? 1 : 0.5 }}>
          <UserPlus style={{ width: '13px', height: '13px' }} /> {inviting ? 'Inviting...' : 'Invite'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
        </div>
      )}

      {/* Role groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(roleConfig).map(([role, cfg]) => {
          const groupMembers = roleGroups[role] || [];
          if (groupMembers.length === 0 && !['owner', 'admin', 'member', 'viewer'].includes(role)) return null;
          return (
            <div key={role} style={{ padding: '20px 22px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: cfg.color }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Shield style={{ width: '16px', height: '16px', color: cfg.color }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: cfg.color, margin: 0, textTransform: 'capitalize' }}>{role}</h3>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginLeft: 'auto' }}>
                  <Users style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                  {groupMembers.length} user{groupMembers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: groupMembers.length > 0 ? '12px' : 0 }}>
                {cfg.perms.map(p => <span key={p} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', backgroundColor: `${cfg.color}10`, color: cfg.color, fontWeight: 500 }}>{p}</span>)}
              </div>
              {groupMembers.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(var(--border), 0.15)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {groupMembers.map((m: any) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}AA)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
                        {(m.name || m.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{m.name || '—'}</p>
                        <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '1px 0 0' }}>{m.email}</p>
                      </div>
                      {role !== 'owner' && (
                        <button onClick={() => handleRemove(m.id)} style={{ padding: '4px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
