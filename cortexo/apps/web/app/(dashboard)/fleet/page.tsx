'use client';

import { useCallback } from 'react';
import {
  Layers, HeartPulse, Activity, AlertTriangle, Bug,
  CheckCircle, GitBranch, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';
import Link from 'next/link';

// ─── Health Badge Helper ────────────────────────────────────────────

function HealthBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
        backgroundColor: 'rgba(var(--border), 0.3)', color: 'rgb(var(--text-muted))'
      }}>
        <Activity style={{ width: '12px', height: '12px' }} />
        N/A
      </span>
    );
  }

  let color = '#10B981'; // Green
  let icon = <CheckCircle style={{ width: '12px', height: '12px' }} />;
  
  if (score < 50) {
    color = '#EF4444'; // Red
    icon = <AlertCircle style={{ width: '12px', height: '12px' }} />;
  } else if (score < 80) {
    color = '#F59E0B'; // Yellow
    icon = <AlertTriangle style={{ width: '12px', height: '12px' }} />;
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
      backgroundColor: `${color}15`, color: color, border: `1px solid ${color}30`
    }}>
      {icon}
      {score}
    </span>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function FleetDashboard() {
  useAutoLoadToken();
  const { data: fleet, loading, refetch } = useApiData(() => api.request<any>('GET', '/fleet'));

  const items = fleet || [];

  const handleRecalculate = useCallback(async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.request('POST', `/fleet/${id}/recalculate`, {});
      refetch();
    } catch { /* ignore */ }
  }, [refetch]);

  const handleRecalculateAll = useCallback(async () => {
    for (const client of items) {
      try {
        await api.request('POST', `/fleet/${client.id}/recalculate`, {});
      } catch {}
    }
    refetch();
  }, [items, refetch]);

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} />
            Client Fleet Health
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Real-time health scores and rollout status across all deployed clients
          </p>
        </div>
        
        <button
          onClick={handleRecalculateAll}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
            color: 'rgb(var(--text-primary))', cursor: 'pointer', transition: 'all 200ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface))' }}
        >
          <RefreshCw style={{ width: '14px', height: '14px' }} />
          Recalculate All
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {loading && (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading fleet data...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px 20px', border: '2px dashed rgb(var(--border))', borderRadius: '14px', textAlign: 'center',
          }}>
            <Layers style={{ width: '36px', height: '36px', color: 'rgb(var(--text-muted))', opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-secondary))', margin: 0 }}>No clients found</p>
          </div>
        )}

        {items.map((client: any) => (
          <Link 
            key={client.id}
            href={`/projects/${client.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              backgroundColor: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'box-shadow 200ms, transform 200ms',
              cursor: 'pointer',
              height: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgb(var(--primary))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'rgb(var(--border))';
            }}
            >
              {/* Top Row: Name and Score */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {client.name}
                  </h3>
                  {client.repo && (
                    <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <GitBranch style={{ width: '10px', height: '10px' }} />
                      {client.repo.replace(/^https?:\/\/(github\.com\/)?/, '')}
                    </p>
                  )}
                </div>
                <HealthBadge score={client.health_score} />
              </div>

              {/* Metrics Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                
                {/* Pending Fixes */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 10px', borderRadius: '8px',
                  backgroundColor: client.pending_fixes > 0 ? '#F59E0B15' : 'rgba(var(--border), 0.2)',
                  color: client.pending_fixes > 0 ? '#F59E0B' : 'rgb(var(--text-secondary))',
                  flex: '1 1 auto', minWidth: '100px'
                }}>
                  <Bug style={{ width: '14px', height: '14px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>Pending Fixes</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>{client.pending_fixes}</span>
                  </div>
                </div>

                {/* Critical Errors */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 10px', borderRadius: '8px',
                  backgroundColor: client.critical_errors > 0 ? '#EF444415' : 'rgba(var(--border), 0.2)',
                  color: client.critical_errors > 0 ? '#EF4444' : 'rgb(var(--text-secondary))',
                  flex: '1 1 auto', minWidth: '100px'
                }}>
                  <AlertCircle style={{ width: '14px', height: '14px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>Critical Errors</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>{client.critical_errors}</span>
                  </div>
                </div>
                
              </div>

              {/* Bottom Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(var(--border), 0.5)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  Last deploy: {client.last_deploy ? timeAgo(client.last_deploy) : 'Never'}
                </span>
                
                <button
                  onClick={(e) => handleRecalculate(client.id, e)}
                  style={{
                    background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                    color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center',
                    borderRadius: '4px', transition: 'all 200ms',
                  }}
                  title="Recalculate Score"
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--primary))'; e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--text-muted))'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <RefreshCw style={{ width: '12px', height: '12px' }} />
                </button>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
