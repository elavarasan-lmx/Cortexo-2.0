'use client';

import { FileCheck, Clock, AlertTriangle, CheckCircle, ChevronRight, Users, Server } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const demoPostmortems = [
  { id: '1', title: 'Booking API 500 Errors - May Incident', severity: 'critical', status: 'resolved', date: '2026-05-01', duration: '2h 15m', rootCause: 'MySQL connection pool exhaustion under concurrent load', affectedServices: ['Booking API', 'Rate Engine'], owner: 'Tom' },
  { id: '2', title: 'Production Deploy Rollback - Nginx Drift', severity: 'high', status: 'resolved', date: '2026-04-28', duration: '45m', rootCause: 'SSL cert path mismatch after automated config update', affectedServices: ['Web Frontend'], owner: 'DevOps Agent' },
  { id: '3', title: 'Payment Module Timeout', severity: 'medium', status: 'investigating', date: '2026-04-25', duration: '1h 30m', rootCause: 'Razorpay sandbox API latency spike', affectedServices: ['Payment Gateway'], owner: 'Jerry' },
];

const sevColors: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#6B7280' };

export default function PostmortemPage() {
  useAutoLoadToken();
  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileCheck style={{ width: '22px', height: '22px', color: '#818CF8' }} /> Postmortem Reports
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Incident analysis, root cause documentation, and action items</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Incidents', value: String(demoPostmortems.length), color: '#818CF8' },
          { label: 'Resolved', value: String(demoPostmortems.filter(p => p.status === 'resolved').length), color: '#10B981' },
          { label: 'Open', value: String(demoPostmortems.filter(p => p.status !== 'resolved').length), color: '#F59E0B' },
          { label: 'Avg Resolution', value: '1h 30m', color: '#3B82F6' },
        ].map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {demoPostmortems.map((pm) => (
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
              <span><Clock style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{pm.duration}</span>
              <span><Users style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{pm.owner}</span>
              <span>{pm.date}</span>
              <span>Services: {pm.affectedServices.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
