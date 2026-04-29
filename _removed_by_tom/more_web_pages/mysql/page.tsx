'use client';

import { useState } from 'react';
import {
  Database, Zap, AlertTriangle, Clock, TrendingUp,
  RefreshCw, Loader2, CheckCircle, Activity,
  BarChart3, GitMerge, Shield,
} from 'lucide-react';

/* ─── Severity config (hardcoded — no CSS vars) ─── */
const sevCfg: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',  label: 'Critical'  },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)', label: 'High'      },
  medium:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)', label: 'Medium'    },
  low:      { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.2)', label: 'Low'       },
};

const typeCfg: Record<string, { color: string; label: string }> = {
  slow_query:    { color: '#818CF8', label: 'Slow Query'    },
  missing_index: { color: '#EF4444', label: 'Missing Index' },
  n_plus_one:    { color: '#F59E0B', label: 'N+1 Query'     },
  table_size:    { color: '#6B7280', label: 'Table Size'    },
};

/* ─── Data ─── */
const OPTIMIZATIONS: { id: number; type: string; severity: string; query: string; avgMs: number; calls: number; suggestion: string; fix: string }[] = [];

const SCHEMA_CHANGES: { id: number; table: string; change: string; sql: string; safe: boolean; estimatedMs: number }[] = [];

const PERF_STATS: { query: string; ms: string; pct: number }[] = [];

const STATS: { label: string; value: string; trend: string; icon: any; color: string; bg: string; border: string }[] = [];

const TABS = [
  { id: 'queries', label: 'Slow Queries',      icon: Clock    },
  { id: 'schema',  label: 'Schema Changes',    icon: GitMerge },
  { id: 'stats',   label: 'Performance Stats', icon: BarChart3 },
] as const;

export default function MySQLOptimizerPage() {
  const [applying, setApplying] = useState<number | null>(null);
  const [applied,  setApplied]  = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'queries' | 'schema' | 'stats'>('queries');
  const [analyzing, setAnalyzing] = useState(false);

  async function applyFix(id: number) {
    setApplying(id);
    await new Promise(r => setTimeout(r, 2000));
    setApplied(p => new Set([...p, id]));
    setApplying(null);
  }

  async function analyze() {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1800));
    setAnalyzing(false);
  }

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>MySQL Optimizer</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
            Slow query analysis, missing index detection, and pt-online-schema-change integration
          </p>
        </div>
        <button
          onClick={analyze}
          disabled={analyzing}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0,
            padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: analyzing ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: 600, color: '#fff',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: '0 4px 12px rgba(var(--primary),0.3)',
            opacity: analyzing ? 0.8 : 1, transition: 'all 150ms',
          }}
          onMouseEnter={e => { if (!analyzing) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--primary),0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary),0.3)'; e.currentTarget.style.transform = 'none'; }}
        >
          {analyzing
            ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Analyzing...</>
            : <><RefreshCw style={{ width: '14px', height: '14px' }} /> Analyze Now</>}
        </button>
      </div>

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ borderRadius: '14px', padding: '16px', backgroundColor: s.bg, border: `1px solid ${s.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>{s.label}</span>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '14px', height: '14px', color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: '26px', fontWeight: 800, color: s.color, margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>{s.trend}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', padding: '4px', borderRadius: '12px', backgroundColor: 'rgba(var(--border),0.2)', width: 'fit-content' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: isActive ? 700 : 500, transition: 'all 150ms',
              backgroundColor: isActive ? 'rgb(var(--surface))' : 'transparent',
              color: isActive ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
            }}>
              <TabIcon style={{ width: '13px', height: '13px' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Slow Queries tab ─── */}
      {activeTab === 'queries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {OPTIMIZATIONS.map(opt => {
            const sc = sevCfg[opt.severity];
            const tc = typeCfg[opt.type] || { color: '#6B7280', label: opt.type };
            const isApplied  = applied.has(opt.id);
            const isApplying = applying === opt.id;

            return (
              <div key={opt.id} style={{
                borderRadius: '14px', overflow: 'hidden',
                backgroundColor: 'rgb(var(--surface))',
                border: '1px solid rgb(var(--border))',
                borderLeft: `4px solid ${sc.color}`,
                transition: 'box-shadow 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px -4px ${sc.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ padding: '14px 18px' }}>
                  {/* Top row: badges + Apply Fix */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                      {/* Severity */}
                      <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {sc.label}
                      </span>
                      {/* Type */}
                      <span style={{ padding: '2px 8px', borderRadius: '7px', fontSize: '10px', fontWeight: 700, backgroundColor: `${tc.color}12`, color: tc.color }}>
                        {tc.label}
                      </span>
                      {/* Perf stats */}
                      {opt.avgMs > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                          <Activity style={{ width: '10px', height: '10px' }} />
                          {opt.avgMs}ms avg · {opt.calls.toLocaleString()} calls/day
                        </span>
                      )}
                    </div>

                    {/* Apply Fix button */}
                    <button
                      onClick={() => applyFix(opt.id)}
                      disabled={isApplied || isApplying}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                        cursor: (isApplied || isApplying) ? 'not-allowed' : 'pointer',
                        fontSize: '12px', fontWeight: 600, transition: 'all 150ms',
                        backgroundColor: isApplied ? 'rgba(16,185,129,0.1)' : isApplying ? `${sc.color}15` : `${sc.color}12`,
                        color: isApplied ? '#10B981' : sc.color,
                        outline: `1px solid ${isApplied ? 'rgba(16,185,129,0.2)' : `${sc.color}25`}`,
                      }}
                      onMouseEnter={e => { if (!isApplied && !isApplying) e.currentTarget.style.backgroundColor = `${sc.color}22`; }}
                      onMouseLeave={e => { if (!isApplied && !isApplying) e.currentTarget.style.backgroundColor = `${sc.color}12`; }}
                    >
                      {isApplying
                        ? <><Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> Applying...</>
                        : isApplied
                        ? <><CheckCircle style={{ width: '12px', height: '12px' }} /> Applied</>
                        : <><Zap style={{ width: '12px', height: '12px' }} /> Apply Fix</>}
                    </button>
                  </div>

                  {/* Query */}
                  <code style={{
                    display: 'block', fontSize: '11px', marginBottom: '8px', padding: '8px 12px', borderRadius: '7px',
                    backgroundColor: 'rgba(var(--border),0.3)',
                    color: '#93C5FD',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  }}>
                    {opt.query}
                  </code>

                  {/* Suggestion */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginBottom: '10px' }}>
                    <div style={{ width: '20px', height: '20px', flexShrink: 0, borderRadius: '5px', backgroundColor: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                      <span style={{ fontSize: '11px' }}>💡</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.5 }}>{opt.suggestion}</p>
                  </div>

                  {/* Fix SQL */}
                  <pre style={{
                    margin: 0, padding: '10px 14px', borderRadius: '8px', overflow: 'auto',
                    fontSize: '11px', lineHeight: 1.7,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    color: '#6EE7B7',
                    borderLeft: `3px solid ${sc.color}40`,
                  }}>
                    {opt.fix}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Schema Changes tab ─── */}
      {activeTab === 'schema' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Warning banner */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '14px 16px', borderRadius: '12px',
            backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderLeft: '4px solid #F59E0B',
          }}>
            <div style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: '15px', height: '15px', color: '#F59E0B' }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B', margin: '0 0 4px' }}>pt-online-schema-change</p>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.6 }}>
                Large table changes use{' '}
                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.4)', color: '#F59E0B' }}>
                  pt-online-schema-change
                </code>{' '}
                to avoid table locks. Add{' '}
                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(var(--primary),0.1)', color: 'rgb(var(--primary))' }}>
                  PERCONA_TOOLKIT_PATH
                </code>{' '}
                to env to enable. Safe changes run directly via <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.4)', color: 'rgb(var(--text-secondary))' }}>ALTER TABLE</code>.
              </p>
            </div>
          </div>

          {SCHEMA_CHANGES.map(change => (
            <div key={change.id} style={{
              borderRadius: '14px', overflow: 'hidden',
              backgroundColor: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderLeft: `4px solid ${change.safe ? '#10B981' : '#EF4444'}`,
            }}>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Database style={{ width: '15px', height: '15px', color: '#3B82F6' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{change.table}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(129,140,248,0.12)', color: '#818CF8' }}>
                      {change.change}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, backgroundColor: change.safe ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: change.safe ? '#10B981' : '#EF4444' }}>
                      {change.safe ? <CheckCircle style={{ width: '10px', height: '10px' }} /> : <AlertTriangle style={{ width: '10px', height: '10px' }} />}
                      {change.safe ? 'Safe' : 'Lock risk'}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>
                    ~{(change.estimatedMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <pre style={{
                  margin: 0, padding: '10px 14px', borderRadius: '8px', overflow: 'auto',
                  fontSize: '11px', lineHeight: 1.7,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  color: '#6EE7B7',
                  borderLeft: `3px solid ${change.safe ? '#10B98140' : '#EF444440'}`,
                }}>
                  {change.sql}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Performance Stats tab ─── */}
      {activeTab === 'stats' && (
        <div style={{ borderRadius: '14px', padding: '20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <BarChart3 style={{ width: '15px', height: '15px', color: 'rgb(var(--primary))' }} />
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Query Performance Overview</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {PERF_STATS.map(row => {
              const barColor = row.pct > 70 ? '#EF4444' : row.pct > 40 ? '#F97316' : '#10B981';
              return (
                <div key={row.query}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <code style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-secondary))' }}>{row.query}</code>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: barColor }}>{row.ms}</span>
                      <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', minWidth: '30px', textAlign: 'right' }}>{row.pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', width: `${row.pct}%`, backgroundColor: barColor, transition: 'width 600ms ease', boxShadow: `0 0 8px ${barColor}60` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
