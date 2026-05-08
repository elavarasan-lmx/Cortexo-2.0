'use client';

import { useState } from 'react';
import {
  Search, Download, Loader2, FileText, ChevronLeft, ChevronRight, ScrollText
} from 'lucide-react';
import { api, type AuditLog } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '12px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--card))', overflow: 'hidden',
};

function inferType(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('deploy') || a.includes('resolve') || a.includes('ok')) return 'deploy';
  if (a.includes('delete') || a.includes('remove') || a.includes('fail') || a.includes('error')) return 'delete';
  if (a.includes('login') || a.includes('auth')) return 'login';
  if (a.includes('update') || a.includes('edit') || a.includes('config')) return 'update';
  if (a.includes('create') || a.includes('add') || a.includes('trigger')) return 'create';
  return 'default';
}

function ActionBadge({ action }: { action: string }) {
  const type = inferType(action);
  let bg = '', color = '';
  switch (type) {
    case 'deploy': bg = 'rgba(16, 185, 129, 0.1)'; color = '#10B981'; break;
    case 'delete': bg = 'rgba(239, 68, 68, 0.1)'; color = '#EF4444'; break;
    case 'login': bg = 'rgba(59, 130, 246, 0.1)'; color = '#3B82F6'; break;
    case 'update': bg = 'rgba(245, 158, 11, 0.1)'; color = '#F59E0B'; break;
    case 'create': bg = 'rgba(139, 92, 246, 0.1)'; color = '#8B5CF6'; break;
    default: bg = 'rgba(100, 116, 139, 0.1)'; color = '#64748B'; break;
  }
  return (
    <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', backgroundColor: bg, color: color, fontSize: '11px', fontWeight: 600 }}>
      {action}
    </span>
  );
}

function StatusIndicator({ status }: { status: 'OK' | 'WARN' | 'AUDIT' }) {
  let color = '';
  switch (status) {
    case 'OK': color = '#10B981'; break;
    case 'WARN': color = '#EF4444'; break;
    case 'AUDIT': color = '#F59E0B'; break;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />
      <span style={{ fontSize: '12px', fontWeight: 600, color }}>{status}</span>
    </div>
  );
}

// Mock data to match the design spec if API is empty
const MOCK_LOGS = [
  { id: '1', createdAt: '2024-05-01T18:42:15Z', userId: 'jerry@cortexo.io', action: 'deploy.trigger', resource: 'aone-prod -> v3.3.1 (canary)', metadata: { ip: '192.168.1.42', status: 'OK' } },
  { id: '2', createdAt: '2024-05-01T18:38:00Z', userId: 'tom@cortexo.io', action: 'server.delete', resource: 'staging-web-02 (IP: 10.0.2.15)', metadata: { ip: '10.0.0.1', status: 'WARN' } },
  { id: '3', createdAt: '2024-05-01T18:31:47Z', userId: 'jerry@cortexo.io', action: 'user.login', resource: 'Session started (2FA verified)', metadata: { ip: '192.168.1.42', status: 'OK' } },
  { id: '4', createdAt: '2024-05-01T18:25:12Z', userId: 'admin@cortexo.io', action: 'config.update', resource: 'Redis cache TTL -> 3600s (was 1800s)', metadata: { ip: '10.0.0.5', status: 'AUDIT' } },
  { id: '5', createdAt: '2024-05-01T18:18:30Z', userId: 'tom@cortexo.io', action: 'bug.resolve', resource: 'BUG-1022: Memory leak in worker pool', metadata: { ip: '10.0.0.1', status: 'OK' } },
  { id: '6', createdAt: '2024-05-01T18:10:22Z', userId: 'jerry@cortexo.io', action: 'cron.create', resource: 'DB backups job -> every 6h', metadata: { ip: '192.168.1.42', status: 'OK' } },
];

export default function AuditLogPage() {
  useAutoLoadToken();
  const [search, setSearch] = useState('');
  
  const { data: apiLogs, loading, error } = useApiData(
    () => api.getAuditLogs(),
    { default: [] as AuditLog[] }
  );

  const logs = apiLogs && apiLogs.length > 0 ? apiLogs : MOCK_LOGS;

  const filtered = logs.filter((l: any) => {
    const matchSearch = (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.userId || l.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.resource || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}, ${d.toTimeString().split(' ')[0]}`;
  };

  const selectStyle = {
    padding: '9px 32px 9px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', 
    backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '13px', 
    appearance: 'none' as const, outline: 'none', cursor: 'pointer',
    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%205l3%203%203-3%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")', 
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ScrollText style={{ width: '22px', height: '22px', color: 'rgb(var(--text-primary))' }} /> Audit Log
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Complete activity trail for compliance and debugging
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search audit events..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', fontSize: '13px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', outline: 'none' }}
          />
        </div>
        
        <select style={selectStyle}>
          <option value="all">All Actions</option>
        </select>

        <select style={selectStyle}>
          <option value="all">All Users</option>
        </select>

        <select style={selectStyle}>
          <option value="7days">Last 7 Days</option>
        </select>

        <button style={{ padding: '9px 16px', borderRadius: '8px', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6D28D9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7C3AED'}>
          Export CSV
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '12px 0 0' }}>Loading audit logs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && apiLogs && apiLogs.length === 0 && (
        <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
        </div>
      )}

      {/* Log Table */}
      {!loading && (
        <div style={card}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(var(--border),0.4)' }}>
                  {['Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Status'].map(h => (
                    <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l: any, idx: number) => {
                  const ip = l.metadata?.ip || '192.168.1.1';
                  const status = l.metadata?.status || 'OK';
                  return (
                    <tr key={l.id || idx} style={{ borderBottom: '1px solid rgba(var(--border),0.2)', transition: 'background-color 120ms' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(var(--primary),0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <td style={{ padding: '16px 20px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                        {formatDate(l.createdAt)}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'rgb(var(--text-primary))' }}>
                        {l.userId || l.userName || 'System'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <ActionBadge action={l.action} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'rgb(var(--text-muted))' }}>
                        {l.resource}{l.resourceId ? ` #${l.resourceId.slice(0, 8)}` : ''}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>
                        {ip}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <StatusIndicator status={status as any} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <FileText style={{ width: '32px', height: '32px', color: 'rgb(var(--border))', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                No audit logs found.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Showing 1-{filtered.length} of {logs.length} events
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChevronLeft style={{ width: '14px', height: '14px' }} /> Prev
            </button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>1</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid transparent', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '13px', cursor: 'pointer' }}>2</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid transparent', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '13px', cursor: 'pointer' }}>3</button>
            <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', padding: '0 4px' }}>...</span>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid transparent', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '13px', cursor: 'pointer' }}>74</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Next <ChevronRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

