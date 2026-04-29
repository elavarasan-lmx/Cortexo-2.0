'use client';

import React, { useState } from 'react';
import { Activity, Play, Square, Loader2, BarChart3 } from 'lucide-react';

interface TestResult {
  url: string;
  method: string;
  concurrency: number;
  duration: number;
  totalRequests: number;
  successCount: number;
  failCount: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  rps: number;
  timestamp: string;
}

export default function LoadTestPage() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [concurrency, setConcurrency] = useState(10);
  const [duration, setDuration] = useState(5);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTest = async () => {
    if (!url) return;
    setRunning(true);
    const latencies: number[] = [];
    let successCount = 0;
    let failCount = 0;
    const endTime = Date.now() + duration * 1000;

    // Fire concurrent requests in batches until duration expires
    while (Date.now() < endTime) {
      const batch = Array.from({ length: concurrency }, async () => {
        const start = Date.now();
        try {
          await fetch(url, { method, mode: 'no-cors', signal: AbortSignal.timeout(10000) });
          latencies.push(Date.now() - start);
          successCount++;
        } catch {
          failCount++;
        }
      });
      await Promise.all(batch);
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const avg = sorted.length > 0 ? Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length) : 0;
    const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
    const p99 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0;
    const total = successCount + failCount;

    setResults(prev => [{
      url, method, concurrency, duration,
      totalRequests: total,
      successCount,
      failCount,
      avgLatency: avg,
      p95Latency: p95,
      p99Latency: p99,
      rps: Math.round(total / duration),
      timestamp: new Date().toISOString(),
    }, ...prev]);
    setRunning(false);
  };

  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--background), 0.5)', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Load Test</h1>
      <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginBottom: '24px' }}>Simulate concurrent HTTP requests to measure endpoint performance</p>

      <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 100px auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Target URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.vijaybullion.com/api/health" style={{ ...inputStyle, width: '100%', fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <div>
            <label style={labelStyle}>Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
              {['GET', 'POST', 'PUT', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Concurrency</label>
            <input type="number" value={concurrency} onChange={e => setConcurrency(+e.target.value)} min={1} max={500} style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Duration (s)</label>
            <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} min={1} max={60} style={{ ...inputStyle, width: '100%' }} />
          </div>
          <button onClick={running ? undefined : runTest} disabled={running || !url} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '10px', border: 'none', background: running ? '#EF4444' : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: running ? 'default' : 'pointer', opacity: !url ? 0.5 : 1 }}>
            {running ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Running...</> : <><Play style={{ width: '14px', height: '14px' }} /> Run</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.map((r, i) => (
        <div key={i} style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(var(--primary), 0.1)', color: 'rgb(var(--primary))' }}>{r.method}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{r.url}</span>
            </div>
            <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{new Date(r.timestamp).toLocaleTimeString()}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
            {[
              { label: 'Total', value: r.totalRequests.toLocaleString(), color: 'rgb(var(--text-primary))' },
              { label: 'Success', value: r.successCount.toLocaleString(), color: '#10B981' },
              { label: 'Failed', value: r.failCount.toString(), color: r.failCount > 0 ? '#EF4444' : '#10B981' },
              { label: 'Avg Latency', value: `${r.avgLatency}ms`, color: r.avgLatency < 100 ? '#10B981' : r.avgLatency < 300 ? '#F59E0B' : '#EF4444' },
              { label: 'P95', value: `${r.p95Latency}ms`, color: 'rgb(var(--text-secondary))' },
              { label: 'RPS', value: r.rps.toString(), color: 'rgb(var(--primary))' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(var(--background), 0.5)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', marginBottom: '2px' }}>{stat.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'rgb(var(--text-muted))' }}>
          <Activity style={{ width: '32px', height: '32px', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px' }}>Configure and run your first load test above</p>
        </div>
      )}
    </div>
  );
}
