'use client';

import { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle, XCircle,
  Search, Bug, Shield, Lock, Eye, ChevronRight, Loader2, RefreshCw, Play,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const typeIcons: Record<string, typeof ShieldCheck> = { security: Shield, dependency: Bug, code: Eye, secrets: Lock, ssl: ShieldCheck };

export default function ScansPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState('all');
  const [runningSSL, setRunningSSL] = useState(false);
  const [runningDep, setRunningDep] = useState(false);

  const { data: sslResults, loading: loadingSSL, refetch: refetchSSL } = useApiData(
    () => api.getSSLScanResults(),
    { default: [] as any[] }
  );

  const { data: depResults, loading: loadingDep, refetch: refetchDep } = useApiData(
    () => api.getDeprecationResults(),
    { default: [] as any[] }
  );

  // Combine all scan results into a unified list
  const allScans = [
    ...(sslResults || []).map((s: any) => ({
      id: s.id || `ssl-${s.domain}`,
      type: 'security',
      title: `SSL: ${s.domain || 'Unknown'}`,
      target: s.domain || '—',
      status: s.valid ? 'completed' : 'warning',
      findings: s.valid ? 0 : 1,
      critical: s.daysUntilExpiry < 7 ? 1 : 0,
      high: s.daysUntilExpiry < 30 && s.daysUntilExpiry >= 7 ? 1 : 0,
      medium: 0,
      time: s.lastChecked ? new Date(s.lastChecked).toLocaleString() : '—',
      details: s.valid ? `Valid until ${s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : '—'} (${s.daysUntilExpiry || 0}d)` : `⚠ ${s.error || 'Invalid'}`,
    })),
    ...(depResults || []).map((d: any) => ({
      id: d.id || `dep-${d.name}`,
      type: 'dependency',
      title: `Dep: ${d.name || d.packageName || 'Unknown'}`,
      target: d.filePath || d.type || '—',
      status: 'completed',
      findings: 1,
      critical: (d.severity === 'critical' || d.impact === 'critical') ? 1 : 0,
      high: (d.severity === 'high' || d.impact === 'high') ? 1 : 0,
      medium: (d.severity === 'medium' || d.impact === 'medium') ? 1 : 0,
      time: d.scannedAt ? new Date(d.scannedAt).toLocaleString() : '—',
      details: d.replacement ? `Replace with: ${d.replacement}` : '',
    })),
  ];

  const filtered = filter === 'all' ? allScans : allScans.filter(s => s.type === filter);
  const totalFindings = allScans.reduce((s, sc) => s + sc.findings, 0);
  const loading = loadingSSL || loadingDep;

  const handleRunSSL = async () => {
    setRunningSSL(true);
    try { await api.runSSLScan(); await refetchSSL(); } catch {}
    setRunningSSL(false);
  };

  const handleRunDep = async () => {
    setRunningDep(true);
    try { await api.runDeprecationScan(); await refetchDep(); } catch {}
    setRunningDep(false);
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck style={{ width: '22px', height: '22px', color: '#10B981' }} /> Scan Results
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Security scans, dependency audits, and code quality results</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleRunSSL} disabled={runningSSL} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
            {runningSSL ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '13px', height: '13px' }} />}
            Run SSL Scan
          </button>
          <button onClick={handleRunDep} disabled={runningDep} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
            {runningDep ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '13px', height: '13px' }} />}
            Run Dep Scan
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Scans', value: loading ? '—' : String(allScans.length), color: '#818CF8' },
          { label: 'Findings', value: loading ? '—' : String(totalFindings), color: '#F59E0B' },
          { label: 'Critical', value: loading ? '—' : String(allScans.reduce((s, sc) => s + sc.critical, 0)), color: '#EF4444' },
          { label: 'Clean', value: loading ? '—' : String(allScans.filter(s => s.findings === 0).length), color: '#10B981' },
        ].map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {['all', 'security', 'dependency'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, border: '1px solid', borderColor: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--border))', backgroundColor: filter === f ? 'rgba(var(--primary), 0.08)' : 'transparent', color: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))', cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading scan results...</p>
        </div>
      )}

      {/* Scan list */}
      {!loading && (
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
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${color}15`, color }}>{scan.findings === 0 ? 'Clean' : `${scan.findings} finding${scan.findings > 1 ? 's' : ''}`}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>Target: {scan.target} · {scan.time}</p>
                  {scan.details && <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>{scan.details}</p>}
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
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <ShieldCheck style={{ width: '32px', height: '32px', color: '#10B981', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No scan results yet — run a scan to check your infrastructure</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
