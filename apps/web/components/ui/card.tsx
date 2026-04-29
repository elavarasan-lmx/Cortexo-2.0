'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Card — Cortexo Design System
 *
 * Composable card system with Header / Body / Footer slots.
 * Includes StatCard, GlassCard, and GradientBorderCard variants.
 *
 * Usage:
 *   <Card>
 *     <Card.Header title="Recent Activity" action={<Button size="sm">View</Button>} />
 *     <Card.Body><p>Content here</p></Card.Body>
 *     <Card.Footer>Footer actions</Card.Footer>
 *   </Card>
 *
 *   <StatCard label="Deployments" value="142" icon={Rocket} color="#818CF8" trend="+12%" />
 *   <GlassCard>Glassmorphism content</GlassCard>
 */

/* ─── Base Card ─── */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Enable hover lift effect */
  hoverable?: boolean;
  /** Remove padding (use Card.Body for padded content) */
  noPadding?: boolean;
  /** Clickable card (adds pointer cursor) */
  onClick?: () => void;
  id?: string;
}

export function Card({ children, className, style, hoverable = false, noPadding = false, onClick, id }: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      id={id}
      className={cn('shimmer-hover', className)}
      style={{
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'box-shadow var(--transition-fast), transform var(--transition-fast), border-color var(--transition-fast)',
        cursor: onClick ? 'pointer' : hoverable ? 'default' : undefined,
        boxShadow: isHovered && hoverable ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: isHovered && hoverable ? 'translateY(-2px)' : undefined,
        borderColor: isHovered && hoverable ? 'rgba(var(--primary), 0.15)' : undefined,
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

/* ─── Card.Header ─── */
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  /** Color accent for the icon background */
  iconColor?: string;
  className?: string;
  noBorder?: boolean;
}

function CardHeader({ title, subtitle, icon, action, iconColor, className, noBorder = false }: CardHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: noBorder ? 'none' : '1px solid rgb(var(--border))',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: iconColor ? `${iconColor}12` : 'rgba(var(--primary), 0.08)',
              color: iconColor || 'rgb(var(--primary))',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgb(var(--text-primary))',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: '12px',
                color: 'rgb(var(--text-muted))',
                margin: '2px 0 0',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

/* ─── Card.Body ─── */
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
}

function CardBody({ children, className, style, noPadding = false }: CardBodyProps) {
  return (
    <div
      className={className}
      style={{
        padding: noPadding ? 0 : '16px 20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Card.Footer ─── */
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

function CardFooter({ children, className, align = 'right' }: CardFooterProps) {
  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: justifyMap[align],
        padding: '12px 20px',
        borderTop: '1px solid rgb(var(--border))',
        gap: '8px',
      }}
    >
      {children}
    </div>
  );
}

/* ── Attach sub-components ── */
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

/* ─── Stat Card ─── */
export interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  /** Is upward trend good? (default true) */
  trendGood?: boolean;
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  color,
  trend,
  trendDirection = 'up',
  trendGood = true,
  subtitle,
  onClick,
  loading = false,
}: StatCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;
  const trendColor =
    trendDirection === 'flat'
      ? 'rgb(var(--text-muted))'
      : (trendDirection === 'up') === trendGood
        ? '#10B981'
        : '#EF4444';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isHovered ? `0 8px 24px -4px ${color}25` : 'var(--shadow-sm)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Colored top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
          transition: 'height var(--transition-fast)',
          ...(isHovered ? { height: '4px' } : {}),
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgb(var(--text-muted))',
            margin: 0,
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            backgroundColor: `${color}12`,
            flexShrink: 0,
            transition: 'transform var(--transition-fast)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <Icon style={{ width: '16px', height: '16px', color }} />
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {loading ? (
          <div
            style={{
              width: '80px',
              height: '28px',
              borderRadius: '6px',
              background:
                'linear-gradient(90deg, rgba(var(--border),0.08) 25%, rgba(var(--border),0.18) 50%, rgba(var(--border),0.08) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
        ) : (
          <>
            <p style={{ fontSize: '28px', fontWeight: 700, color, margin: 0, lineHeight: 1 }}>
              {value}
            </p>
            {suffix && (
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>
                {suffix}
              </span>
            )}
          </>
        )}
      </div>

      {trend && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendIcon style={{ width: '12px', height: '12px', color: trendColor }} />
          <span style={{ fontSize: '11px', fontWeight: 500, color: trendColor }}>{trend}</span>
        </div>
      )}

      {subtitle && (
        <p style={{ marginTop: '6px', fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '6px 0 0' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Glass Card ─── */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GlassCard({ children, className, style }: GlassCardProps) {
  return (
    <div className={cn('glass-card', className)} style={{ borderRadius: 'var(--radius-lg)', padding: '20px', ...style }}>
      {children}
    </div>
  );
}

/* ─── Gradient Border Card ─── */
interface GradientBorderCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GradientBorderCard({ children, className, style }: GradientBorderCardProps) {
  return (
    <div className={cn('gradient-border', className)} style={{ padding: '20px', ...style }}>
      {children}
    </div>
  );
}
