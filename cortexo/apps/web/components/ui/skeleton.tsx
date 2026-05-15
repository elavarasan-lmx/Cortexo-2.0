'use client';

import { ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Skeleton — loading placeholders for all components
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonProps {
  /** Width */
  width?: number | string;
  /** Height */
  height?: number;
  /** Border radius */
  radius?: number;
  /** Custom class for shimmer */
  variant?: 'shimmer' | 'pulse';
}

/**
 * Base Skeleton component with shimmer animation.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 4,
  variant = 'shimmer',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius: radius,
    animation: variant === 'shimmer' ? 'skeleton-shimmer 1.5s infinite' : 'skeleton-pulse 2s infinite',
  };

  return <div className={variant === 'shimmer' ? 'skeleton-shimmer' : 'skeleton-pulse'} style={style} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonCard — card placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonCardProps {
  /** Show header */
  header?: boolean;
  /** Show image */
  image?: boolean;
  /** Show content lines */
  lines?: number;
  /** Show footer */
  footer?: boolean;
}

export function SkeletonCard({
  header = true,
  image = false,
  lines = 3,
  footer = false,
}: SkeletonCardProps) {
  return (
    <div style={{
      backgroundColor: 'rgb(var(--surface))',
      border: '1px solid rgb(var(--border))',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {image && (
        <Skeleton height={160} radius={0} />
      )}
      <div style={{ padding: 16 }}>
        {header && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Skeleton width={40} height={40} radius={20} />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="40%" height={10} style={{ marginTop: 4 }} />
            </div>
          </div>
        )}
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? '60%' : '100%'}
            height={12}
            style={{ marginBottom: 8 }}
          />
        ))}
        {footer && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Skeleton width={60} height={24} radius={12} />
            <Skeleton width={60} height={24} radius={12} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonForm — form placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonFormProps {
  /** Number of fields */
  fields?: number;
  /** Include submit button */
  button?: boolean;
}

export function SkeletonForm({ fields = 4, button = true }: SkeletonFormProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton width={80} height={12} style={{ marginBottom: 6 }} />
          <Skeleton width="100%" height={36} />
        </div>
      ))}
      {button && <Skeleton width={100} height={36} style={{ marginTop: 8 }} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonList — list items placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonListProps {
  /** Number of items */
  items?: number;
  /** Show avatar */
  avatar?: boolean;
  /** Show action button */
  action?: boolean;
}

export function SkeletonList({ items = 5, avatar = true, action = true }: SkeletonListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {avatar && <Skeleton width={40} height={40} radius={20} />}
          <div style={{ flex: 1 }}>
            <Skeleton width="70%" height={14} />
            <Skeleton width="50%" height={10} style={{ marginTop: 4 }} />
          </div>
          {action && <Skeleton width={60} height={24} radius={12} />}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonStats — dashboard stats cards placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonStatsProps {
  /** Number of cards */
  cards?: number;
}

export function SkeletonStats({ cards = 4 }: SkeletonStatsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
      gap: 16,
    }}>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: 20,
            backgroundColor: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Skeleton width={60} height={12} />
          <Skeleton width={80} height={28} style={{ marginTop: 8 }} />
          <Skeleton width={100} height={10} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonChart — chart placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonChartProps {
  /** Show legend */
  legend?: boolean;
  /** Height */
  height?: number;
}

export function SkeletonChart({ legend = true, height = 120 }: SkeletonChartProps) {
  return (
    <div>
      <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 10px' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            width={30}
            height={40 + Math.random() * 40}
            style={{ marginTop: 'auto' }}
          />
        ))}
      </div>
      {legend && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Skeleton width={12} height={12} radius={2} />
            <Skeleton width={60} height={10} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Skeleton width={12} height={12} radius={2} />
            <Skeleton width={60} height={10} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonTimeline — timeline placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonTimelineProps {
  /** Number of items */
  items?: number;
}

export function SkeletonTimeline({ items = 4 }: SkeletonTimelineProps) {
  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute',
        left: 8,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: 'rgb(var(--border))',
      }} />
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {/* Dot */}
          <Skeleton width={12} height={12} radius={6} style={{ marginLeft: -6 }} />
          <div style={{ flex: 1 }}>
            <Skeleton width={100} height={14} />
            <Skeleton width="80%" height={12} style={{ marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonWidget — dashboard widget placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonWidgetProps {
  /** Widget title */
  title?: boolean;
  /** Widget type */
  type?: 'stat' | 'chart' | 'list' | 'table';
}

export function SkeletonWidget({ title = true, type = 'stat' }: SkeletonWidgetProps) {
  return (
    <div style={{
      backgroundColor: 'rgb(var(--surface))',
      border: '1px solid rgb(var(--border))',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
    }}>
      {title && <Skeleton width={100} height={16} style={{ marginBottom: 16 }} />}
      {type === 'stat' && <SkeletonChart legend={false} height={60} />}
      {type === 'chart' && <SkeletonChart />}
      {type === 'list' && <SkeletonList items={3} avatar={false} action={false} />}
      {type === 'table' && <SkeletonTable rows={5} columns={3} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonTable — table placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonTableProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div style={{
      backgroundColor: 'rgb(var(--surface))',
      border: '1px solid rgb(var(--border))',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        padding: '12px 16px',
        backgroundColor: 'rgb(var(--surface-hover))',
        borderBottom: '1px solid rgb(var(--border))',
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={60 + i * 20} height={12} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            padding: '12px 16px',
            borderBottom: '1px solid rgb(var(--border))',
          }}
        >
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} width={60 + j * 20} height={12} />
          ))}
        </div>
      ))}
    </div>
  );
}