'use client';

import {
  Rocket, CheckCircle, XCircle, Clock, Loader2, RotateCcw,
  GitBranch, MoreVertical, Timer, Activity, Trash2, Edit3, Save,
  ChevronUp, Terminal, Search, Layers, Zap, GitCompareArrows,
} from 'lucide-react';
import DeployForm, { type DeployFormInitialData } from '@/components/deploy-form';
import ConfirmModal from '@/components/confirm-modal';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, useProjectLookup, resolveProjectName, timeAgo, formatDuration } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

/* ─── Stat card definitions ─── */
const statCards = [
  { key: 'total',   label: 'Total Deploys', color: '#818CF8', icon: Rocket   },
  { key: 'success', label: 'Successful',    color: '#10B981', icon: CheckCircle },
  { key: 'failed',  label: 'Failed',        color: '#EF4444', icon: XCircle  },
  { key: 'active',  label: 'Active Now',    color: '#3B82F6', icon: Activity },
] as const;

const filters = ['all', 'success', 'failed', 'running', 'deploying', 'pending', 'rolled_back'] as const;

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

  if (loading) return <div style={{ padding: '12px', color: 'rgb(var(--text-muted))', fontSize: '12px' }}>Loading logs...</div>;
  if (!logs.length) return <div style={{ padding: '12px', color: 'rgb(var(--text-muted))', fontSize: '12px' }}>No logs available</div>;

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
  useAutoLoadToken();
  const toast = useToastStore();
  const pathname = usePathname();
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeploy, setShowDeploy] = useState(false);
  const [editInitialData, setEditInitialData] = useState<DeployFormInitialData | undefined>(undefined);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ environment: '', branch: '', commitMessage: '', status: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  /* ─── Sub-page tabs ─── */
  const tabs = [
    { label: 'Deployments', href: '/deployments', icon: Rocket },
    { label: 'Canary', href: '/deployments/canary', icon: Zap },
    { label: 'Batch Deploy', href: '/deployments/batch', icon: Layers },
    { label: 'Compare', href: '/deployments/compare', icon: GitCompareArrows },
  ];

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
    if (deploy.crons) data.crons = deploy.crons;
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
  const { data: deployments, loading, refetch } = useApiData(
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const allDeploys = (deployments as any[]) || [];
  const searched = searchQuery.trim()
    ? allDeploys.filter((d: any) => {
        const q = searchQuery.toLowerCase();
        const projName = resolveProjectName(d.projectId, lookup).toLowerCase();
        return projName.includes(q) || (d.branch || '').toLowerCase().includes(q) || (d.commitMessage || '').toLowerCase().includes(q) || (d.environment || '').toLowerCase().includes(q);
      })
    : allDeploys;
  const filtered = filter === 'all' ? searched : searched.filter((d: any) => d.status === filter);

  const stats = {
    total:   allDeploys.length,
    success: allDeploys.filter((d: any) => d.status === 'success').length,
    failed:  allDeploys.filter((d: any) => d.status === 'failed').length,
    active:  allDeploys.filter((d: any) => d.status === 'running' || d.status === 'deploying').length,
  };

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Deployments</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Deploy history across all servers and environments
          </p>
        </div>
        <button
          onClick={() => setShowDeploy(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
            padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, color: '#fff',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: '0 4px 12px rgba(var(--primary), 0.3)',
            transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--primary), 0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary), 0.3)'; e.currentTarget.style.transform = 'none'; }}
        >
          <Rocket style={{ width: '15px', height: '15px' }} /> Deploy Now
        </button>
      </div>

      {/* ─── Sub-page tabs ─── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid rgb(var(--border))', paddingBottom: '0' }}>
        {tabs.map(t => {
          const active = pathname === t.href;
          const TabIcon = t.icon;
          return (
            <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px', fontSize: '13px', fontWeight: active ? 600 : 500,
                  color: active ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                  borderBottom: active ? '2px solid rgb(var(--primary))' : '2px solid transparent',
                  marginBottom: '-1px', cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                <TabIcon style={{ width: '14px', height: '14px' }} />
                {t.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {statCards.map(s => (
          <div
            key={s.key}
            style={{
              borderRadius: '14px',
              border: '1px solid rgb(var(--border))',
              borderTop: `3px solid ${s.color}`,
              backgroundColor: 'rgb(var(--surface))',
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'box-shadow 200ms, transform 200ms',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${s.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon style={{ width: '17px', height: '17px', color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '26px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{stats[s.key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search + Filter pills ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: '0 0 240px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search deployments..."
            style={{
              width: '100%', padding: '7px 12px 7px 34px', borderRadius: '8px',
              border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
              color: 'rgb(var(--text-primary))', fontSize: '12px', outline: 'none',
              fontFamily: "'Inter', system-ui, sans-serif",
              transition: 'border-color 200ms', boxSizing: 'border-box',
            }}
          />
        </div>
        {filters.map(f => {
          const active = filter === f;
          const st = statusMap[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 600 : 500,
                backgroundColor: active ? (f === 'all' ? 'rgba(var(--primary),0.12)' : `${st?.color}18`) : 'rgb(var(--surface))',
                color: active ? (f === 'all' ? 'rgb(var(--primary))' : st?.color) : 'rgb(var(--text-secondary))',
                outline: active ? `1px solid ${f === 'all' ? 'rgba(var(--primary),0.4)' : `${st?.color}50`}` : '1px solid rgb(var(--border))',
                transition: 'all 150ms',
              }}
            >
              {f === 'all' ? 'All' : st?.label || f}
              {f === 'all' && (
                <span style={{ marginLeft: '5px', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(var(--primary),0.1)', color: 'rgb(var(--primary))' }}>
                  {allDeploys.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Deployment list ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((deploy: any) => {
          const st = statusMap[deploy.status] || statusMap.pending;
          const env = envColors[deploy.environment] || envColors.development;
          const Icon = st.icon;
          const projectName = resolveProjectName(deploy.projectId, lookup);

          return (
            <div
              key={deploy.id}
              className="group"
              style={{
                borderRadius: '12px',
                border: '1px solid rgb(var(--border))',
                borderLeft: `4px solid ${st.color}`,
                backgroundColor: 'rgb(var(--surface))',
                transition: 'box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>
                {/* Status icon */}
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px',
                  backgroundColor: st.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon
                    style={{
                      width: '18px', height: '18px', color: st.color,
                      animation: deploy.status === 'deploying' ? 'spin 1s linear infinite' : 'none',
                    }}
                  />
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
                      {projectName}
                    </h3>
                    {/* Environment badge */}
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px',
                      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                      backgroundColor: env.bg, color: env.color,
                    }}>
                      {deploy.environment}
                    </span>
                    {/* Status badge */}
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '6px',
                      fontSize: '10px', fontWeight: 600,
                      backgroundColor: st.bg, color: st.color,
                    }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Branch + commit + message */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', fontSize: '12px', color: 'rgb(var(--text-muted))', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <GitBranch style={{ width: '11px', height: '11px' }} />
                      {deploy.branch || '—'}
                    </span>
                    {deploy.commitSha && (
                      <code style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: '11px', color: 'rgb(var(--primary))',
                        backgroundColor: 'rgba(var(--primary),0.08)',
                        padding: '1px 6px', borderRadius: '4px', flexShrink: 0,
                      }}>
                        {deploy.commitSha}
                      </code>
                    )}
                    {deploy.commitMessage && (
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                        {deploy.commitMessage}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time + duration */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {timeAgo(deploy.createdAt)}
                  </p>
                  {deploy.durationMs && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', marginTop: '3px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                      <Timer style={{ width: '10px', height: '10px' }} />
                      <span style={{ fontFamily: 'monospace' }}>{formatDuration(deploy.durationMs)}</span>
                    </div>
                  )}
                </div>

                {/* Actions — always subtly visible */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  {deploy.status === 'success' && (
                    <button
                      title="Rollback"
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                        transition: 'background-color 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.1)'; }}
                    >
                      <RotateCcw style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                  <div style={{ position: 'relative' }}>
                    <button
                      data-menu-trigger
                      onClick={() => setMenuOpenId(menuOpenId === deploy.id ? null : deploy.id)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: menuOpenId === deploy.id ? 'rgb(var(--surface-hover))' : 'transparent',
                        color: 'rgb(var(--text-muted))',
                        transition: 'background-color 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                      onMouseLeave={e => { if (menuOpenId !== deploy.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <MoreVertical style={{ width: '15px', height: '15px' }} />
                    </button>

                    {/* Dropdown menu */}
                    {menuOpenId === deploy.id && (
                      <div data-menu-dropdown style={{
                        position: 'absolute', top: '36px', right: 0, zIndex: 50,
                        minWidth: '180px', padding: '4px', borderRadius: '12px',
                        backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      }}>
                        {/* Edit */}
                        <button onClick={() => startEdit(deploy)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'rgb(var(--text-primary))', backgroundColor: 'transparent', textAlign: 'left' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                          <Edit3 style={{ width: 14, height: 14, color: '#818CF8' }} /> Edit Details
                        </button>
                        {/* Redeploy */}
                        <button onClick={async () => {
                          setMenuOpenId(null);
                          try {
                            await api.triggerDeploy({
                              projectId: deploy.projectId, branch: deploy.branch || 'main',
                              environment: deploy.environment || 'production', remotePath: deploy.remotePath || '/var/www',
                            });
                            refetch();
                            toast.success('Redeployed', `Deployment triggered for ${projectName}.`);
                          } catch (err: unknown) { toast.error('Redeploy Failed', err instanceof Error ? err.message : 'Could not trigger deploy.'); }
                        }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'rgb(var(--text-primary))', backgroundColor: 'transparent', textAlign: 'left' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                          <Rocket style={{ width: 14, height: 14, color: 'rgb(var(--primary))' }} /> Redeploy
                        </button>
                        {/* View Logs */}
                        <button onClick={() => { setMenuOpenId(null); setExpandedId(expandedId === deploy.id ? null : deploy.id); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'rgb(var(--text-primary))', backgroundColor: 'transparent', textAlign: 'left' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                          <Terminal style={{ width: 14, height: 14, color: '#818CF8' }} /> View Logs
                        </button>
                        {/* Rollback */}
                        {deploy.status === 'success' && (
                          <button onClick={async () => {
                            setMenuOpenId(null);
                            try { await api.rollbackDeployment(deploy.id); refetch(); toast.success('Rolled Back', 'Rollback deployment created.'); } catch (err: unknown) { toast.error('Rollback Failed', err instanceof Error ? err.message : 'Could not rollback.'); }
                          }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#F59E0B', backgroundColor: 'transparent', textAlign: 'left' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <RotateCcw style={{ width: 14, height: 14 }} /> Rollback
                          </button>
                        )}
                        {/* Divider */}
                        <div style={{ height: '1px', backgroundColor: 'rgb(var(--border))', margin: '4px 0' }} />
                        {/* Delete */}
                        <button onClick={() => {
                          setMenuOpenId(null);
                          setDeleteTarget({ id: deploy.id, name: projectName });
                        }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#EF4444', backgroundColor: 'transparent', textAlign: 'left' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                          <Trash2 style={{ width: 14, height: 14 }} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expand/collapse logs */}
                  <button
                    title="View Logs"
                    onClick={() => setExpandedId(expandedId === deploy.id ? null : deploy.id)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                      backgroundColor: expandedId === deploy.id ? 'rgba(var(--primary),0.12)' : 'transparent',
                      color: expandedId === deploy.id ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                      transition: 'background-color 150ms',
                    }}
                  >
                    {expandedId === deploy.id
                      ? <ChevronUp style={{ width: '15px', height: '15px' }} />
                      : <Terminal style={{ width: '14px', height: '14px' }} />}
                  </button>
                </div>
              </div>

              {/* Expanded logs */}
              {expandedId === deploy.id && (
                <DeployLogViewer deployId={deploy.id} />
              )}

              {/* Inline edit form */}
              {editId === deploy.id && (
                <div style={{ padding: '16px 18px', borderTop: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--primary), 0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Edit3 style={{ width: 15, height: 15, color: 'rgb(var(--primary))' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Edit Deployment</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>Environment</label>
                      <select value={editForm.environment} onChange={e => setEditForm(f => ({ ...f, environment: e.target.value }))} style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', outline: 'none' }}>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                        <option value="development">Development</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>Branch</label>
                      <input value={editForm.branch} onChange={e => setEditForm(f => ({ ...f, branch: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>Status</label>
                      <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', outline: 'none' }}>
                        <option value="pending">Pending</option>
                        <option value="deploying">Deploying</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="rolled_back">Rolled Back</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>Commit Message</label>
                      <input value={editForm.commitMessage} onChange={e => setEditForm(f => ({ ...f, commitMessage: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', outline: 'none' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditId(null)} style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
                    <button onClick={saveEdit} disabled={editSaving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))' }}>
                      {editSaving ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 13, height: 13 }} />} {editSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Empty state ─── */}
      {filtered.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))',
          padding: '80px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))',
          }}>
            <Rocket style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>No deployments found</p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              {filter === 'all' ? 'Deploy your first project to get started.' : `No ${statusMap[filter]?.label.toLowerCase() || filter} deployments.`}
            </p>
          </div>
          {filter === 'all' && (
            <button onClick={() => setShowDeploy(true)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, color: '#fff',
              background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
              boxShadow: '0 4px 12px rgba(var(--primary), 0.3)',
            }}>
              <Rocket style={{ width: '16px', height: '16px' }} /> Deploy Now
            </button>
          )}
        </div>
      )}

      {/* Deploy modal */}
      {showDeploy && <DeployForm onClose={() => { setShowDeploy(false); setEditInitialData(undefined); }} onSuccess={() => { setShowDeploy(false); setEditInitialData(undefined); refetch(); toast.success('Deployment Started', 'Your deployment has been triggered.'); }} initialData={editInitialData} />}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Deployment"
          message={`Are you sure you want to delete the deployment for "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            try {
              await api.deleteDeployment(deleteTarget.id);
              refetch();
              toast.success('Deleted', 'Deployment record removed.');
            } catch (err: unknown) {
              toast.error('Delete Failed', err instanceof Error ? err.message : 'Could not delete deployment.');
            }
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
