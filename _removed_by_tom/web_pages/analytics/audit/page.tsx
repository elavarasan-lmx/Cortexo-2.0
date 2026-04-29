'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  History, RefreshCw, Filter, Search, ChevronLeft, ChevronRight,
  Rocket, Settings, Wand2, ShieldCheck, Bug, GitBranch, Database,
  UserCheck, Eye, Trash2, Edit3, LogIn, Key, Bell,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

interface AuditEntry {
  id: number;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  metadata?: string;
  ipAddress?: string;
  createdAt: string;
}

interface AuditStats {
  actionBreakdown: { action: string; count: number }[];
  last24h: number;
  topUsers: { userName: string; count: number }[];
}

const ACTION_ICONS: Record<string, { icon: typeof Rocket; color: string }> = {
  deploy:         { icon: Rocket,      color: '#818CF8' },
  provision:      { icon: Wand2,       color: '#EC4899' },
  login:          { icon: LogIn,       color: '#3B82F6' },
  menu_change:    { icon: Eye,         color: '#14B8A6' },
  error_resolve:  { icon: Bug,         color: '#10B981' },
  pipeline_run:   { icon: GitBranch,   color: '#F59E0B' },
  settings:       { icon: Settings,    color: '#6B7280' },
  db_migration:   { icon: Database,    color: '#06B6D4' },
  user_create:    { icon: UserCheck,   color: '#A78BFA' },
  ssl_check:      { icon: ShieldCheck, color: '#10B981' },
  api_key:        { icon: Key,         color: '#F97316' },
  notification:   { icon: Bell,        color: '#EF4444' },
  delete:         { icon: Trash2,      color: '#EF4444' },
  update:         { icon: Edit3,       color: '#F59E0B' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AuditPage() {
  useAutoLoadToken();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (actionFilter) params.action = actionFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await api.getAuditLogs(params);
      setLogs((res as any)?.data || []);
      setTotal((res as any)?.total || 0);
    } catch {
      setLogs([]);
    }
    setLoading(false);
  }, [page, actionFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getAuditStats();
      setStats(res as any);
    } catch {}
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalPages = Math.ceil(total / limit) || 1;
  const allActions = stats?.actionBreakdown?.map(a => a.action) || Object.keys(ACTION_ICONS);

  const inputStyle: React.CSSProperties = {
    padding: '7px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgba(var(--background), 0.5)', color: 'rgb(var(--text-primary))',
    fontSize: '12px', outline: 'none',
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Activity Log</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Track every action across your organization</p>
        </div>
        <button onClick={() => { fetchLogs(); fetchStats(); }} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>
          <RefreshCw style={{ width: '13px', height: '13px', animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Last 24 Hours" value={stats?.last24h ?? '—'} color="#818CF8" />
        <StatCard label="Total Actions" value={total} color="#10B981" />
        <StatCard label="Top Action" value={stats?.actionBreakdown?.[0]?.action || '—'} color="#F59E0B" />
        <StatCard label="Active Users" value={stats?.topUsers?.length ?? '—'} color="#A78BFA" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search logs..."
            style={{ ...inputStyle, width: '100%', paddingLeft: '32px' }} />
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          style={{ ...inputStyle, minWidth: '140px' }}>
          <option value="">All actions</option>
          {allActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Log table */}
      <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 120px 140px 100px 80px', gap: '12px', padding: '10px 16px', borderBottom: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--border), 0.05)' }}>
          {['', 'Description', 'Action', 'Resource', 'User', 'Time'].map(h => (
            <span key={h} style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))' }}>{h}</span>
          ))}
        </div>

        {logs.length === 0 && !loading && (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <History className="float-icon" style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>
              {total === 0 ? 'No audit logs yet — actions will appear here as they happen' : 'No matching results'}
            </p>
          </div>
        )}

        {logs.map(entry => {
          const cfg = ACTION_ICONS[entry.action] || { icon: History, color: 'rgb(var(--text-muted))' };
          const Icon = cfg.icon;
          return (
            <div key={entry.id}
              className="shimmer-hover"
              style={{ display: 'grid', gridTemplateColumns: '32px 1fr 120px 140px 100px 80px', gap: '12px', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid rgba(var(--border), 0.3)', transition: 'background-color 100ms' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${cfg.color}15` }}>
                <Icon style={{ width: '14px', height: '14px', color: cfg.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.description || `${entry.action.replace(/_/g, ' ')} on ${entry.resource}`}
                </p>
                {entry.resourceId && (
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>#{entry.resourceId}</span>
                )}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: `${cfg.color}10`, color: cfg.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {entry.action.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.resource}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {entry.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-secondary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.userName}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', whiteSpace: 'nowrap' }}>{timeAgo(entry.createdAt)}</span>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '12px', color: 'rgb(var(--text-secondary))', cursor: 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} /> Prev
          </button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '12px', color: 'rgb(var(--text-secondary))', cursor: 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>
            Next <ChevronRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', position: 'relative', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }} />
      <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: '22px', fontWeight: 700, color, margin: 0, textTransform: 'capitalize' }}>{typeof value === 'number' ? value.toLocaleString() : value.toString().replace(/_/g, ' ')}</p>
    </div>
  );
}
