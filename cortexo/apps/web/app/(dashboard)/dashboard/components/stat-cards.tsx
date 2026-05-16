'use client';

import { useCountUp } from '@/hooks/useCountUp';

/* ─── Skeleton ─── */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`cx-skeleton ${className || ''}`} style={{ ...style }} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="cx-card cx-border cx-flex-col" style={{ borderRadius: '14px', padding: '24px', gap: '16px' }}>
      <div className="cx-flex-between">
        <Skeleton style={{ width: '80px', height: '14px' }} />
        <Skeleton style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
      </div>
      <div className="cx-flex cx-items-center cx-gap-12">
        <Skeleton style={{ width: '60px', height: '32px' }} />
        <Skeleton style={{ width: '60px', height: '20px', borderRadius: '12px' }} />
      </div>
    </div>
  );
}

/* ─── StatCard ─── */
export function StatCard({ title, value, trend, color, icon: Icon, bg, urgency }: {
  title: string; value: string; trend: string; color: string;
  icon: any; bg: string; urgency?: string;
}) {
  const numericVal = parseInt(value) || 0;
  const displayValue = useCountUp(numericVal);
  const isNumeric = /^\d+$/.test(value);
  return (
    <div className="cx-card cx-border cx-flex-col" data-urgency={urgency} style={{ borderRadius: '14px', padding: '20px', gap: '12px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }} />
      <div className="cx-flex-between">
        <span className="cx-fw-600 cx-text-secondary cx-text-12">{title}</span>
        <div className="cx-flex-center cx-r-10" style={{ width: '32px', height: '32px', backgroundColor: bg }}>
          <Icon style={{ width: '16px', height: '16px', color }} />
        </div>
      </div>
      <div className="cx-flex cx-items-center cx-gap-10">
        <span className="cx-fw-700 cx-text-primary" style={{ fontSize: '28px', lineHeight: 1 }}>{isNumeric ? displayValue : value}</span>
        <span className="cx-fw-600 cx-text-muted cx-text-11" style={{ backgroundColor: 'rgba(var(--text-muted), 0.08)', padding: '3px 8px', borderRadius: '10px' }}>{trend}</span>
      </div>
    </div>
  );
}
