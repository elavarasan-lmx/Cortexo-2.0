'use client';

import {
  Play, CheckCircle, XCircle, Clock, Loader2,
  Plus, Zap, GitBranch, Timer, MoreVertical,
  Activity, Cpu,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useProjectLookup, parseJsonField, resolveProjectName, timeAgo } from '@/lib/hooks';

/* ─── last-run status config ─── */
const runStatus: Record<string, { color: string; bg: string; label: string; icon: typeof CheckCircle }> = {
  success: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Passed',  icon: CheckCircle },
  failed:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Failed',  icon: XCircle },
  running: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  label: 'Running', icon: Loader2 },
  queued:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Queued',  icon: Clock },
};

/* ─── stage colors cycling ─── */
const stageColors = [
  { color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
];

export default function PipelinesPage() {
  const { lookup } = useProjectLookup();
  const { data: pipelines, loading, error, refetch } = useApiData(
    () => api.getPipelines(),
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const allPipelines = (pipelines as any[]) || [];
  const activePipelines   = allPipelines.filter((p: any) => p.isActive).length;
  const runningPipelines  = allPipelines.filter((p: any) => p.lastRunStatus === 'running').length;
  const failedPipelines   = allPipelines.filter((p: any) => p.lastRunStatus === 'failed').length;

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Pipelines</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            {allPipelines.length} configured · {activePipelines} active
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          fontSize: '13px', fontWeight: 600, color: '#fff',
          background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
          boxShadow: '0 4px 12px rgba(var(--primary), 0.3)',
          transition: 'all 150ms',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--primary), 0.45)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary), 0.3)';
            e.currentTarget.style.transform = 'none';
          }}>
          <Plus style={{ width: '16px', height: '16px' }} /> New Pipeline
        </button>
      </div>

      {/* ─── Summary bar ─── */}
      {allPipelines.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Active Pipelines',  value: activePipelines,  total: allPipelines.length, color: '#10B981',  icon: Activity },
            { label: 'Currently Running', value: runningPipelines,  total: null, color: '#3B82F6',  icon: Cpu },
            { label: 'Failed Last Run',   value: failedPipelines,   total: null, color: '#EF4444',  icon: XCircle },
          ].map(s => (
            <div key={s.label} style={{
              borderRadius: '12px',
              border: '1px solid rgb(var(--border))',
              borderTop: `3px solid ${s.color}`,
              backgroundColor: 'rgb(var(--surface))',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                backgroundColor: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 3px' }}>{s.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>
                  {s.value}{s.total !== null ? <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', fontWeight: 500 }}>/{s.total}</span> : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Pipeline cards ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {allPipelines.map((pipeline: any) => {
          const stages = parseJsonField<any[]>(pipeline.stages, []);
          const projectName = resolveProjectName(pipeline.projectId, lookup);
          const lastStatus = runStatus[pipeline.lastRunStatus] || null;
          const accentColor = pipeline.isActive ? 'rgb(var(--primary))' : '#6B7280';

          return (
            <div
              key={pipeline.id}
              style={{
                borderRadius: '14px',
                border: '1px solid rgb(var(--border))',
                borderLeft: `4px solid ${accentColor}`,
                backgroundColor: 'rgb(var(--surface))',
                overflow: 'hidden',
                transition: 'box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ padding: '16px 20px' }}>
                {/* Top row: icon + name + status + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '42px', height: '42px', flexShrink: 0, borderRadius: '10px',
                    backgroundColor: pipeline.isActive ? 'rgba(var(--primary),0.1)' : 'rgba(107,114,128,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap style={{ width: '20px', height: '20px', color: pipeline.isActive ? 'rgb(var(--primary))' : '#6B7280' }} />
                  </div>

                  {/* Name + project */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
                        {pipeline.name}
                      </h3>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: pipeline.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
                        color: pipeline.isActive ? '#10B981' : '#6B7280',
                      }}>
                        {pipeline.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {lastStatus && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                          backgroundColor: lastStatus.bg, color: lastStatus.color,
                        }}>
                          <lastStatus.icon style={{ width: '10px', height: '10px' }} />
                          {lastStatus.label}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pipeline.description || 'No description'}
                      <span style={{ marginLeft: '8px', color: 'rgb(var(--primary))', fontWeight: 500 }}>
                        · {projectName}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600, color: '#fff',
                      background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                      boxShadow: '0 2px 6px rgba(var(--primary), 0.25)',
                      transition: 'all 150ms',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary), 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(var(--primary), 0.25)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <Play style={{ width: '12px', height: '12px' }} /> Run
                    </button>
                    <button style={{
                      width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                      cursor: 'pointer', backgroundColor: 'transparent',
                      color: 'rgb(var(--text-muted))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background-color 150ms',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <MoreVertical style={{ width: '15px', height: '15px' }} />
                    </button>
                  </div>
                </div>

                {/* ─── Stage flow ─── */}
                {stages.length > 0 && (
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {stages.map((stage: any, i: number) => {
                      const sc = stageColors[i % stageColors.length];
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 600,
                            backgroundColor: sc.bg, color: sc.color,
                            border: `1px solid ${sc.color}25`,
                          }}>
                            {stage.name}
                          </span>
                          {i < stages.length - 1 && (
                            <span style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', fontWeight: 300 }}>→</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─── Meta footer ─── */}
                <div style={{
                  marginTop: '12px', paddingTop: '10px',
                  borderTop: '1px solid rgba(var(--border), 0.6)',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  fontSize: '11px', color: 'rgb(var(--text-muted))',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Timer style={{ width: '11px', height: '11px' }} />
                    Last run: <strong style={{ color: 'rgb(var(--text-secondary))' }}>{timeAgo(pipeline.lastRunAt)}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <GitBranch style={{ width: '11px', height: '11px' }} />
                    Updated: <strong style={{ color: 'rgb(var(--text-secondary))' }}>{timeAgo(pipeline.updatedAt)}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity style={{ width: '11px', height: '11px' }} />
                    {stages.length} stage{stages.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Empty state ─── */}
      {allPipelines.length === 0 && (
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
            <Zap style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>No pipelines configured</p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              Create a pipeline to automate your build, test, and deploy workflow.
            </p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, color: '#fff',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: '0 4px 12px rgba(var(--primary), 0.3)',
          }}>
            <Plus style={{ width: '16px', height: '16px' }} /> New Pipeline
          </button>
        </div>
      )}
    </div>
  );
}
