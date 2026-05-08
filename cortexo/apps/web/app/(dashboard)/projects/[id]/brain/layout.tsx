'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Brain, ShieldAlert, FileText } from 'lucide-react';

export default function BrainLayout({ children, params }: { children: React.ReactNode, params: { id: string } }) {
  const pathname = usePathname();
  const id = params.id;

  const tabs = [
    { name: 'Overview', href: `/projects/${id}/brain`, icon: Brain, exact: true },
    { name: 'Violations', href: `/projects/${id}/brain/violations`, icon: ShieldAlert },
    { name: 'AI Docs', href: `/projects/${id}/brain/docs`, icon: FileText },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/projects/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgb(var(--text-muted))', textDecoration: 'none', fontSize: '13px' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Project Settings
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgb(var(--border))', paddingBottom: '0' }}>
        {tabs.map(tab => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', fontSize: '13px', fontWeight: 600,
                color: isActive ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                borderBottom: `2px solid ${isActive ? 'rgb(var(--primary))' : 'transparent'}`,
                textDecoration: 'none', transition: 'all 200ms',
                marginBottom: '-1px'
              }}
            >
              <tab.icon style={{ width: '16px', height: '16px' }} />
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: '12px' }}>
        {children}
      </div>
    </div>
  );
}
