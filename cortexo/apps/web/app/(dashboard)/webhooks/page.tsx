'use client';

import { useState } from 'react';
import {
  Webhook, Plus, CheckCircle2, AlertCircle, Globe, Clock,
  Trash2, Edit3, ToggleLeft, ToggleRight, Copy, ExternalLink,
  Zap, XCircle, TrendingUp, Activity, X, CheckCircle,
} from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

/* ── Types ── */
type HookStatus = 'active' | 'paused' | 'failed';

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: HookStatus;
  lastTriggered: string;
  successRate: string;
  totalCalls: number;
  failedCalls: number;
}

/* ── Data ── */
const hooks: WebhookItem[] = [
  { id: '1', name: 'Deploy Notifications', url: 'https://api.slack.com/hooks/deploy-notify', events: ['deploy.success', 'deploy.fail'], status: 'active', lastTriggered: '5m ago', successRate: '98.5%', totalCalls: 1247, failedCalls: 19 },
  { id: '2', name: 'Error Tracker', url: 'https://hooks.zapier.com/cortexo/errors', events: ['error.new', 'error.resolved'], status: 'active', lastTriggered: '1h ago', successRate: '100%', totalCalls: 832, failedCalls: 0 },
  { id: '3', name: 'Critical Alerts', url: 'https://discord.com/api/webhooks/alerts', events: ['alert.critical'], status: 'active', lastTriggered: '3h ago', successRate: '96.2%', totalCalls: 543, failedCalls: 21 },
  { id: '4', name: 'Audit Logger', url: 'https://internal.cortexo.dev/audit', events: ['user.login', 'user.logout', 'settings.change'], status: 'paused', lastTriggered: '2d ago', successRate: '94.8%', totalCalls: 2108, failedCalls: 110 },
  { id: '5', name: 'Billing Events', url: 'https://billing.cortexo.io/events', events: ['subscription.created', 'payment.failed'], status: 'failed', lastTriggered: '12h ago', successRate: '72.1%', totalCalls: 312, failedCalls: 87 },
];

/* ── Styles ── */
const statCard = (accent: string): React.CSSProperties => ({
  flex: 1,
  minWidth: '160px',
  padding: '18px 20px',
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
  position: 'relative',
  overflow: 'hidden',
});

const statAccent = (color: string): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '3px',
  background: `linear-gradient(90deg, ${color}, ${color}80)`,
  borderRadius: '14px 14px 0 0',
});

const statusColors: Record<HookStatus, { color: string; bg: string; label: string }> = {
  active: { color: '#10B981', bg: '#10B98115', label: 'Active' },
  paused: { color: '#F59E0B', bg: '#F59E0B15', label: 'Paused' },
  failed: { color: '#EF4444', bg: '#EF444415', label: 'Failed' },
};

const rowStyle: React.CSSProperties = {
  padding: '18px 20px',
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '12px',
  transition: 'box-shadow 200ms, border-color 200ms',
};

const actionBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'transparent',
  color: 'rgb(var(--text-muted))',
  cursor: 'pointer',
  transition: 'all 200ms',
};

/* ── Component ── */
export default function WebhooksPage() {
  useAutoLoadToken();
  const [copied, setCopied] = useState<string | null>(null);

  const activeCount = hooks.filter(h => h.status === 'active').length;
  const failedCount = hooks.filter(h => h.status === 'failed').length;
  const totalCalls = hooks.reduce((s, h) => s + h.totalCalls, 0);
  const avgSuccess = (hooks.reduce((s, h) => s + parseFloat(h.successRate), 0) / hooks.length).toFixed(1);

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Webhook style={{ width: '22px', height: '22px', color: '#10B981' }} /> Webhooks
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
            Manage outgoing webhook integrations and event subscriptions
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 18px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 2px 8px -2px rgba(16,185,129,0.4)',
          transition: 'transform 150ms, box-shadow 150ms',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Plus style={{ width: '13px', height: '13px' }} /> Add Webhook
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {/* Total Webhooks */}
        <div style={statCard('#6366F1')}>
          <div style={statAccent('#6366F1')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#6366F115', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Webhook style={{ width: '16px', height: '16px', color: '#6366F1' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))' }}>Total</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0, letterSpacing: '-0.5px' }}>{hooks.length}</p>
        </div>

        {/* Active */}
        <div style={statCard('#10B981')}>
          <div style={statAccent('#10B981')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#10B98115', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))' }}>Active</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', margin: 0, letterSpacing: '-0.5px' }}>{activeCount}</p>
        </div>

        {/* Failed */}
        <div style={statCard('#EF4444')}>
          <div style={statAccent('#EF4444')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EF444415', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle style={{ width: '16px', height: '16px', color: '#EF4444' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))' }}>Failed</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#EF4444', margin: 0, letterSpacing: '-0.5px' }}>{failedCount}</p>
        </div>

        {/* Avg Success Rate */}
        <div style={statCard('#3B82F6')}>
          <div style={statAccent('#3B82F6')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#3B82F615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#3B82F6' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))' }}>Success Rate</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#3B82F6', margin: 0, letterSpacing: '-0.5px' }}>{avgSuccess}%</p>
        </div>
      </div>

      {/* ── Webhook List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {hooks.map(h => {
          const st = statusColors[h.status];
          const isCopied = copied === h.id;

          return (
            <div
              key={h.id}
              style={rowStyle}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = `rgba(var(--primary), 0.15)`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgb(var(--border))'; }}
            >
              {/* Row 1: Status + Name + URL + Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {/* Status dot */}
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: st.color, boxShadow: `0 0 8px ${st.color}60`, flexShrink: 0 }} />

                {/* Name */}
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
                  {h.name}
                </span>

                {/* URL */}
                <code style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-muted))', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h.url}
                </code>

                {/* Status badge */}
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.03em', textTransform: 'uppercase',
                  color: st.color, backgroundColor: st.bg, border: `1px solid ${st.color}25`,
                }}>
                  {st.label}
                </span>
              </div>

              {/* Row 2: Events + Meta + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Events */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                  {h.events.map(e => (
                    <span key={e} style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                      backgroundColor: 'rgba(var(--border), 0.15)', color: 'rgb(var(--text-secondary))',
                      border: '1px solid rgba(var(--border), 0.3)',
                    }}>
                      {e}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '11px', height: '11px' }} /> {h.lastTriggered}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity style={{ width: '11px', height: '11px' }} /> {h.totalCalls.toLocaleString()} calls
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: parseFloat(h.successRate) >= 95 ? '#10B981' : parseFloat(h.successRate) >= 80 ? '#F59E0B' : '#EF4444', fontWeight: 600 }}>
                    <TrendingUp style={{ width: '11px', height: '11px' }} /> {h.successRate}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    onClick={() => copyUrl(h.id, h.url)}
                    title="Copy URL"
                    style={{ ...actionBtn, color: isCopied ? '#10B981' : 'rgb(var(--text-muted))', borderColor: isCopied ? 'rgba(16,185,129,0.3)' : 'rgb(var(--border))' }}
                    onMouseEnter={e => { if (!isCopied) { e.currentTarget.style.color = 'rgb(var(--primary))'; e.currentTarget.style.borderColor = 'rgba(var(--primary),0.3)'; } }}
                    onMouseLeave={e => { if (!isCopied) { e.currentTarget.style.color = 'rgb(var(--text-muted))'; e.currentTarget.style.borderColor = 'rgb(var(--border))'; } }}
                  >
                    {isCopied ? <CheckCircle style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                  </button>
                  <button title="Edit" style={actionBtn}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--primary))'; e.currentTarget.style.borderColor = 'rgba(var(--primary),0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-muted))'; e.currentTarget.style.borderColor = 'rgb(var(--border))'; }}
                  >
                    <Edit3 style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button title="Delete" style={{ ...actionBtn, borderColor: 'rgba(239,68,68,0.2)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-muted))'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
