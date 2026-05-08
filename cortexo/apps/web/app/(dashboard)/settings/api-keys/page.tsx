'use client';

import { useState } from 'react';
import {
  Key, Copy, Eye, EyeOff, Plus, Trash2, Check,
  Shield, Clock, AlertTriangle, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

/* ── Design tokens ── */
const card: React.CSSProperties = {
  borderRadius: '14px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))',
  overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: 'rgb(var(--text-muted))',
  margin: '0 0 2px',
};

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
  useAutoLoadToken();

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔑 API Keys
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>
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
        <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
          <strong>Security:</strong> Never share API keys publicly. Rotate keys regularly and use the minimum permissions needed.
        </p>
      </div>

      {/* Empty State */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))',
        padding: '80px 32px', textAlign: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(124,58,237,0.04))',
        }}>
          <Key style={{ width: '28px', height: '28px', color: '#7C3AED', opacity: 0.8 }} />
        </div>
        <div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
            No API keys yet
          </p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Generate your first API key to integrate with CI/CD pipelines and external tools.
          </p>
        </div>
      </div>
    </div>
  );
}
