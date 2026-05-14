'use client';

/**
 * Cortexo UI Primitives — Micro Components
 *
 * Eliminates the most frequent inline style patterns across dashboard pages.
 *
 * Usage:
 *   import { Ico, MetaText, ChipTag, SectionHead, EmptyState } from '@/components/ui';
 *
 *   <Ico icon={<Check />} size={14} />
 *   <Ico icon={<Check />} size={14} color="#10B981" />
 *
 *   <MetaText>Last seen 2h ago</MetaText>
 *   <MetaText size={11}>Secondary label</MetaText>
 *
 *   <ChipTag>production</ChipTag>
 *   <ChipTag color="#F59E0B" bg="rgba(245,158,11,0.08)">staging</ChipTag>
 *
 *   <SectionHead>Database Settings</SectionHead>
 *   <SectionHead icon={<Database />} action={<Button>Edit</Button>}>DB</SectionHead>
 *
 *   <EmptyState>No deployments yet</EmptyState>
 *   <EmptyState icon={<Server />} action={<Button>Add server</Button>}>No servers</EmptyState>
 */

import { HTMLAttributes, CSSProperties, ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Ico — renders any lucide (or other) icon at a fixed pixel size.
   Replaces the ubiquitous:  style={{ width:'14px', height:'14px' }}
   ───────────────────────────────────────────────────────────────────────────── */

type IcoSize = 10 | 11 | 12 | 13 | 14 | 15 | 16 | 18 | 20 | 24 | 32;

interface IcoProps extends HTMLAttributes<HTMLSpanElement> {
  /** The icon element (e.g. <Check />) */
  icon: ReactNode;
  /** Pixel size applied to width & height. Default: 14 */
  size?: IcoSize;
  /** Optional color override. Inherits from parent by default. */
  color?: string;
  /** Optional opacity (0–1) */
  opacity?: number;
  /** Make it block (default is inline-flex) */
  block?: boolean;
}

export function Ico({
  icon,
  size = 14,
  color,
  opacity,
  block = false,
  style,
  ...rest
}: IcoProps) {
  const s: CSSProperties = {
    display: block ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: size,
    height: size,
    color,
    opacity,
    ...style,
  };
  return (
    <span style={s} {...rest}>
      {icon}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MetaText — muted secondary label at small font sizes.
   Replaces:  style={{ fontSize:'12px', color:'rgb(var(--text-muted))' }}
   ───────────────────────────────────────────────────────────────────────────── */

interface MetaTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Font size in px. Default: 12 */
  size?: 10 | 11 | 12 | 13;
  /** Custom color override (default: --text-muted) */
  color?: string;
  /** Bold variant */
  bold?: boolean;
  /** Uppercase + letter-spacing variant (like a table header label) */
  caps?: boolean;
  /** Render as block (div) instead of inline (span) */
  block?: boolean;
  children: ReactNode;
}

export function MetaText({
  size = 12,
  color = 'rgb(var(--text-muted))',
  bold = false,
  caps = false,
  block = false,
  style,
  children,
  ...rest
}: MetaTextProps) {
  const Tag = block ? 'div' : 'span';
  const s: CSSProperties = {
    fontSize: size,
    color,
    fontWeight: bold ? 600 : undefined,
    textTransform: caps ? 'uppercase' : undefined,
    letterSpacing: caps ? '0.04em' : undefined,
    ...style,
  };
  return (
    <Tag style={s} {...rest}>
      {children}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ChipTag — pill-shaped label for tags, environments, branches, etc.
   Replaces the inline chipStyle const in servers/mounts and servers pages.
   ───────────────────────────────────────────────────────────────────────────── */

interface ChipTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Text or hex color for the chip text & border. Default: primary */
  color?: string;
  /** Background color. Default: semi-transparent primary */
  bg?: string;
  /** Use danger/red preset */
  danger?: boolean;
  /** Use success/green preset */
  success?: boolean;
  /** Use warning/amber preset */
  warning?: boolean;
  /** Use neutral/secondary preset */
  neutral?: boolean;
  children: ReactNode;
}

const CHIP_PRESETS = {
  danger:  { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: '1px solid rgba(239,68,68,0.25)'   },
  success: { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: '1px solid rgba(16,185,129,0.25)'  },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: '1px solid rgba(245,158,11,0.25)'  },
  neutral: { color: 'rgb(var(--text-secondary))', bg: 'rgb(var(--surface-hover))', border: '1px solid rgb(var(--border))' },
};

export function ChipTag({
  color,
  bg,
  danger,
  success,
  warning,
  neutral,
  style,
  children,
  ...rest
}: ChipTagProps) {
  const preset =
    danger  ? CHIP_PRESETS.danger  :
    success ? CHIP_PRESETS.success :
    warning ? CHIP_PRESETS.warning :
    neutral ? CHIP_PRESETS.neutral :
    null;

  const resolvedColor  = preset?.color  ?? color  ?? 'rgb(var(--primary))';
  const resolvedBg     = preset?.bg     ?? bg     ?? 'rgba(var(--primary), 0.06)';
  const resolvedBorder = preset?.border ?? `1px solid ${
    color ? color.replace(')', ', 0.25)').replace('rgb(', 'rgba(') : 'rgba(var(--primary), 0.25)'
  }`;

  const s: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    border: resolvedBorder,
    backgroundColor: resolvedBg,
    color: resolvedColor,
    whiteSpace: 'nowrap',
    transition: 'all 150ms',
    ...style,
  };

  return (
    <span style={s} {...rest}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SectionHead — section title with optional icon and action slot.
   Replaces repeated h3/h4 patterns with borderBottom underline.
   ───────────────────────────────────────────────────────────────────────────── */

interface SectionHeadProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional icon before the text */
  icon?: ReactNode;
  /** Optional right-side action (e.g. a Button) */
  action?: ReactNode;
  /** Font size. Default: 13 */
  size?: 12 | 13 | 14 | 15 | 16;
  /** Show bottom border underline. Default: true */
  underline?: boolean;
  children: ReactNode;
}

export function SectionHead({
  icon,
  action,
  size = 13,
  underline = true,
  style,
  children,
  ...rest
}: SectionHeadProps) {
  const s: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: size,
    fontWeight: 700,
    color: 'rgb(var(--text-primary))',
    margin: '0 0 8px',
    padding: underline ? '10px 0 6px' : undefined,
    borderBottom: underline ? '2px solid rgba(var(--primary), 0.2)' : undefined,
    ...style,
  };

  return (
    <div style={s} {...rest}>
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1 }}>{children}</span>
      {action && <span style={{ marginLeft: 'auto' }}>{action}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EmptyState — centred placeholder when a list or panel has no data.
   Replaces:  style={{ padding:'20px', textAlign:'center', color: muted }}
   ───────────────────────────────────────────────────────────────────────────── */

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional icon above the message */
  icon?: ReactNode;
  /** Optional CTA button / action below the message */
  action?: ReactNode;
  /** Padding (px). Default: 40 */
  padding?: number | string;
  /** Font size. Default: 13 */
  size?: 12 | 13 | 14;
  children: ReactNode;
}

export function EmptyState({
  icon,
  action,
  padding = 40,
  size = 13,
  style,
  children,
  ...rest
}: EmptyStateProps) {
  const s: CSSProperties = {
    padding,
    textAlign: 'center',
    color: 'rgb(var(--text-muted))',
    fontSize: size,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    ...style,
  };

  return (
    <div style={s} {...rest}>
      {icon && (
        <span style={{ opacity: 0.4, display: 'flex', justifyContent: 'center' }}>
          {icon}
        </span>
      )}
      <span>{children}</span>
      {action && <span>{action}</span>}
    </div>
  );
}
