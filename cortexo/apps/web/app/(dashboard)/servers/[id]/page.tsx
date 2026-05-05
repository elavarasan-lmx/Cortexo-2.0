'use client';
import { use } from 'react';
import { Server, Cpu, HardDrive, Wifi, Activity, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import Link from 'next/link';

export default function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useAutoLoadToken();
  const { id } = use(params);

  const { data: server, loading, error, refetch } = useApiData(
    () => api.getServer(Number(id)),
    { default: null as any }
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading server...</p>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !server) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ fontSize: '14px', color: '#EF4444' }}>{error || 'Server not found'}</p>
      <Link href="/servers" style={{ fontSize: '13px', color: 'rgb(var(--primary))' }}>← Back to Servers</Link>
    </div>
  );

  const s = server;
  const name = s.name || s.hostname || 'Unknown';
  const ip = s.ip || s.host || '—';
  const os = s.os || s.platform || '—';
  const status = (s.status || 'offline').toLowerCase();
  const isOnline = status === 'online' || status === 'active';
  const statusColor = isOnline ? '#10B981' : '#EF4444';

  // Extract resource metrics if available
  const cpuPct = s.cpuPercent || s.cpu || 0;
  const ramPct = s.ramPercent || s.memory || 0;
  const diskPct = s.diskPercent || s.disk || 0;
  const bars = [
    { l: 'CPU', v: Number(cpuPct) || 0, c: '#3B82F6' },
    { l: 'RAM', v: Number(ramPct) || 0, c: '#10B981' },
    { l: 'Disk', v: Number(diskPct) || 0, c: '#F59E0B' },
  ];

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Link href="/servers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Servers
      </Link>
      <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: statusColor }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', backgroundColor: `${statusColor}12` }}>
            <Server style={{ width: '22px', height: '22px', color: statusColor }} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{name}</h1>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>{ip} • {os}</p>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: statusColor, padding: '4px 12px', borderRadius: '8px', backgroundColor: `${statusColor}12` }}>
            ● {isOnline ? 'Online' : 'Offline'}
          </span>
          <button onClick={() => refetch()} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Resource bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {bars.map(b => (
            <div key={b.l}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>{b.l}</span>
                <span style={{ color: b.c, fontWeight: 600 }}>{b.v}%</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgb(var(--border))', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.v}%`, borderRadius: '4px', backgroundColor: b.c, transition: 'width 500ms' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Server info */}
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 12px' }}>Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Hostname', value: name },
            { label: 'IP Address', value: ip },
            { label: 'OS', value: os },
            { label: 'Environment', value: s.environment || s.env || '—' },
            { label: 'Provider', value: s.provider || '—' },
            { label: 'Region', value: s.region || '—' },
            { label: 'Created', value: s.createdAt ? new Date(s.createdAt).toLocaleString() : '—' },
          ].filter(item => item.value !== '—').map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '10px', backgroundColor: 'rgba(var(--border),0.08)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', width: '100px' }}>{item.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
