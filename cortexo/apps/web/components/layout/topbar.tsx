'use client';

import { useTheme } from 'next-themes';
import {
  Search, Bell, Moon, ChevronDown, User, LogOut, Settings,
  KeyRound, HelpCircle, CheckCheck, AlertCircle, Rocket, Bug,
  Menu,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSidebarStore } from '@/lib/sidebar-store';
import { timeAgo } from '@/lib/hooks';

/**
 * TopBar — matches the pencil.pen xfsfC component design
 * White bg, search box (#F1F5F9), bell with red badge, dark mode toggle, purple avatar
 */
export function Topbar({ isMobile = false }: { isMobile?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);

  useEffect(() => setMounted(true), []);

  const fetchNotifications = useCallback(async () => {
    try {
      api.loadToken();
      const res = await api.getNotifications();
      setNotifications((res.data as any[]) || []);
      setUnread((res as any).unread || 0);
    } catch { }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  async function markAllRead() {
    await api.markAllNotificationsRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
  }

  useEffect(() => {
    if (!showUserMenu && !showNotifications) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu, showNotifications]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '0 12px' : '0 20px',
        backgroundColor: 'rgb(var(--surface))',
        borderBottom: '1px solid rgb(var(--border))',
        gap: '16px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ── Mobile hamburger ── */}
      {isMobile && (
        <button
          onClick={toggleMobile}
          aria-label="Open navigation menu"
          id="mobile-menu-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: '#64748B',
          }}
        >
          <Menu style={{ width: '20px', height: '20px' }} />
        </button>
      )}

      {/* ── Search Box — matches pencil.pen searchBox ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px',
          borderRadius: '8px',
          backgroundColor: 'rgb(var(--surface-hover))',
          height: '40px',
          width: isMobile ? '100%' : '400px',
          cursor: 'pointer',
        }}
        onClick={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
        }}
      >
        <span style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>🔍</span>
        <span style={{
          fontSize: '14px',
          color: 'rgb(var(--text-muted))',
          fontWeight: 'normal',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          Search... (Cmd+K)
        </span>
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Right actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>

        {/* Notification Bell — matches pencil.pen bellIcon */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            id="notifications-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifications(v => !v)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'rgb(var(--surface-hover))',
              color: 'rgb(var(--text-secondary))',
              transition: 'background-color 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--border))'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
          >
            <Bell style={{ width: '20px', height: '20px' }} />
            {/* Red notification badge */}
            {unread > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '9px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 700,
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgb(var(--surface))',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '340px', maxHeight: '420px', overflowY: 'auto',
              borderRadius: '12px', border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))',
              boxShadow: '0 16px 40px -8px rgba(0,0,0,0.15)',
              zIndex: 100,
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgb(var(--border))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '12px', color: '#7C3AED', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '4px 8px',
                    borderRadius: '6px',
                  }}>
                    <CheckCheck style={{ width: '12px', height: '12px' }} /> Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '13px' }}>
                  No notifications yet
                </div>
              ) : (
                <div>
                  {notifications.map((n: any) => {
                    const TypeIcon = n.type === 'deploy_failed' ? Rocket : n.type === 'error_spike' ? Bug : AlertCircle;
                    const isUnread = !n.readAt;
                    return (
                      <div key={n.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '12px 16px',
                        backgroundColor: isUnread ? 'rgba(var(--primary), 0.08)' : 'transparent',
                        borderBottom: '1px solid rgb(var(--border))',
                        cursor: 'pointer',
                      }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          backgroundColor: '#EDE9FE',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <TypeIcon style={{ width: '15px', height: '15px', color: '#7C3AED' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: isUnread ? 600 : 400, color: 'rgb(var(--text-primary))' }}>{n.title}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{n.message}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'rgb(var(--text-muted))' }}>{timeAgo(n.createdAt)}</p>
                        </div>
                        {isUnread && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7C3AED', flexShrink: 0, marginTop: '4px' }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle — matches pencil.pen darkModeToggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            id="theme-toggle"
            aria-label="Toggle theme"
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              background: theme === 'dark'
                ? 'linear-gradient(90deg, #1E293B, #334155)'
                : '#E2E8F0',
              transition: 'background 200ms',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {/* Moon icon for dark mode */}
            {theme === 'dark' && (
              <Moon style={{
                width: '14px',
                height: '14px',
                color: '#FBBF24',
                position: 'absolute',
                left: '6px',
                top: '7px',
              }} />
            )}
            {/* Toggle knob */}
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              transition: 'transform 200ms ease',
              transform: theme === 'dark' ? 'translateX(18px)' : 'translateX(0)',
            }} />
          </button>
        )}

        {/* Avatar — matches pencil.pen avatar (purple circle with "J") */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(v => !v)}
            id="user-menu-btn"
            aria-label="User menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              backgroundColor: '#7C3AED',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <span style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              J
            </span>
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '220px',
              borderRadius: '12px',
              border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))',
              boxShadow: '0 16px 40px -8px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              {/* User identity header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgb(var(--border))',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  J
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>Jerry</p>
                  <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgb(var(--text-secondary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    admin@cortexo.io
                  </p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '3px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: '#EDE9FE',
                    color: '#7C3AED',
                  }}>
                    Admin
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px' }}>
                {[
                  { href: '/settings', icon: Settings, label: 'Settings' },
                  { href: '/profile', icon: User, label: 'Profile' },
                  { href: '/settings/api-keys', icon: KeyRound, label: 'API Keys' },
                  { href: '#', icon: HelpCircle, label: 'Help & Docs' },
                ].map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'rgb(var(--text-secondary))',
                      transition: 'background-color 120ms, color 120ms',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))';
                      e.currentTarget.style.color = 'rgb(var(--text-primary))';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgb(var(--text-secondary))';
                    }}
                  >
                    <item.icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              <div style={{ padding: '6px', borderTop: '1px solid rgb(var(--border))' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#EF4444',
                    backgroundColor: 'transparent',
                    transition: 'background-color 120ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <LogOut style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
