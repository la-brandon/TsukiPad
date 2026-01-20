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

    // navigation actions
    onSelectNote: (id: number) => void;
    onBackToDay: (date: string) => void;

    onCreateNote: (formData: FormData) => Promise<void>;
    onAfterCreate: () => Promise<void>; // refresh entries in App

    // editing actions
    onUpdateNote: (id: number, body: { title?: string; time?: string; text?: string }) => Promise<void>;
    onDeleteNote: (id: number) => Promise<void>;
};

function formatLongDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const RightPanel: React.FC<RightPanelProps> = ({
    isOpen,
    mode,
    date,
    noteId,
    entries,
    onClose,
    onSelectNote,
    onBackToDay,
    onCreateNote,
    onAfterCreate,
    onUpdateNote,
    onDeleteNote,
}) => {
    // find the selected note
    const selectedNote = useMemo(() => {
        if (noteId == null) return null;
        return entries.find(e => e.id === noteId) ?? null;
    }, [noteId, entries]);

    // Day list
    const dayEntries = useMemo(() => {
        if (!date) return [];
        return entries.filter(e => e.date === date);
    }, [date, entries]);

    // view/edit mode for the note panel
    const [isEditing, setIsEditing] = useState(false);

    // local edit form state
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newText, setNewText] = useState('');
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [newColor, setNewColor] = useState<string>('blue');


    const createLabel = useMemo(() => {
        if (!date) return 'Add';
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < t ? 'Add Memory' : 'Add Reminder';
    }, [date]);

    async function handleCreate() {
        if (!date) return;
        if (!newTitle.trim()) {
            setError('Title is required');
            return;
        }

        setBusy(true);
        setError(null);

        try {
            const fd = new FormData();
            fd.append('date', date);
            fd.append('title', newTitle.trim());
            fd.append('time', newTime);
            fd.append('text', newText);
            fd.append('color', newColor);

            newPhotos.forEach((file) => fd.append('photos', file)); // must match multer field name

            await onCreateNote(fd);
            await onAfterCreate();

            // reset + collapse
            setNewTitle('');
            setNewTime('');
            setNewText('');
            setNewPhotos([]);
            setNewColor('blue');
            setShowCreate(false);
        } catch (err: any) {
            setError(err.message || 'Failed to create note');
        } finally {
            setBusy(false);
        }
    }

    // when note changes, reset editing + load form fields
    useEffect(() => {
        setIsEditing(false);
        setError(null);

        if (selectedNote) {
            setTitle(selectedNote.title ?? '');
            setTime(selectedNote.time ?? '');
            setText(selectedNote.text ?? '');
        }
    }, [selectedNote?.id]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />

            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-start justify-between gap-3">
                    <div>
                        {mode === 'day' ? (
                            <div className="w-full">
                                <div className="text-sm text-gray-500">Notes for</div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-lg font-semibold">
                                        {date ? formatLongDate(date) : '—'}
                                    </div>
                                    {date && (
                                        <button
                                            onClick={() => setShowCreate((v) => !v)}
                                            className="px-3 py-2 rounded bg-gray-900 text-white text-sm hover:bg-black"
                                        >
                                            {createLabel}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Back button */}
                                <button
                                    onClick={() => {
                                        if (selectedNote?.date) {
                                            setIsEditing(false);
                                            onBackToDay(selectedNote.date);
                                        }
                                    }}
                                    className="text-xs text-blue-600 hover:underline mb-1"
                                >
                                    ← Back to day
                                </button>

                                <div className="text-sm text-gray-500">Viewing</div>
                                <div className="text-lg font-semibold truncate">
                                    {selectedNote?.title ?? '—'}
                                </div>

                                {selectedNote?.date && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatLongDate(selectedNote.date)} {selectedNote.time ? `• ${selectedNote.time}` : ''}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 overflow-auto">
                    {mode === 'day' && (
                        <>
                            {showCreate && date && (
                                <div className="mb-4 p-3 rounded-lg border bg-gray-50 space-y-2">
                                    <div className="text-sm font-semibold">
                                        {createLabel} for {formatLongDate(date)}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">Title</label>
                                        <input
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                            placeholder="e.g. Dentist appointment"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">Time (optional)</label>
                                        <input
                                            type="time"
                                            value={newTime}
                                            onChange={(e) => setNewTime(e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">Color</label>

                                        <div className="flex flex-wrap gap-2">
                                            {NOTE_COLOR_OPTIONS.map((c: NoteColor) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setNewColor(c)}
                                                    className={[
                                                        'w-6 h-6 rounded-full border',
                                                        newColor === c ? 'ring-2 ring-black/40' : '',
                                                    ].join(' ')}
                                                    style={{ backgroundColor: colorToHex(c) }}
                                                    aria-label={`Set color ${c}`}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">Details (optional)</label>
                                        <textarea
                                            value={newText}
                                            onChange={(e) => setNewText(e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm resize-none"
                                            rows={3}
                                            placeholder="Add extra details..."
                                        />
                                    </div>

                                    {/* Photos */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Photos (optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                const files = e.target.files ? Array.from(e.target.files) : [];
                                                setNewPhotos(files);
                                            }}
                                            className="w-full text-xs"
                                        />
                                    </div>

                                    {newPhotos.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {newPhotos.map((file, idx) => (
                                                <img
                                                    key={idx}
                                                    src={URL.createObjectURL(file)}
                                                    className="w-full h-16 object-cover rounded"
                                                    alt="preview"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreate(false)}
                                            className="flex-1 px-3 py-2 rounded border text-sm hover:bg-white"
                                            disabled={busy}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCreate}
                                            className="flex-1 px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                                            disabled={busy}
                                        >
                                            {busy ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {dayEntries.length === 0 ? (
                                <p className="text-sm text-gray-500">No notes for this day yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {dayEntries.map((e) => (
                                        <button
                                            onClick={() => onSelectNote(e.id!)}
                                            className={[
                                                'w-full text-left p-3 rounded-lg border',
                                                'hover:brightness-95',
                                                noteBg(e.color as NoteColor),
                                            ].join(' ')}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: colorToHex(e.color as NoteColor) }}
                                                    />
                                                    <div className="font-semibold text-sm truncate">{e.title}</div>
                                                </div>
                                                {e.time && <div className="text-xs text-gray-500">{e.time}</div>}
                                            </div>
                                            {e.text && (
                                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {e.text}
                                                </div>
                                            )}
                                        </button>

                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {mode === 'note' && selectedNote && (
                        <>
                            {/* View mode */}
                            {!isEditing && (
                                <div className="space-y-3">
                                    {selectedNote.text ? (
                                        <p className="text-sm whitespace-pre-wrap">{selectedNote.text}</p>
                                    ) : (
                                        <p className="text-sm text-gray-500">No details.</p>
                                    )}

                                    {/* Photos */}
                                    {selectedNote.photos && selectedNote.photos.length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold text-gray-600 mb-2">Photos</div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {selectedNote.photos.map((p, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={`http://localhost:3000${p}`}
                                                        className="w-full h-24 object-cover rounded"
                                                        alt="saved"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Edit mode */}
                            {isEditing && (
                                <form
                                    className="space-y-3"
                                    onSubmit={async (ev) => {
                                        ev.preventDefault();
                                        setBusy(true);
                                        setError(null);
                                        try {
                                            await onUpdateNote(selectedNote.id!, { title, time, text });
                                            setIsEditing(false);
                                        } catch (err: any) {
                                            setError(err.message || 'Failed to update');
                                        } finally {
                                            setBusy(false);
                                        }
                                    }}
                                >
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Title</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">Time</label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">Details</label>
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm resize-none"
                                            rows={5}
                                        />
                                    </div>

                                    {error && <div className="text-xs text-red-600">{error}</div>}

                                    <button
                                        type="submit"
                                        disabled={busy}
                                        className="w-full px-3 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
                                    >
                                        {busy ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                {/* Footer actions */}
                <div className="p-4 border-t flex items-center justify-between gap-2">
                    {mode === 'note' && selectedNote ? (
                        <>
                            <button
                                onClick={async () => {
                                    if (!window.confirm('Delete this note?')) return;
                                    setBusy(true);
                                    setError(null);
                                    try {
                                        await onDeleteNote(selectedNote.id!);
                                        onClose();
                                    } catch (err: any) {
                                        setError(err.message || 'Failed to delete');
                                    } finally {
                                        setBusy(false);
                                    }
                                }}
                                className="px-3 py-2 rounded border border-red-500 text-red-600 text-sm disabled:opacity-60"
                                disabled={busy}
                            >
                                Delete
                            </button>

                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
                                        disabled={busy}
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-2 rounded border text-sm"
                                        disabled={busy}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-xs text-gray-500">
                            Tip: click an item to view details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RightPanel;
