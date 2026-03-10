/**
 * MiniMonth.tsx — redesigned
 */

import React, { useMemo } from 'react';

type MiniMonthProps = {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
};

function pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function toYMD(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

const MiniMonth: React.FC<MiniMonthProps> = ({ currentMonth, onPrevMonth, onNextMonth, onSelectDate }) => {
  const { monthLabel, cells, todayYMD } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthLabel = currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const startDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number | null; dateStr?: string }> = [];
    for (let i = 0; i < startDay; i++) cells.push({ day: null });
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, dateStr: toYMD(new Date(year, month, day)) });
    }
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return { monthLabel, cells, todayYMD: toYMD(t) };
  }, [currentMonth]);

  return (
    <div className="card" style={{ padding: '0.875rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <button className="btn-nav" onClick={onPrevMonth} aria-label="Previous month">‹</button>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--ink)' }}>{monthLabel}</span>
        <button className="btn-nav" onClick={onNextMonth} aria-label="Next month">›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontSize: '0.6rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: 'var(--ink-muted)',
            paddingBottom: '4px',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((c, idx) => {
          if (!c.day) return <div key={idx} style={{ height: 26 }} />;
          const isToday = c.dateStr === todayYMD;
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(c.dateStr!)}
              style={{
                height: 26,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: isToday ? 600 : 400,
                borderRadius: '50%',
                border: 'none',
                background: isToday ? 'var(--blush)' : 'transparent',
                color: isToday ? '#fff' : 'var(--ink-soft)',
                cursor: 'pointer',
                transition: 'background 0.12s',
                padding: 0,
              }}
              onMouseEnter={e => { if (!isToday) (e.target as HTMLElement).style.background = 'var(--paper-warm)'; }}
              onMouseLeave={e => { if (!isToday) (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniMonth;
