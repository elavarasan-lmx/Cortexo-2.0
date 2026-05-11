'use client';

import { useState } from 'react';
import { GitBranch, RotateCcw, CheckCircle, XCircle, Clock, Loader2, Terminal, Play } from 'lucide-react';
import { useApiData, useAutoLoadToken, timeAgo, formatDuration, parseJsonField } from '@/lib/hooks';
import { api } from '@/lib/api';
import { LiveLogViewer } from '@/components/live-log-viewer';

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  success: { icon: CheckCircle, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Success' },
  failed:  { icon: XCircle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Failed' },
  running: { icon: Loader2, color: '#818CF8', bg: 'rgba(129, 140, 248, 0.1)', label: 'Running' },
  queued:  { icon: Clock, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: 'Queued' },
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
};

export default function PipelineRunsPage() {
  useAutoLoadToken();
  const { data: runs, loading, refetch } = useApiData(() => api.getPipelineRuns({ limit: 100 }));
  const { data: pipelines } = useApiData(() => api.getPipelines());
  const [retrying, setRetrying] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<string | null>(null);

  const pipelineLookup = new Map((pipelines || []).map((p: any) => [p.id, p.name]));

  async function handleRetry(runId: string) {
    setRetrying(runId);
    try { await api.retryPipelineRun(runId); refetch(); } catch { } finally { setRetrying(null); }
  }

  const safeRuns = (runs as any[]) || [];
  const stats = {
    total: safeRuns.length,
    success: safeRuns.filter((r: any) => r.status === 'success').length,
    failed: safeRuns.filter((r: any) => r.status === 'failed').length,
    running: safeRuns.filter((r: any) => r.status === 'running' || r.status === 'queued').length,
  };

  const statCards = [
    { label: 'Total Runs', value: stats.total, color: 'rgb(var(--text-primary))', accent: '#818CF8' },
    { label: 'Successful', value: stats.success, color: '#10B981', accent: '#10B981' },
    { label: 'Failed', value: stats.failed, color: '#EF4444', accent: '#EF4444' },
    { label: 'Active', value: stats.running, color: '#818CF8', accent: '#818CF8' },
  ];

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Pipeline Runs</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            History of all pipeline executions
          </p>
        </div>
        <button
          onClick={refetch}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600,
            backgroundColor: 'rgba(var(--primary), 0.08)',
            color: 'rgb(var(--primary))',
            border: '1px solid rgba(var(--primary), 0.2)',
            cursor: 'pointer',
            transition: 'all 200ms',
          }}
        >
          <RotateCcw style={{ width: '14px', height: '14px' }} /> Refresh
        </button>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}>
        {statCards.map((s, i) => (
          <div
            key={i}
            style={{
              ...cardStyle,
              padding: '18px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: s.accent }} />
            <p style={{ fontSize: '28px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'rgb(var(--text-muted))', marginTop: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!loading && safeRuns.length === 0 && (
        <div style={{
          ...cardStyle,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <Terminal style={{ width: '48px', height: '48px', color: 'rgb(var(--text-muted))', opacity: 0.25, margin: '0 auto 16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
            No pipeline runs yet
          </p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>
            Trigger a pipeline run from the Pipelines page
          </p>
        </div>
      )}

      {/* ─── Run List ─── */}
      {!loading && safeRuns.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {safeRuns.map((run: any) => {
            const cfg = statusConfig[run.status] || statusConfig.queued;
            const Icon = cfg.icon;
            const stages = parseJsonField<any[]>(run.stages, []);
            const isRetrying = retrying === run.id;
            const isShowingLogs = showLogs === run.id;
            return (
              <div key={run.id}>
                <div
                  style={{
                    ...cardStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderBottomLeftRadius: isShowingLogs ? '0' : '14px',
                    borderBottomRightRadius: isShowingLogs ? '0' : '14px',
                    borderColor: isShowingLogs ? 'rgba(var(--primary), 0.3)' : 'rgb(var(--border))',
                    transition: 'box-shadow 200ms',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Status icon */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: cfg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon style={{
                      width: '16px', height: '16px', color: cfg.color,
                      animation: run.status === 'running' ? 'spin 1s linear infinite' : 'none',
                    }} />
                  </div>

                  {/* Run info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
                        {pipelineLookup.get(run.pipelineId) || 'Pipeline'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>#{run.runNumber}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                        <GitBranch style={{ width: '11px', height: '11px' }} />{run.branch}
                      </span>
                      {run.commitSha && (
                        <code style={{
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: 'rgb(var(--surface-hover))',
                          border: '1px solid rgb(var(--border))',
                          color: 'rgb(var(--text-muted))',
                          fontFamily: 'monospace',
                        }}>
                          {run.commitSha.slice(0, 7)}
                        </code>
                      )}
                    </div>
                    {stages.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {stages.map((stage: any, i: number) => {
                          const stageColor = stage.status === 'success' ? '#10B981' : stage.status === 'failed' ? '#EF4444' : '#818CF8';
                          return (
                            <span key={i} style={{
                              display: 'flex', alignItems: 'center', gap: '3px',
                              padding: '2px 8px', borderRadius: '20px',
                              fontSize: '10px', fontWeight: 600,
                              backgroundColor: `${stageColor}15`,
                              color: stageColor,
                            }}>
                              {stage.status === 'success' ? '✓' : stage.status === 'failed' ? '✗' : '◉'} {stage.name}
                              {stage.durationMs != null && ` ${stage.durationMs}ms`}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Time + duration */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>{timeAgo(run.createdAt)}</p>
                    {run.durationMs && <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '2px' }}>{formatDuration(run.durationMs)}</p>}
                  </div>

                  {/* Status badge */}
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 600,
                    backgroundColor: cfg.bg, color: cfg.color,
                    flexShrink: 0,
                  }}>
                    {cfg.label}
                  </span>

                  {/* Logs button */}
                  <button
                    onClick={() => setShowLogs(isShowingLogs ? null : run.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '8px',
                      fontSize: '11px', fontWeight: 600,
                      backgroundColor: isShowingLogs ? 'rgba(var(--primary), 0.12)' : 'rgb(var(--surface-hover))',
                      color: isShowingLogs ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                      border: '1px solid ' + (isShowingLogs ? 'rgba(var(--primary), 0.3)' : 'rgb(var(--border))'),
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 200ms',
                    }}
                  >
                    <Terminal style={{ width: '12px', height: '12px' }} /> Logs
                  </button>

                  {/* Retry button */}
                  {(run.status === 'failed' || run.status === 'success') && (
                    <button
                      onClick={() => handleRetry(run.id)}
                      disabled={isRetrying}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '8px',
                        fontSize: '11px', fontWeight: 600,
                        backgroundColor: 'rgba(var(--primary), 0.08)',
                        color: 'rgb(var(--primary))',
                        border: 'none',
                        cursor: isRetrying ? 'wait' : 'pointer',
                        flexShrink: 0,
                        transition: 'all 200ms',
                      }}
                    >
                      {isRetrying
                        ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                        : <RotateCcw style={{ width: '12px', height: '12px' }} />}
                      Retry
                    </button>
                  )}
                </div>

                {/* Live log viewer */}
                {isShowingLogs && (
                  <div style={{
                    borderRadius: '0 0 14px 14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(var(--primary), 0.3)',
                    borderTop: 'none',
                  }}>
                    <LiveLogViewer runId={run.id} initialStatus={run.status} onClose={() => setShowLogs(null)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


