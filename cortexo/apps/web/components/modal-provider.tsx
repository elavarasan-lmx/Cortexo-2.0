'use client';
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface AlertOptions {
  title?: string;
  message: string;
  variant?: 'error' | 'success' | 'info';
}

interface ModalContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions) => Promise<void>;
}

// ─── Context ────────────────────────────────────────────────────────────────

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

// ─── Colors ─────────────────────────────────────────────────────────────────

const variantColors = {
  danger:  { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '#EF4444', btn: '#EF4444' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: '#F59E0B', btn: '#F59E0B' },
  info:    { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)', icon: '#3B82F6', btn: '#3B82F6' },
  error:   { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)', icon: '#EF4444', btn: '#EF4444' },
  success: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)', icon: '#10B981', btn: '#10B981' },
};

// ─── Provider ───────────────────────────────────────────────────────────────

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{
    type: 'confirm' | 'alert';
    options: ConfirmOptions | AlertOptions;
    resolve: (value: any) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModal({ type: 'confirm', options, resolve });
    });
  }, []);

  const showAlert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setModal({ type: 'alert', options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (modal) {
      modal.resolve(modal.type === 'confirm' ? result : undefined);
      setModal(null);
    }
  };

  const variant = modal?.options
    ? ('variant' in modal.options ? modal.options.variant : 'info') || 'info'
    : 'info';
  const colors = variantColors[variant as keyof typeof variantColors] || variantColors.info;

  return (
    <ModalContext.Provider value={{ confirm, showAlert }}>
      {children}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            animation: 'fadeIn 150ms ease',
          }}
          onClick={() => handleClose(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '420px', borderRadius: '16px',
              backgroundColor: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              animation: 'slideUp 200ms ease',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px',
              display: 'flex', alignItems: 'flex-start', gap: '14px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                backgroundColor: colors.bg, border: `1px solid ${colors.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle style={{ width: '18px', height: '18px', color: colors.icon }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '15px', fontWeight: 700, margin: 0,
                  color: 'rgb(var(--text-primary))',
                }}>
                  {modal.options.title || (modal.type === 'confirm' ? 'Confirm Action' : 'Notice')}
                </h3>
                <p style={{
                  fontSize: '13px', margin: '6px 0 0', lineHeight: 1.5,
                  color: 'rgb(var(--text-secondary))',
                }}>
                  {modal.options.message}
                </p>
              </div>
              <button
                onClick={() => handleClose(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgb(var(--text-muted))', padding: '4px', flexShrink: 0,
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 24px 20px',
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
            }}>
              {modal.type === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  style={{
                    padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                    border: '1px solid rgb(var(--border))', backgroundColor: 'transparent',
                    color: 'rgb(var(--text-secondary))', cursor: 'pointer',
                    transition: 'background-color 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {(modal.options as ConfirmOptions).cancelText || 'Cancel'}
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                style={{
                  padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                  border: 'none', cursor: 'pointer', color: '#fff',
                  backgroundColor: colors.btn,
                  boxShadow: `0 2px 8px ${colors.btn}40`,
                  transition: 'opacity 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {modal.type === 'confirm'
                  ? (modal.options as ConfirmOptions).confirmText || 'Confirm'
                  : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </ModalContext.Provider>
  );
}
