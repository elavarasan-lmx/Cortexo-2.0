'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Danger/ destructive action */
  danger?: boolean;
  /** Divider after this item */
  divider?: boolean;
}

interface DropdownProps {
  /** Trigger button content */
  trigger: ReactNode;
  /** Dropdown items */
  items: DropdownItem[];
  /** Called when item is selected */
  onSelect: (item: DropdownItem) => void;
  /** Currently selected item */
  selected?: string;
  /** Dropdown width */
  width?: number;
  /** Align dropdown */
  align?: 'left' | 'right';
}

/**
 * Dropdown — animated dropdown menu with icons, dividers.
 *
 * Usage:
 *   <Dropdown
 *     trigger={<Button>Actions</Button>}
 *     items={[
 *       { id: 'edit', label: 'Edit', icon: <Edit /> },
 *       { id: 'delete', label: 'Delete', icon: <Trash />, danger: true },
 *     ]}
 *     onSelect={(item) => handle(item.id)}
 *   />
 */
export function Dropdown({
  trigger,
  items,
  onSelect,
  selected,
  width = 180,
  align = 'left',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;
    onSelect(item);
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: '100%',
              [align === 'left' ? 'left' : 'right']: 0,
              marginTop: 8,
              width,
              backgroundColor: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              overflow: 'hidden',
              padding: '4px',
            }}
          >
            {items.map((item) => (
              <motion.button
                key={item.id}
                whileHover={!item.disabled ? { backgroundColor: 'rgb(var(--surface-hover))' } : {}}
                onClick={() => handleSelect(item)}
                disabled={item.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: item.disabled
                    ? 'rgb(var(--text-muted))'
                    : item.danger
                    ? 'rgb(var(--danger))'
                    : 'rgb(var(--text-primary))',
                  fontSize: 13,
                  cursor: item.disabled ? 'default' : 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  transition: 'background-color 100ms',
                }}
              >
                {item.icon && (
                  <span style={{ display: 'flex', opacity: item.disabled ? 0.4 : 1 }}>
                    {item.icon}
                  </span>
                )}
                <span style={{ flex: 1 }}>{item.label}</span>
                {selected === item.id && (
                  <Check size={14} style={{ color: 'rgb(var(--primary))' }} />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SelectDropdown — select input with dropdown
   ───────────────────────────────────────────────────────────────────────────── */

interface SelectDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: ReactNode }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  fullWidth = false,
}: SelectDropdownProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <Dropdown
      trigger={
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            backgroundColor: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
            borderRadius: 'var(--radius-md)',
            color: selected ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))',
            fontSize: 13,
            cursor: 'pointer',
            width: fullWidth ? '100%' : undefined,
            minWidth: 160,
          }}
        >
          {selected?.icon && <span>{selected.icon}</span>}
          <span style={{ flex: 1, textAlign: 'left' }}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown size={14} style={{ opacity: 0.5 }} />
        </button>
      }
      items={options.map((o) => ({
        id: o.value,
        label: o.label,
        icon: o.icon,
      }))}
      onSelect={(item) => onChange(item.id)}
      selected={value}
      width={Math.max(160, (selected?.label.length || 10) * 8 + 40)}
    />
  );
}