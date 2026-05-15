'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Tooltip content */
  content: ReactNode;
  /** Trigger element */
  children: ReactNode;
  /** Position relative to trigger. Default: top */
  position?: TooltipPosition;
  /** Delay before showing (ms). Default: 300 */
  delay?: number;
  /** Disable tooltip */
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!visible || disabled) return;

    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const positions: Record<TooltipPosition, { x: number; y: number }> = {
      top:    { x: rect.left + scrollX + rect.width / 2, y: rect.top + scrollY - 8 },
      bottom: { x: rect.left + scrollX + rect.width / 2, y: rect.bottom + scrollY + 8 },
      left:   { x: rect.left + scrollX - 8, y: rect.top + scrollY + rect.height / 2 },
      right:  { x: rect.right + scrollX + 8, y: rect.top + scrollY + rect.height / 2 },
    };

    setCoords(positions[position]);
  }, [visible, position, disabled]);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = window.setTimeout(() => setVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const positionStyles: Record<TooltipPosition, { transform: string; anchorX: string; anchorY: string }> = {
    top:    { transform: 'translate(-50%, -100%)', anchorX: 'center', anchorY: 'bottom' },
    bottom: { transform: 'translate(-50%, 0)', anchorX: 'center', anchorY: 'top' },
    left:   { transform: 'translate(-100%, -50%)', anchorX: 'right', anchorY: 'center' },
    right:  { transform: 'translate(0, -50%)', anchorX: 'left', anchorY: 'center' },
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </div>
      {visible && !disabled && (
        <div
          style={{
            position: 'absolute',
            left: coords.x,
            top: coords.y,
            ...positionStyles[position],
            zIndex: 9999,
            padding: '6px 10px',
            backgroundColor: 'rgb(var(--text-primary))',
            color: 'rgb(var(--surface))',
            fontSize: 12,
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'tooltip-in 150ms ease-out',
          }}
        >
          {content}
        </div>
      )}
      <style>{`
        @keyframes tooltip-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}