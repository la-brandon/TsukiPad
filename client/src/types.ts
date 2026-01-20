/**
 * types.ts
 *
 * Shared TypeScript interfaces for the calendar + weather journal app.
 * Includes:
 *  - JournalEntry
 *  - WeatherSummary
 *  - ForecastByDate / EntriesByDate helpers
 *  - Colors for notes
 */

export interface JournalEntry {
    id?: number;        // index in journal_data.txt
    date: string;       // YYYY-MM-DD
    title: string;
    time?: string;
    text?: string;
    photos?: string[];
    color?: NoteColor;
}

/** Summary weather used in the month grid */
export interface WeatherSummary {
    date: string;       // YYYY-MM-DD
    tempMin: number;
    tempMax: number;
    icon: string;
    weather: string;
}

/** Map of date → journal entries */
export type EntriesByDate = Record<string, JournalEntry[]>;

/** Map of date → simplified weather summary */
export type ForecastByDate = Record<string, WeatherSummary>;

/** Possible colors for notes */
export type NoteColor =
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'pink'
    | 'gray';

