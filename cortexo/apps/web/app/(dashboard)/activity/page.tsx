'use client';
import { Activity, Clock, Loader2, RefreshCw } from 'lucide-react';
import { api, type AuditLog } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const typeColors: Record<string, string> = { deploy: '#10B981', config: '#3B82F6', system: '#818CF8', git: '#F59E0B', security: '#EF4444', create: '#10B981', update: '#3B82F6', delete: '#EF4444', login: '#818CF8' };
const typeEmoji: Record<string, string> = { deploy: '🚀', config: '⚙️', system: '📈', git: '🔀', security: '🔒', create: '✨', update: '📝', delete: '🗑', login: '🔑' };

function inferType(action: string): string {
  const a = (action || '').toLowerCase();
  if (a.includes('deploy') || a.includes('rollback')) return 'deploy';
  if (a.includes('config') || a.includes('setting') || a.includes('update')) return 'config';
  if (a.includes('login') || a.includes('register') || a.includes('auth')) return 'login';
  if (a.includes('ssl') || a.includes('cert') || a.includes('security') || a.includes('2fa')) return 'security';
  if (a.includes('git') || a.includes('merge') || a.includes('pr')) return 'git';
  if (a.includes('create') || a.includes('add')) return 'create';
  if (a.includes('delete') || a.includes('remove')) return 'delete';
  return 'system';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ActivityPage() {
  useAutoLoadToken();
  const { data: logs, loading, error, refetch } = useApiData(
    () => api.getAuditLogs(),
    { default: [] as AuditLog[] }
  );

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity style={{ width: '22px', height: '22px', color: '#818CF8' }} /> Activity Log
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Complete audit trail of all platform activity
            {logs && logs.length > 0 && ` · ${logs.length} events`}
          </p>
        </div>
        <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
          <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading activity...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ position: 'relative', paddingLeft: '28px' }}>
          <div style={{ position: 'absolute', left: '13px', top: '0', bottom: '0', width: '2px', backgroundColor: 'rgb(var(--border))' }} />
          {(logs || []).map((l: AuditLog) => {
            const type = inferType(l.action || '');
            const col = typeColors[type] || '#6B7280';
            const emoji = typeEmoji[type] || '📌';
            return (
              <div key={l.id} style={{ position: 'relative', marginBottom: '16px', padding: '14px 18px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', marginLeft: '16px', transition: 'all 200ms' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ position: 'absolute', left: '-24px', top: '18px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgb(var(--surface))', border: `2px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>{emoji}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: col }}>{l.userName || 'System'}</span>
                  <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))' }}>{l.action}</span>
                  {l.resource && <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{l.resource}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgb(var(--text-muted))', whiteSpace: 'nowrap' }}>
                    <Clock style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                    {l.createdAt ? timeAgo(l.createdAt) : '—'}
                  </span>
                </div>
              </div>
            );
          })}
          {(logs || []).length === 0 && (
            <div style={{ marginLeft: '16px', padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <Activity style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No activity yet — actions will appear here in real-time</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
