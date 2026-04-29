'use client';

import { useTheme } from 'next-themes';
import {
  Search, Bell, Sun, Moon, ChevronDown, User, LogOut, Settings,
  Plus, KeyRound, HelpCircle, CheckCheck, AlertCircle, Rocket, Bug,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/hooks';

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '36px', height: '36px', borderRadius: '10px', border: 'none',
  cursor: 'pointer', backgroundColor: 'transparent',
  color: 'rgb(var(--text-secondary))', transition: 'background-color 150ms, color 150ms',
  flexShrink: 0, position: 'relative' as const,
};

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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
    const timer = setInterval(fetchNotifications, 30000); // poll every 30s
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
        justifyContent: 'space-between',
        padding: '0 20px',
        backgroundColor: 'rgba(var(--background), 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(var(--border), 0.6)',
        gap: '12px',
      }}
    >
      {/* ── Search ── */}
      <div style={{ flex: 1, maxWidth: '420px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '10px',
          backgroundColor: 'rgb(var(--surface))',
          border: `1px solid ${searchFocused ? 'rgba(var(--primary), 0.5)' : 'rgb(var(--border))'}`,
          boxShadow: searchFocused ? '0 0 0 3px rgba(var(--primary), 0.08)' : 'none',
          transition: 'border-color 150ms, box-shadow 150ms',
        }}>
          <Search style={{ width: '15px', height: '15px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search... (⌘K)"
            id="global-search"
            readOnly
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              minWidth: 0,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: 'rgb(var(--text-primary))',
              cursor: 'pointer',
            }}
          />
          <kbd style={{
            padding: '2px 6px',
            borderRadius: '5px',
            fontSize: '10px',
            fontWeight: 600,
            fontFamily: 'inherit',
            backgroundColor: 'rgb(var(--surface-hover))',
            color: 'rgb(var(--text-muted))',
            border: '1px solid rgb(var(--border))',
            flexShrink: 0,
            lineHeight: '16px',
          }}>
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Right actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

        {/* Live status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px 4px 8px', borderRadius: '20px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', marginRight: '4px' }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>Systems OK</span>
        </div>


        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgb(var(--border))', margin: '0 2px' }} />

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            id="theme-toggle"
            aria-label="Toggle theme"
            style={iconBtn}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {theme === 'dark'
              ? <Sun style={{ width: '17px', height: '17px' }} />
              : <Moon style={{ width: '17px', height: '17px' }} />}
          </button>
        )}

        {/* Color theme picker */}
        <ThemePicker />

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            id="notifications-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifications(v => !v)}
            style={iconBtn}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Bell style={{ width: '17px', height: '17px' }} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                minWidth: '16px', height: '16px', borderRadius: '8px',
                backgroundColor: '#EF4444', color: '#fff',
                fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 0 0 2px rgb(var(--background))',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '340px', maxHeight: '420px', overflowY: 'auto',
              borderRadius: '14px', border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))',
              boxShadow: '0 16px 40px -8px rgba(0,0,0,0.2)',
              zIndex: 100,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgb(var(--primary))', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}>
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
                    const typeIcon = n.type === 'deploy_failed' ? Rocket : n.type === 'error_spike' ? Bug : AlertCircle;
                    const TypeIcon = typeIcon;
                    const isUnread = !n.readAt;
                    return (
                      <div key={n.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '12px 16px',
                        backgroundColor: isUnread ? 'rgba(var(--primary), 0.04)' : 'transparent',
                        borderBottom: '1px solid rgba(var(--border), 0.5)',
                        cursor: 'pointer',
                      }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <TypeIcon style={{ width: '15px', height: '15px', color: 'rgb(var(--primary))' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: isUnread ? 600 : 400, color: 'rgb(var(--text-primary))' }}>{n.title}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{n.message}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'rgb(var(--text-muted))' }}>{timeAgo(n.createdAt)}</p>
                        </div>
                        {isUnread && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgb(var(--primary))', flexShrink: 0, marginTop: '4px' }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(v => !v)}
            id="user-menu-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 8px 5px 5px',
              borderRadius: '10px',
              border: '1px solid transparent',
              cursor: 'pointer',
              backgroundColor: showUserMenu ? 'rgb(var(--surface-hover))' : 'transparent',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
            onMouseLeave={e => {
              if (!showUserMenu) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              boxShadow: '0 2px 6px rgba(var(--primary), 0.3)',
              flexShrink: 0,
            }}>
              L
            </div>
            {/* Name — hidden on small screens */}
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgb(var(--text-primary))',
              display: 'none',
              // shown via CSS media would need Tailwind; keep hidden for simplicity
            }}>
              LMX
            </span>
            <ChevronDown style={{
              width: '14px',
              height: '14px',
              color: 'rgb(var(--text-muted))',
              transform: showUserMenu ? 'rotate(180deg)' : 'none',
              transition: 'transform 200ms',
            }} />
          </button>

          {/* ── Dropdown ── */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '220px',
                borderRadius: '14px',
                border: '1px solid rgb(var(--border))',
                backgroundColor: 'rgb(var(--surface))',
                boxShadow: '0 16px 40px -8px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                animation: 'fadeInDown 150ms ease-out',
                zIndex: 100,
              }}
            >
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
                  background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(var(--primary), 0.3)',
                }}>
                  L
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>LMX</p>
                  <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgb(var(--text-muted))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                    backgroundColor: 'rgba(var(--primary), 0.1)',
                    color: 'rgb(var(--primary))',
                  }}>
                    Admin
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px' }}>
                {[
                  { href: '/settings', icon: Settings, label: 'Settings' },
                  { href: '/settings', icon: User, label: 'Profile' },
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
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
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

/* ─── Color Theme Picker ─── */
const COLOR_THEMES = [
  { key: '', label: 'Indigo', color: '#4F46E5', dark: '#818CF8' },
  { key: 'ocean', label: 'Ocean', color: '#0EA5E9', dark: '#38BDF8' },
  { key: 'emerald', label: 'Emerald', color: '#10B981', dark: '#34D399' },
  { key: 'midnight', label: 'Midnight', color: '#22D3EE', dark: '#67E8F9' },
  { key: 'teal', label: 'Teal', color: '#14B8A6', dark: '#2DD4BF' },
];

function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cortexo_color_theme') || '';
    setCurrent(saved);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const select = (key: string) => {
    setCurrent(key);
    if (key) {
      document.documentElement.setAttribute('data-theme', key);
      localStorage.setItem('cortexo_color_theme', key);
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('cortexo_color_theme');
    }
    setOpen(false);
  };

  const activeCfg = COLOR_THEMES.find(t => t.key === current) || COLOR_THEMES[0];

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Change color theme"
        style={{
          ...iconBtn,
          borderRadius: '10px',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${activeCfg.color}, ${activeCfg.dark})`,
          boxShadow: `0 0 0 2px rgb(var(--background)), 0 0 0 3px ${activeCfg.color}50`,
        }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          padding: '12px', borderRadius: '14px',
          border: '1px solid rgb(var(--border))',
          backgroundColor: 'rgb(var(--surface))',
          boxShadow: '0 16px 40px -8px rgba(0,0,0,0.2)',
          animation: 'fadeInDown 150ms ease-out',
          zIndex: 100, width: '180px',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))' }}>
            Color Theme
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {COLOR_THEMES.map(t => (
              <button key={t.key || 'default'} onClick={() => select(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '6px 8px', borderRadius: '8px', border: 'none',
                backgroundColor: current === t.key ? 'rgba(var(--primary), 0.08)' : 'transparent',
                cursor: 'pointer', width: '100%', transition: 'background-color 100ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                onMouseLeave={e => { if (current !== t.key) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color}, ${t.dark})`,
                  boxShadow: current === t.key ? `0 0 0 2px rgb(var(--background)), 0 0 0 3px ${t.color}` : 'none',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '12px', fontWeight: current === t.key ? 600 : 400, color: current === t.key ? 'rgb(var(--text-primary))' : 'rgb(var(--text-secondary))' }}>{t.label}</span>
                {current === t.key && <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgb(var(--primary))' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
