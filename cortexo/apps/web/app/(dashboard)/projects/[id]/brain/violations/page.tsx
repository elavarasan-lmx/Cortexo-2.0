'use client';

import { useCallback } from 'react';
import {
  ShieldAlert, CheckCircle, FileCode, Search, AlertTriangle, EyeOff, FileText, Activity
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, timeAgo } from '@/lib/hooks';

export default function BrainViolationsPage({ params }: { params: { id: string } }) {
  const { data: violations, loading, refetch } = useApiData(() => api.request<any>('GET', `/projects/${params.id}/brain/violations`));

  const handleIgnore = useCallback(async (id: string) => {
    try {
      await api.request('POST', `/brain/violations/${id}/ignore`, {});
      refetch();
    } catch {}
  }, [refetch]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'rgb(var(--text-muted))' }}>
        <Activity style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading violations...
      </div>
    );
  }

  const items = violations || [];

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert style={{ width: '22px', height: '22px', color: '#EF4444' }} />
            Pattern Violations
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Code that diverges from learned brain patterns
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed rgb(var(--border))', borderRadius: '12px', color: 'rgb(var(--text-muted))' }}>
          <CheckCircle style={{ width: '32px', height: '32px', color: '#10B981', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'rgb(var(--text-primary))' }}>All Clear!</p>
          <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>No pattern violations found in recent commits.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item: any) => (
            <div key={item.id} style={{
              backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
              borderLeft: `3px solid ${item.status === 'open' ? '#EF4444' : '#6B7280'}`,
              borderRadius: '12px', padding: '16px', opacity: item.status === 'open' ? 1 : 0.6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{item.pattern?.name || 'Unknown Rule'}</span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(var(--border), 0.3)', color: 'rgb(var(--text-secondary))' }}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'rgb(var(--text-secondary))', marginBottom: '12px', fontFamily: 'monospace' }}>
                    <FileCode style={{ width: '12px', height: '12px' }} />
                    {item.file} {item.line && `:${item.line}`}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '8px', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Detected</span>
                      <code>{item.detected}</code>
                    </div>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '8px', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Expected</span>
                      <code>{item.expected}</code>
                    </div>
                  </div>
                </div>
                
                {item.status === 'open' && (
                  <button
                    onClick={() => handleIgnore(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                      border: '1px solid rgb(var(--border))', padding: '6px 12px', borderRadius: '6px',
                      fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-secondary))', cursor: 'pointer'
                    }}
                  >
                    <EyeOff style={{ width: '12px', height: '12px' }} /> Ignore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
