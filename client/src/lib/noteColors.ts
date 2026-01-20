// client/src/lib/noteColors.ts
import type { NoteColor } from '../types';

type NoteColorConfig = {
    classes: string; // Tailwind classes for bg/border/text
    hex: string;     // solid color for small dots
};

const NOTE_COLORS: Record<NoteColor, NoteColorConfig> = {
    red: {
        classes: 'bg-red-100 border-red-200 text-red-900',
        hex: '#ef4444',
    },
    orange: {
        classes: 'bg-orange-100 border-orange-200 text-orange-900',
        hex: '#f97316',
    },
    yellow: {
        classes: 'bg-yellow-100 border-yellow-200 text-yellow-900',
        hex: '#eab308',
    },
    green: {
        classes: 'bg-green-100 border-green-200 text-green-900',
        hex: '#22c55e',
    },
    blue: {
        classes: 'bg-blue-100 border-blue-200 text-blue-900',
        hex: '#3b82f6',
    },
    purple: {
        classes: 'bg-purple-100 border-purple-200 text-purple-900',
        hex: '#a855f7',
    },
    pink: {
        classes: 'bg-pink-100 border-pink-200 text-pink-900',
        hex: '#ec4899',
    },
    gray: {
        classes: 'bg-gray-100 border-gray-200 text-gray-900',
        hex: '#9ca3af',
    },
};

const DEFAULT_COLOR: NoteColor = 'blue';

export const NOTE_COLOR_OPTIONS: NoteColor[] = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'purple',
    'pink',
    'gray',
];

export function getNoteColorConfig(color?: NoteColor): NoteColorConfig {
    return NOTE_COLORS[color ?? DEFAULT_COLOR];
}

export function noteBg(color?: NoteColor): string {
    return getNoteColorConfig(color).classes;
}

export function colorToHex(color?: NoteColor): string {
    return getNoteColorConfig(color).hex;
}
