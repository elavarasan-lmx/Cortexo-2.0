'use client';

import { FileText, Download, Calendar, TrendingUp, Clock, BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const typeColors: Record<string, string> = { deployment: '#818CF8', errors: '#EF4444', security: '#10B981', agent: '#A78BFA', infra: '#F59E0B', sync: '#3B82F6' };

function inferReportType(d: any): string {
  const msg = ((d.commitMessage || d.projectName || d.type) || '').toLowerCase();
  if (msg.includes('error') || msg.includes('bug')) return 'errors';
  if (msg.includes('secur') || msg.includes('ssl')) return 'security';
  if (msg.includes('sync') || msg.includes('source')) return 'sync';
  return 'deployment';
}

export default function ReportsPage() {
  useAutoLoadToken();

  const { data: deployments, loading, error, refetch } = useApiData(
    () => api.getDeployments(),
    { default: [] as any[] }
  );

  // Generate reports from deployment history
  const reports = (deployments || []).slice(0, 10).map((d: any, i: number) => ({
    id: d.id || i,
    name: d.commitMessage || d.projectName || `Deploy #${d.id}`,
    type: inferReportType(d),
    generatedAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—',
    period: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
    status: d.status || 'ready',
    server: d.serverName || '—',
  }));

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText style={{ width: '22px', height: '22px', color: '#3B82F6' }} /> Reports
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Generated reports and analytics exports
            {reports.length > 0 && ` · ${reports.length} reports`}
          </p>
        </div>
        <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
          <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Reports', value: loading ? '—' : String(reports.length), color: '#818CF8' },
          { label: 'Deployments', value: loading ? '—' : String(reports.filter((r: any) => r.type === 'deployment').length), color: '#3B82F6' },
          { label: 'Error Reports', value: loading ? '—' : String(reports.filter((r: any) => r.type === 'errors').length), color: '#EF4444' },
          { label: 'Total Deploys', value: loading ? '—' : String((deployments || []).length), color: '#10B981' },
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
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading reports...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reports.map((report: any) => {
            const color = typeColors[report.type] || '#6B7280';
            return (
              <div key={report.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                  <FileText style={{ width: '16px', height: '16px', color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                    <span><Calendar style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{report.period}</span>
                    <span>{report.generatedAt}</span>
                    <span>{report.server}</span>
                    <span style={{ textTransform: 'capitalize', color }}>{report.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {reports.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <FileText style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No reports yet — deploy something to generate reports</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
