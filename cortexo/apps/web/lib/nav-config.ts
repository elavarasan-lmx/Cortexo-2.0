/**
 * Nav Config — Single source of truth for sidebar navigation
 *
 * Both the sidebar component and the modules settings page
 * read from this file. Add/remove items HERE only.
 *
 * Icons are Lucide icon names (rendered by sidebar.tsx).
 */

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  emoji?: string;
  badge?: number;
}

export interface NavSection {
  title: string;
  color: string;
  items: NavItem[];
}

export const NAVIGATION: NavSection[] = [
  {
    title: 'MAIN', color: '#818CF8',
    items: [
      { label: 'Dashboard',      href: '/dashboard',      icon: 'LayoutDashboard' },
      { label: 'Projects',       href: '/projects',       icon: 'FolderKanban' },
      { label: 'Deployments',    href: '/deployments',    icon: 'Rocket' },
      { label: 'Organizations',  href: '/organizations',  icon: 'Building2' },
      { label: 'Knowledge',      href: '/knowledge-base', icon: 'BookOpen' },
      { label: 'DevOps Docs',    href: '/devops-docs',    icon: 'FileText' },
    ],
  },
  {
    title: 'MONITORING', color: '#EF4444',
    items: [
      { label: 'Bug Tracker', href: '/bug-tracker', icon: 'Bug' },
      { label: 'Code Audit',  href: '/code-audit',  icon: 'SearchCode' },
    ],
  },
  {
    title: 'INFRASTRUCTURE', color: '#06B6D4',
    items: [
      { label: 'Servers',   href: '/servers',   icon: 'Server' },
      { label: 'Pipelines', href: '/pipelines', icon: 'GitBranch' },
    ],
  },
  {
    title: 'ADMIN', color: '#6B7280',
    items: [
      { label: 'Audit Log', href: '/audit-log', icon: 'ScrollText' },
      { label: 'Testing',   href: '/testing',   icon: 'FlaskConical' },
      { label: 'Security',  href: '/security',  icon: 'Shield' },
      { label: 'Reports',   href: '/reports',   icon: 'FileBarChart' },
      { label: 'Settings',  href: '/settings',  icon: 'Settings' },
    ],
  },
];
