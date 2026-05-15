'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation — consistent across all dashboard pages.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Security' },
 *   ]} />
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '16px' }}>
      <ol className="cx-flex cx-items-center cx-gap-4" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '13px' }}>
        <li>
          <Link href="/dashboard" className="cx-flex cx-items-center cx-gap-4 cx-text-muted" style={{ textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--text-primary))'; }}
            onMouseLeave={e => { e.currentTarget.style.color = ''; }}
          >
            <Home style={{ width: '14px', height: '14px' }} />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="cx-flex cx-items-center cx-gap-4">
            <ChevronRight style={{ width: '12px', height: '12px', opacity: 0.4 }} className="cx-text-muted" />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="cx-text-muted cx-fw-500" style={{ textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--text-primary))'; }}
                onMouseLeave={e => { e.currentTarget.style.color = ''; }}
              >
                {item.label}
              </Link>
            ) : (
              <span className="cx-text-primary cx-fw-600">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
