'use client';

import { use, useState } from 'react';
import { useApiData, useProjectLookup, resolveProjectName, timeAgo, parseJsonField } from '@/lib/hooks';
import { api } from '@/lib/api';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, ThumbsUp, ThumbsDown, Sparkles, Code, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: error, loading, refetch } = useApiData(() => api.getError(id), [id]);
  const { lookup } = useProjectLookup();
  const [resolving, setResolving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [feedback, setFeedback] = useState<number | null>(null);

  const events = parseJsonField<any[]>((error as any)?.events, []);
  const breadcrumbs = parseJsonField<any[]>(events[0]?.breadcrumbs, []);

  async function handleResolve() {
    setResolving(true);
    try {
      await api.updateError(id, { status: error?.status === 'resolved' ? 'unresolved' : 'resolved' });
      refetch();
    } finally { setResolving(false); }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const res = await api.analyzeRootCause(id);
      setAnalysis(res.data);
    } catch { } finally { setAnalyzing(false); }
  }

  async function handleFeedback(rating: number) {
    if (!analysis) return;
    setFeedback(rating);
    await api.submitFeedback(analysis.id, rating);
  }

  const severityColors: Record<string, string> = {
    critical: 'var(--danger)', error: 'var(--danger)',
    warning: 'var(--warning)', info: 'var(--primary)',
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'rgb(var(--primary))' }} />
    </div>
  );

  if (!error) return (
    <div className="text-center py-24">
      <p style={{ color: 'rgb(var(--text-secondary))' }}>Error not found</p>
      <Link href="/errors" className="mt-4 inline-block text-sm" style={{ color: 'rgb(var(--primary))' }}>← Back to Errors</Link>
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/errors" className="mb-6 flex items-center gap-2 text-sm transition-colors hover:opacity-80"
        style={{ color: 'rgb(var(--text-muted))' }}>
        <ArrowLeft className="h-4 w-4" />
        Back to Errors
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl p-6" style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(var(--border), 0.15)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                style={{ backgroundColor: `rgba(var(--${(error as any).severity === 'critical' || (error as any).severity === 'error' ? 'danger' : (error as any).severity === 'warning' ? 'warning' : 'primary'}), 0.12)`, color: `rgb(var(--${(error as any).severity === 'critical' || (error as any).severity === 'error' ? 'danger' : (error as any).severity === 'warning' ? 'warning' : 'primary'}))` }}>
                {(error as any).severity}
              </span>
              <span className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: (error as any).status === 'resolved' ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)', color: (error as any).status === 'resolved' ? 'rgb(var(--success))' : 'rgb(var(--warning))' }}>
                {(error as any).status}
              </span>
              <span className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                {resolveProjectName((error as any).projectId, lookup)}
              </span>
            </div>
            <h1 className="text-xl font-bold font-mono break-all" style={{ color: 'rgb(var(--text-primary))' }}>
              {(error as any).type}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{(error as any).message}</p>
            {(error as any).file && (
              <p className="mt-2 font-mono text-xs px-2 py-1 rounded inline-block" style={{ backgroundColor: 'rgba(var(--border), 0.15)', color: 'rgb(var(--text-muted))' }}>
                {(error as any).file}:{(error as any).line}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{(error as any).eventCount}</p>
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>occurrences</p>
            <p className="mt-2 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>First: {timeAgo((error as any).firstSeenAt)}</p>
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Last: {timeAgo((error as any).lastSeenAt)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(var(--border), 0.15)' }}>
          <button onClick={handleResolve} disabled={resolving}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: (error as any).status === 'resolved' ? 'rgba(var(--warning), 0.1)' : 'rgba(var(--success), 0.1)', color: (error as any).status === 'resolved' ? 'rgb(var(--warning))' : 'rgb(var(--success))' }}>
            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {(error as any).status === 'resolved' ? 'Re-open' : 'Mark Resolved'}
          </button>
          <button onClick={handleAnalyze} disabled={analyzing}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: analyzing ? 'rgba(var(--agent), 0.1)' : 'linear-gradient(135deg, rgb(var(--agent)), rgb(var(--primary)))', color: analyzing ? 'rgb(var(--agent))' : '#fff' }}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? 'Analyzing...' : 'AI Root Cause'}
          </button>
        </div>
      </div>

      {/* AI Analysis Result */}
      {analysis && (
        <div className="mb-6 rounded-2xl p-6" style={{ background: 'rgba(var(--agent), 0.05)', border: '1px solid rgba(var(--agent), 0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5" style={{ color: 'rgb(var(--agent))' }} />
            <h2 className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>AI Root Cause Analysis</h2>
            <span className="ml-auto text-sm font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(var(--agent), 0.1)', color: 'rgb(var(--agent))' }}>
              {analysis.confidence}% confidence
            </span>
          </div>
          <div className="text-sm whitespace-pre-wrap mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
            {analysis.analysis}
          </div>
          {analysis.suggestedFix && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4" style={{ color: 'rgb(var(--primary))' }} />
                <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>Suggested Fix</p>
              </div>
              <pre className="text-xs rounded-xl p-4 overflow-x-auto" style={{ backgroundColor: 'rgba(var(--border), 0.15)', color: 'rgb(var(--text-secondary))', fontFamily: 'monospace' }}>
                {analysis.suggestedFix}
              </pre>
            </>
          )}
          {/* Feedback */}
          <div className="mt-4 flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(var(--border), 0.1)' }}>
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Was this helpful?</p>
            <button onClick={() => handleFeedback(1)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-all"
              style={{ backgroundColor: feedback === 1 ? 'rgba(var(--success), 0.15)' : 'transparent', color: feedback === 1 ? 'rgb(var(--success))' : 'rgb(var(--text-muted))' }}>
              <ThumbsUp className="h-3.5 w-3.5" /> Yes
            </button>
            <button onClick={() => handleFeedback(0)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-all"
              style={{ backgroundColor: feedback === 0 ? 'rgba(var(--danger), 0.15)' : 'transparent', color: feedback === 0 ? 'rgb(var(--danger))' : 'rgb(var(--text-muted))' }}>
              <ThumbsDown className="h-3.5 w-3.5" /> No
            </button>
          </div>
        </div>
      )}

      {/* Stack Trace */}
      {events[0]?.stackTrace && (
        <div className="mb-6 rounded-2xl p-6" style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(var(--border), 0.15)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>Stack Trace</h2>
          <pre className="text-xs overflow-x-auto rounded-xl p-4 leading-relaxed"
            style={{ backgroundColor: 'rgba(var(--border), 0.08)', color: 'rgb(var(--text-secondary))', fontFamily: 'monospace' }}>
            {events[0].stackTrace.split('\n').map((line: string, i: number) => (
              <span key={i} className={`block ${line.startsWith('#0') ? 'font-bold' : ''}`}
                style={{ color: line.includes('application/') ? 'rgb(var(--primary))' : undefined }}>
                {line}
              </span>
            ))}
          </pre>
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="mb-6 rounded-2xl p-6" style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(var(--border), 0.15)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>Breadcrumbs</h2>
          <div className="space-y-2">
            {breadcrumbs.map((crumb: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium mt-0.5"
                  style={{ backgroundColor: 'rgba(var(--primary), 0.1)', color: 'rgb(var(--primary))' }}>
                  {crumb.category || 'log'}
                </span>
                <span style={{ color: 'rgb(var(--text-secondary))' }}>{crumb.message}</span>
                {crumb.timestamp && (
                  <span className="ml-auto shrink-0 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                    {new Date(crumb.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event History */}
      <div className="rounded-2xl p-6" style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(var(--border), 0.15)' }}>
        <h2 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>
          Occurrences ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>No event details captured</p>
        ) : (
          <div className="space-y-2">
            {events.map((ev: any, i: number) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3"
                style={{ backgroundColor: 'rgba(var(--border), 0.06)' }}>
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: 'rgb(var(--primary))' }} />
                <div className="flex-1 min-w-0">
                  {ev.url && <p className="text-xs truncate" style={{ color: 'rgb(var(--text-secondary))' }}>{ev.method} {ev.url}</p>}
                  {ev.serverName && <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{ev.serverName} · {ev.environment}</p>}
                </div>
                <span className="text-xs shrink-0" style={{ color: 'rgb(var(--text-muted))' }}>
                  {timeAgo(ev.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
