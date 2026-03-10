/**
 * MonthlyCalendar.tsx — redesigned
 */

import React from 'react';
import { JournalEntry, EntriesByDate, ForecastByDate } from '../../types';
import { noteBg, colorToHex } from '../../lib/noteColors';
import { NoteColor } from '../../types';

type MonthlyCalendarProps = {
  currentMonth: Date;
  journalEntries: JournalEntry[];
  forecastByDate?: ForecastByDate;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate?: (date: string) => void;
  onSelectEntry?: (entryId: number) => void;
};

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthlyCalendar({
  currentMonth,
  journalEntries,
  forecastByDate = {},
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onSelectEntry,
}: MonthlyCalendarProps) {
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const todayStr = formatDate(new Date());

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const entriesByDate: EntriesByDate = {};
  journalEntries.forEach(entry => {
    if (!entry.date) return;
    if (!entriesByDate[entry.date]) entriesByDate[entry.date] = [];
    entriesByDate[entry.date].push(entry);
  });

  const cells: { date: string | null; day: number | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: null, day: null });
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: formatDate(new Date(year, monthIndex, day)), day });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 600,
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: 0,
          }}>
            {MONTH_NAMES[monthIndex]}
          </h2>
          <span style={{ fontSize: '1rem', color: 'var(--ink-muted)', fontWeight: 300 }}>{year}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-nav" onClick={onPrevMonth} aria-label="Previous month">‹</button>
          <button className="btn-nav" onClick={onNextMonth} aria-label="Next month">›</button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-muted)',
            paddingBottom: '0.25rem',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridAutoRows: '1fr',
        gap: '4px',
        flex: 1,
      }}>
        {cells.map((cell, idx) => {
          if (!cell.date) return <div key={idx} />;

          const entries = entriesByDate[cell.date] || [];
          const weather = forecastByDate[cell.date];
          const isToday = cell.date === todayStr;

          return (
            <div
              key={cell.date}
              className={`cal-cell${isToday ? ' is-today' : ''}`}
              onClick={() => onSelectDate?.(cell.date!)}
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              {/* Day number row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '0.80rem',
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? 'var(--blush)' : 'var(--ink)',
                  lineHeight: 1,
                }}>
                  {cell.day}
                </span>

                {weather && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                      alt={weather.weather}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: '0.80rem', color: 'var(--ink-muted)', lineHeight: 1 }}>
                      {Math.round(weather.tempMax)}°
                    </span>
                  </div>
                )}
              </div>

              {/* Note pills */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {entries.slice(0, 3).map((entry, i) => (
                  <button
                    key={entry.id ?? i}
                    className="note-pill"
                    style={{
                      backgroundColor: `${colorToHex(entry.color as NoteColor)}22`,
                      borderColor: `${colorToHex(entry.color as NoteColor)}55`,
                      color: 'var(--ink-soft)',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      if (entry.id != null) onSelectEntry?.(entry.id);
                    }}
                    type="button"
                  >
                    {entry.title}
                  </button>
                ))}
                {entries.length > 3 && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--ink-muted)', paddingLeft: '2px' }}>
                    +{entries.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
