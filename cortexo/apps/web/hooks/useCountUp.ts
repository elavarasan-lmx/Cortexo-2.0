'use client';

import { useState, useEffect } from 'react';

/**
 * useCountUp - Animates a number from 0 to the target value.
 * Uses ease-out cubic for a natural "slowing down" feel.
 *
 * @param target - The final number to count up to
 * @param duration - Animation duration in ms (default: 600)
 * @returns The current animated value
 */
export function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0 || isNaN(target)) {
      setValue(0);
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}
