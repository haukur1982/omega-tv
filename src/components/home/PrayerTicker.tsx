'use client';

import { useState } from 'react';
import Link from 'next/link';

/** Public prayer excerpts only; an empty list becomes an invitation, never sample activity. */

interface Props {
    lines: string[];
    register?: 'dark' | 'cream';
}

export default function PrayerTicker({ lines, register = 'dark' }: Props) {
    const items = lines.filter(line => line.trim());
    const [i, setI] = useState(0);
    const line = items.length ? items[i % items.length] : 'Hvað liggur þér á hjarta? Við viljum biðja með þér.';

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
                    gap: '16px 28px',
                    flexWrap: 'wrap',
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
                        {items.length ? 'Af bænatorginu' : 'Bænatorg'}
                    </span>
                </div>
                <div
                    style={{
                        flex: '1 1 260px',
                        minWidth: 0,
                        overflow: 'hidden',
                        minHeight: '26px',
                    }}
                >
                    <div
                        key={i}
                        aria-live="polite"
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '17px',
                            color: tokens.lineColor,
                            lineHeight: 1.4,
                            letterSpacing: '-0.005em',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {line}
                    </div>
                </div>
                {items.length > 1 && (
                    <button type="button" onClick={() => setI(x => (x + 1) % items.length)}
                        className="min-h-11 text-sm underline underline-offset-4" style={{ color: tokens.ctaColor }}>
                        Næsta bæn
                    </button>
                )}
                <Link
                    href="/baenatorg"
                    style={{
                        minHeight: '44px',
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
        </section>
    );
}
