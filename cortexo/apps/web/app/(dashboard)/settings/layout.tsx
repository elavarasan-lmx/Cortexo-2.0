'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  User, Bell, LayoutGrid, Shield, Database, Users, Cog,
} from 'lucide-react';

const tabs = [
  { label: 'General', href: '/settings/general', icon: Cog },
  { label: 'Profile', href: '/settings', icon: User },
  { label: 'Credentials', href: '/settings/credentials', icon: Shield },
  { label: 'Users', href: '/settings/users', icon: Users },
  { label: 'Notifications', href: '/settings/notifications', icon: Bell },
  { label: 'Base Templates', href: '/settings/profiles', icon: Database },
  { label: 'Modules', href: '/settings/modules', icon: LayoutGrid },
];

function SettingsTab({
  tab,
  isActive,
}: {
  tab: (typeof tabs)[number];
  isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = tab.icon;

  return (
    <Link
      href={tab.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        whiteSpace: 'nowrap',
        padding: '8px 16px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: isActive ? 600 : 500,
        textDecoration: 'none',
        position: 'relative',
        transition: 'all 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        background: isActive
          ? 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--primary) / 0.82))'
          : hovered
            ? 'rgb(var(--primary) / 0.06)'
            : 'transparent',
        color: isActive
          ? '#fff'
          : hovered
            ? 'rgb(var(--primary))'
            : 'rgb(var(--text-secondary))',
        boxShadow: isActive
          ? '0 2px 12px -2px rgb(var(--primary) / 0.4), 0 1px 3px rgb(var(--primary) / 0.15)'
          : 'none',
        transform: hovered && !isActive ? 'translateY(-1px)' : 'none',
      }}
    >
      <Icon style={{
        width: '15px',
        height: '15px',
        flexShrink: 0,
        transition: 'transform 200ms ease',
        transform: hovered && !isActive ? 'scale(1.1)' : 'scale(1)',
      }} />
      {tab.label}
    </Link>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'rgb(var(--text-primary))',
          margin: 0,
          letterSpacing: '-0.3px',
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'rgb(var(--text-secondary))',
          marginTop: '4px',
        }}>
          Manage your profile, team, and platform configuration
        </p>
      </div>

      {/* Tab navigation */}
      <div style={{
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        padding: '5px',
        marginBottom: '28px',
        backgroundColor: 'rgba(var(--surface), 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(var(--border), 0.5)',
        borderRadius: '14px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <SettingsTab key={tab.href} tab={tab} isActive={isActive} />
          );
        })}
      </div>

      {/* Content */}
      <div className="page-enter">
        {children}
      </div>
    </div>
  );
}
