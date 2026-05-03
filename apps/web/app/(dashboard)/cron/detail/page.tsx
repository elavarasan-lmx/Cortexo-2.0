'use client';

import {
  Timer, ArrowLeft, Clock, CheckCircle, XCircle, RefreshCw,
  Play, Pause, Terminal, Calendar, BarChart2,
} from 'lucide-react';
import Link from 'next/link';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

const demoCronJob = {
  id: 1, name: 'Nightly Backup', expression: '0 2 * * *',
  humanSchedule: 'Every day at 2:00 AM', status: 'active',
  server: 'prod-db-01', command: '/scripts/backup.sh --full --compress',
  description: 'Full database backup with compression, uploaded to S3.',
  lastRun: '2025-05-02 02:00:00', nextRun: '2025-05-03 02:00:00',
  avgDuration: '12m 34s', successRate: 98.5,
  stats: { totalRuns: 450, success: 443, failed: 7, avgDuration: '12m 34s' },
  history: [
    { runAt: '2025-05-02 02:00', duration: '11m 22s', status: 'success', exitCode: 0 },
    { runAt: '2025-05-01 02:00', duration: '13m 10s', status: 'success', exitCode: 0 },
    { runAt: '2025-04-30 02:00', duration: '45m 00s', status: 'failed', exitCode: 1 },
    { runAt: '2025-04-29 02:00', duration: '12m 01s', status: 'success', exitCode: 0 },
    { runAt: '2025-04-28 02:00', duration: '12m 45s', status: 'success', exitCode: 0 },
    { runAt: '2025-04-27 02:00', duration: '11m 56s', status: 'success', exitCode: 0 },
  ],
};

export default function CronJobDetailPage() {
  const c = demoCronJob;

  return (
    <div>
      <Link href="/cron" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Cron Jobs
      </Link>

      {/* Hero */}
      <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, rgba(168,85,247,0.05), rgba(var(--primary),0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Timer style={{ width: '24px', height: '24px', color: '#A855F7' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{c.name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: c.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: c.status === 'active' ? '#10B981' : '#EF4444', textTransform: 'capitalize' }}>{c.status}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '0 0 4px' }}>{c.description}</p>
            <code style={{ fontSize: '12px', color: '#A855F7', fontFamily: "'JetBrains Mono', monospace", backgroundColor: 'rgba(168,85,247,0.06)', padding: '2px 8px', borderRadius: '4px' }}>{c.expression}</code>
            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>({c.humanSchedule})</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <Play style={{ width: '12px', height: '12px' }} /> Run Now
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <Pause style={{ width: '12px', height: '12px' }} /> Pause
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Runs', value: c.stats.totalRuns, color: '#818CF8', icon: BarChart2 },
          { label: 'Success', value: c.stats.success, color: '#10B981', icon: CheckCircle },
          { label: 'Failed', value: c.stats.failed, color: '#EF4444', icon: XCircle },
          { label: 'Avg Duration', value: c.stats.avgDuration, color: '#F59E0B', icon: Clock },
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
        {/* Schedule Info */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Schedule Details</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {[
              { label: 'Server', value: c.server },
              { label: 'Command', value: c.command },
              { label: 'Last Run', value: c.lastRun },
              { label: 'Next Run', value: c.nextRun },
              { label: 'Success Rate', value: `${c.successRate}%` },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(var(--border),0.08)' : 'none' }}>
                <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: item.label === 'Command' ? "'JetBrains Mono', monospace" : 'inherit', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate Visual */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Success Rate</h3>
          </div>
          <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg viewBox="0 0 120 120" style={{ width: '120px', height: '120px', transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(var(--border),0.2)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#10B981" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${c.successRate * 3.14} 314`} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#10B981' }}>{c.successRate}%</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '12px' }}>
              {c.stats.success} of {c.stats.totalRuns} runs successful
            </p>
          </div>
        </div>

        {/* History */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Execution History</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(var(--border),0.15)' }}>
                {['Run Time', 'Duration', 'Status', 'Exit Code'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.history.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(var(--border),0.06)' }}>
                  <td style={{ padding: '10px 20px', fontSize: '12px', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{r.runAt}</td>
                  <td style={{ padding: '10px 20px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{r.duration}</td>
                  <td style={{ padding: '10px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: r.status === 'success' ? '#10B981' : '#EF4444' }}>
                      {r.status === 'success' ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <XCircle style={{ width: '12px', height: '12px' }} />}
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 20px' }}>
                    <code style={{ fontSize: '11px', color: r.exitCode === 0 ? '#10B981' : '#EF4444', fontFamily: "'JetBrains Mono', monospace" }}>{r.exitCode}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
