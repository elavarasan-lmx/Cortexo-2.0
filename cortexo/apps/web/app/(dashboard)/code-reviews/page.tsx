'use client';

import { useState, useEffect } from 'react';
import {
  Code, AlertTriangle, CheckCircle, XCircle, FileCode, Search,
  Shield, Bug, Eye, ChevronRight, ChevronDown, Loader2, RefreshCw,
  Play, Filter, Clock, Zap, GitCommit, Info, X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

// ─── Severity colors ─────────────────────────────────────────────

const severityColors: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#3B82F6',
  info: '#6B7280',
};

const severityLabels: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

const categoryIcons: Record<string, typeof Shield> = {
  security: Shield,
  quality: Eye,
  pattern: Code,
  performance: Zap,
};

// ─── Page ─────────────────────────────────────────────────────────

export default function CodeReviewPage() {
  useAutoLoadToken();

  const [reviews, setReviews] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [loadingFindings, setLoadingFindings] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [tab, setTab] = useState<'reviews' | 'rules'>('reviews');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [rulesRes] = await Promise.all([
        api.getCodeReviewRules(),
      ]);
      setRules((rulesRes as any)?.data || []);
    } catch (err) {
      console.warn('Failed to load code review data');
    }

    // Load reviews for all projects (try first project)
    try {
      const projectsRes = await api.getProjects();
      const projects = (projectsRes as any)?.data || [];
      if (projects.length > 0) {
        const reviewsRes = await api.getCodeReviews(projects[0].id);
        setReviews((reviewsRes as any)?.data || []);
      }
    } catch {
      // No reviews yet — that's fine
    }
    setLoading(false);
  }

  async function loadFindings(reviewId: string) {
    setLoadingFindings(true);
    try {
      const res = await api.getCodeReview(reviewId);
      const data = (res as any)?.data;
      setSelectedReview(data);
      setFindings(data?.findings || []);
    } catch {
      setFindings([]);
    }
    setLoadingFindings(false);
  }

  const filteredFindings = severityFilter === 'all'
    ? findings
    : findings.filter(f => f.severity === severityFilter);

  // ─── Summary Stats ──────────────────────────────────────────────

  const stats = selectedReview
    ? [
        { label: 'Total', value: selectedReview.totalFindings, color: '#818CF8' },
        { label: 'Critical', value: selectedReview.criticalCount, color: '#EF4444' },
        { label: 'High', value: selectedReview.highCount, color: '#F97316' },
        { label: 'Medium', value: selectedReview.mediumCount, color: '#F59E0B' },
        { label: 'Low', value: selectedReview.lowCount, color: '#3B82F6' },
        { label: 'Files', value: selectedReview.filesScanned, color: '#10B981' },
      ]
    : [
        { label: 'Total Reviews', value: reviews.length, color: '#818CF8' },
        { label: 'Rules Active', value: rules.length, color: '#10B981' },
        { label: 'Critical Rules', value: rules.filter((r: any) => r.severity === 'critical').length, color: '#EF4444' },
        { label: 'Security Rules', value: rules.filter((r: any) => r.category === 'security').length, color: '#F97316' },
      ];

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Code style={{ width: '22px', height: '22px', color: '#818CF8' }} /> Code Reviews
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Rule-based security scanning &amp; code quality analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedReview && (
            <button
              onClick={() => { setSelectedReview(null); setFindings([]); setSeverityFilter('all'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}
            >
              <X style={{ width: '13px', height: '13px' }} /> Back to List
            </button>
          )}
          <button
            onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}
          >
            <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {stats.map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{loading ? '—' : c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs (only on list view) */}
      {!selectedReview && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {(['reviews', 'rules'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '5px 14px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, border: '1px solid',
                borderColor: tab === t ? 'rgb(var(--primary))' : 'rgb(var(--border))',
                backgroundColor: tab === t ? 'rgba(var(--primary), 0.08)' : 'transparent',
                color: tab === t ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {t === 'reviews' ? `Reviews (${reviews.length})` : `Rules (${rules.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading code reviews...</p>
        </div>
      )}

      {/* ─── Review Detail View ──────────────────────────────────── */}
      {selectedReview && !loading && (
        <div>
          {/* Review header */}
          <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: selectedReview.criticalCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }}>
                {selectedReview.criticalCount > 0
                  ? <AlertTriangle style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                  : <CheckCircle style={{ width: '18px', height: '18px', color: '#10B981' }} />
                }
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
                  Review #{selectedReview.id.slice(0, 8)}
                </h2>
                <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>
                  {selectedReview.branch && <><GitCommit style={{ width: '11px', height: '11px', display: 'inline', verticalAlign: 'middle' }} /> {selectedReview.branch} · </>}
                  {selectedReview.filesScanned} files scanned · {selectedReview.durationMs}ms
                  {selectedReview.commitSha && <> · {selectedReview.commitSha.slice(0, 7)}</>}
                </p>
              </div>
            </div>
          </div>

          {/* Severity filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {['all', 'critical', 'high', 'medium', 'low', 'info'].map((f) => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                style={{
                  padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 600, border: '1px solid',
                  borderColor: severityFilter === f ? (severityColors[f] || 'rgb(var(--primary))') : 'rgb(var(--border))',
                  backgroundColor: severityFilter === f ? `${severityColors[f] || 'rgb(var(--primary))'}15` : 'transparent',
                  color: severityFilter === f ? (severityColors[f] || 'rgb(var(--primary))') : 'rgb(var(--text-secondary))',
                  cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? `All (${findings.length})` : `${severityLabels[f] || f} (${findings.filter(fi => fi.severity === f).length})`}
              </button>
            ))}
          </div>

          {/* Findings list */}
          {loadingFindings ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <Loader2 style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredFindings.map((finding: any) => {
                const color = severityColors[finding.severity] || '#6B7280';
                const CatIcon = categoryIcons[finding.category] || Eye;
                const isExpanded = expandedFinding === finding.id;

                return (
                  <div
                    key={finding.id}
                    style={{
                      backgroundColor: 'rgb(var(--surface))',
                      border: '1px solid rgb(var(--border))',
                      borderLeft: `3px solid ${color}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'box-shadow 200ms',
                    }}
                  >
                    <div
                      onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 18px', cursor: 'pointer' }}
                    >
                      <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                        <CatIcon style={{ width: '14px', height: '14px', color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{finding.ruleName}</span>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', backgroundColor: `${color}15`, color, textTransform: 'uppercase' }}>{finding.severity}</span>
                          {finding.autoFixable && (
                            <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '9999px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>AUTO-FIX</span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '3px 0 0' }}>{finding.message}</p>
                        <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '3px 0 0', fontFamily: 'monospace' }}>
                          <FileCode style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle' }} /> {finding.file}:{finding.line}
                        </p>
                      </div>
                      {isExpanded
                        ? <ChevronDown style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0, marginTop: '4px' }} />
                        : <ChevronRight style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0, marginTop: '4px' }} />
                      }
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgb(var(--border))' }}>
                        {/* Snippet */}
                        {finding.snippet && (
                          <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', marginBottom: '6px', textTransform: 'uppercase' }}>Code Snippet</p>
                            <pre style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '12px', fontSize: '11px', overflow: 'auto', fontFamily: 'ui-monospace, monospace', lineHeight: '1.6', margin: 0, color: 'rgb(var(--text-primary))' }}>
                              {finding.snippet}
                            </pre>
                          </div>
                        )}
                        {/* Suggestion */}
                        <div style={{ marginTop: '12px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '8px', padding: '12px' }}>
                          <p style={{ fontSize: '10px', fontWeight: 600, color: '#10B981', margin: '0 0 4px', textTransform: 'uppercase' }}>💡 Suggestion</p>
                          <p style={{ fontSize: '12px', color: 'rgb(var(--text-primary))', margin: 0, fontFamily: 'ui-monospace, monospace', lineHeight: '1.5' }}>{finding.suggestion}</p>
                        </div>
                        {/* Rule ID */}
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(var(--border), 0.5)', color: 'rgb(var(--text-muted))', fontFamily: 'monospace' }}>{finding.ruleId}</span>
                          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>·</span>
                          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', textTransform: 'capitalize' }}>{finding.category}</span>
                          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>·</span>
                          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>Source: {finding.source}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFindings.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}>
                  <CheckCircle style={{ width: '32px', height: '32px', color: '#10B981', marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                    {severityFilter === 'all' ? 'No findings — code looks clean!' : `No ${severityFilter} findings`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Reviews List View ───────────────────────────────────── */}
      {!selectedReview && !loading && tab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reviews.map((review: any) => {
            const color = review.criticalCount > 0 ? '#EF4444' : review.highCount > 0 ? '#F97316' : review.totalFindings > 0 ? '#F59E0B' : '#10B981';
            return (
              <div
                key={review.id}
                onClick={() => loadFindings(review.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px',
                  backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
                  borderLeft: `3px solid ${color}`, borderRadius: '12px',
                  transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                  <Code style={{ width: '16px', height: '16px', color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
                      Review #{review.id.slice(0, 8)}
                    </h3>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${color}15`, color }}>
                      {review.totalFindings === 0 ? 'Clean' : `${review.totalFindings} finding${review.totalFindings > 1 ? 's' : ''}`}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 6px', borderRadius: '9999px', border: '1px solid rgb(var(--border))', color: 'rgb(var(--text-muted))' }}>
                      {review.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>
                    {review.branch && <><GitCommit style={{ width: '11px', height: '11px', display: 'inline', verticalAlign: 'middle' }} /> {review.branch} · </>}
                    {review.filesScanned} files · {review.durationMs}ms
                    {review.commitSha && <> · {review.commitSha.slice(0, 7)}</>}
                  </p>
                  {review.totalFindings > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      {review.criticalCount > 0 && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>{review.criticalCount} Critical</span>}
                      {review.highCount > 0 && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(249,115,22,0.12)', color: '#F97316' }}>{review.highCount} High</span>}
                      {review.mediumCount > 0 && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>{review.mediumCount} Med</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <Clock style={{ width: '12px', height: '12px', color: 'rgb(var(--text-muted))' }} />
                  <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            );
          })}

          {reviews.length === 0 && (
            <div style={{ padding: '60px 40px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px' }}>
              <Code style={{ width: '40px', height: '40px', color: '#818CF8', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 6px' }}>No code reviews yet</h3>
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                Trigger a review via the API or through a pipeline deployment to start scanning your code.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Rules List View ─────────────────────────────────────── */}
      {!selectedReview && !loading && tab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rules.map((rule: any) => {
            const color = severityColors[rule.severity] || '#6B7280';
            const CatIcon = categoryIcons[rule.category] || Eye;
            return (
              <div
                key={rule.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 18px',
                  backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
                  borderLeft: `3px solid ${color}`, borderRadius: '12px',
                }}
              >
                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                  <CatIcon style={{ width: '14px', height: '14px', color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{rule.name}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', backgroundColor: `${color}15`, color, textTransform: 'uppercase' }}>{rule.severity}</span>
                    <span style={{ fontSize: '9px', fontWeight: 500, padding: '2px 6px', borderRadius: '9999px', border: '1px solid rgb(var(--border))', color: 'rgb(var(--text-muted))', textTransform: 'capitalize' }}>{rule.category}</span>
                    {rule.autoFixable && <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '9999px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>AUTO-FIX</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>{rule.message}</p>
                  <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '3px 0 0' }}>
                    <code style={{ fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{rule.id}</code>
                    {' · '}
                    {rule.fileExtensions?.join(', ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
