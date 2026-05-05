'use client';
import { Users, Mail, Shield, UserPlus, Crown, UserCheck, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const roleIcons: Record<string, typeof Crown> = { owner: Crown, admin: Shield, developer: UserCheck, member: Users, viewer: Users };
const roleColors: Record<string, string> = { owner: '#A78BFA', admin: '#3B82F6', developer: '#10B981', member: '#F59E0B', viewer: '#6B7280' };
const gradients = ['#A78BFA', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#F97316', '#6B7280'];

export default function TeamPage() {
  useAutoLoadToken();

  const { data: users, loading, error, refetch } = useApiData(
    () => api.getUsers(),
    { default: [] as any[] }
  );

  const members = (users || []).map((u: any, i: number) => ({
    id: u.id || i,
    name: u.name || 'User',
    email: u.email || '—',
    role: (u.role || 'member').toLowerCase(),
    status: u.status || 'active',
    avatar: (u.name || 'U').charAt(0).toUpperCase(),
    color: roleColors[(u.role || 'member').toLowerCase()] || gradients[i % gradients.length],
    createdAt: u.createdAt,
  }));

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ width: '22px', height: '22px', color: '#3B82F6' }} /> Team Members
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Manage team access and roles{members.length > 0 ? ` · ${members.length} members` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
            <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), #818CF8)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <UserPlus style={{ width: '14px', height: '14px' }} /> Invite Member
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading team...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {members.map((m: any) => {
            const Ic = roleIcons[m.role] || Users;
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', transition: 'all 200ms', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `linear-gradient(135deg, ${m.color}, ${m.color}AA)`, color: '#fff', fontSize: '16px', fontWeight: 700 }}>{m.avatar}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{m.name}</h3>
                  <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}><Mail style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{m.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: `${m.color}12` }}>
                  <Ic style={{ width: '12px', height: '12px', color: m.color }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: m.color, textTransform: 'capitalize' }}>{m.role}</span>
                </div>
                {m.createdAt && <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>Joined {new Date(m.createdAt).toLocaleDateString()}</span>}
                <span style={{ fontSize: '10px', fontWeight: 600, color: m.status === 'active' ? '#10B981' : '#F59E0B', textTransform: 'capitalize', padding: '3px 8px', borderRadius: '6px', backgroundColor: m.status === 'active' ? '#10B98112' : '#F59E0B12' }}>{m.status}</span>
              </div>
            );
          })}
          {members.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <Users style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No team members yet — invite your first member</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
