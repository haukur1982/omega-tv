import Link from "next/link";
import { formatClockUtc, durationMinutes, type ScheduleSlot } from "@/lib/schedule-db";

/**
 * DagskraTimeline — chronological list of upcoming broadcasts.
 *
 * Replaces the old weekday-tab strip. Five to six items, ordered by
 * start time. Three row states:
 *   - live:  --blod left-stripe + pulsing "BEINT NÚNA" kicker
 *   - next:  --nordurljos left-stripe + "NÆSTA" kicker
 *   - later: quiet, just time + program + host
 *
 * Bright active state (not darker) — inverts the "active-day-is-darker"
 * bug the audit flagged on the previous weekday strip.
 */

interface Props {
    slots: ScheduleSlot[];
    currentId?: string | null;
    nextId?: string | null;
}

export default function DagskraTimeline({ slots, currentId, nextId }: Props) {
    if (slots.length === 0) return null;

    return (
        <section
            style={{
                maxWidth: '84rem',
                margin: '0 auto',
                padding: 'var(--section-gap) var(--rail-padding) 0',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    gap: '24px',
                    flexWrap: 'wrap',
                }}
            >
                <h2
                    className="type-greinar"
                    style={{ margin: 0, color: 'var(--ljos)', fontSize: 'clamp(1.6rem, 2.6vw, 2rem)' }}
                >
                    Dagskrá næstu daga.
                </h2>
                <Link
                    href="/dagskra"
                    style={{
                        color: 'var(--nordurljos)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    Sjá heila viku →
                </Link>
            </div>

            <ol style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--border)' }}>
                {slots.map((slot) => {
                    const isLive = slot.id === currentId;
                    const isNext = !isLive && slot.id === nextId;
                    const badge: 'live' | 'next' | null = isLive ? 'live' : isNext ? 'next' : null;

                    return (
                        <li
                            key={slot.id}
                            className="warm-hover"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '180px 120px 1fr 180px 44px',
                                gap: '24px',
                                alignItems: 'center',
                                padding: '22px 14px',
                                borderBottom: '1px solid var(--border)',
                                background: badge === 'live' ? 'rgba(216,75,58,0.035)' : 'transparent',
                                position: 'relative',
                            }}
                        >
                            {/* left stripe for active rows */}
                            {badge === 'live' && (
                                <span
                                    aria-hidden
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '10px',
                                        bottom: '10px',
                                        width: '2px',
                                        background: 'var(--blod)',
                                    }}
                                />
                            )}
                            {badge === 'next' && (
                                <span
                                    aria-hidden
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '10px',
                                        bottom: '10px',
                                        width: '2px',
                                        background: 'var(--nordurljos)',
                                    }}
                                />
                            )}

                            {/* badge + day */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                                {badge === 'live' && (
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignSelf: 'flex-start',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: 'var(--blod)',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '10.5px',
                                            fontWeight: 700,
                                            letterSpacing: '0.22em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        <span className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block' }} />
                                        Beint núna
                                    </span>
                                )}
                                {badge === 'next' && (
                                    <span
                                        style={{
                                            alignSelf: 'flex-start',
                                            color: 'var(--nordurljos)',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '10.5px',
                                            fontWeight: 700,
                                            letterSpacing: '0.22em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        Næsta
                                    </span>
                                )}
                                <span
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '17px',
                                        color: badge ? 'var(--ljos)' : 'var(--moskva)',
                                        letterSpacing: '-0.01em',
                                        fontWeight: badge ? 600 : 500,
                                    }}
                                >
                                    {dayLabel(new Date(slot.starts_at))}
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '11px',
                                        color: 'var(--steinn)',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {shortDate(new Date(slot.starts_at))}
                                </span>
                            </div>

                            {/* time */}
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontVariantNumeric: 'tabular-nums',
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    color: badge ? 'var(--ljos)' : 'var(--moskva)',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {formatClockUtc(slot.starts_at)}
                            </div>

                            {/* program */}
                            <div style={{ minWidth: 0 }}>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: 'clamp(1.05rem, 1.6vw, 1.25rem)',
                                        fontWeight: 700,
                                        color: 'var(--ljos)',
                                        letterSpacing: '-0.01em',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {slot.program_title}
                                </div>
                                {slot.host_name && (
                                    <div
                                        style={{
                                            fontFamily: 'var(--font-serif)',
                                            fontStyle: 'italic',
                                            fontSize: '13.5px',
                                            color: 'var(--moskva)',
                                            marginTop: '4px',
                                        }}
                                    >
                                        með {slot.host_name}
                                    </div>
                                )}
                            </div>

                            {/* length */}
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '12.5px',
                                    color: 'var(--steinn)',
                                    letterSpacing: '0.08em',
                                    textAlign: 'right',
                                }}
                            >
                                {durationMinutes(slot)} mín
                            </div>

                            {/* chevron */}
                            <div style={{ color: 'var(--moskva)', display: 'flex', justifyContent: 'flex-end' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <path d="M5 12h14M13 5l7 7-7 7" />
                                </svg>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

function dayLabel(d: Date): string {
    const now = new Date();
    const today = now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (d.toDateString() === today) return 'Í kvöld';
    if (d.toDateString() === tomorrow.toDateString()) return 'Á morgun';
    const weekday = d.toLocaleDateString('is-IS', { weekday: 'long' });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

function shortDate(d: Date): string {
    const weekday = d.toLocaleDateString('is-IS', { weekday: 'short' }).slice(0, 3);
    const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${cap} ${d.getUTCDate()}.${d.getUTCMonth() + 1}`;
}
