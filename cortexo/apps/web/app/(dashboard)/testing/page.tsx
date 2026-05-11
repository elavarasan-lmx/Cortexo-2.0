'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FlaskConical, Plus, Trash2, Play, Search, RefreshCw, Loader2,
  CheckCircle, XCircle, Clock, Globe, Server, ArrowRight,
  AlertTriangle, FolderSearch, Zap, ChevronRight, X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const CATEGORY_COLORS: Record<string, string> = {
  api: '#10B981', mobileapi: '#F59E0B', controller: '#818CF8', admin: '#EF4444',
};

export default function TestingHubPage() {
  useAutoLoadToken();

  const [targets, setTargets] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [runningTarget, setRunningTarget] = useState<number | null>(null);
  const [runningFull, setRunningFull] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [runResult, setRunResult] = useState<any>(null);

  // Add target modal
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newEnv, setNewEnv] = useState('staging');

  // Active tab
  const [tab, setTab] = useState<'targets' | 'cases' | 'runs'>('targets');
  const [caseFilter, setCaseFilter] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, c, r] = await Promise.all([
        api.getTestTargets(),
        api.getTestCases(),
        api.getTestRuns(),
      ]);
      setTargets((t as any)?.data || t || []);
      setCases((c as any)?.data || c || []);
      setRuns((r as any)?.data || r || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddTarget = async () => {
    if (!newName || !newUrl) return;
    try {
      await api.createTestTarget({ name: newName, baseUrl: newUrl, environment: newEnv });
      setNewName(''); setNewUrl(''); setNewEnv('staging'); setShowAdd(false);
      fetchAll();
    } catch { /* ignore */ }
  };

  const handleDeleteTarget = async (id: number) => {
    await api.deleteTestTarget(id);
    fetchAll();
  };

  const handleScan = async () => {
    setScanning(true); setScanResult(null);
    try {
      const res = await api.scanProject();
      setScanResult((res as any)?.data || res);
      fetchAll();
    } catch { /* ignore */ }
    setScanning(false);
  };

  const handleRun = async (targetId: number) => {
    setRunningTarget(targetId); setRunResult(null);
    try {
      const res = await api.runTests(targetId);
      setRunResult((res as any)?.data || res);
      fetchAll();
    } catch { /* ignore */ }
    setRunningTarget(null);
  };

  const handleRunFull = async (targetId: number) => {
    setRunningFull(targetId); setRunResult(null);
    try {
      const res = await api.runFullTests(targetId);
      setRunResult((res as any)?.data || res);
      fetchAll();
    } catch { /* ignore */ }
    setRunningFull(null);
  };

  const filteredCases = caseFilter ? cases.filter((c: any) => c.category === caseFilter) : cases;
  const categoryGroups = cases.reduce((acc: any, c: any) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', fontSize: '13px', borderRadius: '10px',
    border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
    color: 'rgb(var(--text-primary))', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const btnStyle = (color: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
    borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', color: '#fff', backgroundColor: color,
    transition: 'opacity 200ms',
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FlaskConical style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))' }} />
            Testing Hub
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            {targets.length} target{targets.length !== 1 ? 's' : ''} · {cases.length} test cases · {runs.length} runs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleScan} disabled={scanning} style={btnStyle('#8B5CF6')}>
            {scanning ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <FolderSearch style={{ width: '14px', height: '14px' }} />}
            {scanning ? 'Scanning...' : 'Scan Codebase'}
          </button>
          <button onClick={() => setShowAdd(true)} style={btnStyle('#10B981')}>
            <Plus style={{ width: '14px', height: '14px' }} /> Add Client
          </button>
        </div>
      </div>

      {/* Scan Result Toast */}
      {scanResult && (
        <div style={{
          padding: '14px 18px', borderRadius: '12px', marginBottom: '16px',
          border: '1px solid rgba(139,92,246,0.2)', backgroundColor: 'rgba(139,92,246,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle style={{ width: '16px', height: '16px', color: '#8B5CF6' }} />
            <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))' }}>
              Scan complete: <strong>{scanResult.discovered}</strong> endpoints found · <strong>{scanResult.inserted}</strong> new · {scanResult.skipped} existing
            </span>
          </div>
          <button onClick={() => setScanResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}

      {/* Run Result Toast */}
      {runResult && (
        <div style={{
          padding: '14px 18px', borderRadius: '12px', marginBottom: '16px',
          border: `1px solid ${runResult.failed > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          backgroundColor: runResult.failed > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {runResult.failed > 0
              ? <AlertTriangle style={{ width: '16px', height: '16px', color: '#EF4444' }} />
              : <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981' }} />
            }
            <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))' }}>
              <strong>{runResult.targetName}</strong>: {runResult.passed}/{runResult.total} passed · {runResult.failed} failed · {runResult.durationMs}ms
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href={`/testing/runs/${runResult.runId}`} style={{
              fontSize: '12px', fontWeight: 600, color: 'rgb(var(--primary))',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              View Details <ChevronRight style={{ width: '12px', height: '12px' }} />
            </Link>
            <button onClick={() => setRunResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
      )}

      {/* ── Testing Modes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <Link href="/testing/browser" style={{
          display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: '14px',
          border: '1px solid rgba(139,92,246,0.25)', backgroundColor: 'rgba(139,92,246,0.06)',
          textDecoration: 'none', transition: 'all 200ms',
        }}>
          <span style={{ fontSize: '28px' }}>🌐</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Browser Testing</div>
            <div style={{ fontSize: '11px', color: 'rgb(var(--text-secondary))' }}>Real Chrome automation — fills forms, submits, screenshots</div>
          </div>
          <ChevronRight style={{ width: '16px', height: '16px', color: '#8B5CF6' }} />
        </Link>
        <Link href="/testing/module" style={{
          display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: '14px',
          border: '1px solid rgba(16,185,129,0.25)', backgroundColor: 'rgba(16,185,129,0.06)',
          textDecoration: 'none', transition: 'all 200ms',
        }}>
          <span style={{ fontSize: '28px' }}>🧪</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Module Testing</div>
            <div style={{ fontSize: '11px', color: 'rgb(var(--text-secondary))' }}>Business flow test suites — Registration, Login, Trading</div>
          </div>
          <ChevronRight style={{ width: '16px', height: '16px', color: '#10B981' }} />
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid rgb(var(--border))', paddingBottom: '0' }}>
        {(['targets', 'cases', 'runs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: 600,
            border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
            color: tab === t ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
            borderBottom: tab === t ? '2px solid rgb(var(--primary))' : '2px solid transparent',
            transition: 'all 150ms', textTransform: 'capitalize',
          }}>
            {t === 'targets' ? `🎯 Targets (${targets.length})` :
             t === 'cases' ? `📋 Test Cases (${cases.length})` :
             `📊 Run History (${runs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <Loader2 style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* ──── TARGETS TAB ──── */}
          {tab === 'targets' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '14px' }}>
              {targets.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'rgb(var(--text-muted))' }}>
                  <Server style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
                  <p style={{ fontSize: '15px', fontWeight: 600 }}>No test targets configured</p>
                  <p style={{ fontSize: '13px' }}>Add a client URL to start testing</p>
                </div>
              ) : targets.map((t: any) => (
                <div key={t.id} style={{
                  padding: '20px', borderRadius: '14px', border: '1px solid rgb(var(--border))',
                  backgroundColor: 'rgb(var(--surface))', transition: 'border-color 200ms',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'rgba(var(--primary-rgb, 124,58,237), 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Globe style={{ width: '18px', height: '18px', color: 'rgb(var(--primary))' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{t.name}</h3>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
                          backgroundColor: t.environment === 'production' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: t.environment === 'production' ? '#EF4444' : '#F59E0B',
                          textTransform: 'uppercase',
                        }}>{t.environment}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTarget(t.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))',
                      padding: '4px', borderRadius: '6px',
                    }}>
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>

                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '0 0 14px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>
                    {t.baseUrl}
                  </p>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleRun(t.id)}
                      disabled={runningTarget === t.id || runningFull === t.id || cases.length === 0}
                      style={{
                        ...btnStyle('#7C3AED'), flex: 1, justifyContent: 'center',
                        opacity: (runningTarget === t.id || cases.length === 0) ? 0.6 : 1,
                        cursor: (runningTarget === t.id || cases.length === 0) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {runningTarget === t.id
                        ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> L1 Running...</>
                        : <><Play style={{ width: '14px', height: '14px' }} /> L1 Quick</>
                      }
                    </button>
                    <button
                      onClick={() => handleRunFull(t.id)}
                      disabled={runningFull === t.id || runningTarget === t.id || cases.length === 0}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
                        borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 600,
                        cursor: (runningFull === t.id || cases.length === 0) ? 'not-allowed' : 'pointer',
                        color: '#fff', flex: 1.5, justifyContent: 'center',
                        background: 'linear-gradient(135deg, #7C3AED, #EC4899, #F59E0B)',
                        opacity: (runningFull === t.id || cases.length === 0) ? 0.6 : 1,
                        transition: 'opacity 200ms',
                      }}
                    >
                      {runningFull === t.id
                        ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Full Suite Running...</>
                        : <><Zap style={{ width: '14px', height: '14px' }} /> Full Suite (L1+L2+L3)</>
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ──── CASES TAB ──── */}
          {tab === 'cases' && (
            <div>
              {/* Category chips */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setCaseFilter('')} style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  border: !caseFilter ? '1px solid rgb(var(--primary))' : '1px solid rgb(var(--border))',
                  backgroundColor: !caseFilter ? 'rgba(var(--primary-rgb, 124,58,237), 0.1)' : 'transparent',
                  color: !caseFilter ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                  cursor: 'pointer',
                }}>
                  All ({cases.length})
                </button>
                {Object.entries(categoryGroups).map(([cat, count]) => (
                  <button key={cat} onClick={() => setCaseFilter(cat)} style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    border: caseFilter === cat ? `1px solid ${CATEGORY_COLORS[cat]}` : '1px solid rgb(var(--border))',
                    backgroundColor: caseFilter === cat ? `${CATEGORY_COLORS[cat]}15` : 'transparent',
                    color: caseFilter === cat ? CATEGORY_COLORS[cat] : 'rgb(var(--text-muted))',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}>
                    {cat} ({count as number})
                  </button>
                ))}
              </div>

              {/* Case list */}
              {filteredCases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgb(var(--text-muted))' }}>
                  <FolderSearch style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
                  <p style={{ fontSize: '15px', fontWeight: 600 }}>No test cases yet</p>
                  <p style={{ fontSize: '13px' }}>Click "Scan Codebase" to auto-discover endpoints</p>
                </div>
              ) : (
                <div style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
                  {filteredCases.map((tc: any, i: number) => {
                    const catColor = CATEGORY_COLORS[tc.category] || '#94A3B8';
                    return (
                      <div key={tc.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                        borderBottom: i < filteredCases.length - 1 ? '1px solid rgb(var(--border))' : 'none',
                        fontSize: '13px',
                      }}>
                        <span style={{
                          fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: `${catColor}15`, color: catColor, textTransform: 'uppercase',
                          minWidth: '60px', textAlign: 'center',
                        }}>{tc.category}</span>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                          backgroundColor: tc.method === 'POST' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                          color: tc.method === 'POST' ? '#F59E0B' : '#3B82F6',
                        }}>{tc.method}</span>
                        <span style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgb(var(--text-primary))' }}>
                          {tc.endpoint}
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                          {tc.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ──── RUNS TAB ──── */}
          {tab === 'runs' && (
            <div>
              {runs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgb(var(--text-muted))' }}>
                  <Play style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
                  <p style={{ fontSize: '15px', fontWeight: 600 }}>No test runs yet</p>
                  <p style={{ fontSize: '13px' }}>Run tests on a target to see results</p>
                </div>
              ) : (
                <div style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
                  {runs.map((r: any, i: number) => {
                    const passRate = r.total > 0 ? Math.round((r.passed / r.total) * 100) : 0;
                    const isGood = r.failed === 0;
                    return (
                      <Link key={r.id} href={r.runType === 'full' ? `/testing/levels/${r.id}` : `/testing/runs/${r.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px',
                        borderBottom: i < runs.length - 1 ? '1px solid rgb(var(--border))' : 'none',
                        textDecoration: 'none', transition: 'background 150ms',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                          background: isGood ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isGood
                            ? <CheckCircle style={{ width: '18px', height: '18px', color: '#10B981' }} />
                            : <XCircle style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                          }
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {r.targetName || 'Unknown'}
                            {r.runType === 'full' && (
                              <span style={{
                                fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                                background: 'linear-gradient(135deg, #7C3AED, #EC4899, #F59E0B)',
                                color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px',
                              }}>L1+L2+L3</span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '2px' }}>
                            Run #{r.id} · {timeAgo(r.createdAt)}
                          </div>
                        </div>

                        {/* Results bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                            <span style={{ color: '#10B981' }}>✓ {r.passed}</span>
                            <span style={{ color: '#EF4444' }}>✗ {r.failed}</span>
                          </div>
                          <div style={{
                            width: '80px', height: '6px', borderRadius: '3px',
                            backgroundColor: 'rgb(var(--border))', overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${passRate}%`, height: '100%', borderRadius: '3px',
                              backgroundColor: isGood ? '#10B981' : (passRate > 50 ? '#F59E0B' : '#EF4444'),
                              transition: 'width 300ms',
                            }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', minWidth: '50px' }}>
                            {r.durationMs}ms
                          </span>
                          <ChevronRight style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ──── Add Target Modal ──── */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }} onClick={() => setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '440px', padding: '28px', borderRadius: '16px',
            backgroundColor: 'rgb(var(--card))', border: '1px solid rgb(var(--border))',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe style={{ width: '18px', height: '18px', color: 'rgb(var(--primary))' }} />
              Add Test Target
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', marginBottom: '4px', display: 'block' }}>Client Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. KVT Jewellers" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', marginBottom: '4px', display: 'block' }}>Base URL</label>
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://kvtjewellers.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', marginBottom: '4px', display: 'block' }}>Environment</label>
                <select value={newEnv} onChange={e => setNewEnv(e.target.value)} style={inputStyle}>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)} style={{
                padding: '10px 18px', borderRadius: '10px', border: '1px solid rgb(var(--border))',
                backgroundColor: 'transparent', fontSize: '13px', fontWeight: 600,
                color: 'rgb(var(--text-secondary))', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleAddTarget} style={btnStyle('#10B981')}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
