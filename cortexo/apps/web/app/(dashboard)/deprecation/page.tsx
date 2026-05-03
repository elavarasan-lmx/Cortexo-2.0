'use client';

import { AlertTriangle, Clock, Package, ChevronRight, CheckCircle } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const demoDeprecations = [
  { id: '1', name: 'Bower Package Manager', type: 'tool', status: 'deprecated', deadline: '2026-06-01', replacement: 'npm/yarn', impact: 'high', affectedModules: ['Admin Panel', 'Legacy Dashboard'] },
  { id: '2', name: 'jQuery DataTables', type: 'library', status: 'deprecated', deadline: '2026-07-15', replacement: 'AG Grid / React Table', impact: 'medium', affectedModules: ['Reporting Module'] },
  { id: '3', name: 'PHP 7.4 Support', type: 'runtime', status: 'warning', deadline: '2026-08-01', replacement: 'PHP 8.2+', impact: 'critical', affectedModules: ['WinBull Core', 'API Server'] },
  { id: '4', name: 'Legacy REST API v1', type: 'api', status: 'sunset', deadline: '2026-05-30', replacement: 'API v3', impact: 'high', affectedModules: ['Mobile App', 'Partner Integrations'] },
  { id: '5', name: 'Supervisor Process Manager', type: 'tool', status: 'warning', deadline: '2026-09-01', replacement: 'PM2 / systemd', impact: 'medium', affectedModules: ['Worker Processes'] },
];

const impactColors: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#6B7280' };
const statusColors: Record<string, { color: string; label: string }> = {
  deprecated: { color: '#EF4444', label: 'Deprecated' },
  warning: { color: '#F59E0B', label: 'Warning' },
  sunset: { color: '#F97316', label: 'Sunset' },
  migrated: { color: '#10B981', label: 'Migrated' },
};

export default function DeprecationPage() {
  useAutoLoadToken();
  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle style={{ width: '22px', height: '22px', color: '#F59E0B' }} /> Deprecations
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Track deprecated dependencies, APIs, and scheduled migrations</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Items', value: String(demoDeprecations.length), color: '#818CF8' },
          { label: 'Critical Impact', value: String(demoDeprecations.filter(d => d.impact === 'critical').length), color: '#EF4444' },
          { label: 'Due This Month', value: String(demoDeprecations.filter(d => d.deadline <= '2026-06-01').length), color: '#F59E0B' },
          { label: 'Migrated', value: '0', color: '#10B981' },
        ].map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {demoDeprecations.map((dep) => {
          const sc = statusColors[dep.status] || statusColors.warning;
          return (
            <div key={dep.id} style={{ padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${sc.color}`, borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Package style={{ width: '16px', height: '16px', color: sc.color }} />
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{dep.name}</h3>
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${sc.color}15`, color: sc.color }}>{sc.label}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${impactColors[dep.impact]}15`, color: impactColors[dep.impact], textTransform: 'capitalize' }}>{dep.impact} impact</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>
                <span><strong>Replace with:</strong> {dep.replacement}</span>
                <span>·</span>
                <span><Clock style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />Deadline: {dep.deadline}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '6px 0 0' }}>Affects: {dep.affectedModules.join(', ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
