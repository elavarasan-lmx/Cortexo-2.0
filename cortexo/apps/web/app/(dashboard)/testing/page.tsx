'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FlaskConical, Plus, Trash2, Play, Search, RefreshCw, Loader2,
  CheckCircle, XCircle, Clock, Globe, Server, ArrowRight,
  AlertTriangle, FolderSearch, Zap, ChevronRight, X, Flame,
} from 'lucide-react';
import { api } from '@/lib/api';

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

  // inputStyle replaced by cx-search-input class
  // btnStyle replaced by inline bg-color only (cx-btn-primary sets the rest)

  return (
    <div>
      {/* Header */}
      <div className="cx-page-header cx-mb-24">
        <div>
          <h1 className="cx-flex cx-items-center cx-gap-10 cx-page-title">
            <FlaskConical style={{ width: '24px', height: '24px' }} className="cx-text-accent" />
            Testing Hub
          </h1>
          <p className="cx-page-subtitle">
            {targets.length} target{targets.length !== 1 ? 's' : ''} · {cases.length} test cases · {runs.length} runs
          </p>
        </div>
        <div className="cx-flex cx-gap-8">
          <button onClick={handleScan} disabled={scanning} className="cx-btn-primary" style={{ backgroundColor: '#8B5CF6' }}>
            {scanning ? <Loader2 className="cx-spinner" style={{ width: '14px', height: '14px' }} /> : <FolderSearch style={{ width: '14px', height: '14px' }} />}
            {scanning ? 'Scanning...' : 'Scan Codebase'}
          </button>
          <button onClick={() => setShowAdd(true)} className="cx-btn-primary" style={{ backgroundColor: '#10B981' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> Add Client
          </button>
        </div>
      </div>

      {/* Scan Result Toast */}
      {scanResult && (
        <div className="cx-flex-between cx-r-12" style={{ padding: '14px 18px', marginBottom: '16px', border: '1px solid rgba(139,92,246,0.2)', backgroundColor: 'rgba(139,92,246,0.06)' }}>
          <div className="cx-flex cx-items-center cx-gap-10">
            <CheckCircle style={{ width: '16px', height: '16px', color: '#8B5CF6' }} />
            <span className="cx-text-13 cx-text-primary">
              Scan complete: <strong>{scanResult.discovered}</strong> endpoints found · <strong>{scanResult.inserted}</strong> new · {scanResult.skipped} existing
            </span>
          </div>
          <button onClick={() => setScanResult(null)} className="cx-icon-btn cx-text-muted">
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}

      {/* Run Result Toast */}
      {runResult && (
        <div className="cx-flex-between cx-r-12" style={{ padding: '14px 18px', marginBottom: '16px', border: `1px solid ${runResult.failed > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, backgroundColor: runResult.failed > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)' }}>
          <div className="cx-flex cx-items-center cx-gap-10">
            {runResult.failed > 0
              ? <AlertTriangle style={{ width: '16px', height: '16px', color: '#EF4444' }} />
              : <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981' }} />
            }
            <span className="cx-text-13 cx-text-primary">
              <strong>{runResult.targetName}</strong>: {runResult.passed}/{runResult.total} passed · {runResult.failed} failed · {runResult.durationMs}ms
            </span>
          </div>
          <div className="cx-flex cx-gap-8 cx-items-center">
            <Link href={`/testing/runs/${runResult.runId}`} className="cx-flex cx-items-center cx-gap-4 cx-text-12 cx-fw-600 cx-text-accent" style={{ textDecoration: 'none' }}>
              View Details <ChevronRight style={{ width: '12px', height: '12px' }} />
            </Link>
            <button onClick={() => setRunResult(null)} className="cx-icon-btn cx-text-muted">
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
      )}

      {/* ── Testing Modes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <Link href="/testing/browser" className="cx-flex cx-items-center cx-gap-14" style={{
          padding: '16px 20px', borderRadius: '14px',
          border: '1px solid rgba(139,92,246,0.25)', backgroundColor: 'rgba(139,92,246,0.06)',
          textDecoration: 'none', transition: 'all 200ms',
        }}>
          <Globe style={{ width: '28px', height: '28px', color: '#8B5CF6' }} />
          <div style={{ flex: 1 }}>
            <div className="cx-fw-700 cx-text-primary" style={{ fontSize: '14px' }}>Browser Testing</div>
            <div className="cx-text-secondary" style={{ fontSize: '11px' }}>Real Chrome automation — fills forms, submits, screenshots</div>
          </div>
          <ChevronRight style={{ width: '16px', height: '16px', color: '#8B5CF6' }} />
        </Link>
        <Link href="/testing/module" className="cx-flex cx-items-center cx-gap-14" style={{
          padding: '16px 20px', borderRadius: '14px',
          border: '1px solid rgba(16,185,129,0.25)', backgroundColor: 'rgba(16,185,129,0.06)',
          textDecoration: 'none', transition: 'all 200ms',
        }}>
          <FlaskConical style={{ width: '28px', height: '28px', color: '#10B981' }} />
          <div style={{ flex: 1 }}>
            <div className="cx-fw-700 cx-text-primary" style={{ fontSize: '14px' }}>Module Testing</div>
            <div className="cx-text-secondary" style={{ fontSize: '11px' }}>Business flow test suites — Registration, Login, Trading</div>
          </div>
          <ChevronRight style={{ width: '16px', height: '16px', color: '#10B981' }} />
        </Link>
        <Link href="/testing/smoke" className="cx-flex cx-items-center cx-gap-14" style={{
          padding: '16px 20px', borderRadius: '14px',
          border: '1px solid rgba(249,115,22,0.25)', backgroundColor: 'rgba(249,115,22,0.06)',
          textDecoration: 'none', transition: 'all 200ms',
        }}>
          <Flame style={{ width: '28px', height: '28px', color: '#F97316' }} />
          <div style={{ flex: 1 }}>
            <div className="cx-fw-700 cx-text-primary" style={{ fontSize: '14px' }}>Smoke Testing</div>
            <div className="cx-text-secondary" style={{ fontSize: '11px' }}>Health probes, login flows, responsive checks & link scanning</div>
          </div>
          <ChevronRight style={{ width: '16px', height: '16px', color: '#F97316' }} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="cx-flex cx-gap-4" style={{ marginBottom: '20px', borderBottom: '1px solid rgb(var(--border))' }}>
        {(['targets', 'cases', 'runs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="cx-fw-600" style={{
            padding: '10px 20px', fontSize: '13px',
            border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
            color: tab === t ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
            borderBottom: tab === t ? '2px solid rgb(var(--primary))' : '2px solid transparent',
            transition: 'all 150ms', textTransform: 'capitalize',
          }}>
            {t === 'targets' ? `Targets (${targets.length})` :
             t === 'cases' ? `Test Cases (${cases.length})` :
             `Run History (${runs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cx-loading" style={{ height: '200px' }}>
          <Loader2 className="cx-spinner" style={{ width: '28px', height: '28px' }} />
        </div>
      ) : (
        <>
          {/* ──── TARGETS TAB ──── */}
          {tab === 'targets' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '14px' }}>
              {targets.length === 0 ? (
                <div className="cx-empty cx-text-muted" style={{ gridColumn: '1/-1', padding: '60px 20px' }}>
                  <Server style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
                  <p className="cx-fw-600" style={{ fontSize: '15px' }}>No test targets configured</p>
                  <p style={{ fontSize: '13px' }}>Add a client URL to start testing</p>
                </div>
              ) : targets.map((t: any) => (
                <div key={t.id} className="cx-card cx-border" style={{ display: 'flex', flexDirection: 'column', padding: '20px', transition: 'border-color 200ms' }}>
                  <div className="cx-flex-between" style={{ marginBottom: '10px' }}>
                    <div className="cx-flex cx-items-center cx-gap-10">
                      <div className="cx-flex-center cx-r-8" style={{ width: '36px', height: '36px', background: 'rgba(var(--primary-rgb, 124,58,237), 0.1)' }}>
                        <Globe style={{ width: '18px', height: '18px' }} className="cx-text-accent" />
                      </div>
                      <div>
                        <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '15px', margin: 0 }}>{t.name}</h3>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
                          backgroundColor: t.environment === 'production' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: t.environment === 'production' ? '#EF4444' : '#F59E0B',
                          textTransform: 'uppercase' as const,
                        }}>{t.environment}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTarget(t.id)} className="cx-icon-btn cx-text-muted cx-r-6" style={{ padding: '4px' }}>
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>

                  <p className="cx-text-muted" style={{ fontSize: '12px', margin: '0 0 14px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all', flex: 1 }}>
                    {t.baseUrl}
                  </p>

                  <div className="cx-flex cx-gap-8" style={{ marginTop: 'auto' }}>
                    <button
                      onClick={() => handleRun(t.id)}
                      disabled={runningTarget === t.id || runningFull === t.id || cases.length === 0}
                      className="cx-btn-primary"
                      style={{ backgroundColor: '#7C3AED', flex: 1, justifyContent: 'center', opacity: (runningTarget === t.id || cases.length === 0) ? 0.6 : 1, cursor: (runningTarget === t.id || cases.length === 0) ? 'not-allowed' : 'pointer' }}
                    >
                      {runningTarget === t.id
                        ? <><Loader2 className="cx-spinner" style={{ width: '14px', height: '14px' }} /> L1 Running...</>
                        : <><Play style={{ width: '14px', height: '14px' }} /> L1 Quick</>
                      }
                    </button>
                    <button
                      onClick={() => handleRunFull(t.id)}
                      disabled={runningFull === t.id || runningTarget === t.id || cases.length === 0}
                      className="cx-btn-primary"
                      style={{ flex: 1.5, justifyContent: 'center', background: 'linear-gradient(135deg, #7C3AED, #EC4899, #F59E0B)', opacity: (runningFull === t.id || cases.length === 0) ? 0.6 : 1, cursor: (runningFull === t.id || cases.length === 0) ? 'not-allowed' : 'pointer' }}
                    >
                      {runningFull === t.id
                        ? <><Loader2 className="cx-spinner" style={{ width: '14px', height: '14px' }} /> Full Suite Running...</>
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
                <div className="cx-empty cx-text-muted" style={{ padding: '60px 20px' }}>
                  <FolderSearch style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
                  <p className="cx-fw-600" style={{ fontSize: '15px' }}>No test cases yet</p>
                  <p style={{ fontSize: '13px' }}>Click "Scan Codebase" to auto-discover endpoints</p>
                </div>
              ) : (
                <div className="cx-table-wrap">
                  {filteredCases.map((tc: any, i: number) => {
                    const catColor = CATEGORY_COLORS[tc.category] || '#94A3B8';
                    return (
                      <div key={tc.id} className="cx-flex cx-items-center cx-gap-12" style={{
                        padding: '10px 16px',
                        borderBottom: i < filteredCases.length - 1 ? '1px solid rgb(var(--border))' : 'none',
                        fontSize: '13px',
                      }}>
                        <span className="cx-fw-700" style={{
                          fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: `${catColor}15`, color: catColor, textTransform: 'uppercase',
                          minWidth: '60px', textAlign: 'center',
                        }}>{tc.category}</span>
                        <span className="cx-fw-700" style={{
                          fontSize: '10px', padding: '1px 5px', borderRadius: '3px',
                          backgroundColor: tc.method === 'POST' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                          color: tc.method === 'POST' ? '#F59E0B' : '#3B82F6',
                        }}>{tc.method}</span>
                        <span className="cx-mono cx-text-primary" style={{ flex: 1, fontSize: '12px' }}>
                          {tc.endpoint}
                        </span>
                        <span className="cx-text-muted" style={{ fontSize: '11px' }}>{tc.priority}</span>
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
                <div className="cx-empty cx-text-muted" style={{ padding: '60px 20px' }}>
                  <Play style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
                  <p className="cx-fw-600" style={{ fontSize: '15px' }}>No test runs yet</p>
                  <p style={{ fontSize: '13px' }}>Run tests on a target to see results</p>
                </div>
              ) : (
                <div className="cx-table-wrap">
                  {runs.map((r: any, i: number) => {
                    const passRate = r.total > 0 ? Math.round((r.passed / r.total) * 100) : 0;
                    const isGood = r.failed === 0;
                    return (
                      <Link key={r.id} href={r.runType === 'full' ? `/testing/levels/${r.id}` : `/testing/runs/${r.id}`}
                        className="cx-flex cx-items-center cx-gap-16"
                        style={{
                          padding: '14px 18px',
                          borderBottom: i < runs.length - 1 ? '1px solid rgb(var(--border))' : 'none',
                          textDecoration: 'none', transition: 'background 150ms',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div className="cx-flex-center" style={{
                          width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                          background: isGood ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        }}>
                          {isGood
                            ? <CheckCircle style={{ width: '18px', height: '18px', color: '#10B981' }} />
                            : <XCircle style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                          }
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="cx-flex cx-items-center cx-gap-8 cx-fw-600 cx-text-primary" style={{ fontSize: '14px' }}>
                            {r.targetName || 'Unknown'}
                            {r.runType === 'full' && (
                              <span className="cx-fw-700" style={{
                                fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
                                background: 'linear-gradient(135deg, #7C3AED, #EC4899, #F59E0B)',
                                color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px',
                              }}>L1+L2+L3</span>
                            )}
                          </div>
                          <div className="cx-text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                            Run #{r.id} · {timeAgo(r.createdAt)}
                          </div>
                        </div>

                        {/* Results bar */}
                        <div className="cx-flex cx-items-center cx-gap-12">
                          <div className="cx-flex cx-gap-8 cx-fw-600" style={{ fontSize: '12px' }}>
                            <span style={{ color: '#10B981' }}>{r.passed} passed</span>
                            <span style={{ color: '#EF4444' }}>{r.failed} failed</span>
                          </div>
                          <div style={{ width: '80px', height: '6px', borderRadius: '3px', backgroundColor: 'rgb(var(--border))', overflow: 'hidden' }}>
                            <div style={{
                              width: `${passRate}%`, height: '100%', borderRadius: '3px',
                              backgroundColor: isGood ? '#10B981' : (passRate > 50 ? '#F59E0B' : '#EF4444'),
                              transition: 'width 300ms',
                            }} />
                          </div>
                          <span className="cx-text-muted" style={{ fontSize: '11px', minWidth: '50px' }}>{r.durationMs}ms</span>
                          <ChevronRight className="cx-text-muted" style={{ width: '14px', height: '14px' }} />
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
        <div className="cx-modal-overlay" onClick={() => setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()} className="cx-modal cx-r-16 cx-border" style={{ maxWidth: '440px', padding: '28px' }}>
            <h2 className="cx-flex cx-items-center cx-gap-8 cx-fw-700 cx-text-primary" style={{ fontSize: '18px', margin: '0 0 20px' }}>
              <Globe style={{ width: '18px', height: '18px' }} className="cx-text-accent" />
              Add Test Target
            </h2>

            <div className="cx-flex-col cx-gap-12">
              <div>
                <label className="cx-label" style={{ marginBottom: '4px', display: 'block' }}>Client Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. KVT Jewellers" className="cx-input" />
              </div>
              <div>
                <label className="cx-label" style={{ marginBottom: '4px', display: 'block' }}>Base URL</label>
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://kvtjewellers.com" className="cx-input" />
              </div>
              <div>
                <label className="cx-label" style={{ marginBottom: '4px', display: 'block' }}>Environment</label>
                <select value={newEnv} onChange={e => setNewEnv(e.target.value)} className="cx-input">
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>

            <div className="cx-flex cx-gap-10" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)} className="cx-btn-secondary" style={{ padding: '10px 18px' }}>Cancel</button>
              <button onClick={handleAddTarget} className="cx-btn-primary" style={{ backgroundColor: '#10B981' }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
