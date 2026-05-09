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

  // Compute stats
  const totalDeploys = allDeploys.length;
  const successDeploys = allDeploys.filter((d: any) => d.status === 'success').length;
  const successRate = totalDeploys > 0 ? ((successDeploys / totalDeploys) * 100).toFixed(1) : '0.0';
  
  // Calculate average duration for successful deployments
  const successWithDuration = allDeploys.filter((d: any) => d.status === 'success' && d.durationMs);
  const avgDurationMs = successWithDuration.length > 0 
    ? successWithDuration.reduce((acc, d) => acc + d.durationMs, 0) / successWithDuration.length 
    : 0;
  
  const failedToday = allDeploys.filter((d: any) => {
    if (d.status !== 'failed') return false;
    const date = new Date(d.createdAt);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* ─── Header (p01fyR) ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            Deployments
          </h1>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            padding: '6px 12px', borderRadius: '12px', 
            backgroundColor: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.2)' 
          }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#16A34A', fontFamily: 'Inter, sans-serif' }}>
              🟢 Live • Updated 5s ago
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowDeploy(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: 600, color: '#fff',
            backgroundColor: 'rgb(var(--primary))',
            fontFamily: 'Inter, sans-serif',
            transition: 'background-color 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--primary))'; }}
        >
          + New Deploy
        </button>
      </div>

      {/* ─── Stat Cards (PWDUz) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '18px', border: '1px solid rgb(var(--border))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>Total Deploys</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>{totalDeploys}</p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>All time</p>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '18px', border: '1px solid rgb(var(--border))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>Success Rate</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#16A34A', fontFamily: 'Inter, sans-serif' }}>{successRate}%</p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: successDeploys > 0 ? '#16A34A' : 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>{successDeploys} of {totalDeploys}</p>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '18px', border: '1px solid rgb(var(--border))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>Avg Duration</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>{avgDurationMs ? formatDuration(avgDurationMs) : '0s'}</p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>Across successful deploys</p>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '18px', border: '1px solid rgb(var(--border))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>Failed Today</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{failedToday}</p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: failedToday > 0 ? '#EF4444' : 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>{failedToday > 0 ? 'Needs attention' : 'All clear'}</p>
        </div>
      </div>

      {/* ─── Filter Row (ME7lC) ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setFilter('all')} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            fontSize: '13px', fontWeight: filter === 'all' ? 600 : 500,
            backgroundColor: filter === 'all' ? 'rgb(var(--primary))' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'all' ? '#FFFFFF' : 'rgb(var(--text-muted))',
            transition: 'all 150ms',
          }}>
            All ({allDeploys.length})
          </button>
          
          <button onClick={() => setFilter('success')} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            fontSize: '13px', fontWeight: filter === 'success' ? 600 : 500,
            backgroundColor: filter === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'success' ? '#16A34A' : 'rgb(var(--text-muted))',
            transition: 'all 150ms',
          }}>
            ✅ Success ({allDeploys.filter((d: any) => d.status === 'success').length})
          </button>
          
          <button onClick={() => setFilter('deploying')} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            fontSize: '13px', fontWeight: filter === 'deploying' ? 600 : 500,
            backgroundColor: filter === 'deploying' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'deploying' ? '#D97706' : 'rgb(var(--text-muted))',
            transition: 'all 150ms',
          }}>
            ⟳ Building ({allDeploys.filter((d: any) => d.status === 'deploying' || d.status === 'running').length})
          </button>
          
          <button onClick={() => setFilter('failed')} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            fontSize: '13px', fontWeight: filter === 'failed' ? 600 : 500,
            backgroundColor: filter === 'failed' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'failed' ? '#EF4444' : 'rgb(var(--text-muted))',
            transition: 'all 150ms',
          }}>
            ✗ Failed ({allDeploys.filter((d: any) => d.status === 'failed').length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', cursor: 'pointer' }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>📅 Last 7 Days</span>
          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>▾</span>
        </div>
      </div>

      {/* ─── Deployments Table (KODjv) ─── */}
      <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden', border: '1px solid rgb(var(--border))' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(var(--text-muted), 0.05)', borderBottom: '1px solid rgb(var(--border))' }}>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Deploy ID</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Project</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Branch</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Env</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Duration</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Triggered By</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Time</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif', textAlign: 'right' }}>Actions</th>
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
              const triggerName = deploy.status === 'running' || deploy.status === 'deploying' ? 'CI/CD' : 'System';
              const triggerInitials = triggerName.substring(0, 2).toUpperCase();

              return (
                <tr key={deploy.id} style={{ borderBottom: '1px solid rgb(var(--border))', transition: 'background-color 150ms' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Deploy ID */}
                  <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--primary))', fontFamily: 'JetBrains Mono, monospace' }}>
                    #{deploy.id.toString().substring(0, 6)}
                  </td>
                  
                  {/* Project */}
                  <td style={{ padding: '16px', fontSize: '13px', color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>
                    {projectName}
                  </td>
                  
                  {/* Branch */}
                  <td style={{ padding: '16px', fontSize: '13px', color: 'rgb(var(--text-secondary))', fontFamily: 'JetBrains Mono, monospace' }}>
                    {deploy.branch || 'main'}
                  </td>
                  
                  {/* Env */}
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: env.bg, color: env.color, fontFamily: 'Inter, sans-serif'
                    }}>
                      {deploy.environment.charAt(0).toUpperCase() + deploy.environment.slice(1, 4)}
                    </span>
                  </td>
                  
                  {/* Status */}
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '6px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: st.bg, color: st.color, fontFamily: 'Inter, sans-serif'
                    }}>
                      <st.icon style={{ width: '12px', height: '12px', animation: deploy.status === 'deploying' ? 'spin 1s linear infinite' : 'none' }} />
                      {st.label}
                    </span>
                  </td>
                  
                  {/* Duration */}
                  <td style={{ padding: '16px', fontSize: '13px', color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>
                    {deploy.durationMs ? formatDuration(deploy.durationMs) : '—'}
                  </td>
                  
                  {/* Triggered By */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '10px', backgroundColor: getBadgeColor(triggerName),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '9px', fontWeight: 600, fontFamily: 'Inter, sans-serif'
                      }}>
                        {triggerInitials}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>{triggerName}</span>
                    </div>
                  </td>
                  
                  {/* Time */}
                  <td style={{ padding: '16px', fontSize: '13px', color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>
                    {timeAgo(deploy.createdAt)}
                  </td>
                  
                  {/* Actions */}
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => startEdit(deploy)} title="View Details" style={{
                        padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(var(--text-muted), 0.1)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(var(--text-secondary))', transition: 'background-color 150ms'
                      }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.1)'}>
                        <Search style={{ width: '14px', height: '14px' }} />
                      </button>
                      
                      <button onClick={() => setExpandedId(expandedId === deploy.id ? null : deploy.id)} title="Logs" style={{
                        padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', transition: 'background-color 150ms'
                      }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}>
                        <Terminal style={{ width: '14px', height: '14px' }} />
                      </button>
                      
                      {deploy.status === 'failed' && (
                        <button onClick={async () => {
                          try {
                            await api.triggerDeploy({ projectId: deploy.projectId, branch: deploy.branch || 'main', environment: deploy.environment || 'production' });
                            refetch(); toast.success('Retrying', `Deployment triggered.`);
                          } catch (err: unknown) { toast.error('Retry Failed', 'Could not trigger deploy.'); }
                        }} title="Retry" style={{
                          padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgb(var(--primary))', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', transition: 'background-color 150ms'
                        }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.8)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgb(var(--primary))'}>
                          <RotateCcw style={{ width: '14px', height: '14px' }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={9} style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <Rocket style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>No deployments found</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Deploy your first project to get started.</p>
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

      {deleteTarget && (
        <ConfirmModal
          title="Delete Deployment"
          message={`Are you sure you want to delete the deployment for "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            try { await api.deleteDeployment(deleteTarget.id); refetch(); toast.success('Deleted', 'Deployment record removed.'); } catch (err: unknown) { toast.error('Delete Failed', err instanceof Error ? err.message : 'Could not delete deployment.'); }
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
