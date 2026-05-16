'use client';

import { ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Info, Bell } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Notification — individual notification
   ───────────────────────────────────────────────────────────────────────────── */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  /** Auto-dismiss timeout in ms. Default: 5000 */
  duration?: number;
  /** Action button */
  action?: { label: string; onClick: () => void };
  /** Custom icon - can be a ReactNode or Lucide icon component */
  icon?: ReactNode | React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  /** Close callback */
  onClose?: () => void;
}

const TYPE_CONFIG = {
  success: { icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  error:   { icon: XCircle,     color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  info:    { icon: Info,         color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const { type, title, message, action, icon } = notification;
  const config = TYPE_CONFIG[type];
  const Icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }> = icon ? (icon as React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>) : config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 14,
        backgroundColor: 'rgb(var(--surface))',
        border: `1px solid ${config.color}30`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: 320,
        maxWidth: 420,
        pointerEvents: 'auto',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: config.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={16} style={{ color: config.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgb(var(--text-primary))',
        }}>
          {title}
        </div>
        {message && (
          <div style={{
            fontSize: 12,
            color: 'rgb(var(--text-secondary))',
            marginTop: 2,
          }}>
            {message}
          </div>
        )}
        {action && (
          <button
            onClick={action.onClick}
            style={{
              marginTop: 8,
              padding: '4px 10px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: config.color,
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => onDismiss(notification.id)}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 4,
          color: 'rgb(var(--text-muted))',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NotificationContext — global notification state
   ───────────────────────────────────────────────────────────────────────────── */

interface NotificationContextValue {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id'>) => void;
  remove: (id: string) => void;
  clear: () => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────────
   NotificationProvider — wraps the app
   ───────────────────────────────────────────────────────────────────────────── */

interface NotificationProviderProps {
  children: ReactNode;
  /** Position of notifications */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Max notifications to show */
  max?: number;
}

export function NotificationProvider({
  children,
  position = 'top-right',
  max = 5,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = notification.duration ?? 5000;

    setNotifications((prev) => {
      const updated = [...prev, { ...notification, id }].slice(-max);
      return updated;
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, [max]);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = (title: string, message?: string) => add({ type: 'success', title, message });
  const error = (title: string, message?: string) => add({ type: 'error', title, message });
  const warning = (title: string, message?: string) => add({ type: 'warning', title, message });
  const info = (title: string, message?: string) => add({ type: 'info', title, message });

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right':    { top: 20, right: 20 },
    'top-left':     { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left':  { bottom: 20, left: 20 },
    'top-center':   { top: 20, left: '50%', transform: 'translateX(-50%)' },
    'bottom-center':{ bottom: 20, left: '50%', transform: 'translateX(-50%)' },
  };

  return (
    <NotificationContext.Provider value={{ notifications, add, remove, clear, success, error, warning, info }}>
      {children}

      {/* Notification stack */}
      <div style={{
        position: 'fixed',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        ...positionStyles[position],
      }}>
        <AnimatePresence>
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onDismiss={remove}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NotificationStack — standalone component for manual control
   ───────────────────────────────────────────────────────────────────────────── */

interface NotificationStackProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function NotificationStack({
  notifications,
  onDismiss,
  position = 'top-right',
}: NotificationStackProps) {
  if (notifications.length === 0) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right':    { top: 20, right: 20 },
    'top-left':     { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left':  { bottom: 20, left: 20 },
    'top-center':   { top: 20, left: '50%', transform: 'translateX(-50%)' },
    'bottom-center':{ bottom: 20, left: '50%', transform: 'translateX(-50%)' },
  };

  return (
    <div style={{
      position: 'fixed',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...positionStyles[position],
    }}>
      <AnimatePresence>
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NotificationBell — bell icon with unread count
   ───────────────────────────────────────────────────────────────────────────── */

interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  showZero?: boolean;
}

export function NotificationBell({
  count = 0,
  onClick,
  showZero = false,
}: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        padding: 8,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'rgb(var(--text-secondary))',
      }}
    >
      <Bell size={20} />
      {(count > 0 || showZero) && count > 0 && (
        <span style={{
          position: 'absolute',
          top: 2,
          right: 2,
          minWidth: 16,
          height: 16,
          padding: '0 4px',
          borderRadius: 8,
          backgroundColor: 'rgb(var(--danger))',
          color: '#fff',
          fontSize: 10,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}