'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bug, AlertTriangle, CheckCircle2, Clock, Flame,
  ArrowUpRight, Brain, Search, Plus, XCircle,
  AlertCircle, Filter, Loader2, RefreshCw,
} from 'lucide-react';
import { api, type TrackedError } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

/* ─── Priority config ─── */
const priorityMap: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  label: 'Critical', emoji: '🔴' },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'High',     emoji: '🟠' },
  medium:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Medium',   emoji: '🟡' },
  low:      { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Low',      emoji: '🟢' },
};

/* ─── Status config ─── */
const statusMap: Record<string, { color: string; bg: string; label: string }> = {
  open:        { color: '#EF4444', bg: 'rgba(239,68,68,0.10)',  label: 'Open' },
  in_progress: { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', label: 'In Progress' },
  investigating: { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', label: 'Investigating' },
  resolved:    { color: '#10B981', bg: 'rgba(16,185,129,0.10)', label: 'Resolved' },
  closed:      { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', label: 'Closed' },
};

/* ─── Stat card definitions ─── */
const statCards = [
  { key: 'total',    label: 'Total Bugs',   color: '#818CF8', icon: Bug },
  { key: 'critical', label: 'Critical',     color: '#EF4444', icon: XCircle },
  { key: 'open',     label: 'Open',         color: '#F97316', icon: Flame },
  { key: 'resolved', label: 'Resolved',     color: '#10B981', icon: CheckCircle2 },
] as const;

const filters = ['all', 'critical', 'high', 'medium', 'low'] as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function BugsPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: errors, loading, error, refetch } = useApiData(
    () => api.getErrors(),
    { default: [] as TrackedError[] }
  );

  const allBugs = (errors || []).map((e: TrackedError) => ({
    id: e.id?.slice(0, 8) || '—',
    fullId: e.id,
    title: e.message || e.type || 'Unknown error',
    priority: e.severity || 'medium',
    status: e.status || 'open',
    module: e.projectName || 'Unknown',
    file: e.stackTrace ? e.stackTrace.split('\n')[0]?.substring(0, 50) : '—',
    assignee: e.assignedTo || 'Unassigned',
    affectedClients: e.occurrenceCount || 1,
    createdAt: e.firstSeen || e.createdAt || new Date().toISOString(),
  }));

  const filtered = allBugs
    .filter(b => filter === 'all' || b.priority === filter)
    .filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.module.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total:    allBugs.length,
    critical: allBugs.filter(b => b.priority === 'critical').length,
    open:     allBugs.filter(b => b.status === 'open' || b.status === 'investigating').length,
    resolved: allBugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
  };

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🐛</span> Bug Tracker
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Track, prioritize, and resolve bugs across all client deployments
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button onClick={() => refetch()} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 18px', borderRadius: '12px',
            border: '1px solid rgb(var(--border))',
            backgroundColor: 'rgb(var(--surface))',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            color: 'rgb(var(--text-primary))', transition: 'all 150ms',
          }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {statCards.map(s => (
          <div key={s.key} style={{
            borderRadius: '14px', border: '1px solid rgb(var(--border))',
            borderTop: `3px solid ${s.color}`, backgroundColor: 'rgb(var(--surface))',
            padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px',
            transition: 'box-shadow 200ms, transform 200ms', cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${s.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon style={{ width: '17px', height: '17px', color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>
                {loading ? '—' : stats[s.key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search + Filter Row ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '320px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input type="text" placeholder="Search bugs..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {filters.map(f => {
            const active = filter === f;
            const pr = priorityMap[f];
            const activeColor = f === 'all' ? 'rgb(var(--primary))' : pr?.color;
            const activeBg   = f === 'all' ? 'rgba(var(--primary),0.12)' : `${pr?.color}18`;
            const count = f === 'all' ? allBugs.length : allBugs.filter(b => b.priority === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 600 : 500,
                backgroundColor: active ? activeBg : 'rgb(var(--surface))',
                color: active ? activeColor : 'rgb(var(--text-secondary))',
                outline: active ? `1px solid ${activeColor}44` : '1px solid rgb(var(--border))',
              }}>
                {f === 'all' ? 'All' : `${pr?.emoji} ${pr?.label}`}
                <span style={{ padding: '1px 5px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, backgroundColor: active ? `${activeColor}20` : 'rgba(var(--border),0.6)', color: active ? activeColor : 'rgb(var(--text-muted))' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading bugs...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {/* ─── Bug list ─── */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(bug => {
            const pr = priorityMap[bug.priority] || priorityMap.medium;
            const st = statusMap[bug.status] || statusMap.open;
            return (
              <Link key={bug.fullId || bug.id} href={`/errors/${bug.fullId}`}
                style={{ display: 'block', textDecoration: 'none', borderRadius: '12px', border: '1px solid rgb(var(--border))', borderLeft: `4px solid ${pr.color}`, backgroundColor: 'rgb(var(--surface))', transition: 'box-shadow 200ms, transform 200ms' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px -4px ${pr.color}20`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>
                  <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px', backgroundColor: pr.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bug style={{ width: '18px', height: '18px', color: pr.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: 'rgb(var(--primary))', backgroundColor: 'rgba(var(--primary),0.08)', padding: '2px 6px', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                        {bug.id}
                      </code>
                      <span style={{ padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: pr.bg, color: pr.color }}>{pr.label}</span>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bug.title}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '11px', color: 'rgb(var(--text-muted))', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'rgb(var(--primary))', backgroundColor: 'rgba(var(--primary),0.06)', padding: '1px 5px', borderRadius: '3px' }}>{bug.module}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock style={{ width: '10px', height: '10px' }} /> {timeAgo(bug.createdAt)}</span>
                      <span>👤 {bug.assignee}</span>
                      {bug.affectedClients > 1 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: bug.affectedClients > 5 ? '#EF4444' : 'rgb(var(--text-muted))', fontWeight: bug.affectedClients > 5 ? 600 : 400 }}>
                          <AlertTriangle style={{ width: '10px', height: '10px' }} /> {bug.affectedClients}x
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ flexShrink: 0, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: st.bg, color: st.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{st.label}</span>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(var(--primary),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(var(--primary))' }}>
                      <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ─── Empty state ─── */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))' }}>
            <CheckCircle2 style={{ width: '28px', height: '28px', color: '#10B981', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
              {search ? 'No matching bugs found' : filter === 'all' ? 'No bugs found 🎉' : `No ${priorityMap[filter]?.label || filter} priority bugs`}
            </p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              {search ? 'Try a different search term.' : filter === 'all' ? 'Your code is clean! Errors detected across projects will appear here.' : 'Try another filter or check back later.'}
            </p>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
