'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Rocket, Server, Bug, Shield, Clock, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'deploy' | 'alert' | 'bug' | 'security' | 'info';
  title: string;
  time: string;
  read: boolean;
}

const typeConfig: Record<string, { color: string; bg: string; icon: typeof Rocket }> = {
  deploy:   { color: '#10B981', bg: 'rgba(16,185,129,0.06)', icon: Rocket },
  alert:    { color: '#EF4444', bg: 'rgba(239,68,68,0.06)', icon: Server },
  bug:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', icon: Bug },
  security: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)', icon: Shield },
  info:     { color: '#3B82F6', bg: 'rgba(59,130,246,0.06)', icon: Clock },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'deploy', title: 'Deploy #1284 completed', time: '2 minutes ago', read: false },
  { id: '2', type: 'alert', title: 'Server staging-db-01 is DOWN', time: '5 minutes ago', read: false },
  { id: '3', type: 'bug', title: 'BUG-1847: New critical error detected', time: '12 minutes ago', read: false },
  { id: '4', type: 'deploy', title: 'Deploy #1283 completed on prod-api-02', time: '1 hour ago', read: true },
  { id: '5', type: 'security', title: 'Security scan completed — 2 issues', time: '2 hours ago', read: true },
  { id: '6', type: 'info', title: 'Scheduled maintenance in 4 hours', time: '3 hours ago', read: true },
];

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismissNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', padding: '8px', borderRadius: '10px', border: 'none',
          backgroundColor: open ? 'rgba(var(--primary),0.1)' : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
          transition: 'background-color 150ms',
        }}
      >
        <Bell style={{ width: '20px', height: '20px' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            width: '16px', height: '16px', borderRadius: '50%',
            backgroundColor: '#EF4444', color: '#fff',
            fontSize: '9px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgb(var(--bg))',
            animation: 'notifPulse 2s ease-in-out infinite',
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: '380px', maxHeight: '500px',
          borderRadius: '16px', overflow: 'hidden',
          backgroundColor: 'rgb(var(--card))',
          border: '1px solid rgb(var(--border))',
          boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          zIndex: 9999,
          animation: 'panelIn 200ms ease-out forwards',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid rgba(var(--border), 0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell style={{ width: '16px', height: '16px', color: 'rgb(var(--text-primary))' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>
                Notifications ({unreadCount})
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: '12px', fontWeight: 600, color: 'rgb(var(--primary))',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                <Check style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Bell style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No notifications</p>
              </div>
            ) : (
              notifications.map(n => {
                const tc = typeConfig[n.type] || typeConfig.info;
                const Icon = tc.icon;
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      padding: '14px 20px',
                      backgroundColor: n.read ? 'transparent' : tc.bg,
                      borderLeft: n.read ? '3px solid transparent' : `3px solid ${tc.color}`,
                      borderBottom: '1px solid rgba(var(--border), 0.3)',
                      cursor: 'pointer', transition: 'background-color 150ms',
                    }}
                    onMouseEnter={e => { if (n.read) e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.06)'; }}
                    onMouseLeave={e => { if (n.read) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      backgroundColor: `${tc.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon style={{ width: '16px', height: '16px', color: tc.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', fontWeight: n.read ? 500 : 600,
                        color: 'rgb(var(--text-primary))', lineHeight: 1.4,
                      }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '3px' }}>
                        {n.time}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); dismissNotif(n.id); }}
                      style={{
                        padding: '2px', background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgb(var(--text-muted))', opacity: 0.5, flexShrink: 0,
                      }}
                    >
                      <X style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid rgba(var(--border), 0.5)',
            textAlign: 'center',
          }}>
            <a href="/settings/notifications" style={{
              fontSize: '12px', fontWeight: 600, color: 'rgb(var(--primary))',
              textDecoration: 'none',
            }}>
              View all notifications →
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes notifPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
