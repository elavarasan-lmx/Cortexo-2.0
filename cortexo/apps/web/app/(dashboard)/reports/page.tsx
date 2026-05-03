'use client';

import { FileText, Download, Calendar, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const demoReports = [
  { id: '1', name: 'Weekly Deploy Summary', type: 'deployment', generatedAt: '2026-05-01', period: 'Apr 25-May 1', status: 'ready', size: '2.4 MB' },
  { id: '2', name: 'Monthly Error Analysis', type: 'errors', generatedAt: '2026-05-01', period: 'April 2026', status: 'ready', size: '5.1 MB' },
  { id: '3', name: 'Security Audit Report', type: 'security', generatedAt: '2026-04-28', period: 'Q1 2026', status: 'ready', size: '8.7 MB' },
  { id: '4', name: 'Agent Performance Report', type: 'agent', generatedAt: '2026-04-25', period: 'April 2026', status: 'ready', size: '1.8 MB' },
  { id: '5', name: 'Infrastructure Cost Report', type: 'infra', generatedAt: '2026-04-20', period: 'March 2026', status: 'ready', size: '3.2 MB' },
];

const typeColors: Record<string, string> = { deployment: '#818CF8', errors: '#EF4444', security: '#10B981', agent: '#A78BFA', infra: '#F59E0B' };

export default function ReportsPage() {
  useAutoLoadToken();
  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText style={{ width: '22px', height: '22px', color: '#3B82F6' }} /> Reports
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Generated reports and analytics exports</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Reports', value: String(demoReports.length), color: '#818CF8' },
          { label: 'This Month', value: String(demoReports.filter(r => r.generatedAt >= '2026-05-01').length), color: '#3B82F6' },
          { label: 'Total Size', value: '21.2 MB', color: '#10B981' },
          { label: 'Auto-Generated', value: '3', color: '#F59E0B' },
        ].map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {demoReports.map((report) => {
          const color = typeColors[report.type] || '#6B7280';
          return (
            <div key={report.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                <FileText style={{ width: '16px', height: '16px', color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{report.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  <span><Calendar style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{report.period}</span>
                  <span>{report.generatedAt}</span>
                  <span>{report.size}</span>
                  <span style={{ textTransform: 'capitalize', color }}>{report.type}</span>
                </div>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--primary))', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <Download style={{ width: '12px', height: '12px' }} /> Download
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
