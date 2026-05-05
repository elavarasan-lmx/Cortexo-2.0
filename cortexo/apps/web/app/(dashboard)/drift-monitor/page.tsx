'use client';
import { useState } from 'react';
import { Eye, AlertTriangle, CheckCircle2, GitCompareArrows, Server, Loader2, RefreshCw, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const sc: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#6B7280' };

export default function DriftMonitorPage() {
  useAutoLoadToken();
  const [scanning, setScanning] = useState<string | null>(null);

  const { data: configs, loading, error, refetch } = useApiData(
    () => api.getWinbullConfigs(),
    { default: [] as any[] }
  );

  // Build drift items from config data
  const items = (configs || []).map((c: any) => ({
    id: c.id || c.slug,
    resource: c.slug || c.name || 'Unknown',
    server: c.server_name || c.serverName || '—',
    severity: c.driftSeverity || 'low',
    detected: c.lastDriftCheck ? new Date(c.lastDriftCheck).toLocaleString() : '—',
    expected: c.expectedVersion || c.version || '—',
    actual: c.actualVersion || c.currentVersion || '—',
    resolved: c.driftResolved !== false,
    slug: c.slug,
    driftedFiles: c.driftedFiles || 0,
  }));

  const handleScan = async (slug: string) => {
    setScanning(slug);
    try {
      await api.scanClientDrift(slug, { host: '', username: '', remotePath: '' });
      await refetch();
    } catch {}
    setScanning(null);
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye style={{ width: '22px', height: '22px', color: '#F59E0B' }} /> Drift Monitor
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Detect and resolve infrastructure configuration drift</p>
        </div>
        <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
          <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { l: 'Total Configs', v: loading ? '—' : String(items.length), c: '#818CF8' },
          { l: 'Unresolved', v: loading ? '—' : String(items.filter((d: any) => !d.resolved).length), c: '#EF4444' },
          { l: 'With Drift', v: loading ? '—' : String(items.filter((d: any) => d.driftedFiles > 0).length), c: '#F97316' },
          { l: 'Clean', v: loading ? '—' : String(items.filter((d: any) => d.resolved && d.driftedFiles === 0).length), c: '#10B981' },
        ].map(c => (
          <div key={c.l} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.c }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.l}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.c, margin: '10px 0 0', lineHeight: 1 }}>{c.v}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading drift data...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((d: any) => {
            const col = sc[d.severity] || '#6B7280';
            return (
              <div key={d.id} style={{ padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: `1px solid ${d.resolved ? 'rgb(var(--border))' : col + '30'}`, borderRadius: '12px', cursor: 'pointer', opacity: d.resolved ? 0.7 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  {d.resolved ? <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981' }} /> : <AlertTriangle style={{ width: '16px', height: '16px', color: col }} />}
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{d.resource}</h3>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: col, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', backgroundColor: `${col}12` }}>{d.severity}</span>
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginLeft: 'auto' }}><Server style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{d.server}</span>
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{d.detected}</span>
                  {d.slug && (
                    <button onClick={() => handleScan(d.slug)} disabled={scanning === d.slug} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '10px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
                      {scanning === d.slug ? <Loader2 style={{ width: '10px', height: '10px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '10px', height: '10px' }} />} Scan
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#10B98112' }}>
                    <p style={{ fontSize: '10px', color: '#10B981', margin: 0, fontWeight: 600 }}>EXPECTED</p>
                    <p style={{ margin: '4px 0 0', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{d.expected}</p>
                  </div>
                  <GitCompareArrows style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
                  <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#EF444412' }}>
                    <p style={{ fontSize: '10px', color: '#EF4444', margin: 0, fontWeight: 600 }}>ACTUAL</p>
                    <p style={{ margin: '4px 0 0', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{d.actual}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <Eye style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No configurations to monitor — add client configs first</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
