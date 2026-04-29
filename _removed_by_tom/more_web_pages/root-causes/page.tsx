'use client';

import { useState } from 'react';
import {
  Search, Brain, Sparkles, Clock, ThumbsUp, ThumbsDown,
  Code2, Loader2, XCircle, AlertCircle, Zap, ChevronRight,
  AlertTriangle, Activity,
} from 'lucide-react';
import { useApiData, useProjectLookup, resolveProjectName, timeAgo } from '@/lib/hooks';
import { api } from '@/lib/api';

/* ─── Severity config ─── */
const severityMap: Record<string, { color: string; bg: string; icon: typeof XCircle; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: XCircle,       label: 'Critical' },
  error:    { color: '#F97316', bg: 'rgba(249,115,22,0.12)', icon: AlertCircle,   label: 'Error'    },
  warning:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: AlertTriangle, label: 'Warning'  },
};

export default function RootCausesPage() {
  const { data: errors } = useApiData(() => api.getErrors());
  const { data: analyses, refetch } = useApiData(() => api.getRootCauses());
  const { lookup } = useProjectLookup();

  const [selected, setSelected] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [feedback, setFeedback] = useState<number | null>(null);

  const criticalErrors = (errors || [])
    .filter((e: any) => e.severity === 'critical' || e.severity === 'error' || e.severity === 'warning')
    .slice(0, 10);

  async function handleAnalyze(err: any) {
    setSelected(err);
    setAnalyzing(err.id);
    setResult(null);
    setFeedback(null);
    try {
      const res = await api.analyzeRootCause(err.id);
      setResult(res.data);
      refetch();
    } catch { } finally { setAnalyzing(null); }
  }

  async function handleFeedback(rating: number) {
    if (!result) return;
    setFeedback(rating);
    await api.submitFeedback(result.id, rating);
  }

  const isAIEnabled = process.env.NEXT_PUBLIC_AI_ENABLED === 'true';

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Root Cause Analysis</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            AI-powered root cause detection — click any error to analyze
          </p>
        </div>
        {/* AI status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', borderRadius: '10px',
          backgroundColor: isAIEnabled ? 'rgba(var(--agent),0.1)' : 'rgba(var(--border),0.6)',
          border: `1px solid ${isAIEnabled ? 'rgba(var(--agent),0.25)' : 'rgb(var(--border))'}`,
          flexShrink: 0,
        }}>
          <Sparkles style={{ width: '14px', height: '14px', color: isAIEnabled ? 'rgb(var(--agent))' : 'rgb(var(--text-muted))' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: isAIEnabled ? 'rgb(var(--agent))' : 'rgb(var(--text-muted))' }}>
            {isAIEnabled ? 'AI Connected' : 'Demo Mode'}
          </span>
          {/* Animated dot */}
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: isAIEnabled ? '#10B981' : '#F59E0B',
            boxShadow: isAIEnabled ? '0 0 6px #10B981' : 'none',
          }} />
        </div>
      </div>

      {/* ─── Two-panel layout ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

        {/* ── LEFT: Error list ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(var(--text-muted))', margin: 0 }}>
              Select Error to Analyze
            </p>
            <span style={{
              padding: '1px 7px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
              backgroundColor: 'rgba(var(--primary),0.1)', color: 'rgb(var(--primary))',
            }}>
              {criticalErrors.length}
            </span>
          </div>

          {criticalErrors.length === 0 ? (
            <div style={{
              borderRadius: '14px', padding: '40px 24px', textAlign: 'center',
              backgroundColor: 'rgb(var(--surface))', border: '1px dashed rgb(var(--border))',
            }}>
              <Search style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', opacity: 0.4, margin: '0 auto 10px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>No errors captured yet</p>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Install the PHP or JS SDK to start capturing errors</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {criticalErrors.map((err: any) => {
                const isSelected = selected?.id === err.id;
                const isAnalyzing = analyzing === err.id;
                const sev = severityMap[err.severity] || severityMap.error;
                const SevIcon = sev.icon;

                return (
                  <button
                    key={err.id}
                    onClick={() => handleAnalyze(err)}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                      borderRadius: '12px', border: 'none', padding: 0,
                      outline: isSelected ? `2px solid ${sev.color}55` : 'none',
                      outlineOffset: '1px',
                      backgroundColor: 'transparent',
                      transition: 'all 150ms',
                    }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      padding: '12px 14px', borderRadius: '12px',
                      backgroundColor: isSelected ? `${sev.color}08` : 'rgb(var(--surface))',
                      border: `1px solid ${isSelected ? `${sev.color}35` : 'rgb(var(--border))'}`,
                      borderLeft: `4px solid ${sev.color}`,
                      transition: 'all 150ms',
                    }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        (e.currentTarget as HTMLElement).style.transform = 'none';
                      }}
                    >
                      {/* Severity icon */}
                      <div style={{
                        width: '36px', height: '36px', flexShrink: 0, borderRadius: '9px',
                        backgroundColor: sev.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: '1px',
                      }}>
                        <SevIcon style={{ width: '16px', height: '16px', color: sev.color }} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span style={{
                            padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                            textTransform: 'uppercase', backgroundColor: sev.bg, color: sev.color,
                          }}>
                            {sev.label}
                          </span>
                          <p style={{
                            fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))',
                            margin: 0, fontFamily: 'monospace',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {err.type}
                          </p>
                        </div>
                        <p style={{
                          fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '0 0 5px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {err.message}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                          <span style={{ fontWeight: 600, color: 'rgb(var(--primary))', fontSize: '11px' }}>
                            {resolveProjectName(err.projectId, lookup)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Activity style={{ width: '10px', height: '10px' }} />
                            {err.eventCount}×
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock style={{ width: '10px', height: '10px' }} />
                            {timeAgo(err.lastSeenAt)}
                          </span>
                        </div>
                      </div>

                      {/* Analyze indicator */}
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                        {isAnalyzing ? (
                          <Loader2 style={{ width: '16px', height: '16px', color: 'rgb(var(--agent))', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: isSelected ? `${sev.color}15` : 'rgba(var(--agent),0.08)',
                            color: isSelected ? sev.color : 'rgb(var(--agent))',
                            transition: 'all 150ms',
                          }}>
                            <Sparkles style={{ width: '13px', height: '13px' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Analysis panel ── */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(var(--text-muted))', margin: '0 0 10px' }}>
            Analysis
          </p>

          {/* Loading state */}
          {analyzing ? (
            <div style={{
              borderRadius: '14px', padding: '48px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(var(--agent),0.06), rgba(var(--primary),0.03))',
              border: '1px solid rgba(var(--agent),0.2)',
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(var(--agent),0.2), rgba(var(--primary),0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain style={{ width: '28px', height: '28px', color: 'rgb(var(--agent))' }} />
                </div>
                <Loader2 style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  width: '18px', height: '18px', color: 'rgb(var(--primary))',
                  animation: 'spin 1s linear infinite',
                }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
                  Analyzing error pattern...
                </p>
                <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                  Reading stack trace · checking error history · generating fix
                </p>
              </div>
              {/* Pulsing dots */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    backgroundColor: 'rgb(var(--agent))',
                    opacity: 0.4 + (i * 0.2),
                    animation: `pulse ${1 + i * 0.3}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>

          /* Result state */
          ) : result ? (
            <div style={{
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(var(--agent),0.05), rgba(var(--primary),0.02))',
              border: '1px solid rgba(var(--agent),0.2)',
              overflow: 'hidden',
            }}>
              {/* Result header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(var(--agent),0.15)',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(var(--agent),0.04)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '9px',
                  background: 'linear-gradient(135deg, rgba(var(--agent),0.2), rgba(var(--primary),0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Sparkles style={{ width: '14px', height: '14px', color: 'rgb(var(--agent))' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, flex: 1 }}>
                  Root Cause Found
                </p>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  background: 'linear-gradient(135deg, rgba(var(--agent),0.15), rgba(var(--primary),0.1))',
                  color: 'rgb(var(--agent))',
                  border: '1px solid rgba(var(--agent),0.2)',
                }}>
                  {result.confidence}% confidence
                </span>
              </div>

              {/* Analysis body */}
              <div style={{ padding: '16px 18px' }}>
                <p style={{
                  fontSize: '13px', lineHeight: 1.7, color: 'rgb(var(--text-secondary))',
                  margin: '0 0 16px', whiteSpace: 'pre-wrap',
                }}>
                  {result.analysis}
                </p>

                {result.suggestedFix && (
                  <div style={{
                    borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid rgba(var(--primary),0.15)',
                  }}>
                    <div style={{
                      padding: '8px 14px',
                      backgroundColor: 'rgba(var(--primary),0.06)',
                      borderBottom: '1px solid rgba(var(--primary),0.1)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <Code2 style={{ width: '13px', height: '13px', color: 'rgb(var(--primary))' }} />
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgb(var(--primary))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Suggested Fix
                      </p>
                    </div>
                    <pre style={{
                      fontSize: '12px', padding: '14px',
                      backgroundColor: 'rgba(var(--border),0.3)',
                      color: 'rgb(var(--text-secondary))',
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      lineHeight: 1.7, margin: 0,
                      overflowX: 'auto',
                    }}>
                      {result.suggestedFix}
                    </pre>
                  </div>
                )}

                {/* Feedback */}
                <div style={{
                  marginTop: '16px', paddingTop: '12px',
                  borderTop: '1px solid rgba(var(--border),0.5)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0, flex: 1 }}>Was this helpful?</p>
                  {[
                    { rating: 1, icon: ThumbsUp, label: 'Yes', activeColor: '#10B981', activeBg: 'rgba(16,185,129,0.12)' },
                    { rating: 0, icon: ThumbsDown, label: 'No', activeColor: '#EF4444', activeBg: 'rgba(239,68,68,0.12)' },
                  ].map(b => (
                    <button
                      key={b.rating}
                      onClick={() => handleFeedback(b.rating)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 600,
                        backgroundColor: feedback === b.rating ? b.activeBg : 'transparent',
                        color: feedback === b.rating ? b.activeColor : 'rgb(var(--text-muted))',
                        outline: feedback === b.rating ? `1px solid ${b.activeColor}40` : '1px solid rgb(var(--border))',
                        transition: 'all 150ms',
                      }}
                    >
                      <b.icon style={{ width: '12px', height: '12px' }} /> {b.label}
                    </button>
                  ))}
                  {result.model === 'demo' && (
                    <span style={{
                      marginLeft: 'auto', padding: '2px 8px', borderRadius: '5px',
                      fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                      backgroundColor: 'rgba(var(--border),0.5)', color: 'rgb(var(--text-muted))',
                    }}>demo</span>
                  )}
                </div>
              </div>
            </div>

          /* Empty state */
          ) : (
            <div style={{
              borderRadius: '14px', padding: '60px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center',
              backgroundColor: 'rgb(var(--surface))',
              border: '1px dashed rgba(var(--border), 0.8)',
              minHeight: '300px', justifyContent: 'center',
            }}>
              {/* Brain icon with gradient glow */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(var(--agent),0.12), rgba(var(--primary),0.06))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(var(--agent),0.08)',
              }}>
                <Brain style={{ width: '30px', height: '30px', color: 'rgb(var(--agent))', opacity: 0.7 }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 6px' }}>
                  Select an error to analyze
                </p>
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0, lineHeight: 1.6 }}>
                  AI will analyze the stack trace, error pattern,<br />and recent deploys to suggest a fix
                </p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px',
                backgroundColor: 'rgba(var(--agent),0.08)',
                color: 'rgb(var(--agent))', fontSize: '12px', fontWeight: 500,
              }}>
                <Zap style={{ width: '12px', height: '12px' }} />
                Powered by Agent Intelligence
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Past Analyses ─── */}
      {(analyses || []).length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(var(--text-muted))', margin: 0 }}>
              Past Analyses
            </p>
            <span style={{
              padding: '1px 7px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
              backgroundColor: 'rgba(var(--agent),0.1)', color: 'rgb(var(--agent))',
            }}>
              {(analyses || []).length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(analyses || []).slice(0, 5).map((a: any) => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px',
                backgroundColor: 'rgb(var(--surface))',
                border: '1px solid rgb(var(--border))',
                transition: 'box-shadow 150ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                  backgroundColor: 'rgba(var(--agent),0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles style={{ width: '13px', height: '13px', color: 'rgb(var(--agent))' }} />
                </div>
                <p style={{
                  flex: 1, fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {a.analysis?.slice(0, 90)}…
                </p>
                <span style={{
                  flexShrink: 0, padding: '2px 8px', borderRadius: '6px',
                  fontSize: '11px', fontWeight: 700,
                  backgroundColor: 'rgba(var(--agent),0.08)', color: 'rgb(var(--agent))',
                }}>
                  {a.confidence}%
                </span>
                <span style={{ flexShrink: 0, fontSize: '11px', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock style={{ width: '10px', height: '10px' }} />
                  {timeAgo(a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
