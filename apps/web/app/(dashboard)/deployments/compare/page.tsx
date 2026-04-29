'use client';

import { useState } from 'react';
import { GitCompareArrows, ArrowRight, CheckCircle, XCircle, Clock, Loader2, Rocket, GitBranch } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, useProjectLookup, resolveProjectName, timeAgo } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';

const statusCfg: Record<string, { color: string; bg: string; label: string }> = {
  success:   { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Success' },
  failed:    { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Failed' },
  deploying: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  label: 'Deploying' },
  pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
};

export default function DeployDiffPage() {
  useAutoLoadToken();
  const toast = useToastStore();
  const { data: deployments } = useApiData(() => api.getDeployments());
  const { lookup } = useProjectLookup();
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');

  // Warn when selecting the same deployment on both sides
  const handleRightSelect = (id: string) => {
    if (id === leftId) { toast.warning('Same Deployment', 'Select a different deployment for comparison.'); return; }
    setRightId(id);
  };

  const list = (deployments || []) as any[];
  const left = list.find((d: any) => d.id === leftId);
  const right = list.find((d: any) => d.id === rightId);

  const diffFields = [
    { label: 'Project', left: left ? resolveProjectName(left.projectId, lookup) : '—', right: right ? resolveProjectName(right.projectId, lookup) : '—' },
    { label: 'Environment', left: left?.environment || '—', right: right?.environment || '—' },
    { label: 'Branch', left: left?.branch || '—', right: right?.branch || '—' },
    { label: 'Commit SHA', left: left?.commitSha?.slice(0, 8) || '—', right: right?.commitSha?.slice(0, 8) || '—' },
    { label: 'Status', left: left?.status || '—', right: right?.status || '—' },
    { label: 'Duration', left: left?.duration ? `${left.duration}s` : '—', right: right?.duration ? `${right.duration}s` : '—' },
    { label: 'Triggered By', left: left?.triggeredBy || '—', right: right?.triggeredBy || '—' },
    { label: 'Created', left: left ? timeAgo(left.createdAt) : '—', right: right ? timeAgo(right.createdAt) : '—' },
  ];

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: '13px', borderRadius: '10px',
    border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
    color: 'rgb(var(--text-primary))', outline: 'none',
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Deployment Comparison</h1>
      <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginBottom: '24px' }}>Compare two deployments side-by-side to identify configuration drift and changes</p>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end', marginBottom: '28px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, color: 'rgb(var(--text-muted))', marginBottom: '6px', letterSpacing: '0.04em' }}>Deployment A (Baseline)</label>
          <select value={leftId} onChange={e => setLeftId(e.target.value)} style={selectStyle}>
            <option value="">Select deployment...</option>
            {list.map((d: any) => (
              <option key={d.id} value={d.id}>{resolveProjectName(d.projectId, lookup)} → {d.environment} ({d.branch || 'main'}) — {timeAgo(d.createdAt)}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(var(--primary), 0.1)', flexShrink: 0 }}>
          <ArrowRight style={{ width: 18, height: 18, color: 'rgb(var(--primary))' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, color: 'rgb(var(--text-muted))', marginBottom: '6px', letterSpacing: '0.04em' }}>Deployment B (Compare)</label>
          <select value={rightId} onChange={e => handleRightSelect(e.target.value)} style={selectStyle}>
            <option value="">Select deployment...</option>
            {list.map((d: any) => (
              <option key={d.id} value={d.id}>{resolveProjectName(d.projectId, lookup)} → {d.environment} ({d.branch || 'main'}) — {timeAgo(d.createdAt)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Diff table */}
      {left && right ? (
        <div style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', backgroundColor: 'rgba(var(--border), 0.15)', borderBottom: '1px solid rgb(var(--border))' }}>
            <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, color: 'rgb(var(--text-muted))', letterSpacing: '0.05em' }}>Field</div>
            <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, color: '#3B82F6', letterSpacing: '0.05em' }}>Deployment A</div>
            <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, color: '#A78BFA', letterSpacing: '0.05em' }}>Deployment B</div>
          </div>
          {/* Rows */}
          {diffFields.map((f, i) => {
            const isDiff = f.left !== f.right;
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', borderBottom: i < diffFields.length - 1 ? '1px solid rgba(var(--border), 0.4)' : 'none', backgroundColor: isDiff ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                <div style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))' }}>{f.label}</div>
                <div style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 500, color: isDiff ? '#3B82F6' : 'rgb(var(--text-primary))', fontFamily: f.label === 'Commit SHA' ? "'JetBrains Mono', monospace" : 'inherit', borderLeft: `3px solid ${isDiff ? '#3B82F640' : 'transparent'}` }}>
                  {f.label === 'Status' && statusCfg[f.left] ? (
                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, backgroundColor: statusCfg[f.left].bg, color: statusCfg[f.left].color }}>{statusCfg[f.left].label}</span>
                  ) : f.left}
                </div>
                <div style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 500, color: isDiff ? '#A78BFA' : 'rgb(var(--text-primary))', fontFamily: f.label === 'Commit SHA' ? "'JetBrains Mono', monospace" : 'inherit', borderLeft: `3px solid ${isDiff ? '#A78BFA40' : 'transparent'}` }}>
                  {f.label === 'Status' && statusCfg[f.right] ? (
                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, backgroundColor: statusCfg[f.right].bg, color: statusCfg[f.right].color }}>{statusCfg[f.right].label}</span>
                  ) : f.right}
                </div>
              </div>
            );
          })}
          {/* Summary */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: diffFields.filter(f => f.left !== f.right).length > 0 ? '#F59E0B' : '#10B981' }}>
              {diffFields.filter(f => f.left !== f.right).length} differences found
            </span>
            {diffFields.filter(f => f.left !== f.right).length === 0 && (
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Both deployments are identical ✅</span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))', padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))' }}>
            <GitCompareArrows style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Select two deployments to compare</p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Choose a baseline and comparison deployment above to see the diff.</p>
          </div>
        </div>
      )}
    </div>
  );
}
