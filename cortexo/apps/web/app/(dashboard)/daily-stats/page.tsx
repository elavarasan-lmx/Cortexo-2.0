'use client';

import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = { borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' };

const stats = [
  { label: 'Deploys Today', value: '12', change: '+3', color: '#10B981', icon: '🚀' },
  { label: 'Bugs Fixed', value: '8', change: '+2', color: '#3B82F6', icon: '🐛' },
  { label: 'Errors Caught', value: '47', change: '-12', color: '#EF4444', icon: '⚠️' },
  { label: 'Uptime', value: '99.97%', change: '+0.02%', color: '#7C3AED', icon: '💓' },
  { label: 'Active Servers', value: '14', change: '0', color: '#F59E0B', icon: '🖥️' },
  { label: 'AI Tasks', value: '23', change: '+5', color: '#6366F1', icon: '🤖' },
];

const timeline = [
  { time: '09:00', events: 3, label: '3 deploys', color: '#10B981' },
  { time: '10:00', events: 1, label: '1 error spike', color: '#EF4444' },
  { time: '11:00', events: 5, label: '5 AI scans', color: '#7C3AED' },
  { time: '12:00', events: 2, label: '2 bug fixes', color: '#3B82F6' },
  { time: '13:00', events: 4, label: '4 deploys', color: '#10B981' },
  { time: '14:00', events: 0, label: 'Quiet', color: '#6B7280' },
  { time: '15:00', events: 6, label: '6 code reviews', color: '#F59E0B' },
  { time: '16:00', events: 2, label: '2 rollbacks', color: '#EF4444' },
];

const topProjects = [
  { name: 'winbull-api', deploys: 5, errors: 12, status: 'healthy' },
  { name: 'cortexo-web', deploys: 3, errors: 2, status: 'healthy' },
  { name: 'mobile-app', deploys: 2, errors: 8, status: 'warning' },
  { name: 'admin-panel', deploys: 1, errors: 0, status: 'healthy' },
  { name: 'data-pipeline', deploys: 1, errors: 25, status: 'critical' },
];

export default function DailyStatsPage() {
  useAutoLoadToken();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>📊 Daily Stats Aggregator</h1>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>Platform-wide metrics for today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...card, padding: '18px' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '4px 0' }}>{s.value}</div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: s.change.startsWith('+') ? '#10B981' : s.change.startsWith('-') ? '#EF4444' : 'rgb(var(--text-muted))' }}>{s.change} vs yesterday</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Timeline */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Activity Timeline</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {timeline.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: i < timeline.length - 1 ? '1px solid rgba(var(--border),0.2)' : 'none' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', minWidth: '50px', fontFamily: "'JetBrains Mono', monospace" }}>{t.time}</span>
                <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.2)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(t.events * 16, 100)}%`, height: '100%', borderRadius: '4px', backgroundColor: t.color, transition: 'width 500ms' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: t.color, minWidth: '100px', textAlign: 'right' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Projects */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Top Projects Today</h3>
          </div>
          <div style={{ padding: '8px 16px' }}>
            {topProjects.map((p, i) => {
              const statusColor = p.status === 'healthy' ? '#10B981' : p.status === 'warning' ? '#F59E0B' : '#EF4444';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 8px', borderBottom: i < topProjects.length - 1 ? '1px solid rgba(var(--border),0.2)' : 'none' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{p.deploys} deploys · {p.errors} errors</div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: statusColor, padding: '3px 8px', borderRadius: '4px', backgroundColor: `${statusColor}12`, textTransform: 'capitalize' }}>{p.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
