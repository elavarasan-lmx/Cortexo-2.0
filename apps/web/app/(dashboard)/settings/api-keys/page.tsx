'use client';

import { useState } from 'react';
import {
  Key, Copy, Eye, EyeOff, Plus, Trash2, Check,
  Shield, Clock, AlertTriangle,
} from 'lucide-react';

/* ── Design tokens ── */
const card: React.CSSProperties = {
  borderRadius: '14px',
  border: '1px solid #E5E7EB',
  backgroundColor: '#FFFFFF',
  overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: '#94A3B8',
  margin: '0 0 2px',
};

/* ── Demo keys ── */
const demoKeys = [
  {
    id: 1,
    name: 'Production API',
    key: 'ctx_prod_sk_7c3aed9f8b2a1d4e6f0c3b5a8d9e2f1c',
    prefix: 'ctx_prod_sk_',
    created: '2025-03-15',
    lastUsed: '2 min ago',
    status: 'active' as const,
    permissions: ['read', 'write', 'deploy'],
    requests: '1.2M',
  },
  {
    id: 2,
    name: 'CI/CD Pipeline',
    key: 'ctx_cicd_sk_4b8f2a1d6e9c3f0b5a7d8e2c1f4a6b9d',
    prefix: 'ctx_cicd_sk_',
    created: '2025-04-02',
    lastUsed: '15 min ago',
    status: 'active' as const,
    permissions: ['read', 'deploy'],
    requests: '340K',
  },
  {
    id: 3,
    name: 'Monitoring Readonly',
    key: 'ctx_mon_ro_2d9e1f4c6b8a3f0d5c7a9b2e1d4f6c8a',
    prefix: 'ctx_mon_ro_',
    created: '2025-04-10',
    lastUsed: '1h ago',
    status: 'active' as const,
    permissions: ['read'],
    requests: '89K',
  },
  {
    id: 4,
    name: 'Deprecated Test Key',
    key: 'ctx_test_sk_0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d',
    prefix: 'ctx_test_sk_',
    created: '2025-01-20',
    lastUsed: '30d ago',
    status: 'expired' as const,
    permissions: ['read', 'write'],
    requests: '12K',
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  expired: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
  revoked: { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
};

const permColors: Record<string, { bg: string; text: string }> = {
  read: { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  write: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  deploy: { bg: 'rgba(124,58,237,0.1)', text: '#7C3AED' },
};

export default function ApiKeysPage() {
  const [showKey, setShowKey] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  function handleCopy(id: number, key: string) {
    navigator.clipboard.writeText(key).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const activeKeys = demoKeys.filter((k) => k.status === 'active').length;
  const totalRequests = '1.63M';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔑 API Keys
          </h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0' }}>
            Manage API keys for external integrations and CI/CD
          </p>
        </div>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}
        >
          <Plus style={{ width: '14px', height: '14px' }} /> Generate New Key
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Keys', value: demoKeys.length, color: '#7C3AED', icon: Key },
          { label: 'Active Keys', value: activeKeys, color: '#10B981', icon: Shield },
          { label: 'Total Requests', value: totalRequests, color: '#3B82F6', icon: Clock },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
            </div>
            <div>
              <p style={labelStyle}>{s.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Banner */}
      <div style={{
        ...card,
        padding: '12px 18px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(245,158,11,0.04)',
        borderColor: 'rgba(245,158,11,0.2)',
      }}>
        <AlertTriangle style={{ width: '16px', height: '16px', color: '#F59E0B', flexShrink: 0 }} />
        <p style={{ fontSize: '12px', color: '#92400E', margin: 0 }}>
          <strong>Security:</strong> Never share API keys publicly. Rotate keys regularly and use the minimum permissions needed.
        </p>
      </div>

      {/* Keys List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {demoKeys.map((k) => {
          const st = statusColors[k.status] || statusColors.expired;
          const isVisible = showKey === k.id;
          const isCopied = copied === k.id;

          return (
            <div key={k.id} style={{ ...card, padding: '18px 20px' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: `${st.text}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Key style={{ width: '16px', height: '16px', color: st.text }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', margin: 0 }}>{k.name}</h3>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0' }}>Created {k.created}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                    backgroundColor: st.bg, color: st.text, textTransform: 'capitalize',
                  }}>
                    {k.status}
                  </span>
                  <button
                    onClick={() => {/* revoke/delete placeholder */}}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                      backgroundColor: 'rgba(239,68,68,0.06)', cursor: 'pointer',
                      color: '#EF4444', transition: 'all 180ms',
                    }}
                    title="Revoke Key"
                  >
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              </div>

              {/* Key display */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '10px',
                backgroundColor: 'rgb(var(--surface-hover))', border: '1px solid rgb(var(--border))',
                marginBottom: '12px',
              }}>
                <code style={{
                  flex: 1, fontSize: '12px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: '#475569', letterSpacing: '0.02em', wordBreak: 'break-all',
                }}>
                  {isVisible ? k.key : `${k.prefix}${'•'.repeat(24)}`}
                </code>
                <button
                  onClick={() => setShowKey(isVisible ? null : k.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                    backgroundColor: '#E5E7EB', cursor: 'pointer', color: '#64748B',
                  }}
                  title={isVisible ? 'Hide key' : 'Show key'}
                >
                  {isVisible
                    ? <EyeOff style={{ width: '12px', height: '12px' }} />
                    : <Eye style={{ width: '12px', height: '12px' }} />}
                </button>
                <button
                  onClick={() => handleCopy(k.id, k.key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                    backgroundColor: isCopied ? '#10B981' : '#E5E7EB',
                    cursor: 'pointer',
                    color: isCopied ? '#fff' : '#64748B',
                    transition: 'all 200ms',
                  }}
                  title="Copy key"
                >
                  {isCopied
                    ? <Check style={{ width: '12px', height: '12px' }} />
                    : <Copy style={{ width: '12px', height: '12px' }} />}
                </button>
              </div>

              {/* Bottom row: permissions + usage */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {k.permissions.map((p) => {
                    const pc = permColors[p] || permColors.read;
                    return (
                      <span key={p} style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                        backgroundColor: pc.bg, color: pc.text, textTransform: 'uppercase',
                      }}>
                        {p}
                      </span>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#94A3B8' }}>
                  <span>Last used: <strong style={{ color: '#64748B' }}>{k.lastUsed}</strong></span>
                  <span>Requests: <strong style={{ color: '#64748B' }}>{k.requests}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
