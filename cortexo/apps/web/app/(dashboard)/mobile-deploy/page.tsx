'use client';

import React, { useState } from 'react';
import {
  Smartphone, Upload, CheckCircle, XCircle, Clock, Loader2,
  Search, Play, Package, Key, RefreshCw, ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';



/* ─── Status styling ─── */
const statusConfig: Record<string, { color: string; bg: string; label: string; icon: typeof CheckCircle }> = {
  idle:      { color: '#64748B', bg: 'rgba(100,116,139,0.1)', label: 'Ready',     icon: Clock },
  building:  { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  label: 'Building',  icon: Loader2 },
  signing:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Signing',   icon: Key },
  uploading: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  label: 'Uploading', icon: Upload },
  success:   { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Published', icon: CheckCircle },
  failed:    { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Failed',    icon: XCircle },
};

/* ─── Client config type ─── */
interface ClientConfig {
  name: string;
  type: 'flutter' | 'ionic';
  package: string;
  keystore: string;
  alias: string;
  version: string;
  versionCode: number;
  status: 'idle' | 'building' | 'signing' | 'uploading' | 'success' | 'failed';
  lastPublished?: string;
  playStoreUrl?: string;
}

export default function MobileDeployPage() {
  useAutoLoadToken();

  // Fetch real clients from WinBull config API
  const { data: rawConfigs, loading: configsLoading } = useApiData(
    () => api.getWinbullConfigs(),
    { default: [] as any[] }
  );

  // Transform API configs into ClientConfig shape
  const apiClients: ClientConfig[] = ((rawConfigs || []) as any[]).map((c: any) => ({
    name: c.displayName || c.clientSlug || 'Unknown',
    type: (c.configJson?.appType as 'flutter' | 'ionic') || 'ionic',
    package: c.configJson?.packageName || `com.lmx.${(c.clientSlug || '').replace(/-/g, '')}`,
    keystore: `${(c.clientSlug || '').replace(/-/g, '')}.keystore`,
    alias: (c.clientSlug || '').replace(/-/g, ''),
    version: (c.configJson?.version as string) || '1.0.0',
    versionCode: (c.configJson?.versionCode as number) || 1,
    status: 'idle' as const,
    lastPublished: c.lastDeployedAt || undefined,
  }));

  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'flutter' | 'ionic'>('all');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  // Sync API data into local state (preserving build status changes)
  React.useEffect(() => {
    if (apiClients.length > 0 && clients.length === 0) {
      setClients(apiClients);
    }
  }, [apiClients.length]);

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.package.includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchType;
  });

  const toggleSelect = (pkg: string) => {
    const next = new Set(selectedClients);
    next.has(pkg) ? next.delete(pkg) : next.add(pkg);
    setSelectedClients(next);
  };

  const selectAll = () => {
    if (selectedClients.size === filtered.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filtered.map(c => c.package)));
    }
  };

  /* Simulate build process */
  const startDeploy = async (pkgs: string[]) => {
    setShowLog(true);
    setBuildLog([]);
    for (const pkg of pkgs) {
      const client = clients.find(c => c.package === pkg);
      if (!client) continue;

      const addLog = (msg: string) => setBuildLog(prev => [...prev, `[${client.name}] ${msg}`]);
      const updateStatus = (status: ClientConfig['status']) => {
        setClients(prev => prev.map(c => c.package === pkg ? { ...c, status } : c));
      };

      addLog('🔨 Starting build...');
      updateStatus('building');
      await new Promise(r => setTimeout(r, 1500));

      addLog(client.type === 'flutter' ? '📦 flutter build appbundle --release' : '📦 ionic cordova build android --prod --release');
      await new Promise(r => setTimeout(r, 2000));

      addLog('🔑 Signing AAB with keystore...');
      updateStatus('signing');
      await new Promise(r => setTimeout(r, 1000));

      addLog('☁️ Uploading to Play Store...');
      updateStatus('uploading');
      await new Promise(r => setTimeout(r, 1500));

      addLog('✅ Published successfully!');
      updateStatus('success');
    }
    setBuildLog(prev => [...prev, '', '🎉 All deployments completed!']);
  };

  const totalClients = clients.length;
  const flutterCount = clients.filter(c => c.type === 'flutter').length;
  const ionicCount = clients.filter(c => c.type === 'ionic').length;
  const publishedCount = clients.filter(c => c.lastPublished).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            Mobile Deploy
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#8B5CF6', fontFamily: 'Inter, sans-serif' }}>
              📱 {totalClients} Clients Configured
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedClients.size > 0 && (
            <button
              onClick={() => startDeploy(Array.from(selectedClients))}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', backgroundColor: '#10B981', fontFamily: 'Inter, sans-serif', transition: 'all 150ms' }}
            >
              <Play style={{ width: '14px', height: '14px' }} />
              Deploy Selected ({selectedClients.size})
            </button>
          )}
          <button
            onClick={() => setShowLog(!showLog)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgb(var(--border))', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-secondary))', backgroundColor: 'rgb(var(--surface))', fontFamily: 'Inter, sans-serif' }}
          >
            {showLog ? 'Hide' : 'Show'} Build Log
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Clients', value: totalClients, color: '#8B5CF6', icon: Smartphone },
          { label: 'Flutter Apps', value: flutterCount, color: '#3B82F6', icon: Package },
          { label: 'Ionic Apps', value: ionicCount, color: '#F59E0B', icon: Package },
          { label: 'Published', value: publishedCount, color: '#10B981', icon: CheckCircle },
        ].map((stat, i) => (
          <div key={i} style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '18px', border: '1px solid rgb(var(--border))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>{stat.label}</p>
              <stat.icon style={{ width: '16px', height: '16px', color: stat.color }} />
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', minWidth: '260px' }}>
            <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: 'rgb(var(--text-primary))', width: '100%' }}
            />
          </div>
          {(['all', 'flutter', 'ionic'] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              fontSize: '13px', fontWeight: filterType === f ? 600 : 500,
              backgroundColor: filterType === f ? 'rgb(var(--primary))' : 'rgba(var(--text-muted), 0.1)',
              color: filterType === f ? '#FFFFFF' : 'rgb(var(--text-muted))', transition: 'all 150ms',
            }}>
              {f === 'all' ? `All (${totalClients})` : f === 'flutter' ? `Flutter (${flutterCount})` : `Ionic (${ionicCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Client Table */}
      <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden', border: '1px solid rgb(var(--border))', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(var(--text-muted), 0.05)', borderBottom: '1px solid rgb(var(--border))' }}>
              <th style={{ padding: '14px 16px', width: '40px' }}>
                <input type="checkbox" checked={selectedClients.size === filtered.length && filtered.length > 0} onChange={selectAll} style={{ cursor: 'pointer', accentColor: 'rgb(var(--primary))' }} />
              </th>
              {['Client', 'Type', 'Package', 'Version', 'Status', 'Last Published', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => {
              const st = statusConfig[client.status];
              return (
                <tr key={client.package} style={{ borderBottom: '1px solid rgb(var(--border))', transition: 'background-color 150ms' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <input type="checkbox" checked={selectedClients.has(client.package)} onChange={() => toggleSelect(client.package)} style={{ cursor: 'pointer', accentColor: 'rgb(var(--primary))' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>{client.name}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                      backgroundColor: client.type === 'flutter' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                      color: client.type === 'flutter' ? '#3B82F6' : '#F59E0B',
                    }}>
                      {client.type === 'flutter' ? '💙 Flutter' : '⚡ Ionic'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgb(var(--text-secondary))', fontFamily: 'JetBrains Mono, monospace' }}>
                    {client.package}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'JetBrains Mono, monospace' }}>
                    v{client.version} ({client.versionCode})
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: st.bg, color: st.color, fontFamily: 'Inter, sans-serif',
                    }}>
                      <st.icon style={{ width: '12px', height: '12px', animation: client.status === 'building' || client.status === 'uploading' ? 'spin 1s linear infinite' : 'none' }} />
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>
                    {client.lastPublished || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => startDeploy([client.package])} title="Deploy" style={{
                        padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                        backgroundColor: 'rgb(var(--primary))', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '4px', transition: 'opacity 150ms',
                      }}>
                        <Play style={{ width: '12px', height: '12px' }} /> Deploy
                      </button>
                      <button title="Rebuild" style={{
                        padding: '6px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        backgroundColor: 'rgba(var(--text-muted), 0.1)', color: 'rgb(var(--text-secondary))', display: 'flex', alignItems: 'center',
                      }}>
                        <RefreshCw style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '48px', textAlign: 'center' }}>
                  <Smartphone style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>No clients found</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgb(var(--text-secondary))', fontFamily: 'Inter, sans-serif' }}>Try a different search term.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Build Log Panel */}
      {showLog && (
        <div style={{ borderRadius: '12px', backgroundColor: '#0d1117', border: '1px solid #21262d', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#c9d1d9', fontFamily: 'Inter, sans-serif' }}>📋 Build Log</span>
            <button onClick={() => setBuildLog([])} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #30363d', backgroundColor: 'transparent', color: '#8b949e', cursor: 'pointer', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
              Clear
            </button>
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '12px', lineHeight: 1.8, color: '#c9d1d9', maxHeight: '300px', overflowY: 'auto' }}>
            {buildLog.length === 0 ? (
              <span style={{ color: '#484f58' }}>Waiting for build...</span>
            ) : buildLog.map((line, i) => (
              <div key={i} style={{ color: line.includes('✅') ? '#3fb950' : line.includes('❌') ? '#f85149' : line.includes('🎉') ? '#d2a8ff' : '#c9d1d9' }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
