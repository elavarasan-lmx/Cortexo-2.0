'use client';

import { useMemo } from 'react';
import { MetaText } from './primitives';

type ChartType = 'line' | 'bar' | 'area';

interface DataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  /** Chart data points */
  data: DataPoint[];
  /** Chart type */
  type?: ChartType;
  /** Chart height in px. Default: 120 */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Primary color. Default: primary */
  color?: string;
  /** Secondary color for area fill */
  fillColor?: string;
  /** Title above chart */
  title?: string;
  /** Subtitle / value display */
  subtitle?: string;
  /** Format value label */
  formatValue?: (value: number) => string;
}

/**
 * Chart — lightweight SVG chart (line, bar, area).
 * No external chart library required.
 *
 * Usage:
 *   <Chart
 *     data={[{ label: 'Mon', value: 10 }, { label: 'Tue', value: 20 }]}
 *     type="area"
 *     height={100}
 *   />
 */
export function Chart({
  data,
  type = 'line',
  height = 120,
  showGrid = true,
  color = 'rgb(var(--primary))',
  fillColor,
  title,
  subtitle,
  formatValue = (v) => v.toString(),
}: ChartProps) {
  const { points, minValue, maxValue, path, areaPath, barWidth } = useMemo(() => {
    if (data.length === 0) return { points: [], minValue: 0, maxValue: 100, path: '', areaPath: '', barWidth: 0 };

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = 20;
    const graphHeight = height - padding * 2;
    const graphWidth = 100; // percent

    const barWidth = Math.min(80 / data.length, 8);

    const computedPoints = data.map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * graphWidth;
      const y = padding + graphHeight - ((d.value - min) / range) * graphHeight;
      return { x, y, ...d };
    });

    const linePath = computedPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const area = fillColor
      ? `${linePath} L ${computedPoints[computedPoints.length - 1].x} ${height - padding} L ${computedPoints[0].x} ${height - padding} Z`
      : '';

    return { points: computedPoints, minValue: min, maxValue: max, path: linePath, areaPath: area, barWidth };
  }, [data, height, fillColor]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ width: '100%' }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 12 }}>
          {title && <MetaText bold>{title}</MetaText>}
          {subtitle && <div style={{ fontSize: 20, fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{subtitle}</div>}
        </div>
      )}

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {showGrid && (
          <>
            {[0.25, 0.5, 0.75].map((pos) => (
              <line
                key={pos}
                x1={0}
                y1={height * pos}
                x2={100}
                y2={height * pos}
                stroke="rgb(var(--border))"
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            ))}
          </>
        )}

        {/* Area fill */}
        {type === 'area' && fillColor && areaPath && (
          <path d={areaPath} fill={fillColor} opacity={0.3} />
        )}

        {/* Line or Area line */}
        {(type === 'line' || type === 'area') && (
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Bars */}
        {type === 'bar' && points.map((p, i) => {
          const barHeight = ((p.value - minValue) / (maxValue - minValue || 1)) * (height - 40);
          return (
            <rect
              key={i}
              x={p.x - barWidth / 2}
              y={height - 20 - barHeight}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={barWidth / 2}
            />
          );
        })}

        {/* Data points */}
        {(type === 'line' || type === 'area') && points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill="rgb(var(--surface))"
            stroke={color}
            strokeWidth={1.5}
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 10px',
        marginTop: 4,
      }}>
        {points.map((p, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              color: 'rgb(var(--text-muted))',
              textAlign: 'center',
              flex: 1,
            }}
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Legend if multiple series (future extension) */}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MiniChart — compact sparkline for inline use
   ───────────────────────────────────────────────────────────────────────────── */

interface MiniChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function MiniChart({ data, color = 'rgb(var(--primary))', width = 60, height = 24 }: MiniChartProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}