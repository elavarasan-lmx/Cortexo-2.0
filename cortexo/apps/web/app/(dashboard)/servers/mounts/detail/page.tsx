'use client';

import { useSearchParams } from 'next/navigation';
import {
  HardDrive, ArrowLeft, FolderTree, RefreshCw, Activity,
  Clock, CheckCircle, XCircle, Server, FolderOpen,
  Upload, Download, Wifi, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

export default function SSHFSDetailPage() {
  useAutoLoadToken();
  const params = useSearchParams();
  const mountId = params.get('id') || '';

  // Try specific mount first, fall back to listing all
  const { data: mounts, loading, error, refetch } = useApiData(
    () => api.getServerMounts(),
    { default: [] as any[] }
  );

  const m = mountId
    ? (mounts || []).find((mt: any) => String(mt.id) === mountId)
    : (mounts || [])[0];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading mount...</p>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !m) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ fontSize: '14px', color: '#EF4444' }}>{error || 'Mount not found'}</p>
      <Link href="/servers/mounts" style={{ fontSize: '13px', color: 'rgb(var(--primary))' }}>← Back to Mounts</Link>
    </div>
  );

  const name = m.name || m.label || `Mount #${m.id}`;
  const status = m.mounted || m.status === 'connected' ? 'connected' : 'disconnected';
  const statusColor = status === 'connected' ? '#10B981' : '#EF4444';
  const serverName = m.serverName || m.server?.name || '—';
  const host = m.host || m.server?.ip || '—';

  return (
    <div>
      <Link href="/servers/mounts" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to SSHFS Mounts
      </Link>

      {/* Hero */}
      <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(var(--primary),0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: `${statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive style={{ width: '24px', height: '24px', color: statusColor }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: `${statusColor}15`, color: statusColor, textTransform: 'capitalize' }}>{status}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Server style={{ width: '11px', height: '11px' }} />{serverName} ({host})</span>
            </div>
          </div>
          <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} /> Refresh
          </button>
        </div>
      </div>

      {/* Mount Config */}
      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Mount Configuration</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {[
            { label: 'Remote Path', value: m.remotePath || '—' },
            { label: 'Local Path', value: m.localPath || m.mountPoint || '—' },
            { label: 'Username', value: m.username || '—' },
            { label: 'Port', value: String(m.port || 22) },
            { label: 'Server', value: `${serverName} (${host})` },
            { label: 'Created', value: m.createdAt ? new Date(m.createdAt).toLocaleString() : '—' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid rgba(var(--border),0.08)' : 'none' }}>
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{item.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace", maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
