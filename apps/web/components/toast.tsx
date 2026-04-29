'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type Toast, type ToastType } from '@/lib/toast-store';

const TYPE_CONFIG: Record<ToastType, { icon: typeof CheckCircle; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  error:   { icon: XCircle,     color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  info:    { icon: Info,         color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const [exiting, setExiting] = useState(false);
  const cfg = TYPE_CONFIG[toast.type];
  const Icon = cfg.icon;

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '12px',
        backgroundColor: 'rgb(var(--surface))',
        border: `1px solid ${cfg.color}30`,
        boxShadow: `0 8px 32px -4px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04), inset 0 0 80px -20px ${cfg.bg}`,
        backdropFilter: 'blur(16px)',
        minWidth: '320px',
        maxWidth: '420px',
        animation: exiting ? 'toast-exit 200ms ease-in forwards' : 'toast-enter 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: 'pointer',
        transition: 'transform 150ms, box-shadow 150ms',
      }}
      onClick={handleClose}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: cfg.bg,
      }}>
        <Icon style={{ width: '16px', height: '16px', color: cfg.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{toast.title}</p>
        {toast.message && (
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '2px 0 0', lineHeight: 1.4 }}>{toast.message}</p>
        )}
      </div>
      <button onClick={(e) => { e.stopPropagation(); handleClose(); }} style={{ flexShrink: 0, border: 'none', background: 'none', padding: '2px', cursor: 'pointer', color: 'rgb(var(--text-muted))', opacity: 0.5 }}>
        <X style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
