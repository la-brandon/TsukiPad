/**
 * RightPanel.tsx — redesigned
 */

import React, { useMemo, useState, useEffect } from 'react';
import { JournalEntry, NoteColor } from '../../types';
import { NOTE_COLOR_OPTIONS, noteBg, colorToHex } from '../../lib/noteColors';

type RightPanelProps = {
  isOpen: boolean;
  mode: 'day' | 'note';
  date: string | null;
  noteId: number | null;
  entries: JournalEntry[];
  onClose: () => void;
  onSelectNote: (id: number) => void;
  onBackToDay: (date: string) => void;
  onCreateNote: (formData: FormData) => Promise<void>;
  onAfterCreate: () => Promise<void>;
  onUpdateNote: (id: number, body: { title?: string; time?: string; text?: string }) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
};

function formatLongDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const RightPanel: React.FC<RightPanelProps> = ({
  isOpen, mode, date, noteId, entries,
  onClose, onSelectNote, onBackToDay,
  onCreateNote, onAfterCreate, onUpdateNote, onDeleteNote,
}) => {
  const selectedNote = useMemo(() =>
    noteId == null ? null : entries.find(e => e.id === noteId) ?? null,
    [noteId, entries]);

  const dayEntries = useMemo(() =>
    !date ? [] : entries.filter(e => e.date === date),
    [date, entries]);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newText, setNewText] = useState('');
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newColor, setNewColor] = useState<string>('blue');

  const createLabel = useMemo(() => {
    if (!date) return 'Add';
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return d < t ? 'Add Memory' : 'Add Reminder';
  }, [date]);

  async function handleCreate() {
    if (!date) return;
    if (!newTitle.trim()) { setError('Title is required'); return; }
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('date', date); fd.append('title', newTitle.trim());
      fd.append('time', newTime); fd.append('text', newText); fd.append('color', newColor);
      newPhotos.forEach(f => fd.append('photos', f));
      await onCreateNote(fd); await onAfterCreate();
      setNewTitle(''); setNewTime(''); setNewText(''); setNewPhotos([]); setNewColor('blue');
      setShowCreate(false);
    } catch (err: any) { setError(err.message || 'Failed to create'); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    setIsEditing(false); setError(null);
    if (selectedNote) { setTitle(selectedNote.title ?? ''); setTime(selectedNote.time ?? ''); setText(selectedNote.text ?? ''); }
  }, [selectedNote?.id]);

  // Input style helper
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--paper)',
    color: 'var(--ink)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ink-muted)',
    marginBottom: '0.375rem',
  };

  return (
    <>
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(26,23,20,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            backdropFilter: 'blur(6px)',
          }}
        >
          <img
            src={lightboxSrc}
            alt="Full size"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              cursor: 'default',
            }}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: 'var(--radius-sm)',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '1rem',
            }}
            aria-label="Close photo"
          >
            ✕
          </button>
        </div>
      )}
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(26,23,20,0.18)',
            backdropFilter: 'blur(2px)',
          }}
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 420,
          zIndex: 50,
          background: 'var(--paper-card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid var(--border-soft)',
          flexShrink: 0,
        }}>
          {mode === 'day' ? (
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', margin: '0 0 0.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Notes for
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  {date ? formatLongDate(date) : '—'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {date && (
                    <button
                      className="btn-primary"
                      onClick={() => setShowCreate(v => !v)}
                      style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      {createLabel}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    style={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--ink-muted)',
                      fontSize: '1rem', flexShrink: 0,
                    }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <button
                  onClick={() => { if (selectedNote?.date) { setIsEditing(false); onBackToDay(selectedNote.date); } }}
                  style={{
                    background: 'transparent', border: 'none', padding: 0,
                    fontSize: '0.8rem', color: 'var(--blush)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                  }}
                >
                  ← Back to day
                </button>
                <button
                  onClick={onClose}
                  style={{
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--ink-muted)',
                    fontSize: '1rem',
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                {selectedNote?.title ?? '—'}
              </h3>
              {selectedNote?.date && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                  {formatLongDate(selectedNote.date)}{selectedNote.time ? ` · ${selectedNote.time}` : ''}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {mode === 'day' && (
            <>
              {/* Create form */}
              {showCreate && date && (
                <div style={{
                  marginBottom: '1.25rem',
                  padding: '1rem',
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column', gap: '0.875rem',
                }}>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)' }}>
                    {createLabel}
                  </p>

                  <div>
                    <label style={labelStyle}>Title</label>
                    <input
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g. Dentist appointment"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Time (optional)</label>
                    <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {NOTE_COLOR_OPTIONS.map(c => (
                        <button
                          key={c} type="button"
                          className={`color-dot${newColor === c ? ' selected' : ''}`}
                          style={{ backgroundColor: colorToHex(c), border: '2px solid transparent' }}
                          onClick={() => setNewColor(c)}
                          aria-label={c} title={c}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Details (optional)</label>
                    <textarea
                      value={newText} onChange={e => setNewText(e.target.value)}
                      placeholder="Add extra details..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Photos (optional)</label>
                    <input
                      type="file" accept="image/*" multiple
                      onChange={e => setNewPhotos(e.target.files ? Array.from(e.target.files) : [])}
                      style={{ ...inputStyle, padding: '0.375rem' }}
                    />
                  </div>

                  {newPhotos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {newPhotos.map((f, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img
                            src={URL.createObjectURL(f)}
                            alt="preview"
                            style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' }}
                          />
                          <button
                            type="button"
                            onClick={() => setNewPhotos(prev => prev.filter((_, idx) => idx !== i))}
                            aria-label="Remove photo"
                            style={{
                              position: 'absolute', top: 3, right: 3,
                              width: 18, height: 18,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(26,23,20,0.65)',
                              border: 'none',
                              borderRadius: '50%',
                              color: '#fff',
                              fontSize: '0.55rem',
                              cursor: 'pointer',
                              padding: 0,
                              lineHeight: 1,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {error && <p style={{ margin: 0, fontSize: '0.8rem', color: '#c0392b' }}>{error}</p>}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-ghost" onClick={() => setShowCreate(false)} disabled={busy} style={{ flex: 1 }}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreate} disabled={busy} style={{ flex: 1 }}>
                      {busy ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {/* Day entries list */}
              {dayEntries.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', margin: 0 }}>
                  No notes for this day yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dayEntries.map(e => (
                    <button
                      key={e.id}
                      onClick={() => onSelectNote(e.id!)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${colorToHex(e.color as NoteColor)}44`,
                        background: `${colorToHex(e.color as NoteColor)}11`,
                        cursor: 'pointer',
                        transition: 'filter 0.12s',
                        display: 'flex', flexDirection: 'column', gap: '0.25rem',
                      }}
                      onMouseEnter={el => (el.currentTarget.style.filter = 'brightness(0.96)')}
                      onMouseLeave={el => (el.currentTarget.style.filter = 'brightness(1)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: colorToHex(e.color as NoteColor) }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>
                            {e.title}
                          </span>
                        </div>
                        {e.time && <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', flexShrink: 0 }}>{e.time}</span>}
                      </div>
                      {e.text && (
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-soft)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {e.text}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {mode === 'note' && selectedNote && (
            <>
              {!isEditing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedNote.text ? (
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--ink)', margin: 0 }}>
                      {selectedNote.text}
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', margin: 0 }}>No details added.</p>
                  )}

                  {selectedNote.photos && selectedNote.photos.length > 0 && (
                    <div>
                      <p style={{ ...labelStyle, margin: '0 0 0.5rem' }}>Photos</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {selectedNote.photos.map((p, i) => (
                          <img
                            key={i}
                            src={`http://localhost:3000${p}`}
                            alt="saved"
                            onClick={() => setLightboxSrc(`http://localhost:3000${p}`)}
                            style={{
                              width: '100%', height: 88, objectFit: 'cover',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'zoom-in',
                              transition: 'opacity 0.15s, transform 0.15s',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.opacity = '0.85';
                              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.opacity = '1';
                              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isEditing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div>
                    <label style={labelStyle}>Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Details</label>
                    <textarea value={text} onChange={e => setText(e.target.value)} rows={6} style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                  {error && <p style={{ margin: 0, fontSize: '0.8rem', color: '#c0392b' }}>{error}</p>}
                  <button
                    className="btn-primary"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true); setError(null);
                      try { await onUpdateNote(selectedNote.id!, { title, time, text }); setIsEditing(false); }
                      catch (err: any) { setError(err.message || 'Failed to update'); }
                      finally { setBusy(false); }
                    }}
                    style={{ width: '100%', padding: '0.625rem' }}
                  >
                    {busy ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: mode === 'note' && selectedNote ? 'space-between' : 'flex-end',
          gap: '0.5rem',
          flexShrink: 0,
        }}>
          {mode === 'note' && selectedNote ? (
            <>
              <button
                className="btn-danger"
                disabled={busy}
                onClick={async () => {
                  if (!window.confirm('Delete this note?')) return;
                  setBusy(true);
                  try { await onDeleteNote(selectedNote.id!); onClose(); }
                  catch (err: any) { setError(err.message || 'Failed to delete'); }
                  finally { setBusy(false); }
                }}
              >
                Delete
              </button>
              <button
                className={isEditing ? 'btn-ghost' : 'btn-primary'}
                disabled={busy}
                onClick={() => setIsEditing(v => !v)}
                style={{ padding: '0.375rem 1rem' }}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
              Click a note to view details
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default RightPanel;
