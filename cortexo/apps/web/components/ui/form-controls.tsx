'use client';

import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { ReactNode, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Checkbox — animated checkbox with label
   ───────────────────────────────────────────────────────────────────────────── */

interface CheckboxProps {
  /** Checked state */
  checked?: boolean;
  /** Called when changed */
  onChange?: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Sub label */
  subLabel?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

export function Checkbox({
  checked = false,
  onChange,
  label,
  subLabel,
  disabled = false,
  indeterminate = false,
  fullWidth = false,
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleClick = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={handleClick}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: `2px solid ${isChecked || indeterminate ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`,
          backgroundColor: isChecked || indeterminate ? 'rgb(var(--primary))' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 150ms',
        }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: isChecked || indeterminate ? 1 : 0,
            opacity: isChecked || indeterminate ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
        >
          {indeterminate ? (
            <Minus size={12} color="#fff" />
          ) : (
            <Check size={12} color="#fff" />
          )}
        </motion.div>
      </div>
      {(label || subLabel) && (
        <div style={{ flex: 1 }}>
          {label && (
            <span style={{ fontSize: 13, color: 'rgb(var(--text-primary))' }}>
              {label}
            </span>
          )}
          {subLabel && (
            <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))', marginTop: 2 }}>
              {subLabel}
            </div>
          )}
        </div>
      )}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CheckboxGroup — group of checkboxes
   ───────────────────────────────────────────────────────────────────────────── */

interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  direction?: 'vertical' | 'horizontal';
}

export function CheckboxGroup({
  options,
  value = [],
  onChange,
  direction = 'vertical',
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange?.([...value, optionValue]);
    } else {
      onChange?.(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: direction === 'horizontal' ? 16 : 8,
      }}
    >
      {options.map((opt) => (
        <Checkbox
          key={opt.value}
          label={opt.label}
          checked={value.includes(opt.value)}
          onChange={(checked) => handleChange(opt.value, checked)}
          disabled={opt.disabled}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Radio — radio button group
   ───────────────────────────────────────────────────────────────────────────── */

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  direction?: 'vertical' | 'horizontal';
  label?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  direction = 'vertical',
  label,
}: RadioGroupProps) {
  return (
    <div>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'rgb(var(--text-primary))' }}>
          {label}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          gap: direction === 'horizontal' ? 16 : 8,
        }}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              opacity: opt.disabled ? 0.5 : 1,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${value === opt.value ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms',
              }}
            >
              {value === opt.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'rgb(var(--primary))',
                  }}
                />
              )}
            </div>
            <span
              onClick={() => !opt.disabled && onChange?.(opt.value)}
              style={{ fontSize: 13, color: 'rgb(var(--text-primary))' }}
            >
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Switch — animated toggle switch
   ───────────────────────────────────────────────────────────────────────────── */

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  /** Size: sm | md | lg */
  size?: 'sm' | 'md' | 'lg';
  /** Show on/off labels */
  showLabel?: boolean;
}

const SWITCH_SIZES = {
  sm: { width: 32, height: 18, dot: 12 },
  md: { width: 44, height: 24, dot: 18 },
  lg: { width: 56, height: 30, dot: 24 },
};

export function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
  showLabel = false,
}: SwitchProps) {
  const dims = SWITCH_SIZES[size];

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          position: 'relative',
          width: dims.width,
          height: dims.height,
          borderRadius: dims.height / 2,
          backgroundColor: checked ? 'rgb(var(--primary))' : 'rgb(var(--border))',
          transition: 'background-color 200ms',
        }}
      >
        <motion.div
          animate={{ x: checked ? dims.width - dims.dot - 4 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            top: (dims.height - dims.dot) / 2,
            width: dims.dot,
            height: dims.dot,
            borderRadius: '50%',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: 13, color: 'rgb(var(--text-primary))' }}>{label}</span>
      )}
      {showLabel && (
        <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>
          {checked ? 'On' : 'Off'}
        </span>
      )}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Slider — range slider
   ───────────────────────────────────────────────────────────────────────────── */

interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
}

export function Slider({
  value = 50,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  disabled = false,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ width: '100%' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {label && <span style={{ fontSize: 13, color: 'rgb(var(--text-primary))' }}>{label}</span>}
          {showValue && <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>{value}</span>}
        </div>
      )}
      <div style={{ position: 'relative', height: 6 }}>
        {/* Track */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgb(var(--border))',
          }}
        />
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            width: `${percentage}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgb(var(--primary))',
          }}
        />
        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          disabled={disabled}
          style={{
            position: 'absolute',
            width: '100%',
            height: 6,
            opacity: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${percentage}% - 8px)`,
            top: -5,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: '2px solid rgb(var(--primary))',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   RangeSlider — dual-thumb range slider
   ───────────────────────────────────────────────────────────────────────────── */

interface RangeSliderProps {
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
}

export function RangeSlider({
  value = [25, 75],
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  formatValue = (v) => v.toString(),
}: RangeSliderProps) {
  const [minVal, maxVal] = value;
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'rgb(var(--text-primary))' }}>{label}</span>
          <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>
            {formatValue(minVal)} - {formatValue(maxVal)}
          </span>
        </div>
      )}
      <div style={{ position: 'relative', height: 6, padding: '5px 0' }}>
        {/* Track */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgb(var(--border))',
          }}
        />
        {/* Range */}
        <div
          style={{
            position: 'absolute',
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgb(var(--primary))',
          }}
        />
        {/* Inputs */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => onChange?.([Number(e.target.value), maxVal])}
          style={{
            position: 'absolute',
            width: '100%',
            height: 16,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => onChange?.([minVal, Number(e.target.value)])}
          style={{
            position: 'absolute',
            width: '100%',
            height: 16,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}