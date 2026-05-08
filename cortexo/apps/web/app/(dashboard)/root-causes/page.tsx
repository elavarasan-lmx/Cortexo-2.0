'use client';

import { useState, useCallback } from 'react';
import {
  Search, Brain, CheckCircle, AlertTriangle, Clock, Lightbulb,
  ThumbsUp, ThumbsDown, ArrowUpRight, Sparkles, Target, Filter,
  GitBranch, Rocket, Link2, ChevronDown, ChevronUp, Copy, Wrench,
  BarChart3, Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

// ─── Status & confidence helpers ────────────────────────────────────

const statusMap: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  confirmed:  { icon: CheckCircle,    color: '#10B981', label: 'Confirmed' },
  completed:  { icon: CheckCircle,    color: '#10B981', label: 'Completed' },
  pending:    { icon: Clock,          color: '#F59E0B', label: 'Pending' },
  rejected:   { icon: ThumbsDown,     color: '#EF4444', label: 'Rejected' },
  analyzing:  { icon: Brain,          color: '#818CF8', label: 'Analyzing' },
  failed:     { icon: AlertTriangle,  color: '#EF4444', label: 'Failed' },
};

const confidenceColor = (c: number) =>
  c >= 80 ? '#10B981' : c >= 50 ? '#F59E0B' : '#EF4444';

const categoryBadge: Record<string, string> = {
  null_reference: '🔴 Null Ref',
  type_error:     '🟠 Type Error',
  connection:     '🟡 Connection',
  timeout:        '⏱️ Timeout',
  auth:           '🔒 Auth',
  validation:     '📋 Validation',
  memory:         '💾 Memory',
  concurrency:    '⚡ Concurrency',
  config:         '⚙️ Config',
  database:       '🗃️ Database',
  network:        '🌐 Network',
  unknown:        '❓ Unknown',
};

// ─── Main Page ──────────────────────────────────────────────────────

export default function RootCausesPage() {
  useAutoLoadToken();
  const { data: rootCauses, loading, refetch } = useApiData(() => api.listRootCauses());
  const { data: stats } = useApiData(() => api.getRootCauseStats());
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [similarBugs, setSimilarBugs] = useState<Record<string, any[]>>({});
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});

  const items = rootCauses || [];
  const filtered = activeFilter === 'all'
    ? items
    : items.filter((r: any) => r.status === activeFilter);

  const totalCount = items.length;
  const confirmedCount = items.filter((r: any) => r.status === 'confirmed' || r.status === 'completed').length;
  const avgConfidence = stats?.avgConfidence || (totalCount > 0
    ? Math.round(items.reduce((s: number, r: any) => s + (r.confidence || 0), 0) / totalCount)
    : 0);
  const pendingCount = items.filter((r: any) => r.status === 'pending').length;

  const statCards = [
    { label: 'Total Analyses', value: String(stats?.total || totalCount), icon: Brain, color: '#818CF8' },
    { label: 'Confirmed', value: String(stats?.confirmed || confirmedCount), icon: CheckCircle, color: '#10B981' },
    { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: Target, color: '#3B82F6' },
    { label: 'Fixes Applied', value: String(stats?.fixApplied || 0), icon: Wrench, color: '#F59E0B' },
  ];

  const filters = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'confirmed', label: 'Confirmed', count: confirmedCount },
    { key: 'completed', label: 'Completed', count: items.filter((r: any) => r.status === 'completed').length },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'analyzing', label: 'Analyzing', count: items.filter((r: any) => r.status === 'analyzing').length },
    { key: 'rejected', label: 'Rejected', count: items.filter((r: any) => r.status === 'rejected').length },
  ];

  // ─── Handlers ───────────────────────────────────────────────────

  const toggleExpand = useCallback(async (rca: any) => {
    const newId = expandedId === rca.id ? null : rca.id;
    setExpandedId(newId);

    // Load similar bugs on expand
    if (newId && rca.errorId && !similarBugs[rca.errorId]) {
      try {
        const res = await api.findSimilarBugs(rca.errorId);
        setSimilarBugs((prev) => ({ ...prev, [rca.errorId]: res.data || [] }));
      } catch { /* ignore */ }
    }
  }, [expandedId, similarBugs]);

  const handleFeedback = useCallback(async (rcaId: string, verdict: 'correct' | 'wrong') => {
    try {
      await api.submitRootCauseFeedback(rcaId, verdict);
      setFeedbackSent((prev) => ({ ...prev, [rcaId]: verdict }));
      refetch();
    } catch { /* ignore */ }
  }, [refetch]);

  const handleApplyFix = useCallback(async (rcaId: string) => {
    try {
      await api.applyRootCauseFix(rcaId);
      refetch();
    } catch { /* ignore */ }
  }, [refetch]);

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} />
            Root Cause Analysis
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            AI-powered root cause analysis with deploy correlation, similar bugs, and suggested fixes
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: 'rgb(var(--surface))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '14px',
                padding: '18px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 200ms, transform 200ms',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 24px -4px ${card.color}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: card.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{card.label}</p>
                <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${card.color}12` }}>
                  <Icon style={{ width: '15px', height: '15px', color: card.color }} />
                </div>
              </div>
              <p style={{ fontSize: '26px', fontWeight: 700, color: card.color, margin: '10px 0 0', lineHeight: 1 }}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Filter style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
              border: '1px solid',
              borderColor: activeFilter === f.key ? 'rgb(var(--primary))' : 'rgb(var(--border))',
              backgroundColor: activeFilter === f.key ? 'rgba(var(--primary), 0.08)' : 'transparent',
              color: activeFilter === f.key ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
              cursor: 'pointer', transition: 'all 200ms',
            }}
          >
            {f.label}
            <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.7 }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Root Cause List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'rgb(var(--text-muted))' }}>
            <Brain style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading analyses...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px 20px', border: '2px dashed rgb(var(--border))', borderRadius: '14px', textAlign: 'center',
          }}>
            <Sparkles style={{ width: '36px', height: '36px', color: 'rgb(var(--text-muted))', opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-secondary))', margin: 0 }}>No root causes found</p>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>Trigger an analysis from the Error Tracker to get started</p>
          </div>
        )}

        {filtered.map((rca: any) => {
          const st = statusMap[rca.status] || statusMap.pending;
          const Icon = st.icon;
          const conf = rca.confidence || 0;
          const isExpanded = expandedId === rca.id;
          const ExpandIcon = isExpanded ? ChevronUp : ChevronDown;
          const errorBugs = similarBugs[rca.errorId] || [];
          const fb = feedbackSent[rca.id] || rca.userFeedback;

          return (
            <div key={rca.id}>
              {/* Main row */}
              <div
                onClick={() => toggleExpand(rca)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '16px 20px',
                  backgroundColor: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border))',
                  borderLeft: `3px solid ${st.color}`,
                  borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
                  transition: 'box-shadow 200ms, transform 200ms',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{
                  width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '10px', backgroundColor: `${st.color}12`, flexShrink: 0, marginTop: '2px',
                }}>
                  <Icon style={{ width: '16px', height: '16px', color: st.color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
                      {rca.summary || rca.explanation?.slice(0, 80) || 'Untitled Analysis'}
                    </p>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px',
                      backgroundColor: `${st.color}15`, color: st.color,
                    }}>{st.label}</span>
                    {rca.category && (
                      <span style={{
                        fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '9999px',
                        backgroundColor: 'rgba(var(--border), 0.3)', color: 'rgb(var(--text-secondary))',
                      }}>{categoryBadge[rca.category] || rca.category}</span>
                    )}
                  </div>

                  {(rca.explanation || rca.rootCause) && (
                    <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '6px 0 0', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                    }}>
                      {rca.rootCause || rca.explanation}
                    </p>
                  )}

                  {/* Meta info row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Target style={{ width: '11px', height: '11px' }} />
                      Confidence: <span style={{ fontWeight: 600, color: confidenceColor(conf) }}>{conf}%</span>
                    </span>
                    {rca.provider && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles style={{ width: '10px', height: '10px' }} />
                          {rca.provider}
                        </span>
                      </>
                    )}
                    {rca.deploymentId && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3B82F6' }}>
                          <Rocket style={{ width: '10px', height: '10px' }} />
                          Deploy linked
                        </span>
                      </>
                    )}
                    {rca.fixApplied && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                          <Wrench style={{ width: '10px', height: '10px' }} />
                          Fix applied
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>{timeAgo(rca.createdAt)}</span>
                  </div>
                </div>

                <ExpandIcon style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0, marginTop: '4px' }} />
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  backgroundColor: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border))',
                  borderTop: 'none',
                  borderLeft: `3px solid ${st.color}`,
                  borderRadius: '0 0 12px 12px',
                  padding: '0 20px 20px 20px',
                }}>
                  {/* Suggested Fix */}
                  {rca.suggestedFix && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px',
                      padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                    }}>
                      <Lightbulb style={{ width: '14px', height: '14px', color: '#10B981', marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Suggested Fix</p>
                        <p style={{ fontSize: '12px', color: '#10B981', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {rca.suggestedFix}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Affected Files */}
                  {rca.affectedFiles && rca.affectedFiles.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Affected Files
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(Array.isArray(rca.affectedFiles) ? rca.affectedFiles : JSON.parse(rca.affectedFiles || '[]')).map((file: string, i: number) => (
                          <span key={i} style={{
                            fontSize: '11px', fontFamily: 'monospace', padding: '3px 10px',
                            borderRadius: '6px', backgroundColor: 'rgba(var(--border), 0.2)',
                            color: 'rgb(var(--text-secondary))',
                          }}>{file}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {rca.error && (
                    <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Linked Error</p>
                      <p style={{ fontSize: '12px', color: 'rgb(var(--text-primary))', margin: 0, fontFamily: 'monospace' }}>
                        {rca.error.type}: {rca.error.message?.slice(0, 200)}
                      </p>
                      {rca.error.file && (
                        <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>
                          📁 {rca.error.file}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Similar Bugs */}
                  {errorBugs.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Link2 style={{ width: '12px', height: '12px' }} />
                        Similar Past Bugs ({errorBugs.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {errorBugs.slice(0, 3).map((bug: any, i: number) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                            borderRadius: '8px', backgroundColor: 'rgba(var(--border), 0.15)',
                          }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                              backgroundColor: confidenceColor(bug.similarity) + '18', color: confidenceColor(bug.similarity),
                            }}>{bug.similarity}%</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '12px', color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {bug.type}: {bug.message?.slice(0, 100)}
                              </p>
                              {bug.rootCauseSummary && (
                                <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>
                                  Fix: {bug.suggestedFix?.slice(0, 120)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback + Actions bar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', paddingTop: '14px',
                    borderTop: '1px solid rgb(var(--border))',
                    flexWrap: 'wrap',
                  }}>
                    {/* Feedback buttons */}
                    {!fb && (
                      <>
                        <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginRight: '4px' }}>Was this helpful?</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFeedback(rca.id, 'correct'); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 500,
                            border: '1px solid rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.06)',
                            color: '#10B981', cursor: 'pointer', transition: 'all 200ms',
                          }}
                        >
                          <ThumbsUp style={{ width: '12px', height: '12px' }} /> Correct
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFeedback(rca.id, 'wrong'); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 500,
                            border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.06)',
                            color: '#EF4444', cursor: 'pointer', transition: 'all 200ms',
                          }}
                        >
                          <ThumbsDown style={{ width: '12px', height: '12px' }} /> Wrong
                        </button>
                      </>
                    )}
                    {fb && (
                      <span style={{
                        fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px',
                        backgroundColor: fb === 'correct' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: fb === 'correct' ? '#10B981' : '#EF4444',
                      }}>
                        {fb === 'correct' ? '✓ Marked correct' : '✗ Marked wrong'}
                      </span>
                    )}

                    <div style={{ flex: 1 }} />

                    {/* Apply Fix button */}
                    {rca.suggestedFix && !rca.fixApplied && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApplyFix(rca.id); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '5px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                          border: 'none', backgroundColor: 'rgb(var(--primary))',
                          color: '#fff', cursor: 'pointer', transition: 'all 200ms',
                        }}
                      >
                        <Wrench style={{ width: '12px', height: '12px' }} /> Mark Fix Applied
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
