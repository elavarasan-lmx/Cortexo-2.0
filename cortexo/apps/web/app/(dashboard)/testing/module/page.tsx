'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Boxes, Play, CheckCircle, XCircle, Loader2, Clock, ShieldAlert, AlertTriangle, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface ModuleInfo {
  id: string; name: string; icon: string; description: string;
  category: string; stepCount: number; criticalCount: number; highCount: number;
}

interface StepResult {
  step: number; name: string; description: string;
  status: 'passed' | 'failed'; statusCode: number | null;
  latencyMs: number; error: string | null; severity: string;
  securityIssue: string | null; schemaValid: boolean | null;
  schemaErrors?: string[];
}

interface ModuleRunResult {
  runId: number; module: string; moduleName: string; icon: string;
  durationMs: number; total: number; passed: number; failed: number;
  passRate: number; criticalFails: number;
  securityIssues: { step: string; issue: string; error: string }[];
  steps: StepResult[];
}

interface Target { id: number; name: string; baseUrl: string; }

const card: React.CSSProperties = { borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', padding: '20px', transition: 'all 200ms' };
const sevBadge = (s: string): React.CSSProperties => ({
  padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
  color: s === 'critical' ? '#EF4444' : s === 'high' ? '#F59E0B' : s === 'medium' ? '#3B82F6' : '#6B7280',
  backgroundColor: s === 'critical' ? '#EF444412' : s === 'high' ? '#F59E0B12' : s === 'medium' ? '#3B82F612' : '#6B728012',
  border: `1px solid ${s === 'critical' ? '#EF444425' : s === 'high' ? '#F59E0B25' : s === 'medium' ? '#3B82F625' : '#6B728025'}`,
});

export default function ModuleTestPage() {
  useAutoLoadToken();
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number>(0);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<ModuleRunResult | null>(null);
  const [history, setHistory] = useState<ModuleRunResult[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const token = typeof window !== 'undefined' ? localStorage.getItem('cortexo_token') || '' : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } as Record<string, string>;

  const load = useCallback(async () => {
    try {
      const [modRes, tgtRes] = await Promise.all([
        fetch(`${API}/testing/module-definitions`, { headers }),
        fetch(`${API}/testing/targets`, { headers }),
      ]);
      const modJson = await modRes.json();
      const tgtJson = await tgtRes.json();
      setModules(modJson.data || []);
      const tgts = Array.isArray(tgtJson) ? tgtJson : tgtJson.data || [];
      setTargets(tgts);
      if (tgts.length > 0 && !selectedTarget) setSelectedTarget(tgts[0].id);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runModule = async (moduleId: string) => {
    if (!selectedTarget) return;
    setRunning(moduleId);
    setResult(null);
    try {
      const res = await fetch(`${API}/testing/run-module`, {
        method: 'POST', headers,
        body: JSON.stringify({ targetId: selectedTarget, moduleId }),
      });
      const json = await res.json();
      if (json.data) {
        setResult(json.data);
        setHistory(prev => [json.data, ...prev].slice(0, 10));
      }
    } catch (err) {
      console.error('Module test failed:', err);
    }
    setRunning(null);
  };

  const toggleStep = (i: number) => setExpandedSteps(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Boxes style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} /> Module Testing
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
          Test specific business modules — Customer Registration, Login, Trading, and more
        </p>
      </div>

      {/* Target Selector */}
      <div style={{ ...card, marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TARGET</label>
          <select value={selectedTarget} onChange={e => setSelectedTarget(Number(e.target.value))} style={{
            padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))',
            backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))',
            fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", outline: 'none', flex: 1, minWidth: '200px',
          }}>
            {targets.map(t => <option key={t.id} value={t.id}>{t.name} — {t.baseUrl}</option>)}
          </select>
          {targets.length === 0 && (
            <span style={{ fontSize: '12px', color: '#EF4444' }}>⚠ No targets configured. Add one in the Testing Hub first.</span>
          )}
        </div>
      </div>

      {/* Module Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {modules.map(m => {
          const isRunning = running === m.id;
          return (
            <div key={m.id} style={{
              ...card, cursor: selectedTarget ? 'pointer' : 'not-allowed',
              opacity: selectedTarget ? 1 : 0.5,
              borderColor: isRunning ? 'rgb(var(--primary))' : undefined,
              boxShadow: isRunning ? '0 0 0 2px rgba(var(--primary), 0.15)' : undefined,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{m.icon}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{m.name}</h3>
                </div>
                <button onClick={() => runModule(m.id)} disabled={isRunning || !selectedTarget}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none',
                    background: isRunning ? 'rgb(var(--surface-hover))' : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                    color: '#fff', fontSize: '11px', fontWeight: 600, cursor: selectedTarget ? 'pointer' : 'not-allowed',
                  }}>
                  {isRunning ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '13px', height: '13px' }} />}
                  {isRunning ? 'Running...' : 'Run'}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '0 0 12px', lineHeight: '1.5' }}>{m.description}</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>📋 {m.stepCount} steps</span>
                {m.criticalCount > 0 && <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>🔴 {m.criticalCount} critical</span>}
                {m.highCount > 0 && <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>🟡 {m.highCount} high</span>}
                <span style={sevBadge(m.category)}>{m.category}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results */}
      {result && (
        <div style={{ ...card, marginBottom: '24px', borderColor: result.failed > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)' }}>
          {/* Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>{result.icon}</span> {result.moduleName} — Results
              </h2>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                Run #{result.runId} • {(result.durationMs / 1000).toFixed(1)}s total
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: result.passRate >= 80 ? '#10B981' : result.passRate >= 50 ? '#F59E0B' : '#EF4444' }}>{result.passRate}%</div>
                <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>PASS RATE</div>
              </div>
              <div style={{ width: '1px', height: '40px', backgroundColor: 'rgb(var(--border))' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>{result.passed}</div>
                  <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>PASSED</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: result.failed > 0 ? '#EF4444' : 'rgb(var(--text-muted))' }}>{result.failed}</div>
                  <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>FAILED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Issues Alert */}
          {result.securityIssues.length > 0 && (
            <div style={{
              padding: '14px 18px', borderRadius: '10px', marginBottom: '16px',
              backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldAlert style={{ width: '16px', height: '16px', color: '#EF4444' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>Security Issues Found ({result.securityIssues.length})</span>
              </div>
              {result.securityIssues.map((si, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', padding: '4px 0', borderTop: i > 0 ? '1px solid rgba(239,68,68,0.1)' : 'none' }}>
                  <strong>{si.step}</strong>: {si.issue} — {si.error}
                </div>
              ))}
            </div>
          )}

          {/* Critical Fails Alert */}
          {result.criticalFails > 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
              backgroundColor: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <AlertTriangle style={{ width: '15px', height: '15px', color: '#EF4444' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>
                {result.criticalFails} critical test(s) failed — these are revenue-impacting issues
              </span>
            </div>
          )}

          {/* Step-by-step results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    <span style={sevBadge(s.severity)}>{s.severity}</span>
                    {s.statusCode && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: s.statusCode < 400 ? '#10B98112' : '#EF444412', color: s.statusCode < 400 ? '#10B981' : '#EF4444', fontWeight: 700 }}>{s.statusCode}</span>}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: s.latencyMs < 200 ? '#10B981' : s.latencyMs < 500 ? '#F59E0B' : '#EF4444' }}>{s.latencyMs}ms</span>
                    {s.securityIssue && <ShieldAlert style={{ width: '13px', height: '13px', color: '#EF4444' }} />}
                  </button>
                  {isExpanded && (
                    <div style={{ padding: '0 14px 12px 52px', fontSize: '12px' }}>
                      <p style={{ color: 'rgb(var(--text-secondary))', margin: '0 0 6px' }}>{s.description}</p>
                      {s.error && <p style={{ color: '#EF4444', margin: '0 0 4px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>❌ {s.error}</p>}
                      {s.securityIssue && <p style={{ color: '#EF4444', margin: '0 0 4px' }}>🛡 Security: <strong>{s.securityIssue}</strong></p>}
                      {s.schemaErrors && s.schemaErrors.length > 0 && (
                        <p style={{ color: '#F59E0B', margin: '0', fontSize: '11px' }}>Schema: {s.schemaErrors.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Run History */}
      {history.length > 1 && (
        <div style={{ ...card }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 12px' }}>Recent Module Runs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {history.slice(1).map((h, i) => (
              <button key={i} onClick={() => setResult(h)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px',
                border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer',
                color: 'rgb(var(--text-primary))', width: '100%', textAlign: 'left',
              }}>
                <span style={{ fontSize: '16px' }}>{h.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{h.moduleName}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: h.passRate >= 80 ? '#10B981' : '#EF4444' }}>{h.passRate}%</span>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{h.passed}/{h.total}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
