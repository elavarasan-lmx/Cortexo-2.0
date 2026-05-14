'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Shield, Zap, Globe, CheckCircle, XCircle,
  AlertTriangle, Lock, Database, FileWarning, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

const LEVEL_META: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  L1: { label: 'Level 1 — Endpoint + Schema', icon: Globe, color: '#8B5CF6', desc: 'HTTP status codes + JSON schema validation' },
  L2: { label: 'Level 2 — Business Flows', icon: Zap, color: '#F59E0B', desc: 'Multi-step business journey tests' },
  L3: { label: 'Level 3 — Security', icon: Shield, color: '#EF4444', desc: 'Auth bypass, SQL injection, input validation' },
};

const MODULE_LABELS: Record<string, { emoji: string; label: string }> = {
  auth: { emoji: '🔐', label: 'Authentication' },
  rates: { emoji: '📊', label: 'Rate Engine' },
  trading: { emoji: '💰', label: 'Trading & Booking' },
  delivery: { emoji: '📦', label: 'Delivery' },
  margin: { emoji: '💹', label: 'Margin & Funds' },
  kyc: { emoji: '👤', label: 'KYC / Registration' },
  reports: { emoji: '📈', label: 'Reports' },
  notif: { emoji: '🔔', label: 'Notifications' },
  config: { emoji: '⚙️', label: 'Settings & Config' },
  admin: { emoji: '🛡️', label: 'Admin Panel' },
  other: { emoji: '📁', label: 'Other' },
};

const SECURITY_LABELS: Record<string, { label: string; color: string }> = {
  auth_bypass: { label: '🚨 AUTH BYPASS', color: '#EF4444' },
  sql_injection: { label: '💉 SQL INJECTION', color: '#DC2626' },
  sqli_crash: { label: '💥 SQLi CRASH', color: '#B91C1C' },
  input_crash: { label: '💣 INPUT CRASH', color: '#F59E0B' },
  missing_validation: { label: '⚠️ NO VALIDATION', color: '#F97316' },
};

export default function LevelResultsPage({ params }: { params: Promise<{ runId: string }> }) {
  useAutoLoadToken();
  const { runId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTestLevels(Number(runId)).then(res => {
      setData((res as any)?.data || res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [runId]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <Loader2 style={{ width: '32px', height: '32px', color: '#8B5CF6', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!data || !data.levels) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'rgb(var(--text-muted))' }}>
      <p>No level data found for run #{runId}</p>
      <Link href="/testing" style={{ color: 'rgb(var(--primary))' }}>← Back to Testing Hub</Link>
    </div>
  );

  const levels = data.levels;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/testing" style={{ color: 'rgb(var(--text-muted))', display: 'flex' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </Link>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
            Full Suite Results — Run #{runId}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '2px' }}>
            3-Level Bug Detection: Endpoint + Flow + Security
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {Object.entries(LEVEL_META).map(([key, meta]) => {
          const level = levels[key];
          if (!level) return (
            <div key={key} style={{
              padding: '20px', borderRadius: '14px', border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))', opacity: 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <meta.icon style={{ width: '18px', height: '18px', color: meta.color }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: meta.color }}>{meta.label}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Not run</p>
            </div>
          );

          const passRate = level.total > 0 ? Math.round((level.passed / level.total) * 100) : 0;
          return (
            <div key={key} style={{
              padding: '20px', borderRadius: '14px', border: `1px solid ${meta.color}33`,
              backgroundColor: 'rgb(var(--surface))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <meta.icon style={{ width: '18px', height: '18px', color: meta.color }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: meta.color }}>{meta.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                <div className="cx-flex cx-items-center cx-gap-4">
                  <CheckCircle style={{ width: '14px', height: '14px', color: '#10B981' }} />
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>{level.passed}</span>
                </div>
                <div className="cx-flex cx-items-center cx-gap-4">
                  <XCircle style={{ width: '14px', height: '14px', color: '#EF4444' }} />
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#EF4444' }}>{level.failed}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(var(--border), 0.3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${passRate}%`, borderRadius: '3px', backgroundColor: passRate > 80 ? '#10B981' : passRate > 50 ? '#F59E0B' : '#EF4444', transition: 'width 500ms' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>{passRate}% pass rate · {level.total} tests</p>
            </div>
          );
        })}
      </div>

      {/* Detailed Results per Level */}
      {Object.entries(LEVEL_META).map(([key, meta]) => {
        const level = levels[key];
        if (!level) return null;

        return (
          <div key={key} style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: meta.color, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <meta.icon style={{ width: '18px', height: '18px' }} />
              {meta.label}
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontWeight: 500 }}>— {meta.desc}</span>
            </h2>

            {/* Module breakdown */}
            {Object.entries(level.modules || {}).map(([mod, modData]: [string, any]) => {
              const modMeta = MODULE_LABELS[mod] || { emoji: '📁', label: mod };
              const hasFails = modData.failed > 0;

              return (
                <div key={mod} style={{
                  padding: '16px', marginBottom: '8px', borderRadius: '12px',
                  border: hasFails ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgb(var(--border))',
                  backgroundColor: hasFails ? 'rgba(239,68,68,0.03)' : 'rgb(var(--surface))',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasFails ? '10px' : '0' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
                      {modMeta.emoji} {modMeta.label}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>✓ {modData.passed}</span>
                      {modData.failed > 0 && <span style={{ color: '#EF4444', fontWeight: 600 }}>✗ {modData.failed}</span>}
                    </div>
                  </div>

                  {/* Issue details */}
                  {hasFails && modData.issues?.map((issue: any, idx: number) => (
                    <div key={idx} style={{
                      padding: '10px 12px', marginTop: '6px', borderRadius: '8px',
                      backgroundColor: 'rgba(0,0,0,0.15)', fontSize: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                          backgroundColor: issue.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: issue.severity === 'critical' ? '#EF4444' : '#F59E0B',
                          textTransform: 'uppercase',
                        }}>{issue.severity}</span>
                        {issue.securityIssue && SECURITY_LABELS[issue.securityIssue] && (
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                            backgroundColor: `${SECURITY_LABELS[issue.securityIssue].color}20`,
                            color: SECURITY_LABELS[issue.securityIssue].color,
                          }}>{SECURITY_LABELS[issue.securityIssue].label}</span>
                        )}
                        {issue.statusCode && (
                          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>HTTP {issue.statusCode}</span>
                        )}
                        {issue.latencyMs && (
                          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>{issue.latencyMs}ms</span>
                        )}
                      </div>
                      <p style={{ color: 'rgb(var(--text-primary))', margin: '2px 0 0', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                        {issue.endpoint}
                      </p>
                      {issue.schemaErrors && (
                        <p style={{ color: '#F59E0B', margin: '4px 0 0', fontSize: '11px' }}>
                          Schema: {(issue.schemaErrors as string[]).join(', ')}
                        </p>
                      )}
                      {issue.error && (
                        <p style={{ color: '#EF4444', margin: '4px 0 0', fontSize: '11px' }}>{issue.error}</p>
                      )}
                      {issue.responsePreview && (
                        <p style={{ color: 'rgb(var(--text-muted))', margin: '4px 0 0', fontSize: '10px', maxHeight: '40px', overflow: 'hidden' }}>
                          {issue.responsePreview}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
