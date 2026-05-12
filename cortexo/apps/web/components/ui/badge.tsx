'use client';

import { CSSProperties, HTMLAttributes } from 'react';

type BadgeVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'purple'
  | 'indigo'
  | 'pink'
  | 'neutral'
  | 'running'
  | 'pending';

type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show a pulsing dot (useful for "live" / "running" states) */
  pulse?: boolean;
  /** Use uppercase text */
  uppercase?: boolean;
  children: React.ReactNode;
}

type ColorSet = { bg: string; text: string; border: string; dot: string };

const VARIANT_COLORS: Record<BadgeVariant, ColorSet> = {
  success: {
    bg: 'rgba(16,185,129,0.10)',
    text: '#10B981',
    border: 'rgba(16,185,129,0.25)',
    dot: '#10B981',
  },
  error: {
    bg: 'rgba(239,68,68,0.10)',
    text: '#EF4444',
    border: 'rgba(239,68,68,0.25)',
    dot: '#EF4444',
  },
  warning: {
    bg: 'rgba(245,158,11,0.10)',
    text: '#F59E0B',
    border: 'rgba(245,158,11,0.25)',
    dot: '#F59E0B',
  },
  info: {
    bg: 'rgba(59,130,246,0.10)',
    text: '#3B82F6',
    border: 'rgba(59,130,246,0.25)',
    dot: '#3B82F6',
  },
  purple: {
    bg: 'rgba(124,58,237,0.10)',
    text: '#7C3AED',
    border: 'rgba(124,58,237,0.25)',
    dot: '#7C3AED',
  },
  indigo: {
    bg: 'rgba(129,140,248,0.12)',
    text: '#818CF8',
    border: 'rgba(129,140,248,0.25)',
    dot: '#818CF8',
  },
  pink: {
    bg: 'rgba(236,72,153,0.10)',
    text: '#EC4899',
    border: 'rgba(236,72,153,0.25)',
    dot: '#EC4899',
  },
  neutral: {
    bg: 'rgba(var(--border),0.4)',
    text: 'rgb(var(--text-muted))',
    border: 'rgba(var(--border),0.6)',
    dot: 'rgb(var(--text-muted))',
  },
  running: {
    bg: 'rgba(59,130,246,0.10)',
    text: '#3B82F6',
    border: 'rgba(59,130,246,0.25)',
    dot: '#3B82F6',
  },
  pending: {
    bg: 'rgba(245,158,11,0.10)',
    text: '#F59E0B',
    border: 'rgba(245,158,11,0.25)',
    dot: '#F59E0B',
  },
};

const SIZE_STYLES: Record<BadgeSize, CSSProperties> = {
  xs: { fontSize: '9px',  padding: '1px 5px',   borderRadius: '4px', fontWeight: 700 },
  sm: { fontSize: '10px', padding: '2px 7px',   borderRadius: '5px', fontWeight: 700 },
  md: { fontSize: '11px', padding: '3px 9px',   borderRadius: '6px', fontWeight: 600 },
};

/**
 * Badge — shared status/label pill for Cortexo dashboard.
 *
 * Usage:
 *   <Badge variant="success">Active</Badge>
 *   <Badge variant="running" pulse size="sm">Running</Badge>
 *   <Badge variant="error" uppercase>Failed</Badge>
 *
 * Common variant mappings:
 *   deployment status  → 'success' | 'error' | 'running' | 'pending' | 'neutral'
 *   bug severity       → 'error' | 'warning' | 'info' | 'neutral'
 *   user role          → 'purple' | 'indigo' | 'neutral'
 *   pipeline status    → 'success' | 'error' | 'running' | 'pending'
 */
export function Badge({
  variant = 'neutral',
  size = 'sm',
  pulse = false,
  uppercase = false,
  style,
  children,
  ...rest
}: BadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        ...sizeStyle,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        letterSpacing: uppercase ? '0.05em' : undefined,
        textTransform: uppercase ? 'uppercase' : undefined,
        fontFamily: 'Inter, system-ui, sans-serif',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      {pulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: colors.dot,
            flexShrink: 0,
            animation: 'cortexo-pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Map common deployment/pipeline status strings to Badge variants.
 *
 * Usage:
 *   <StatusBadge status={deployment.status} />
 */
export function StatusBadge({ status, size }: { status: string; size?: BadgeSize }) {
  const s = status?.toLowerCase() ?? '';

  let variant: BadgeVariant = 'neutral';
  let pulse = false;
  let label = status;

  if (s === 'success' || s === 'completed' || s === 'passed' || s === 'active') {
    variant = 'success';
  } else if (s === 'failed' || s === 'failure' || s === 'error' || s === 'critical') {
    variant = 'error';
  } else if (s === 'running' || s === 'in_progress' || s === 'deploying') {
    variant = 'running';
    pulse = true;
    label = s === 'deploying' ? 'Deploying' : 'Running';
  } else if (s === 'pending' || s === 'queued' || s === 'waiting') {
    variant = 'pending';
  } else if (s === 'warning' || s === 'degraded') {
    variant = 'warning';
  } else if (s === 'cancelled' || s === 'skipped') {
    variant = 'neutral';
  }

  return (
    <Badge variant={variant} pulse={pulse} uppercase size={size ?? 'sm'}>
      {label}
    </Badge>
  );
}
