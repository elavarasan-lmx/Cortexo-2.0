'use client';
import { use } from 'react';
import { Building2, ArrowLeft, Globe, Phone, Mail, Calendar, Activity, Server, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import Link from 'next/link';

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useAutoLoadToken();
  const { id } = use(params);

  const { data: configs, loading, error } = useApiData(
    () => api.getWinbullConfigs(),
    { default: [] as any[] }
  );

  const c = (configs || []).find((cfg: any) => String(cfg.id) === id || cfg.slug === id);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading client...</p>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !c) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ fontSize: '14px', color: '#EF4444' }}>{error || 'Client not found'}</p>
      <Link href="/sources/clients" style={{ fontSize: '13px', color: 'rgb(var(--primary))' }}>← Back to Clients</Link>
    </div>
  );

  const name = c.slug || c.name || 'Unknown';
  const domain = c.domain || c.slug || '—';
  const serverName = c.server_name || c.serverName || '—';
  const status = c.status || 'active';
  const version = c.version || '—';

  const card: React.CSSProperties = {
    borderRadius: '14px', border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
  };

  return (
    <div>
      <Link href="/sources/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Clients
      </Link>

      {/* Hero */}
      <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(var(--primary),0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#fff' }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: status === 'active' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>{status}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgb(var(--text-muted))' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe style={{ width: '12px', height: '12px' }} />{domain}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Server style={{ width: '12px', height: '12px' }} />{serverName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity style={{ width: '12px', height: '12px' }} />v{version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Config details */}
      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Configuration</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {Object.entries(c).filter(([k]) => !['id', 'createdAt', 'updatedAt'].includes(k)).map(([key, val]: [string, any], i: number) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(var(--border),0.08)' }}>
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace", maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
                {typeof val === 'object' ? JSON.stringify(val) : String(val || '—')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
