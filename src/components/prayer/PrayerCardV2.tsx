'use client';

import { useState } from 'react';
import { IcoHands, IcoShare, IcoHeartCheck } from './PrayerIcons';
import type { Prayer } from '@/lib/prayer-db';

/**
 * PrayerCardV2 — prayer row for the Bænatorg feed.
 *
 * Two visual variants:
 *
 *   - "dark" (default) — transparent card on the page's warm-black,
 *     border-bottom separators, halo-hover with --torfa tint
 *     extending beyond the text column. The original pattern.
 *
 *   - "vellum" — each card is a cream rectangle on the warm-black
 *     page, like handwritten letters on an altar table. Reinforces
 *     the "letter" part of Omega's brand direction and carries the
 *     article vellum palette over to intimate reading content.
 *     Hawk's experiment proposed 2026-04-24.
 *
 * Body is the star in both variants — Newsreader italic. The
 * "Bið með þér" button is subdued (not amber-filled) until pressed;
 * amber stays reserved for the invitation row above the feed and
 * the submit button inside the modal.
 */

type Variant = 'dark' | 'vellum';

interface Props {
    prayer: Prayer;
    density?: 'comfortable' | 'compact';
    variant?: Variant;
    onPray?: (id: string) => void;
    onShare?: (prayer: Prayer) => void;
}

export default function PrayerCardV2({ prayer, density = 'comfortable', variant = 'dark', onPray, onShare }: Props) {
    const [prayed, setPrayed] = useState(false);
    const [count, setCount] = useState(prayer.prayCount);
    const [hovered, setHovered] = useState(false);

    const isAnswer = prayer.isAnswered;
    const padY = density === 'compact' ? 24 : 32;
    const bodySize = density === 'compact' ? 20 : 22;
    const HALO_X = 28;
    const isVellum = variant === 'vellum';

    // Color tokens resolved per variant. Dark = original palette on page bg.
    // Vellum = cream card with ink-on-cream text.
    const tokens = isVellum
        ? {
            bodyColor: 'var(--skra-djup)',
            metaColor: 'var(--skra-mjuk)',
            dotColor: 'rgba(0,0,0,0.3)',
            btnIdleColor: 'var(--skra-mjuk)',
            btnIdleBorder: 'rgba(0,0,0,0.18)',
            btnHoverColor: 'var(--skra-djup)',
            btnPressedBg: 'rgba(200,138,62,0.14)',       // --gull wash
            btnPressedBorder: 'var(--gull)',
            btnPressedColor: 'var(--gull)',
            answerBadgeBorder: 'rgba(111,165,216,0.45)',
            answerBadgeColor: 'var(--nordurljos)',
            shareIconColor: 'var(--skra-mjuk)',
        }
        : {
            bodyColor: 'var(--ljos)',
            metaColor: 'var(--moskva)',
            dotColor: 'var(--steinn)',
            btnIdleColor: 'var(--moskva)',
            btnIdleBorder: 'var(--border)',
            btnHoverColor: 'var(--ljos)',
            btnPressedBg: 'color-mix(in oklab, var(--kerti) 12%, transparent)',
            btnPressedBorder: 'var(--kerti)',
            btnPressedColor: 'var(--kerti)',
            answerBadgeBorder: 'rgba(111,165,216,0.35)',
            answerBadgeColor: 'var(--nordurljos)',
            shareIconColor: 'var(--moskva)',
        };

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

    // Visual shell differs between variants.
    // Dark: full-width row with border-bottom, halo hover extends beyond text.
    // Vellum: defined cream rectangle, margin-bottom gap, subtle lift on hover.
    const shellStyle: React.CSSProperties = isVellum
        ? {
            position: 'relative',
            padding: `${padY}px clamp(24px, 3.5vw, 40px)`,
            marginBottom: '16px',
            background: 'var(--skra)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: hovered
                ? '0 12px 36px -20px rgba(10,8,5,0.55)'
                : '0 4px 14px -10px rgba(10,8,5,0.4)',
            transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
            transition: 'box-shadow 280ms ease, transform 280ms ease, border-color 280ms ease',
        }
        : {
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
        };

    return (
        <article
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={shellStyle}
        >
            {isAnswer && (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 11px',
                        border: `1px solid ${tokens.answerBadgeBorder}`,
                        color: tokens.answerBadgeColor,
                        borderRadius: '999px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
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
                    color: tokens.bodyColor,
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
                        color: tokens.metaColor,
                        letterSpacing: '0.04em',
                    }}
                >
                    <span style={{ fontWeight: 600 }}>{prayer.name || 'Nafnlaust systkin'}</span>
                    <span style={{ color: tokens.dotColor }}>·</span>
                    <span>{when}</span>
                    {prayer.topic && (
                        <>
                            <span style={{ color: tokens.dotColor }}>·</span>
                            <span
                                style={{
                                    fontStyle: 'italic',
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '13px',
                                }}
                            >
                                {prayer.topic}
                            </span>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={handleShare}
                        aria-label="Deila"
                        style={{
                            background: 'transparent',
                            border: 0,
                            color: tokens.shareIconColor,
                            padding: '8px',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-xs)',
                            display: 'inline-flex',
                        }}
                    >
                        <IcoShare size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={handlePray}
                        disabled={prayed}
                        style={{
                            padding: '9px 16px',
                            background: prayed ? tokens.btnPressedBg : 'transparent',
                            border: `1px solid ${prayed ? tokens.btnPressedBorder : tokens.btnIdleBorder}`,
                            color: prayed ? tokens.btnPressedColor : tokens.btnIdleColor,
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            borderRadius: 'var(--radius-xs)',
                            cursor: prayed ? 'default' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 220ms ease',
                        }}
                        onMouseOver={(e) => {
                            if (!prayed) {
                                e.currentTarget.style.borderColor = tokens.btnPressedBorder;
                                e.currentTarget.style.color = tokens.btnHoverColor;
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!prayed) {
                                e.currentTarget.style.borderColor = tokens.btnIdleBorder;
                                e.currentTarget.style.color = tokens.btnIdleColor;
                            }
                        }}
                    >
                        <IcoHands size={14} />
                        {prayed ? 'Bað með þér' : 'Bið með þér'}
                        <span
                            style={{
                                marginLeft: '4px',
                                paddingLeft: '10px',
                                borderLeft: '1px solid currentColor',
                                opacity: 0.8,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '13px',
                                textTransform: 'none',
                                letterSpacing: 0,
                                fontWeight: 400,
                            }}
                        >
                            {count}
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
    if (weeks < 4) return `fyrir ${weeks} vikum`;
    return new Date(timestamp).toLocaleDateString('is-IS', { day: 'numeric', month: 'long' });
}
