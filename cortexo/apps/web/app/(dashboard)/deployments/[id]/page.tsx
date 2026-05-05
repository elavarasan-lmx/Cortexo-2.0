'use client';
import { use } from 'react';
import { Rocket, Clock, CheckCircle2, XCircle, Server, GitBranch, User, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import Link from 'next/link';

const stColors: Record<string, { color: string; label: string }> = {
  success: { color: '#10B981', label: '✓ Success' },
  failed: { color: '#EF4444', label: '✗ Failed' },
  running: { color: '#3B82F6', label: '⟳ Running' },
  pending: { color: '#F59E0B', label: '⏳ Pending' },
  cancelled: { color: '#6B7280', label: '⊘ Cancelled' },
};

export default function DeploymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useAutoLoadToken();
  const { id } = use(params);

  const { data: deployment, loading, error } = useApiData(
    () => api.getDeployment(id),
    { default: null as any }
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading deployment...</p>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !deployment) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ fontSize: '14px', color: '#EF4444' }}>{error || 'Deployment not found'}</p>
      <Link href="/deployments" style={{ fontSize: '13px', color: 'rgb(var(--primary))' }}>← Back to Deployments</Link>
    </div>
  );

  const d = deployment;
  const status = (d.status || 'pending').toLowerCase();
  const st = stColors[status] || stColors.pending;
  const started = d.startedAt || d.createdAt || '';
  const finished = d.finishedAt || d.completedAt || '';
  const duration = started && finished
    ? `${Math.round((new Date(finished).getTime() - new Date(started).getTime()) / 1000)}s`
    : '—';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Link href="/deployments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Deployments
      </Link>
      <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: st.color }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', backgroundColor: `${st.color}12` }}>
            <Rocket style={{ width: '22px', height: '22px', color: st.color }} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>DEP-{d.id}</h1>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>{d.commitMessage || d.version || '—'} → {d.serverName || '—'}</p>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: st.color, padding: '4px 12px', borderRadius: '8px', backgroundColor: `${st.color}12` }}>{st.label}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { l: 'Branch', v: d.branch || d.gitBranch || 'main', i: GitBranch },
            { l: 'Server', v: d.serverName || '—', i: Server },
            { l: 'Deployed By', v: d.userName || d.triggeredBy || '—', i: User },
            { l: 'Duration', v: duration, i: Clock },
          ].map(m => { const I = m.i; return (
            <div key={m.l} style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(var(--border),0.1)' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'rgb(var(--text-muted))', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><I style={{ width: '10px', height: '10px' }} />{m.l}</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '4px 0 0' }}>{m.v}</p>
            </div>
          ); })}
        </div>
        {d.commitMessage && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>Commit Message</h3>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0, padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(var(--border),0.08)', fontFamily: "'JetBrains Mono', monospace" }}>{d.commitMessage}</p>
          </div>
        )}
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 12px' }}>Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { name: 'Created', time: started ? new Date(started).toLocaleString() : '—' },
            { name: 'Completed', time: finished ? new Date(finished).toLocaleString() : '—' },
          ].map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(var(--border),0.08)' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: st.color, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{s.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
