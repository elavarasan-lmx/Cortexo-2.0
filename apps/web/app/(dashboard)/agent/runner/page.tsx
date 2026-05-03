'use client';

import {
  Bot, Play, Square, RotateCcw, Terminal, Clock,
  CheckCircle, XCircle, Loader2, ChevronRight, Plus,
} from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

const demoJobs = [
  { id: '1', name: 'Production Health Check', skill: 'Deploy Orchestrator', status: 'running', startedAt: '2m ago', duration: '2m 14s', output: 'Checking PM2 processes on Server 1...' },
  { id: '2', name: 'Bug Scan — Booking Module', skill: 'Bug Hunter', status: 'completed', startedAt: '15m ago', duration: '4m 32s', output: '3 potential issues found in booking/api.php' },
  { id: '3', name: 'Config Sync Verification', skill: 'Config Drift Detector', status: 'failed', startedAt: '1h ago', duration: '12m 08s', output: 'ERROR: nginx.conf mismatch on server-3' },
  { id: '4', name: 'Nightly Log Analysis', skill: 'Log Pattern Analyzer', status: 'queued', startedAt: '-', duration: '-', output: 'Waiting for execution slot...' },
  { id: '5', name: 'Schema Optimization', skill: 'MySQL Query Analyzer', status: 'completed', startedAt: '3h ago', duration: '1m 56s', output: 'Suggested 4 index improvements' },
];

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  running:   { color: '#3B82F6', icon: Loader2, label: 'Running' },
  completed: { color: '#10B981', icon: CheckCircle, label: 'Completed' },
  failed:    { color: '#EF4444', icon: XCircle, label: 'Failed' },
  queued:    { color: '#F59E0B', icon: Clock, label: 'Queued' },
};

export default function AgentRunnerPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? demoJobs : demoJobs.filter(j => j.status === filter);

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot style={{ width: '22px', height: '22px', color: '#3B82F6' }} />
            Agent Runner
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Execute, monitor, and manage agent task runs
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)' }}>
          <Play style={{ width: '13px', height: '13px' }} /> New Run
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Running', value: String(demoJobs.filter(j => j.status === 'running').length), color: '#3B82F6' },
          { label: 'Queued', value: String(demoJobs.filter(j => j.status === 'queued').length), color: '#F59E0B' },
          { label: 'Completed', value: String(demoJobs.filter(j => j.status === 'completed').length), color: '#10B981' },
          { label: 'Failed', value: String(demoJobs.filter(j => j.status === 'failed').length), color: '#EF4444' },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: s.color, margin: '6px 0 0', lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'running', 'queued', 'completed', 'failed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, border: '1px solid', borderColor: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--border))', backgroundColor: filter === f ? 'rgba(var(--primary), 0.08)' : 'transparent', color: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((job) => {
          const sc = statusConfig[job.status];
          const StatusIcon = sc.icon;
          return (
            <div key={job.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${sc.color}`, borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${sc.color}12`, flexShrink: 0 }}>
                <StatusIcon style={{ width: '16px', height: '16px', color: sc.color, ...(job.status === 'running' ? { animation: 'spin 1s linear infinite' } : {}) }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{job.name}</h3>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${sc.color}15`, color: sc.color }}>{sc.label}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>{job.skill}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  <span>Started: {job.startedAt}</span>
                  <span>Duration: {job.duration}</span>
                </div>
                <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(var(--border), 0.2)', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-secondary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Terminal style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  {job.output}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                {job.status === 'running' && (
                  <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444', cursor: 'pointer' }}>
                    <Square style={{ width: '10px', height: '10px' }} />
                  </button>
                )}
                {job.status === 'failed' && (
                  <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.3)', backgroundColor: 'rgba(59,130,246,0.08)', color: '#3B82F6', cursor: 'pointer' }}>
                    <RotateCcw style={{ width: '10px', height: '10px' }} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
