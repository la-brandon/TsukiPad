/**
 * NotesList.tsx — redesigned
 */

import React, { useMemo, useState } from 'react';
import { JournalEntry, NoteColor } from '../../types';
import { colorToHex } from '../../lib/noteColors';

type NotesListProps = {
  title: string;
  notes: JournalEntry[];
  onSelectEntry: (id: number) => void;
};

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const NotesList: React.FC<NotesListProps> = ({ title, notes, onSelectEntry }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const grouped = useMemo(() => {
    const map: Record<string, JournalEntry[]> = {};
    for (const note of notes) {
      if (!map[note.date]) map[note.date] = [];
      map[note.date].push(note);
    }
    const sortedDates = Object.keys(map).sort((a, b) =>
      sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    );
    return { map, sortedDates };
  }, [notes, sortOrder]);

  return (
    <div className="card" style={{ padding: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)' }}>{title}</span>
          {notes.length > 0 && (
            <span style={{
              fontSize: '0.65rem',
              background: 'var(--paper-warm)',
              border: '1px solid var(--border)',
              borderRadius: '99px',
              padding: '1px 7px',
              color: 'var(--ink-muted)',
              fontWeight: 500,
            }}>
              {notes.length}
            </span>
          )}
        </div>

        {notes.length > 1 && (
          <button
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Showing oldest first' : 'Showing newest first'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 7px',
              cursor: 'pointer',
              fontSize: '0.65rem',
              color: 'var(--ink-muted)',
              fontFamily: 'var(--font-body)',
              transition: 'background 0.12s, color 0.12s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--paper-warm)';
              (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--ink-muted)';
            }}
          >
            {sortOrder === 'asc' ? '↑ Oldest' : '↓ Newest'}
          </button>
        )}
      </div>

      {grouped.sortedDates.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', margin: 0 }}>Nothing here yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxHeight: 220, overflowY: 'auto' }}>
          {grouped.sortedDates.map(date => (
            <div key={date}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'var(--ink-muted)',
                textTransform: 'uppercase',
                marginBottom: '0.3rem',
              }}>
                {formatDateLabel(date)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {grouped.map[date].map(n => (
                  <button
                    key={n.id}
                    onClick={() => onSelectEntry(n.id!)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.375rem 0.625rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      transition: 'background 0.12s, border-color 0.12s',
                      color: 'var(--ink)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--paper-warm)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    }}
                    title={n.text ?? ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: colorToHex(n.color as NoteColor),
                      }} />
                      <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.title}
                      </span>
                    </div>
                    {n.time && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', flexShrink: 0 }}>{n.time}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;
