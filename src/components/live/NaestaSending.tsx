'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatClockUtc, type ScheduleSlot } from '@/lib/schedule-db';

/**
 * NaestaSending — State B panel. Replaces the player slot entirely
 * when there's no broadcast in progress.
 *
 * Composition: countdown time on the left (Fraunces display, large),
 * a quiet cinematic photo on the right, primary "Minna mig á" CTA,
 * secondary "Sjá heila dagskrá" link in nordurljos.
 *
 * The countdown re-computes once per minute (no ticking seconds —
 * would feel anxious, per the motion rules).
 */

interface Props {
    next: ScheduleSlot | null;
}

export default function NaestaSending({ next }: Props) {
    const [mLeft, setMLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!next) { setMLeft(null); return; }
        const compute = () => {
            const diff = new Date(next.starts_at).getTime() - Date.now();
            setMLeft(Math.max(0, Math.round(diff / 60000)));
        };
        compute();
        const id = setInterval(compute, 60000);
        return () => clearInterval(id);
    }, [next]);

    const hh = mLeft !== null ? Math.floor(mLeft / 60) : 0;
    const mm = mLeft !== null ? mLeft % 60 : 0;

    // "Í kvöld" if same calendar day, "Á morgun" if next day, otherwise weekday.
    const when = next ? dayLabel(new Date(next.starts_at)) : 'Senn';
    const clock = next ? formatClockUtc(next.starts_at) : '—:—';
    const host = next?.host_name ?? 'Omega';

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at 30% 20%, rgba(111,165,216,0.06) 0%, transparent 55%), var(--nott)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lift)',
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr',
                alignItems: 'stretch',
            }}
        >
            {/* Left — countdown + program */}
            <div
                style={{
                    padding: 'clamp(36px, 5vw, 72px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '22px',
                    minWidth: 0,
                }}
            >
                <span className="type-merki" style={{ color: 'var(--nordurljos)' }}>
                    Næsta sending
                </span>

                <div
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 300,
                        letterSpacing: '-0.035em',
                        lineHeight: 0.92,
                        color: 'var(--ljos)',
                        fontSize: 'clamp(3.2rem, 6.5vw, 5.75rem)',
                    }}
                >
                    {when} kl.<br />
                    <span>{clock}</span>
                </div>

                {mLeft !== null && (
                    <div
                        style={{
                            color: 'var(--moskva)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13.5px',
                            letterSpacing: '0.05em',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        eftir <span style={{ color: 'var(--ljos)' }}>{hh} klst.</span>{' '}
                        <span style={{ color: 'var(--ljos)' }}>{String(mm).padStart(2, '0')} mín.</span>
                    </div>
                )}

                <div style={{ width: '56px', height: '1px', background: 'var(--border)', margin: '6px 0' }} />

                <div>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(1.15rem, 1.8vw, 1.4rem)',
                            lineHeight: 1.35,
                            color: 'var(--ljos)',
                            maxWidth: '26ch',
                        }}
                    >
                        {next?.program_title ?? 'Næsta útsending verður tilkynnt fljótlega.'}
                    </p>
                    {next && (
                        <p
                            style={{
                                margin: '8px 0 0',
                                color: 'var(--steinn)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '13px',
                                letterSpacing: '0.04em',
                            }}
                        >
                            með {host}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                    <button
                        type="button"
                        className="warm-hover"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 26px',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--kerti)',
                            color: 'var(--nott)',
                            border: '1px solid var(--kerti)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            letterSpacing: '0.01em',
                            cursor: 'pointer',
                        }}
                        // TODO: wire to reminder service (calendar .ics or push/email subscribe).
                        onClick={() => { /* placeholder */ }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10 21a2 2 0 0 0 4 0" />
                        </svg>
                        Minna mig á
                    </button>
                    <Link
                        href="/dagskra"
                        style={{
                            alignSelf: 'center',
                            color: 'var(--nordurljos)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        Sjá heila dagskrá →
                    </Link>
                </div>
            </div>

            {/* Right — cinematic dark photograph */}
            <div style={{ position: 'relative', minHeight: '280px' }}>
                {/* Unsplash: warm cinematic hands-in-light — kept inline in the
                    prototype tradition. Swap to a real brand photo when one
                    lands in public/editorial/. */}
                <img
                    src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1400&auto=format&fit=crop"
                    alt=""
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.58,
                        filter: 'saturate(0.7) contrast(1.05)',
                    }}
                />
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, var(--nott) 0%, rgba(20,18,15,0.4) 40%, rgba(20,18,15,0.25) 100%)',
                    }}
                />
            </div>
        </div>
    );
}

function dayLabel(d: Date): string {
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return 'Í kvöld';
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Á morgun';
    const weekday = d.toLocaleDateString('is-IS', { weekday: 'long' });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}
