/**
 * lib/api/journal.ts
 *
 * Centralized helper functions for calling the Express journal API.
 * Exposes:
 *  - fetchJournalEntries()
 *  - createJournalEntry(formData)
 *  - updateJournalEntry(id, body)
 *  - deleteJournalEntry(id)
 *
 * Keeping API logic here prevents fetch URLs from being duplicated across components.
 */

import { JournalEntry } from '../../types';

const API_BASE = 'http://localhost:3000';

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
    const res = await fetch(`${API_BASE}/api/journal/all`);
    if (!res.ok) throw new Error('Failed to fetch journal entries');
    return res.json();
}

export async function createJournalEntry(formData: FormData): Promise<void> {
    const res = await fetch(`${API_BASE}/api/journal`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to create journal entry');
}

export async function updateJournalEntry(
    id: number,
    body: { title?: string; time?: string; text?: string }
): Promise<void> {
    const res = await fetch(`${API_BASE}/api/journal/entry/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update journal entry');
}

export async function deleteJournalEntry(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/journal/entry/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete journal entry');
}
