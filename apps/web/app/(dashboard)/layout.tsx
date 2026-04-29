'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { GlobalSearch } from '@/components/global-search';
import { ToastContainer } from '@/components/toast';
import { CommandPalette } from '@/components/command-palette';
import { useSidebarStore, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/sidebar-store';

/**
 * Dashboard layout — sidebar + topbar wrapper for all authenticated pages.
 * WCAG 2.1 AA: skip link, landmark roles, keyboard focus management.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      {/* WCAG 2.1 — Skip to main content link (visible on keyboard focus) */}
      <a
        href="#main-content"
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

      {/* Navigation landmark — Sidebar has its own <aside> with aria-label */}
      <Sidebar />
      <GlobalSearch />
      <ToastContainer />
      <CommandPalette />

      <div
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
          <Topbar />
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
            padding: '24px 28px',
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
