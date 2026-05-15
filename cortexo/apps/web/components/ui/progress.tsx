'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Progress — linear progress bar with animated fill
   ───────────────────────────────────────────────────────────────────────────── */

interface ProgressProps {
  /** Current value (0-100) */
  value: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Bar height. Default: 8 */
  size?: number;
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Animated striped pattern */
  striped?: boolean;
  /** Show indeterminate loading */
  indeterminate?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

const VARIANT_COLORS = {
  primary:  'rgb(var(--primary))',
  success:  'rgb(var(--success))',
  warning:  'rgb(var(--warning))',
  danger:   'rgb(var(--danger))',
};

export function Progress({
  value,
  showLabel = false,
  size = 8,
  variant = 'primary',
  striped = false,
  indeterminate = false,
  fullWidth = false,
}: ProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(indeterminate ? 0 : value);

  useEffect(() => {
    if (indeterminate) {
      const interval = setInterval(() => {
        setAnimatedValue((v) => (v >= 100 ? 0 : v + 5));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAnimatedValue(value);
    }
  }, [value, indeterminate]);

  const color = VARIANT_COLORS[variant];

  return (
    <div style={{ width: fullWidth ? '100%' : '100%' }}>
      {(showLabel || indeterminate) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          fontSize: 12,
          color: 'rgb(var(--text-secondary))',
        }}>
          <span>{indeterminate ? 'Loading...' : `${Math.round(animatedValue)}%`}</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: size,
        backgroundColor: 'rgb(var(--surface-hover))',
        borderRadius: size / 2,
        overflow: 'hidden',
      }}>
        <motion.div
          animate={
            indeterminate
              ? { x: ['-100%', '100%'] }
              : { width: `${animatedValue}%` }
          }
          transition={
            indeterminate
              ? { duration: 1, repeat: Infinity, ease: 'linear' }
              : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
          }
          style={{
            height: '100%',
            backgroundColor: color,
            borderRadius: size / 2,
            backgroundImage: striped
              ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
              : undefined,
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CircularProgress — circular ring progress
   ───────────────────────────────────────────────────────────────────────────── */

interface CircularProgressProps {
  value: number;
  /** Diameter in px. Default: 48 */
  size?: number;
  /** Stroke width. Default: 4 */
  strokeWidth?: number;
  /** Show percentage in center */
  showLabel?: boolean;
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export function CircularProgress({
  value,
  size = 48,
  strokeWidth = 4,
  showLabel = true,
  variant = 'primary',
}: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const color = VARIANT_COLORS[variant];

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--surface-hover))"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.28,
          fontWeight: 600,
          color: 'rgb(var(--text-primary))',
        }}>
          {Math.round(animatedValue)}%
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StepProgress — multi-step progress indicator
   ───────────────────────────────────────────────────────────────────────────── */

interface Step {
  label: string;
  /** Completed state */
  completed?: boolean;
  /** Current/active state */
  active?: boolean;
}

interface StepProgressProps {
  steps: Step[];
  /** Current step index (0-based) */
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: isCompleted || isActive ? 'rgb(var(--primary))' : 'rgb(var(--surface-hover))',
                  color: isCompleted || isActive ? '#fff' : 'rgb(var(--text-muted))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'all 200ms',
                }}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              <span
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  color: isActive ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: '0 8px 16px',
                  backgroundColor: isCompleted ? 'rgb(var(--primary))' : 'rgb(var(--border))',
                  transition: 'background-color 200ms',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}