'use client';

import {
  RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle,
  Server, GitBranch, ChevronRight, Filter, Search, Undo2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

const demoRollbacks = [
  { id: '1', project: 'WinBull Web', version: 'v2.4.1 → v2.4.0', server: 'Production-1', status: 'completed', reason: 'Booking API crash after deploy', triggeredBy: 'Tom (Agent)', time: '2h ago', duration: '45s' },
  { id: '2', project: 'WinBull Mobile API', version: 'v1.8.3 → v1.8.2', server: 'API-Server-2', status: 'completed', reason: 'Rate calculation mismatch', triggeredBy: 'Auto-rollback', time: '1d ago', duration: '32s' },
  { id: '3', project: 'Admin Panel', version: 'v3.1.0 → v3.0.9', server: 'Admin-1', status: 'failed', reason: 'Memory leak in dashboard module', triggeredBy: 'Manual', time: '3d ago', duration: '1m 12s' },
  { id: '4', project: 'WinBull Web', version: 'v2.3.8 → v2.3.7', server: 'Production-2', status: 'completed', reason: 'Nginx config drift after update', triggeredBy: 'Auto-rollback', time: '5d ago', duration: '28s' },
];

const statusColors: Record<string, { color: string; label: string }> = {
  completed: { color: '#10B981', label: 'Completed' },
  failed:    { color: '#EF4444', label: 'Failed' },
  pending:   { color: '#F59E0B', label: 'Pending' },
};

export default function RollbacksPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? demoRollbacks : demoRollbacks.filter(r => r.status === filter);

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RotateCcw style={{ width: '22px', height: '22px', color: '#F59E0B' }} />
          Rollbacks
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Deployment rollback history and status
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Rollbacks', value: String(demoRollbacks.length), icon: Undo2, color: '#818CF8' },
          { label: 'Successful', value: String(demoRollbacks.filter(r => r.status === 'completed').length), icon: CheckCircle, color: '#10B981' },
          { label: 'Failed', value: String(demoRollbacks.filter(r => r.status === 'failed').length), icon: XCircle, color: '#EF4444' },
          { label: 'Avg Duration', value: '39s', icon: Clock, color: '#3B82F6' },
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

      {/* Rollback List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((rb) => {
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
                  <span>{rb.time}</span>
                  <span>Duration: {rb.duration}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
