'use client';
import { Users, UserPlus, Search, Mail, Shield, MoreHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const rc: Record<string, string> = { owner: '#A78BFA', admin: '#3B82F6', developer: '#10B981', member: '#F59E0B', viewer: '#6B7280' };

export default function UsersPage() {
  useAutoLoadToken();
  const { data: rawUsers, loading, error, refetch } = useApiData(
    () => api.getUsers(),
    { default: [] as any[] }
  );

  const users = (rawUsers || []).map((u: any) => ({
    id: u.id,
    name: u.name || 'User',
    email: u.email || '—',
    role: (u.role || 'member').toLowerCase(),
    status: u.status || 'active',
    avatar: (u.name || 'U').charAt(0).toUpperCase(),
    createdAt: u.createdAt,
  }));

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ width: '22px', height: '22px', color: '#3B82F6' }} /> User Management
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Manage platform users and permissions{users.length > 0 ? ` · ${users.length} users` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
            <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,rgb(var(--primary)),#818CF8)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <UserPlus style={{ width: '14px', height: '14px' }} /> Add User
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading users...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                {['User', 'Role', 'Status', 'Joined', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => {
                const col = rc[u.role] || '#6B7280';
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgb(var(--border))', transition: 'background 150ms', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg,${col},${col}AA)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700 }}>{u.avatar}</div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{u.name}</p>
                          <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '1px 0 0' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: col, padding: '3px 8px', borderRadius: '6px', backgroundColor: `${col}12`, textTransform: 'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: u.status === 'active' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button style={{ padding: '4px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
                        <MoreHorizontal style={{ width: '14px', height: '14px' }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: 'rgb(var(--text-muted))' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
