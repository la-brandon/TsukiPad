/**
 * MonthlyCalendar.tsx
 *
 * Renders a full monthly calendar grid (Sun–Sat).
 * Responsibilities:
 *  - Build month view including leading/trailing empty cells
 *  - Display weather forecast icons + temperatures per day
 *  - Group journal entries per date and show them inside day cells
 *  - Notify parent when user clicks a day or an entry
 *
 * Props:
 *  - currentMonth: Date                → The month to display
 *  - journalEntries: JournalEntry[]    → All entries, grouped by date
 *  - forecastByDate: Record<string, WeatherSummary> → Weather info for each date
 *  - onPrevMonth / onNextMonth         → Navigation callbacks
 *  - onSelectDate                      → Click empty day → open Add Note
 *  - onSelectEntry                     → Click entry → open Edit Note
 */



import React from 'react';
import { JournalEntry, WeatherSummary, EntriesByDate, ForecastByDate } from '../../types';


type MonthlyCalendarProps = {
    currentMonth: Date;
    journalEntries: JournalEntry[];
    forecastByDate?: ForecastByDate;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDate?: (date: string) => void;
    onSelectEntry?: (entryId: number) => void;
};


// Helper: format date as "YYYY-MM-DD"
function formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function noteBg(color: string) {
    switch (color) {
        case 'red': return 'bg-red-100 border-red-200 text-red-900';
        case 'orange': return 'bg-orange-100 border-orange-200 text-orange-900';
        case 'yellow': return 'bg-yellow-100 border-yellow-200 text-yellow-900';
        case 'green': return 'bg-green-100 border-green-200 text-green-900';
        case 'blue': return 'bg-blue-100 border-blue-200 text-blue-900';
        case 'purple': return 'bg-purple-100 border-purple-200 text-purple-900';
        case 'pink': return 'bg-pink-100 border-pink-200 text-pink-900';
        case 'gray': return 'bg-gray-100 border-gray-200 text-gray-900';
        default: return 'bg-blue-100 border-blue-200 text-blue-900';
    }
}


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
    const monthIndex = currentMonth.getMonth(); // 0–11

    const todayStr = formatDate(new Date());
    const firstOfMonth = new Date(year, monthIndex, 1);
    const firstWeekday = firstOfMonth.getDay(); // 0=Sun ... 6=Sat
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    // Build a map: date string -> entries[]
    const entriesByDate: EntriesByDate = {};
    journalEntries.forEach(entry => {
        if (!entry.date) return;
        if (!entriesByDate[entry.date]) {
            entriesByDate[entry.date] = [];
        }
        entriesByDate[entry.date].push(entry);
    });


    // Build cells for the grid (including leading blanks)
    const cells: { date: string | null; dayOfMonth: number | null }[] = [];

    // Leading blank cells before the 1st of the month
    for (let i = 0; i < firstWeekday; i++) {
        cells.push({ date: null, dayOfMonth: null });
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, monthIndex, day);
        const dateStr = formatDate(cellDate);
        cells.push({ date: dateStr, dayOfMonth: day });
    }

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });

    return (
        <div className="w-full h-full flex flex-col">
            {/* Month header with nav */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={onPrevMonth}
                    className="px-2 py-1 border rounded text-sm"
                >
                    ◀
                </button>
                <h2 className="text-2xl font-semibold">
                    {monthName} {year}
                </h2>
                <button
                    onClick={onNextMonth}
                    className="px-2 py-1 border rounded text-sm"
                >
                    ▶
                </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-medium mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-xs sm:text-sm">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm flex-1 [grid-auto-rows:1fr]">
                {cells.map((cell, index) => {
                    if (cell.date === null) {
                        return <div key={index} className="h-full" />;
                    }

                    const entries = entriesByDate[cell.date] || [];
                    const weather = cell.date ? forecastByDate[cell.date] : undefined;
                    const isToday = cell.date === todayStr;

                    return (
                        <div
                            key={cell.date}
                            className="border rounded p-1 sm:p-2 h-full flex flex-col min-h-0 cursor-pointer hover:bg-gray-100"
                            onClick={() => onSelectDate && onSelectDate(cell.date!)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">{cell.dayOfMonth}</span>

                                {isToday && (
                                    <span className="text-[9px] text-blue-600 font-semibold">
                                        Today
                                    </span>
                                )}
                            </div>

                            {weather && (
                                <div className="flex items-center gap-1 mt-1">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                                        alt={weather.weather}
                                        className="w-6 h-6"
                                    />
                                    <span className="text-[10px] sm:text-xs">
                                        H: {Math.round(weather.tempMax)}° / L: {Math.round(weather.tempMin)}°
                                    </span>
                                </div>
                            )}

                            <div className="mt-1 space-y-1 overflow-auto">
                                {entries.map((entry, i) => (
                                    <button
                                        key={entry.id ?? i}
                                        className={[
                                            "mt-1 w-full text-left",
                                            "text-[10px] sm:text-xs",
                                            "truncate",
                                            "px-2 py-1 rounded",
                                            "border",
                                            "hover:brightness-95",
                                            noteBg(entry.color ?? 'blue'),
                                        ].join(" ")}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (entry.id != null && onSelectEntry) {
                                                onSelectEntry(entry.id);
                                            }
                                        }}
                                        type="button"
                                    >
                                        • {entry.title}
                                    </button>

                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

}
