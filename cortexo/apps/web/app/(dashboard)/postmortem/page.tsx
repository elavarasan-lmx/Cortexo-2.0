'use client';

import { FileCheck, Clock, AlertTriangle, CheckCircle, ChevronRight, Users, Server, Loader2, RefreshCw } from 'lucide-react';
import { api, type AuditLog } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const sevColors: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#6B7280' };

function inferSeverity(action: string): string {
  const a = (action || '').toLowerCase();
  if (a.includes('critical') || a.includes('crash') || a.includes('500') || a.includes('outage')) return 'critical';
  if (a.includes('error') || a.includes('fail') || a.includes('rollback')) return 'high';
  if (a.includes('warning') || a.includes('timeout') || a.includes('slow')) return 'medium';
  return 'low';
}

export default function PostmortemPage() {
  useAutoLoadToken();
  const { data: logs, loading, error, refetch } = useApiData(
    () => api.getAuditLogs(),
    { default: [] as AuditLog[] }
  );

  // Filter audit logs that look like incidents
  const postmortems = (logs || [])
    .filter((l: AuditLog) => {
      const a = (l.action || '').toLowerCase();
      return a.includes('error') || a.includes('fail') || a.includes('rollback') || a.includes('crash')
        || a.includes('outage') || a.includes('incident') || a.includes('restart');
    })
    .map((l: AuditLog) => ({
      id: l.id,
      title: l.action || 'Unknown Incident',
      severity: inferSeverity(l.action || ''),
      status: l.action?.toLowerCase().includes('resolv') ? 'resolved' : 'investigating',
      date: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—',
      rootCause: l.details || l.resource || 'Under investigation',
      owner: l.userName || 'System',
      resource: l.resource || '—',
    }));

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck style={{ width: '22px', height: '22px', color: '#818CF8' }} /> Postmortem Reports
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Incident analysis, root cause documentation, and action items</p>
        </div>
        <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
          <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Incidents', value: loading ? '—' : String(postmortems.length), color: '#818CF8' },
          { label: 'Resolved', value: loading ? '—' : String(postmortems.filter((p: any) => p.status === 'resolved').length), color: '#10B981' },
          { label: 'Open', value: loading ? '—' : String(postmortems.filter((p: any) => p.status !== 'resolved').length), color: '#F59E0B' },
          { label: 'Critical', value: loading ? '—' : String(postmortems.filter((p: any) => p.severity === 'critical').length), color: '#EF4444' },
        ].map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading incidents...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {postmortems.map((pm: any) => (
            <div key={pm.id} style={{ padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${sevColors[pm.severity]}`, borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{pm.title}</h3>
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${sevColors[pm.severity]}15`, color: sevColors[pm.severity], textTransform: 'capitalize' }}>{pm.severity}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: pm.status === 'resolved' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: pm.status === 'resolved' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>{pm.status}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '8px 0 0' }}><strong>Root Cause:</strong> {pm.rootCause}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                <span><Users style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{pm.owner}</span>
                <span>{pm.date}</span>
                {pm.resource !== '—' && <span><Server style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{pm.resource}</span>}
              </div>
            </div>
          ))}
          {postmortems.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <FileCheck style={{ width: '32px', height: '32px', color: '#10B981', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No incidents recorded — great news! 🎉</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
