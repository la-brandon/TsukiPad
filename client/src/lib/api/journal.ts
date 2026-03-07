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

// Helper function to include the Base URL and credentials in all API calls
async function apiFetch(url: string, options: RequestInit = {}) {
    return fetch(`${API_BASE}${url}`, {
        credentials: "include",
        ...options,
    });
}

// API FUNCTIONS
// Fetch all journal entries for the logged-in user
export async function fetchJournalEntries(): Promise<JournalEntry[]> {
    const res = await apiFetch('/api/journal/all');
    if (!res.ok) throw new Error('Failed to fetch journal entries');
    return res.json();
}

// Create a new journal entry with the given FormData (title, time, text, and optional image)
export async function createJournalEntry(formData: FormData): Promise<void> {
    const res = await apiFetch('/api/journal', {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to create journal entry');
}

// Update an existing journal entry by ID with the provided fields (title, time, text)
export async function updateJournalEntry(
    id: number,
    body: { title?: string; time?: string; text?: string }
): Promise<void> {
    const res = await apiFetch(`/api/journal/entry/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: "include",
    });
    if (!res.ok) throw new Error('Failed to update journal entry');
}

// Delete a journal entry by ID
export async function deleteJournalEntry(id: number): Promise<void> {
    const res = await apiFetch(`/api/journal/entry/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete journal entry');
}




