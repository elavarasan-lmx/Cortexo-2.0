'use client';

import {
  Rocket, ArrowLeft, GitBranch, Server, Clock, CheckCircle,
  XCircle, Loader2, User, Terminal, FileCode, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

const demoDeploy = {
  id: 1, project: 'WinBull Web', branch: 'main', commit: 'a3f7c21',
  commitMsg: 'fix: rate limiter overflow in limit orders',
  server: 'prod-api-01', environment: 'production',
  status: 'success', triggeredBy: 'Jerry',
  startedAt: '2025-05-02 14:30:00', completedAt: '2025-05-02 14:32:45',
  duration: '2m 45s',
  steps: [
    { name: 'Clone Repository', status: 'success', duration: '8s' },
    { name: 'Install Dependencies', status: 'success', duration: '32s' },
    { name: 'Run Tests', status: 'success', duration: '1m 15s' },
    { name: 'Build Production', status: 'success', duration: '28s' },
    { name: 'Upload Artifacts', status: 'success', duration: '12s' },
    { name: 'Restart Services', status: 'success', duration: '10s' },
  ],
  logs: `[14:30:00] 🚀 Starting deployment...
[14:30:00] Cloning git@github.com:winbull/web.git#main
[14:30:08] ✓ Repository cloned successfully
[14:30:08] Running npm ci --production
[14:30:40] ✓ Dependencies installed (1,247 packages)
[14:30:40] Running npm test
[14:31:55] ✓ 342 tests passed, 0 failed
[14:31:55] Running npm run build
[14:32:23] ✓ Build completed (dist: 4.2MB)
[14:32:23] Uploading artifacts to prod-api-01
[14:32:35] ✓ Artifacts uploaded
[14:32:35] Restarting pm2 services...
[14:32:45] ✓ All services restarted
[14:32:45] ✅ Deployment completed successfully!`,
};

const statusIcon: Record<string, { icon: any; color: string }> = {
  success: { icon: CheckCircle, color: '#10B981' },
  failed: { icon: XCircle, color: '#EF4444' },
  running: { icon: Loader2, color: '#3B82F6' },
};

export default function DeployDetailPage() {
  const d = demoDeploy;
  const stInfo = statusIcon[d.status] || statusIcon.success;

  return (
    <div>
      <Link href="/deployments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Deployments
      </Link>

      {/* Hero */}
      <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(var(--primary),0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: `${stInfo.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Rocket style={{ width: '24px', height: '24px', color: stInfo.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{d.project}</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: `${stInfo.color}15`, color: stInfo.color, textTransform: 'capitalize' }}>
                <stInfo.icon style={{ width: '11px', height: '11px' }} /> {d.status}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', textTransform: 'uppercase' }}>{d.environment}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GitBranch style={{ width: '11px', height: '11px' }} />{d.branch}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileCode style={{ width: '11px', height: '11px' }} />{d.commit}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Server style={{ width: '11px', height: '11px' }} />{d.server}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User style={{ width: '11px', height: '11px' }} />{d.triggeredBy}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '11px', height: '11px' }} />{d.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Commit message */}
      <div style={{ ...card, padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileCode style={{ width: '14px', height: '14px', color: '#818CF8', flexShrink: 0 }} />
        <code style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{d.commitMsg}</code>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
        {/* Pipeline Steps */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Pipeline Steps</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {d.steps.map((step, i) => {
              const si = statusIcon[step.status] || statusIcon.success;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < d.steps.length - 1 ? '12px' : 0, position: 'relative' }}>
                  {i < d.steps.length - 1 && <div style={{ position: 'absolute', left: '10px', top: '22px', bottom: '-6px', width: '1.5px', backgroundColor: si.color, opacity: 0.2 }} />}
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: `${si.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <si.icon style={{ width: '11px', height: '11px', color: si.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{step.name}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{step.duration}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logs */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal style={{ width: '14px', height: '14px', color: '#10B981' }} /> Build Logs
            </h3>
            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
              <ExternalLink style={{ width: '10px', height: '10px' }} /> Full Log
            </button>
          </div>
          <div style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.03)', maxHeight: '400px', overflowY: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '12px', lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-primary))', whiteSpace: 'pre-wrap' }}>
              {d.logs}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
