'use client';

import { useState } from 'react';
import { IcoHands, IcoShare, IcoHeartCheck } from './PrayerIcons';
import type { Prayer } from '@/lib/prayer-db';

/**
 * PrayerCardV2 — prayer row for the new single-column feed.
 *
 * Per the redesign: body is the star — Newsreader italic, 22px,
 * generous line-height. The meta row is quiet. "Bið með þér" is a
 * subdued hairline button (NOT amber-filled) — amber is reserved for
 * the invitation row above the feed and the submit button inside
 * the modal. Once pressed, the button warms to --kerti border and
 * fill-tint to mark the gesture as made.
 *
 * Hover uses a soft --torfa tint that extends beyond the text
 * column via negative margin, so the card "breathes" rather than
 * hugging the text with a boxed border.
 */

interface Props {
    prayer: Prayer;
    density?: 'comfortable' | 'compact';
    onPray?: (id: string) => void;
    onShare?: (prayer: Prayer) => void;
}

export default function PrayerCardV2({ prayer, density = 'comfortable', onPray, onShare }: Props) {
    const [prayed, setPrayed] = useState(false);
    const [count, setCount] = useState(prayer.prayCount);
    const [hovered, setHovered] = useState(false);

    const isAnswer = prayer.isAnswered;
    const padY = density === 'compact' ? 24 : 32;
    const bodySize = density === 'compact' ? 20 : 22;
    const HALO_X = 28;

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
        // Fallback: native share API
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: 'Bænaefni — Omega',
                text: prayer.content,
                url: typeof window !== 'undefined' ? window.location.href : '',
            }).catch(() => { /* user cancelled */ });
        }
    };

    // Icelandic relative time — simple, not a full library
    const when = relativeIs(prayer.timestamp);

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
                        className="ghost-btn"
                        aria-label="Deila"
                        style={{
                            background: 'transparent',
                            border: 0,
                            color: 'var(--moskva)',
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
                            background: prayed
                                ? 'color-mix(in oklab, var(--kerti) 12%, transparent)'
                                : 'transparent',
                            border: `1px solid ${prayed ? 'var(--kerti)' : 'var(--border)'}`,
                            color: prayed ? 'var(--kerti)' : 'var(--moskva)',
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
                                e.currentTarget.style.borderColor = 'var(--kerti)';
                                e.currentTarget.style.color = 'var(--ljos)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!prayed) {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.color = 'var(--moskva)';
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
