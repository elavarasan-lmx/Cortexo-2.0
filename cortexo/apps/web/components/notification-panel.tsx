'use client';

import { useState } from 'react';
import { Bell, X, Rocket, Bug, Server, GitBranch, Bot, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'deploy' | 'bug' | 'server' | 'pipeline' | 'agent' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

const TYPE_CFG = {
  deploy:   { icon: Rocket,        color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  bug:      { icon: Bug,           color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  server:   { icon: Server,        color: '#F97316', bg: 'rgba(249,115,22,0.08)' },
  pipeline: { icon: GitBranch,     color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  agent:    { icon: Bot,           color: '#A78BFA', bg: 'rgba(167,139,250,0.08)' },
  warning:  { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  success:  { icon: CheckCircle,   color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  info:     { icon: Info,          color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
};

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'deploy',   title: 'Deploy #1284 succeeded',       message: 'prod-api-01 → main@a2c4f1b',     time: '2m ago' },
  { id: '2', type: 'bug',      title: 'Critical bug detected',        message: 'NullReferenceException in auth',  time: '5m ago' },
  { id: '3', type: 'server',   title: 'Server disk warning',          message: 'web-03 at 92% disk usage',        time: '12m ago' },
  { id: '4', type: 'pipeline', title: 'Pipeline completed',           message: 'CI/CD: 12 tests passed',          time: '18m ago' },
  { id: '5', type: 'agent',    title: 'AI Agent task finished',       message: 'Code review on PR #89',           time: '25m ago' },
  { id: '6', type: 'success',  title: 'Backup completed',             message: 'Daily MySQL backup successful',   time: '1h ago',  read: true },
  { id: '7', type: 'warning',  title: 'SSL certificate expiring',     message: 'api.cortexo.dev expires in 7d',   time: '2h ago',  read: true },
  { id: '8', type: 'info',     title: 'Scheduled maintenance',        message: 'DB maintenance at 3:00 AM IST',   time: '3h ago',  read: true },
];

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 1998,
        backgroundColor: 'rgba(0,0,0,0.2)',
      }} />

      <div style={{
        position: 'fixed', top: '68px', right: '24px', zIndex: 1999,
        width: '400px', maxWidth: '90vw', maxHeight: '80vh',
        borderRadius: '16px', overflow: 'hidden',
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column',
        animation: 'np-slideIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px', borderBottom: '1px solid rgba(var(--border),0.2)',
          backgroundColor: 'rgba(var(--surface-hover),0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell style={{ width: '16px', height: '16px', color: 'rgb(var(--primary))' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span style={{
                fontSize: '10px', fontWeight: 700, color: '#fff',
                backgroundColor: '#EF4444', borderRadius: '10px',
                padding: '2px 7px', lineHeight: 1.4,
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                fontSize: '11px', fontWeight: 600, color: 'rgb(var(--primary))',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
              }}>
                Mark all read
              </button>
            )}
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgb(var(--text-muted))', padding: '4px',
            }}>
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '8px 12px',
          borderBottom: '1px solid rgba(var(--border),0.1)',
        }}>
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: '11px', fontWeight: 600, padding: '5px 14px',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                textTransform: 'capitalize',
                backgroundColor: filter === f ? 'rgba(var(--primary),0.12)' : 'transparent',
                color: filter === f ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                transition: 'all 150ms',
              }}
            >
              {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '6px',
          scrollbarWidth: 'thin',
        }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '40px 20px', textAlign: 'center',
              color: 'rgb(var(--text-muted))', fontSize: '13px',
            }}>
              <Bell style={{ width: '24px', height: '24px', opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ margin: 0 }}>No notifications</p>
            </div>
          ) : (
            filtered.map(n => {
              const cfg = TYPE_CFG[n.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '12px 14px', borderRadius: '10px',
                    backgroundColor: n.read ? 'transparent' : 'rgba(var(--primary),0.04)',
                    transition: 'background-color 150ms',
                    cursor: 'pointer',
                    borderLeft: n.read ? 'none' : `3px solid ${cfg.color}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--surface-hover),0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'rgba(var(--primary),0.04)'; }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '14px', height: '14px', color: cfg.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '12px', fontWeight: n.read ? 500 : 600,
                      color: 'rgb(var(--text-primary))', margin: '0 0 2px',
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '0 0 4px',
                      lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {n.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: '10px', height: '10px', color: 'rgb(var(--text-muted))', opacity: 0.5 }} />
                      <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', opacity: 0.6 }}>{n.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgb(var(--text-muted))', padding: '2px', opacity: 0.4,
                      borderRadius: '4px', flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; }}
                  >
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes np-slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </>
  );
}
