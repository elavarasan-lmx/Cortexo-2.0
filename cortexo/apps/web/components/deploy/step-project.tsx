'use client';
import { Loader2, Server, Copy, FolderPlus, GitBranch } from 'lucide-react';
import { inp, lbl } from './shared';

interface StepProjectProps {
  projects: any[];
  serverList: any[];
  selectedProject: string;
  onProjectChange: (id: string) => void;
  resolving: boolean;
  resolved: any;
  branch: string;
  environment: string;
  serverId: number;
  remotePath: string;
  healthCheckUrl: string;
  sourceTemplateInfo: { name: string; repoUrl: string; branch: string } | null;
  clientGitInfo: { name: string; repoUrl: string; branch: string; templatePath: string } | null;
}

export default function StepProject({
  projects, serverList, selectedProject, onProjectChange,
  resolving, resolved,
  branch, environment, serverId, remotePath, healthCheckUrl,
  sourceTemplateInfo, clientGitInfo,
}: StepProjectProps) {
  return (
    <>
      <div>
        <label style={lbl}>Project</label>
        <select value={selectedProject} onChange={e => onProjectChange(e.target.value)} style={{ ...inp, fontFamily: 'inherit' }}>
          <option value="">Select a project...</option>
          {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {resolving && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
          <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />Resolving...
        </div>
      )}

      {resolved && (
        <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          <strong>{resolved.projectName}</strong> → {resolved.matchedServerName || 'No server'} ({resolved.matchedServerIp || '—'})
        </div>
      )}

      {/* Source Template */}
      {sourceTemplateInfo && (
        <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <label style={{ ...lbl, color: '#818CF8', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Copy style={{ width: '12px', height: '12px' }} /> SOURCE TEMPLATE
            <span style={{ fontWeight: 400, fontSize: '10px', color: 'rgb(var(--text-muted))', textTransform: 'none' }}>Same for all clients</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '40px' }}>Name</span>
              <span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{sourceTemplateInfo.name}</span>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.08)', fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono',monospace", display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><GitBranch style={{ width: '11px', height: '11px', color: '#818CF8', flexShrink: 0 }} /><span style={{ color: '#818CF8', fontWeight: 600 }}>{sourceTemplateInfo.branch}</span></div>
              <div style={{ wordBreak: 'break-all', lineHeight: 1.5, paddingLeft: '17px' }}>{sourceTemplateInfo.repoUrl}</div>
            </div>
          </div>
        </div>
      )}

      {/* Client Git */}
      {clientGitInfo && (
        <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <label style={{ ...lbl, color: '#10B981', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderPlus style={{ width: '12px', height: '12px' }} /> CLIENT GIT
            <span style={{ fontWeight: 400, fontSize: '10px', color: 'rgb(var(--text-muted))', textTransform: 'none' }}>From project settings</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '40px' }}>Name</span>
              <span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{clientGitInfo.name}</span>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.08)', fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono',monospace", display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><GitBranch style={{ width: '11px', height: '11px', color: '#10B981', flexShrink: 0 }} /><span style={{ color: '#10B981', fontWeight: 600 }}>{clientGitInfo.branch}</span></div>
              <div style={{ wordBreak: 'break-all', lineHeight: 1.5, paddingLeft: '17px' }}>{clientGitInfo.repoUrl}</div>
              {clientGitInfo.templatePath && <div style={{ paddingLeft: '17px', color: 'rgb(var(--text-primary))', fontWeight: 500 }}>{clientGitInfo.templatePath}</div>}
            </div>
          </div>
        </div>
      )}

      {!clientGitInfo && !resolving && selectedProject && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>
          ⚠️ No Client Git found for this project. Add repository info in project settings.
        </div>
      )}

      {/* Deploy Config summary */}
      <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)' }}>
        <label style={{ ...lbl, color: '#FBBF24', margin: '0 0 10px', display: 'block' }}>
          ⚙️ DEPLOY CONFIG <span style={{ fontWeight: 400, fontSize: '10px', color: 'rgb(var(--text-muted))', textTransform: 'none' }}>Auto-resolved from project</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '70px' }}>Branch</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{branch || '—'}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '70px' }}>Env</span><span style={{ color: '#FBBF24', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>{environment}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '70px' }}>Server</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{serverList.find((s: any) => s.id === serverId)?.name || '—'} {serverId ? `(${serverList.find((s: any) => s.id === serverId)?.privateIp || ''})` : ''}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '70px' }}>Health</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', wordBreak: 'break-all' }}>{healthCheckUrl || '—'}</span></div>
        </div>
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '70px' }}>Path</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', wordBreak: 'break-all' }}>{remotePath || '—'}</span></div>
      </div>

      {/* Log Cleanup preview */}
      <div style={{ marginTop: '4px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#F59E0B', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚡ Log Cleanup <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgb(var(--text-muted))', textTransform: 'none', letterSpacing: 0 }}>— auto-executed on every deploy</span>
        </p>
        <pre style={{ margin: 0, padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(245,158,11,0.12)', fontSize: '10px', fontFamily: "'JetBrains Mono',monospace", color: 'rgb(var(--text-muted))', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: '180px', overflow: 'auto' }}>
{`> ${remotePath || '<path>'}/lmxtrade/winbullliteapi/storage/logs/lumen.log
find ${remotePath || '<path>'}/application/logs -name 'log-*.php' -exec truncate -s 0 {} +
find ${remotePath || '<path>'}/admin/application/logs -name 'log-*.php' -exec truncate -s 0 {} +
rm -rf ${remotePath || '<path>'}/lmxtrade/winbullliteapi/storage/framework/{cache,sessions,views}/*
pm2 flush ${(remotePath || '').split('/').pop() || '<slug>'}-ws
pm2 flush ${(remotePath || '').split('/').pop() || '<slug>'}-socketio`}
        </pre>
      </div>
    </>
  );
}
