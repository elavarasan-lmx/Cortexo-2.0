'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal, X, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface LogLine {
  line: string;
  stage?: string;
  level?: 'info' | 'error' | 'warn' | 'debug';
  timestamp?: string;
  type?: 'log' | 'complete' | 'failed';
}

interface LiveLogViewerProps {
  runId: string;
  onClose?: () => void;
  initialStatus?: string;
}

const levelColors: Record<string, string> = {
  error: 'rgb(var(--danger))',
  warn: '#f97316',
  debug: 'rgb(var(--text-muted))',
  info: 'rgb(var(--text-secondary))',
};

export function LiveLogViewer({ runId, onClose, initialStatus }: LiveLogViewerProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [status, setStatus] = useState<'connecting' | 'streaming' | 'done' | 'failed' | 'error'>('connecting');
  const [finalStatus, setFinalStatus] = useState<string | null>(initialStatus || null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
    const token = typeof window !== 'undefined' ? localStorage.getItem('cortexo_token') : null;
    const url = `${API_BASE}/logs/stream/${runId}${token ? `?token=${token}` : ''}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('connected', () => {
      setStatus('streaming');
      setLogs(prev => [...prev, { line: `▶ Connected to log stream for run ${runId}`, level: 'debug', type: 'log' }]);
    });

    es.addEventListener('log', (e) => {
      try {
        const data = JSON.parse(e.data) as LogLine;
        setLogs(prev => [...prev, data]);
      } catch {
        setLogs(prev => [...prev, { line: e.data, type: 'log' }]);
      }
    });

    es.addEventListener('done', (e) => {
      try {
        const data = JSON.parse(e.data);
        setFinalStatus(data.status);
        setStatus(data.status === 'complete' ? 'done' : 'failed');
      } catch {
        setStatus('done');
      }
      es.close();
    });

    es.addEventListener('error', () => {
      if (es.readyState === EventSource.CLOSED) {
        setStatus('error');
      }
    });

    // Fallback: close after 30 minutes
    const timeout = setTimeout(() => es.close(), 30 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      es.close();
    };
  }, [runId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  function downloadLogs() {
    const text = logs.map(l => `[${l.timestamp || ''}] ${l.stage ? `[${l.stage}] ` : ''}${l.line}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `cortexo-run-${runId}.log`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.08)', height: '480px' }}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#141420' }}>
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" style={{ color: '#818cf8' }} />
          <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Live Logs</span>
          <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
            {runId.slice(0, 8)}
          </code>

          {/* Status pill */}
          <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: status === 'done' ? 'rgba(16,185,129,0.12)' : status === 'failed' ? 'rgba(239,68,68,0.12)' : status === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
              color: status === 'done' ? '#10b981' : status === 'failed' ? '#ef4444' : status === 'error' ? '#ef4444' : '#818cf8',
            }}>
            {status === 'connecting' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
            {status === 'streaming' && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
            {status === 'done' && <CheckCircle className="h-2.5 w-2.5" />}
            {(status === 'failed' || status === 'error') && <XCircle className="h-2.5 w-2.5" />}
            {status === 'connecting' ? 'Connecting' : status === 'streaming' ? 'Live' : status === 'done' ? 'Complete' : status === 'failed' ? 'Failed' : 'Error'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadLogs} title="Download logs"
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ color: '#64748b' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>
            <Download className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} title="Close"
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{ color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Log output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
        {logs.length === 0 && status === 'connecting' && (
          <div className="flex items-center gap-2 text-indigo-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Connecting to log stream...</span>
          </div>
        )}
        {logs.map((log, i) => {
          const color = levelColors[log.level || 'info'];
          const isError = log.level === 'error' || log.type === 'failed';
          return (
            <div key={i} className="flex items-start gap-3 py-0.5">
              {log.timestamp && (
                <span className="shrink-0 opacity-30" style={{ fontSize: '10px' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              )}
              {log.stage && (
                <span className="shrink-0 rounded px-1 text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                  {log.stage}
                </span>
              )}
              <span style={{ color: isError ? '#ef4444' : color, wordBreak: 'break-all' }}>
                {log.line}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
