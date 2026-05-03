'use client';

import {
  BarChart3, Zap, Clock, CheckCircle, XCircle, TrendingUp,
  Activity, Brain, AlertTriangle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const performanceData = {
  totalRuns: 1247, successRate: 94.2, avgDuration: '3.2s', p99Duration: '12.8s',
  tokensUsed: '2.4M', errorsToday: 3, lastRunTime: '2m ago',
  dailyStats: [
    { day: 'Mon', runs: 180, success: 172, failed: 8 },
    { day: 'Tue', runs: 205, success: 198, failed: 7 },
    { day: 'Wed', runs: 192, success: 185, failed: 7 },
    { day: 'Thu', runs: 210, success: 200, failed: 10 },
    { day: 'Fri', runs: 175, success: 167, failed: 8 },
    { day: 'Sat', runs: 145, success: 140, failed: 5 },
    { day: 'Sun', runs: 140, success: 133, failed: 7 },
  ],
  recentRuns: [
    { id: '1', skill: 'Deploy Orchestrator', status: 'success', duration: '2.1s', tokens: 1450, time: '2m ago' },
    { id: '2', skill: 'Bug Hunter', status: 'success', duration: '4.8s', tokens: 3200, time: '15m ago' },
    { id: '3', skill: 'Config Drift Detector', status: 'failed', duration: '12.3s', tokens: 5100, time: '32m ago' },
    { id: '4', skill: 'Log Pattern Analyzer', status: 'success', duration: '1.9s', tokens: 890, time: '1h ago' },
    { id: '5', skill: 'MySQL Query Analyzer', status: 'success', duration: '3.5s', tokens: 2100, time: '2h ago' },
  ],
};

export default function AgentPerformancePage() {
  useAutoLoadToken();

  const statCards = [
    { label: 'Total Runs', value: String(performanceData.totalRuns), icon: Activity, color: '#818CF8' },
    { label: 'Success Rate', value: `${performanceData.successRate}%`, icon: CheckCircle, color: '#10B981', trend: '↑ 2.1%', trendUp: true },
    { label: 'Avg Duration', value: performanceData.avgDuration, icon: Clock, color: '#3B82F6' },
    { label: 'Tokens Used', value: performanceData.tokensUsed, icon: Brain, color: '#F59E0B' },
  ];

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 style={{ width: '22px', height: '22px', color: '#818CF8' }} />
          Agent Performance
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Execution metrics, latency tracking, and resource consumption
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${card.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: card.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{card.label}</p>
                <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${card.color}12` }}>
                  <Icon style={{ width: '16px', height: '16px', color: card.color }} />
                </div>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: card.color, margin: '12px 0 0', lineHeight: 1 }}>{card.value}</p>
              {card.trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                  {card.trendUp ? <ArrowUpRight style={{ width: '12px', height: '12px', color: '#10B981' }} /> : <ArrowDownRight style={{ width: '12px', height: '12px', color: '#EF4444' }} />}
                  <span style={{ fontSize: '11px', fontWeight: 500, color: card.trendUp ? '#10B981' : '#EF4444' }}>{card.trend}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly Chart (bar representation) */}
      <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp style={{ width: '14px', height: '14px', color: '#818CF8' }} /> Weekly Activity
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
          {performanceData.dailyStats.map((d) => {
            const maxRuns = Math.max(...performanceData.dailyStats.map(s => s.runs));
            const height = (d.runs / maxRuns) * 100;
            const successPct = (d.success / d.runs) * 100;
            return (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))' }}>{d.runs}</span>
                <div style={{ width: '100%', height: `${height}%`, borderRadius: '6px 6px 2px 2px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${successPct}%`, backgroundColor: '#10B981', borderRadius: '6px 6px 0 0' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${100 - successPct}%`, backgroundColor: '#EF4444' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Runs */}
      <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap style={{ width: '14px', height: '14px', color: '#F59E0B' }} /> Recent Executions
          </h2>
        </div>
        {performanceData.recentRuns.map((run) => (
          <div key={run.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid rgb(var(--border))', transition: 'background-color 200ms', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
            {run.status === 'success'
              ? <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981', flexShrink: 0 }} />
              : <XCircle style={{ width: '16px', height: '16px', color: '#EF4444', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{run.skill}</p>
            </div>
            <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{run.duration}</span>
            <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{run.tokens.toLocaleString()} tok</span>
            <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{run.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
