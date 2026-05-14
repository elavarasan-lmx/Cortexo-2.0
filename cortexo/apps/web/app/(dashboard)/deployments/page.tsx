'use client';

import {
  Rocket, CheckCircle, XCircle, Clock, Loader2, RotateCcw,
  GitBranch, MoreVertical, Timer, Activity, Trash2, Edit3, Save,
  ChevronUp, Terminal as TerminalIcon, Search,
  Calendar,
} from 'lucide-react';
import DeployForm, { type DeployFormInitialData } from '@/components/deploy-form';
import { useModal } from '@/components/modal-provider';
import { useState, useEffect } from 'react';
import { Deployment, Project, Server, api } from '@/lib/api';
import { useCortexoQuery, useProjectLookup, resolveProjectName, timeAgo, formatDuration } from '@/lib/hooks';

import { useToastStore } from '@/lib/toast-store';



/* ─── Status config ─── */
const statusMap: Record<string, { icon: typeof CheckCircle; color: string; label: string; bg: string }> = {
  success:     { icon: CheckCircle, color: '#10B981', label: 'Deployed',    bg: 'rgba(16,185,129,0.12)'  },
  failed:      { icon: XCircle,     color: '#EF4444', label: 'Failed',      bg: 'rgba(239,68,68,0.12)'   },
  running:     { icon: Loader2,     color: '#3B82F6', label: 'Running',     bg: 'rgba(59,130,246,0.12)'  },
  deploying:   { icon: Loader2,     color: '#3B82F6', label: 'Deploying',   bg: 'rgba(59,130,246,0.12)'  },
  rolled_back: { icon: RotateCcw,   color: '#F59E0B', label: 'Rolled Back', bg: 'rgba(245,158,11,0.12)'  },
  pending:     { icon: Clock,       color: '#6B7280', label: 'Pending',     bg: 'rgba(107,114,128,0.12)' },
};

/* ─── Environment badge colors ─── */
const envColors: Record<string, { color: string; bg: string }> = {
  production:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
  staging:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  development: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
};

/* ─── Date range options ─── */
const dateRanges = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'All Time', days: -1 },
] as const;

/* ─── Expandable log viewer ─── */
function DeployLogViewer({ deployId }: { deployId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.getDeploymentLogs(deployId).then((res: any) => {
      const data = res?.data || res;
      setLogs(data?.logs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [deployId]);

  if (loading) return <div className="cx-text-muted" style={{ padding: '12px', fontSize: '12px' }}>Loading logs...</div>;
  if (!logs.length) return <div className="cx-text-muted" style={{ padding: '12px', fontSize: '12px' }}>No logs available</div>;

  return (
    <div style={{
      backgroundColor: '#0d1117', borderRadius: '8px', padding: '12px', margin: '0 16px 12px',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '11px', lineHeight: 1.7,
      color: '#c9d1d9', maxHeight: '240px', overflowY: 'auto', border: '1px solid #21262d',
    }}>
      {logs.map((log: any, i: number) => (
        <div key={i} style={{ marginBottom: '2px' }}>
          <span style={{ color: log.exitCode === 0 ? '#3fb950' : '#f85149', fontWeight: 600 }}>[{log.step}]</span>{' '}
          <span style={{ color: '#6e7681' }}>{(log.durationMs / 1000).toFixed(1)}s</span>{' '}
          <span>{log.stdout?.substring(0, 200) || log.stderr?.substring(0, 200)}</span>
        </div>
      ))}
    </div>
  );
}

/* DeployForm imported from @/components/deploy-form */

export default function DeploymentsPage() {
  const toast = useToastStore();
  const { confirm } = useModal();

  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeploy, setShowDeploy] = useState(false);
  const [editInitialData, setEditInitialData] = useState<DeployFormInitialData | undefined>(undefined);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ environment: '', branch: '', commitMessage: '', status: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(7);
  const [showDateDropdown, setShowDateDropdown] = useState(false);




  // Click outside to close context menu
  useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-trigger]') && !target.closest('[data-menu-dropdown]')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenId]);

  const startEdit = (deploy: any) => {
    setMenuOpenId(null);
    // Build initialData from deployment record for the DeployForm
    const data: DeployFormInitialData = {
      projectId: deploy.projectId,
      branch: deploy.branch || 'main',
      environment: deploy.environment || 'production',
      serverId: deploy.serverId || 0,
      remotePath: deploy.remotePath || '',
      preDeployCmd: deploy.preDeployCmd || '',
      postDeployCmd: deploy.postDeployCmd || '',
      healthCheckUrl: deploy.healthCheckUrl || '',
    };
    // If deployment has stored nginx/db/pm2 config, populate those too
    if (deploy.nginx) {
      data.nginxDomain = deploy.nginx.domain || '';
      data.nginxPort = deploy.nginx.port || '80';
      data.nginxRoot = deploy.nginx.root || '';
      data.phpVer = deploy.nginx.phpVer || '8.3';
      data.socketPort = deploy.nginx.socketPort || '';
      data.rateSocketPort = deploy.nginx.rateSocketPort || '';
      data.wsPort = deploy.nginx.wsPort || '';
      data.sslCert = deploy.nginx.sslCert || '';
      data.sslKey = deploy.nginx.sslKey || '';
    }
    if (deploy.database) {
      data.dbHost = deploy.database.host || '';
      data.dbPort = deploy.database.port || '3306';
      data.dbName = deploy.database.name || '';
      data.dbUser = deploy.database.user || '';
      data.dbPass = deploy.database.password || '';
    }
    if (deploy.pm2) {
      data.pm2Name = deploy.pm2.name || '';
      data.pm2Script = deploy.pm2.script || '';
      data.pm2Interpreter = deploy.pm2.interpreter || 'node';
      data.pm2Instances = deploy.pm2.instances || '1';
    }
    if (deploy.permissions) {
      data.permUser = deploy.permissions.user || 'ubuntu';
      data.permGroup = deploy.permissions.group || 'ubuntu';
      data.permFile = deploy.permissions.fileMode || '644';
      data.permDir = deploy.permissions.dirMode || '755';
    }
    setEditInitialData(data);
    setShowDeploy(true);
  };
  const saveEdit = async () => {
    if (!editId) return;
    setEditSaving(true);
    try {
      await api.updateDeployment(editId, editForm);
      await refetch();
      setEditId(null);
      toast.success('Deployment Updated', 'Changes saved successfully.');
    } catch (err: unknown) {
      toast.error('Update Failed', err instanceof Error ? err.message : 'Could not save changes.');
    }
    setEditSaving(false);
  };
  const { lookup } = useProjectLookup();
  const { data: deployments, isLoading: loading, refetch } = useCortexoQuery(
    ['deployments'],
    () => api.getDeployments(),
  );


  /* ─── Auto-refresh when deploys are running ─── */
  useEffect(() => {
    const allDeps = (deployments || []) as { status?: string }[];
    const hasActive = allDeps.some((d) => d.status === 'running' || d.status === 'deploying');
    if (!hasActive) return;
    const iv = setInterval(() => { refetch(); }, 8000);
    return () => clearInterval(iv);
  }, [deployments, refetch]);

  if (loading) {
    return (
      <div className="cx-flex-center" style={{ height: '256px' }}>
        <Loader2 className="cx-spin cx-text-accent" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  const allDeploys = (deployments as any[]) || [];

  // Date range filter
  const now = new Date();
  const dateFiltered = dateRange === -1 ? allDeploys : allDeploys.filter((d: Deployment) => {
    const created = new Date(d.createdAt);
    if (dateRange === 0) {
      return created.getDate() === now.getDate() && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }
    const cutoff = new Date(now.getTime() - dateRange * 24 * 60 * 60 * 1000);
    return created >= cutoff;
  });

  const searched = searchQuery.trim()
    ? dateFiltered.filter((d: Deployment) => {
        const q = searchQuery.toLowerCase();
        const projName = resolveProjectName(d.projectId, lookup).toLowerCase();
        return projName.includes(q) || (d.branch || '').toLowerCase().includes(q) || (d.commitMessage || '').toLowerCase().includes(q) || (d.environment || '').toLowerCase().includes(q);
      })
    : dateFiltered;
  const filtered = filter === 'all' ? searched : searched.filter((d: Deployment) => d.status === filter);

  // Compute stats
  const totalDeploys = dateFiltered.length;
  const successDeploys = dateFiltered.filter((d: Deployment) => d.status === 'success').length;
  const successRate = totalDeploys > 0 ? ((successDeploys / totalDeploys) * 100).toFixed(1) : '0.0';
  
  // Calculate average duration for successful deployments
  const successWithDuration = dateFiltered.filter((d: Deployment) => d.status === 'success' && d.durationMs);
  const avgDurationMs = successWithDuration.length > 0 
    ? successWithDuration.reduce((acc: number, d: Deployment) => acc + (d.durationMs ?? 0), 0) / successWithDuration.length 
    : 0;
  
  const failedToday = dateFiltered.filter((d: Deployment) => {
    if (d.status !== 'failed') return false;
    const date = new Date(d.createdAt);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }).length;

  const dateLabel = dateRanges.find(r => r.days === dateRange)?.label || 'Last 7 Days';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* ─── Header ─── */}
      <div className="cx-flex-between cx-mb-24">
        <div className="cx-flex cx-items-center cx-gap-16">
          <h1 className="cx-fw-700 cx-text-primary cx-page-title" style={{ margin: 0 }}>Deployments</h1>
          <div className="cx-flex cx-items-center cx-gap-6" style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
            <span className="cx-fw-500" style={{ fontSize: '11px', color: '#16A34A' }}>Live • Updated 5s ago</span>
          </div>
        </div>
        <button
          onClick={() => setShowDeploy(true)}
          className="cx-btn-primary cx-flex cx-items-center cx-gap-8"
          style={{ padding: '12px 20px', fontSize: '14px' }}
        >
          + New Deploy
        </button>
      </div>

      {/* ─── Sub-page Tabs ─── */}

      {/* ─── Stat Cards ─── */}
      <div className="cx-stats-4 cx-mb-24">
        <div className="cx-card cx-border cx-flex-col" style={{ padding: '18px', gap: '6px' }}>
          <p className="cx-fw-500 cx-text-muted cx-text-12" style={{ margin: 0 }}>Total Deploys</p>
          <p className="cx-fw-700 cx-text-primary" style={{ margin: 0, fontSize: '28px' }}>{totalDeploys}</p>
          <p className="cx-fw-500 cx-text-muted cx-text-11" style={{ margin: 0 }}>All time</p>
        </div>
        <div className="cx-card cx-border cx-flex-col" style={{ padding: '18px', gap: '6px' }}>
          <p className="cx-fw-500 cx-text-muted cx-text-12" style={{ margin: 0 }}>Success Rate</p>
          <p className="cx-fw-700" style={{ margin: 0, fontSize: '28px', color: '#16A34A' }}>{successRate}%</p>
          <p className="cx-fw-500 cx-text-11" style={{ margin: 0, color: successDeploys > 0 ? '#16A34A' : 'rgb(var(--text-muted))' }}>{successDeploys} of {totalDeploys}</p>
        </div>
        <div className="cx-card cx-border cx-flex-col" style={{ padding: '18px', gap: '6px' }}>
          <p className="cx-fw-500 cx-text-muted cx-text-12" style={{ margin: 0 }}>Avg Duration</p>
          <p className="cx-fw-700 cx-text-primary" style={{ margin: 0, fontSize: '28px' }}>{avgDurationMs ? formatDuration(avgDurationMs) : '0s'}</p>
          <p className="cx-fw-500 cx-text-muted cx-text-11" style={{ margin: 0 }}>Across successful deploys</p>
        </div>
        <div className="cx-card cx-border cx-flex-col" style={{ padding: '18px', gap: '6px' }}>
          <p className="cx-fw-500 cx-text-muted cx-text-12" style={{ margin: 0 }}>Failed Today</p>
          <p className="cx-fw-700" style={{ margin: 0, fontSize: '28px', color: '#EF4444' }}>{failedToday}</p>
          <p className="cx-fw-500 cx-text-11" style={{ margin: 0, color: failedToday > 0 ? '#EF4444' : 'rgb(var(--text-muted))' }}>{failedToday > 0 ? 'Needs attention' : 'All clear'}</p>
        </div>
      </div>

      {/* ─── Filter Row ─── */}
      <div className="cx-flex-between cx-mb-16">
        <div className="cx-flex cx-items-center cx-gap-12">
          {[
            { key: 'all', label: `All (${dateFiltered.length})`, activeColor: 'rgb(var(--primary))', activeBg: 'rgb(var(--primary))' },
            { key: 'success', label: `Success (${dateFiltered.filter((d: Deployment) => d.status === 'success').length})`, activeColor: '#16A34A', activeBg: 'rgba(22,163,74,0.2)' },
            { key: 'deploying', label: `⟳ Building (${dateFiltered.filter((d: Deployment) => d.status === 'deploying' || d.status === 'running').length})`, activeColor: '#D97706', activeBg: 'rgba(217,119,6,0.2)' },
            { key: 'failed', label: `Failed (${dateFiltered.filter((d: Deployment) => d.status === 'failed').length})`, activeColor: '#EF4444', activeBg: 'rgba(239,68,68,0.2)' },
          ].map(btn => (
            <button key={btn.key} onClick={() => setFilter(btn.key)} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: filter === btn.key ? 600 : 500, transition: 'all 150ms',
              backgroundColor: filter === btn.key ? btn.activeBg : 'rgba(var(--text-muted), 0.1)',
              color: filter === btn.key ? (btn.key === 'all' ? '#FFFFFF' : btn.activeColor) : 'rgb(var(--text-muted))',
            }}>{btn.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="cx-flex cx-items-center cx-gap-6 cx-btn-secondary"
            style={{ padding: '8px 12px' }}
          >
            <Calendar style={{ width: '13px', height: '13px' }} className="cx-text-muted" />
            <span className="cx-fw-500 cx-text-muted" style={{ fontSize: '12px' }}>{dateLabel}</span>
            <span className="cx-text-muted" style={{ fontSize: '10px' }}>▾</span>
          </button>
          {showDateDropdown && (
            <div className="cx-dropdown">
              {dateRanges.map(r => (
                <button key={r.days} onClick={() => { setDateRange(r.days); setShowDateDropdown(false); }} className="cx-dropdown-item" style={{
                  fontWeight: dateRange === r.days ? 600 : 400,
                  backgroundColor: dateRange === r.days ? 'rgba(var(--primary), 0.15)' : 'transparent',
                  color: dateRange === r.days ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                }}>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Deployments Table ─── */}
      <div className="cx-card cx-border cx-overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr className="cx-table-head">
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13">Deploy ID</th>
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13">Project</th>
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13">Branch</th>
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13">Env</th>
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13">Status</th>
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13">Duration</th>
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13">Triggered By</th>
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13">Time</th>
              <th className="cx-fw-600 cx-text-secondary cx-p-16 cx-text-13" style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((deploy: any) => {
              const st = statusMap[deploy.status] || statusMap.pending;
              const env = envColors[deploy.environment] || envColors.development;
              const projectName = resolveProjectName(deploy.projectId, lookup);
              
              // Generate user color/initials for "Triggered By"
              const getBadgeColor = (name: string) => {
                const colors = ['#7C3AED', '#3B82F6', '#EC4899', '#10B981', '#F59E0B'];
                return colors[name.charCodeAt(0) % colors.length];
              };
              const triggerName = deploy.triggeredBy || (deploy.status === 'running' || deploy.status === 'deploying' ? 'CI/CD' : 'System');
              const triggerInitials = triggerName.substring(0, 2).toUpperCase();

              return (
                <tr key={deploy.id} style={{ borderBottom: '1px solid rgb(var(--border))', transition: 'background-color 150ms' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Deploy ID */}
                  <td className="cx-fw-600 cx-text-accent cx-mono cx-p-16 cx-text-13">
                    #{deploy.id.toString().substring(0, 6)}
                  </td>
                  {/* Project */}
                  <td className="cx-text-primary cx-p-16 cx-text-13">{projectName}</td>
                  {/* Branch */}
                  <td className="cx-text-secondary cx-mono cx-p-16 cx-text-13">{deploy.branch || 'main'}</td>
                  {/* Env */}
                  <td className="cx-p-16">
                    <span className="cx-fw-600" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', backgroundColor: env.bg, color: env.color }}>
                      {deploy.environment.charAt(0).toUpperCase() + deploy.environment.slice(1, 4)}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="cx-p-16">
                    <span className="cx-flex cx-items-center cx-gap-4 cx-fw-600" style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', backgroundColor: st.bg, color: st.color }}>
                      <st.icon style={{ width: '12px', height: '12px' }} className={deploy.status === 'deploying' ? 'cx-spin' : ''} />
                      {st.label}
                    </span>
                  </td>
                  {/* Duration */}
                  <td className="cx-text-secondary cx-p-16 cx-text-13">{deploy.durationMs ? formatDuration(deploy.durationMs) : '—'}</td>
                  {/* Triggered By */}
                  <td className="cx-p-16">
                    <div className="cx-flex cx-items-center cx-gap-6">
                      <div className="cx-flex-center cx-fw-600" style={{ width: '20px', height: '20px', borderRadius: '10px', backgroundColor: getBadgeColor(triggerName), color: '#FFF', fontSize: '9px' }}>
                        {triggerInitials}
                      </div>
                      <span className="cx-fw-500 cx-text-primary cx-text-12">{triggerName}</span>
                    </div>
                  </td>
                  {/* Time */}
                  <td className="cx-text-muted cx-p-16 cx-text-13">{timeAgo(deploy.createdAt)}</td>
                  
                  {/* Actions */}
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div className="cx-flex cx-items-center cx-gap-8" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => startEdit(deploy)} title="View Details" className="cx-icon-btn" style={{ padding: '4px 8px', backgroundColor: 'rgba(var(--text-muted), 0.1)', color: 'rgb(var(--text-secondary))' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.1)'}>
                        <Search style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button onClick={() => setExpandedId(expandedId === deploy.id ? null : deploy.id)} title="Logs" className="cx-icon-btn" style={{ padding: '4px 8px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)'}>
                        <TerminalIcon style={{ width: '14px', height: '14px' }} />
                      </button>
                      {deploy.status === 'failed' && (
                        <button onClick={async () => {
                          try {
                            await api.triggerDeploy({ projectId: deploy.projectId, branch: deploy.branch || 'main', environment: deploy.environment || 'production' });
                            refetch(); toast.success('Retrying', `Deployment triggered.`);
                          } catch (err: unknown) { toast.error('Retry Failed', 'Could not trigger deploy.'); }
                        }} title="Retry" className="cx-icon-btn" style={{ padding: '4px 10px', backgroundColor: 'rgb(var(--primary))', color: '#FFF' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.8)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgb(var(--primary))'}
                        >
                          <RotateCcw style={{ width: '14px', height: '14px' }} />
                        </button>
                      )}
                      <button onClick={async () => {
                        const ok = await confirm({
                          title: 'Delete Deployment',
                          message: `Are you sure you want to delete deployment "${`#${deploy.id.toString().substring(0, 6)} (${projectName})`}"? This action cannot be undone.`,
                          confirmText: 'Delete',
                          variant: 'danger',
                        });
                        if (!ok) return;
                        try { await api.deleteDeployment(deploy.id); refetch(); toast.success('Deleted', 'Deployment record removed.'); }
                        catch (err: unknown) { toast.error('Delete Failed', err instanceof Error ? err.message : 'Could not delete deployment.'); }
                      }} title="Delete" className="cx-icon-btn" style={{ padding: '4px 8px', backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={9} style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <Rocket className="cx-text-muted" style={{ width: '24px', height: '24px', margin: '0 auto 12px' }} />
                  <p className="cx-fw-600 cx-text-primary" style={{ margin: 0, fontSize: '14px' }}>No deployments found</p>
                  <p className="cx-text-secondary" style={{ margin: '4px 0 0', fontSize: '13px' }}>Deploy your first project to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Expanded Logs Container */}
      {expandedId && (
        <div style={{ marginTop: '16px', animation: 'fadeIn 200ms ease-in' }}>
          <DeployLogViewer deployId={expandedId} />
        </div>
      )}

      {/* Modals */}
      {showDeploy && <DeployForm onClose={() => { setShowDeploy(false); setEditInitialData(undefined); }} onSuccess={() => { setShowDeploy(false); setEditInitialData(undefined); refetch(); toast.success('Deployment Started', 'Your deployment has been triggered.'); }} initialData={editInitialData} />}
    </div>
  );
}
