'use client';

/**
 * Reusable page loading skeleton — shimmer animation for dashboard pages.
 * Renders a title bar + stat cards + content area placeholder.
 */
export function PageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'rgb(var(--border))' }} />
        <div style={{ width: '180px', height: '22px', borderRadius: '6px', backgroundColor: 'rgb(var(--border))' }} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: '12px', marginBottom: '24px' }}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgb(var(--border))' }}>
            <div style={{ width: '60px', height: '12px', borderRadius: '4px', backgroundColor: 'rgb(var(--border))', marginBottom: '12px' }} />
            <div style={{ width: '80px', height: '28px', borderRadius: '6px', backgroundColor: 'rgb(var(--border))', marginBottom: '8px' }} />
            <div style={{ width: '100px', height: '10px', borderRadius: '4px', backgroundColor: 'rgb(var(--border))' }} />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgb(var(--border))' }}>
        <div style={{ width: '120px', height: '14px', borderRadius: '4px', backgroundColor: 'rgb(var(--border))', marginBottom: '16px' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ width: `${90 - i * 15}%`, height: '12px', borderRadius: '4px', backgroundColor: 'rgb(var(--border))', marginBottom: '10px' }} />
        ))}
      </div>
    </div>
  );
}
