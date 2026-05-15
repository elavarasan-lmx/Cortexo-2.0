'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Calendar — month calendar with events
   ───────────────────────────────────────────────────────────────────────────── */

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color?: string;
}

interface CalendarProps {
  /** Initial month to show */
  initialDate?: Date;
  /** Events to display */
  events?: CalendarEvent[];
  /** Called when date is selected */
  onDateSelect?: (date: Date) => void;
  /** Called when month changes */
  onMonthChange?: (date: Date) => void;
  /** Selected date */
  selected?: Date;
  /** Min date */
  minDate?: Date;
  /** Max date */
  maxDate?: Date;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({
  initialDate = new Date(),
  events = [],
  onDateSelect,
  onMonthChange,
  selected,
  minDate,
  maxDate,
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(initialDate);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    if (!selected) return false;
    return date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear();
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((e) =>
      e.date.getDate() === date.getDate() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getFullYear() === date.getFullYear()
    );
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
    setViewDate(newDate);
    onMonthChange?.(newDate);
  };

  return (
    <div style={{
      backgroundColor: 'rgb(var(--surface))',
      border: '1px solid rgb(var(--border))',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={() => changeMonth(-1)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
        >
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          onClick={() => changeMonth(1)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
        {DAYS.map((day) => (
          <div key={day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'rgb(var(--text-muted))', padding: 8 }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {calendarDays.map((day, i) => {
          const dayEvents = getEventsForDate(day.date);
          const disabled = isDisabled(day.date);
          const selected = isSelected(day.date);
          const today = isToday(day.date);

          return (
            <motion.button
              key={i}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              disabled={disabled}
              onClick={() => !disabled && onDateSelect?.(day.date)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: selected ? 'rgb(var(--primary))' : 'transparent',
                color: selected ? '#fff' : disabled ? 'rgb(var(--text-muted))' : day.isCurrentMonth ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))',
                cursor: disabled ? 'default' : 'pointer',
                fontSize: 13,
                fontWeight: today ? 600 : 400,
              }}
            >
              {day.date.getDate()}
              {dayEvents.length > 0 && !selected && (
                <div style={{
                  position: 'absolute',
                  bottom: 2,
                  display: 'flex',
                  gap: 2,
                }}>
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <div
                      key={j}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: e.color || 'rgb(var(--primary))',
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CalendarView — full calendar with week/month views
   ───────────────────────────────────────────────────────────────────────────── */

type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  initialDate?: Date;
}

export function CalendarView({
  events,
  onDateSelect,
  onEventClick,
  initialDate = new Date(),
}: CalendarViewProps) {
  const [viewDate, setViewDate] = useState(initialDate);
  const [view, setView] = useState<CalendarViewMode>('month');

  const weekDays = useMemo(() => {
    const start = new Date(viewDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [viewDate]);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setViewDate(new Date())}
            style={{
              padding: '6px 12px',
              border: '1px solid rgb(var(--border))',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgb(var(--surface))',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Today
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <ChevronRight size={18} />
            </button>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['month', 'week', 'day'] as CalendarViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: view === v ? 'rgb(var(--primary))' : 'rgb(var(--surface-hover))',
                color: view === v ? '#fff' : 'rgb(var(--text-secondary))',
                cursor: 'pointer',
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Week view */}
      {view === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, backgroundColor: 'rgb(var(--border))' }}>
          {weekDays.map((day, i) => {
            const dayEvents = events.filter((e) => e.date.toDateString() === day.toDateString());
            return (
              <div key={i} style={{ backgroundColor: 'rgb(var(--surface))', minHeight: 200, padding: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgb(var(--text-muted))', marginBottom: 8 }}>
                  {DAYS[i]} {day.getDate()}
                </div>
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick?.(e)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '4px 8px',
                      marginBottom: 4,
                      border: 'none',
                      borderRadius: 4,
                      backgroundColor: e.color ? `${e.color}20` : 'rgba(var(--primary), 0.1)',
                      color: e.color || 'rgb(var(--primary))',
                      fontSize: 11,
                      cursor: 'pointer',
                      textAlign: 'left',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Month view */}
      {view === 'month' && <Calendar events={events} initialDate={viewDate} onDateSelect={onDateSelect} />}
    </div>
  );
}