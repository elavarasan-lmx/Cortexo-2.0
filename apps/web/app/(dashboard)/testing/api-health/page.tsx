'use client';

import React, { useState } from 'react';
import { FlaskConical, RefreshCw, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface HealthResult {
  name: string;
  domain: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down' | 'checking' | 'unknown';
  latency?: number;
  lastChecked?: string;
}

export default function ApiHealthPage() {
  const [clients, setClients] = useState<HealthResult[]>([]);
  const [checking, setChecking] = useState(false);

  const checkAll = async () => {
    setChecking(true);
    // Try to load client list from provision history
    try {
      api.loadToken();
      const res = await api.getProvisionClients();
      const list = (res as any)?.clients || (res as any)?.data?.clients || [];
      if (list.length > 0) {
        const results: HealthResult[] = list.map((c: any) => ({
          name: c.clientName, domain: c.domain, endpoint: '/api/health',
          status: 'checking' as const,
        }));
        setClients(results);
        // Check each
        for (let i = 0; i < results.length; i++) {
          try {
            const start = Date.now();
            const protocol = results[i].domain.startsWith('http') ? '' : 'https://';
            await fetch(`${protocol}${results[i].domain}${results[i].endpoint}`, { mode: 'no-cors', signal: AbortSignal.timeout(8000) });
            results[i] = { ...results[i], status: 'healthy', latency: Date.now() - start, lastChecked: new Date().toISOString() };
          } catch {
            results[i] = { ...results[i], status: 'down', lastChecked: new Date().toISOString() };
          }
          setClients([...results]);
        }
      } else {
        setClients([{ name: 'No clients', domain: '—', endpoint: '—', status: 'unknown' }]);
      }
    } catch {
      setClients([{ name: 'API Offline', domain: '—', endpoint: '—', status: 'down' }]);
    }
    setChecking(false);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      healthy: { bg: 'rgba(16,185,129,0.1)', text: '#10B981', label: 'Healthy' },
      degraded: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', label: 'Degraded' },
      down: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', label: 'Down' },
      checking: { bg: 'rgba(129,140,248,0.1)', text: '#818CF8', label: 'Checking' },
      unknown: { bg: 'rgba(var(--border), 0.1)', text: 'rgb(var(--text-muted))', label: 'Unknown' },
    };
    const cfg = map[s] || map.unknown;
    return <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: cfg.bg, color: cfg.text }}>{cfg.label}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>API Health Monitor</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Check health endpoints across all provisioned clients</p>
        </div>
        <button onClick={checkAll} disabled={checking} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          {checking ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <RefreshCw style={{ width: '14px', height: '14px' }} />}
          {checking ? 'Checking...' : 'Check All Clients'}
        </button>
      </div>

      {clients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
          <FlaskConical style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>Click "Check All Clients" to run health checks across all provisioned domains</p>
        </div>
      ) : (
        <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
          {clients.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px', gap: '12px', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(var(--border), 0.3)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{c.name}</span>
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{c.domain}</span>
              {statusBadge(c.status)}
              <span style={{ fontSize: '12px', color: c.latency && c.latency < 300 ? '#10B981' : 'rgb(var(--text-muted))' }}>{c.latency ? `${c.latency}ms` : '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
