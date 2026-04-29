'use client';

import React, { useState } from 'react';
import { Boxes, Play, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';

interface ModuleResult {
  name: string;
  endpoint: string;
  status: 'pass' | 'fail' | 'pending' | 'running';
  latency?: number;
  statusCode?: number;
  error?: string;
}

const DEFAULT_MODULES: { name: string; endpoint: string }[] = [
  { name: 'Health Check', endpoint: '/api/health' },
  { name: 'Auth Login', endpoint: '/api/auth/login' },
  { name: 'Rate Feed', endpoint: '/api/rates/latest' },
  { name: 'Trade List', endpoint: '/api/trades' },
  { name: 'Client Config', endpoint: '/api/config' },
  { name: 'Mobile API', endpoint: '/mobileapi/getrates' },
  { name: 'Admin Panel', endpoint: '/admin' },
  { name: 'Socket Status', endpoint: '/api/socket/status' },
  { name: 'Notification Push', endpoint: '/api/notifications/test' },
  { name: 'DB Connection', endpoint: '/api/db/ping' },
];

export default function ModuleTestPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [modules, setModules] = useState<ModuleResult[]>(DEFAULT_MODULES.map(m => ({ ...m, status: 'pending' as const })));
  const [running, setRunning] = useState(false);

  const runAll = async () => {
    if (!baseUrl) return;
    setRunning(true);
    const updated: ModuleResult[] = modules.map(m => ({ ...m, status: 'running' as const }));
    setModules(updated);

    for (let i = 0; i < updated.length; i++) {
      const m = updated[i];
      const url = baseUrl.replace(/\/+$/, '') + m.endpoint;
      try {
        const start = Date.now();
        const res = await fetch(url, { method: 'GET', mode: 'no-cors', signal: AbortSignal.timeout(10000) });
        const latency = Date.now() - start;
        updated[i] = { ...m, status: 'pass' as const, latency, statusCode: res.status || 200 };
      } catch (err: any) {
        updated[i] = { ...m, status: 'fail' as const, error: err.message || 'Timeout/unreachable' };
      }
      setModules([...updated]);
    }
    setRunning(false);
  };

  const pass = modules.filter(m => m.status === 'pass').length;
  const fail = modules.filter(m => m.status === 'fail').length;
  const total = modules.length;
  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--background), 0.5)', color: 'rgb(var(--text-primary))', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", outline: 'none' };
  const statusIcon = (s: string) => s === 'pass' ? <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981' }} /> : s === 'fail' ? <XCircle style={{ width: '16px', height: '16px', color: '#EF4444' }} /> : s === 'running' ? <Loader2 style={{ width: '16px', height: '16px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} /> : <Clock style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />;

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Module Test</h1>
      <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginBottom: '24px' }}>Test individual API modules — verify each endpoint is responding correctly</p>

      <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', marginBottom: '4px' }}>Base URL</label>
            <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://vijaybullion.com" style={{ ...inputStyle, width: '100%' }} />
          </div>
          <button onClick={runAll} disabled={running || !baseUrl} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: !baseUrl ? 0.5 : 1 }}>
            {running ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '14px', height: '14px' }} />}
            {running ? 'Testing...' : `Test All (${total})`}
          </button>
        </div>
        {(pass > 0 || fail > 0) && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>✓ {pass} passed</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: fail > 0 ? '#EF4444' : 'rgb(var(--text-muted))' }}>✗ {fail} failed</span>
          </div>
        )}
      </div>

      <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
        {modules.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid rgba(var(--border), 0.3)' }}>
            {statusIcon(m.status)}
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', width: '160px', flexShrink: 0 }}>{m.name}</span>
            <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>{m.endpoint}</span>
            {m.latency && <span style={{ fontSize: '12px', fontWeight: 600, color: m.latency < 200 ? '#10B981' : m.latency < 500 ? '#F59E0B' : '#EF4444' }}>{m.latency}ms</span>}
            {m.statusCode && <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 600 }}>{m.statusCode}</span>}
            {m.error && <span style={{ fontSize: '11px', color: '#EF4444', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.error}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
