/**
 * Nav Config — Single source of truth for sidebar navigation
 *
 * Both the sidebar component and the modules settings page
 * read from this file. Add/remove items HERE only.
 */

export interface NavItem {
  label: string;
  href: string;
  emoji: string;
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
      { label: 'Dashboard',    href: '/dashboard',      emoji: '◉' },
      { label: 'Projects',     href: '/projects',       emoji: '📁' },
      { label: 'Deployments',  href: '/deployments',    emoji: '⬡' },
      { label: 'Knowledge',    href: '/knowledge-base', emoji: '📚' },
    ],
  },
  {
    title: 'MONITORING', color: '#EF4444',
    items: [
      { label: 'Heartbeat',     href: '/heartbeat',    emoji: '💓' },
      { label: 'Bug Tracker',   href: '/bug-tracker',  emoji: '🐛' },
    ],
  },
  {
    title: 'INFRASTRUCTURE', color: '#06B6D4',
    items: [
      { label: 'Servers',        href: '/servers',        emoji: '🖥' },
      { label: 'SSHFS',          href: '/servers/mounts', emoji: '📂' },
      { label: 'Pipelines',      href: '/pipelines',      emoji: '🔀' },
    ],
  },
  {
    title: 'ADMIN', color: '#6B7280',
    items: [
      { label: 'Audit Log', href: '/audit-log', emoji: '📜' },
      { label: 'Testing',   href: '/testing',   emoji: '🧪' },
      { label: 'Settings',  href: '/settings',  emoji: '⚙' },
    ],
  },
];
