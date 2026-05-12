'use client';

import { CSSProperties, HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'default' | 'flat' | 'glass';
type CardAccent = 'none' | 'indigo' | 'pink' | 'green' | 'amber' | 'red' | 'blue' | 'purple';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style of the card */
  variant?: CardVariant;
  /** Coloured left-border accent */
  accent?: CardAccent;
  /** Remove all padding (useful when you want custom inner padding) */
  noPad?: boolean;
  /** Extra padding size */
  pad?: 'sm' | 'md' | 'lg';
  /** Hover lift effect */
  hoverable?: boolean;
}

const ACCENT_COLORS: Record<CardAccent, string> = {
  none:   'transparent',
  indigo: '#818CF8',
  pink:   '#EC4899',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  blue:   '#3B82F6',
  purple: '#7C3AED',
};

const ACCENT_SHADOWS: Record<CardAccent, string> = {
  none:   'none',
  indigo: '0 4px 20px rgba(129,140,248,0.10)',
  pink:   '0 4px 20px rgba(236,72,153,0.10)',
  green:  '0 4px 20px rgba(16,185,129,0.10)',
  amber:  '0 4px 20px rgba(245,158,11,0.10)',
  red:    '0 4px 20px rgba(239,68,68,0.10)',
  blue:   '0 4px 20px rgba(59,130,246,0.10)',
  purple: '0 4px 20px rgba(124,58,237,0.10)',
};

const PAD: Record<'sm' | 'md' | 'lg', string> = {
  sm: '12px 14px',
  md: '16px 20px',
  lg: '24px 28px',
};

/**
 * Card — shared surface primitive for Cortexo dashboard panels.
 *
 * Usage:
 *   <Card accent="indigo" hoverable pad="md">...</Card>
 *   <Card variant="flat" noPad>...</Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      accent = 'none',
      noPad = false,
      pad = 'md',
      hoverable = false,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const accentColor = ACCENT_COLORS[accent];
    const baseStyle: CSSProperties = {
      borderRadius: '16px',
      backgroundColor:
        variant === 'glass'
          ? 'rgba(var(--surface-rgb), 0.6)'
          : 'rgb(var(--card))',
      border: variant === 'flat'
        ? 'none'
        : `1px solid rgb(var(--border))`,
      borderLeft: accent !== 'none' ? `3px solid ${accentColor}` : undefined,
      boxShadow: hoverable ? ACCENT_SHADOWS[accent] : 'none',
      padding: noPad ? 0 : PAD[pad],
      position: 'relative',
      overflow: 'hidden',
      transition: hoverable
        ? 'transform 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1)'
        : undefined,
    };

    const handleEnter = hoverable
      ? (e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow =
            accent !== 'none'
              ? ACCENT_SHADOWS[accent].replace('0.10)', '0.20)')
              : '0 8px 24px rgba(0,0,0,0.12)';
          rest.onMouseEnter?.(e);
        }
      : rest.onMouseEnter;

    const handleLeave = hoverable
      ? (e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = hoverable ? ACCENT_SHADOWS[accent] : 'none';
          rest.onMouseLeave?.(e);
        }
      : rest.onMouseLeave;

    return (
      <div
        ref={ref}
        style={{ ...baseStyle, ...style }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

/** Thin section header bar used inside cards / above card grids */
export function CardHeader({
  title,
  description,
  icon,
  action,
  accent = 'indigo',
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  accent?: CardAccent;
}) {
  const accentColor = ACCENT_COLORS[accent];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 22px',
        borderRadius: '14px',
        background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}05)`,
        border: `1px solid ${accentColor}26`,
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {icon && (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '11px',
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${accentColor}40`,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 800,
              color: 'rgb(var(--text-primary))',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {title}
          </h2>
          {description && (
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '12px',
                color: 'rgb(var(--text-muted))',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
