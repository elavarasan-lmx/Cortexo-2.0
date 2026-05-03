'use client';

import { useState, useEffect } from 'react';
import { Rocket, CheckCircle, XCircle, RotateCcw, TrendingUp, AlertTriangle, Loader2, Play, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';

interface CanaryPhase { percent: number; startedAt: string | null; completedAt: string | null; status: 'pending' | 'active' | 'complete' | 'failed'; }
interface Canary { id: string; deploymentId: string; branch: string; environment: string; currentPhase: number; phases: CanaryPhase[]; status: 'active' | 'completed' | 'rolled_back' | 'failed'; createdAt: string; errorRateBaseline: number; errorRateCurrent: number; autoPromote: boolean; autoRollbackThreshold: number; }

/* ─── Shared Styles ─── */
const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
  padding: '24px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  marginBottom: '6px',
  color: 'rgb(var(--text-muted))',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))',
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 200ms',
};

const phaseColorMap: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'rgb(var(--surface-hover))', text: 'rgb(var(--text-muted))' },
  active: { bg: 'rgba(129, 140, 248, 0.12)', text: '#818CF8' },
  complete: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981' },
  failed: { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444' },
};

function PhaseBar({ phase, isActive }: { phase: CanaryPhase; isActive: boolean }) {
  const colors = phaseColorMap[phase.status] || phaseColorMap.pending;
  return (
    <div style={{
      flex: 1,
      borderRadius: '10px',
      padding: '14px 8px',
      textAlign: 'center',
      backgroundColor: colors.bg,
      border: isActive ? '1.5px solid rgba(129, 140, 248, 0.4)' : '1px solid transparent',
      transition: 'all 200ms',
    }}>
      <p style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0, lineHeight: 1 }}>
        {phase.percent}%
      </p>
      <p style={{
        fontSize: '9px', fontWeight: 700,
        textTransform: 'uppercase' as const, letterSpacing: '0.06em',
        color: colors.text, marginTop: '4px',
      }}>
        {phase.status}
      </p>
    </div>
  );
}

export default function CanaryPage() {
  useAutoLoadToken();
  const toast = useToastStore();
  const [canaries, setCanaries] = useState<Canary[]>([]);
  const [creating, setCreating] = useState(false);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ branch: 'main', environment: 'production', autoPromote: false, autoRollbackThreshold: 5 });

  /* ─── Fetch existing canaries on mount ─── */
  useEffect(() => {
    api.getCanaries().then((res) => {
      const data = (res?.data || res) as unknown as Canary[];
      if (Array.isArray(data)) setCanaries(data);
    }).catch(() => {});
  }, []);

  async function createCanary() {
    setCreating(true);
    try {
      const res = await api.createCanary({ ...form, deploymentId: 'demo-deploy-' + Date.now(), projectId: 'demo-project' });
      const d = (res?.data || res) as unknown as Canary;
      if (d?.id) { setCanaries(p => [d, ...p]); toast.success('Canary Created', 'Phased rollout started.'); }
    } catch (err: unknown) { toast.error('Create Failed', err instanceof Error ? err.message : 'Could not create canary.'); }
    setShowForm(false); setCreating(false);
  }

  async function promote(id: string) {
    setPromoting(id);
    try {
      const res = await api.promoteCanary(id);
      const d = (res?.data || res) as unknown as Canary;
      if (d?.id) { setCanaries(p => p.map(c => c.id === id ? d : c)); toast.success('Promoted', 'Canary advanced to next phase.'); }
    } catch (err: unknown) { toast.error('Promote Failed', err instanceof Error ? err.message : 'Could not promote.'); }
    setPromoting(null);
  }

  async function rollback(id: string) {
    setRollingBack(id);
    try {
      const res = await api.rollbackCanary(id);
      const d = (res?.data || res) as unknown as Canary;
      if (d?.id) { setCanaries(p => p.map(c => c.id === id ? d : c)); toast.warning('Rolled Back', 'Canary deployment rolled back.'); }
    } catch (err: unknown) { toast.error('Rollback Failed', err instanceof Error ? err.message : 'Could not rollback.'); }
    setRollingBack(null);
  }

  const errorOk = (c: Canary) => c.errorRateCurrent <= c.errorRateBaseline * 1.1;

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Canary Deployments</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Phased rollout: 5% → 25% → 100% with auto-rollback on error spikes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600, color: '#fff',
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
            transition: 'all 200ms',
          }}
        >
          <Rocket style={{ width: '14px', height: '14px' }} /> New Canary
        </button>
      </div>

      {/* ─── Create Form ─── */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 16px 0' }}>
            Configure Canary Deployment
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Branch</label>
              <input
                value={form.branch}
                onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Environment</label>
              <select
                value={form.environment}
                onChange={e => setForm(p => ({ ...p, environment: e.target.value }))}
                style={{ ...inputStyle, appearance: 'auto' as any }}
              >
                <option>production</option>
                <option>staging</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Auto-rollback threshold (% error spike)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.autoRollbackThreshold}
                onChange={e => setForm(p => ({ ...p, autoRollbackThreshold: +e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
              <div
                onClick={() => setForm(p => ({ ...p, autoPromote: !p.autoPromote }))}
                style={{
                  width: '20px', height: '20px', borderRadius: '6px',
                  border: form.autoPromote ? '2px solid rgb(var(--primary))' : '2px solid rgb(var(--border))',
                  backgroundColor: form.autoPromote ? 'rgb(var(--primary))' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 200ms', flexShrink: 0,
                }}
              >
                {form.autoPromote && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <label style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', cursor: 'pointer' }}
                onClick={() => setForm(p => ({ ...p, autoPromote: !p.autoPromote }))}>
                Auto-promote phases (experimental)
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 500,
                border: '1px solid rgb(var(--border))',
                backgroundColor: 'transparent',
                color: 'rgb(var(--text-secondary))',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={createCanary}
              disabled={creating}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600, color: '#fff',
                border: 'none', cursor: creating ? 'wait' : 'pointer',
                backgroundColor: 'rgb(var(--primary))',
                opacity: creating ? 0.6 : 1,
              }}
            >
              {creating && <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
              Start Canary
            </button>
          </div>
        </div>
      )}

      {/* ─── Canary List / Empty State ─── */}
      {canaries.length === 0 && !showForm ? (
        <div style={{
          ...cardStyle,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <Rocket style={{ width: '48px', height: '48px', color: 'rgb(var(--text-muted))', opacity: 0.25, margin: '0 auto 16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
            No canary deployments yet
          </p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>
            Click "New Canary" to start a phased rollout
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {canaries.map(c => {
            const statusColor = c.status === 'active' ? '#818CF8'
              : c.status === 'completed' ? '#10B981'
              : '#EF4444';
            const statusBg = c.status === 'active' ? 'rgba(129, 140, 248, 0.1)'
              : c.status === 'completed' ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(239, 68, 68, 0.1)';
            const borderColor = c.status === 'active' ? 'rgba(129, 140, 248, 0.25)'
              : c.status === 'completed' ? 'rgba(16, 185, 129, 0.25)'
              : 'rgba(239, 68, 68, 0.25)';

            return (
              <div key={c.id} style={{ ...cardStyle, borderColor }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
                        {c.branch} → {c.environment}
                      </span>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '10px', fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        backgroundColor: statusBg, color: statusColor,
                      }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '12px' }}>
                      <span style={{ color: 'rgb(var(--text-muted))' }}>
                        Error baseline: {(c.errorRateBaseline * 100).toFixed(2)}%
                      </span>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        color: errorOk(c) ? '#10B981' : '#EF4444',
                      }}>
                        {errorOk(c)
                          ? <CheckCircle style={{ width: '12px', height: '12px' }} />
                          : <AlertTriangle style={{ width: '12px', height: '12px' }} />}
                        Current: {(c.errorRateCurrent * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  {c.status === 'active' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => promote(c.id)}
                        disabled={promoting === c.id || c.currentPhase >= c.phases.length}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '6px 14px', borderRadius: '8px',
                          fontSize: '11px', fontWeight: 600,
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          cursor: 'pointer',
                        }}
                      >
                        {promoting === c.id
                          ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                          : <ChevronRight style={{ width: '12px', height: '12px' }} />}
                        Promote
                      </button>
                      <button
                        onClick={() => rollback(c.id)}
                        disabled={rollingBack === c.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '6px 14px', borderRadius: '8px',
                          fontSize: '11px', fontWeight: 600,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          cursor: 'pointer',
                        }}
                      >
                        {rollingBack === c.id
                          ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                          : <RotateCcw style={{ width: '12px', height: '12px' }} />}
                        Rollback
                      </button>
                    </div>
                  )}
                </div>

                {/* Phase progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {c.phases.map((phase, i) => (
                    <PhaseBar key={i} phase={phase} isActive={c.currentPhase === i && c.status === 'active'} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
