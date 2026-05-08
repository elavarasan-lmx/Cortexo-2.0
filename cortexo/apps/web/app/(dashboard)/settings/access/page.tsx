'use client';
import { useState } from 'react';
import { Shield, Save, Loader2 } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const roles = [
  { id: 'super_admin', label: 'Super Admin', color: '#7C3AED' },
  { id: 'admin', label: 'Admin', color: '#3B82F6' },
  { id: 'developer', label: 'Developer', color: '#10B981' },
  { id: 'member', label: 'Member', color: '#F59E0B' },
  { id: 'guest', label: 'Guest', color: '#6B7280' },
];

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉', path: '/dashboard' },
  { id: 'deployments', label: 'Deployments', icon: '⬡', path: '/deployments' },
  { id: 'bug_tracker', label: 'Bug Tracker', icon: '🐛', path: '/bug-tracker' },
  { id: 'heartbeat', label: 'Heartbeat', icon: '💓', path: '/heartbeat' },
  { id: 'servers', label: 'Servers', icon: '🖥', path: '/servers' },
  { id: 'cron_jobs', label: 'Cron Jobs', icon: '⏰', path: '/cron-jobs' },
  { id: 'ai_agents', label: 'AI Agents', icon: '🤖', path: '/ai-agents' },
  { id: 'audit_log', label: 'Audit Log', icon: '📜', path: '/audit-log' },
  { id: 'api_keys', label: 'API Keys', icon: '🔑', path: '/settings/api-keys' },
];

const defaultPerms: Record<string, Record<string, boolean>> = {
  super_admin: Object.fromEntries(menuItems.map(m => [m.id, true])),
  admin: Object.fromEntries(menuItems.map(m => [m.id, true])),
  developer: Object.fromEntries(menuItems.map(m => [m.id, ['dashboard', 'deployments', 'bug_tracker', 'servers', 'cron_jobs'].includes(m.id)])),
  member: Object.fromEntries(menuItems.map(m => [m.id, ['dashboard', 'deployments', 'bug_tracker'].includes(m.id)])),
  guest: Object.fromEntries(menuItems.map(m => [m.id, m.id === 'dashboard'])),
};

const card: React.CSSProperties = {
  borderRadius: '12px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--card))', overflow: 'hidden',
};

export default function AccessControlPage() {
  useAutoLoadToken();
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [perms, setPerms] = useState(defaultPerms);

  const role = roles.find(r => r.id === selectedRole)!;
  const togglePerm = (menuId: string) => {
    setPerms(prev => ({
      ...prev,
      [selectedRole]: { ...prev[selectedRole], [menuId]: !prev[selectedRole][menuId] },
    }));
  };

  const selectAll = () => {
    setPerms(prev => ({
      ...prev,
      [selectedRole]: Object.fromEntries(menuItems.map(m => [m.id, true])),
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield style={{ width: '24px', height: '24px', color: '#7C3AED' }} /> Menu Access Control
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Control which menu items are available for each role across the platform.
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1E293B', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Save style={{ width: '14px', height: '14px' }} /> Save Permissions
        </button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Left: Role selector */}
        <div style={card}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Select Role</h3>
          </div>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px', border: 'none',
                  backgroundColor: selectedRole === r.id ? `${r.color}15` : 'transparent',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'background-color 150ms',
                }}
                onMouseEnter={e => { if (selectedRole !== r.id) e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.2)'; }}
                onMouseLeave={e => { if (selectedRole !== r.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: r.color }} />
                <span style={{
                  fontSize: '14px', fontWeight: selectedRole === r.id ? 700 : 500,
                  color: selectedRole === r.id ? r.color : 'rgb(var(--text-primary))',
                }}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Permissions */}
        <div style={card}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(var(--border),0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: role.color }}>{role.label} — Menu Permissions</h3>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Toggle access for each menu item.</p>
            </div>
            <button onClick={selectAll} style={{ fontSize: '13px', fontWeight: 600, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer' }}>Select All</button>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {menuItems.map((item, i) => {
              const enabled = perms[selectedRole]?.[item.id] ?? false;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < menuItems.length - 1 ? '1px solid rgba(var(--border),0.2)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{item.label}</span>
                  </div>
                  {/* Toggle switch */}
                  <button
                    onClick={() => togglePerm(item.id)}
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      backgroundColor: enabled ? '#7C3AED' : 'rgb(var(--border))',
                      position: 'relative', transition: 'background-color 200ms', padding: 0,
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
                      position: 'absolute', top: '3px', left: enabled ? '23px' : '3px',
                      transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
