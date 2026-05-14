'use client';

import { useEffect, useState } from 'react';
import {
  Rocket, ArrowLeft, GitBranch, Server, Clock, CheckCircle,
  XCircle, Loader2, User, Terminal, FileCode, ExternalLink, RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';


const statusIcon: Record<string, { icon: any; color: string }> = {
  success: { icon: CheckCircle, color: '#10B981' },
  completed: { icon: CheckCircle, color: '#10B981' },
  failed: { icon: XCircle, color: '#EF4444' },
  running: { icon: Loader2, color: '#3B82F6' },
  pending: { icon: Clock, color: '#F59E0B' },
  queued: { icon: Clock, color: '#818CF8' },
};

export default function DeployDetailPage() {
  useAutoLoadToken();
  const params = useSearchParams();
  const id = params.get('id');
  const [deploy, setDeploy] = useState<any>(null);
  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setLoading(false); setError('No deployment ID provided'); return; }
    Promise.all([
      api.getDeployment(id).then(r => setDeploy(r.data)).catch(() => {}),
      api.getDeploymentLogs(id).then(r => setLogs(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '10px' }}>
        <Loader2 style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>Loading deployment...</span>
        <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !deploy) {
    return (
      <div>
        <Link href="/deployments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Deployments
        </Link>
        <div className="cx-card cx-border" style={{ padding: '40px', textAlign: 'center' }}>
          <XCircle style={{ width: '32px', height: '32px', color: '#EF4444', marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', color: '#EF4444', margin: 0 }}>{error || 'Deployment not found'}</p>
        </div>
      </div>
    );
  }

  const d = deploy;
  const status = d.status || 'pending';
  const stInfo = statusIcon[status] || statusIcon.pending;
  const StIcon = stInfo.icon;

  return (
    <div>
      <Link href="/deployments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Deployments
      </Link>

      {/* Hero */}
      <div className="cx-card cx-border" style={{ marginBottom: '20px', background: `linear-gradient(135deg, ${stInfo.color}08, rgba(var(--primary),0.03))` }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: `${stInfo.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Rocket style={{ width: '24px', height: '24px', color: stInfo.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{d.projectName || d.project || `Deploy #${d.id?.slice(0, 8)}`}</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: `${stInfo.color}15`, color: stInfo.color, textTransform: 'capitalize' }}>
                <StIcon style={{ width: '11px', height: '11px' }} /> {status}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', textTransform: 'uppercase' }}>{d.environment || 'production'}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgb(var(--text-muted))', flexWrap: 'wrap' }}>
              {d.branch && <span className="cx-flex cx-items-center cx-gap-4"><GitBranch style={{ width: '11px', height: '11px' }} />{d.branch}</span>}
              {d.commitSha && <span className="cx-flex cx-items-center cx-gap-4"><FileCode style={{ width: '11px', height: '11px' }} />{d.commitSha.slice(0, 7)}</span>}
              {d.serverName && <span className="cx-flex cx-items-center cx-gap-4"><Server style={{ width: '11px', height: '11px' }} />{d.serverName}</span>}
              {d.triggeredBy && <span className="cx-flex cx-items-center cx-gap-4"><User style={{ width: '11px', height: '11px' }} />{d.triggeredBy}</span>}
              {d.createdAt && <span className="cx-flex cx-items-center cx-gap-4"><Clock style={{ width: '11px', height: '11px' }} />{new Date(d.createdAt).toLocaleString()}</span>}
            </div>
          </div>
          {status === 'success' || status === 'completed' ? (
            <button onClick={() => api.rollbackDeployment(d.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#EF4444' }}>
              <RotateCcw style={{ width: '13px', height: '13px' }} /> Rollback
            </button>
          ) : null}
        </div>
      </div>

      {/* Commit message */}
      {d.commitMessage && (
        <div className="cx-card cx-border" style={{ padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCode style={{ width: '14px', height: '14px', color: '#818CF8', flexShrink: 0 }} />
          <code style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{d.commitMessage}</code>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
        {/* Pipeline Steps */}
        <div className="cx-card cx-border">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Pipeline Steps</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {logs?.logs && logs.logs.length > 0 ? logs.logs.map((step: any, i: number) => {
              const si = step.exitCode === 0 ? statusIcon.success : step.exitCode != null ? statusIcon.failed : statusIcon.running;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < logs.logs.length - 1 ? '12px' : 0, position: 'relative' }}>
                  {i < logs.logs.length - 1 && <div style={{ position: 'absolute', left: '10px', top: '22px', bottom: '-6px', width: '1.5px', backgroundColor: si.color, opacity: 0.2 }} />}
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: `${si.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <si.icon style={{ width: '11px', height: '11px', color: si.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{step.step || `Step ${i + 1}`}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : '—'}</span>
                </div>
              );
            }) : (
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No step data available</p>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="cx-card cx-border">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal style={{ width: '14px', height: '14px', color: '#10B981' }} /> Build Logs
            </h3>
          </div>
          <div style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.03)', maxHeight: '400px', overflowY: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '12px', lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-primary))', whiteSpace: 'pre-wrap' }}>
              {logs?.logs ? logs.logs.map((s: any) => `[${s.step}] ${s.stdout || ''}${s.stderr ? '\n⚠ ' + s.stderr : ''}`).join('\n') : 'No logs available yet.'}
            </pre>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
