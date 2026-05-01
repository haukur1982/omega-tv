'use client';

import { useState } from 'react';
import { IcoHands, IcoShare, IcoHeartCheck } from './PrayerIcons';
import type { Prayer } from '@/lib/prayer-db';

/**
 * PrayerCardV2 — single prayer in the Bænatorg feed.
 *
 * Two registers, intentionally minimal in both:
 *
 *   - "dark" (default) — transparent row on the warm-black page,
 *     border-bottom separator, halo-hover with --torfa tint.
 *
 *   - "light" — flowing prayer on the vellum register. NO card
 *     chrome (no boxed background, no border boxing the text).
 *     Each prayer is a "stanza": italic body, smallcaps meta row,
 *     thin --gull gold rule below it, generous breath. Reads like
 *     pages in a book of voices, not like a Pinterest grid.
 *
 *     The "Bið með þér" action becomes a quiet inline gold link
 *     (with the count) instead of a hard button. Still functional
 *     and legible — the action stays available without competing
 *     with the prayer body.
 *
 * Body is the star in both. Italic Newsreader, large, generous
 * line-height. The meta row is quiet. Amber stays reserved for the
 * invitation row's primary CTA above the feed.
 */

type Register = 'dark' | 'light';

interface Props {
    prayer: Prayer;
    density?: 'comfortable' | 'compact';
    register?: Register;
    onPray?: (id: string) => void;
    onShare?: (prayer: Prayer) => void;
}

export default function PrayerCardV2({ prayer, density = 'comfortable', register = 'dark', onPray, onShare }: Props) {
    const [prayed, setPrayed] = useState(false);
    const [count, setCount] = useState(prayer.prayCount);
    const [hovered, setHovered] = useState(false);

    const isAnswer = prayer.isAnswered;
    const isLight = register === 'light';
    const padY = density === 'compact' ? 24 : 36;
    const bodySize = density === 'compact' ? 20 : 22;

    const handlePray = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (prayed) return;
        setPrayed(true);
        setCount((c) => c + 1);
        onPray?.(prayer.id);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onShare) {
            onShare(prayer);
            return;
        }
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: 'Bænaefni — Omega',
                text: prayer.content,
                url: typeof window !== 'undefined' ? window.location.href : '',
            }).catch(() => { /* user cancelled */ });
        }
    };

    const when = relativeIs(prayer.timestamp);

    if (isLight) {
        return <FlowVariant
            prayer={prayer} bodySize={bodySize} padY={padY}
            isAnswer={isAnswer} prayed={prayed} count={count} when={when}
            onPray={handlePray} onShare={handleShare}
        />;
    }

    // Dark register — original card pattern, kept as-is
    const HALO_X = 28;
    return (
        <article
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                padding: `${padY}px ${HALO_X}px`,
                marginLeft: -HALO_X,
                marginRight: -HALO_X,
                borderBottom: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: hovered
                    ? 'color-mix(in oklab, var(--torfa) 55%, transparent)'
                    : 'transparent',
                transition: 'background 280ms ease',
            }}
        >
            {isAnswer && (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 11px',
                        border: '1px solid rgba(111,165,216,0.35)',
                        color: 'var(--nordurljos)',
                        borderRadius: '999px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        marginBottom: '18px',
                    }}
                >
                    <IcoHeartCheck size={13} />
                    Bænasvar
                </div>
            )}

            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontSize: `${bodySize}px`,
                    lineHeight: 1.5,
                    letterSpacing: '-0.003em',
                    color: 'var(--ljos)',
                    fontStyle: 'italic',
                    maxWidth: '820px',
                    textWrap: 'pretty',
                }}
            >
                {prayer.content}
            </p>

            <div
                style={{
                    marginTop: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        color: 'var(--moskva)',
                        letterSpacing: '0.04em',
                    }}
                >
                    <span style={{ fontWeight: 600 }}>{prayer.name || 'Nafnlaust systkin'}</span>
                    <span style={{ color: 'var(--steinn)' }}>·</span>
                    <span>{when}</span>
                    {prayer.topic && (
                        <>
                            <span style={{ color: 'var(--steinn)' }}>·</span>
                            <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: '13px' }}>
                                {prayer.topic}
                            </span>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={handleShare} aria-label="Deila" style={{
                        background: 'transparent', border: 0, color: 'var(--moskva)',
                        padding: '8px', cursor: 'pointer', borderRadius: 'var(--radius-xs)', display: 'inline-flex',
                    }}>
                        <IcoShare size={15} />
                    </button>
                    <button type="button" onClick={handlePray} disabled={prayed} style={{
                        padding: '9px 16px',
                        background: prayed ? 'color-mix(in oklab, var(--kerti) 12%, transparent)' : 'transparent',
                        border: `1px solid ${prayed ? 'var(--kerti)' : 'var(--border)'}`,
                        color: prayed ? 'var(--kerti)' : 'var(--moskva)',
                        fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        borderRadius: 'var(--radius-xs)', cursor: prayed ? 'default' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        transition: 'all 220ms ease',
                    }}>
                        <IcoHands size={14} />
                        {prayed ? 'Bað með þér' : 'Bið með þér'}
                        <span style={{
                            marginLeft: '4px', paddingLeft: '10px',
                            borderLeft: '1px solid currentColor', opacity: 0.8,
                            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                            fontSize: '13px', textTransform: 'none', letterSpacing: 0, fontWeight: 400,
                        }}>{count}</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Light register — flowing stanza on cream. No card chrome.
   ───────────────────────────────────────────────────────────────── */

interface FlowProps {
    prayer: Prayer;
    bodySize: number;
    padY: number;
    isAnswer: boolean;
    prayed: boolean;
    count: number;
    when: string;
    onPray: (e: React.MouseEvent) => void;
    onShare: (e: React.MouseEvent) => void;
}

function FlowVariant({ prayer, bodySize, padY, isAnswer, prayed, count, when, onPray, onShare }: FlowProps) {
    return (
        <article
            style={{
                position: 'relative',
                padding: `${padY}px 0`,
                borderBottom: '1px solid rgba(200,138,62,0.25)',  // --gull at low opacity
            }}
        >
            {isAnswer && (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 11px',
                        border: '1px solid rgba(111,165,216,0.45)',
                        color: 'var(--nordurljos)',
                        borderRadius: '999px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        marginBottom: '18px',
                    }}
                >
                    <IcoHeartCheck size={13} />
                    Bænasvar
                </div>
            )}

            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontSize: `${bodySize}px`,
                    lineHeight: 1.55,
                    letterSpacing: '-0.003em',
                    color: 'var(--skra-djup)',
                    fontStyle: 'italic',
                    maxWidth: '38rem',
                    textWrap: 'pretty',
                }}
            >
                {prayer.content}
            </p>

            <div
                style={{
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11.5px',
                        color: 'var(--skra-mjuk)',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                    }}
                >
                    <span>{prayer.name || 'Nafnlaust systkin'}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{when}</span>
                    {prayer.topic && (
                        <>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span
                                style={{
                                    fontStyle: 'italic',
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '13.5px',
                                    letterSpacing: 0,
                                    textTransform: 'none',
                                    fontWeight: 400,
                                }}
                            >
                                {prayer.topic}
                            </span>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Share — small icon, ink-on-cream, no chrome */}
                    <button
                        type="button"
                        onClick={onShare}
                        aria-label="Deila"
                        style={{
                            background: 'transparent',
                            border: 0,
                            color: 'var(--skra-mjuk)',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            opacity: 0.7,
                        }}
                    >
                        <IcoShare size={15} />
                    </button>

                    {/* Bið með þér — inline gold link, with count. Quiet but present. */}
                    <button
                        type="button"
                        onClick={onPray}
                        disabled={prayed}
                        style={{
                            background: 'transparent',
                            border: 0,
                            padding: 0,
                            color: prayed ? 'var(--gull)' : 'var(--gull)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            cursor: prayed ? 'default' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            opacity: prayed ? 1 : 0.85,
                            transition: 'opacity 200ms ease',
                        }}
                        onMouseOver={(e) => { if (!prayed) e.currentTarget.style.opacity = '1'; }}
                        onMouseOut={(e) => { if (!prayed) e.currentTarget.style.opacity = '0.85'; }}
                    >
                        <IcoHands size={14} />
                        {prayed ? 'Bað með þér' : 'Bið með þér'}
                        <span
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '13.5px',
                                letterSpacing: 0,
                                textTransform: 'none',
                                fontWeight: 400,
                                opacity: 0.85,
                            }}
                        >
                            ({count})
                        </span>
                    </button>
                </div>
            </div>
        </article>
    );
}

function relativeIs(timestamp: number): string {
    const diffMs = Date.now() - timestamp;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 2) return 'rétt í þessu';
    if (mins < 60) return `fyrir ${mins} mín`;
    if (hours < 24) return `fyrir ${hours} klst`;
    if (days === 1) return 'í gær';
    if (days < 7) return `fyrir ${days} dögum`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return 'fyrir 1 viku';
    if (weeks < 4) return `fyrir ${weeks} vikum`;
    return new Date(timestamp).toLocaleDateString('is-IS', { day: 'numeric', month: 'long' });
}
