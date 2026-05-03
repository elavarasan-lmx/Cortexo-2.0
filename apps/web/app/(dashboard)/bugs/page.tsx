'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bug, AlertTriangle, CheckCircle2, Clock, Flame,
  ArrowUpRight, Brain, Search, Plus, XCircle,
  AlertCircle, Filter,
} from 'lucide-react';

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
  resolved:    { color: '#10B981', bg: 'rgba(16,185,129,0.10)', label: 'Resolved' },
  closed:      { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', label: 'Closed' },
};

/* ─── Demo bugs data ─── */
const demoBugs = [
  {
    id: 'BUG-1042', title: 'Rate calculation incorrect for gold spot above ₹85,000',
    priority: 'critical', status: 'open', module: 'BookRates',
    file: 'BookRatesController.php:482', assignee: 'Jerry',
    affectedClients: 3, createdAt: '2026-05-01T10:30:00Z',
  },
  {
    id: 'BUG-1041', title: 'Socket disconnects not reconnecting on mobile app resume',
    priority: 'critical', status: 'in_progress', module: 'SocketManager',
    file: 'socket_service.dart:218', assignee: 'Jerry',
    affectedClients: 12, createdAt: '2026-04-30T09:15:00Z',
  },
  {
    id: 'BUG-1039', title: 'Limit order submission allowed when limit_enable is OFF',
    priority: 'high', status: 'open', module: 'BookRates',
    file: 'BookRatesController.php:320', assignee: 'Tom',
    affectedClients: 5, createdAt: '2026-04-29T16:00:00Z',
  },
  {
    id: 'BUG-1038', title: 'PDF report generation timeout for accounts > 500 entries',
    priority: 'high', status: 'resolved', module: 'Reports',
    file: 'report_generator.php:145', assignee: 'Jerry',
    affectedClients: 2, createdAt: '2026-04-28T11:00:00Z',
  },
  {
    id: 'BUG-1035', title: 'Dashboard stat cards showing stale cache after rate update',
    priority: 'medium', status: 'open', module: 'Dashboard',
    file: 'HomeController.php:88', assignee: 'Tom',
    affectedClients: 8, createdAt: '2026-04-27T14:30:00Z',
  },
  {
    id: 'BUG-1033', title: 'OTP email not sending for Gmail accounts with + alias',
    priority: 'medium', status: 'resolved', module: 'Auth',
    file: 'AuthController.php:56', assignee: 'Jerry',
    affectedClients: 1, createdAt: '2026-04-26T09:00:00Z',
  },
  {
    id: 'BUG-1030', title: 'Footer copyright year hardcoded to 2025',
    priority: 'low', status: 'closed', module: 'Layout',
    file: 'footer.blade.php:42', assignee: 'Tom',
    affectedClients: 70, createdAt: '2026-04-25T08:00:00Z',
  },
  {
    id: 'BUG-1028', title: 'Watchlist pagination flickers on slow 3G connections',
    priority: 'low', status: 'open', module: 'Watchlist',
    file: 'watchlist_provider.dart:134', assignee: 'Jerry',
    affectedClients: 4, createdAt: '2026-04-24T13:00:00Z',
  },
];

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
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const allBugs = demoBugs;
  const filtered = allBugs
    .filter(b => filter === 'all' || b.priority === filter)
    .filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.module.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total:    allBugs.length,
    critical: allBugs.filter(b => b.priority === 'critical').length,
    open:     allBugs.filter(b => b.status === 'open').length,
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
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
              padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, color: '#fff',
              background: 'linear-gradient(135deg, rgb(var(--agent)), rgb(var(--primary)))',
              boxShadow: '0 4px 12px rgba(var(--agent), 0.3)',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--agent), 0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--agent), 0.3)'; e.currentTarget.style.transform = 'none'; }}
          >
            <Brain style={{ width: '15px', height: '15px' }} /> AI Scan
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', borderRadius: '12px',
              border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: 'rgb(var(--text-primary))',
              transition: 'all 150ms',
            }}
          >
            <Plus style={{ width: '14px', height: '14px' }} /> New Bug
          </button>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {statCards.map(s => (
          <div
            key={s.key}
            style={{
              borderRadius: '14px',
              border: '1px solid rgb(var(--border))',
              borderTop: `3px solid ${s.color}`,
              backgroundColor: 'rgb(var(--surface))',
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'box-shadow 200ms, transform 200ms',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${s.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon style={{ width: '17px', height: '17px', color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>
                {stats[s.key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search + Filter Row ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '320px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input
            type="text"
            placeholder="Search bugs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 34px', borderRadius: '10px',
              border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))',
              color: 'rgb(var(--text-primary))',
              fontSize: '13px', outline: 'none',
              transition: 'border-color 200ms',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgb(var(--primary))'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {filters.map(f => {
            const active = filter === f;
            const pr = priorityMap[f];
            const activeColor = f === 'all' ? 'rgb(var(--primary))' : pr?.color;
            const activeBg   = f === 'all' ? 'rgba(var(--primary),0.12)' : `${pr?.color}18`;
            const count = f === 'all' ? allBugs.length : allBugs.filter(b => b.priority === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: active ? 600 : 500,
                  backgroundColor: active ? activeBg : 'rgb(var(--surface))',
                  color: active ? activeColor : 'rgb(var(--text-secondary))',
                  outline: active ? `1px solid ${activeColor}44` : '1px solid rgb(var(--border))',
                  transition: 'all 150ms',
                }}
              >
                {f === 'all' ? 'All' : `${pr?.emoji} ${pr?.label}`}
                <span style={{
                  padding: '1px 5px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                  backgroundColor: active ? `${activeColor}20` : 'rgba(var(--border),0.6)',
                  color: active ? activeColor : 'rgb(var(--text-muted))',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Bug list ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(bug => {
          const pr = priorityMap[bug.priority] || priorityMap.medium;
          const st = statusMap[bug.status] || statusMap.open;

          return (
            <Link
              key={bug.id}
              href={`/bugs/detail?id=${bug.id}`}
              style={{
                display: 'block', textDecoration: 'none',
                borderRadius: '12px',
                border: '1px solid rgb(var(--border))',
                borderLeft: `4px solid ${pr.color}`,
                backgroundColor: 'rgb(var(--surface))',
                transition: 'box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px -4px ${pr.color}20`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>
                {/* Priority indicator */}
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px',
                  backgroundColor: pr.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bug style={{ width: '18px', height: '18px', color: pr.color }} />
                </div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <code style={{
                      fontSize: '11px', fontWeight: 700, color: 'rgb(var(--primary))',
                      backgroundColor: 'rgba(var(--primary),0.08)',
                      padding: '2px 6px', borderRadius: '4px',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {bug.id}
                    </code>
                    <span style={{
                      padding: '2px 7px', borderRadius: '5px',
                      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                      backgroundColor: pr.bg, color: pr.color,
                    }}>
                      {pr.label}
                    </span>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bug.title}
                    </h3>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '11px', color: 'rgb(var(--text-muted))', flexWrap: 'wrap' }}>
                    <code style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                      color: 'rgb(var(--primary))', backgroundColor: 'rgba(var(--primary),0.06)',
                      padding: '1px 5px', borderRadius: '3px',
                    }}>
                      {bug.module}/{bug.file}
                    </code>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock style={{ width: '10px', height: '10px' }} /> {timeAgo(bug.createdAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      👤 {bug.assignee}
                    </span>
                    {bug.affectedClients > 0 && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '3px',
                        color: bug.affectedClients > 5 ? '#EF4444' : 'rgb(var(--text-muted))',
                        fontWeight: bug.affectedClients > 5 ? 600 : 400,
                      }}>
                        <AlertTriangle style={{ width: '10px', height: '10px' }} />
                        {bug.affectedClients} client{bug.affectedClients > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  flexShrink: 0,
                  padding: '4px 10px', borderRadius: '6px',
                  fontSize: '11px', fontWeight: 600,
                  backgroundColor: st.bg, color: st.color,
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}>
                  {st.label}
                </span>

                {/* View arrow */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    backgroundColor: 'rgba(var(--primary),0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgb(var(--primary))',
                  }}>
                    <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── Empty state ─── */}
      {filtered.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))',
          padding: '80px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
          }}>
            <CheckCircle2 style={{ width: '28px', height: '28px', color: '#10B981', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
              {search ? 'No matching bugs found' : filter === 'all' ? 'No bugs found 🎉' : `No ${priorityMap[filter]?.label || filter} priority bugs`}
            </p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              {search ? 'Try a different search term.' : filter === 'all' ? 'Your code is clean! Bugs detected across projects will appear here.' : 'Try another filter or check back later.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
