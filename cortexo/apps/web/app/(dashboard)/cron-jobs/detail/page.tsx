'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  Timer, ArrowLeft, Clock, CheckCircle, XCircle, RefreshCw,
  Play, Pause, Terminal, Calendar, BarChart2, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

export default function CronJobDetailPage() {
  useAutoLoadToken();
  const params = useSearchParams();
  const jobId = params.get('id') || '';
  const [running, setRunning] = useState(false);

  const { data: jobs, loading, error, refetch } = useApiData(
    () => api.getCronJobs(),
    { default: [] as any[] }
  );

  const c = (jobs || []).find((j: any) => String(j.id) === jobId) || (jobs || [])[0];

  const handleRunNow = async () => {
    if (!c) return;
    setRunning(true);
    try { await api.runCronJob(c.id); } catch {}
    setRunning(false);
    refetch();
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading cron job...</p>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !c) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ fontSize: '14px', color: '#EF4444' }}>{error || 'Cron job not found'}</p>
      <Link href="/cron-jobs" style={{ fontSize: '13px', color: 'rgb(var(--primary))' }}>← Back to Cron Jobs</Link>
    </div>
  );

  const name = c.name || c.command || 'Unknown Job';
  const expression = c.expression || c.schedule || '—';
  const status = c.status || c.is_active ? 'active' : 'paused';
  const command = c.command || '—';
  const server = c.server || c.serverName || '—';
  const lastRun = c.lastRunAt || c.last_run_at || c.lastRun;
  const nextRun = c.nextRunAt || c.next_run_at || c.nextRun;
  const successRate = c.successRate || 0;
  const totalRuns = c.totalRuns || 0;
  const successCount = c.successCount || Math.round(totalRuns * (successRate / 100));
  const failedCount = totalRuns - successCount;

  return (
    <div>
      <Link href="/cron-jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
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
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: status === 'active' ? '#10B981' : '#EF4444', textTransform: 'capitalize' }}>{status}</span>
            </div>
            {c.description && <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '0 0 4px' }}>{c.description}</p>}
            <code style={{ fontSize: '12px', color: '#A855F7', fontFamily: "'JetBrains Mono', monospace", backgroundColor: 'rgba(168,85,247,0.06)', padding: '2px 8px', borderRadius: '4px' }}>{expression}</code>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleRunNow} disabled={running} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.6 : 1 }}>
              {running ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '12px', height: '12px' }} />} {running ? 'Running...' : 'Run Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Runs', value: totalRuns, color: '#818CF8', icon: BarChart2 },
          { label: 'Success', value: successCount, color: '#10B981', icon: CheckCircle },
          { label: 'Failed', value: failedCount, color: '#EF4444', icon: XCircle },
          { label: 'Success Rate', value: `${successRate}%`, color: '#F59E0B', icon: Clock },
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
              { label: 'Server', value: server },
              { label: 'Command', value: command },
              { label: 'Last Run', value: lastRun ? new Date(lastRun).toLocaleString() : '—' },
              { label: 'Next Run', value: nextRun ? new Date(nextRun).toLocaleString() : '—' },
              { label: 'Expression', value: expression },
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
                <circle cx="60" cy="60" r="50" fill="none" stroke="#10B981" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${successRate * 3.14} 314`} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#10B981' }}>{successRate}%</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '12px' }}>
              {successCount} of {totalRuns} runs successful
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
