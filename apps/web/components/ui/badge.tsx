'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge — Cortexo Design System
 *
 * Status badges with color variants, sizes, and optional dot/pulse indicator.
 *
 * Usage:
 *   <Badge variant="success">Online</Badge>
 *   <Badge variant="error" dot>3 Errors</Badge>
 *   <Badge variant="agent" pulse>AI Active</Badge>
 *   <Badge variant="neutral" size="sm">v2.1</Badge>
 */

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'agent' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show a dot indicator before the label */
  dot?: boolean;
  /** Animate the dot with a pulse */
  pulse?: boolean;
  /** Custom icon before the label */
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const variantConfig: Record<BadgeVariant, { color: string; bg: string; border: string }> = {
  success: {
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  error: {
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
  },
  warning: {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  info: {
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  agent: {
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.1)',
    border: 'rgba(167, 139, 250, 0.2)',
  },
  neutral: {
    color: 'rgb(var(--text-secondary))',
    bg: 'rgba(var(--border), 0.15)',
    border: 'rgb(var(--border))',
  },
  primary: {
    color: 'rgb(var(--primary))',
    bg: 'rgba(var(--primary), 0.1)',
    border: 'rgba(var(--primary), 0.2)',
  },
};

const sizeConfig: Record<BadgeSize, React.CSSProperties> = {
  sm: { padding: '2px 8px', fontSize: '10px', gap: '4px' },
  md: { padding: '4px 10px', fontSize: '11px', gap: '6px' },
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  icon,
  className,
  style,
  onClick,
}: BadgeProps) {
  const config = variantConfig[variant];

  return (
    <span
      className={cn(className)}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)',
        ...sizeConfig[size],
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.color,
            flexShrink: 0,
            animation: pulse ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          }}
        />
      )}
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      )}
      {children}
    </span>
  );
}

/* ─── StatusDot — Standalone status indicator ─── */
export interface StatusDotProps {
  status: 'online' | 'offline' | 'warning' | 'idle';
  size?: number;
  pulse?: boolean;
  label?: string;
}

const dotColors: Record<StatusDotProps['status'], string> = {
  online: '#10B981',
  offline: '#EF4444',
  warning: '#F59E0B',
  idle: 'rgb(var(--text-muted))',
};

export function StatusDot({ status, size = 8, pulse = true, label }: StatusDotProps) {
  const color = dotColors[status];

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: status === 'online' ? `0 0 6px ${color}60` : undefined,
          animation: pulse && status === 'online' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }}
      />
      {label && (
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-secondary))' }}>
          {label}
        </span>
      )}
    </span>
  );
}
