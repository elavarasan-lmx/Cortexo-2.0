'use client';

import { useState } from 'react';
import { AlertTriangle, Clock, Package, ChevronRight, CheckCircle, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const impactColors: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#6B7280' };
const statusColors: Record<string, { color: string; label: string }> = {
  deprecated: { color: '#EF4444', label: 'Deprecated' },
  warning: { color: '#F59E0B', label: 'Warning' },
  sunset: { color: '#F97316', label: 'Sunset' },
  migrated: { color: '#10B981', label: 'Migrated' },
  suppressed: { color: '#6B7280', label: 'Suppressed' },
};

export default function DeprecationPage() {
  useAutoLoadToken();
  const [search, setSearch] = useState('');
  const [suppressing, setSuppressing] = useState<string | null>(null);

  const { data: results, loading, error, refetch } = useApiData(
    () => api.getDeprecationResults(),
    { default: [] as Record<string, unknown>[] }
  );

  const { data: summary } = useApiData(
    () => api.getDeprecationSummary(),
    { default: {} as Record<string, unknown> }
  );

  const handleSuppress = async (id: string) => {
    setSuppressing(id);
    try {
      await api.suppressDeprecation(id, { reason: 'Acknowledged' });
      await refetch();
    } catch { /* ignore */ }
    setSuppressing(null);
  };

  const filtered = (results || []).filter((d: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (d.name || '').toLowerCase().includes(q) ||
      (d.type || '').toLowerCase().includes(q) ||
      (d.replacement || '').toLowerCase().includes(q);
  });

  const totalItems = (results || []).length;
  const criticalCount = (results || []).filter((d: any) => d.impact === 'critical' || d.severity === 'critical').length;
  const migratedCount = (results || []).filter((d: any) => d.status === 'migrated').length;

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle style={{ width: '22px', height: '22px', color: '#F59E0B' }} /> Deprecations
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Track deprecated dependencies, APIs, and scheduled migrations</p>
        </div>
        <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
          <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Items', value: loading ? '—' : String(totalItems), color: '#818CF8' },
          { label: 'Critical Impact', value: loading ? '—' : String(criticalCount), color: '#EF4444' },
          { label: 'Scans Run', value: String((summary as any)?.totalScans || 0), color: '#F59E0B' },
          { label: 'Migrated', value: loading ? '—' : String(migratedCount), color: '#10B981' },
        ].map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deprecations..."
          style={{ width: '100%', padding: '9px 14px 9px 36px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading deprecations...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((dep: any) => {
            const status = dep.status || 'warning';
            const sc = statusColors[status] || statusColors.warning;
            const impact = dep.impact || dep.severity || 'medium';
            return (
              <div key={dep.id} style={{ padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${sc.color}`, borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Package style={{ width: '16px', height: '16px', color: sc.color }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{dep.name || dep.packageName || dep.dependency || 'Unknown'}</h3>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${sc.color}15`, color: sc.color }}>{sc.label}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${impactColors[impact] || '#6B7280'}15`, color: impactColors[impact] || '#6B7280', textTransform: 'capitalize' }}>{impact} impact</span>
                  {dep.type && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.2)', color: 'rgb(var(--text-muted))' }}>{dep.type}</span>}
                  <div style={{ flex: 1 }} />
                  {status !== 'suppressed' && (
                    <button onClick={(e) => { e.stopPropagation(); handleSuppress(dep.id); }} disabled={suppressing === dep.id}
                      style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '10px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
                      {suppressing === dep.id ? '...' : 'Suppress'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>
                  {dep.replacement && <span><strong>Replace with:</strong> {dep.replacement}</span>}
                  {dep.deadline && <><span>·</span><span><Clock style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />Deadline: {dep.deadline}</span></>}
                  {dep.currentVersion && <span>Current: {dep.currentVersion}</span>}
                  {dep.latestVersion && <span>Latest: {dep.latestVersion}</span>}
                </div>
                {dep.affectedModules && <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '6px 0 0' }}>Affects: {Array.isArray(dep.affectedModules) ? dep.affectedModules.join(', ') : dep.affectedModules}</p>}
                {dep.filePath && <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>{dep.filePath}{dep.line ? `:${dep.line}` : ''}</p>}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
              <CheckCircle style={{ width: '32px', height: '32px', color: '#10B981', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                {totalItems === 0 ? 'No deprecations found — run a scan to check!' : 'No results match your search'}
              </p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
