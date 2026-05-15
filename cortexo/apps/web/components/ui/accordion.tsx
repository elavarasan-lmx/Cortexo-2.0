'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Accordion — collapsible sections
   ───────────────────────────────────────────────────────────────────────────── */

interface AccordionItem {
  id: string;
  title: string;
  /** Icon before title */
  icon?: ReactNode;
  /** Content panel */
  content: ReactNode;
  /** Disable toggle */
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple open at once */
  multiple?: boolean;
  /** Initially open items */
  defaultOpen?: string[];
  /** Called when item toggles */
  onChange?: (itemId: string, isOpen: boolean) => void;
}

export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  onChange,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(multiple ? prev : []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onChange?.(id, next.has(id));
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div
            key={item.id}
            style={{
              backgroundColor: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: item.disabled ? 'default' : 'pointer',
                textAlign: 'left',
              }}
            >
              {item.icon && <span style={{ display: 'flex', opacity: 0.6 }}>{item.icon}</span>}
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'rgb(var(--text-primary))' }}>
                {item.title}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} style={{ color: 'rgb(var(--text-muted))' }} />
              </motion.div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgb(var(--border))' }}>
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Alert — inline alert/banner messages
   ───────────────────────────────────────────────────────────────────────────── */

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  /** Optional action button */
  action?: ReactNode;
  /** Optional close button */
  onClose?: () => void;
  /** Show icon. Default: true */
  showIcon?: boolean;
}

const ALERT_CONFIG = {
  info:    { icon: 'ℹ️', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)', color: '#3B82F6' },
  success: { icon: '✓', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', color: '#10B981' },
  warning: { icon: '⚠️', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', color: '#F59E0B' },
  error:   { icon: '✕', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', color: '#EF4444' },
};

export function Alert({
  type = 'info',
  title,
  children,
  action,
  onClose,
  showIcon = true,
}: AlertProps) {
  const config = ALERT_CONFIG[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
      }}
    >
      {showIcon && (
        <span style={{ fontSize: 16, lineHeight: 1 }}>{config.icon}</span>
      )}
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: 4 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 13, color: 'rgb(var(--text-secondary))' }}>
          {children}
        </div>
      </div>
      {action && <div>{action}</div>}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 4,
            opacity: 0.5,
          }}
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ConfirmDialog — confirmation modal for destructive actions
   ───────────────────────────────────────────────────────────────────────────── */

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  /** Confirm button text. Default: 'Confirm' */
  confirmText?: string;
  /** Cancel button text. Default: 'Cancel' */
  cancelText?: string;
  /** Confirm button variant */
  variant?: 'primary' | 'danger';
  /** Icon above title */
  icon?: ReactNode;
  /** Called when confirmed */
  onConfirm?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  icon,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={() => onOpenChange(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'rgb(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          maxWidth: 400,
          width: '90%',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {icon && (
          <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>
            {icon}
          </div>
        )}
        <div style={{ fontSize: 16, fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: 'rgb(var(--text-secondary))', marginBottom: 20 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgb(var(--border))',
              backgroundColor: 'transparent',
              color: 'rgb(var(--text-primary))',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onOpenChange(false);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: variant === 'danger' ? 'rgb(var(--danger))' : 'rgb(var(--primary))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SidePanel — slide-in drawer panel
   ───────────────────────────────────────────────────────────────────────────── */

interface SidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** Panel position */
  position?: 'left' | 'right';
  /** Panel width. Default: 400 */
  width?: number;
  /** Show close button */
  showClose?: boolean;
  /** Footer with actions */
  footer?: ReactNode;
}

export function SidePanel({
  open,
  onOpenChange,
  title,
  children,
  position = 'right',
  width = 400,
  showClose = true,
  footer,
}: SidePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 9998,
            }}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: position === 'right' ? width : -width }}
            animate={{ x: 0 }}
            exit={{ x: position === 'right' ? width : -width }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              [position]: 0,
              width,
              backgroundColor: 'rgb(var(--surface))',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgb(var(--border))',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
                {title}
              </span>
              {showClose && (
                <button
                  onClick={() => onOpenChange(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 4,
                    color: 'rgb(var(--text-muted))',
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {children}
            </div>
            {/* Footer */}
            {footer && (
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid rgb(var(--border))',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NotificationToast — positioned toast notification (not the same as toasts)
   ───────────────────────────────────────────────────────────────────────────── */

interface NotificationToastProps {
  show: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  onClose?: () => void;
  /** Auto close after ms. Default: 5000 */
  autoClose?: number;
}

export function NotificationToast({
  show,
  type = 'info',
  title,
  message,
  onClose,
  autoClose = 5000,
}: NotificationToastProps) {
  useState(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  });

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 360,
        backgroundColor: 'rgb(var(--surface))',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgb(var(--border))',
        padding: 16,
        zIndex: 10000,
      }}
    >
      <Alert type={type} title={title} onClose={onClose}>
        {message}
      </Alert>
    </motion.div>
  );
}