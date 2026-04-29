'use client';

import { useState } from 'react';
import {
  Layers, Package, Users, Activity, RefreshCw, Loader2,
  ChevronRight, Database, Globe, Smartphone, Server,
  Code2, Radio, FileCode, Shield, Eye,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';
import Link from 'next/link';

const LAYER_ICONS: Record<string, any> = {
  web: Globe, admin: Shield, mobileapi: Smartphone,
  tradeEngine: Radio, api: Code2, client: FileCode,
};
const LAYER_COLORS: Record<string, string> = {
  web: '#3B82F6', admin: '#8B5CF6', mobileapi: '#10B981',
  tradeEngine: '#F59E0B', api: '#06B6D4', client: '#EC4899',
};

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card" style={{ borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: '22px', height: '22px', color }} />
        </div>
        <div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'rgb(var(--text-primary))', lineHeight: 1.1 }}>{value}</div>
          <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '2px' }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function SourcesPage() {
  useAutoLoadToken();
  const { data: sources, loading, refetch } = useApiData(() => api.getSources());
  const { data: stats } = useApiData(() => api.getClientConfigStats());
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [loadingManifest, setLoadingManifest] = useState(false);

  const loadManifest = async (slug: string) => {
    if (expandedSource === slug) { setExpandedSource(null); return; }
    setLoadingManifest(true);
    try {
      const res = await api.getSourceManifest(slug);
      setManifest(res.data);
      setExpandedSource(slug);
    } catch { setManifest(null); }
    setLoadingManifest(false);
  };

  const allSources = (sources as any[]) || [];
  const allStats = (stats as any) || {};

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers style={{ width: '28px', height: '28px', color: '#EC4899' }} />
            Source Registry
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Managed application templates · {allSources.length} source{allSources.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
          </button>
          <Link href="/sources/clients" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #EC4899, #BE185D)', boxShadow: '0 4px 12px rgba(236,72,153,0.3)', textDecoration: 'none' }}>
            <Users style={{ width: '16px', height: '16px' }} /> Client Configs
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }} className="stagger-children">
        <StatCard icon={Package} label="Registered Sources" value={allSources.length} color="#EC4899" />
        <StatCard icon={Users} label="Total Clients" value={allStats.total || 0} color="#8B5CF6" />
        <StatCard icon={Activity} label="Active Clients" value={allStats.byStatus?.active || 0} color="#10B981" />
        <StatCard icon={Database} label="Avg Health" value={`${allStats.avgHealthScore || 0}%`} color="#3B82F6" />
      </div>

      {/* Sources List */}
      {allSources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px', border: '1px dashed rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
          <Package className="float-icon" style={{ width: '48px', height: '48px', color: 'rgb(var(--text-muted))', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>No Sources Registered</h3>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', maxWidth: '400px', margin: '0 auto' }}>
            Sources are application templates that Cortexo can deploy and manage. The Winbull source should be auto-registered on first API start.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allSources.map((src: any) => {
            const isExpanded = expandedSource === src.slug;
            const layers = manifest?.structure?.layers || [];
            return (
              <div key={src.id} className="glass-card card-enter" style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #EC4899, #8B5CF6, #3B82F6)' }} />

                {/* Source Header */}
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => loadManifest(src.slug)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #EC489920, #8B5CF620)', border: '1px solid rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package style={{ width: '28px', height: '28px', color: '#EC4899' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0 }}>{src.displayName || src.slug}</h2>
                      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>{src.description || 'No description'}</p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <span className="status-badge status-badge--connected">v{src.version || '1.0.0'}</span>
                        <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>Updated {timeAgo(src.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight style={{ width: '20px', height: '20px', color: 'rgb(var(--text-muted))', transition: 'transform 200ms', transform: isExpanded ? 'rotate(90deg)' : 'none' }} />
                </div>

                {/* Expanded: App Layers */}
                {isExpanded && manifest && (
                  <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgb(var(--border))' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '20px 0 14px' }}>Application Layers ({layers.length})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                      {layers.map((layer: any) => {
                        const LayerIcon = LAYER_ICONS[layer.name] || Server;
                        const layerColor = LAYER_COLORS[layer.name] || '#6B7280';
                        return (
                          <div key={layer.name} style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', padding: '16px', backgroundColor: 'rgb(var(--surface))', transition: 'border-color 200ms' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = layerColor + '60'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--border))'; }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${layerColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LayerIcon style={{ width: '16px', height: '16px', color: layerColor }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{layer.displayName}</div>
                                <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{layer.framework || layer.path}</div>
                              </div>
                            </div>
                            <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.5 }}>{layer.description}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                      <Link href="/sources/clients" className="action-btn"><Users style={{ width: 14, height: 14 }} /> View Clients</Link>
                      <Link href="/sources/provision" className="action-btn action-btn--success"><Eye style={{ width: 14, height: 14 }} /> New Client Wizard</Link>
                    </div>
                  </div>
                )}
                {isExpanded && loadingManifest && (
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', color: 'rgb(var(--text-muted))' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
