'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, CheckCircle, XCircle, Clock, Loader2,
  Plus, Zap, GitBranch, Timer, MoreVertical,
  Activity, Cpu, Edit3, Trash2, Power, List, Upload,
} from 'lucide-react';
import { Pipeline, PipelineRun, api } from '@/lib/api';
import { useCortexoQuery, useAutoLoadToken, useProjectLookup, parseJsonField, resolveProjectName, timeAgo } from '@/lib/hooks';

import { useModal } from '@/components/modal-provider';
import { useToastStore } from '@/lib/toast-store';

/* --- last-run status config --- */
const runStatus: Record<string, { color: string; bg: string; label: string; icon: typeof CheckCircle }> = {
  success: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Passed',  icon: CheckCircle },
  failed:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Failed',  icon: XCircle },
  running: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  label: 'Running', icon: Loader2 },
  queued:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Queued',  icon: Clock },
};

/* --- stage colors cycling --- */
const stageColors = [
  { color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
];

/* --- Dropdown Menu Component --- */
function DropdownMenu({ pipeline, onRefetch }: { pipeline: any; onRefetch: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { confirm } = useModal();
  const [toggling, setToggling] = useState(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleEdit = () => {
    setOpen(false);
    router.push(`/pipelines/editor?id=${pipeline.id}`);
  };

  const handleViewRuns = () => {
    setOpen(false);
    router.push(`/pipelines/runs?pipelineId=${pipeline.id}`);
  };

  const handleToggleActive = async () => {
    setOpen(false);
    setToggling(true);
    try {
      const newState = !pipeline.isActive;
      await api.updatePipeline(pipeline.id, { isActive: newState } as any);
      useToastStore.getState().success(
        newState ? 'Pipeline Activated' : 'Pipeline Deactivated',
        `${pipeline.name} is now ${newState ? 'active' : 'inactive'}`
      );
      onRefetch();
    } catch {
      useToastStore.getState().error('Failed', 'Could not update pipeline status');
    }
    setToggling(false);
  };

  const handleDelete = async () => {
    setOpen(false);
    const ok = await confirm({
      title: 'Delete Pipeline',
      message: `Delete "${pipeline.name}"? This cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      await api.deletePipeline(pipeline.id);
      useToastStore.getState().success('Pipeline Deleted', `${pipeline.name} has been removed`);
      onRefetch();
    } catch {
      useToastStore.getState().error('Failed', 'Could not delete pipeline');
    }
  };

  const menuItemCls = 'cx-flex cx-items-center cx-gap-8 cx-fw-500 cx-text-secondary';
  const menuItemStyle: React.CSSProperties = {
    width: '100%', padding: '8px 14px', border: 'none', cursor: 'pointer',
    fontSize: '12px', backgroundColor: 'transparent', textAlign: 'left',
    borderRadius: '6px', transition: 'background-color 100ms',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="cx-icon-btn"
        style={{ width: '32px', height: '32px', backgroundColor: open ? 'rgb(var(--surface-hover))' : 'transparent' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <MoreVertical style={{ width: '15px', height: '15px' }} />
      </button>

      {open && (
        <div className="cx-dropdown" style={{ width: '180px' }}>
          <button className={menuItemCls} style={menuItemStyle} onClick={handleEdit}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Edit3 style={{ width: '13px', height: '13px' }} /> Edit Pipeline
          </button>
          <button className={menuItemCls} style={menuItemStyle} onClick={handleViewRuns}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <List style={{ width: '13px', height: '13px' }} /> View Runs
          </button>
          <button className={menuItemCls} style={menuItemStyle} onClick={handleToggleActive} disabled={toggling}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Power style={{ width: '13px', height: '13px' }} />
            {pipeline.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <div style={{ height: '1px', backgroundColor: 'rgb(var(--border))', margin: '4px 0' }} />
          <button className={menuItemCls} style={{ ...menuItemStyle, color: '#EF4444' }} onClick={handleDelete}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Trash2 style={{ width: '13px', height: '13px' }} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function PipelinesPage() {
  useAutoLoadToken();
  const router = useRouter();
  const { lookup } = useProjectLookup();
  const { data: pipelines, isLoading: loading, isError: error, refetch } = useCortexoQuery(
    ['pipelines'],
    () => api.getPipelines(),
  );

  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());

  const handleRun = async (pipeline: any) => {
    setRunningIds(prev => new Set(prev).add(pipeline.id));
    try {
      await api.triggerPipelineRun(pipeline.id);
      useToastStore.getState().success('Pipeline Triggered', `${pipeline.name} run has been queued`);
      refetch();
    } catch {
      useToastStore.getState().error('Run Failed', `Could not trigger ${pipeline.name}`);
    }
    setRunningIds(prev => {
      const next = new Set(prev);
      next.delete(pipeline.id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="cx-flex-center" style={{ height: '256px' }}>
        <Loader2 className="cx-spin cx-text-accent" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  const allPipelines = (pipelines as any[]) || [];
  const activePipelines   = allPipelines.filter((p: Pipeline) => p.isActive).length;
  const runningPipelines  = allPipelines.filter((p: Pipeline) => p.lastRunStatus === 'running').length;
  const failedPipelines   = allPipelines.filter((p: Pipeline) => p.lastRunStatus === 'failed').length;

  return (
    <div>
      {/* --- Header --- */}
      <div className="cx-flex-between" style={{ alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 className="cx-fw-700 cx-text-primary cx-page-title" style={{ margin: 0 }}>Pipelines</h1>
          <p className="cx-text-secondary" style={{ fontSize: '14px', marginTop: '4px' }}>
            {allPipelines.length} configured · {activePipelines} active
          </p>
        </div>
        <div className="cx-flex cx-gap-10">
          <button className="cx-btn-secondary cx-flex cx-items-center cx-gap-8 cx-fw-600" style={{ padding: '10px 20px', fontSize: '13px' }}
            onClick={() => router.push('/pipelines/push')}>
            <Upload style={{ width: '16px', height: '16px' }} /> File Push
          </button>
          <button className="cx-btn-primary cx-flex cx-items-center cx-gap-8" style={{ padding: '10px 20px', fontSize: '13px' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            onClick={() => router.push('/pipelines/editor')}>
            <Plus style={{ width: '16px', height: '16px' }} /> New Pipeline
          </button>
        </div>
      </div>

      {/* --- Summary bar --- */}
      {allPipelines.length > 0 && (
        <div className="cx-stats-3 cx-mb-24">
          {[
            { label: 'Active Pipelines',  value: activePipelines,  total: allPipelines.length, color: '#10B981', icon: Activity },
            { label: 'Currently Running', value: runningPipelines,  total: null, color: '#3B82F6', icon: Cpu },
            { label: 'Failed Last Run',   value: failedPipelines,   total: null, color: '#EF4444', icon: XCircle },
          ].map(s => (
            <div key={s.label} className="cx-flex cx-items-center cx-gap-14 cx-surface cx-border cx-r-12" style={{
              borderTop: `3px solid ${s.color}`,
              padding: '14px 18px',
            }}>
              <div className="cx-flex-center cx-r-10" style={{ width: '36px', height: '36px', flexShrink: 0, backgroundColor: `${s.color}15` }}>
                <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
              </div>
              <div>
                <p className="cx-fw-600 cx-text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>{s.label}</p>
                <p className="cx-fw-700" style={{ fontSize: '22px', color: s.color, margin: 0, lineHeight: 1 }}>
                  {s.value}{s.total !== null ? <span className="cx-fw-500 cx-text-muted" style={{ fontSize: '13px' }}>/{s.total}</span> : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Pipeline cards --- */}
      <div className="cx-flex-col cx-gap-12">
        {allPipelines.map((pipeline: any) => {
          const stages = parseJsonField<any[]>(pipeline.stages, []);
          const projectName = resolveProjectName(pipeline.projectId, lookup);
          const lastStatus = runStatus[pipeline.lastRunStatus] || null;
          const accentColor = pipeline.isActive ? 'rgb(var(--primary))' : '#6B7280';
          const isTriggering = runningIds.has(pipeline.id);

          return (
            <div
              key={pipeline.id}
              className="cx-card"
              style={{
                borderLeft: `4px solid ${accentColor}`,
                transition: 'box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ padding: '16px 20px' }}>
                {/* Top row */}
                <div className="cx-flex cx-items-center cx-gap-14">
                  {/* Icon */}
                  <div className="cx-flex-center" style={{ width: '42px', height: '42px', flexShrink: 0, borderRadius: '10px', backgroundColor: pipeline.isActive ? 'rgba(var(--primary),0.1)' : 'rgba(107,114,128,0.1)' }}>
                    <Zap style={{ width: '20px', height: '20px', color: pipeline.isActive ? 'rgb(var(--primary))' : '#6B7280' }} />
                  </div>

                  {/* Name + project */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cx-flex cx-items-center cx-gap-8" style={{ flexWrap: 'wrap' }}>
                      <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '15px', margin: 0 }}>{pipeline.name}</h3>
                      <span className="cx-fw-700" style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '10px', textTransform: 'uppercase',
                        backgroundColor: pipeline.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
                        color: pipeline.isActive ? '#10B981' : '#6B7280',
                      }}>
                        {pipeline.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {lastStatus && (
                        <span className="cx-flex cx-items-center cx-gap-4 cx-fw-600" style={{
                          display: 'inline-flex', padding: '2px 8px', borderRadius: '20px', fontSize: '10px',
                          backgroundColor: lastStatus.bg, color: lastStatus.color,
                        }}>
                          <lastStatus.icon style={{ width: '10px', height: '10px' }} />
                          {lastStatus.label}
                        </span>
                      )}
                    </div>
                    <p className="cx-text-muted" style={{ fontSize: '12px', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pipeline.description || 'No description'}
                      <span className="cx-fw-500 cx-text-accent" style={{ marginLeft: '8px' }}>· {projectName}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="cx-flex cx-items-center cx-gap-8" style={{ flexShrink: 0 }}>
                    <button
                      onClick={() => handleRun(pipeline)}
                      disabled={isTriggering}
                      className="cx-btn-primary cx-flex cx-items-center cx-gap-6"
                      style={{ padding: '7px 14px', fontSize: '12px', opacity: isTriggering ? 0.7 : 1, cursor: isTriggering ? 'not-allowed' : 'pointer' }}
                      onMouseEnter={e => { if (!isTriggering) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                    >
                      {isTriggering
                        ? <Loader2 className="cx-spin" style={{ width: '12px', height: '12px' }} />
                        : <Play style={{ width: '12px', height: '12px' }} />}
                      {isTriggering ? 'Starting...' : 'Run'}
                    </button>
                    <DropdownMenu pipeline={pipeline} onRefetch={refetch} />
                  </div>
                </div>

                {/* --- Stage flow --- */}
                {stages.length > 0 && (
                  <div className="cx-flex cx-items-center cx-gap-6" style={{ marginTop: '14px', flexWrap: 'wrap' }}>
                    {stages.map((stage: any, i: number) => {
                      const sc = stageColors[i % stageColors.length];
                      return (
                        <div key={i} className="cx-flex cx-items-center cx-gap-6">
                          <span className="cx-fw-600" style={{
                            padding: '4px 12px', borderRadius: '8px', fontSize: '12px',
                            backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.color}25`,
                          }}>
                            {stage.name}
                          </span>
                          {i < stages.length - 1 && (
                            <span className="cx-fw-300 cx-text-muted" style={{ fontSize: '14px' }}>{'\u2192'}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* --- Meta footer --- */}
                <div className="cx-flex cx-items-center cx-gap-16 cx-text-muted" style={{
                  marginTop: '12px', paddingTop: '10px',
                  borderTop: '1px solid rgba(var(--border), 0.6)', fontSize: '11px',
                }}>
                  <span className="cx-flex cx-items-center cx-gap-5">
                    <Timer style={{ width: '11px', height: '11px' }} />
                    Last run: <strong className="cx-text-secondary">{timeAgo(pipeline.lastRunAt)}</strong>
                  </span>
                  <span className="cx-flex cx-items-center cx-gap-5">
                    <GitBranch style={{ width: '11px', height: '11px' }} />
                    Updated: <strong className="cx-text-secondary">{timeAgo(pipeline.updatedAt)}</strong>
                  </span>
                  <span className="cx-flex cx-items-center cx-gap-5">
                    <Activity style={{ width: '11px', height: '11px' }} />
                    {stages.length} stage{stages.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Empty state --- */}
      {allPipelines.length === 0 && (
        <div className="cx-flex-col cx-flex-center" style={{
          gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))',
          padding: '80px 32px', textAlign: 'center',
        }}>
          <div className="cx-flex-center" style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))',
          }}>
            <Zap className="cx-text-accent" style={{ width: '28px', height: '28px', opacity: 0.8 }} />
          </div>
          <div>
            <p className="cx-fw-600 cx-text-primary" style={{ fontSize: '15px', margin: '0 0 4px' }}>No pipelines configured</p>
            <p className="cx-text-muted" style={{ fontSize: '13px', margin: 0 }}>
              Create a pipeline to automate your build, test, and deploy workflow.
            </p>
          </div>
          <button
            onClick={() => router.push('/pipelines/editor')}
            className="cx-btn-primary cx-flex cx-items-center cx-gap-8"
            style={{ padding: '10px 24px', fontSize: '13px' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} /> New Pipeline
          </button>
        </div>
      )}
    </div>
  );
}
