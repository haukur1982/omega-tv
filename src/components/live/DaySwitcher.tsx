'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { shortWeekdayIs } from '@/lib/schedule-db';

/**
 * DaySwitcher — seven-day tab strip that updates the ?day=YYYY-MM-DD
 * query param. The /live page server-renders the selected day's slots
 * based on that param. See plan §4.3.
 */
export default function DaySwitcher({
    weekStart,
    selected,
}: {
    /** ISO date for Monday of the displayed week (UTC). */
    weekStart: string;
    /** Currently-selected date ("YYYY-MM-DD"). */
    selected: string;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const monday = new Date(weekStart);
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.UTC(
            monday.getUTCFullYear(),
            monday.getUTCMonth(),
            monday.getUTCDate() + i,
        ));
        return d;
    });

    return (
        <div
            role="tablist"
            aria-label="Veldu dag"
            style={{
                display: 'flex',
                gap: '2px',
                padding: '4px',
                background: 'var(--torfa)',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                overflowX: 'auto',
            }}
        >
            {days.map(d => {
                const iso = d.toISOString().slice(0, 10);
                const active = iso === selected;
                const { weekday, day } = shortWeekdayIs(d);
                const params = new URLSearchParams(searchParams?.toString() ?? '');
                params.set('day', iso);
                const href = `${pathname}?${params.toString()}`;
                return (
                    <Link
                        key={iso}
                        href={href}
                        role="tab"
                        aria-selected={active}
                        scroll={false}
                        style={{
                            flex: '1 1 auto',
                            minWidth: '64px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '10px 10px 11px',
                            background: active ? 'var(--reykur)' : 'transparent',
                            borderRadius: '2px',
                            textDecoration: 'none',
                            color: active ? 'var(--ljos)' : 'var(--moskva)',
                            transition: 'background 200ms ease, color 200ms ease',
                        }}
                    >
                        <span
                            className="type-merki"
                            style={{
                                fontSize: '0.62rem',
                                letterSpacing: '0.18em',
                                color: active ? 'var(--kerti)' : 'var(--steinn)',
                            }}
                        >
                            {weekday}
                        </span>
                        <span
                            className="type-kodi"
                            style={{
                                fontSize: '1.05rem',
                                fontFamily: 'var(--font-display, var(--font-serif))',
                                fontWeight: 400,
                                letterSpacing: '-0.01em',
                                color: 'inherit',
                            }}
                        >
                            {day}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
