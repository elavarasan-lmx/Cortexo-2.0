'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/sidebar-store';
import { useSidebarFeatures } from '@/lib/sidebar-features';
import {
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  Rocket,
  RotateCcw,
  Bug,
  Search,
  Brain,
  BookOpen,
  Target,
  BarChart3,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  History,
  Store,
  Zap,
  AlertTriangle,
  FileCode,
  Bot,
  Database,
  Settings2,
  BookOpen as BookOpenIcon,
  Server,
  HardDrive,
  ScrollText,
  GitCompareArrows,
  ArrowLeftRight,
  Wand2,
  FlaskConical,
  Wifi,
  ClipboardCheck,
  Activity,
  ShieldCheck,
  Boxes,
  FileCheck,
  Layers,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'PROJECTS',
    items: [
      { label: 'All Projects', href: '/projects', icon: FolderGit2 },
    ],
  },
  {
    title: 'CI/CD',
    items: [
      { label: 'Pipelines',      href: '/pipelines',             icon: GitBranch },
      { label: 'Pipeline Runs',  href: '/pipelines/runs',        icon: History },
      { label: 'Pipeline Editor', href: '/pipelines/editor',     icon: FileCode },
      { label: 'Deployments',    href: '/deployments',           icon: Rocket },
      { label: 'Canary Releases', href: '/deployments/canary',   icon: Zap },
      { label: 'Rollbacks',      href: '/rollbacks',             icon: RotateCcw },
    ],
  },
  {
    title: 'BUGS & ERRORS',
    items: [
      { label: 'Errors',         href: '/errors',        icon: Bug },
      { label: 'Root Causes',    href: '/root-causes',   icon: Search },
      { label: 'Scan Results',   href: '/scans',         icon: ShieldCheck },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Postmortem',     href: '/postmortem',    icon: FileCheck },
      { label: 'Deprecations',   href: '/deprecation',   icon: AlertTriangle },
    ],
  },
  {
    title: 'INFRASTRUCTURE',
    items: [
      { label: 'Servers',        href: '/servers',       icon: Server },
      { label: 'Server Mounts',  href: '/servers/mounts', icon: HardDrive },
      { label: 'Log Viewer',     href: '/logs',          icon: ScrollText },
    ],
  },
  {
    title: 'AGENT INTELLIGENCE',
    items: [
      { label: 'Agent Memory',      href: '/agent/memory',       icon: Brain },
      { label: 'Skill Library',     href: '/agent/skills',       icon: BookOpen },
      { label: 'Context Monitor',   href: '/agent/context',      icon: Target },
      { label: 'Agent Performance', href: '/agent/performance',  icon: BarChart3 },
      { label: 'Agent Runner',      href: '/agent/runner',       icon: Bot },
      { label: 'Marketplace',       href: '/agent/marketplace',  icon: Store },
    ],
  },
  {
    title: 'SYNC & MIGRATION',
    items: [
      { label: 'Source Sync',    href: '/sync',          icon: GitCompareArrows },
      { label: 'DB Migration',   href: '/db-migration',  icon: ArrowLeftRight },
    ],
  },

  {
    title: 'ANALYTICS',
    items: [
      { label: 'Insights',       href: '/analytics',       icon: TrendingUp },
      { label: 'Reports',        href: '/reports',         icon: FileText },
      { label: 'Activity Log',   href: '/analytics/audit', icon: History },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { label: 'MySQL',        href: '/mysql',       icon: Database },

      { label: 'Docs',         href: '/docs',        icon: BookOpenIcon },
    ],
  },
  {
    title: 'TESTING',
    items: [
      { label: 'Load Test',     href: '/testing/load',      icon: Activity },
      { label: 'Socket Test',   href: '/testing/socket',    icon: Wifi },
      { label: 'Module Test',   href: '/testing/module',    icon: Boxes },
      { label: 'Checklist',     href: '/testing/checklist', icon: ClipboardCheck },
      { label: 'API Health',    href: '/testing/api-health', icon: FlaskConical },
      { label: 'SSL Monitor',   href: '/testing/ssl',       icon: ShieldCheck },
    ],
  },
];

const bottomNav: NavItem[] = [
  { label: 'Settings',      href: '/settings',              icon: Settings },
];

/* ── Nav link shared between main + bottom ── */
function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '9px 0' : '8px 10px 8px 12px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: isActive ? 600 : 500,
        textDecoration: 'none',
        position: 'relative',
        transition: 'all 200ms ease',
        /* active: semi-transparent primary bg + left accent bar */
        backgroundColor: isActive
          ? 'rgba(var(--sidebar-active), 0.15)'
          : 'transparent',
        color: isActive
          ? 'rgb(var(--primary))'
          : 'rgba(var(--sidebar-text), 1)',
        /* left accent bar for active */
        ...(isActive && !collapsed
          ? { boxShadow: 'inset 3px 0 0 rgb(var(--primary))' }
          : {}),
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(var(--sidebar-hover), 1)';
          e.currentTarget.style.color = 'rgb(var(--sidebar-text))';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'rgba(var(--sidebar-text), 1)';
        }
      }}
    >
      {/* Icon wrapper — glows when active */}
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        backgroundColor: isActive ? 'rgba(var(--primary), 0.18)' : 'transparent',
        transition: 'background-color 200ms',
      }}>
        <Icon
          className="h-[16px] w-[16px] shrink-0"
          style={{ color: isActive ? 'rgb(var(--primary))' : 'inherit' }}
        />
      </span>

      {!collapsed && (
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          backgroundColor: 'rgba(239,68,68,0.15)',
          color: '#EF4444',
        }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();
  const { permissions, loaded, loadFromApi, sectionOrder, itemOrders, itemSectionMap } = useSidebarFeatures();

  // Load permissions from DB on first mount
  React.useEffect(() => { loadFromApi(); }, [loadFromApi]);

  // Derive sorted navigation based on user preferences + cross-section moves
  const sortedNavigation = React.useMemo(() => {
    // Build a mutable copy of navigation items per section
    const sectionItemsMap: Record<string, typeof navigation[0]['items']> = {};
    navigation.forEach(s => { sectionItemsMap[s.title || '__dashboard'] = [...s.items]; });

    // Apply cross-section reassignments from itemSectionMap
    if (itemSectionMap && Object.keys(itemSectionMap).length > 0) {
      for (const [menuKey, targetSectionTitle] of Object.entries(itemSectionMap)) {
        // Find and remove item from its original section
        let movedItem: (typeof navigation[0]['items'])[0] | null = null;
        for (const secKey of Object.keys(sectionItemsMap)) {
          const idx = sectionItemsMap[secKey].findIndex(i => i.href === menuKey);
          if (idx !== -1) {
            movedItem = sectionItemsMap[secKey][idx];
            sectionItemsMap[secKey].splice(idx, 1);
            break;
          }
        }
        // Add to target section
        if (movedItem && sectionItemsMap[targetSectionTitle]) {
          sectionItemsMap[targetSectionTitle].push(movedItem);
        }
      }
    }

    // Rebuild navigation with reassigned items
    const reassigned = navigation.map(s => ({
      ...s,
      items: sectionItemsMap[s.title || '__dashboard'] || [],
    }));

    return reassigned.sort((a, b) => {
      if (!a.title) return -1;
      if (!b.title) return 1;
      const idxA = sectionOrder?.indexOf(a.title) ?? -1;
      const idxB = sectionOrder?.indexOf(b.title) ?? -1;
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    }).map(section => {
      if (!section.title) return section;
      const orderMap = itemOrders?.[section.title] || [];
      const sortedItems = [...section.items].sort((a, b) => {
        const idxA = orderMap.indexOf(a.href);
        const idxB = orderMap.indexOf(b.href);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
      return { ...section, items: sortedItems };
    });
  }, [sectionOrder, itemOrders, itemSectionMap]);

  // Filter: per-item visibility + hide entire section if all items hidden
  const visibleNav = sortedNavigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Dashboard + Settings always visible
        if (item.href === '/dashboard') return true;
        return permissions[item.href] !== false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      role="navigation"
      aria-label="Main navigation"
      className="fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300"
      style={{
        width: collapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`,
        backgroundColor: 'rgb(var(--sidebar-bg))',
        borderRight: '1px solid rgba(var(--border), 0.12)',
        /* subtle gradient depth */
        background: `linear-gradient(180deg, rgba(var(--primary), 0.04) 0%, rgb(var(--sidebar-bg)) 120px)`,
      }}
    >
      {/* ── Logo ── */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '0' : '0 16px',
        borderBottom: '1px solid rgba(var(--border), 0.1)',
        flexShrink: 0,
      }}>
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          {/* Logo icon */}
          <div style={{
            width: '34px',
            height: '34px',
            flexShrink: 0,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(var(--primary), 0.35)',
          }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>C</span>
          </div>

          {/* Brand name — hidden when collapsed */}
          {!collapsed && (
            <div>
              <span style={{
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '-0.3px',
                color: 'rgb(var(--sidebar-text))',
                lineHeight: 1,
              }}>
                Cortexo
              </span>
              <div style={{
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'rgba(var(--sidebar-text), 0.4)',
                textTransform: 'uppercase',
                lineHeight: 1,
                marginTop: '2px',
              }}>
                DevOps Intelligence
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* ── Main Navigation ── */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '8px 8px' : '8px 10px',
          scrollbarWidth: 'none',
        }}
      >
        {visibleNav.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '4px' }}>
            {/* Section label / divider */}
            {section.title && !collapsed && (
              <p style={{
                padding: '10px 12px 4px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(var(--sidebar-text), 0.38)',
                margin: 0,
              }}>
                {section.title}
              </p>
            )}
            {section.title && collapsed && (
              <div style={{
                margin: '8px auto',
                height: '1px',
                width: '24px',
                backgroundColor: 'rgba(var(--border), 0.25)',
              }} />
            )}

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));
                return (
                  <li key={item.href}>
                    <NavLink item={item} isActive={isActive} collapsed={collapsed} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Bottom Nav ── */}
      <div style={{
        borderTop: '1px solid rgba(var(--border), 0.12)',
        padding: collapsed ? '8px 8px' : '8px 10px',
        flexShrink: 0,
      }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {bottomNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <NavLink item={item} isActive={isActive} collapsed={collapsed} />
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Collapse toggle ── */}
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
          border: '1px solid rgba(var(--border), 0.3)',
          backgroundColor: 'rgb(var(--surface))',
          color: 'rgb(var(--text-secondary))',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 200ms ease',
          zIndex: 50,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgb(var(--primary))';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = 'rgb(var(--primary))';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgb(var(--surface))';
          e.currentTarget.style.color = 'rgb(var(--text-secondary))';
          e.currentTarget.style.borderColor = 'rgba(var(--border), 0.3)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {collapsed
          ? <ChevronRight className="h-3.5 w-3.5" />
          : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  );
}
