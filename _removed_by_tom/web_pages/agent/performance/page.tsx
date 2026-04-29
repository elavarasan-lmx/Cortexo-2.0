'use client';

import {
  BarChart3, Zap, Clock, CheckCircle, TrendingUp,
  Bot, Brain, Wrench, Search, AlertTriangle,
  Activity, Sparkles, ArrowRight, CircleDot,
} from 'lucide-react';

/* ─── Recent agent runs ─── */
const RECENT_RUNS: { id: string; type: string; label: string; project: string; status: string; durationMs: number; tokens: number; model: string; ts: string }[] = [];

/* ─── Token breakdown ─── */
const TOKEN_BREAKDOWN: { label: string; tokens: number; color: string; pct: number }[] = [];

/* ─── Type config ─── */
const typeCfg: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  root_cause:  { color: '#818CF8', bg: 'rgba(129,140,248,0.1)', icon: Search,  label: 'Root Cause' },
  auto_fix:    { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  icon: Wrench,  label: 'Auto-Fix'   },
  code_review: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: Brain,   label: 'Code Review' },
};

const statusCfg: Record<string, { color: string; bg: string; label: string }> = {
  success: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: '✓ Success' },
  failed:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: '✗ Failed'  },
  running: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: '⟳ Running' },
};

const STAT_CARDS: { label: string; value: string; sub: string; color: string; bg: string; border: string; icon: any }[] = [];

export default function AgentPerformancePage() {
  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Agent Performance</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
            Metrics on AI agent task execution, token usage, and quality
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0 }}>
          <Activity style={{ width: '12px', height: '12px', color: '#10B981' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>Live Tracking</span>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {STAT_CARDS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ borderRadius: '14px', padding: '16px', backgroundColor: s.bg, border: `1px solid ${s.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>{s.label}</span>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '14px', height: '14px', color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 800, color: s.color, margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Main 2-col layout ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', marginBottom: '14px' }}>

        {/* ─── Recent Runs ─── */}
        <div style={{ borderRadius: '14px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(var(--border),0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot style={{ width: '15px', height: '15px', color: 'rgb(var(--primary))' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Recent Agent Runs</span>
            </div>
            <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(var(--primary),0.1)', color: 'rgb(var(--primary))' }}>
              {RECENT_RUNS.length} runs
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {RECENT_RUNS.map((run, i) => {
              const tc = typeCfg[run.type] || typeCfg.root_cause;
              const sc = statusCfg[run.status] || statusCfg.success;
              const RunIcon = tc.icon;
              return (
                <div key={run.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px',
                  borderBottom: i < RECENT_RUNS.length - 1 ? '1px solid rgba(var(--border),0.3)' : 'none',
                  transition: 'background-color 150ms',
                }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Type icon box */}
                  <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '9px', backgroundColor: tc.bg, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RunIcon style={{ width: '15px', height: '15px', color: tc.color }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{run.label}</span>
                      <span style={{ padding: '1px 6px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, backgroundColor: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CircleDot style={{ width: '9px', height: '9px' }} />{run.project}
                      </span>
                      <span>{run.model}</span>
                      <span>{run.ts}</span>
                    </div>
                  </div>

                  {/* Right meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-primary))' }}>
                      {(run.durationMs / 1000).toFixed(1)}s
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>
                      {run.tokens.toLocaleString()} tokens
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Token Breakdown sidebar ─── */}
        <div style={{ borderRadius: '14px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(var(--border),0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap style={{ width: '15px', height: '15px', color: '#F59E0B' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Token Usage</span>
            </div>
          </div>
          <div style={{ padding: '16px 18px' }}>
            {/* Total */}
            <div style={{ textAlign: 'center', padding: '16px', marginBottom: '16px', borderRadius: '10px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p style={{ fontSize: '32px', fontWeight: 800, color: '#F59E0B', margin: 0, lineHeight: 1 }}>2,400</p>
              <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>tokens this month</p>
            </div>

            {/* Breakdown bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {TOKEN_BREAKDOWN.map(t => (
                <div key={t.label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>{t.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.color }}>
                      {t.tokens.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', width: `${t.pct}%`, backgroundColor: t.color, boxShadow: `0 0 6px ${t.color}50` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Model usage */}
            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(var(--border),0.4)' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', margin: '0 0 10px' }}>Model Split</p>
              {[{ model: 'GPT-4o', runs: 4, color: '#818CF8' }, { model: 'Claude 3', runs: 1, color: '#F59E0B' }].map(m => (
                <div key={m.model} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles style={{ width: '11px', height: '11px', color: m.color }} />
                    <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>{m.model}</span>
                  </div>
                  <span style={{ padding: '1px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, backgroundColor: `${m.color}15`, color: m.color }}>
                    {m.runs} run{m.runs !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Accuracy Score — Coming Soon card ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '18px', padding: '18px 22px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(var(--primary),0.04), rgba(var(--agent),0.03))',
        border: '1px solid rgba(var(--primary),0.15)', borderLeft: '4px solid rgb(var(--primary))',
      }}>
        <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '12px', background: 'linear-gradient(135deg, rgba(var(--primary),0.15), rgba(var(--agent),0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Accuracy Score & Quality Metrics</p>
            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: 'rgba(var(--primary),0.1)', color: 'rgb(var(--primary))' }}>Phase 2</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.5 }}>
            Once you run AI-powered tasks (root cause analysis, auto-fix), accuracy scores and quality benchmarks will be calculated and tracked here automatically.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--primary))', flexShrink: 0, cursor: 'pointer' }}>
          Learn more <ArrowRight style={{ width: '13px', height: '13px' }} />
        </div>
      </div>
    </div>
  );
}
