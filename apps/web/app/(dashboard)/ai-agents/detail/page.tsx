'use client';

import {
  Brain, ArrowLeft, Activity, Zap, Clock, MessageSquare,
  Settings, Shield, GitBranch, BarChart2, CheckCircle,
  AlertTriangle, TrendingUp, Code,
} from 'lucide-react';
import Link from 'next/link';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

const demoAgent = {
  id: 1, name: 'BugFixer AI', model: 'GPT-4o', temperature: 0.3,
  status: 'active', description: 'Automated bug analysis and fix suggestion agent.',
  skills: ['Code Analysis', 'Root Cause Detection', 'Fix Suggestion', 'PR Generation'],
  stats: {
    totalTasks: 1245, resolved: 1180, pending: 45, failed: 20,
    avgResponseTime: '2.3s', accuracy: '94.8%',
  },
  config: {
    maxTokens: 4096, systemPrompt: 'You are a senior developer...',
    retryAttempts: 3, timeout: '30s',
  },
  recentTasks: [
    { task: 'Analyze race condition in rate limiter', status: 'completed', project: 'WinBull Web', time: '1h ago', confidence: 96 },
    { task: 'Fix memory leak in socket handler', status: 'completed', project: 'Rate Engine', time: '3h ago', confidence: 91 },
    { task: 'Optimize query N+1 in client listing', status: 'in_progress', project: 'Cortexo API', time: '5h ago', confidence: 88 },
    { task: 'Debug auth token refresh loop', status: 'failed', project: 'WinBull Android', time: '1d ago', confidence: 45 },
  ],
};

const statusMap: Record<string, { color: string; bg: string }> = {
  completed: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  in_progress: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  failed: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function AIAgentDetailPage() {
  const a = demoAgent;

  return (
    <div>
      <Link href="/ai-agents" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to AI Agents
      </Link>

      {/* Hero */}
      <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain style={{ width: '24px', height: '24px', color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{a.name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', textTransform: 'capitalize' }}>{a.status}</span>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>{a.model}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>{a.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {a.skills.map(s => (
              <span key={s} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, backgroundColor: 'rgba(var(--primary),0.06)', color: 'rgb(var(--primary))', border: '1px solid rgba(var(--primary),0.1)' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Tasks', value: a.stats.totalTasks, color: '#818CF8', icon: BarChart2 },
          { label: 'Resolved', value: a.stats.resolved, color: '#10B981', icon: CheckCircle },
          { label: 'Accuracy', value: a.stats.accuracy, color: '#3B82F6', icon: TrendingUp },
          { label: 'Avg Response', value: a.stats.avgResponseTime, color: '#F59E0B', icon: Zap },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 2px' }}>{s.label}</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Config */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} /> Configuration
            </h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {[
              { label: 'Model', value: a.model },
              { label: 'Temperature', value: a.temperature.toString() },
              { label: 'Max Tokens', value: a.config.maxTokens.toString() },
              { label: 'Retry Attempts', value: a.config.retryAttempts.toString() },
              { label: 'Timeout', value: a.config.timeout },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(var(--border),0.08)' : 'none' }}>
                <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Ring */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Performance</h3>
          </div>
          <div style={{ padding: '32px 20px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
            {[
              { label: 'Accuracy', value: 94.8, color: '#10B981' },
              { label: 'Success', value: Math.round((a.stats.resolved / a.stats.totalTasks) * 100), color: '#3B82F6' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <svg viewBox="0 0 90 90" style={{ width: '90px', height: '90px', transform: 'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(var(--border),0.15)" strokeWidth="7" />
                    <circle cx="45" cy="45" r="38" fill="none" stroke={m.color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${m.value * 2.39} 239`} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: m.color }}>{m.value}%</span>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '8px', fontWeight: 600 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Recent Tasks</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(var(--border),0.15)' }}>
                {['Task', 'Project', 'Status', 'Confidence', 'Time'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.recentTasks.map((t, i) => {
                const sm = statusMap[t.status] || statusMap.completed;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(var(--border),0.06)' }}>
                    <td style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-primary))', maxWidth: '280px' }}>{t.task}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{t.project}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, backgroundColor: sm.bg, color: sm.color, textTransform: 'capitalize' }}>{t.status.replace('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(var(--border),0.2)' }}>
                          <div style={{ width: `${t.confidence}%`, height: '100%', borderRadius: '2px', backgroundColor: t.confidence > 80 ? '#10B981' : t.confidence > 50 ? '#F59E0B' : '#EF4444' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))' }}>{t.confidence}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{t.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
