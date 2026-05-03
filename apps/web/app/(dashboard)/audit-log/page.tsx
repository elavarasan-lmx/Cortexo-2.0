'use client';

import { useState } from 'react';
import {
  FileText, Search, Filter, Download, User, Server,
  Rocket, Shield, Bug, Settings, Calendar, Clock,
} from 'lucide-react';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

const logs = [
  { id: 1, user: 'Jerry', action: 'Deployed WinBull Web', type: 'deploy', target: 'prod-api-01', time: '2025-05-02 14:30', ip: '103.21.58.92' },
  { id: 2, user: 'Tom', action: 'Resolved Bug #BUG-0042', type: 'bug', target: 'Rate Engine', time: '2025-05-02 12:15', ip: '192.168.1.50' },
  { id: 3, user: 'System', action: 'SSL Certificate Renewed', type: 'security', target: 'vijaybullion.com', time: '2025-05-02 03:00', ip: '0.0.0.0' },
  { id: 4, user: 'Jerry', action: 'Added Server prod-db-02', type: 'server', target: 'Infrastructure', time: '2025-05-01 18:00', ip: '103.21.58.92' },
  { id: 5, user: 'Tom', action: 'Updated Settings: Dark Mode ON', type: 'settings', target: 'Platform', time: '2025-05-01 16:30', ip: '192.168.1.50' },
  { id: 6, user: 'Jerry', action: 'Created Cron: Weekly Report', type: 'server', target: 'prod-api-01', time: '2025-05-01 14:00', ip: '103.21.58.92' },
  { id: 7, user: 'System', action: 'Backup Completed', type: 'server', target: 'prod-db-01', time: '2025-05-01 02:00', ip: '0.0.0.0' },
  { id: 8, user: 'Jerry', action: 'Deployed Rate Engine v2.1', type: 'deploy', target: 'prod-api-01', time: '2025-04-30 20:00', ip: '103.21.58.92' },
  { id: 9, user: 'Tom', action: 'Added Client: GoldTrend', type: 'settings', target: 'Clients', time: '2025-04-30 15:00', ip: '192.168.1.50' },
  { id: 10, user: 'System', action: 'Auto-scaled server resources', type: 'server', target: 'prod-api-01', time: '2025-04-30 08:00', ip: '0.0.0.0' },
];

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  deploy:   { icon: Rocket, color: '#3B82F6', label: 'Deploy' },
  bug:      { icon: Bug, color: '#EF4444', label: 'Bug' },
  security: { icon: Shield, color: '#10B981', label: 'Security' },
  server:   { icon: Server, color: '#F97316', label: 'Server' },
  settings: { icon: Settings, color: '#8B5CF6', label: 'Settings' },
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = logs.filter(l => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Audit Log</h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Track all platform activity and changes</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', cursor: 'pointer' }}>
          <Download style={{ width: '13px', height: '13px' }} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', outline: 'none' }}
          />
        </div>
        {['all', 'deploy', 'bug', 'security', 'server', 'settings'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            border: filter === f ? 'none' : '1px solid rgb(var(--border))',
            backgroundColor: filter === f ? 'rgb(var(--primary))' : 'transparent',
            color: filter === f ? '#fff' : 'rgb(var(--text-muted))',
            textTransform: 'capitalize',
          }}>{f === 'all' ? 'All' : typeConfig[f]?.label || f}</button>
        ))}
      </div>

      {/* Log Table */}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(var(--border),0.15)' }}>
              {['Type', 'User', 'Action', 'Target', 'Time', 'IP'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const tc = typeConfig[l.type] || typeConfig.settings;
              const TIcon = tc.icon;
              return (
                <tr key={l.id} style={{ borderBottom: '1px solid rgba(var(--border),0.06)', transition: 'background-color 120ms' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(var(--primary),0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: `${tc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TIcon style={{ width: '11px', height: '11px', color: tc.color }} />
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: tc.color, textTransform: 'uppercase' }}>{tc.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{l.user}</td>
                  <td style={{ padding: '12px 20px', fontSize: '12px', color: 'rgb(var(--text-primary))' }}>{l.action}</td>
                  <td style={{ padding: '12px 20px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{l.target}</td>
                  <td style={{ padding: '12px 20px', fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{l.time}</td>
                  <td style={{ padding: '12px 20px', fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{l.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <FileText style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', marginBottom: '8px' }} />
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No logs match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
