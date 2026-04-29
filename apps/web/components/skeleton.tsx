'use client';

import React from 'react';

/**
 * Skeleton — premium shimmer loading placeholder.
 * Use instead of Loader2 spinners for a polished loading UX.
 *
 * Usage:
 *   <Skeleton width="120px" height="16px" />
 *   <Skeleton width="100%" height="40px" radius="12px" />
 *   <SkeletonRow />          — full-width table row skeleton
 *   <SkeletonCard />         — stat card skeleton
 *   <SkeletonTable rows={5} /> — table skeleton
 */

export function Skeleton({
  width = '100%',
  height = '14px',
  radius = '6px',
  style,
}: {
  width?: string;
  height?: string;
  radius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(var(--border),0.08) 25%, rgba(var(--border),0.18) 50%, rgba(var(--border),0.08) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
      <Skeleton width="32px" height="32px" radius="8px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="13px" style={{ marginBottom: '6px' }} />
        <Skeleton width="40%" height="10px" />
      </div>
      <Skeleton width="60px" height="20px" radius="10px" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      padding: '20px', borderRadius: '14px',
      border: '1px solid rgba(var(--border),0.1)',
      backgroundColor: 'rgb(var(--surface))',
    }}>
      <Skeleton width="80px" height="10px" style={{ marginBottom: '12px' }} />
      <Skeleton width="100px" height="28px" style={{ marginBottom: '8px' }} />
      <Skeleton width="60%" height="10px" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ borderRadius: '12px', border: '1px solid rgba(var(--border),0.1)', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(var(--border),0.08)' }}>
        <Skeleton width="200px" height="10px" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ borderBottom: i < rows - 1 ? '1px solid rgba(var(--border),0.05)' : 'none' }}>
          <SkeletonRow />
        </div>
      ))}
    </div>
  );
}
