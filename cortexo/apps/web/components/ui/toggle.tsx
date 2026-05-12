'use client';

import { CSSProperties, InputHTMLAttributes, useId } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Controlled checked state */
  checked: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Label shown to the right of the toggle */
  label?: string;
  /** Secondary description below the label */
  description?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Active track colour */
  accentColor?: string;
  /** Reverse layout — label on left, toggle on right */
  reverse?: boolean;
  /** Custom wrapper style */
  wrapperStyle?: CSSProperties;
}

type SizeDef = { track: { w: number; h: number }; thumb: number; thumbOff: number };

const SIZES: Record<'sm' | 'md' | 'lg', SizeDef> = {
  sm: { track: { w: 32, h: 18 }, thumb: 12, thumbOff: 3 },
  md: { track: { w: 40, h: 22 }, thumb: 16, thumbOff: 3 },
  lg: { track: { w: 48, h: 26 }, thumb: 20, thumbOff: 3 },
};

/**
 * Toggle — shared accessible switch / checkbox for Cortexo.
 *
 * Usage:
 *   <Toggle checked={enabled} onCheckedChange={setEnabled} label="Auto-deploy" />
 *   <Toggle checked={val} onCheckedChange={fn} description="Push to prod on merge" reverse />
 */
export function Toggle({
  checked,
  onCheckedChange,
  label,
  description,
  size = 'md',
  accentColor = '#818CF8',
  reverse = false,
  disabled = false,
  wrapperStyle,
  style,
  ...rest
}: ToggleProps) {
  const id = useId();
  const s = SIZES[size];

  const trackOn  = accentColor;
  const trackOff = 'rgba(var(--border), 1)';
  const thumbPos = checked ? s.track.w - s.thumb - s.thumbOff : s.thumbOff;

  const labelFontSize = size === 'sm' ? '12px' : size === 'lg' ? '15px' : '13px';
  const descFontSize  = size === 'sm' ? '10px' : '11px';

  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexDirection: reverse ? 'row-reverse' : 'row',
        justifyContent: reverse ? 'space-between' : 'flex-start',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        ...wrapperStyle,
      }}
    >
      {/* Hidden native checkbox for accessibility */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
          margin: 0,
          ...style,
        }}
        {...rest}
      />

      {/* Visual track */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: `${s.track.w}px`,
          height: `${s.track.h}px`,
          borderRadius: `${s.track.h}px`,
          backgroundColor: checked ? trackOn : trackOff,
          transition: 'background-color 200ms ease',
          flexShrink: 0,
          boxShadow: checked ? `0 0 0 0px ${accentColor}40` : 'none',
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: `${s.thumbOff}px`,
            left: `${thumbPos}px`,
            width: `${s.thumb}px`,
            height: `${s.thumb}px`,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            transition: 'left 180ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* Text */}
      {(label || description) && (
        <div style={{ minWidth: 0 }}>
          {label && (
            <span
              style={{
                display: 'block',
                fontSize: labelFontSize,
                fontWeight: 600,
                color: 'rgb(var(--text-primary))',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: 1.3,
              }}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              style={{
                display: 'block',
                fontSize: descFontSize,
                color: 'rgb(var(--text-muted))',
                fontFamily: 'Inter, system-ui, sans-serif',
                marginTop: '2px',
                lineHeight: 1.4,
              }}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
