'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Play, CheckCircle, XCircle, Loader2, Camera, Eye,
  ChevronDown, ChevronRight, Users, ShieldAlert, Monitor,
  Bug, ExternalLink, CheckCheck, Settings2, RotateCcw,
  UserCheck, KeyRound, BarChart3, Wallet, Package, type LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  UserCheck, KeyRound, BarChart3, Wallet, Package, Monitor,
};

function FlowIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] || Package;
  return <Icon style={{ width: `${size}px`, height: `${size}px`, color: 'rgb(var(--primary))' }} />;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface FlowField { key: string; label: string; type: string; placeholder: string; }
interface FlowInfo { id: string; name: string; icon: string; description: string; stepCount: number; fields?: FlowField[]; }
interface Target { id: number; name: string; baseUrl: string; }

interface StepResult {
  step: number; name: string; status: 'passed' | 'failed' | 'skipped';
  duration: number; screenshot?: string; error?: string;
  details?: string; evidence?: Record<string, any>;
}

interface BrowserTestResult {
  module: string; baseUrl: string; runId?: number;
  total: number; passed: number; failed: number;
  duration: number; steps: StepResult[]; startedAt: string;
}


export default function BrowserTestPage() {
  const [flows, setFlows] = useState<FlowInfo[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number>(0);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<BrowserTestResult | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [multiMode, setMultiMode] = useState(false);
  const [multiResults, setMultiResults] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ created: number; updated: number; message: string; projectName?: string } | null>(null);
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [showDataForm, setShowDataForm] = useState<string | null>(null); // flowId or null

  const token = typeof window !== 'undefined' ? localStorage.getItem('cortexo_token') || '' : '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    try {
      const [fRes, tRes] = await Promise.all([
        fetch(`${API}/browser-tests/flows`, { headers }),
        fetch(`${API}/testing/targets`, { headers }),
      ]);
      const fJson = await fRes.json();
      const tJson = await tRes.json();
      setFlows(fJson.data || []);
      const tgts = Array.isArray(tJson) ? tJson : tJson.data || [];
      setTargets(tgts);
      if (tgts.length > 0 && !selectedTarget) setSelectedTarget(tgts[0].id);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runSingle = async (flowId: string) => {
    if (!selectedTarget) return;
    setRunning(flowId); setResult(null); setMultiResults(null); setExportResult(null);
    // Filter out empty values from customData
    const filtered = Object.fromEntries(Object.entries(customData).filter(([, v]) => v.trim() !== ''));
    try {
      const res = await fetch(`${API}/browser-tests/run`, {
        method: 'POST', headers,
        body: JSON.stringify({ flowId, targetId: selectedTarget, customData: Object.keys(filtered).length > 0 ? filtered : undefined }),
      });
      const json = await res.json();
      if (json.data) setResult(json.data);
    } catch (err) { console.error(err); }
    setRunning(null);
  };

  const runAllClients = async (flowId: string) => {
    setRunning(flowId); setResult(null); setMultiResults(null); setExportResult(null);
    const filtered = Object.fromEntries(Object.entries(customData).filter(([, v]) => v.trim() !== ''));
    try {
      const res = await fetch(`${API}/browser-tests/run-multi`, {
        method: 'POST', headers,
        body: JSON.stringify({ flowId, targetIds: [], customData: Object.keys(filtered).length > 0 ? filtered : undefined }),
      });
      const json = await res.json();
      if (json.data) setMultiResults(json.data);
    } catch (err) { console.error(err); }
    setRunning(null);
  };

  const toggleStep = (i: number) => setExpandedSteps(prev => ({ ...prev, [i]: !prev[i] }));
  const screenshotUrl = (f: string) => `${API}/browser-tests/screenshot/${f}`;

  const exportBugs = async () => {
    if (!result || result.failed === 0) return;
    setExporting(true); setExportResult(null);
    try {
      const res = await fetch(`${API}/browser-tests/export-bugs`, {
        method: 'POST', headers,
        body: JSON.stringify({ runId: result.runId, result }),
      });
      const json = await res.json();
      if (json.success) {
        setExportResult({ created: json.exported.created, updated: json.exported.updated, message: json.message, projectName: json.project?.name });
      } else {
        setExportResult({ created: 0, updated: 0, message: json.error || 'Export failed' });
      }
    } catch (err) {
      setExportResult({ created: 0, updated: 0, message: 'Network error during export' });
    }
    setExporting(false);
  };

  const passRate = result ? Math.round((result.passed / result.total) * 100) : 0;

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div className="cx-mb-24">
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Monitor style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} /> Browser Testing
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
          Real browser automation — opens Chrome, fills forms, submits, takes screenshots
        </p>
      </div>

      {/* Controls */}
      <div className="cx-card cx-border" style={{ marginBottom: "20px", padding: "16px 20px" }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TARGET</label>
          <select value={selectedTarget} onChange={e => setSelectedTarget(Number(e.target.value))} style={{
            padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))',
            backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))',
            fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", outline: 'none', flex: 1, minWidth: '200px',
          }}>
            {targets.map(t => <option key={t.id} value={t.id}>{t.name} — {t.baseUrl}</option>)}
          </select>
          <button onClick={() => setMultiMode(!multiMode)} style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            border: multiMode ? 'none' : '1px solid rgb(var(--border))',
            backgroundColor: multiMode ? '#8B5CF6' : 'transparent',
            color: multiMode ? '#fff' : 'rgb(var(--text-secondary))',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Users style={{ width: '13px', height: '13px' }} />
            {multiMode ? 'All Clients Mode' : 'Single Client'}
          </button>
        </div>
      </div>

      {/* Flow Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {flows.map(f => {
          const isRunning = running === f.id;
          const isDataOpen = showDataForm === f.id;
          const hasFields = f.fields && f.fields.length > 0;
          const hasCustomValues = hasFields && f.fields!.some(fld => customData[fld.key]?.trim());
          return (
            <div key={f.id} className="cx-card cx-border" style={{
              display: 'flex', flexDirection: 'column',
              opacity: selectedTarget ? 1 : 0.5,
              borderColor: isRunning ? 'rgb(var(--primary))' : isDataOpen ? '#8B5CF6' : undefined,
              boxShadow: isRunning ? '0 0 0 2px rgba(var(--primary), 0.15)' : isDataOpen ? '0 0 0 2px rgba(139,92,246,0.15)' : undefined,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ marginBottom: '6px' }}><FlowIcon name={f.icon} size={22} /></div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{f.name}</h3>
                </div>
                <div className="cx-flex cx-gap-6">
                  {hasFields && (
                    <button
                      onClick={() => setShowDataForm(isDataOpen ? null : f.id)}
                      title="Custom test data"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '34px', height: '34px', borderRadius: '10px', border: '1px solid',
                        borderColor: isDataOpen ? '#8B5CF6' : hasCustomValues ? '#F59E0B' : 'rgb(var(--border))',
                        backgroundColor: isDataOpen ? 'rgba(139,92,246,0.1)' : hasCustomValues ? 'rgba(245,158,11,0.08)' : 'transparent',
                        color: isDataOpen ? '#8B5CF6' : hasCustomValues ? '#F59E0B' : 'rgb(var(--text-muted))',
                        cursor: 'pointer', transition: 'all 200ms',
                      }}
                    >
                      <Settings2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                  <button
                    onClick={() => multiMode ? runAllClients(f.id) : runSingle(f.id)}
                    disabled={isRunning || (!multiMode && !selectedTarget)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '10px', border: 'none',
                      background: isRunning ? 'rgb(var(--surface-hover))'
                        : multiMode ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                          : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                      color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                    }}>
                    {isRunning
                      ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                      : <Play style={{ width: '13px', height: '13px' }} />}
                    {isRunning ? 'Running...' : multiMode ? 'Run All Clients' : 'Run Test'}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '0 0 10px', lineHeight: '1.5', flex: 1 }}>{f.description}</p>
              <div className="cx-flex cx-gap-10" style={{ marginTop: 'auto' }}>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{f.stepCount} steps</span>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>Real Browser</span>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>Screenshots</span>
                {hasCustomValues && <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>Custom Data</span>}
              </div>

              {/* Custom Data Form — Collapsible */}
              {isDataOpen && hasFields && (
                <div style={{
                  marginTop: '14px', paddingTop: '14px',
                  borderTop: '1px solid rgb(var(--border))',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Custom Test Data
                    </span>
                    <button
                      onClick={() => {
                        const cleared = { ...customData };
                        f.fields!.forEach(fld => { delete cleared[fld.key]; });
                        setCustomData(cleared);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px',
                        border: '1px solid rgb(var(--border))', backgroundColor: 'transparent',
                        color: 'rgb(var(--text-muted))', fontSize: '10px', cursor: 'pointer',
                      }}
                    >
                      <RotateCcw style={{ width: '10px', height: '10px' }} /> Reset
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                    {f.fields!.map(field => (
                      <div key={field.key}>
                        <label style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', display: 'block', marginBottom: '4px' }}>
                          {field.label}
                        </label>
                        <input
                          type={field.type === 'password' ? 'text' : field.type}
                          value={customData[field.key] || ''}
                          onChange={e => setCustomData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          style={{
                            width: '100%', padding: '7px 10px', borderRadius: '8px', fontSize: '12px',
                            border: '1px solid', boxSizing: 'border-box',
                            borderColor: customData[field.key]?.trim() ? '#8B5CF6' : 'rgb(var(--border))',
                            backgroundColor: customData[field.key]?.trim() ? 'rgba(139,92,246,0.04)' : 'rgb(var(--surface-hover))',
                            color: 'rgb(var(--text-primary))',
                            fontFamily: "'JetBrains Mono', monospace",
                            outline: 'none', transition: 'all 150ms',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: '8px 0 0', lineHeight: '1.5' }}>
                    Leave fields empty to use auto-generated defaults. Only filled values override the test data.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Single Client Results */}
      {result && (
        <div className="cx-card cx-border" style={{ marginBottom: "24px", borderColor: result.failed > 0 ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
                Browser Test Results
              </h2>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                {result.baseUrl} • {(result.duration / 1000).toFixed(1)}s • {new Date(result.startedAt).toLocaleTimeString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: passRate >= 80 ? '#10B981' : passRate >= 50 ? '#F59E0B' : '#EF4444' }}>{passRate}%</div>
                <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>PASS RATE</div>
              </div>
              <div style={{ width: '1px', height: '40px', backgroundColor: 'rgb(var(--border))' }} />
              <div className="cx-flex cx-gap-12">
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>{result.passed}</div><div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>PASSED</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: 700, color: result.failed > 0 ? '#EF4444' : 'rgb(var(--text-muted))' }}>{result.failed}</div><div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>FAILED</div></div>
              </div>
              {result.failed > 0 && (
                <div style={{ width: '1px', height: '40px', backgroundColor: 'rgb(var(--border))' }} />
              )}
              {result.failed > 0 && (
                <button
                  onClick={exportBugs}
                  disabled={exporting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none',
                    background: exporting ? 'rgb(var(--surface-hover))' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                    color: '#fff', fontSize: '12px', fontWeight: 700, cursor: exporting ? 'wait' : 'pointer',
                    boxShadow: exporting ? 'none' : '0 4px 12px rgba(239,68,68,0.3)',
                    transition: 'all 200ms',
                  }}
                >
                  {exporting
                    ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                    : <Bug style={{ width: '14px', height: '14px' }} />}
                  {exporting ? 'Exporting...' : `Export ${result.failed} Bug${result.failed > 1 ? 's' : ''} to Tracker`}
                </button>
              )}
            </div>
          </div>

          {/* Export Result Banner */}
          {exportResult && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
              backgroundColor: exportResult.created > 0 || exportResult.updated > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${exportResult.created > 0 || exportResult.updated > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {exportResult.created > 0 || exportResult.updated > 0
                ? <CheckCheck style={{ width: '16px', height: '16px', color: '#10B981', flexShrink: 0 }} />
                : <XCircle style={{ width: '16px', height: '16px', color: '#EF4444', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{exportResult.message}</div>
                {exportResult.projectName && (
                  <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '2px' }}>
                    Project: {exportResult.projectName}
                  </div>
                )}
              </div>
              {(exportResult.created > 0 || exportResult.updated > 0) && (
                <a href="/bug-tracker" style={{
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px',
                  fontSize: '11px', fontWeight: 600, textDecoration: 'none',
                  backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981',
                }}>
                  <ExternalLink style={{ width: '11px', height: '11px' }} /> View in Bug Tracker
                </a>
              )}
            </div>
          )}

          {/* Steps */}
          <div className="cx-flex-col" style={{ gap: "6px" }}>
            {result.steps.map((s, i) => {
              const isExpanded = expandedSteps[i];
              return (
                <div key={i} style={{
                  borderRadius: '10px', border: '1px solid',
                  borderColor: s.status === 'passed' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.2)',
                  backgroundColor: s.status === 'passed' ? 'rgba(16,185,129,0.02)' : 'rgba(239,68,68,0.03)',
                  overflow: 'hidden',
                }}>
                  <button onClick={() => toggleStep(i)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '10px 14px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                    color: 'rgb(var(--text-primary))',
                  }}>
                    {isExpanded ? <ChevronDown style={{ width: '13px', height: '13px', color: 'rgb(var(--text-muted))' }} /> : <ChevronRight style={{ width: '13px', height: '13px', color: 'rgb(var(--text-muted))' }} />}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', width: '28px' }}>#{s.step}</span>
                    {s.status === 'passed'
                      ? <CheckCircle style={{ width: '14px', height: '14px', color: '#10B981', flexShrink: 0 }} />
                      : <XCircle style={{ width: '14px', height: '14px', color: '#EF4444', flexShrink: 0 }} />}
                    <span style={{ fontSize: '13px', fontWeight: 600, flex: 1, textAlign: 'left' }}>{s.name}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: s.duration < 500 ? '#10B981' : s.duration < 2000 ? '#F59E0B' : '#EF4444' }}>{s.duration}ms</span>
                    {s.screenshot && <Camera style={{ width: '13px', height: '13px', color: 'rgb(var(--text-muted))' }} />}
                  </button>
                  {isExpanded && (
                    <div style={{ padding: '0 14px 14px 52px', fontSize: '12px' }}>
                      {s.details && <p style={{ color: 'rgb(var(--text-secondary))', margin: '0 0 8px' }}>{s.details}</p>}
                      {s.error && <p style={{ color: '#EF4444', margin: '0 0 8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>{s.error}</p>}
                      {s.evidence && (
                        <details style={{ marginBottom: '8px' }}>
                          <summary style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', cursor: 'pointer' }}>Evidence Data</summary>
                          <pre style={{ fontSize: '10px', color: 'rgb(var(--text-secondary))', backgroundColor: 'rgb(var(--surface-hover))', padding: '8px', borderRadius: '8px', overflow: 'auto', maxHeight: '200px', marginTop: '6px' }}>
                            {JSON.stringify(s.evidence, null, 2)}
                          </pre>
                        </details>
                      )}
                      {s.screenshot && (
                        <div style={{ marginTop: '8px' }}>
                          <button onClick={() => setPreviewImg(screenshotUrl(s.screenshot!))} style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px',
                            border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
                            color: 'rgb(var(--text-secondary))', fontSize: '11px', cursor: 'pointer',
                          }}>
                            <Eye style={{ width: '12px', height: '12px' }} /> View Screenshot
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Multi-Client Results */}
      {multiResults && (
        <div className="cx-card cx-border" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
            Multi-Client Results — {multiResults.flow}
          </h2>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '0 0 16px' }}>
            {multiResults.totalClients} clients tested • {multiResults.allPassed} passed • {multiResults.someFailed} with failures
          </p>
          <div className="cx-flex-col" style={{ gap: "8px" }}>
            {multiResults.results.map((r: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
                border: '1px solid', borderColor: r.failed > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)',
                backgroundColor: r.failed > 0 ? 'rgba(239,68,68,0.03)' : 'rgba(16,185,129,0.02)',
              }}>
                {r.failed > 0 ? <XCircle style={{ width: '16px', height: '16px', color: '#EF4444' }} /> : <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{r.target}</div>
                  <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{r.baseUrl}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: r.failed > 0 ? '#EF4444' : '#10B981' }}>
                  {r.passed}/{r.total}
                </span>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  {r.duration ? `${(r.duration / 1000).toFixed(1)}s` : r.error ? 'Error' : '—'}
                </span>
                {r.steps && (
                  <button onClick={() => { setResult(r); setMultiResults(null); }} style={{
                    padding: '4px 10px', borderRadius: '6px', border: '1px solid rgb(var(--border))',
                    backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '10px', cursor: 'pointer',
                  }}>Details</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewImg && (
        <div onClick={() => setPreviewImg(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: '40px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
            <img src={previewImg} alt="Screenshot" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
            <button onClick={() => setPreviewImg(null)} style={{
              position: 'absolute', top: '-12px', right: '-12px', width: '32px', height: '32px', borderRadius: '50%',
              border: 'none', backgroundColor: '#EF4444', color: '#fff', fontWeight: 700, fontSize: '16px', cursor: 'pointer',
            }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
