'use client';
import { useState } from 'react';
import { Clock, Play, Pause, Plus, RefreshCw, AlertCircle, CheckCircle2, Timer, Loader2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const statusMap: Record<string, { color: string; icon: typeof Play }> = {
  active: { color: '#10B981', icon: CheckCircle2 },
  paused: { color: '#F59E0B', icon: Pause },
  disabled: { color: '#6B7280', icon: XCircle },
};

export default function CronJobsPage() {
  useAutoLoadToken();
  const [running, setRunning] = useState<string | null>(null);

  const { data: jobs, loading, error, refetch } = useApiData(
    () => api.getCronJobs(),
    { default: [] as Record<string, unknown>[] }
  );

  const handleRun = async (id: string) => {
    setRunning(id);
    try {
      await api.runCronJob(id);
      await refetch();
    } catch { /* ignore */ }
    setRunning(null);
  };

  const activeCount = (jobs || []).filter((j: any) => j.status === 'active').length;
  const pausedCount = (jobs || []).filter((j: any) => j.status === 'paused' || j.status === 'disabled').length;
  const failedCount = (jobs || []).filter((j: any) => j.lastStatus === 'failed' || j.success === false).length;

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock style={{ width: '22px', height: '22px', color: '#818CF8' }} /> Cron Jobs
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Scheduled tasks and automated job management</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
            <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), #818CF8)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> Add Cron Job
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Jobs', value: String((jobs || []).length), color: '#818CF8' },
          { label: 'Active', value: String(activeCount), color: '#10B981' },
          { label: 'Paused', value: String(pausedCount), color: '#F59E0B' },
          { label: 'Failed Last Run', value: String(failedCount), color: '#EF4444' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{loading ? '—' : c.value}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading cron jobs...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {/* Job List */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(jobs || []).map((job: any) => {
            const status = job.status || 'active';
            const s = statusMap[status] || statusMap.active;
            const Icon = s.icon;
            const isFailed = job.lastStatus === 'failed' || job.success === false;
            return (
              <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', transition: 'all 200ms', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${s.color}15`, flexShrink: 0 }}>
                  <Icon style={{ width: '16px', height: '16px', color: s.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{job.name || job.command || 'Untitled Job'}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                    <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', padding: '2px 6px', backgroundColor: 'rgba(var(--border), 0.2)', borderRadius: '4px' }}>{job.schedule || job.cron || '—'}</code>
                    {job.duration && <span><Timer style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{job.duration}</span>}
                    {job.lastRunAt && <span>Last: {new Date(job.lastRunAt).toLocaleString()}</span>}
                    {isFailed && <span style={{ color: '#EF4444' }}><AlertCircle style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle' }} /> Failed</span>}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: s.color, textTransform: 'capitalize', padding: '4px 10px', borderRadius: '6px', backgroundColor: `${s.color}12` }}>{status}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRun(job.id); }}
                  disabled={running === job.id}
                  style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}
                >
                  {running === job.id
                    ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                    : <Play style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
            );
          })}
          {(jobs || []).length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <Clock style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No cron jobs configured yet</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
