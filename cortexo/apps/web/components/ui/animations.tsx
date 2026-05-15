'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence, Variants } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   Page Transition — wrap pages for smooth transitions
   ───────────────────────────────────────────────────────────────────────────── */

interface PageTransitionProps {
  children: ReactNode;
  /** Custom variants */
  variants?: Variants;
  /** Delay before animating (ms) */
  delay?: number;
}

const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function PageTransition({
  children,
  variants = pageVariants,
  delay = 0,
}: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Fade — simple fade in/out
   ───────────────────────────────────────────────────────────────────────────── */

interface FadeProps {
  children: ReactNode;
  /** Show the element */
  show?: boolean;
  /** Fade duration. Default: 200 */
  duration?: number;
}

export function Fade({ children, show = true, duration = 200 }: FadeProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Slide — directional slide animation
   ───────────────────────────────────────────────────────────────────────────── */

type SlideDirection = 'up' | 'down' | 'left' | 'right';

interface SlideProps {
  children: ReactNode;
  show?: boolean;
  direction?: SlideDirection;
  distance?: number;
}

const slideVariants: Record<SlideDirection, Variants> = {
  up:   { initial: { y: 20 }, animate: { y: 0 }, exit: { y: -20 } },
  down: { initial: { y: -20 }, animate: { y: 0 }, exit: { y: 20 } },
  left: { initial: { x: 20 }, animate: { x: 0 }, exit: { x: -20 } },
  right:{ initial: { x: -20 }, animate: { x: 0 }, exit: { x: 20 } },
};

export function Slide({
  children,
  show = true,
  direction = 'up',
  distance = 20,
}: SlideProps) {
  const variants: Variants = {
    initial: { opacity: 0, ...slideVariants[direction].initial },
    animate: { opacity: 1, ...slideVariants[direction].animate },
    exit:    { opacity: 0, ...slideVariants[direction].exit },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stagger — animate children with stagger delay
   ───────────────────────────────────────────────────────────────────────────── */

interface StaggerProps {
  children: ReactNode;
  /** Stagger delay between each child (ms). Default: 50 */
  delay?: number;
  /** Container animation */
  container?: Variants;
  /** Child animation */
  child?: Variants;
}

const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const staggerChild: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export function Stagger({
  children,
  delay = 50,
  container = staggerContainer,
  child = staggerChild,
}: StaggerProps) {
  return (
    <motion.div
      variants={container}
      initial="initial"
      animate="animate"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {React.Children.map(children, (c, i) => (
        <motion.div key={i} variants={child} style={{ display: 'contents' }}>
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   InView — animate when element enters viewport
   ───────────────────────────────────────────────────────────────────────────── */

interface InViewProps {
  children: ReactNode;
  /** Animation variants */
  variants?: Variants;
  /** Trigger once only. Default: true */
  once?: boolean;
  /** Margin to trigger early */
  margin?: string;
}

const inViewVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function InView({
  children,
  variants = inViewVariants,
  once = true,
  margin = '-50px',
}: InViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as any });

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Scale — scale animation on mount or toggle
   ───────────────────────────────────────────────────────────────────────────── */

interface ScaleProps {
  children: ReactNode;
  show?: boolean;
  /** Scale value when hidden. Default: 0.9 */
  scale?: number;
}

export function Scale({ children, show = true, scale = 0.9 }: ScaleProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shimmer — loading shimmer effect wrapper
   ───────────────────────────────────────────────────────────────────────────── */

interface ShimmerProps {
  children: ReactNode;
  /** Enable shimmer animation */
  shimmer?: boolean;
}

export function Shimmer({ children, shimmer = true }: ShimmerProps) {
  return (
    <motion.div
      animate={shimmer ? { opacity: [1, 0.6, 1] } : {}}
      transition={shimmer ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HoverScale — scale on hover
   ───────────────────────────────────────────────────────────────────────────── */

interface HoverScaleProps {
  children: ReactNode;
  /** Scale on hover. Default: 1.02 */
  scale?: number;
}

export function HoverScale({ children, scale = 1.02 }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Breathe — subtle pulsing animation for attention
   ───────────────────────────────────────────────────────────────────────────── */

interface BreatheProps {
  children: ReactNode;
  /** Animation duration. Default: 2 */
  duration?: number;
}

export function Breathe({ children, duration = 2 }: BreatheProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}