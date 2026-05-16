'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Bug, AlertTriangle, Zap, Clock, Server,
  ShieldAlert, FileWarning, Loader2, ChevronDown, ChevronRight,
  Boxes, BarChart3, Send, ExternalLink, Check, X,
} from 'lucide-react';
import { api } from '@/lib/api';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', label: 'Critical' },
  high:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'High' },
  medium:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', label: 'Medium' },
  low:      { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'Low' },
};

const BUG_TYPE_LABELS: Record<string, string> = {
  server_error: 'Server Crash',
  timeout: 'Timeout',
  slow_response: 'Slow Response',
  missing_endpoint: 'Missing Endpoint',
  broken_json: 'Broken Response',
  empty_response: 'Empty Response',
  client_error: 'Client Error',
  connection_error: 'Connection Failed',
};

export default function BugReportPage() {
  const params = useParams();
  const runId = Number(params.runId);

  const [bugData, setBugData] = useState<any>(null);
  const [moduleData, setModuleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bugs' | 'modules'>('bugs');
  const [expandedBug, setExpandedBug] = useState<number | null>(null);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bugs, modules] = await Promise.all([
        api.getTestBugs(runId),
        api.getTestModuleResults(runId),
      ]);
      setBugData((bugs as unknown as { data?: unknown })?.data || bugs);
      setModuleData(((modules as unknown as { data?: unknown[] })?.data || modules || []) as unknown[]);
    } catch { /* ignore */ }
    setLoading(false);
  }, [runId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <Loader2 style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const bugs = bugData?.bugs || [];
  const filteredBugs = filterSeverity ? bugs.filter((b: any) => b.severity === filterSeverity) : bugs;

  return (
    <div>
      {/* Header */}
      <Link href={`/testing/runs/${runId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Run #{runId}
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div className="cx-flex cx-items-center cx-gap-12">
          <Bug style={{ width: '24px', height: '24px', color: '#EF4444' }} />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
            Bug Report & Module Analysis
          </h1>
        </div>
        <div className="cx-flex cx-items-center cx-gap-10">
          {exportResult && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              backgroundColor: exportResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: exportResult.success ? '#22C55E' : '#EF4444',
              border: `1px solid ${exportResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              animation: 'fadeIn 300ms ease',
            }}>
              {exportResult.success ? <Check style={{ width: '14px', height: '14px' }} /> : <X style={{ width: '14px', height: '14px' }} />}
              {exportResult.success
                ? `${exportResult.exported?.created || 0} new, ${exportResult.exported?.updated || 0} updated`
                : 'Export failed'
              }
              {exportResult.success && (
                <Link href="/bug-tracker" style={{ color: '#22C55E', marginLeft: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  View <ExternalLink style={{ width: '12px', height: '12px' }} />
                </Link>
              )}
            </div>
          )}
          <button
            onClick={async () => {
              setExporting(true);
              try {
                const res = await api.exportTestBugs(runId);
                setExportResult((res as { data?: { success?: boolean } }).data || res);
              } catch {
                setExportResult({ success: false });
              }
              setExporting(false);
              setTimeout(() => setExportResult(null), 12000);
            }}
            disabled={exporting || (bugData?.totalBugs || 0) === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
              borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7C3AED, #6366F1)', color: '#fff',
              opacity: exporting || (bugData?.totalBugs || 0) === 0 ? 0.5 : 1,
              transition: 'all 150ms', boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
            }}
          >
            {exporting
              ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Pushing...</>
              : <><Send style={{ width: '14px', height: '14px' }} /> Push to Bug Tracker</>
            }
          </button>
        </div>
      </div>
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginBottom: '20px' }}>
        Smart analysis of Run #{runId} — {bugData?.totalBugs || 0} real bugs found, {bugData?.authExpectedCount || 0} auth-expected (ignored)
      </p>

      {/* Severity Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {Object.entries(SEVERITY_CONFIG).map(([key, conf]) => {
          const count = bugData?.bySeverity?.[key] || 0;
          return (
            <button key={key} onClick={() => setFilterSeverity(filterSeverity === key ? '' : key)}
              style={{
                padding: '14px 16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                border: filterSeverity === key ? `2px solid ${conf.color}` : '1px solid rgb(var(--border))',
                backgroundColor: count > 0 ? conf.bg : 'rgb(var(--surface))',
                transition: 'all 150ms',
              }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: conf.color, marginBottom: '4px' }}>
                {conf.label}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: count > 0 ? conf.color : 'rgb(var(--text-muted))' }}>{count}</div>
            </button>
          );
        })}
        <div style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>
            Auth Expected
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'rgb(var(--text-muted))' }}>{bugData?.authExpectedCount || 0}</div>
        </div>
      </div>

      {/* Bug Type Summary */}
      {bugData?.summary && Object.keys(bugData.summary).length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {Object.entries(bugData.summary).map(([type, count]) => (
            <span key={type} style={{
              padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              border: '1px solid rgb(var(--border))', color: 'rgb(var(--text-primary))',
              backgroundColor: 'rgb(var(--surface))',
            }}>
              {BUG_TYPE_LABELS[type] || type}: {count as number}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '2px solid rgb(var(--border))', paddingBottom: '0' }}>
        <button onClick={() => setActiveTab('bugs')} style={{
          padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          border: 'none', borderBottom: activeTab === 'bugs' ? '2px solid rgb(var(--primary))' : '2px solid transparent',
          color: activeTab === 'bugs' ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
          backgroundColor: 'transparent', marginBottom: '-2px',
        }}>
          Bugs ({bugData?.totalBugs || 0})
        </button>
        <button onClick={() => setActiveTab('modules')} style={{
          padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          border: 'none', borderBottom: activeTab === 'modules' ? '2px solid rgb(var(--primary))' : '2px solid transparent',
          color: activeTab === 'modules' ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
          backgroundColor: 'transparent', marginBottom: '-2px',
        }}>
          Module Health ({moduleData.length})
        </button>
      </div>

      {/* ─── BUGS TAB ─── */}
      {activeTab === 'bugs' && (
        <div className="cx-flex-col" style={{ gap: "8px" }}>
          {filteredBugs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgb(var(--text-muted))' }}>
              {filterSeverity ? 'No bugs at this severity level.' : 'No bugs found! Your codebase is healthy.'}
            </div>
          ) : filteredBugs.map((bug: any) => {
            const conf = SEVERITY_CONFIG[bug.severity];
            const isExpanded = expandedBug === bug.id;

            return (
              <div key={bug.id} style={{
                borderRadius: '12px', border: `1px solid ${conf.color}30`,
                backgroundColor: conf.bg, overflow: 'hidden', transition: 'all 150ms',
              }}>
                {/* Bug Header */}
                <button onClick={() => setExpandedBug(isExpanded ? null : bug.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent',
                  textAlign: 'left',
                }}>
                  <span style={{
                    fontSize: '8px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px',
                    backgroundColor: conf.color, color: '#fff', textTransform: 'uppercase',
                    letterSpacing: '0.05em', flexShrink: 0,
                  }}>{bug.severity}</span>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                    backgroundColor: 'rgba(255,255,255,0.08)', color: conf.color,
                    textTransform: 'uppercase', flexShrink: 0,
                  }}>{BUG_TYPE_LABELS[bug.type] || bug.type}</span>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
                    {bug.title}
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                    backgroundColor: bug.statusCode >= 500 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
                    color: bug.statusCode >= 500 ? '#EF4444' : 'rgb(var(--text-muted))',
                  }}>{bug.statusCode || 'ERR'}</span>
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>
                    {bug.latencyMs}ms
                  </span>
                  {isExpanded
                    ? <ChevronDown style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
                    : <ChevronRight style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
                  }
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${conf.color}20` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', fontSize: '12px' }}>
                      <div>
                        <div style={{ color: 'rgb(var(--text-muted))', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Endpoint</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-primary))' }}>{bug.method} {bug.endpoint}</div>
                      </div>
                      <div>
                        <div style={{ color: 'rgb(var(--text-muted))', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Source File</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-primary))' }}>{bug.sourceFile || '—'}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ color: 'rgb(var(--text-muted))', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Description</div>
                        <div style={{ color: 'rgb(var(--text-primary))' }}>{bug.description}</div>
                      </div>
                      {bug.responsePreview && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ color: 'rgb(var(--text-muted))', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Response Preview</div>
                          <pre style={{
                            padding: '10px', borderRadius: '8px', fontSize: '11px',
                            backgroundColor: 'rgba(0,0,0,0.3)', color: '#94A3B8',
                            overflow: 'auto', maxHeight: '200px', whiteSpace: 'pre-wrap',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>{bug.responsePreview}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODULES TAB ─── */}
      {activeTab === 'modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {moduleData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgb(var(--text-muted))' }}>
              No module data available. Run tests first.
            </div>
          ) : moduleData.map((mod: any) => {
            const passRate = mod.passRate || 0;
            const barColor = passRate === 100 ? '#10B981' : passRate > 50 ? '#F59E0B' : '#EF4444';
            const hasCritical = (mod.criticalEndpoints?.length || 0) > 0;

            return (
              <div key={mod.name} style={{
                padding: '16px 20px', borderRadius: '14px',
                border: hasCritical ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgb(var(--border))',
                backgroundColor: hasCritical ? 'rgba(239,68,68,0.03)' : 'rgb(var(--surface))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Boxes style={{ width: '16px', height: '16px', color: barColor }} />
                      {mod.name}
                    </h3>
                    <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>
                      {mod.total} endpoints · {mod.passed} passed · {mod.failed} failed · avg {mod.avgLatency}ms
                    </p>
                  </div>
                  <div style={{
                    fontSize: '20px', fontWeight: 800, color: barColor,
                  }}>{passRate}%</div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${passRate}%`, height: '100%', borderRadius: '3px', backgroundColor: barColor, transition: 'width 500ms' }} />
                </div>

                {/* Critical endpoints */}
                {hasCritical && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Critical Failures (500 errors)
                    </div>
                    {mod.criticalEndpoints.map((ep: any, i: number) => (
                      <div key={i} style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#FCA5A5', padding: '2px 0' }}>
                        {ep.endpoint} → {ep.statusCode} {ep.error ? `(${ep.error})` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
