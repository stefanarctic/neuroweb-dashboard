import { useEffect, useId, useMemo, useRef, useState } from 'react';

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];
const MONTHS = [
  'Ianuarie',
  'Februarie',
  'Martie',
  'Aprilie',
  'Mai',
  'Iunie',
  'Iulie',
  'August',
  'Septembrie',
  'Octombrie',
  'Noiembrie',
  'Decembrie',
];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

function toValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  const date = parseDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfMonthGrid(year: number, month: number): Date {
  const first = new Date(year, month, 1);
  // Monday-first: JS getDay() Sunday=0 → shift so Monday=0
  const weekday = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - weekday);
  return start;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  labelActive?: boolean;
  placeholder?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  labelActive = false,
  placeholder = 'Selectează data',
  id,
}: DatePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseDate(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  useEffect(() => {
    if (!open) return;
    const base = parseDate(value) ?? new Date();
    setView({ year: base.getFullYear(), month: base.getMonth() });
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const days = useMemo(() => {
    const start = startOfMonthGrid(view.year, view.month);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [view.year, view.month]);

  const today = new Date();

  function shiftMonth(delta: number) {
    setView((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div className="field date-picker" ref={rootRef}>
      {label ? (
        <span
          className={`field-label${labelActive ? ' active' : ''}`}
          id={`${fieldId}-label`}
        >
          {label}
        </span>
      ) : null}

      <div className="date-picker-control">
        <button
          type="button"
          id={fieldId}
          className={`date-picker-trigger${open ? ' open' : ''}${value ? '' : ' empty'}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={label ? `${fieldId}-label` : undefined}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{value ? formatDisplay(value) : placeholder}</span>
          <span className="date-picker-icon" aria-hidden="true">
            ▦
          </span>
        </button>

        {value ? (
          <button
            type="button"
            className="date-picker-clear"
            aria-label="Clear date"
            onClick={() => onChange('')}
          >
            ×
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="date-picker-popover" role="dialog" aria-modal="false">
          <div className="date-picker-header">
            <button
              type="button"
              className="btn btn-quiet date-picker-nav"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="date-picker-month">
              {MONTHS[view.month]} {view.year}
            </div>
            <button
              type="button"
              className="btn btn-quiet date-picker-nav"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="date-picker-weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="date-picker-grid">
            {days.map((date) => {
              const inMonth = date.getMonth() === view.month;
              const isSelected = selected ? sameDay(date, selected) : false;
              const isToday = sameDay(date, today);
              return (
                <button
                  key={toValue(date)}
                  type="button"
                  className={[
                    'date-picker-day',
                    inMonth ? '' : 'muted',
                    isSelected ? 'selected' : '',
                    isToday ? 'today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    onChange(toValue(date));
                    setOpen(false);
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-picker-footer">
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                onChange(toValue(new Date()));
                setOpen(false);
              }}
            >
              Azi
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Închide
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
