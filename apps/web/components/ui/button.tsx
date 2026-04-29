'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Button — Cortexo Design System
 *
 * Premium button with 5 variants, 3 sizes, loading state, and icon support.
 * Uses CSS custom properties from globals.css for consistent theming.
 *
 * Usage:
 *   <Button>Click Me</Button>
 *   <Button variant="danger" size="sm" loading>Deleting…</Button>
 *   <Button variant="ghost" icon={<Plus />}>Add Project</Button>
 *   <Button variant="outline" iconRight={<ArrowRight />}>Next</Button>
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Render as a full-width block button */
  fullWidth?: boolean;
  /** Render as an anchor tag (link styled as button) */
  href?: string;
}

/* ── Variant Styles ── */
const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgba(var(--primary), 0.85) 100%)',
    color: 'rgb(var(--primary-foreground))',
    border: '1px solid transparent',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(var(--primary), 0.2)',
  },
  secondary: {
    backgroundColor: 'rgb(var(--surface))',
    color: 'rgb(var(--text-primary))',
    border: '1px solid rgb(var(--border))',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'rgb(var(--text-secondary))',
    border: '1px solid transparent',
  },
  danger: {
    background: 'linear-gradient(135deg, rgb(var(--danger)) 0%, rgba(var(--danger), 0.85) 100%)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: '0 1px 3px rgba(239,68,68,0.2)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'rgb(var(--primary))',
    border: '1px solid rgba(var(--primary), 0.3)',
  },
};

const variantHoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    boxShadow: '0 4px 12px rgba(var(--primary), 0.3), 0 0 0 1px rgba(var(--primary), 0.3)',
    transform: 'translateY(-1px)',
  },
  secondary: {
    backgroundColor: 'rgb(var(--surface-hover))',
    borderColor: 'rgba(var(--primary), 0.2)',
    transform: 'translateY(-1px)',
  },
  ghost: {
    backgroundColor: 'rgba(var(--primary), 0.06)',
    color: 'rgb(var(--primary))',
  },
  danger: {
    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
    transform: 'translateY(-1px)',
  },
  outline: {
    backgroundColor: 'rgba(var(--primary), 0.06)',
    borderColor: 'rgba(var(--primary), 0.5)',
    transform: 'translateY(-1px)',
  },
};

/* ── Size Styles ── */
const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)', gap: '6px' },
  md: { padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-md)', gap: '8px' },
  lg: { padding: '12px 24px', fontSize: '14px', borderRadius: 'var(--radius-md)', gap: '10px' },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className,
      style,
      href,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      lineHeight: 1,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      transition: 'all var(--transition-fast)',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      textDecoration: 'none',
      width: fullWidth ? '100%' : undefined,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      const hoverStyle = variantHoverStyles[variant];
      Object.assign(e.currentTarget.style, hoverStyle);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      // Reset hover-specific styles
      const base = { ...variantStyles[variant], transform: 'none' };
      Object.assign(e.currentTarget.style, base);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
    };

    // If href is provided, render as anchor
    if (href && !isDisabled) {
      return (
        <a
          href={href}
          className={cn('focus-ring', className)}
          style={baseStyle}
          onMouseEnter={handleMouseEnter as any}
          onMouseLeave={handleMouseLeave as any}
        >
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          {children}
          {iconRight && <span style={{ display: 'flex', alignItems: 'center' }}>{iconRight}</span>}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn('focus-ring', className)}
        style={baseStyle}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {loading ? (
          <Loader2
            style={{
              width: size === 'sm' ? '12px' : '14px',
              height: size === 'sm' ? '12px' : '14px',
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : icon ? (
          <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading && (
          <span style={{ display: 'flex', alignItems: 'center' }}>{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
