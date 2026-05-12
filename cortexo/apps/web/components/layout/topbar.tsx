'use client';

import { useTheme } from 'next-themes';
import {
  Search, Bell, Moon, ChevronDown, LogOut, Settings,
  CheckCheck, AlertCircle, Rocket, Bug,
  Menu,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { api } from '@/lib/api';
import { useSidebarStore } from '@/lib/sidebar-store';
import { timeAgo } from '@/lib/hooks';

/**
 * TopBar — matches the pencil.pen xfsfC component design
 * White bg, search box (#F1F5F9), bell with red badge, dark mode toggle, purple avatar
 */
export function Topbar({ isMobile = false }: { isMobile?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);

  // Derive display values from session
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = (session?.user as any)?.role || 'Admin';

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

          {/* Notification dropdown — matches screen 26 */}
          {showNotifications && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '380px', maxHeight: '500px',
              borderRadius: '16px', border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))',
              boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
              zIndex: 100, overflow: 'hidden',
              animation: 'notifPanelIn 200ms ease-out forwards',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(var(--border), 0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell style={{ width: '16px', height: '16px', color: 'rgb(var(--text-primary))' }} />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>
                    Notifications ({unread})
                  </span>
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '12px', color: '#7C3AED', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '4px 8px',
                    borderRadius: '6px', fontWeight: 600,
                  }}>
                    <CheckCheck style={{ width: '12px', height: '12px' }} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <Bell style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))', margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No notifications yet</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((n: any) => {
                      const isUnread = !n.readAt;
                      const t = n.type || '';
                      const isDeploy = t.includes('deploy');
                      const isError = t.includes('error') || t.includes('fail');
                      const isBug = t.includes('bug');
                      const borderColor = isDeploy ? '#10B981' : (isError || isBug) ? '#EF4444' : '#F59E0B';
                      const iconBg = isDeploy ? 'rgba(16,185,129,0.12)' : (isError || isBug) ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';
                      const TypeIcon = isDeploy ? Rocket : isBug ? Bug : isError ? AlertCircle : AlertCircle;
                      return (
                        <div key={n.id} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '12px',
                          padding: '14px 20px',
                          backgroundColor: isUnread ? `${borderColor}08` : 'transparent',
                          borderLeft: `3px solid ${isUnread ? borderColor : 'transparent'}`,
                          borderBottom: '1px solid rgba(var(--border), 0.3)',
                          cursor: 'pointer', transition: 'background-color 150ms',
                        }}
                        onMouseEnter={e => { if (!isUnread) e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.06)'; }}
                        onMouseLeave={e => { if (!isUnread) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            backgroundColor: iconBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <TypeIcon style={{ width: '16px', height: '16px', color: borderColor }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: isUnread ? 600 : 500, color: 'rgb(var(--text-primary))', lineHeight: 1.4 }}>{n.title}</p>
                            {n.message && <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{n.message}</p>}
                            <p style={{ margin: '3px 0 0', fontSize: '10px', color: 'rgb(var(--text-muted))' }}>{timeAgo(n.createdAt)}</p>
                          </div>
                          {isUnread && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: borderColor, flexShrink: 0, marginTop: '4px' }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Footer */}
              <div style={{
                padding: '12px 20px', borderTop: '1px solid rgba(var(--border), 0.5)',
                textAlign: 'center',
              }}>
                <a href="/settings/notifications" onClick={() => setShowNotifications(false)} style={{
                  fontSize: '12px', fontWeight: 600, color: 'rgb(var(--primary))',
                  textDecoration: 'none',
                }}>
                  View all notifications →
                </a>
              </div>
              <style>{`@keyframes notifPanelIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
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
              {userInitial}
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
                  {userInitial}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{userName}</p>
                  <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgb(var(--text-secondary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userEmail}
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
                    {userRole}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px' }}>
                {[
                  { href: '/settings', icon: Settings, label: 'Settings' },
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
                  onClick={() => signOut({ callbackUrl: '/login' })}
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
