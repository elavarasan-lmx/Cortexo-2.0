'use client';

import { X, AlertTriangle, Trash2, Info } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const variantConfig = {
  danger:  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  icon: Trash2,        btnBg: '#EF4444' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: AlertTriangle, btnBg: '#F59E0B' },
  info:    { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)', icon: Info,           btnBg: 'rgb(var(--primary))' },
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const cfg = variantConfig[variant];
  const Icon = cfg.icon;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 150ms ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '420px', maxWidth: '90vw',
          borderRadius: '18px',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          animation: 'slideUp 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: '20px', height: '20px', color: cfg.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '16px', fontWeight: 700,
              color: 'rgb(var(--text-primary))', margin: '0 0 6px',
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: '13px', lineHeight: 1.5,
              color: 'rgb(var(--text-secondary))', margin: 0,
            }}>
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgb(var(--text-muted))', padding: '4px',
              borderRadius: '8px', flexShrink: 0,
              transition: 'background-color 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Actions */}
        <div style={{
          padding: '12px 24px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 20px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              color: 'rgb(var(--text-secondary))',
              border: '1px solid rgb(var(--border))',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              color: '#fff',
              backgroundColor: cfg.btnBg,
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: `0 4px 12px ${cfg.color}40`,
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${cfg.color}50`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 12px ${cfg.color}40`; }}
          >
            <Icon style={{ width: '14px', height: '14px' }} />
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
