'use client';

import { useState } from 'react';
import {
  RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle,
  Server, GitBranch, ChevronRight, Filter, Search, Undo2, Loader2, RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const statusColors: Record<string, { color: string; label: string }> = {
  completed: { color: '#10B981', label: 'Completed' },
  success:   { color: '#10B981', label: 'Success' },
  failed:    { color: '#EF4444', label: 'Failed' },
  pending:   { color: '#F59E0B', label: 'Pending' },
  running:   { color: '#3B82F6', label: 'Running' },
};

export default function RollbacksPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState('all');

  const { data: deployments, loading, error, refetch } = useApiData(
    () => api.getDeployments(),
    { default: [] as any[] }
  );

  // Filter rollbacks — deployments with type === 'rollback' or status includes rollback
  const allRollbacks = (deployments || []).filter((d: any) =>
    d.type === 'rollback' || (d.commitMessage || '').toLowerCase().includes('rollback') ||
    d.isRollback === true
  ).map((rb: any) => ({
    id: rb.id,
    project: rb.projectName || rb.project || 'Unknown',
    version: rb.commitMessage || `${rb.commitSha?.slice(0, 7) || '—'}`,
    server: rb.serverName || rb.server || '—',
    status: rb.status || 'completed',
    reason: rb.commitMessage || 'Manual rollback',
    triggeredBy: rb.triggeredBy || rb.userName || 'System',
    time: rb.createdAt,
    duration: rb.duration || '—',
  }));

  const filtered = filter === 'all' ? allRollbacks : allRollbacks.filter((r: any) => r.status === filter);
  const completedCount = allRollbacks.filter((r: any) => r.status === 'completed' || r.status === 'success').length;
  const failedCount = allRollbacks.filter((r: any) => r.status === 'failed').length;

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw style={{ width: '22px', height: '22px', color: '#F59E0B' }} /> Rollbacks
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Deployment rollback history and status</p>
        </div>
        <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
          <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Rollbacks', value: loading ? '—' : String(allRollbacks.length), icon: Undo2, color: '#818CF8' },
          { label: 'Successful', value: loading ? '—' : String(completedCount), icon: CheckCircle, color: '#10B981' },
          { label: 'Failed', value: loading ? '—' : String(failedCount), icon: XCircle, color: '#EF4444' },
          { label: 'Total Deploys', value: loading ? '—' : String((deployments || []).length), icon: Clock, color: '#3B82F6' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${c.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
                <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${c.color}12` }}>
                  <Icon style={{ width: '15px', height: '15px', color: c.color }} />
                </div>
              </div>
              <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {['all', 'completed', 'failed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, border: '1px solid', borderColor: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--border))', backgroundColor: filter === f ? 'rgba(var(--primary), 0.08)' : 'transparent', color: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading rollbacks...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {/* Rollback List */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((rb: any) => {
            const sc = statusColors[rb.status] || statusColors.completed;
            return (
              <div key={rb.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${sc.color}`, borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${sc.color}12`, flexShrink: 0 }}>
                  <RotateCcw style={{ width: '16px', height: '16px', color: sc.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{rb.project}</h3>
                    <code style={{ fontSize: '11px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--primary))' }}>{rb.version}</code>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${sc.color}15`, color: sc.color }}>{sc.label}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '6px 0 0' }}>{rb.reason}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                    <span><Server style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{rb.server}</span>
                    <span>By: {rb.triggeredBy}</span>
                    {rb.time && <span>{new Date(rb.time).toLocaleString()}</span>}
                    <span>Duration: {rb.duration}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <RotateCcw style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                {allRollbacks.length === 0 ? 'No rollbacks recorded — deploy history will filter rollbacks here' : 'No rollbacks match this filter'}
              </p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
