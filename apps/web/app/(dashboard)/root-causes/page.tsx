'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, Brain, CheckCircle, AlertTriangle, Clock, Lightbulb,
  ThumbsUp, ThumbsDown, ArrowUpRight, Sparkles, Target, Filter,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

const statusMap: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  confirmed:  { icon: CheckCircle,    color: '#10B981', label: 'Confirmed' },
  pending:    { icon: Clock,          color: '#F59E0B', label: 'Pending' },
  rejected:   { icon: ThumbsDown,     color: '#EF4444', label: 'Rejected' },
  analyzing:  { icon: Brain,          color: '#818CF8', label: 'Analyzing' },
};

const confidenceColor = (c: number) =>
  c >= 80 ? '#10B981' : c >= 50 ? '#F59E0B' : '#EF4444';

export default function RootCausesPage() {
  useAutoLoadToken();
  const { data: rootCauses, loading } = useApiData(() => api.getRootCauses());
  const [activeFilter, setActiveFilter] = useState('all');

  const items = rootCauses || [];
  const filtered = activeFilter === 'all'
    ? items
    : items.filter((r: any) => r.status === activeFilter);

  const totalCount = items.length;
  const confirmedCount = items.filter((r: any) => r.status === 'confirmed').length;
  const avgConfidence = totalCount > 0
    ? Math.round(items.reduce((s: number, r: any) => s + (r.confidence || 0), 0) / totalCount)
    : 0;
  const pendingCount = items.filter((r: any) => r.status === 'pending').length;

  const statCards = [
    { label: 'Total Analyses', value: String(totalCount), icon: Brain, color: '#818CF8' },
    { label: 'Confirmed', value: String(confirmedCount), icon: CheckCircle, color: '#10B981' },
    { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: Target, color: '#3B82F6' },
    { label: 'Pending Review', value: String(pendingCount), icon: Clock, color: '#F59E0B' },
  ];

  const filters = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'confirmed', label: 'Confirmed', count: confirmedCount },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'rejected', label: 'Rejected', count: items.filter((r: any) => r.status === 'rejected').length },
    { key: 'analyzing', label: 'Analyzing', count: items.filter((r: any) => r.status === 'analyzing').length },
  ];

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
            AI-powered analysis of error root causes and suggested fixes
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
          return (
            <div
              key={rca.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px',
                padding: '16px 20px',
                backgroundColor: 'rgb(var(--surface))',
                border: '1px solid rgb(var(--border))',
                borderLeft: `3px solid ${st.color}`,
                borderRadius: '12px',
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
                    {rca.summary || 'Untitled Analysis'}
                  </p>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px',
                    backgroundColor: `${st.color}15`, color: st.color,
                  }}>{st.label}</span>
                </div>

                {rca.explanation && (
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '6px 0 0', lineHeight: 1.5,
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                  }}>
                    {rca.explanation}
                  </p>
                )}

                {rca.suggestedFix && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px',
                    padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                  }}>
                    <Lightbulb style={{ width: '13px', height: '13px', color: '#10B981', marginTop: '1px', flexShrink: 0 }} />
                    <p style={{ fontSize: '11px', color: '#10B981', margin: 0, lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                    }}>
                      {rca.suggestedFix}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Target style={{ width: '11px', height: '11px' }} />
                    Confidence: <span style={{ fontWeight: 600, color: confidenceColor(conf) }}>{conf}%</span>
                  </span>
                  <span>•</span>
                  <span>{timeAgo(rca.createdAt)}</span>
                </div>
              </div>

              <ArrowUpRight style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0, marginTop: '4px' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
