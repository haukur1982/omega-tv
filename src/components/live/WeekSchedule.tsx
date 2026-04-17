import DaySwitcher from './DaySwitcher';
import {
    getScheduleForWeek,
    groupByDay,
    formatClockUtc,
    durationMinutes,
    weekdayIs,
} from '@/lib/schedule-db';
import type { ScheduleSlot } from '@/lib/schedule-db';

/**
 * WeekSchedule — the /live page's full schedule block. Day switcher
 * across the top (seven tabs), selected day's slots below. Server-
 * rendered; the DaySwitcher is a tiny client island that drives a
 * ?day= URL param.
 *
 * Reads `schedule_slots` directly. See plan §4.3.
 */

export default async function WeekSchedule({ selectedDay }: { selectedDay?: string }) {
    const anchor = selectedDay ? new Date(selectedDay + 'T00:00:00Z') : new Date();
    const slots = await getScheduleForWeek(anchor);
    const byDay = groupByDay(slots);

    // Compute Monday of the displayed week
    const dow = anchor.getUTCDay();
    const daysFromMonday = (dow + 6) % 7;
    const monday = new Date(Date.UTC(
        anchor.getUTCFullYear(),
        anchor.getUTCMonth(),
        anchor.getUTCDate() - daysFromMonday,
    ));
    const weekStart = monday.toISOString().slice(0, 10);
    const selectedIso = (selectedDay ?? new Date().toISOString().slice(0, 10));
    const selectedSlots = byDay[selectedIso] ?? [];
    const selectedDate = new Date(selectedIso + 'T00:00:00Z');

    const empty = slots.length === 0;

    return (
        <section aria-label="Vikudagskrá" style={{ padding: 'clamp(2rem, 4vw, 3rem) 0' }}>
            <header
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: 'clamp(1rem, 1.6vw, 1.5rem)',
                }}
            >
                <h2 className="type-yfirskrift" style={{ margin: 0, color: 'var(--ljos)' }}>
                    Dagskrá vikunnar
                </h2>
                <p className="type-merki" style={{ color: 'var(--moskva)', margin: 0, letterSpacing: '0.2em' }}>
                    Vika · {weekStart.slice(5)}
                </p>
            </header>

            {empty ? (
                <EmptySchedule />
            ) : (
                <>
                    <DaySwitcher weekStart={weekStart} selected={selectedIso} />

                    <p
                        className="type-merki"
                        style={{
                            color: 'var(--moskva)',
                            margin: '20px 0 14px',
                            letterSpacing: '0.2em',
                        }}
                    >
                        {capitalize(weekdayIs(selectedDate))} · {selectedDate.getUTCDate()}. {monthIs(selectedDate)}
                    </p>

                    {selectedSlots.length === 0 ? (
                        <p
                            className="type-ritskrift"
                            style={{
                                padding: '24px 0',
                                color: 'var(--steinn)',
                                margin: 0,
                            }}
                        >
                            Engin dagskrá skráð fyrir þennan dag.
                        </p>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {selectedSlots.map(slot => (
                                <li key={slot.id}>
                                    <ScheduleRow slot={slot} />
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
}

function ScheduleRow({ slot }: { slot: ScheduleSlot }) {
    const startClock = formatClockUtc(slot.starts_at);
    const dur = durationMinutes(slot);
    const live = slot.is_live_broadcast;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '72px 1fr auto',
                alignItems: 'baseline',
                gap: 'clamp(14px, 2vw, 24px)',
                padding: 'clamp(16px, 2vw, 20px) 2px',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <span
                className="type-kodi"
                style={{
                    color: slot.is_featured ? 'var(--kerti)' : 'var(--moskva)',
                    fontSize: '0.95rem',
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {startClock}
            </span>
            <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: 'var(--ljos)',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {slot.program_title}
                    </h3>
                    {live && (
                        <span
                            className="type-merki"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 8px',
                                background: 'rgba(233, 168, 96, 0.12)',
                                border: '1px solid rgba(233, 168, 96, 0.35)',
                                color: 'var(--kerti)',
                                borderRadius: '2px',
                                fontSize: '0.58rem',
                                letterSpacing: '0.22em',
                            }}
                        >
                            <span
                                className="live-dot"
                                aria-hidden="true"
                                style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    background: 'var(--blod)',
                                    display: 'inline-block',
                                }}
                            />
                            Beint
                        </span>
                    )}
                </div>
                {slot.description && (
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--moskva)',
                            fontSize: '0.92rem',
                            lineHeight: 1.5,
                        }}
                    >
                        {slot.description}
                    </p>
                )}
            </div>
            <span
                className="type-meta"
                style={{
                    color: 'var(--steinn)',
                    whiteSpace: 'nowrap',
                }}
            >
                {dur} mín
            </span>
        </div>
    );
}

function EmptySchedule() {
    return (
        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <p className="type-ritskrift" style={{ color: 'var(--steinn)', margin: 0 }}>
                Dagskrá vikunnar er ekki enn tilbúin. Líttu aftur síðar.
            </p>
        </div>
    );
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function monthIs(d: Date): string {
    const months = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];
    return months[d.getUTCMonth()];
}
