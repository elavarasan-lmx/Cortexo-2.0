'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity, Search, Filter, ChevronLeft, ChevronRight, Clock,
  User, FileText, Server, Shield, Eye, Edit3, Trash2, Upload,
  Download, RefreshCw, Loader2, Globe, Terminal, FolderSync,
  AlertTriangle, CheckCircle, XCircle, Zap, LayoutGrid, List,
  Calendar, X,
} from 'lucide-react';
import { AuditLog, api } from '@/lib/api';

const ACTION_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
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
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stats, setStats] = useState<{ last24h?: number; topUsers?: { userName: string; count: number }[] } | null>(null);
  const limit = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo + 'T23:59:59').toISOString();
      const res = await api.getAuditLogs(params);
      setLogs(res.data || []);
      setTotal(res.total || 0);
    } catch { setLogs([]); }
    setLoading(false);
  }, [page, search, actionFilter, resourceFilter, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getAuditStats();
      setStats(res.data || null);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalPages = Math.ceil(total / limit) || 1;
  const uniqueActions = [...new Set(logs.map((l: AuditLog) => l.action))].sort();
  const uniqueResources = [...new Set(logs.map((l: AuditLog) => l.resource))].filter(Boolean).sort();

  return (
    <div>
      {/* Header */}
      <div className="cx-page-header cx-mb-24">
        <div>
          <h1 className="cx-flex cx-items-center cx-gap-10 cx-page-title">
            <Activity style={{ width: '24px', height: '24px' }} className="cx-text-accent" />
            Audit Log
          </h1>
          <p className="cx-page-subtitle">
            {total} events tracked · complete activity trail
          </p>
        </div>
        <button onClick={() => { fetchLogs(); fetchStats(); }} className="cx-btn-secondary" style={{ gap: '6px', padding: '10px 16px' }}>
          <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div className="cx-card-sm cx-border" style={{ padding: '16px 20px' }}>
            <div className="cx-label" style={{ marginBottom: '6px' }}>Last 24h</div>
            <div className="cx-fw-800 cx-text-28 cx-text-accent">{stats.last24h || 0}</div>
          </div>
          <div className="cx-card-sm cx-border" style={{ padding: '16px 20px' }}>
            <div className="cx-label" style={{ marginBottom: '6px' }}>Total Events</div>
            <div className="cx-fw-800 cx-text-28 cx-text-primary">{total}</div>
          </div>
          {stats.topUsers?.slice(0, 2).map((u: { userName: string; count: number }) => (
            <div key={u.userName} className="cx-card-sm cx-border" style={{ padding: '16px 20px' }}>
              <div className="cx-label" style={{ marginBottom: '6px' }}>{u.userName}</div>
              <div className="cx-fw-800 cx-text-28 cx-text-primary">{u.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="cx-flex cx-gap-10" style={{ marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="cx-search-wrap" style={{ flex: '1 1 240px' }}>
          <Search className="cx-search-icon" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search descriptions..."
            className="cx-search-input" style={{ boxSizing: 'border-box' }}
          />
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="cx-search-input" style={{ padding: '10px 14px', minWidth: '140px', flex: 'none' }}>
          <option value="">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={resourceFilter} onChange={e => { setResourceFilter(e.target.value); setPage(1); }}
          className="cx-search-input" style={{ padding: '10px 14px', minWidth: '140px', flex: 'none' }}>
          <option value="">All Resources</option>
          {uniqueResources.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
        </select>

        {/* Date Range */}
        <div className="cx-flex cx-items-center cx-gap-6">
          <Calendar style={{ width: '14px', height: '14px', flexShrink: 0 }} className="cx-text-muted" />
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="cx-search-input" style={{ padding: '9px 10px', fontSize: '12px', width: 'auto' }}
          />
          <span className="cx-text-12 cx-text-muted cx-fw-600">&rarr;</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="cx-search-input" style={{ padding: '9px 10px', fontSize: '12px', width: 'auto' }}
          />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
              title="Clear dates"
              className="cx-flex-center cx-r-6 cx-surface-hover cx-border cx-text-muted cx-transition-fast"
              style={{ width: '28px', height: '28px', cursor: 'pointer' }}>
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Log List */}
      {loading ? (
        <div className="cx-loading" style={{ height: '200px' }}>
          <Loader2 className="cx-spinner" style={{ width: '28px', height: '28px' }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="cx-empty cx-text-muted" style={{ padding: '60px 20px' }}>
          <Activity style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
          <p className="cx-fw-600" style={{ fontSize: '15px' }}>No audit logs found</p>
          <p style={{ fontSize: '13px' }}>Activity will appear here as you use the platform</p>
        </div>
      ) : (
        <div className="cx-table-wrap">
          {logs.map((log: AuditLog, i: number) => {
            const IconComp = ACTION_ICONS[log.action] || Terminal;
            const color = ACTION_COLORS[log.action] || '#94A3B8';
            return (
              <div key={log.id || i} className="cx-flex cx-items-start cx-gap-14" style={{
                padding: '14px 18px',
                borderBottom: i < logs.length - 1 ? '1px solid rgb(var(--border))' : 'none',
                transition: 'background-color 150ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Icon */}
                <div className="cx-flex-center cx-r-8" style={{
                  width: '34px', height: '34px', flexShrink: 0,
                  background: `${color}15`, border: `1px solid ${color}25`, marginTop: '2px',
                }}>
                  <IconComp style={{ width: '16px', height: '16px', color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cx-flex cx-items-center cx-gap-8" style={{ flexWrap: 'wrap' }}>
                    <span className="cx-fw-700" style={{
                      padding: '2px 8px', borderRadius: '5px', fontSize: '10px',
                      textTransform: 'uppercase', letterSpacing: '0.03em',
                      backgroundColor: `${color}15`, color, border: `1px solid ${color}25`,
                    }}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                    {log.resource && (
                      <span className="cx-text-muted cx-mono cx-text-11">
                        {log.resource?.replace(/_/g, ' ')}
                      </span>
                    )}
                    {log.resourceId && (
                      <span className="cx-text-muted cx-mono" style={{ fontSize: '10px', opacity: 0.6 }}>
                        #{log.resourceId}
                      </span>
                    )}
                  </div>
                  <p className="cx-text-primary cx-text-13" style={{ margin: '4px 0 0', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {log.description || '—'}
                  </p>
                  {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                    <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap', marginTop: '6px' }}>
                      {Object.entries(log.metadata).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="cx-text-muted cx-mono" style={{
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: 'rgba(var(--border), 0.4)',
                        }}>
                          {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meta — right side */}
                <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '90px' }}>
                  <div className="cx-flex cx-items-center cx-gap-4 cx-text-muted cx-text-11" style={{ justifyContent: 'flex-end' }}>
                    <Clock style={{ width: '10px', height: '10px' }} />
                    {timeAgo(log.createdAt)}
                  </div>
                  <div className="cx-flex cx-items-center cx-gap-4 cx-text-muted" style={{ fontSize: '10px', marginTop: '4px', justifyContent: 'flex-end' }}>
                    <User style={{ width: '10px', height: '10px' }} />
                    {log.userName || 'System'}
                  </div>
                  {log.ipAddress && (
                    <div className="cx-text-muted cx-mono" style={{ fontSize: '9px', marginTop: '2px', opacity: 0.5 }}>
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
        <div className="cx-flex-center cx-gap-12" style={{ marginTop: '20px' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="cx-btn-secondary cx-gap-4 cx-text-12 cx-fw-600" style={{ padding: '8px 14px', opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} /> Prev
          </button>
          <span className="cx-text-12 cx-text-muted cx-fw-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="cx-btn-secondary cx-gap-4 cx-text-12 cx-fw-600" style={{ padding: '8px 14px', opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>
            Next <ChevronRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}
    </div>
  );
}
