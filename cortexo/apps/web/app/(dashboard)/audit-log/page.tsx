'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity, Search, Filter, ChevronLeft, ChevronRight, Clock,
  User, FileText, Server, Shield, Eye, Edit3, Trash2, Upload,
  Download, RefreshCw, Loader2, Globe, Terminal, FolderSync,
  AlertTriangle, CheckCircle, XCircle, Zap, LayoutGrid, List,
  Calendar, X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

const ACTION_ICONS: Record<string, any> = {
  file_browse: FolderSync, file_read: Eye, file_modified: Edit3,
  set_readonly: Shield, set_readwrite: Shield,
  deploy_start: Upload, deploy_complete: CheckCircle, deploy_fail: XCircle,
  mount: Server, unmount: Server,
  create: Zap, update: Edit3, delete: Trash2,
  login: User, logout: User,
};

const ACTION_COLORS: Record<string, string> = {
  file_browse: '#818CF8', file_read: '#60A5FA', file_modified: '#F59E0B',
  set_readonly: '#F97316', set_readwrite: '#10B981',
  deploy_start: '#8B5CF6', deploy_complete: '#10B981', deploy_fail: '#EF4444',
  mount: '#06B6D4', unmount: '#94A3B8',
  create: '#10B981', update: '#3B82F6', delete: '#EF4444',
  login: '#22D3EE', logout: '#94A3B8',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AuditLogPage() {
  useAutoLoadToken();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stats, setStats] = useState<any>(null);
  const limit = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo + 'T23:59:59').toISOString();
      const res = await api.getAuditLogs(params);
      setLogs((res as any).data || []);
      setTotal((res as any).total || 0);
    } catch { setLogs([]); }
    setLoading(false);
  }, [page, search, actionFilter, resourceFilter, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getAuditStats();
      setStats((res as any).data || res);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalPages = Math.ceil(total / limit) || 1;
  const uniqueActions = [...new Set(logs.map((l: any) => l.action))].sort();
  const uniqueResources = [...new Set(logs.map((l: any) => l.resource))].filter(Boolean).sort();

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))' }} />
            Audit Log
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            {total} events tracked · complete activity trail
          </p>
        </div>
        <button onClick={() => { fetchLogs(); fetchStats(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>
          <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>Last 24h</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'rgb(var(--primary))' }}>{stats.last24h || 0}</div>
          </div>
          <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>Total Events</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>{total}</div>
          </div>
          {stats.topUsers?.slice(0, 2).map((u: any) => (
            <div key={u.userName} style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>{u.userName}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>{u.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search descriptions..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px 10px 36px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none' }}
          />
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', cursor: 'pointer', minWidth: '140px' }}>
          <option value="">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={resourceFilter} onChange={e => { setResourceFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', cursor: 'pointer', minWidth: '140px' }}>
          <option value="">All Resources</option>
          {uniqueResources.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
        </select>

        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
          <input
            type="date" value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            style={{ padding: '9px 10px', fontSize: '12px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontWeight: 600 }}>→</span>
          <input
            type="date" value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            style={{ padding: '9px 10px', fontSize: '12px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', cursor: 'pointer' }}
          />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
              title="Clear dates"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-muted))', cursor: 'pointer', flexShrink: 0 }}>
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Log List */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <Loader2 style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgb(var(--text-muted))' }}>
          <Activity style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600 }}>No audit logs found</p>
          <p style={{ fontSize: '13px' }}>Activity will appear here as you use Cortexo</p>
        </div>
      ) : (
        <div style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
          {logs.map((log: any, i: number) => {
            const IconComp = ACTION_ICONS[log.action] || Terminal;
            const color = ACTION_COLORS[log.action] || '#94A3B8';
            return (
              <div key={log.id || i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 18px',
                borderBottom: i < logs.length - 1 ? '1px solid rgb(var(--border))' : 'none',
                transition: 'background-color 150ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Icon */}
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                  background: `${color}15`, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px',
                }}>
                  <IconComp style={{ width: '16px', height: '16px', color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.03em',
                      backgroundColor: `${color}15`, color, border: `1px solid ${color}25`,
                    }}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                    {log.resource && (
                      <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>
                        {log.resource?.replace(/_/g, ' ')}
                      </span>
                    )}
                    {log.resourceId && (
                      <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace", opacity: 0.6 }}>
                        #{log.resourceId}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', margin: '4px 0 0', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {log.description || '—'}
                  </p>
                  {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {Object.entries(log.metadata).slice(0, 4).map(([k, v]) => (
                        <span key={k} style={{
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: 'rgba(var(--border), 0.4)', color: 'rgb(var(--text-muted))',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meta — right side */}
                <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '90px' }}>
                  <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <Clock style={{ width: '10px', height: '10px' }} />
                    {timeAgo(log.createdAt)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <User style={{ width: '10px', height: '10px' }} />
                    {log.userName || 'System'}
                  </div>
                  {log.ipAddress && (
                    <div style={{ fontSize: '9px', color: 'rgb(var(--text-muted))', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace", opacity: 0.5 }}>
                      {log.ipAddress}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} /> Prev
          </button>
          <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>
            Next <ChevronRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}
    </div>
  );
}
