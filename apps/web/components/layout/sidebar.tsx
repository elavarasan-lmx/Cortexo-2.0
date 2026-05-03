'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/sidebar-store';
import { useSidebarFeatures } from '@/lib/sidebar-features';
import {
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  emoji: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Sidebar navigation — matches the new pencil.pen design system
 * White background, emoji icons, clean Inter typography
 */
const navigation: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard',    href: '/dashboard',    emoji: '◉' },
      { label: 'Projects',     href: '/projects',     emoji: '📁' },
      { label: 'Deployments',  href: '/deployments',  emoji: '⬡' },
      { label: 'Clients',      href: '/clients',      emoji: '👥' },
      { label: 'Activity',     href: '/activity',     emoji: '⚡' },
      { label: 'Sources',      href: '/sources',      emoji: '🔌' },
    ],
  },
  {
    title: 'MONITORING',
    items: [
      { label: 'Heartbeat',     href: '/heartbeat',      emoji: '💓' },
      { label: 'Logs',          href: '/logs',           emoji: '📋' },
      { label: 'Error Tracker', href: '/errors',         emoji: '⚠' },
      { label: 'Bug Tracker',   href: '/bugs',           emoji: '🐛' },
      { label: 'Drift Monitor', href: '/drift-monitor',  emoji: '📡' },
      { label: 'Deprecation',   href: '/deprecation',    emoji: '🚫' },
      { label: 'Postmortem',    href: '/postmortem',     emoji: '🩺' },
      { label: 'Scans',         href: '/scans',          emoji: '🔍' },
      { label: 'Root Causes',   href: '/root-causes',   emoji: '🧬' },
    ],
  },
  {
    title: 'INFRASTRUCTURE',
    items: [
      { label: 'Servers',      href: '/servers',        emoji: '🖥' },
      { label: 'SSHFS',        href: '/servers/mounts', emoji: '📂' },
      { label: 'Cron Jobs',    href: '/cron-jobs',      emoji: '⏰' },
      { label: 'AI Agents',    href: '/agents',         emoji: '🤖' },
      { label: 'Pipelines',    href: '/pipelines',      emoji: '🔀' },
      { label: 'Scaffolding',  href: '/scaffolding',    emoji: '🏗' },
      { label: 'Auto Sync',    href: '/sync',           emoji: '🔄' },
      { label: 'Webhooks',     href: '/webhooks',       emoji: '🪝' },
      { label: 'DB Migration', href: '/db-migration',   emoji: '🗃' },
      { label: 'MySQL',        href: '/mysql',          emoji: '🐬' },
      { label: 'Rollbacks',    href: '/rollbacks',      emoji: '⏪' },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { label: 'Daily Stats',     href: '/analytics',           emoji: '📊' },
      { label: 'Reports',         href: '/reports',             emoji: '📈' },
      { label: 'Team',            href: '/team',                emoji: '👤' },
      { label: 'Email Templates', href: '/email-templates',     emoji: '✉' },
      { label: 'API Keys',        href: '/settings/api-keys',   emoji: '🔑' },
      { label: 'Audit Log',       href: '/audit-log',           emoji: '📜' },
      { label: 'Docs',            href: '/docs',                emoji: '📖' },
      { label: 'Pricing',         href: '/pricing',             emoji: '💰' },
      { label: 'Testing',         href: '/testing/module',      emoji: '🧪' },
      { label: 'Settings',        href: '/settings',            emoji: '⚙' },
    ],
  },
];

/* ── Nav link — matches pencil.pen navItem styling ── */
function NavLink({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px 0' : '0 12px',
        borderRadius: '8px',
        height: '40px',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 500,
        fontFamily: 'Inter, system-ui, sans-serif',
        textDecoration: 'none',
        transition: 'all 180ms ease',
        backgroundColor: isActive ? '#F3F0FF' : 'transparent',
        color: isActive ? '#7C3AED' : '#64748B',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))';
          e.currentTarget.style.color = '#475569';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#64748B';
        }
      }}
    >
      {/* Emoji icon */}
      <span style={{
        fontSize: collapsed ? '18px' : '14px',
        lineHeight: 1,
        flexShrink: 0,
        width: collapsed ? 'auto' : '20px',
        textAlign: 'center',
      }}>
        {item.emoji}
      </span>

      {!collapsed && (
        <span style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.label}
        </span>
      )}

      {/* Badge */}
      {!collapsed && item.badge !== undefined && (
        <span style={{
          marginLeft: 'auto',
          flexShrink: 0,
          padding: '1px 7px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: 'rgba(239,68,68,0.1)',
          color: '#EF4444',
        }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebarStore();
  const { permissions, loaded, loadFromApi, sectionOrder, itemOrders, itemSectionMap } = useSidebarFeatures();

  // Load permissions from DB on first mount
  React.useEffect(() => { loadFromApi(); }, [loadFromApi]);

  // Close mobile drawer on navigation
  const handleNavClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  // Close mobile drawer on Escape
  React.useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobile, mobileOpen, setMobileOpen]);

  // Filter: per-item visibility + hide entire section if all items hidden
  const visibleNav = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.href === '/dashboard') return true;
        return permissions[item.href] !== false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Mobile: determine show/hide
  const effectiveCollapsed = isMobile ? false : collapsed;
  const sidebarW = isMobile ? SIDEBAR_WIDTH : (collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH);

  return (
    <aside
      role="navigation"
      aria-label="Main navigation"
      className="sidebar-aside"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        width: `${sidebarW}px`,
        backgroundColor: 'rgb(var(--card))',
        borderRight: '1px solid rgb(var(--border))',
        transition: isMobile
          ? 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isMobile
          ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)')
          : 'translateX(0)',
        boxShadow: isMobile && mobileOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {/* ── Logo Area — matches pencil.pen logoArea ── */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'space-between' : (effectiveCollapsed ? 'center' : 'flex-start'),
        padding: effectiveCollapsed ? '0' : '0 20px',
        flexShrink: 0,
        gap: '12px',
      }}>
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          {/* Logo icon — purple square with rounded corners */}
          <div style={{
            width: '32px',
            height: '32px',
            flexShrink: 0,
            borderRadius: '8px',
            backgroundColor: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.5px',
            }}>C</span>
          </div>

          {/* Brand name */}
          {!effectiveCollapsed && (
            <span style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1E1B4B',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1,
            }}>
              Cortexo
            </span>
          )}
        </Link>

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F1F5F9',
              color: '#64748B',
              cursor: 'pointer',
              transition: 'background-color 150ms',
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* ── Main Navigation — matches pencil.pen navSection ── */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: effectiveCollapsed ? '8px 8px' : '0 12px',
          scrollbarWidth: 'none',
        }}
      >
        {visibleNav.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '2px' }}>
            {/* Section label */}
            {section.title && !effectiveCollapsed && (
              <p style={{
                padding: '12px 12px 6px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
                color: '#94A3B8',
                margin: 0,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {section.title}
              </p>
            )}

            {/* Separator line for collapsed mode */}
            {section.title && effectiveCollapsed && idx > 0 && (
              <div style={{
                margin: '8px auto',
                height: '1px',
                width: '24px',
                backgroundColor: '#F1F5F9',
              }} />
            )}

            {/* Separator line between sections */}
            {!effectiveCollapsed && idx > 0 && (
              <div style={{
                height: '1px',
                backgroundColor: '#F1F5F9',
                margin: '4px 12px 8px',
              }} />
            )}

            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));
                return (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      isActive={isActive}
                      collapsed={effectiveCollapsed}
                      onNavigate={handleNavClick}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* ── Logout button ── */}
        {!effectiveCollapsed && (
          <div style={{ marginTop: '8px' }}>
            <div style={{
              height: '1px',
              backgroundColor: '#F1F5F9',
              margin: '4px 12px 8px',
            }} />
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: 'calc(100% - 0px)',
                padding: '0 12px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#EF4444',
                transition: 'background-color 180ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>🚪</span>
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* ── Collapse toggle (desktop only) ── */}
      {!isMobile && (
        <button
          onClick={toggle}
          id="sidebar-collapse-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position: 'absolute',
            right: '-13px',
            top: '72px',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            color: '#94A3B8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 200ms ease',
            zIndex: 50,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7C3AED';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#7C3AED';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgb(var(--card))';
            e.currentTarget.style.color = '#94A3B8';
            e.currentTarget.style.borderColor = 'rgb(var(--border))';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      )}
    </aside>
  );
}
