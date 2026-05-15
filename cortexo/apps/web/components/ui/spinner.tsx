'use client';

import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   Spinner — animated loading spinner
   ───────────────────────────────────────────────────────────────────────────── */

interface SpinnerProps {
  /** Spinner size in px. Default: 24 */
  size?: number;
  /** Stroke width. Default: 2 */
  strokeWidth?: number;
  /** Color. Default: primary */
  color?: string;
  /** Label text below spinner */
  label?: string;
  /** Center the spinner */
  center?: boolean;
}

export function Spinner({
  size = 24,
  strokeWidth = 2,
  color = 'rgb(var(--primary))',
  label,
  center = false,
}: SpinnerProps) {
  const containerStyle: React.CSSProperties = center
    ? { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }
    : { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 };

  return (
    <div style={containerStyle}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={size * 1.5}
          style={{ opacity: 0.2 }}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            strokeDasharray: size,
            strokeDashoffset: size * 0.75,
          }}
        />
      </svg>
      {label && (
        <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>{label}</span>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LoadingDots — animated loading dots
   ───────────────────────────────────────────────────────────────────────────── */

interface LoadingDotsProps {
  /** Number of dots. Default: 3 */
  dots?: number;
  /** Dot size in px. Default: 8 */
  size?: number;
  /** Color */
  color?: string;
  /** Label text */
  label?: string;
}

export function LoadingDots({
  dots = 3,
  size = 8,
  color = 'rgb(var(--primary))',
  label,
}: LoadingDotsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {Array.from({ length: dots }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        ))}
      </div>
      {label && (
        <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>{label}</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LoadingRing — multiple ring spinner
   ───────────────────────────────────────────────────────────────────────────── */

interface LoadingRingProps {
  /** Ring size in px. Default: 40 */
  size?: number;
  /** Ring count. Default: 3 */
  rings?: number;
  /** Color */
  color?: string;
}

export function LoadingRing({
  size = 40,
  rings = 3,
  color = 'rgb(var(--primary))',
}: LoadingRingProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2px solid transparent`,
            borderTopColor: color,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2 - i * 0.2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonLine — loading text line placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonLineProps {
  /** Width percentage or px */
  width?: number | string;
  /** Height in px. Default: 14 */
  height?: number;
  /** Rounded corners. Default: 4 */
  radius?: number;
}

export function SkeletonLine({
  width = '100%',
  height = 14,
  radius = 4,
}: SkeletonLineProps) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonText — multiple skeleton lines
   ───────────────────────────────────────────────────────────────────────────── */

interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;
  /** Last line width (percentage). Default: 60 */
  lastLineWidth?: number;
  /** Gap between lines. Default: 8 */
  gap?: number;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = 60,
  gap = 8,
}: SkeletonTextProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? `${lastLineWidth}%` : '100%'}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LoadingOverlay — full-screen or container loading state
   ───────────────────────────────────────────────────────────────────────────── */

interface LoadingOverlayProps {
  /** Show overlay */
  show?: boolean;
  /** Overlay message */
  message?: string;
  /** Cover entire viewport */
  fullScreen?: boolean;
}

export function LoadingOverlay({
  show = true,
  message = 'Loading...',
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: fullScreen ? 'fixed' : 'absolute',
        inset: fullScreen ? 0 : 0,
        backgroundColor: fullScreen ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: fullScreen ? 9999 : 10,
        borderRadius: fullScreen ? 0 : undefined,
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: 20,
        backgroundColor: 'rgb(var(--surface))',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <Spinner size={32} />
        <span style={{ fontSize: 13, color: 'rgb(var(--text-secondary))' }}>
          {message}
        </span>
      </div>
    </motion.div>
  );
}