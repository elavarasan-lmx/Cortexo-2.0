'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, XCircle, Clock, ArrowLeft, Globe, AlertTriangle,
  Loader2, ChevronDown, Filter, Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

const CATEGORY_COLORS: Record<string, string> = {
  api: '#10B981', mobileapi: '#F59E0B', controller: '#818CF8', admin: '#EF4444',
};

export default function TestRunDetailPage() {
  const params = useParams();
  const runId = Number(params.id);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTestRun(runId);
      setData((res as any)?.data || res);
    } catch { /* ignore */ }
    setLoading(false);
  }, [runId]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <Loader2 style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!data?.run) {
    return <p style={{ color: 'rgb(var(--text-muted))', textAlign: 'center', padding: '60px' }}>Run not found</p>;
  }

  const { run, results } = data;
  const passRate = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0;

  let filtered = results || [];
  if (filterStatus) filtered = filtered.filter((r: any) => r.status === filterStatus);
  if (filterCategory) filtered = filtered.filter((r: any) => r.caseCategory === filterCategory);

  const categories = ([...new Set((results || []).map((r: any) => r.caseCategory as string))].filter(Boolean) as string[]).sort();
  const failedResults = (results || []).filter((r: any) => r.status === 'failed');
  const slowResults = (results || []).filter((r: any) => r.latencyMs > 2000);

  return (
    <div>
      {/* Back + Header */}
      <Link href="/testing" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Testing Hub
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} />
            {run.targetName || 'Test Run'} — Run #{run.id}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>
            {run.targetUrl} · {new Date(run.createdAt).toLocaleString()}
          </p>
        </div>
        <Link href={`/testing/bugs/${run.id}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          backgroundColor: '#EF4444', color: '#fff', textDecoration: 'none',
          transition: 'opacity 200ms', flexShrink: 0,
        }}>
          Find Bugs & Module Test
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>Total</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>{run.total}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', backgroundColor: 'rgba(16,185,129,0.04)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10B981', marginBottom: '4px' }}>Passed</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>{run.passed}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: `1px solid ${run.failed > 0 ? 'rgba(239,68,68,0.2)' : 'rgb(var(--border))'}`, backgroundColor: run.failed > 0 ? 'rgba(239,68,68,0.04)' : 'rgb(var(--surface))' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: run.failed > 0 ? '#EF4444' : 'rgb(var(--text-muted))', marginBottom: '4px' }}>Failed</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: run.failed > 0 ? '#EF4444' : 'rgb(var(--text-primary))' }}>{run.failed}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>Duration</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>{(run.durationMs / 1000).toFixed(1)}s</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>Pass Rate</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: passRate === 100 ? '#10B981' : (passRate > 70 ? '#F59E0B' : '#EF4444') }}>{passRate}%</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('')} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: !filterStatus ? '1px solid rgb(var(--primary))' : '1px solid rgb(var(--border))', backgroundColor: !filterStatus ? 'rgba(var(--primary-rgb, 124,58,237), 0.1)' : 'transparent', color: !filterStatus ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))', cursor: 'pointer' }}>
          All ({results?.length || 0})
        </button>
        <button onClick={() => setFilterStatus('failed')} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: filterStatus === 'failed' ? '1px solid #EF4444' : '1px solid rgb(var(--border))', backgroundColor: filterStatus === 'failed' ? 'rgba(239,68,68,0.1)' : 'transparent', color: filterStatus === 'failed' ? '#EF4444' : 'rgb(var(--text-muted))', cursor: 'pointer' }}>
          Failed ({failedResults.length})
        </button>
        <button onClick={() => setFilterStatus('passed')} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: filterStatus === 'passed' ? '1px solid #10B981' : '1px solid rgb(var(--border))', backgroundColor: filterStatus === 'passed' ? 'rgba(16,185,129,0.1)' : 'transparent', color: filterStatus === 'passed' ? '#10B981' : 'rgb(var(--text-muted))', cursor: 'pointer' }}>
          Passed ({run.passed})
        </button>
        <div style={{ width: '1px', backgroundColor: 'rgb(var(--border))', margin: '0 4px' }} />
        {categories.map((cat: string) => (
          <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)} style={{
            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
            border: filterCategory === cat ? `1px solid ${CATEGORY_COLORS[cat] || '#94A3B8'}` : '1px solid rgb(var(--border))',
            backgroundColor: filterCategory === cat ? `${CATEGORY_COLORS[cat] || '#94A3B8'}15` : 'transparent',
            color: filterCategory === cat ? (CATEGORY_COLORS[cat] || '#94A3B8') : 'rgb(var(--text-muted))',
            cursor: 'pointer', textTransform: 'capitalize',
          }}>{cat}</button>
        ))}
      </div>

      {/* Results List */}
      <div style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
        {filtered.map((r: any, i: number) => {
          const catColor = CATEGORY_COLORS[r.caseCategory] || '#94A3B8';
          const isFailed = r.status === 'failed';
          const isSlow = r.latencyMs > 2000;
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgb(var(--border))' : 'none',
              backgroundColor: isFailed ? 'rgba(239,68,68,0.03)' : 'transparent',
            }}>
              {/* Status icon */}
              {isFailed
                ? <XCircle style={{ width: '16px', height: '16px', color: '#EF4444', flexShrink: 0 }} />
                : <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981', flexShrink: 0 }} />
              }

              {/* Category badge */}
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                backgroundColor: `${catColor}15`, color: catColor, textTransform: 'uppercase',
                minWidth: '60px', textAlign: 'center', flexShrink: 0,
              }}>{r.caseCategory}</span>

              {/* Method badge */}
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                backgroundColor: r.caseMethod === 'POST' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                color: r.caseMethod === 'POST' ? '#F59E0B' : '#3B82F6',
                flexShrink: 0,
              }}>{r.caseMethod}</span>

              {/* Endpoint */}
              <span style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgb(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.caseEndpoint}
              </span>

              {/* Status code */}
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                backgroundColor: r.statusCode >= 500 ? 'rgba(239,68,68,0.12)' : (r.statusCode >= 400 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)'),
                color: r.statusCode >= 500 ? '#EF4444' : (r.statusCode >= 400 ? '#F59E0B' : '#10B981'),
                flexShrink: 0,
              }}>{r.statusCode || 'ERR'}</span>

              {/* Latency */}
              <span style={{
                fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
                color: isSlow ? '#F59E0B' : 'rgb(var(--text-muted))',
                minWidth: '60px', textAlign: 'right', flexShrink: 0,
              }}>
                {r.latencyMs}ms
              </span>

              {/* Flags */}
              {isSlow && <span aria-label="Slow (>2s)" title="Slow (>2s)" style={{ display:'flex', alignItems:'center', flexShrink:0 }}><AlertTriangle style={{ width: '12px', height: '12px', color: '#F59E0B' }} /></span>}

              {isFailed && r.error && (
                <span style={{ fontSize: '10px', color: '#EF4444', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.error}>
                  {r.error}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
