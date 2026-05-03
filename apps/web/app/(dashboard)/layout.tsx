'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { GlobalSearch } from '@/components/global-search';
import { ToastContainer } from '@/components/toast';
import { CommandPalette } from '@/components/command-palette';
import { useSidebarStore, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, MOBILE_BREAKPOINT } from '@/lib/sidebar-store';

/**
 * Dashboard layout — sidebar + topbar wrapper for all authenticated pages.
 * WCAG 2.1 AA: skip link, landmark roles, keyboard focus management.
 * Fully responsive: mobile drawer on <768px, collapsible sidebar on ≥768px.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* ── Hydration-safe responsive breakpoint detection ── */
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) {
        setCollapsed(false);  // reset collapsed on mobile
        setMobileOpen(false); // close drawer on resize
      }
    };
    handler(mql); // initial check
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setCollapsed, setMobileOpen]);

  const effectiveMobile = mounted ? isMobile : false;
  const sidebarWidth = effectiveMobile ? 0 : (collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH);

  return (
    <>
      {/* WCAG 2.1 — Skip to main content link (visible on keyboard focus) */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'fixed', top: '-100px', left: '8px', zIndex: 9999,
          padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
          backgroundColor: 'rgb(var(--primary))', color: '#fff', textDecoration: 'none',
          transition: 'top 200ms',
        }}
        onFocus={(e) => { e.currentTarget.style.top = '8px'; }}
        onBlur={(e) => { e.currentTarget.style.top = '-100px'; }}
      >
        Skip to main content
      </a>

      {/* ── Mobile backdrop overlay ── */}
      {effectiveMobile && mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 39,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'overlay-in 200ms ease-out',
          }}
        />
      )}

      {/* Navigation landmark — Sidebar has its own <aside> with aria-label */}
      <Sidebar isMobile={effectiveMobile} />
      <GlobalSearch />
      <ToastContainer />
      <CommandPalette />

      <div
        className="dashboard-wrapper"
        style={{
          position: 'fixed',
          top: 0,
          left: `${sidebarWidth}px`,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgb(var(--background))',
          transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Banner landmark */}
        <header role="banner">
          <Topbar isMobile={effectiveMobile} />
        </header>

        {/* Main landmark */}
        <main
          id="main-content"
          role="main"
          aria-label="Page content"
          tabIndex={-1}
          className="dashboard-main"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: effectiveMobile ? '16px 14px' : '24px 28px',
            outline: 'none',
          }}
        >
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
