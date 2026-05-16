'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Deployment } from '@/lib/api';
import { Skeleton } from './stat-cards';

interface ChartTooltip {
  show: boolean;
  x: number;
  y: number;
  value: number;
  label: string;
}

export function ChartSkeleton() {
  return (
    <div className="cx-card cx-border" style={{ padding: '24px' }}>
      <div className="cx-flex-between cx-mb-24">
        <Skeleton style={{ width: '180px', height: '16px' }} />
        <Skeleton style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
      </div>
      <Skeleton style={{ height: '240px' }} />
    </div>
  );
}

export function ChartLine({ d }: { d: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke="#8B5CF6"
      strokeWidth="3"
      className="cx-chart-line"
      style={{ '--path-length': pathLength } as React.CSSProperties}
    />
  );
}

export function DeploymentChart({ deployments, isLoading }: { deployments: Deployment[]; isLoading: boolean }) {
  const [chartTooltip, setChartTooltip] = useState<ChartTooltip>({ show: false, x: 0, y: 0, value: 0, label: '' });

  // Chart data
  const chartData = useMemo(() => {
    const allDeploys = deployments || [];
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: number[] = [];
    const labels: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const count = allDeploys.filter((dep: Deployment) => {
        const t = new Date(dep.createdAt).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      }).length;
      counts.push(count);
      labels.push(days[d.getDay()]);
    }
    return { counts, labels };
  }, [deployments]);

  // Chart path
  const chartPath = useMemo(() => {
    const { counts } = chartData;
    const maxVal = Math.max(...counts, 1);
    const w = 800, h = 220, padding = 10;
    const points = counts.map((v, i) => ({
      x: padding + (i / (counts.length - 1)) * (w - padding * 2),
      y: h - padding - (v / maxVal) * (h - padding * 2),
    }));

    if (points.length < 2) return { line: '', area: '', dots: [] };

    let line = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpx = (points[i].x + points[i + 1].x) / 2;
      line += ` C${cpx},${points[i].y} ${cpx},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
    }

    const area = `${line} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
    return { line, area, dots: points };
  }, [chartData]);

  if (isLoading) return <ChartSkeleton />;

  return (
    <div className="cx-card cx-border" style={{ padding: '24px', position: 'relative' }}>
      <div className="cx-flex-between cx-mb-24">
        <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Deployment Activity (7 Days)</h2>
        <span className="cx-fw-600" style={{ fontSize: '12px', color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
          {chartData.counts.reduce((a, b) => a + b, 0)} deploys
        </span>
      </div>
      <div style={{ height: '240px', width: '100%', position: 'relative' }} onMouseLeave={() => setChartTooltip(t => ({ ...t, show: false }))}>
        <svg viewBox="0 0 800 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0)" />
            </linearGradient>
          </defs>
          {chartPath.area && <path d={chartPath.area} fill="url(#chartGradient)" className="cx-chart-area" />}
          {chartPath.line && (
            <ChartLine d={chartPath.line} />
          )}
          {chartPath.dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x} cy={dot.y} r="4"
              fill="#8B5CF6"
              className="cx-chart-dot"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => {
                setChartTooltip({ show: true, x: dot.x, y: dot.y - 40, value: chartData.counts[i], label: chartData.labels[i] });
              }}
            />
          ))}
        </svg>
        {/* Tooltip */}
        {chartTooltip.show && (
          <div style={{
            position: 'absolute', left: `${(chartTooltip.x / 800) * 100}%`, top: chartTooltip.y,
            transform: 'translateX(-50%)', backgroundColor: '#1f2937', color: '#fff',
            padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
            whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            {chartTooltip.label}: {chartTooltip.value} deploys
          </div>
        )}
      </div>
      <div className="cx-flex-between cx-text-muted cx-fw-500" style={{ marginTop: '16px', fontSize: '11px', textTransform: 'uppercase' }}>
        {chartData.labels.map((label, i) => (
          <span key={i} className="cx-flex-col cx-flex-center cx-gap-2">
            {label}
            <span className="cx-fw-600 cx-text-primary cx-text-10">{chartData.counts[i]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function EnvironmentBreakdown({ deployments }: { deployments: Deployment[] }) {
  const envBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    (deployments || []).forEach((d: Deployment) => {
      const env = d.environment || 'unknown';
      counts[env] = (counts[env] || 0) + 1;
    });
    return counts;
  }, [deployments]);

  if (Object.keys(envBreakdown).length === 0) return null;

  return (
    <div className="cx-card cx-border" style={{ padding: '20px' }}>
      <h3 className="cx-fw-600 cx-text-primary cx-text-14" style={{ margin: '0 0 16px 0' }}>Deployments by Environment</h3>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {Object.entries(envBreakdown).map(([env, count]) => {
          const colors: Record<string, string> = { production: '#10B981', staging: '#F59E0B', development: '#3B82F6', dev: '#3B82F6', prod: '#10B981', unknown: '#6B7280' };
          return (
            <div key={env} className="cx-flex cx-items-center cx-gap-8" style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: `${colors[env.toLowerCase()] || '#6B7280'}15` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: colors[env.toLowerCase()] || '#6B7280' }} />
              <span className="cx-fw-600 cx-text-primary cx-text-13" style={{ textTransform: 'capitalize' }}>{env}</span>
              <span className="cx-text-muted cx-text-12">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
