'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bug, AlertOctagon, CheckCircle2, CircleDashed,
  Search, Plus, Filter, ChevronRight, AlertTriangle,
  Users, ChevronDown, Activity, Clock, Loader2,
  Zap, Boxes,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

const MODULE_META: Record<string, { icon: string; label: string; color: string }> = {
  registration:    { icon: '👤', label: 'Registration',    color: '#8B5CF6' },
  login_auth:      { icon: '🔐', label: 'Login & Auth',    color: '#3B82F6' },
  rate_engine:     { icon: '📊', label: 'Rate Engine',     color: '#F59E0B' },
  trading:         { icon: '💰', label: 'Trading',         color: '#10B981' },
  client_mgmt:     { icon: '👥', label: 'Client Mgmt',     color: '#EC4899' },
  reports:         { icon: '📈', label: 'Reports',         color: '#6366F1' },
  notifications:   { icon: '🔔', label: 'Notifications',   color: '#F97316' },
  admin_settings:  { icon: '⚙️', label: 'Admin/Settings',  color: '#64748B' },
  infrastructure:  { icon: '🔧', label: 'Infrastructure',  color: '#EF4444' },
  uncategorized:   { icon: '❓', label: 'Uncategorized',    color: '#94A3B8' },
};

const priorityConfig: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  critical: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', icon: AlertOctagon },
  high:     { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', icon: AlertTriangle },
  medium:   { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', icon: Activity },
  low:      { bg: 'rgba(16,185,129,0.15)', color: '#10B981', icon: CircleDashed },
};

const statusConfig: Record<string, { bg: string; color: string }> = {
  unresolved:    { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  investigating: { bg: 'rgba(99,102,241,0.15)', color: '#6366F1' },
  resolved:      { bg: 'rgba(34,197,94,0.15)',  color: '#22C55E' },
  ignored:       { bg: 'rgba(100,116,139,0.15)', color: '#64748B' },
};

const statusLabels: Record<string, string> = {
  unresolved: 'Open', investigating: 'In Progress', resolved: 'Resolved', ignored: 'Ignored',
};

const getBadgeColor = (name: string) => {
  const colors = ['#7C3AED','#3B82F6','#EC4899','#10B981','#F59E0B','#EF4444'];
  return colors[(name || 'U').charCodeAt(0) % colors.length];
};

export default function BugTrackerPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'testing' | 'manual'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [moduleStats, setModuleStats] = useState<any[]>([]);

  const { data: errorsData, loading, refetch } = useApiData(
    () => api.getErrors(moduleFilter ? { module: moduleFilter } : undefined),
    { default: [] as any[], deps: [moduleFilter] }
  );

  useEffect(() => {
    api.getErrorModuleStats().then((res: any) => {
      setModuleStats(res?.data || []);
    }).catch(() => {});
  }, []);

  const errors = errorsData || [];
  const totalBugs = errors.length;
  const criticalCount = errors.filter((e: any) => e.severity === 'critical').length;
  const openCount = errors.filter((e: any) => e.status === 'unresolved').length;
  const resolvedCount = errors.filter((e: any) => e.status === 'resolved').length;

  const filteredBugs = errors.filter((bug: any) => {
    if (filter !== 'all') {
      if (filter === 'critical' && bug.severity !== 'critical') return false;
      if (filter === 'unresolved' && bug.status !== 'unresolved') return false;
      if (filter === 'investigating' && bug.status !== 'investigating') return false;
    }
    if (sourceFilter === 'testing') {
      const tags = Array.isArray(bug.tags) ? bug.tags : (typeof bug.tags === 'string' ? JSON.parse(bug.tags || '[]') : []);
      if (!tags.includes('testing')) return false;
    } else if (sourceFilter === 'manual') {
      const tags = Array.isArray(bug.tags) ? bug.tags : (typeof bug.tags === 'string' ? JSON.parse(bug.tags || '[]') : []);
      if (tags.includes('testing')) return false;
    }
    if (searchQuery && !bug.message?.toLowerCase().includes(searchQuery.toLowerCase()) && !bug.type?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedBug = errors.find((b: any) => b.id === selectedBugId);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
            <Bug style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))' }} />
            Bug Tracker
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgb(var(--text-muted))' }}>
            {moduleFilter ? `${MODULE_META[moduleFilter]?.icon} ${MODULE_META[moduleFilter]?.label} bugs` : 'All modules'} · {totalBugs} bugs
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
            <input type="text" placeholder="Search bugs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '10px 16px 10px 36px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '14px', width: '250px', outline: 'none' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Report Bug
          </button>
        </div>
      </div>

      {/* ── Module Health Cards ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Boxes style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Module Health</span>
          {moduleFilter && (
            <button onClick={() => setModuleFilter(null)} style={{
              marginLeft: '8px', padding: '3px 10px', borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 600,
              backgroundColor: MODULE_META[moduleFilter]?.color || '#666', color: '#fff', cursor: 'pointer',
            }}>
              {MODULE_META[moduleFilter]?.icon} {MODULE_META[moduleFilter]?.label} ✕
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
          {moduleStats.map((ms: any) => {
            const meta = MODULE_META[ms.module] || MODULE_META.uncategorized;
            const isActive = moduleFilter === ms.module;
            const total = Number(ms.total);
            const critical = Number(ms.critical);
            const open = Number(ms.open);
            return (
              <button key={ms.module} onClick={() => setModuleFilter(isActive ? null : ms.module)}
                style={{
                  padding: '14px 12px', borderRadius: '12px', border: '1px solid', cursor: 'pointer', textAlign: 'left',
                  borderColor: isActive ? meta.color : 'rgb(var(--border))',
                  backgroundColor: isActive ? `${meta.color}10` : 'rgb(var(--surface))',
                  boxShadow: isActive ? `0 0 0 2px ${meta.color}30` : 'none',
                  transition: 'all 150ms',
                }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{meta.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgb(var(--text-primary))', marginBottom: '4px' }}>{meta.label}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: open > 0 ? meta.color : '#10B981' }}>{total}</span>
                  {critical > 0 && <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444' }}>🔴{critical}</span>}
                  {open === 0 && <span style={{ fontSize: '10px', color: '#10B981' }}>✅</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Bugs', count: totalBugs, icon: Bug, color: '#EF4444' },
          { label: 'Critical', count: criticalCount, icon: AlertOctagon, color: '#F59E0B' },
          { label: 'Open', count: openCount, icon: CircleDashed, color: '#3B82F6' },
          { label: 'Resolved', count: resolvedCount, icon: CheckCircle2, color: '#22C55E' },
        ].map(s => (
          <div key={s.label} style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '20px', border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: '24px', height: '24px', color: s.color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${totalBugs})` },
            { key: 'critical', label: `Critical (${criticalCount})` },
            { key: 'unresolved', label: `Open (${openCount})` },
            { key: 'investigating', label: `In Progress (${errors.filter((e: any) => e.status === 'investigating').length})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px',
              fontWeight: filter === f.key ? 600 : 500, transition: 'all 150ms',
              backgroundColor: filter === f.key ? (f.key === 'critical' ? 'rgba(239,68,68,0.2)' : f.key === 'unresolved' ? 'rgba(59,130,246,0.2)' : f.key === 'investigating' ? 'rgba(99,102,241,0.2)' : 'rgb(var(--primary))') : 'rgba(var(--text-muted), 0.1)',
              color: filter === f.key ? (f.key === 'critical' ? '#EF4444' : f.key === 'unresolved' ? '#3B82F6' : f.key === 'investigating' ? '#6366F1' : '#FFF') : 'rgb(var(--text-muted))',
            }}>{f.label}</button>
          ))}
          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgb(var(--border))', margin: '0 4px' }} />
          <button onClick={() => setSourceFilter(sourceFilter === 'testing' ? 'all' : 'testing')} style={{
            padding: '5px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px',
            fontWeight: sourceFilter === 'testing' ? 600 : 500, display: 'flex', alignItems: 'center', gap: '4px',
            backgroundColor: sourceFilter === 'testing' ? 'rgba(124,58,237,0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: sourceFilter === 'testing' ? '#7C3AED' : 'rgb(var(--text-muted))',
          }}><Zap style={{ width: '11px', height: '11px' }} /> Testing</button>
          <button onClick={() => setSourceFilter(sourceFilter === 'manual' ? 'all' : 'manual')} style={{
            padding: '5px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px',
            fontWeight: sourceFilter === 'manual' ? 600 : 500,
            backgroundColor: sourceFilter === 'manual' ? 'rgba(59,130,246,0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: sourceFilter === 'manual' ? '#3B82F6' : 'rgb(var(--text-muted))',
          }}>Manual</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedBug ? '1fr 450px' : '1fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--text-muted), 0.05)' }}>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>ID</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Error</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Module</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Severity</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.length > 0 ? filteredBugs.map((bug: any) => {
                const pc = priorityConfig[bug.severity] || priorityConfig.medium;
                const sc = statusConfig[bug.status] || statusConfig.unresolved;
                const isSelected = selectedBugId === bug.id;
                const mod = MODULE_META[bug.module] || MODULE_META.uncategorized;
                return (
                  <tr key={bug.id} onClick={() => setSelectedBugId(bug.id)}
                    style={{ borderBottom: '1px solid rgb(var(--border))', cursor: 'pointer', backgroundColor: isSelected ? 'rgba(var(--primary), 0.05)' : 'transparent', transition: 'background-color 150ms' }}
                    onMouseEnter={e => { if(!isSelected) e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.05)'; }}
                    onMouseLeave={e => { if(!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--primary))', fontFamily: 'JetBrains Mono, monospace' }}>
                      #{bug.id.toString().substring(0, 6)}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{bug.type}</span>
                      <br />
                      <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{bug.message?.substring(0, 60)}{bug.message?.length > 60 ? '...' : ''}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: 600, backgroundColor: `${mod.color}15`, color: mod.color,
                      }}>
                        {mod.icon} {mod.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: pc.bg, color: pc.color, textTransform: 'capitalize' }}>
                        <pc.icon style={{ width: '10px', height: '10px' }} /> {bug.severity}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: sc.bg, color: sc.color }}>
                        {statusLabels[bug.status] || bug.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'rgb(var(--text-secondary))' }}>
                      {timeAgo(bug.lastSeenAt || bug.firstSeenAt)}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                  <Bug style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>No bugs found</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgb(var(--text-secondary))' }}>
                    {searchQuery ? 'Try a different search term.' : moduleFilter ? 'This module has no bugs! 🎉' : 'All systems running clean! 🎉'}
                  </p>
                </td></tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgb(var(--border))' }}>
            <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))' }}>Showing {filteredBugs.length} bugs{moduleFilter ? ` in ${MODULE_META[moduleFilter]?.label}` : ''}</span>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedBug && (
          <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden', position: 'sticky', top: '24px' }}>
            <div style={{ backgroundColor: 'rgb(var(--primary))', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bug style={{ width: '18px', height: '18px' }} /> #{selectedBug.id.toString().substring(0, 6)}
              </h2>
              <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: '11px', fontWeight: 600 }}>
                {statusLabels[selectedBug.status] || selectedBug.status}
              </span>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Module badge */}
              {(() => { const m = MODULE_META[selectedBug.module] || MODULE_META.uncategorized; return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', backgroundColor: `${m.color}10`, border: `1px solid ${m.color}25` }}>
                  <span style={{ fontSize: '20px' }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: m.color }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>Module</div>
                  </div>
                </div>
              ); })()}
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>Error Details</h3>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{selectedBug.type}</p>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'rgb(var(--text-secondary))' }}>{selectedBug.message}</p>
              </div>
              <div style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search style={{ width: '14px', height: '14px' }} /> Error Info
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>File:</span>
                  <span style={{ color: 'rgb(var(--text-primary))', fontFamily: 'JetBrains Mono, monospace' }}>{selectedBug.file || '—'}{selectedBug.line ? `:${selectedBug.line}` : ''}</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>Severity:</span>
                  <span style={{ color: 'rgb(var(--text-primary))', textTransform: 'capitalize' }}>{selectedBug.severity}</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>Events:</span>
                  <span style={{ color: 'rgb(var(--text-primary))' }}>{selectedBug.eventCount || 0} occurrences</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>First Seen:</span>
                  <span style={{ color: 'rgb(var(--text-primary))' }}>{timeAgo(selectedBug.firstSeenAt)}</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>Last Seen:</span>
                  <span style={{ color: 'rgb(var(--text-primary))' }}>{timeAgo(selectedBug.lastSeenAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
