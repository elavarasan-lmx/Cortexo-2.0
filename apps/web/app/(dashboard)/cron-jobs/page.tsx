'use client';
import { Clock, Play, Pause, Plus, RefreshCw, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const demoJobs = [
  { id: '1', name: 'DB Backup — Production', schedule: '0 2 * * *', lastRun: '2026-05-02 02:00', nextRun: '2026-05-03 02:00', status: 'active', duration: '4m 12s', success: true },
  { id: '2', name: 'Cache Clear — Redis', schedule: '*/30 * * * *', lastRun: '2026-05-02 12:30', nextRun: '2026-05-02 13:00', status: 'active', duration: '2s', success: true },
  { id: '3', name: 'Log Rotation', schedule: '0 0 * * 0', lastRun: '2026-04-28 00:00', nextRun: '2026-05-05 00:00', status: 'active', duration: '1m 45s', success: true },
  { id: '4', name: 'Stale Session Cleanup', schedule: '0 */6 * * *', lastRun: '2026-05-02 12:00', nextRun: '2026-05-02 18:00', status: 'paused', duration: '8s', success: true },
  { id: '5', name: 'Rate Sync — MCX', schedule: '*/5 * * * *', lastRun: '2026-05-02 12:55', nextRun: '2026-05-02 13:00', status: 'active', duration: '1s', success: false },
  { id: '6', name: 'Report Generator — Daily', schedule: '0 6 * * *', lastRun: '2026-05-02 06:00', nextRun: '2026-05-03 06:00', status: 'active', duration: '12m 30s', success: true },
];

const statusMap: Record<string, { color: string; icon: typeof Play }> = {
  active: { color: '#10B981', icon: CheckCircle2 },
  paused: { color: '#F59E0B', icon: Pause },
};

export default function CronJobsPage() {
  useAutoLoadToken();
  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock style={{ width: '22px', height: '22px', color: '#818CF8' }} /> Cron Jobs
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Scheduled tasks and automated job management</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), #818CF8)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Add Cron Job
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Jobs', value: String(demoJobs.length), color: '#818CF8' },
          { label: 'Active', value: String(demoJobs.filter(j => j.status === 'active').length), color: '#10B981' },
          { label: 'Paused', value: String(demoJobs.filter(j => j.status === 'paused').length), color: '#F59E0B' },
          { label: 'Failed Last Run', value: String(demoJobs.filter(j => !j.success).length), color: '#EF4444' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {demoJobs.map(job => {
          const s = statusMap[job.status] || statusMap.active;
          const Icon = s.icon;
          return (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', transition: 'all 200ms', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${s.color}15`, flexShrink: 0 }}>
                <Icon style={{ width: '16px', height: '16px', color: s.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{job.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', padding: '2px 6px', backgroundColor: 'rgba(var(--border), 0.2)', borderRadius: '4px' }}>{job.schedule}</code>
                  <span><Timer style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{job.duration}</span>
                  <span>Last: {job.lastRun}</span>
                  {!job.success && <span style={{ color: '#EF4444' }}><AlertCircle style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle' }} /> Failed</span>}
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: s.color, textTransform: 'capitalize', padding: '4px 10px', borderRadius: '6px', backgroundColor: `${s.color}12` }}>{job.status}</span>
              <button style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}><Play style={{ width: '14px', height: '14px' }} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
