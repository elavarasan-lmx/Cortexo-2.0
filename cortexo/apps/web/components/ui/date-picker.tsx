'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  /** Selected date value */
  value?: Date;
  /** Called when date changes */
  onChange?: (date: Date) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Show time picker */
  showTime?: boolean;
  /** Minimum date selectable */
  minDate?: Date;
  /** Maximum date selectable */
  maxDate?: Date;
  /** Full width */
  fullWidth?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  showTime = false,
  minDate,
  maxDate,
  fullWidth = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
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

  const formatDate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const formatTime = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const displayValue = value
    ? `${formatDate(value)}${showTime ? ' ' + formatTime(value) : ''}`
    : '';

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const isDisabled = (day: number) => {
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (minDate && checkDate < minDate) return true;
    if (maxDate && checkDate > maxDate) return true;
    return false;
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, value?.getHours() || 0, value?.getMinutes() || 0);
    onChange?.(newDate);
    if (!showTime) setOpen(false);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    if (!value) return;
    const newDate = new Date(value);
    if (type === 'hours') newDate.setHours(parseInt(val) || 0);
    else newDate.setMinutes(parseInt(val) || 0);
    onChange?.(newDate);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          borderRadius: 'var(--radius-md)',
          color: value ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))',
          fontSize: 13,
          cursor: 'pointer',
          width: '100%',
          justifyContent: 'flex-start',
        }}
      >
        <Calendar size={14} style={{ opacity: 0.5 }} />
        {displayValue || placeholder}
        {value && (
          <X
            size={12}
            style={{ marginLeft: 'auto', opacity: 0.5 }}
            onClick={(e) => { e.stopPropagation(); onChange?.(undefined as unknown as Date); }}
          />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          width: showTime ? 280 : 260,
          padding: 12,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--text-secondary))' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--text-secondary))' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'rgb(var(--text-muted))', padding: 4 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = value && value.getDate() === day && value.getMonth() === viewDate.getMonth() && value.getFullYear() === viewDate.getFullYear();
              const disabled = isDisabled(day);
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  style={{
                    padding: 6,
                    textAlign: 'center',
                    fontSize: 12,
                    border: isSelected ? 'none' : 'none',
                    borderRadius: 6,
                    backgroundColor: isSelected ? 'rgb(var(--primary))' : 'transparent',
                    color: isSelected ? '#fff' : disabled ? 'rgb(var(--text-muted))' : 'rgb(var(--text-primary))',
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time picker */}
          {showTime && value && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgb(var(--border))' }}>
              <Clock size={14} style={{ opacity: 0.5 }} />
              <select
                value={value.getHours()}
                onChange={(e) => handleTimeChange('hours', e.target.value)}
                style={{ padding: '4px 8px', border: '1px solid rgb(var(--border))', borderRadius: 6, fontSize: 12 }}
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                ))}
              </select>
              <span>:</span>
              <select
                value={value.getMinutes()}
                onChange={(e) => handleTimeChange('minutes', e.target.value)}
                style={{ padding: '4px 8px', border: '1px solid rgb(var(--border))', borderRadius: 6, fontSize: 12 }}
              >
                {Array.from({ length: 60 }).map((_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}