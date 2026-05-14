'use client';
import { useState } from 'react';
import { Users, Search, Shield, MoreHorizontal, Loader2, ChevronLeft, ChevronRight, UserCheck, Ban, type LucideIcon } from 'lucide-react';
import { OrgMember, api } from '@/lib/api';
import { useCortexoQuery } from '@/lib/hooks';

const rc: Record<string, string> = { owner: '#A78BFA', admin: '#3B82F6', developer: '#10B981', member: '#F59E0B', viewer: '#6B7280', 'super admin': '#7C3AED' };
const avatarColors = ['#7C3AED', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#F97316'];




export default function UsersPage() {
  const [searchQ, setSearchQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const { data: rawUsers, isLoading: loading, refetch } = useCortexoQuery(
    ['users'],
    () => api.getUsers(),
  );

  const apiUsers = (rawUsers || []).map((u: OrgMember) => ({
    id: u.id,
    name: u.name || 'User',
    email: u.email || '—',
    role: (u.role || 'member'),
    status: u.status || 'active',
    lastActive: '—',
    createdAt: u.createdAt,
  }));

  const users = apiUsers;

  const filtered = users.filter((u: OrgMember) => {
    if (searchQ && !u.name.toLowerCase().includes(searchQ.toLowerCase()) && !u.email.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (roleFilter !== 'All Roles' && u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (statusFilter !== 'All Status' && (u.status ?? '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const stats = [
    { label: 'Total Users', value: users.length, sub: `${users.length} registered`, color: '#7C3AED', Icon: Users },
    { label: 'Active Now', value: users.filter((u: OrgMember) => u.status === 'active').length, sub: 'Online', color: '#10B981', Icon: UserCheck },
    { label: 'Suspended', value: users.filter((u: OrgMember) => u.status === 'suspended').length, sub: 'Blocked', color: '#EF4444', Icon: Ban },
    { label: 'Super Admins', value: users.filter((u: OrgMember) => u.role.toLowerCase() === 'super admin').length, sub: 'Full access', color: '#8B5CF6', Icon: Shield },
  ];



  const statusDot = (s: string) => {
    const c = s === 'active' ? '#10B981' : s === 'suspended' ? '#EF4444' : '#F59E0B';
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: c, textTransform: 'capitalize' as const }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: c, display: 'inline-block' }} />
        {s}
      </span>
    );
  };

  return (
    <div className="cx-flex-col" style={{ gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users style={{ width: '24px', height: '24px', color: '#7C3AED' }} /> User Management
        </h1>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
          Manage platform users, roles, and access permissions.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {stats.map((s, i) => (
          <div key={i} className="cx-card cx-border" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: s.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><s.Icon style={{ width: '12px', height: '12px' }} /> {s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input
            placeholder="Search users..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{ width: '100%', padding: '8px 14px 8px 34px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--card))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="cx-input" style={{ cursor: 'pointer' }}>
          <option>All Roles</option>
          {['Super Admin', 'Admin', 'Developer', 'Member', 'Viewer'].map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="cx-input" style={{ cursor: 'pointer' }}>
          <option>All Status</option>
          {['Active', 'Pending', 'Suspended'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading users...</p>
        </div>
      ) : (
        <div className="cx-card cx-border" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                {['User', 'Role', 'Status', 'Last Active', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: OrgMember, idx: number) => {
                const roleColor = rc[u.role.toLowerCase()] || '#6B7280';
                const avColor = avatarColors[idx % avatarColors.length];
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(var(--border), 0.5)', transition: 'background 150ms', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.08)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="cx-flex cx-items-center cx-gap-12">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${avColor}, ${avColor}CC)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{u.name}</div>
                          <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: roleColor, padding: '4px 10px', borderRadius: '6px', backgroundColor: `${roleColor}15`, textTransform: 'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{statusDot(u.status ?? 'unknown')}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{u.lastActive || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: 'rgb(var(--text-muted))' }}>No users match your filters</td></tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid rgb(var(--border))' }}>
            <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))' }}>
              Showing {filtered.length} of {users.length} users
            </span>
            <div className="cx-flex cx-gap-6">
              <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ChevronLeft style={{ width: '14px', height: '14px' }} /> Back
              </button>
              <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>1</button>
              <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Next <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
