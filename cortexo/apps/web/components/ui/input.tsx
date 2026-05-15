'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';

interface InputProps extends HTMLAttributes<HTMLInputElement> {
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
  /** Left icon slot */
  leftIcon?: ReactNode;
  /** Right icon/action slot */
  rightIcon?: ReactNode;
}

const SIZE_STYLES = {
  sm:  { padding: '6px 10px', fontSize: 12, height: 30 },
  md:  { padding: '8px 12px', fontSize: 13, height: 36 },
  lg:  { padding: '10px 14px', fontSize: 14, height: 42 },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  fullWidth = false,
  error = false,
  leftIcon,
  rightIcon,
  style,
  ...rest
}, ref) => {
  const s = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    width: fullWidth ? '100%' : undefined,
    backgroundColor: 'rgb(var(--surface))',
    border: `1px solid ${error ? 'rgb(var(--danger))' : 'rgb(var(--border))'}`,
    borderRadius: 'var(--radius-md)',
    color: 'rgb(var(--text-primary))',
    fontFamily: 'inherit',
    transition: 'border-color 150ms, box-shadow 150ms',
    outline: 'none',
    ...SIZE_STYLES[size],
    ...style,
  };

  const inputStyle = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    color: 'inherit',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    width: '100%',
    padding: 0,
  };

  return (
    <div style={s}>
      {leftIcon && <span style={{ display: 'flex', flexShrink: 0, opacity: 0.5 }}>{leftIcon}</span>}
      <input ref={ref} style={inputStyle} {...rest} />
      {rightIcon && <span style={{ display: 'flex', flexShrink: 0, opacity: 0.5 }}>{rightIcon}</span>}
    </div>
  );
});

Input.displayName = 'Input';

/* ─────────────────────────────────────────────────────────────────────────────
   Textarea — multiline text input
   ───────────────────────────────────────────────────────────────────────────── */

interface TextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
  /** Full width */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
  /** Minimum rows. Default: 3 */
  rows?: number;
}

export function Textarea({
  fullWidth = false,
  error = false,
  rows = 3,
  style,
  ...rest
}: TextareaProps) {
  const s: HTMLAttributes<HTMLDivElement>['style'] = {
    display: 'flex',
    width: fullWidth ? '100%' : undefined,
    backgroundColor: 'rgb(var(--surface))',
    border: `1px solid ${error ? 'rgb(var(--danger))' : 'rgb(var(--border))'}`,
    borderRadius: 'var(--radius-md)',
    color: 'rgb(var(--text-primary))',
    fontSize: 13,
    fontFamily: 'inherit',
    transition: 'border-color 150ms, box-shadow 150ms',
    outline: 'none',
    ...style,
  };

  const textareaStyle = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    color: 'inherit',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    width: '100%',
    padding: '10px 12px',
    resize: 'vertical' as const,
    minHeight: rows * 20,
  };

  return (
    <div style={s}>
      <textarea style={textareaStyle} {...rest} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Select — dropdown selector
   ───────────────────────────────────────────────────────────────────────────── */

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
  /** Options array */
  options: SelectOption[];
  /** Full width */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
  /** Placeholder when no value */
  placeholder?: string;
}

export function Select({
  options,
  fullWidth = false,
  error = false,
  placeholder = 'Select...',
  style,
  ...rest
}: SelectProps) {
  const s: HTMLAttributes<HTMLDivElement>['style'] = {
    display: 'inline-flex',
    alignItems: 'center',
    width: fullWidth ? '100%' : undefined,
    backgroundColor: 'rgb(var(--surface))',
    border: `1px solid ${error ? 'rgb(var(--danger))' : 'rgb(var(--border))'}`,
    borderRadius: 'var(--radius-md)',
    color: 'rgb(var(--text-primary))',
    fontSize: 13,
    fontFamily: 'inherit',
    transition: 'border-color 150ms, box-shadow 150ms',
    outline: 'none',
    overflow: 'hidden',
    ...style,
  };

  const selectStyle = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    color: 'inherit',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    width: '100%',
    padding: '8px 12px',
    cursor: 'pointer',
  };

  return (
    <div style={s}>
      <select style={selectStyle} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}