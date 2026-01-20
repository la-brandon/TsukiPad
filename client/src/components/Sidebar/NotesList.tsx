/**
 * NotesList.tsx
 *
 * Sidebar component that displays a grouped list of notes (memories or reminders).
 * Groups notes by date and allows clicking an item to open EditNoteModal.
 */

import React, { useMemo } from 'react';
import { JournalEntry } from '../../types';

type NotesListProps = {
    title: string;
    notes: JournalEntry[];
    onSelectEntry: (id: number) => void;
};

function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const NotesList: React.FC<NotesListProps> = ({ title, notes, onSelectEntry }) => {
    const grouped = useMemo(() => {
        const map: Record<string, JournalEntry[]> = {};
        for (const note of notes) {
            if (!map[note.date]) map[note.date] = [];
            map[note.date].push(note);
        }

        // Sort by date asc
        const sortedDates = Object.keys(map).sort((a, b) => a.localeCompare(b));

        return { map, sortedDates };
    }, [notes]);

    return (
        <div className="bg-white/70 rounded-xl border p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">{title}</h3>
                <span className="text-[11px] text-gray-500">{notes.length}</span>
            </div>

            {grouped.sortedDates.length === 0 ? (
                <p className="text-xs text-gray-500">Nothing here yet.</p>
            ) : (
                <div className="space-y-3 max-h-[260px] overflow-auto pr-1">
                    {grouped.sortedDates.map((date) => (
                        <div key={date}>
                            <div className="text-[11px] font-semibold text-gray-600 mb-1">
                                {formatDateLabel(date)}
                            </div>

                            <div className="space-y-1">
                                {grouped.map[date].map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => onSelectEntry(n.id!)}
                                        className="w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 border border-transparent hover:border-gray-200"
                                        title={n.text ?? ''}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate">{n.title}</span>
                                            {n.time && (
                                                <span className="text-[11px] text-gray-500 shrink-0">
                                                    {n.time}
                                                </span>
                                            )}
                                        </div>
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
