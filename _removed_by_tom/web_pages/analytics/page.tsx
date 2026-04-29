'use client';

import { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Clock, Rocket, Bug, CheckCircle,
  BarChart3, Activity, Zap, Target, Loader2, Calendar,
} from 'lucide-react';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { api } from '@/lib/api';

/* ─── KPI card ─── */
function KpiCard({
  label, value, sub, color, iconBg, icon: Icon, trend,
}: {
  label: string; value: string | number; sub?: string;
  color: string; iconBg: string; icon: any; trend?: number;
}) {
  return (
    <div
      style={{
        borderRadius: '14px',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${color}`,
        backgroundColor: 'rgb(var(--surface))',
        padding: '18px 20px',
        transition: 'box-shadow 200ms, transform 200ms',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))', margin: '0 0 8px' }}>
            {label}
          </p>
          <p style={{ fontSize: '28px', fontWeight: 800, color, margin: 0, lineHeight: 1 }}>
            {value}
          </p>
          {sub && (
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '5px 0 0' }}>{sub}</p>
          )}
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '11px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon style={{ width: '18px', height: '18px', color }} />
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(var(--border),0.5)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          {trend >= 0
            ? <TrendingUp style={{ width: '13px', height: '13px', color: '#10B981' }} />
            : <TrendingDown style={{ width: '13px', height: '13px', color: '#EF4444' }} />}
          <span style={{ fontWeight: 600, color: trend >= 0 ? '#10B981' : '#EF4444' }}>
            {Math.abs(trend)}%
          </span>
          <span style={{ color: 'rgb(var(--text-muted))' }}>vs last week</span>
        </div>
      )}
    </div>
  );
}

/* ─── Mini stat card ─── */
function MiniCard({ label, value, color, iconBg, icon: Icon }: {
  label: string; value: string | number; color: string; iconBg: string; icon: any;
}) {
  return (
    <div style={{
      borderRadius: '14px',
      border: '1px solid rgb(var(--border))',
      backgroundColor: 'rgb(var(--surface))',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: '14px',
      transition: 'box-shadow 150ms',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '16px', height: '16px', color }} />
      </div>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 3px' }}>{label}</p>
        <p style={{ fontSize: '22px', fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  useAutoLoadToken();
  const { data: deployments, loading: dLoad } = useApiData(() => api.getDeployments());
  const { data: errors, loading: eLoad } = useApiData(() => api.getErrors());
  const { data: pipelineRuns, loading: pLoad } = useApiData(() => api.getPipelineRuns({ limit: 200 }));

  const loading = dLoad || eLoad || pLoad;

  const stats = useMemo(() => {
    const deps = deployments || [];
    const errs = errors || [];
    const runs = pipelineRuns || [];

    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;

    // Deploys this week + trend
    const deploysThisWeek = deps.filter((d: any) => new Date(d.createdAt).getTime() > weekAgo).length;
    const deploysLastWeek = deps.filter((d: any) => {
      const t = new Date(d.createdAt).getTime();
      return t > weekAgo - 7 * 24 * 3600 * 1000 && t <= weekAgo;
    }).length;
    const deployTrend = deploysLastWeek > 0 ? Math.round(((deploysThisWeek - deploysLastWeek) / deploysLastWeek) * 100) : 0;

    // Pipeline success rate
    const totalRuns = runs.length;
    const successRuns = (runs as any[]).filter((r: any) => r.status === 'success').length;
    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 100;

    // MTTR
    const resolved = errs.filter((e: any) => e.status === 'resolved' && e.firstSeenAt && e.resolvedAt);
    const mttrMs = resolved.length > 0
      ? resolved.reduce((sum: number, e: any) => sum + (new Date(e.resolvedAt).getTime() - new Date(e.firstSeenAt).getTime()), 0) / resolved.length
      : 0;
    const mttrHours = mttrMs > 0 ? `${(mttrMs / 3600000).toFixed(1)}h` : '—';

    // Active errors + trend
    const errorsThisWeek = errs.filter((e: any) => new Date(e.lastSeenAt).getTime() > weekAgo).length;
    const errorsLastWeek = errs.filter((e: any) => {
      const t = new Date(e.lastSeenAt).getTime();
      return t > weekAgo - 7 * 24 * 3600 * 1000 && t <= weekAgo;
    }).length;
    const errorTrend = errorsLastWeek > 0 ? Math.round(((errorsThisWeek - errorsLastWeek) / errorsLastWeek) * 100) : 0;

    // Avg deploy duration
    const depsWithDuration = deps.filter((d: any) => d.durationMs);
    const avgDuration = depsWithDuration.length > 0
      ? Math.round(depsWithDuration.reduce((s: number, d: any) => s + d.durationMs, 0) / depsWithDuration.length / 1000)
      : 0;

    // Daily deploys for last 7 days
    const dailyDeploys: { day: string; date: string; count: number; success: number; failed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const dayDeps = deps.filter((d: any) => {
        const t = new Date(d.createdAt).getTime();
        return t >= dayStart.getTime() && t <= dayEnd.getTime();
      });
      dailyDeploys.push({
        day:     dayStart.toLocaleDateString('en', { weekday: 'short' }),
        date:    dayStart.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        count:   dayDeps.length,
        success: dayDeps.filter((d: any) => d.status === 'success').length,
        failed:  dayDeps.filter((d: any) => d.status === 'failed').length,
      });
    }
    const maxCount = Math.max(...dailyDeploys.map(d => d.count), 1);

    // Success/fail breakdown
    const successDeps = deps.filter((d: any) => d.status === 'success').length;
    const failedDeps  = deps.filter((d: any) => d.status === 'failed').length;

    return {
      deploysThisWeek, deployTrend, successRate, mttrHours,
      errorsThisWeek, errorTrend, avgDuration,
      total: deps.length, successDeps, failedDeps,
      dailyDeploys, maxCount, totalRuns,
    };
  }, [deployments, errors, pipelineRuns]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
      <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  /* Y-axis grid lines */
  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            DORA metrics and engineering health for your projects
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', borderRadius: '10px', flexShrink: 0,
          backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
          fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))',
        }}>
          <Calendar style={{ width: '13px', height: '13px' }} />
          Last 7 days
        </div>
      </div>

      {/* ─── Primary KPI cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
        <KpiCard label="Deploy Frequency"  value={`${stats.deploysThisWeek}/wk`} sub="deploys this week"   color="#818CF8" iconBg="rgba(129,140,248,0.12)" icon={Rocket}      trend={stats.deployTrend} />
        <KpiCard label="Pipeline Success"  value={`${stats.successRate}%`}        sub="of all pipeline runs" color="#10B981" iconBg="rgba(16,185,129,0.12)"  icon={CheckCircle} />
        <KpiCard label="MTTR"              value={stats.mttrHours}                sub="mean time to resolve" color="#F59E0B" iconBg="rgba(245,158,11,0.12)"  icon={Clock}       />
        <KpiCard label="Active Errors"     value={stats.errorsThisWeek}           sub="errors this week"     color="#EF4444" iconBg="rgba(239,68,68,0.12)"   icon={Bug}         trend={-stats.errorTrend} />
      </div>

      {/* ─── Secondary mini cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <MiniCard label="Avg Deploy Time"  value={stats.avgDuration > 0 ? `${stats.avgDuration}s` : '—'} color="#818CF8" iconBg="rgba(129,140,248,0.1)"  icon={Zap}      />
        <MiniCard label="Total Deploys"    value={stats.total}    color="#10B981" iconBg="rgba(16,185,129,0.1)"  icon={Target}   />
        <MiniCard label="Pipeline Runs"    value={stats.totalRuns} color="#8B5CF6" iconBg="rgba(139,92,246,0.1)"  icon={Activity} />
      </div>

      {/* ─── Deploy frequency bar chart ─── */}
      <div style={{
        borderRadius: '14px', border: '1px solid rgb(var(--border))',
        backgroundColor: 'rgb(var(--surface))', padding: '20px 24px',
        marginBottom: '14px',
      }}>
        {/* Chart header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: 'rgba(129,140,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 style={{ width: '16px', height: '16px', color: '#818CF8' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Deploy Frequency</h2>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Last 7 days — success vs failed</p>
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgb(var(--text-muted))' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#818CF8', display: 'inline-block' }} />
              Success
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgb(var(--text-muted))' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#EF4444', display: 'inline-block' }} />
              Failed
            </span>
          </div>
        </div>

        {/* Chart area */}
        <div style={{ position: 'relative', height: '180px' }}>
          {/* Y-axis gridlines */}
          {gridLines.map(pct => (
            <div key={pct} style={{
              position: 'absolute', left: 0, right: 0,
              bottom: `${pct}%`,
              borderTop: pct === 0 ? '2px solid rgba(var(--border),0.8)' : '1px dashed rgba(var(--border),0.4)',
              display: 'flex', alignItems: 'center',
            }}>
              {pct > 0 && (
                <span style={{ position: 'absolute', left: 0, fontSize: '10px', color: 'rgb(var(--text-muted))', transform: 'translateY(-50%)', lineHeight: 1 }}>
                  {Math.round((pct / 100) * stats.maxCount)}
                </span>
              )}
            </div>
          ))}

          {/* Bars */}
          <div style={{ position: 'absolute', inset: 0, paddingLeft: '20px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
            {stats.dailyDeploys.map((d, i) => {
              const totalPct = stats.maxCount > 0 ? (d.count / stats.maxCount) * 100 : 0;
              const successPct = d.count > 0 ? (d.success / d.count) * totalPct : 0;
              const failedPct = d.count > 0 ? (d.failed / d.count) * totalPct : 0;
              const isToday = i === 6;

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                  {/* Count label */}
                  <span style={{ fontSize: '11px', fontWeight: 700, color: d.count > 0 ? 'rgb(var(--text-primary))' : 'transparent' }}>
                    {d.count}
                  </span>
                  {/* Stacked bar */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', borderRadius: '6px 6px 0 0', overflow: 'hidden', minHeight: '4px' }}>
                    {d.count === 0 ? (
                      <div style={{ height: '4px', backgroundColor: 'rgba(var(--border),0.4)', borderRadius: '6px' }} />
                    ) : (
                      <>
                        {successPct > 0 && (
                          <div style={{
                            height: `${(successPct / 100) * 180}px`,
                            background: 'linear-gradient(180deg, #818CF8, #6366F1)',
                            transition: 'height 500ms ease',
                          }} />
                        )}
                        {failedPct > 0 && (
                          <div style={{
                            height: `${(failedPct / 100) * 180}px`,
                            backgroundColor: '#EF4444',
                            transition: 'height 500ms ease',
                          }} />
                        )}
                      </>
                    )}
                  </div>
                  {/* Day label */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: isToday ? 700 : 500, color: isToday ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))', margin: 0 }}>{d.day}</p>
                    <p style={{ fontSize: '9px', color: 'rgb(var(--text-muted))', margin: 0, opacity: 0.7 }}>{d.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Success vs Failed summary row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Deploy success breakdown */}
        <div style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', padding: '18px 20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))', margin: '0 0 14px' }}>
            Deploy Breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Successful', value: stats.successDeps, color: '#10B981', pct: stats.total > 0 ? Math.round((stats.successDeps / stats.total) * 100) : 0 },
              { label: 'Failed',     value: stats.failedDeps,  color: '#EF4444', pct: stats.total > 0 ? Math.round((stats.failedDeps  / stats.total) * 100) : 0 },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value} <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>({item.pct}%)</span></span>
                </div>
                {/* Progress bar */}
                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(var(--border),0.5)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.pct}%`, borderRadius: '3px', backgroundColor: item.color, transition: 'width 600ms ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline health */}
        <div style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', padding: '18px 20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))', margin: '0 0 14px' }}>
            Pipeline Health
          </p>
          {/* Radial success rate display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <svg viewBox="0 0 80 80" style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(var(--border),0.5)" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke={stats.successRate >= 80 ? '#10B981' : stats.successRate >= 60 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - stats.successRate / 100)}`}
                  style={{ transition: 'stroke-dashoffset 600ms ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>{stats.successRate}%</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: stats.successRate >= 80 ? '#10B981' : stats.successRate >= 60 ? '#F59E0B' : '#EF4444', margin: '0 0 4px' }}>
                {stats.successRate >= 80 ? 'Healthy' : stats.successRate >= 60 ? 'Degraded' : 'Critical'}
              </p>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '0 0 8px' }}>
                {stats.totalRuns} total pipeline runs
              </p>
              <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                MTTR: <strong style={{ color: 'rgb(var(--text-secondary))' }}>{stats.mttrHours}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
