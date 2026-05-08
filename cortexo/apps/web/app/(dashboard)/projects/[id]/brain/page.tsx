'use client';

import { useCallback } from 'react';
import {
  Brain, Scan, AlertTriangle, CheckCircle, FileCode, Search, Activity, ShieldAlert, FileText, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, timeAgo } from '@/lib/hooks';

export default function BrainDashboard({ params }: { params: { id: string } }) {
  const { data: brain, loading: brainLoading, refetch: refetchBrain } = useApiData(() => api.request<any>('GET', `/projects/${params.id}/brain`));
  const { data: patterns, loading: patternsLoading, refetch: refetchPatterns } = useApiData(() => api.request<any>('GET', `/projects/${params.id}/brain/patterns`));

  const handleScan = useCallback(async () => {
    try {
      await api.request('POST', `/projects/${params.id}/brain/scan`, {});
      refetchBrain();
      setTimeout(() => {
        refetchBrain();
        refetchPatterns();
      }, 4000); // Simulate worker delay
    } catch {}
  }, [params.id, refetchBrain, refetchPatterns]);

  const handleTogglePattern = useCallback(async (patternId: string, currentEnabled: boolean) => {
    try {
      await api.request('PUT', `/brain/patterns/${patternId}`, { enabled: !currentEnabled });
      refetchPatterns();
    } catch {}
  }, [refetchPatterns]);

  if (brainLoading || patternsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'rgb(var(--text-muted))' }}>
        <Brain style={{ width: '20px', height: '20px', animation: 'pulse 1.5s infinite', marginRight: '8px' }} /> Loading Source Code Brain...
      </div>
    );
  }

  const isScanning = brain?.status === 'scanning';

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} />
            Source Code Brain
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            AI-driven project intelligence, pattern detection, and enforcement
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            color: '#fff', cursor: isScanning ? 'not-allowed' : 'pointer', opacity: isScanning ? 0.7 : 1,
            transition: 'all 200ms',
          }}
        >
          {isScanning ? <Activity style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Scan style={{ width: '14px', height: '14px' }} />}
          {isScanning ? 'Scanning Codebase...' : 'Scan Codebase'}
        </button>
      </div>

      {/* Main Status Card */}
      <div style={{
        backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
        borderRadius: '14px', padding: '24px', marginBottom: '24px',
        display: 'flex', gap: '24px', flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid rgb(var(--border))', paddingRight: '24px' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '12px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
              <path stroke="rgba(var(--border), 0.5)" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="rgb(var(--primary))" strokeWidth="3" strokeDasharray={`${brain?.freshness || 0}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'rgb(var(--text-primary))', lineHeight: 1 }}>{brain?.freshness || 0}</span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase' }}>Health</span>
            </div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Brain Freshness</span>
        </div>

        <div style={{ flex: '3 1 300px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', alignContent: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Status</p>
            <span style={{ fontSize: '14px', fontWeight: 600, color: isScanning ? '#F59E0B' : '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isScanning ? <Activity style={{ width: '14px', height: '14px' }} /> : <CheckCircle style={{ width: '14px', height: '14px' }} />}
              {isScanning ? 'Scanning' : (brain?.status === 'ready' ? 'Ready' : 'Pending')}
            </span>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Files Scanned</p>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileCode style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
              {brain?.totalFilesScanned || 0}
            </span>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Patterns Learned</p>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Brain style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
              {brain?.patternsDetected || 0}
            </span>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Last Scan</p>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-secondary))' }}>
              {brain?.lastScannedAt ? timeAgo(brain.lastScannedAt) : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Patterns Section */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles style={{ width: '16px', height: '16px', color: 'rgb(var(--agent))' }} /> Learned Patterns
      </h2>

      {(!patterns || patterns.length === 0) && !isScanning && (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgb(var(--border))', borderRadius: '12px', color: 'rgb(var(--text-muted))' }}>
          <Search style={{ width: '24px', height: '24px', opacity: 0.5, margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', margin: 0 }}>No patterns detected yet. Run a codebase scan to learn.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {patterns?.map((pattern: any) => (
          <div key={pattern.id} style={{
            backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
            borderRadius: '12px', padding: '16px', opacity: pattern.enabled ? 1 : 0.6,
            transition: 'all 200ms'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'rgb(var(--primary))', backgroundColor: 'rgba(var(--primary), 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {pattern.category || 'General'}
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '8px 0 4px 0' }}>{pattern.name}</h3>
                <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0 }}>Enforce: <code style={{ backgroundColor: 'rgba(var(--border), 0.3)', padding: '2px 4px', borderRadius: '4px', fontSize: '11px' }}>{pattern.detectedValue}</code></p>
              </div>
              <button
                onClick={() => handleTogglePattern(pattern.id, pattern.enabled)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: pattern.enabled ? '#10B981' : 'rgb(var(--text-muted))' }}
              >
                {pattern.enabled ? <ToggleRight style={{ width: '24px', height: '24px' }} /> : <ToggleLeft style={{ width: '24px', height: '24px' }} />}
              </button>
            </div>
            
            <div style={{ backgroundColor: 'rgba(var(--border), 0.1)', padding: '10px', borderRadius: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
              <span style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Violation Message:</span>
              "{pattern.violationMessage}"
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
              <span>Found in {pattern.occurrenceCount} files</span>
              <span style={{ color: pattern.severity === 'high' ? '#EF4444' : '#F59E0B' }}>Severity: {pattern.severity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
