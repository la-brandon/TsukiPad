/**
 * MiniMonth.tsx
 *
 * Sidebar mini-month view with simple navigation and clickable dates.
 * Clicking a date calls onSelectDate("YYYY-MM-DD").
 */

import React, { useMemo } from 'react';

type MiniMonthProps = {
    currentMonth: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDate: (date: string) => void;
};

function pad2(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
}

function toYMD(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

const MiniMonth: React.FC<MiniMonthProps> = ({
    currentMonth,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
}) => {
    const { monthLabel, cells, todayYMD } = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const monthLabel = currentMonth.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
        });

        const first = new Date(year, month, 1);
        const startDay = first.getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells: Array<{ day: number | null; dateStr?: string }> = [];

        // leading blanks
        for (let i = 0; i < startDay; i++) cells.push({ day: null });

        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(year, month, day);
            cells.push({ day, dateStr: toYMD(d) });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return { monthLabel, cells, todayYMD: toYMD(today) };
    }, [currentMonth]);

    return (
        <div className="bg-white/70 rounded-xl border p-3">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={onPrevMonth}
                    className="text-sm px-2 py-1 rounded hover:bg-gray-100"
                    aria-label="Previous month"
                >
                    ◀
                </button>

                <div className="text-sm font-semibold">{monthLabel}</div>

                <button
                    onClick={onNextMonth}
                    className="text-sm px-2 py-1 rounded hover:bg-gray-100"
                    aria-label="Next month"
                >
                    ▶
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-500 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                    <div key={d} className="text-center font-semibold">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {cells.map((c, idx) => {
                    if (!c.day) return <div key={idx} className="h-7" />;

                    const isToday = c.dateStr === todayYMD;

                    return (
                        <button
                            key={idx}
                            onClick={() => onSelectDate(c.dateStr!)}
                            className={[
                                'h-7 rounded text-xs flex items-center justify-center hover:bg-gray-100',
                                isToday ? 'border border-pink-300 font-semibold' : 'border border-transparent',
                            ].join(' ')}
                            title="Add note"
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
