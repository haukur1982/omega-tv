'use client';

import { useState } from 'react';
import { IcoHands, IcoShare, IcoHeartCheck } from './PrayerIcons';
import type { Prayer } from '@/lib/prayer-db';
import { formatIcelandicDayMonth, prayedCountLabel, relativeIs } from '@/lib/prayer-format';

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
 * Body is the star in both. Italic Newsreader, large, generous
 * line-height. The meta row is quiet.
 *
 * De-gamified (docs/plans/09-prayer-ministry.md): the pray-along count is
 * quiet prose — "43 hafa beðið" — not a number badge welded to a button. The
 * tap-to-pray action stays available but subordinate; Biðja-mode above the
 * feed is where a visitor is meant to actually hold these.
 *
 * Two marks can appear, and only these two: "barst símleiðis" when the prayer
 * came down the phone line (never a mark for the web — that is the default and
 * marking it would be noise), and a gold "borin fram í útsendingu" once it has
 * actually been prayed on air. The second is the whole point of the ministry
 * having one memory: the wall can show that the broadcast kept its promise.
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
    const [hovered, setHovered] = useState(false);

    const isAnswer = prayer.isAnswered;
    const isLight = register === 'light';
    const padY = density === 'compact' ? 24 : 36;
    const bodySize = density === 'compact' ? 20 : 22;

    /**
     * The count itself is NOT held here. BaenatorgClient owns the list and
     * increments it optimistically, so a card shows the same number whether
     * the Amen was said here or in Biðja-mode. A private copy would have gone
     * stale the moment the same prayer was held in the other place.
     */
    const handlePray = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (prayed) return;
        setPrayed(true);
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
    const countLabel = prayedCountLabel(prayer.prayCount);

    if (isLight) {
        return <FlowVariant
            prayer={prayer} bodySize={bodySize} padY={padY}
            isAnswer={isAnswer} prayed={prayed} countLabel={countLabel} when={when}
            onPray={handlePray} onShare={handleShare}
        />;
    }

    // Dark register — original card pattern
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

            <AiredMark prayer={prayer} tone="dark" />

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
                        flexWrap: 'wrap',
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
                    {prayer.source === 'simi' && (
                        <>
                            <span style={{ color: 'var(--steinn)' }}>·</span>
                            <span style={{ color: 'var(--steinn)' }}>barst símleiðis</span>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {countLabel && (
                        <span
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '13.5px',
                                color: 'var(--steinn)',
                            }}
                        >
                            {countLabel}
                        </span>
                    )}
                    <button type="button" onClick={handleShare} aria-label="Deila" style={{
                        background: 'transparent', border: 0, color: 'var(--moskva)',
                        padding: '8px', cursor: 'pointer', borderRadius: 'var(--radius-xs)', display: 'inline-flex',
                    }}>
                        <IcoShare size={15} />
                    </button>
                    <button type="button" onClick={handlePray} disabled={prayed} style={{
                        padding: '9px 16px',
                        background: 'transparent',
                        border: 0,
                        color: prayed ? 'var(--kerti)' : 'var(--moskva)',
                        fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        cursor: prayed ? 'default' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        transition: 'color 220ms ease',
                    }}>
                        <IcoHands size={14} />
                        {prayed ? 'Bað með þér' : 'Bið með þér'}
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
    countLabel: string | null;
    when: string;
    onPray: (e: React.MouseEvent) => void;
    onShare: (e: React.MouseEvent) => void;
}

function FlowVariant({ prayer, bodySize, padY, isAnswer, prayed, countLabel, when, onPray, onShare }: FlowProps) {
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
                        border: '1px solid rgba(200,138,62,0.55)',
                        color: 'var(--gull)',
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

            <AiredMark prayer={prayer} tone="light" />

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
                    gap: '18px',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
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
                    {prayer.source === 'simi' && (
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
                                    opacity: 0.85,
                                }}
                            >
                                barst símleiðis
                            </span>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                    {/* Quiet count — company, not a score. Never a badge on a button. */}
                    {countLabel && (
                        <span
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '13.5px',
                                color: 'var(--skra-mjuk)',
                                opacity: 0.8,
                            }}
                        >
                            {countLabel}
                        </span>
                    )}

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

                    {/* Tap-to-pray — subordinate to Biðja-mode: ink, not gold, no count. */}
                    <button
                        type="button"
                        onClick={onPray}
                        disabled={prayed}
                        style={{
                            background: 'transparent',
                            border: 0,
                            padding: 0,
                            color: 'var(--skra-mjuk)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            cursor: prayed ? 'default' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '9px',
                            opacity: prayed ? 1 : 0.75,
                            transition: 'opacity 200ms ease',
                        }}
                        onMouseOver={(e) => { if (!prayed) e.currentTarget.style.opacity = '1'; }}
                        onMouseOut={(e) => { if (!prayed) e.currentTarget.style.opacity = '0.75'; }}
                    >
                        <IcoHands size={14} />
                        {prayed ? 'Bað með þér' : 'Bið með þér'}
                    </button>
                </div>
            </div>
        </article>
    );
}

/**
 * "Borin fram í útsendingu 3. september" — a tiny gold diamond and a date.
 * Only ever rendered from a real aired_at, so it can never claim something the
 * broadcast did not actually do.
 */
function AiredMark({ prayer, tone }: { prayer: Prayer; tone: 'dark' | 'light' }) {
    if (!prayer.airedAt) return null;
    const aired = new Date(prayer.airedAt).getTime();
    if (Number.isNaN(aired)) return null;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginBottom: '14px',
                fontFamily: 'var(--font-sans)',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: tone === 'light' ? 'var(--gull)' : 'var(--kerti)',
            }}
        >
            <span
                aria-hidden
                style={{
                    width: '6px',
                    height: '6px',
                    background: 'var(--gull)',
                    transform: 'rotate(45deg)',
                    display: 'inline-block',
                    flexShrink: 0,
                }}
            />
            Borin fram í útsendingu {formatIcelandicDayMonth(aired)}
        </div>
    );
}
