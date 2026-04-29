'use client';

import { useState } from 'react';
import {
  RotateCcw, CheckCircle, XCircle, Clock,
  AlertTriangle, Loader2, GitBranch, Server,
  GitCommit, ArrowDown, ShieldAlert,
} from 'lucide-react';
import { useApiData, useProjectLookup, resolveProjectName, timeAgo } from '@/lib/hooks';
import { api } from '@/lib/api';

/* ─── Status config ─── */
const statusCfg: Record<string, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  success: { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle, label: 'Success' },
  failed:  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: XCircle,     label: 'Failed'  },
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: Clock,       label: 'Pending' },
  running: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: Loader2,     label: 'Running' },
};

/* ─── Environment color ─── */
const envColor = (env: string) => {
  if (!env) return { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
  const e = env.toLowerCase();
  if (e.includes('prod')) return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  };
  if (e.includes('stag')) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
  if (e.includes('dev'))  return { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' };
  return { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' };
};

export default function RollbacksPage() {
  const { data: deployments, loading, refetch } = useApiData(() => api.getDeployments());
  const { lookup } = useProjectLookup();
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [rolledBack, setRolledBack]   = useState<Set<string>>(new Set());

  const allDeploys    = (deployments || []).slice(0, 20);
  const rollbackHistory = allDeploys.filter((d: any) => d.commitMessage?.startsWith('ROLLBACK:'));
  const deployable      = allDeploys.filter((d: any) => !d.commitMessage?.startsWith('ROLLBACK:'));

  async function handleRollback(deploymentId: string) {
    setRollingBack(deploymentId);
    try {
      await api.rollbackDeployment(deploymentId);
      setRolledBack(prev => new Set([...prev, deploymentId]));
      refetch();
    } catch (e: any) {
      alert('Rollback failed: ' + e.message);
    } finally {
      setRollingBack(null);
    }
  }

  /* Stat counts */
  const prodCount  = deployable.filter((d: any) => d.environment?.toLowerCase().includes('prod')).length;
  const stagCount  = deployable.filter((d: any) => d.environment?.toLowerCase().includes('stag')).length;

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Rollbacks</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            One-click restore to any previous deployment state
          </p>
        </div>
        {/* Summary badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {prodCount} Production
          </div>
          <div style={{ padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
            {stagCount} Staging
          </div>
        </div>
      </div>

      {/* ─── Warning banner ─── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        padding: '14px 18px', borderRadius: '12px', marginBottom: '20px',
        backgroundColor: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.25)',
        borderLeft: '4px solid #F59E0B',
      }}>
        <div style={{ width: '34px', height: '34px', flexShrink: 0, borderRadius: '9px', backgroundColor: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
          <ShieldAlert style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 3px' }}>Before you rollback</p>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.6 }}>
            Rollback creates a <strong>new deployment</strong> using the previous commit's configuration.
            Database migrations are <strong>NOT rolled back automatically</strong> — verify schema compatibility first.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : deployable.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
          padding: '60px 24px', textAlign: 'center', borderRadius: '14px',
          border: '1px dashed rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(var(--border),0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw style={{ width: '26px', height: '26px', color: 'rgb(var(--text-muted))' }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>No deployments to rollback</p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Deploy your project first to enable rollbacks</p>
        </div>
      ) : (
        <>
          {/* ─── Section label ─── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(var(--text-muted))', margin: 0 }}>
              Available Rollback Points
            </p>
            <span style={{ padding: '1px 7px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(var(--primary),0.1)', color: 'rgb(var(--primary))' }}>
              {deployable.length}
            </span>
          </div>

          {/* ─── Timeline list ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {deployable.map((dep: any, index: number) => {
              const isRolledBack  = rolledBack.has(dep.id);
              const isRollingBack = rollingBack === dep.id;
              const isLatest      = index === 0;
              const sc  = statusCfg[dep.status] || statusCfg.pending;
              const ec  = envColor(dep.environment);
              const StatusIcon = sc.icon;
              const isLast = index === deployable.length - 1;

              return (
                <div key={dep.id} style={{ display: 'flex', gap: '0', position: 'relative' }}>
                  {/* ── Timeline column ── */}
                  <div style={{ width: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '18px' }}>
                    {/* Dot */}
                    <div style={{
                      width: isLatest ? '14px' : '10px',
                      height: isLatest ? '14px' : '10px',
                      borderRadius: '50%', flexShrink: 0, zIndex: 1,
                      backgroundColor: isLatest ? 'rgb(var(--primary))' : sc.color,
                      border: isLatest ? '2px solid rgba(var(--primary),0.3)' : `2px solid ${sc.color}40`,
                      boxShadow: isLatest ? '0 0 10px rgba(var(--primary),0.4)' : 'none',
                    }} />
                    {/* Connector line */}
                    {!isLast && (
                      <div style={{
                        flex: 1, width: '2px', marginTop: '4px',
                        backgroundColor: 'rgba(var(--border),0.5)',
                        minHeight: '40px',
                      }} />
                    )}
                  </div>

                  {/* ── Card ── */}
                  <div style={{ flex: 1, marginLeft: '12px', marginBottom: '8px' }}>
                    <div style={{
                      borderRadius: '12px',
                      border: `1px solid ${isLatest ? 'rgba(var(--primary),0.3)' : 'rgb(var(--border))'}`,
                      backgroundColor: isLatest ? 'rgba(var(--primary),0.03)' : 'rgb(var(--surface))',
                      padding: '12px 16px',
                      transition: 'box-shadow 200ms, transform 200ms',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {/* Status icon */}
                        <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '9px', backgroundColor: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                          <StatusIcon style={{ width: '16px', height: '16px', color: sc.color }} />
                        </div>

                        {/* Main info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Badge row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            {/* Environment pill */}
                            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize', backgroundColor: ec.bg, color: ec.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Server style={{ width: '10px', height: '10px' }} />
                              {dep.environment || 'unknown'}
                            </span>
                            {/* Current badge */}
                            {isLatest && (
                              <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: 'rgba(var(--primary),0.12)', color: 'rgb(var(--primary))', border: '1px solid rgba(var(--primary),0.2)' }}>
                                ● Current
                              </span>
                            )}
                            {/* Branch */}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                              <GitBranch style={{ width: '10px', height: '10px' }} />
                              {dep.branch || 'main'}
                            </span>
                            {/* Commit SHA pill */}
                            {dep.commitSha && (
                              <code style={{
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontSize: '11px', fontWeight: 600,
                                padding: '2px 7px', borderRadius: '5px',
                                backgroundColor: 'rgba(var(--border),0.6)',
                                color: 'rgb(var(--text-secondary))',
                              }}>
                                {dep.commitSha.slice(0, 7)}
                              </code>
                            )}
                            {/* Project name */}
                            {dep.projectId && (
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--primary))', marginLeft: '2px' }}>
                                {resolveProjectName(dep.projectId, lookup)}
                              </span>
                            )}
                          </div>

                          {/* Commit message */}
                          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dep.commitMessage || 'No commit message'}
                          </p>
                          <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock style={{ width: '10px', height: '10px' }} />
                            {timeAgo(dep.createdAt)}
                          </span>
                        </div>

                        {/* Rollback action */}
                        {isLatest ? (
                          <div style={{ flexShrink: 0, padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(var(--primary),0.08)', color: 'rgb(var(--primary))' }}>
                            Active
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRollback(dep.id)}
                            disabled={isRollingBack || isRolledBack}
                            style={{
                              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '7px',
                              padding: '8px 16px', borderRadius: '10px', border: 'none',
                              cursor: (isRollingBack || isRolledBack) ? 'not-allowed' : 'pointer',
                              fontSize: '12px', fontWeight: 700,
                              backgroundColor: isRolledBack
                                ? 'rgba(16,185,129,0.1)'
                                : 'rgba(245,158,11,0.1)',
                              color: isRolledBack ? '#10B981' : '#F59E0B',
                              opacity: (isRollingBack || isRolledBack) ? 0.75 : 1,
                              transition: 'all 150ms',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => {
                              if (!isRollingBack && !isRolledBack) {
                                e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.18)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.2)';
                              }
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = isRolledBack ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {isRollingBack
                              ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                              : <RotateCcw style={{ width: '13px', height: '13px' }} />}
                            {isRolledBack ? '✓ Queued' : isRollingBack ? 'Rolling back...' : 'Rollback to this'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Rollback history ─── */}
          {rollbackHistory.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(var(--text-muted))', margin: 0 }}>
                  Rollback History
                </p>
                <span style={{ padding: '1px 7px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                  {rollbackHistory.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rollbackHistory.map((dep: any) => (
                  <div key={dep.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px',
                    backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
                    borderLeft: '3px solid #F59E0B',
                  }}>
                    <div style={{ width: '30px', height: '30px', flexShrink: 0, borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RotateCcw style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dep.commitMessage}</p>
                      <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0, textTransform: 'capitalize' }}>{dep.environment} · {timeAgo(dep.createdAt)}</p>
                    </div>
                    <span style={{
                      padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize',
                      backgroundColor: dep.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: dep.status === 'success' ? '#10B981' : '#EF4444',
                    }}>
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
