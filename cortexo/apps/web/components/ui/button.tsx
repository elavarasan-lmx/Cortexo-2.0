'use client';

import { ButtonHTMLAttributes, CSSProperties, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg';
type ButtonColor   = 'indigo' | 'pink' | 'green' | 'red' | 'amber' | 'purple' | 'blue';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** For primary/danger variants: override the default gradient colour */
  color?: ButtonColor;
  /** Show a spinner and disable interaction */
  loading?: boolean;
  /** Label for loading state */
  loadingText?: string;
  /** Icon to show before children */
  leftIcon?: React.ReactNode;
  /** Icon to show after children */
  rightIcon?: React.ReactNode;
  /** Stretch to fill container width */
  fullWidth?: boolean;
}

const SIZE_STYLES: Record<ButtonSize, CSSProperties> = {
  xs: { fontSize: '11px', padding: '5px 10px',  borderRadius: '7px',  gap: '5px'  },
  sm: { fontSize: '12px', padding: '7px 14px',  borderRadius: '8px',  gap: '6px'  },
  md: { fontSize: '13px', padding: '9px 18px',  borderRadius: '10px', gap: '7px'  },
  lg: { fontSize: '14px', padding: '11px 22px', borderRadius: '11px', gap: '8px'  },
};

const ICON_SIZES: Record<ButtonSize, number> = { xs: 12, sm: 13, md: 14, lg: 16 };

// gradient pairs per colour
const GRADIENTS: Record<ButtonColor, [string, string]> = {
  indigo: ['#818CF8', '#6366F1'],
  pink:   ['#EC4899', '#BE185D'],
  green:  ['#10B981', '#059669'],
  red:    ['#EF4444', '#DC2626'],
  amber:  ['#F59E0B', '#D97706'],
  purple: ['#7C3AED', '#6D28D9'],
  blue:   ['#3B82F6', '#2563EB'],
};

const SHADOWS: Record<ButtonColor, string> = {
  indigo: '0 4px 14px rgba(129,140,248,0.30)',
  pink:   '0 4px 14px rgba(236,72,153,0.30)',
  green:  '0 4px 14px rgba(16,185,129,0.30)',
  red:    '0 4px 14px rgba(239,68,68,0.30)',
  amber:  '0 4px 14px rgba(245,158,11,0.30)',
  purple: '0 4px 14px rgba(124,58,237,0.30)',
  blue:   '0 4px 14px rgba(59,130,246,0.30)',
};

function getVariantStyle(
  variant: ButtonVariant,
  color: ButtonColor,
): CSSProperties {
  const [c1, c2] = GRADIENTS[color];

  switch (variant) {
    case 'primary':
      return {
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        color: '#FFFFFF',
        border: 'none',
        boxShadow: SHADOWS[color],
      };
    case 'danger':
      return {
        background: `linear-gradient(135deg, #EF4444, #DC2626)`,
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 14px rgba(239,68,68,0.30)',
      };
    case 'outline':
      return {
        background: 'transparent',
        color: c1,
        border: `1.5px solid ${c1}`,
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'rgb(var(--text-secondary))',
        border: 'none',
      };
    case 'secondary':
    default:
      return {
        background: 'transparent',
        color: 'rgb(var(--text-secondary))',
        border: '1px solid rgb(var(--border))',
      };
  }
}

/**
 * Button — shared action primitive for Cortexo dashboard.
 *
 * Usage:
 *   <Button variant="primary" color="indigo" leftIcon={<Plus />}>Add Server</Button>
 *   <Button variant="danger" loading={saving} loadingText="Deleting...">Delete</Button>
 *   <Button variant="secondary" size="sm">Cancel</Button>
 *   <Button variant="ghost" leftIcon={<Settings />}>Settings</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      color = 'indigo',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      style,
      children,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const sizeStyle   = SIZE_STYLES[size];
    const iconSize    = ICON_SIZES[size];
    const variantStyle = getVariantStyle(variant, color);
    const isDisabled  = disabled || loading;

    const base: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontFamily: 'Inter, system-ui, sans-serif',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.65 : 1,
      transition: 'opacity 120ms, transform 120ms, box-shadow 120ms',
      width: fullWidth ? '100%' : undefined,
      flexShrink: 0,
      ...sizeStyle,
      ...variantStyle,
    };

    const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        if (variant === 'primary' || variant === 'danger') {
          e.currentTarget.style.opacity = '0.92';
          e.currentTarget.style.transform = 'translateY(-1px)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.4)';
        }
      }
      onMouseEnter?.(e);
    };

    const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.opacity = isDisabled ? '0.65' : '1';
      e.currentTarget.style.transform = 'none';
      if (variant === 'ghost') e.currentTarget.style.backgroundColor = 'transparent';
      onMouseLeave?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={{ ...base, ...style }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0,
              }}
            />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {leftIcon && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  flexShrink: 0,
                }}
              >
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  flexShrink: 0,
                }}
              >
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
