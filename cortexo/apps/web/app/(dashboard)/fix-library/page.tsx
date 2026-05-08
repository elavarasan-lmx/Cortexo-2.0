'use client';

import { useState, useCallback } from 'react';
import {
  Package, CheckCircle, AlertTriangle, Clock, Target, Filter,
  GitBranch, Play, RotateCcw, Plus, ChevronDown, ChevronUp,
  Sparkles, Zap, Server, FileCode, ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

// ─── Status config ──────────────────────────────────────────────────

const statusMap: Record<string, { color: string; label: string; icon: typeof CheckCircle }> = {
  draft:      { color: '#6B7280', label: 'Draft',      icon: FileCode },
  active:     { color: '#3B82F6', label: 'Active',     icon: Zap },
  deprecated: { color: '#F59E0B', label: 'Deprecated', icon: AlertTriangle },
};

const rolloutStatusMap: Record<string, { color: string; label: string }> = {
  pending:      { color: '#F59E0B', label: 'Pending' },
  applied:      { color: '#10B981', label: 'Applied' },
  failed:       { color: '#EF4444', label: 'Failed' },
  'rolled-back': { color: '#8B5CF6', label: 'Rolled Back' },
  skipped:      { color: '#6B7280', label: 'Skipped' },
};

// ─── Main Page ──────────────────────────────────────────────────────

export default function FixLibraryPage() {
  useAutoLoadToken();
  const { data: recipes, loading, refetch } = useApiData(() => api.request<any>('GET', '/fix-recipes'));
  const { data: stats } = useApiData(() => api.request<any>('GET', '/fix-recipes/stats'));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rollouts, setRollouts] = useState<Record<string, any[]>>({});
  const [propagating, setPropagating] = useState<string | null>(null);

  const items = recipes || [];

  const statCards = [
    { label: 'Total Recipes', value: String(stats?.totalRecipes || items.length), icon: Package, color: '#818CF8' },
    { label: 'Active', value: String(stats?.activeRecipes || items.filter((r: any) => r.status === 'active').length), icon: Zap, color: '#3B82F6' },
    { label: 'Applied', value: String(stats?.totalApplied || 0), icon: CheckCircle, color: '#10B981' },
    { label: 'Success Rate', value: `${stats?.avgSuccessRate || 0}%`, icon: Target, color: '#F59E0B' },
  ];

  // Expand recipe → load its rollouts
  const toggleExpand = useCallback(async (recipeId: string) => {
    const newId = expandedId === recipeId ? null : recipeId;
    setExpandedId(newId);

    if (newId && !rollouts[recipeId]) {
      try {
        const res = await api.request<any>('GET', `/fix-recipes/${recipeId}/rollouts`);
        setRollouts((prev) => ({ ...prev, [recipeId]: res.data || [] }));
      } catch { /* ignore */ }
    }
  }, [expandedId, rollouts]);

  // Propagate recipe
  const handlePropagate = useCallback(async (recipeId: string) => {
    setPropagating(recipeId);
    try {
      await api.request('POST', `/fix-recipes/${recipeId}/propagate`, {});
      // Reload rollouts
      const res = await api.request<any>('GET', `/fix-recipes/${recipeId}/rollouts`);
      setRollouts((prev) => ({ ...prev, [recipeId]: res.data || [] }));
      refetch();
    } catch { /* ignore */ }
    setPropagating(null);
  }, [refetch]);

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} />
            Fix Library
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Reusable fix recipes propagated across all client projects
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

      {/* Recipe List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'rgb(var(--text-muted))' }}>
            <Package style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading fix recipes...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px 20px', border: '2px dashed rgb(var(--border))', borderRadius: '14px', textAlign: 'center',
          }}>
            <Package style={{ width: '36px', height: '36px', color: 'rgb(var(--text-muted))', opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-secondary))', margin: 0 }}>No fix recipes yet</p>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>Create one from a Root Cause fix to start propagating</p>
          </div>
        )}

        {items.map((recipe: any) => {
          const st = statusMap[recipe.status] || statusMap.draft;
          const isExpanded = expandedId === recipe.id;
          const ExpandIcon = isExpanded ? ChevronUp : ChevronDown;
          const recipeRollouts = rollouts[recipe.id] || [];
          const appliedCount = recipeRollouts.filter((r: any) => r.status === 'applied').length;

          return (
            <div key={recipe.id}>
              {/* Main row */}
              <div
                onClick={() => toggleExpand(recipe.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '16px 20px',
                  backgroundColor: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border))',
                  borderLeft: `3px solid ${st.color}`,
                  borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
                  cursor: 'pointer',
                  transition: 'box-shadow 200ms, transform 200ms',
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
                  borderRadius: '10px', backgroundColor: `${st.color}12`, flexShrink: 0,
                }}>
                  <Package style={{ width: '16px', height: '16px', color: st.color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
                      {recipe.title}
                    </p>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px',
                      backgroundColor: `${st.color}15`, color: st.color,
                    }}>{st.label}</span>
                  </div>

                  {recipe.description && (
                    <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '4px 0 0', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {recipe.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Server style={{ width: '11px', height: '11px' }} />
                      {recipe.appliedCount || 0}/{recipe.totalTargets || 0} clients
                    </span>
                    {recipe.affectedFiles?.length > 0 && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileCode style={{ width: '11px', height: '11px' }} />
                          {recipe.affectedFiles.length} files
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>{timeAgo(recipe.createdAt)}</span>
                  </div>
                </div>

                <ExpandIcon style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0, marginTop: '4px' }} />
              </div>

              {/* Expanded: rollout details */}
              {isExpanded && (
                <div style={{
                  backgroundColor: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border))',
                  borderTop: 'none',
                  borderLeft: `3px solid ${st.color}`,
                  borderRadius: '0 0 12px 12px',
                  padding: '16px 20px',
                }}>
                  {/* Affected files */}
                  {recipe.affectedFiles?.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Affected Files</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {recipe.affectedFiles.map((f: string, i: number) => (
                          <span key={i} style={{
                            fontSize: '11px', fontFamily: 'monospace', padding: '3px 10px',
                            borderRadius: '6px', backgroundColor: 'rgba(var(--border), 0.2)',
                            color: 'rgb(var(--text-secondary))',
                          }}>{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rollout progress */}
                  {recipeRollouts.length > 0 && (
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GitBranch style={{ width: '12px', height: '12px' }} />
                        Client Rollouts ({appliedCount}/{recipeRollouts.length})
                      </p>

                      {/* Progress bar */}
                      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(var(--border), 0.3)', marginBottom: '12px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          width: `${recipeRollouts.length > 0 ? (appliedCount / recipeRollouts.length) * 100 : 0}%`,
                          background: 'linear-gradient(90deg, #10B981, #3B82F6)',
                          transition: 'width 300ms',
                        }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {recipeRollouts.map((rollout: any) => {
                          const rs = rolloutStatusMap[rollout.status] || rolloutStatusMap.pending;
                          return (
                            <div key={rollout.id} style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                              borderRadius: '8px', backgroundColor: 'rgba(var(--border), 0.1)',
                            }}>
                              <span style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                backgroundColor: rs.color, flexShrink: 0,
                              }} />
                              <span style={{ flex: 1, fontSize: '12px', color: 'rgb(var(--text-primary))' }}>
                                {rollout.projectName || rollout.clientProjectId.slice(0, 8)}
                              </span>
                              <span style={{
                                fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px',
                                backgroundColor: `${rs.color}15`, color: rs.color,
                              }}>{rs.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', paddingTop: '12px',
                    borderTop: '1px solid rgb(var(--border))',
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePropagate(recipe.id); }}
                      disabled={propagating === recipe.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                        border: 'none', cursor: 'pointer', transition: 'all 200ms',
                        background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                        color: '#fff', opacity: propagating === recipe.id ? 0.6 : 1,
                      }}
                    >
                      <Play style={{ width: '12px', height: '12px' }} />
                      {propagating === recipe.id ? 'Propagating...' : 'Propagate to All'}
                    </button>
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
