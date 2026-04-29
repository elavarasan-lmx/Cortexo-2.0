'use client';

import { useState } from 'react';
import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  Code2, Database, Shield, Layers,
  FileCode, Wrench, ArrowRight, BookOpen,
} from 'lucide-react';

/* ─── Data ─── */
const PHP_DEPRECATIONS: { id: string; category: string; icon: any; title: string; risk: string; affectedFiles: number; effort: string; color: string; changes: { issue: string; fix: string; example: string }[] }[] = [];

/* ─── Risk config ─── */
const riskCfg: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   label: 'Critical' },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  label: 'High'     },
  medium:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: 'Medium'   },
  low:      { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  label: 'Low'      },
};

const effortCfg: Record<string, { color: string; bg: string }> = {
  high:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
  medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  low:    { color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
};

export default function DeprecationPage() {
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible       = PHP_DEPRECATIONS.filter(d => !dismissed.has(d.id));
  const totalFiles    = visible.reduce((s, d) => s + d.affectedFiles, 0);
  const criticalCount = visible.filter(d => d.risk === 'critical').length;

  const statCards = [
    { label: 'Migration Paths', value: visible.length,  color: '#818CF8', bg: 'rgba(129,140,248,0.1)',  border: 'rgba(129,140,248,0.2)' },
    { label: 'Affected Files',  value: totalFiles,       color: '#F97316', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.2)'  },
    { label: 'Critical Issues', value: criticalCount,    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)'   },
    { label: 'Dismissed',       value: dismissed.size,   color: '#10B981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)'  },
  ];

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
          Deprecation Engine
        </h1>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
          Migration planner for PHP version upgrades, framework migrations, and deprecated API usage
        </p>
      </div>

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            borderRadius: '14px', padding: '16px 20px',
            backgroundColor: s.bg, border: `1px solid ${s.border}`,
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Migration cards ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visible.map(dep => {
          const risk    = riskCfg[dep.risk];
          const effort  = effortCfg[dep.effort];
          const isOpen  = expanded === dep.id;
          const Icon    = dep.icon;

          return (
            <div key={dep.id} style={{
              borderRadius: '14px', overflow: 'hidden',
              backgroundColor: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderLeft: `4px solid ${dep.color}`,
            }}>
              {/* Header row */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', cursor: 'pointer', transition: 'background-color 150ms' }}
                onClick={() => setExpanded(isOpen ? null : dep.id)}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Icon box */}
                <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px', backgroundColor: `${dep.color}15`, border: `1px solid ${dep.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '18px', height: '18px', color: dep.color }} />
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title + badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>
                      {dep.title}
                    </span>
                    {/* Risk badge */}
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: risk.bg, color: risk.color, border: `1px solid ${risk.color}30` }}>
                      {risk.label}
                    </span>
                    {/* Effort badge */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, backgroundColor: effort.bg, color: effort.color }}>
                      <Wrench style={{ width: '9px', height: '9px' }} />
                      Effort: {dep.effort}
                    </span>
                  </div>
                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileCode style={{ width: '11px', height: '11px' }} />
                      {dep.affectedFiles} files affected
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen style={{ width: '11px', height: '11px' }} />
                      {dep.changes.length} changes
                    </span>
                    <span style={{
                      padding: '1px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                      backgroundColor: 'rgba(var(--border),0.4)', color: 'rgb(var(--text-muted))',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {dep.category}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setDismissed(s => new Set([...s, dep.id])); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                      fontSize: '11px', fontWeight: 600,
                      backgroundColor: 'rgba(16,185,129,0.08)', color: '#10B981',
                      transition: 'background-color 150ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)'; }}
                  >
                    <CheckCircle style={{ width: '11px', height: '11px' }} /> Dismiss
                  </button>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: 'rgba(var(--border),0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(var(--text-muted))', transition: 'all 150ms' }}>
                    {isOpen
                      ? <ChevronDown style={{ width: '14px', height: '14px' }} />
                      : <ChevronRight style={{ width: '14px', height: '14px' }} />}
                  </div>
                </div>
              </div>

              {/* ─── Expanded change list ─── */}
              {isOpen && (
                <div style={{ borderTop: '1px solid rgb(var(--border))', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dep.changes.map((change, i) => (
                    <div key={i} style={{
                      borderRadius: '10px', overflow: 'hidden',
                      border: '1px solid rgb(var(--border))',
                      borderLeft: `3px solid ${dep.color}50`,
                      backgroundColor: 'rgba(var(--border),0.06)',
                    }}>
                      <div style={{ padding: '12px 14px' }}>
                        {/* Issue */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '7px' }}>
                          <div style={{ width: '20px', height: '20px', flexShrink: 0, borderRadius: '5px', backgroundColor: risk.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                            <AlertTriangle style={{ width: '11px', height: '11px', color: risk.color }} />
                          </div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{change.issue}</p>
                        </div>
                        {/* Fix */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ width: '20px', height: '20px', flexShrink: 0, borderRadius: '5px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                            <CheckCircle style={{ width: '11px', height: '11px', color: '#10B981' }} />
                          </div>
                          <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.5 }}>{change.fix}</p>
                        </div>
                        {/* Example code */}
                        <pre style={{
                          margin: 0, padding: '8px 12px', borderRadius: '7px',
                          fontSize: '11px', lineHeight: 1.7, overflowX: 'auto',
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          backgroundColor: 'rgba(var(--border),0.25)',
                          color: dep.color,
                          borderLeft: `2px solid ${dep.color}40`,
                        }}>
                          {change.example}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {visible.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
            padding: '60px 24px', textAlign: 'center', borderRadius: '14px',
            border: '1px dashed rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle style={{ width: '24px', height: '24px', color: '#10B981' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>All deprecations dismissed</p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No active migration paths remaining</p>
          </div>
        )}
      </div>
    </div>
  );
}
