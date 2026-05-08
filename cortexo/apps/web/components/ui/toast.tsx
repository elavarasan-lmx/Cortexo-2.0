'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ─── Types ─── */
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  dismissing?: boolean;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

/* ─── Config ─── */
const config: Record<ToastType, { bg: string; icon: typeof CheckCircle2; label: string }> = {
  success: { bg: '#22C55E', icon: CheckCircle2, label: '✓' },
  error:   { bg: '#EF4444', icon: XCircle,      label: '✕' },
  warning: { bg: '#F59E0B', icon: AlertTriangle, label: '⚠' },
  info:    { bg: '#3B82F6', icon: Info,          label: 'ℹ' },
};

/* ─── Context ─── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

/* ─── Single Toast Component ─── */
function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const c = config[t.type];
  const Icon = c.icon;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 18px', borderRadius: '12px',
        backgroundColor: c.bg, color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        minWidth: '340px', maxWidth: '420px',
        animation: t.dismissing ? 'toastOut 300ms ease-in forwards' : 'toastIn 300ms ease-out forwards',
        cursor: 'pointer', userSelect: 'none',
        fontFamily: "'Inter', sans-serif",
      }}
      onClick={() => onDismiss(t.id)}
    >
      <Icon style={{ width: '20px', height: '20px', flexShrink: 0, opacity: 0.95 }} />
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, lineHeight: 1.4 }}>{t.message}</span>
      <X style={{ width: '16px', height: '16px', opacity: 0.7, flexShrink: 0 }} />
    </div>
  );
}

/* ─── Provider ─── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, dismissing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const contextValue: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info:    (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
          display: 'flex', flexDirection: 'column', gap: '10px',
          pointerEvents: 'none',
        }}>
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(100px) scale(0.95); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
