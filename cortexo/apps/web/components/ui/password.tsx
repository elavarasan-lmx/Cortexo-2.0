'use client';

import { motion } from 'framer-motion';
import { Check, X, AlertTriangle, Lock } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   PasswordStrength — password strength indicator
   ───────────────────────────────────────────────────────────────────────────── */

interface PasswordRequirement {
  /** Requirement label */
  label: string;
  /** Whether this requirement is met */
  met: boolean;
}

interface PasswordStrengthProps {
  /** Password to check */
  password: string;
  /** Show requirements list */
  showRequirements?: boolean;
  /** Custom requirements */
  requirements?: PasswordRequirement[];
  /** Show password toggle */
  showToggle?: boolean;
  /** Called when strength changes */
  onStrengthChange?: (strength: number) => void;
}

const DEFAULT_REQUIREMENTS = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { key: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'One special character', test: (p: string) => /[!@#$%^&*]/.test(p) },
];

function calculateStrength(password: string, requirements: typeof DEFAULT_REQUIREMENTS): number {
  const metCount = requirements.filter((r) => r.test(password)).length;
  return metCount;
}

function getStrengthLevel(strength: number): { level: string; color: string; bg: string; label: string } {
  if (strength <= 1) return { level: 'weak', color: 'rgb(var(--danger))', bg: 'rgba(239,68,68,0.2)', label: 'Weak' };
  if (strength <= 2) return { level: 'fair', color: '#F59E0B', bg: 'rgba(245,158,11,0.2)', label: 'Fair' };
  if (strength <= 3) return { level: 'good', color: '#3B82F6', bg: 'rgba(59,130,246,0.2)', label: 'Good' };
  return { level: 'strong', color: 'rgb(var(--success))', bg: 'rgba(16,185,129,0.2)', label: 'Strong' };
}

export function PasswordStrength({
  password,
  showRequirements = true,
  requirements: customRequirements,
  showToggle = false,
  onStrengthChange,
}: PasswordStrengthProps) {
  const requirements = customRequirements || DEFAULT_REQUIREMENTS.map((r) => ({
    label: r.label,
    met: r.test(password),
  }));

  const strength = calculateStrength(password, requirements);
  const level = getStrengthLevel(strength);
  const progress = (strength / requirements.length) * 100;

  // Notify parent of strength change
  if (onStrengthChange) {
    onStrengthChange(strength);
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Strength bar */}
      <div style={{ marginBottom: showRequirements ? 12 : 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>Password strength</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: level.color }}>{level.label}</span>
        </div>
        <div style={{
          height: 6,
          backgroundColor: 'rgb(var(--surface-hover))',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              height: '100%',
              backgroundColor: level.color,
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* Requirements list */}
      {showRequirements && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {requirements.map((req, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: req.met ? 'rgb(var(--success))' : 'rgb(var(--text-muted))',
              }}
            >
              {req.met ? (
                <Check size={14} style={{ color: 'rgb(var(--success))' }} />
              ) : (
                <X size={14} style={{ opacity: 0.5 }} />
              )}
              {req.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PasswordInput — input with strength indicator
   ───────────────────────────────────────────────────────────────────────────── */

interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Show strength indicator */
  showStrength?: boolean;
  /** Show requirements */
  showRequirements?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Disabled */
  disabled?: boolean;
}

import { useState } from 'react';

export function PasswordInput({
  value = '',
  onChange,
  placeholder = 'Enter password',
  showStrength = true,
  showRequirements = true,
  fullWidth = false,
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: fullWidth ? '100%' : undefined }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '10px 40px 10px 12px',
            border: `1px solid ${focused ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgb(var(--surface))',
            color: 'rgb(var(--text-primary))',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: 8,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 4,
            color: 'rgb(var(--text-muted))',
          }}
        >
          {showPassword ? <X size={16} /> : <Lock size={16} />}
        </button>
      </div>
      {showStrength && value && (focused || showRequirements) && (
        <div style={{ marginTop: 12 }}>
          <PasswordStrength
            password={value}
            showRequirements={showRequirements}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ConfirmPassword — password confirmation input
   ───────────────────────────────────────────────────────────────────────────── */

interface ConfirmPasswordProps {
  password: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

export function ConfirmPassword({
  password,
  value,
  onChange,
  placeholder = 'Confirm password',
  fullWidth = false,
}: ConfirmPasswordProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isMatch = value ? password === value : null;

  return (
    <div style={{ width: fullWidth ? '100%' : undefined }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '10px 40px 10px 12px',
            border: `1px solid ${
              isMatch === true
                ? 'rgb(var(--success))'
                : isMatch === false
                ? 'rgb(var(--danger))'
                : focused
                ? 'rgb(var(--primary))'
                : 'rgb(var(--border))'
            }`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgb(var(--surface))',
            color: 'rgb(var(--text-primary))',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: 8,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 4,
            color: 'rgb(var(--text-muted))',
          }}
        >
          {showPassword ? <X size={16} /> : <Lock size={16} />}
        </button>
      </div>
      {value && isMatch !== null && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 6,
          fontSize: 12,
          color: isMatch ? 'rgb(var(--success))' : 'rgb(var(--danger))',
        }}>
          {isMatch ? <Check size={14} /> : <AlertTriangle size={14} />}
          {isMatch ? 'Passwords match' : 'Passwords do not match'}
        </div>
      )}
    </div>
  );
}