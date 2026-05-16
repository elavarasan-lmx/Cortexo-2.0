'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   Avatar — user/team avatar with image or initials
   ───────────────────────────────────────────────────────────────────────────── */

interface AvatarProps {
  /** Image URL */
  src?: string;
  /** Fallback initials or name */
  name?: string;
  /** Avatar size. Default: md */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show online indicator */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Click handler */
  onClick?: () => void;
}

const SIZE_MAP = {
  xs:  24,
  sm:  32,
  md:  40,
  lg:  48,
  xl:  64,
};

const FONT_MAP = {
  xs:  10,
  sm:  11,
  md:  13,
  lg:  16,
  xl:  20,
};

const STATUS_COLORS = {
  online:  '#10B981',
  offline: '#9CA3AF',
  away:   '#F59E0B',
  busy:   '#EF4444',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  src,
  name = '',
  size = 'md',
  status,
  onClick,
}: AvatarProps) {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];
  const initials = getInitials(name);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
  };

  const avatarStyle: React.CSSProperties = {
    width: dimension,
    height: dimension,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'rgb(var(--primary))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize,
    fontWeight: 600,
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ ...avatarStyle, objectFit: 'cover' }}
        />
      ) : (
        <div style={avatarStyle}>{initials}</div>
      )}
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: dimension * 0.3,
            height: dimension * 0.3,
            borderRadius: '50%',
            backgroundColor: STATUS_COLORS[status],
            border: '2px solid rgb(var(--surface))',
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AvatarGroup — overlapping avatars with count
   ───────────────────────────────────────────────────────────────────────────── */

interface AvatarGroupProps {
  /** Avatar data array */
  avatars: { src?: string; name: string; onClick?: () => void }[];
  /** Maximum shown before +N */
  max?: number;
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show overflow count */
  showCount?: boolean;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  showCount = true,
}: AvatarGroupProps) {
  const shown = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((av, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: -10 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{
            marginLeft: i > 0 ? -8 : 0,
            zIndex: shown.length - i,
            position: 'relative',
          }}
        >
          <Avatar src={av.src} name={av.name} size={size} onClick={av.onClick} />
        </motion.div>
      ))}
      {remaining > 0 && showCount && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            marginLeft: -8,
            width: SIZE_MAP[size],
            height: SIZE_MAP[size],
            borderRadius: '50%',
            backgroundColor: 'rgb(var(--surface-hover))',
            border: '2px solid rgb(var(--surface))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: FONT_MAP[size] - 2,
            fontWeight: 600,
            color: 'rgb(var(--text-secondary))',
          }}
        >
          +{remaining}
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AvatarStack — horizontal avatar row (simpler than group)
   ───────────────────────────────────────────────────────────────────────────── */

interface AvatarStackProps {
  avatars: { src?: string; name: string; onClick?: () => void }[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AvatarStack({ avatars, size = 'sm' }: AvatarStackProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {avatars.map((av, i) => (
        <div
          key={i}
          style={{
            marginLeft: i > 0 ? -6 : 0,
            position: 'relative',
            zIndex: avatars.length - i,
          }}
        >
          <Avatar src={av.src} name={av.name} size={size} onClick={av.onClick} />
        </div>
      ))}
    </div>
  );
}