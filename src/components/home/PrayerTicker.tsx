'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * PrayerTicker — single rotating line under the OnAirRibbon.
 *
 * "Á Bænatorgi núna" kicker with a quiet pulsing amber dot (the
 * "single candle" motion rule — prayer is alive on this site).
 * Rotates through recent broadcast prayers every 4.2s. Reads as
 * "the place is alive" without being a full content shelf.
 *
 * Data comes from /api/broadcast-prayers or is passed in from the
 * server; this component just handles rotation. Falls back to a
 * handful of placeholder strings if empty so the section doesn't
 * show blank when the DB has no recent prayers.
 */

interface Props {
    lines: string[];
    register?: 'dark' | 'cream';
}

const FALLBACK: string[] = [
    'Systir í Hafnarfirði biður fyrir föður sínum.',
    'Einhver biður fyrir ungu fólki á Íslandi.',
    'Nafnlaus biður um frið á heimili sínu.',
    'Bróðir biður fyrir vinnufélaga sem missti móður sína.',
    'Nafnlaus þakkar fyrir bænasvar — „drottinn heyrði".',
    'Systir í Reykjavík biður fyrir Ísrael.',
    'Einhver biður fyrir heilsu móður sinnar.',
];

export default function PrayerTicker({ lines, register = 'dark' }: Props) {
    const items = lines.length > 0 ? lines : FALLBACK;
    const [i, setI] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;
        const id = setInterval(() => setI((x) => (x + 1) % items.length), 4200);
        return () => clearInterval(id);
    }, [items.length]);

    const isCream = register === 'cream';
    const tokens = isCream
        ? {
            bg: 'var(--skra)',
            border: 'rgba(63,47,35,0.12)',
            kickerColor: 'var(--gull)',
            lineColor: 'var(--skra-djup)',
            ctaColor: 'var(--skra-djup)',
        }
        : {
            bg: 'var(--torfa)',
            border: 'var(--border)',
            kickerColor: 'var(--moskva)',
            lineColor: 'var(--ljos)',
            ctaColor: 'var(--nordurljos)',
        };

    return (
        <section
            style={{
                background: tokens.bg,
                borderBottom: `1px solid ${tokens.border}`,
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: '22px var(--rail-padding)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '28px',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span
                        className="candle-breathe"
                        aria-hidden
                        style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--kerti)',
                            display: 'inline-block',
                        }}
                    />
                    <span
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: tokens.kickerColor,
                        }}
                    >
                        Á Bænatorgi núna
                    </span>
                </div>
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        borderLeft: `1px solid ${tokens.border}`,
                        paddingLeft: '28px',
                    }}
                >
                    <div
                        key={i}
                        className="ticker-in"
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '17px',
                            color: tokens.lineColor,
                            lineHeight: 1.4,
                            letterSpacing: '-0.005em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {items[i]}
                    </div>
                </div>
                <Link
                    href="/baenatorg"
                    style={{
                        color: tokens.ctaColor,
                        textDecoration: 'none',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    Bæn á torgið →
                </Link>
            </div>
            <style jsx>{`
                .ticker-in {
                    animation: ticker-in 420ms ease;
                }
                @keyframes ticker-in {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}
