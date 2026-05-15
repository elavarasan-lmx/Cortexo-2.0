'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   AnimatedCard — card with hover/tap animations
   ───────────────────────────────────────────────────────────────────────────── */

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Hover scale. Default: 1.01 */
  hoverScale?: number;
  /** Hover shadow increase */
  hoverShadow?: boolean;
  /** Enable tap animation */
  tapScale?: number;
  /** Card border on hover */
  borderOnHover?: boolean;
}

/**
 * AnimatedCard — pro-level card with smooth hover/tap animations.
 *
 * Usage:
 *   <AnimatedCard hoverShadow borderOnHover>
 *     <Card>Content</Card>
 *   </AnimatedCard>
 */
export function AnimatedCard({
  children,
  hoverScale = 1.01,
  hoverShadow = true,
  tapScale = 0.98,
  borderOnHover = false,
  style,
  ...rest
}: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{
        scale: hoverScale,
        boxShadow: hoverShadow
          ? '0 20px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(var(--primary), 0.1)'
          : undefined,
      }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GlowCard — card with animated gradient border glow
   ───────────────────────────────────────────────────────────────────────────── */

interface GlowCardProps {
  children: ReactNode;
  /** Glow color. Default: primary */
  glowColor?: string;
  /** Glow intensity. Default: 0.5 */
  intensity?: number;
  /** Pulse animation */
  pulse?: boolean;
}

export function GlowCard({
  children,
  glowColor = 'rgb(var(--primary))',
  intensity = 0.5,
  pulse = false,
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'rgb(var(--surface))',
        padding: 1,
      }}
    >
      {/* Glow border */}
      <div
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'var(--radius-lg)',
          background: glowColor,
          opacity: intensity,
          animation: pulse ? 'glow-pulse 2s ease-in-out infinite' : undefined,
        }}
      />
      {/* Inner content */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgb(var(--surface))',
          height: '100%',
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: ${intensity}; }
          50% { opacity: ${intensity * 0.5}; }
        }
      `}</style>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Glass — glassmorphism container
   ───────────────────────────────────────────────────────────────────────────── */

interface GlassProps {
  children: ReactNode;
  /** Blur amount in px. Default: 12 */
  blur?: number;
  /** Background opacity. Default: 0.7 */
  opacity?: number;
  /** Border opacity. Default: 0.2 */
  borderOpacity?: number;
  /** Add hover effect */
  interactive?: boolean;
}

export function Glass({
  children,
  blur = 12,
  opacity = 0.7,
  borderOpacity = 0.2,
  interactive = false,
}: GlassProps) {
  return (
    <motion.div
      whileHover={interactive ? { scale: 1.01 } : {}}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DarkGlass — dark theme glassmorphism
   ───────────────────────────────────────────────────────────────────────────── */

interface DarkGlassProps extends GlassProps {}

export function DarkGlass(props: DarkGlassProps) {
  return (
    <Glass
      {...props}
      opacity={0.8}
      borderOpacity={0.1}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GradientBorder — element with animated gradient border
   ───────────────────────────────────────────────────────────────────────────── */

interface GradientBorderProps {
  children: ReactNode;
  /** Gradient colors */
  colors?: string[];
  /** Border width. Default: 2 */
  width?: number;
  /** Animation speed. Default: 2 */
  duration?: number;
}

const DEFAULT_COLORS = [
  'rgb(var(--primary))',
  'rgb(var(--agent))',
  'rgb(var(--success))',
  'rgb(var(--primary))',
];

export function GradientBorder({
  children,
  colors = DEFAULT_COLORS,
  width = 2,
  duration = 2,
}: GradientBorderProps) {
  return (
    <div
      style={{
        position: 'relative',
        padding: width,
        borderRadius: 'var(--radius-lg)',
        background: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: '200% 100%',
        animation: `gradient-flow ${duration}s linear infinite`,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgb(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          height: '100%',
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes gradient-flow {
          from { background-position: 0% 0; }
          to { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Spotlight — mouse-follow spotlight effect
   ───────────────────────────────────────────────────────────────────────────── */

import { useState, useRef } from 'react';

interface SpotlightProps {
  children: ReactNode;
  /** Spotlight radius. Default: 100 */
  radius?: number;
}

export function Spotlight({ children, radius = 100 }: SpotlightProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: -100, y: -100 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          left: position.x - radius,
          top: position.y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--primary), 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          transition: 'opacity 300ms',
          opacity: position.x > 0 ? 1 : 0,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NoiseOverlay — subtle noise texture overlay
   ───────────────────────────────────────────────────────────────────────────── */

interface NoiseOverlayProps {
  opacity?: number;
}

export function NoiseOverlay({ opacity = 0.03 }: NoiseOverlayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BentoGrid — flexible grid for card layouts
   ───────────────────────────────────────────────────────────────────────────── */

interface BentoGridProps {
  children: ReactNode;
  /** Number of columns. Default: 3 */
  columns?: number;
  /** Gap between items. Default: 16 */
  gap?: number;
}

export function BentoGrid({
  children,
  columns = 3,
  gap = 16,
}: BentoGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: ReactNode;
  /** Span columns. Default: 1 */
  colSpan?: number;
  /** Span rows. Default: 1 */
  rowSpan?: number;
}

export function BentoItem({ children, colSpan = 1, rowSpan = 1 }: BentoItemProps) {
  return (
    <div
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      {children}
    </div>
  );
}