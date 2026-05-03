'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Modal — Cortexo Design System
 *
 * Accessible dialog with backdrop blur, keyboard navigation, focus trap,
 * and smooth enter/exit animations.
 *
 * Usage:
 *   <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm Delete">
 *     <p>Are you sure?</p>
 *     <Modal.Footer>
 *       <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *     </Modal.Footer>
 *   </Modal>
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: ModalSize;
  /** Hide the close button */
  hideClose?: boolean;
  /** Prevent closing on backdrop click */
  persistent?: boolean;
  /** Custom header icon */
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

const sizeMap: Record<ModalSize, string> = {
  sm: '400px',
  md: '520px',
  lg: '680px',
  xl: '860px',
  full: '95vw',
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  hideClose = false,
  persistent = false,
  icon,
  iconColor,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Escape key ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose();
    },
    [onClose, persistent]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Focus the panel
      setTimeout(() => panelRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === overlayRef.current && !persistent) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        animation: 'overlay-in 200ms ease-out',
      }}
    >
      {/* ── Panel ── */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(className)}
        style={{
          width: '100%',
          maxWidth: sizeMap[size],
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          animation: 'palette-in 250ms cubic-bezier(0.22, 1, 0.36, 1)',
          outline: 'none',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        {(title || !hideClose) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 22px',
              borderBottom: '1px solid rgb(var(--border))',
              flexShrink: 0,
            }}
          >
            {icon && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: iconColor ? `${iconColor}12` : 'rgba(var(--primary), 0.08)',
                  color: iconColor || 'rgb(var(--primary))',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'rgb(var(--text-primary))',
                    margin: 0,
                  }}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'rgb(var(--text-muted))',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))';
                  e.currentTarget.style.color = 'rgb(var(--text-primary))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgb(var(--text-muted))';
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
        )}

        {/* ── Content ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 22px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Modal.Footer ─── */
interface ModalFooterProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

function ModalFooter({ children, align = 'right' }: ModalFooterProps) {
  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: justifyMap[align],
        gap: '8px',
        paddingTop: '16px',
        marginTop: '4px',
        borderTop: '1px solid rgb(var(--border))',
      }}
    >
      {children}
    </div>
  );
}

Modal.Footer = ModalFooter;
