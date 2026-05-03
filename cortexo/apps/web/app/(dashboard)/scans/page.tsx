'use client';

import {
  ShieldCheck, AlertTriangle, CheckCircle, XCircle,
  Search, Bug, Shield, Lock, Eye, ChevronRight,
} from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

const demoScans = [
  { id: '1', type: 'security', title: 'OWASP Top 10 Scan', target: 'WinBull Web', status: 'completed', findings: 3, critical: 1, high: 1, medium: 1, time: '2h ago' },
  { id: '2', type: 'dependency', title: 'Dependency Audit', target: 'All Projects', status: 'completed', findings: 12, critical: 2, high: 4, medium: 3, time: '6h ago' },
  { id: '3', type: 'code', title: 'Code Quality Scan', target: 'Admin Panel', status: 'running', findings: 0, critical: 0, high: 0, medium: 0, time: 'In progress' },
  { id: '4', type: 'secrets', title: 'Secrets Detection', target: 'All Repos', status: 'completed', findings: 1, critical: 1, high: 0, medium: 0, time: '1d ago' },
  { id: '5', type: 'security', title: 'SSL Certificate Check', target: 'Production Servers', status: 'completed', findings: 0, critical: 0, high: 0, medium: 0, time: '2d ago' },
];

const typeIcons: Record<string, typeof ShieldCheck> = { security: Shield, dependency: Bug, code: Eye, secrets: Lock };

export default function ScansPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? demoScans : demoScans.filter(s => s.type === filter);
  const totalFindings = demoScans.reduce((s, sc) => s + sc.findings, 0);

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck style={{ width: '22px', height: '22px', color: '#10B981' }} /> Scan Results
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Security scans, dependency audits, and code quality results</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Scans', value: String(demoScans.length), color: '#818CF8' },
          { label: 'Findings', value: String(totalFindings), color: '#F59E0B' },
          { label: 'Critical', value: String(demoScans.reduce((s, sc) => s + sc.critical, 0)), color: '#EF4444' },
          { label: 'Clean', value: String(demoScans.filter(s => s.findings === 0).length), color: '#10B981' },
        ].map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {['all', 'security', 'dependency', 'code', 'secrets'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, border: '1px solid', borderColor: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--border))', backgroundColor: filter === f ? 'rgba(var(--primary), 0.08)' : 'transparent', color: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))', cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((scan) => {
          const Icon = typeIcons[scan.type] || ShieldCheck;
          const color = scan.critical > 0 ? '#EF4444' : scan.findings > 0 ? '#F59E0B' : '#10B981';
          return (
            <div key={scan.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${color}`, borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                <Icon style={{ width: '16px', height: '16px', color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{scan.title}</h3>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${color}15`, color }}>{scan.findings === 0 ? 'Clean' : `${scan.findings} findings`}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>Target: {scan.target} · {scan.time}</p>
                {scan.findings > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {scan.critical > 0 && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>{scan.critical} Critical</span>}
                    {scan.high > 0 && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(249,115,22,0.12)', color: '#F97316' }}>{scan.high} High</span>}
                    {scan.medium > 0 && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>{scan.medium} Med</span>}
                  </div>
                )}
              </div>
              <ChevronRight style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
