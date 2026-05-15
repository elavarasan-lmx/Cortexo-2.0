'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSidebarStore, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/sidebar-store';
import { useSidebarFeatures } from '@/lib/sidebar-features';
import { NAVIGATION } from '@/lib/nav-config';
import { PLATFORM_DEFAULTS } from '@/lib/platform-config';
import type { NavItem } from '@/lib/nav-config';
import {
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Rocket,
  BookOpen,
  FileText,
  Bug,
  Server,
  GitBranch,
  ScrollText,
  FlaskConical,
  Settings,
  Building2,
  SearchCode,
  Shield,
  FileBarChart,
} from 'lucide-react';

/* ── Lucide icon registry — maps icon name strings to components ── */
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  FolderKanban,
  Rocket,
  BookOpen,
  FileText,
  Bug,
  Server,
  GitBranch,
  ScrollText,
  FlaskConical,
  Settings,
  Building2,
  SearchCode,
  Shield,
  FileBarChart,
};

/* ── Nav link — professional icon-based styling ── */
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
  const IconComponent = ICON_MAP[item.icon];

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
        backgroundColor: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
        color: isActive ? '#7C3AED' : 'rgb(var(--text-muted))',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.06)';
          e.currentTarget.style.color = 'rgb(var(--text-primary))';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'rgb(var(--text-muted))';
        }
      }}
    >
      {/* Lucide icon */}
      {IconComponent && (
        <IconComponent style={{
          width: collapsed ? '20px' : '18px',
          height: collapsed ? '20px' : '18px',
          flexShrink: 0,
          strokeWidth: isActive ? 2.2 : 1.8,
        }} />
      )}

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
  const visibleNav = NAVIGATION
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
      {/* ── Logo Area ── */}
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
          {/* Logo — contains brand text */}
          <img
            src="/logo.png"
            alt={PLATFORM_DEFAULTS.name}
            style={{
              height: '36px',
              flexShrink: 0,
              objectFit: 'contain',
            }}
          />
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
              backgroundColor: 'rgb(var(--surface-hover))',
              color: 'rgb(var(--text-muted))',
              cursor: 'pointer',
              transition: 'background-color 150ms',
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* ── Main Navigation ── */}
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
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                color: 'rgb(var(--text-muted))',
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
                backgroundColor: 'rgb(var(--border))',
              }} />
            )}

            {/* Separator line between sections */}
            {!effectiveCollapsed && idx > 0 && (
              <div style={{
                height: '1px',
                backgroundColor: 'rgb(var(--border))',
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
              backgroundColor: 'rgb(var(--border))',
              margin: '4px 12px 8px',
            }} />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
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
              <LogOut style={{ width: '18px', height: '18px', strokeWidth: 1.8 }} />
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
            border: '1px solid rgb(var(--border))',
            backgroundColor: 'rgb(var(--card))',
            color: 'rgb(var(--text-muted))',
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
            e.currentTarget.style.color = 'rgb(var(--text-muted))';
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
