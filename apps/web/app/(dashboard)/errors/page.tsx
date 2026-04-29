'use client';

import {
  Bug, AlertTriangle, Info, AlertCircle, XCircle,
  Brain, Eye, CheckCircle, Loader2, Clock, Flame,
  Activity, BarChart2, ArrowUpRight,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

/* ─── Severity config ─── */
const severityMap: Record<string, { icon: typeof Bug; color: string; bg: string; label: string }> = {
  critical: { icon: XCircle,       color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   label: 'Critical' },
  error:    { icon: AlertCircle,   color: '#F97316', bg: 'rgba(249,115,22,0.12)',  label: 'Error'    },
  warning:  { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Warning'  },
  info:     { icon: Info,          color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'Info'     },
};

/* ─── Status colors ─── */
const statusColors: Record<string, { color: string; bg: string }> = {
  unresolved: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
  resolved:   { color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  ignored:    { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

/* ─── Stat card definitions ─── */
const statCards = [
  { key: 'total',      label: 'Total Errors', color: '#818CF8', icon: Bug       },
  { key: 'critical',   label: 'Critical',     color: '#EF4444', icon: XCircle   },
  { key: 'unresolved', label: 'Unresolved',   color: '#F97316', icon: Flame     },
  { key: 'events',     label: 'Total Events', color: '#F59E0B', icon: Activity  },
] as const;

const filters = ['all', 'critical', 'error', 'warning', 'info'] as const;

/* ─── Event count badge color ─── */
function eventColor(count: number) {
  if (count > 500) return '#EF4444';
  if (count > 100) return '#F97316';
  if (count > 20)  return '#F59E0B';
  return 'rgb(var(--text-secondary))';
}

export default function ErrorsPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState<string>('all');
  const { data: errors, loading, error: fetchError, refetch } = useApiData(
    () => api.getErrors(),
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const allErrors = (errors as any[]) || [];
  const filtered = filter === 'all' ? allErrors : allErrors.filter((e: any) => e.severity === filter);

  const stats = {
    total:      allErrors.length,
    critical:   allErrors.filter((e: any) => e.severity === 'critical').length,
    unresolved: allErrors.filter((e: any) => e.status === 'unresolved').length,
    events:     allErrors.reduce((sum: number, e: any) => sum + (e.eventCount || 0), 0),
  };

  /* max event count for the mini bar */
  const maxEvents = Math.max(1, ...allErrors.map((e: any) => e.eventCount || 0));

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Errors</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Tracked errors grouped by fingerprint across all projects
          </p>
        </div>
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
          <Brain style={{ width: '15px', height: '15px' }} /> AI Root Cause
        </button>
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
                {s.key === 'events' ? (stats.events as number).toLocaleString() : stats[s.key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Filter pills ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {filters.map(f => {
          const active = filter === f;
          const sev = severityMap[f];
          const activeColor = f === 'all' ? 'rgb(var(--primary))' : sev?.color;
          const activeBg   = f === 'all' ? 'rgba(var(--primary),0.12)' : `${sev?.color}18`;
          const activeOutline = f === 'all' ? 'rgba(var(--primary),0.4)' : `${sev?.color}55`;
          const count = f === 'all' ? allErrors.length : allErrors.filter((e: any) => e.severity === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 600 : 500,
                backgroundColor: active ? activeBg : 'rgb(var(--surface))',
                color: active ? activeColor : 'rgb(var(--text-secondary))',
                outline: active ? `1px solid ${activeOutline}` : '1px solid rgb(var(--border))',
                transition: 'all 150ms',
              }}
            >
              {f !== 'all' && sev && (
                <sev.icon style={{ width: '11px', height: '11px', color: active ? sev.color : 'rgb(var(--text-muted))' }} />
              )}
              {f === 'all' ? 'All' : sev?.label || f}
              <span style={{
                padding: '1px 5px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                backgroundColor: active ? (f === 'all' ? 'rgba(var(--primary),0.15)' : `${sev?.color}20`) : 'rgba(var(--border),0.6)',
                color: active ? activeColor : 'rgb(var(--text-muted))',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Error list ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((err: any) => {
          const sev = severityMap[err.severity] || severityMap.error;
          const st  = statusColors[err.status]  || statusColors.unresolved;
          const SevIcon = sev.icon;
          const evCount = err.eventCount || 0;
          const evPct   = Math.round((evCount / maxEvents) * 100);
          const eColor  = eventColor(evCount);

          return (
            <Link
              key={err.id}
              href={`/errors/${err.id}`}
              style={{
                display: 'block', textDecoration: 'none',
                borderRadius: '12px',
                border: '1px solid rgb(var(--border))',
                borderLeft: `4px solid ${sev.color}`,
                backgroundColor: 'rgb(var(--surface))',
                transition: 'box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px -4px ${sev.color}20`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 16px' }}>
                {/* Severity icon */}
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px',
                  backgroundColor: sev.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '1px',
                }}>
                  <SevIcon style={{ width: '18px', height: '18px', color: sev.color }} />
                </div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 7px', borderRadius: '5px',
                      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                      backgroundColor: sev.bg, color: sev.color,
                    }}>
                      {sev.label}
                    </span>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
                      {err.type}
                    </h3>
                    <span style={{
                      padding: '2px 7px', borderRadius: '5px',
                      fontSize: '10px', fontWeight: 600, textTransform: 'capitalize',
                      backgroundColor: st.bg, color: st.color,
                    }}>
                      {err.status}
                    </span>
                  </div>

                  {/* Message */}
                  <p style={{
                    fontSize: '13px', color: 'rgb(var(--text-secondary))',
                    margin: '4px 0 0',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {err.message}
                  </p>

                  {/* Meta: file + timestamps */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '11px', color: 'rgb(var(--text-muted))', flexWrap: 'wrap' }}>
                    {err.file && (
                      <code style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: '11px', color: 'rgb(var(--primary))',
                        backgroundColor: 'rgba(var(--primary),0.08)',
                        padding: '1px 6px', borderRadius: '4px', flexShrink: 0,
                      }}>
                        {err.file}{err.line ? `:${err.line}` : ''}
                      </code>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock style={{ width: '10px', height: '10px' }} />
                      First: <strong style={{ color: 'rgb(var(--text-secondary))' }}>{timeAgo(err.firstSeenAt)}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock style={{ width: '10px', height: '10px' }} />
                      Last: <strong style={{ color: 'rgb(var(--text-secondary))' }}>{timeAgo(err.lastSeenAt)}</strong>
                    </span>
                  </div>
                </div>

                {/* Event count + mini bar */}
                <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '72px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: eColor, margin: 0, lineHeight: 1 }}>
                    {evCount.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, color: 'rgb(var(--text-muted))', margin: '2px 0 6px' }}>
                    events
                  </p>
                  {/* Mini bar */}
                  <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgb(var(--border))', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${evPct}%`, borderRadius: '2px',
                      backgroundColor: eColor,
                      transition: 'width 400ms ease',
                    }} />
                  </div>
                </div>

                {/* View arrow — always visible */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
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
            <CheckCircle style={{ width: '28px', height: '28px', color: '#10B981', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
              {filter === 'all' ? 'No errors found 🎉' : `No ${severityMap[filter]?.label || filter} errors`}
            </p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              {filter === 'all' ? 'Your code is clean! Errors detected in your projects will appear here.' : 'Try another filter or check back later.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
