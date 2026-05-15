'use client';
import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  FileBarChart, Download, Eye, Clock, FileText, Loader2,
  CheckCircle, AlertTriangle, Bug, FlaskConical, Rocket,
  ScrollText, Plus, ChevronRight,
} from 'lucide-react';

type ReportType = 'test-run' | 'bugs' | 'audit' | 'deployment';
const REPORT_TYPES: { key: ReportType; label: string; icon: any; color: string; desc: string }[] = [
  { key: 'test-run',   label: 'Test Run',   icon: FlaskConical, color: '#8B5CF6', desc: 'Pass/fail results per endpoint' },
  { key: 'bugs',       label: 'Bug Report', icon: Bug,          color: '#EF4444', desc: 'Issue severity breakdown' },
  { key: 'audit',      label: 'Code Audit', icon: ScrollText,   color: '#F59E0B', desc: 'Dependency + secret scan' },
  { key: 'deployment', label: 'Deployment', icon: Rocket,       color: '#06B6D4', desc: 'Server deployment log' },
];

interface Report {
  id: string;
  name: string;
  type: ReportType;
  date: string;
  status: string;
  pages: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportType | ''>('');
  const filtered = filter ? reports.filter(r => r.type === filter) : reports;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]} />
      <div className="cx-page-header cx-mb-24">
        <div>
          <h1 className="cx-flex cx-items-center cx-gap-10 cx-page-title">
            <FileBarChart style={{ width: '24px', height: '24px' }} className="cx-text-accent" />
            Reports
          </h1>
          <p className="cx-page-subtitle">{reports.length} report{reports.length !== 1 ? 's' : ''} generated · HTML + PDF export</p>
        </div>
        <button className="cx-btn-primary" style={{ backgroundColor: '#8B5CF6' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Generate Report
        </button>
      </div>

      {/* Report Type Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {REPORT_TYPES.map(rt => {
          const count = reports.filter(r => r.type === rt.key).length;
          return (
            <button key={rt.key} onClick={() => setFilter(filter === rt.key ? '' : rt.key)}
              className="cx-flex cx-items-center cx-gap-12" style={{
                padding: '16px 20px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                border: filter === rt.key ? `1px solid ${rt.color}` : '1px solid rgb(var(--border))',
                backgroundColor: filter === rt.key ? `${rt.color}08` : 'transparent',
                transition: 'all 200ms',
              }}>
              <div className="cx-flex-center cx-r-8" style={{ width: '40px', height: '40px', background: `${rt.color}15`, flexShrink: 0 }}>
                <rt.icon style={{ width: '20px', height: '20px', color: rt.color }} />
              </div>
              <div>
                <div className="cx-fw-700 cx-text-primary" style={{ fontSize: '14px' }}>{rt.label}</div>
                <div className="cx-text-muted" style={{ fontSize: '11px' }}>{rt.desc}</div>
                <div className="cx-fw-700" style={{ fontSize: '12px', color: rt.color, marginTop: '2px' }}>{count} report{count !== 1 ? 's' : ''}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report List */}
      <div className="cx-table-wrap">
        {filtered.length === 0 ? (
          <div className="cx-empty cx-text-muted" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px', margin: '0 auto 16px' }} />
            <p className="cx-fw-600" style={{ fontSize: '15px' }}>No reports yet</p>
            <p style={{ fontSize: '13px' }}>Generate a report from test runs, audits, or deployments</p>
          </div>
        ) : filtered.map((r, i) => {
          const rt = REPORT_TYPES.find(t => t.key === r.type)!;
          return (
            <div key={r.id} className="cx-flex cx-items-center cx-gap-14" style={{
              padding: '14px 18px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgb(var(--border))' : 'none',
              transition: 'background 150ms', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div className="cx-flex-center cx-r-8" style={{ width: '36px', height: '36px', background: `${rt.color}15`, flexShrink: 0 }}>
                <rt.icon style={{ width: '18px', height: '18px', color: rt.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cx-fw-600 cx-text-primary" style={{ fontSize: '14px' }}>{r.name}</div>
                <div className="cx-flex cx-gap-8 cx-text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                  <span className="cx-flex cx-items-center cx-gap-4"><Clock style={{ width: '10px', height: '10px' }} /> {r.date}</span>
                  <span>{r.pages} page{r.pages !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <span className="cx-fw-700" style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '5px',
                backgroundColor: `${rt.color}15`, color: rt.color, textTransform: 'uppercase' as const,
              }}>{r.type.replace('-', ' ')}</span>
              <div className="cx-flex cx-gap-6">
                <button className="cx-icon-btn cx-text-muted" title="Preview"><Eye style={{ width: '14px', height: '14px' }} /></button>
                <button className="cx-icon-btn cx-text-muted" title="Export PDF"><Download style={{ width: '14px', height: '14px' }} /></button>
              </div>
              <ChevronRight className="cx-text-muted" style={{ width: '14px', height: '14px' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
