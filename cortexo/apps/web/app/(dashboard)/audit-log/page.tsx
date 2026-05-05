'use client';

import { useState } from 'react';
import {
  FileText, Search, Filter, Download, User, Server,
  Rocket, Shield, Bug, Settings, Calendar, Clock, Loader2,
} from 'lucide-react';
import { api, type AuditLog } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  deploy:   { icon: Rocket, color: '#3B82F6', label: 'Deploy' },
  bug:      { icon: Bug, color: '#EF4444', label: 'Bug' },
  security: { icon: Shield, color: '#10B981', label: 'Security' },
  server:   { icon: Server, color: '#F97316', label: 'Server' },
  settings: { icon: Settings, color: '#8B5CF6', label: 'Settings' },
  create:   { icon: Rocket, color: '#3B82F6', label: 'Create' },
  update:   { icon: Settings, color: '#F59E0B', label: 'Update' },
  delete:   { icon: Bug, color: '#EF4444', label: 'Delete' },
  login:    { icon: User, color: '#10B981', label: 'Login' },
};

function inferType(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('deploy') || a.includes('rollback')) return 'deploy';
  if (a.includes('bug') || a.includes('error') || a.includes('delete')) return 'delete';
  if (a.includes('login') || a.includes('register') || a.includes('auth')) return 'login';
  if (a.includes('server') || a.includes('mount')) return 'server';
  if (a.includes('create') || a.includes('add')) return 'create';
  if (a.includes('update') || a.includes('edit') || a.includes('change')) return 'update';
  if (a.includes('setting') || a.includes('config')) return 'settings';
  if (a.includes('ssl') || a.includes('cert') || a.includes('security')) return 'security';
  return 'settings';
}

export default function AuditLogPage() {
  useAutoLoadToken();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: logs, loading, error, refetch } = useApiData(
    () => api.getAuditLogs(),
    { default: [] as AuditLog[] }
  );

  const filtered = (logs || []).filter((l: AuditLog) => {
    const matchSearch = (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.resource || '').toLowerCase().includes(search.toLowerCase());
    const inferredType = inferType(l.action || '');
    const matchFilter = filter === 'all' || inferredType === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Audit Log</h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Track all platform activity and changes
            {logs && logs.length > 0 && <span> · {logs.length} entries</span>}
          </p>
        </div>
        <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', cursor: 'pointer' }}>
          <Download style={{ width: '13px', height: '13px' }} /> Refresh
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
        {['all', 'deploy', 'create', 'update', 'delete', 'login', 'server', 'security', 'settings'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            border: filter === f ? 'none' : '1px solid rgb(var(--border))',
            backgroundColor: filter === f ? 'rgb(var(--primary))' : 'transparent',
            color: filter === f ? '#fff' : 'rgb(var(--text-muted))',
            textTransform: 'capitalize',
          }}>{f === 'all' ? 'All' : typeConfig[f]?.label || f}</button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '8px 0 0' }}>Loading audit logs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {/* Log Table */}
      {!loading && !error && (
        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(var(--border),0.15)' }}>
                {['Type', 'User', 'Action', 'Resource', 'Time', 'ID'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l: AuditLog) => {
                const type = inferType(l.action || '');
                const tc = typeConfig[type] || typeConfig.settings;
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
                    <td style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{l.userName || 'System'}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'rgb(var(--text-primary))' }}>{l.action}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{l.resource}{l.resourceId ? ` #${l.resourceId.slice(0, 8)}` : ''}</td>
                    <td style={{ padding: '12px 20px', fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{l.createdAt ? new Date(l.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '12px 20px', fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{l.id?.slice(0, 8) || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <FileText style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                {logs && logs.length === 0 ? 'No audit logs yet — actions will appear here' : 'No logs match your search'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
