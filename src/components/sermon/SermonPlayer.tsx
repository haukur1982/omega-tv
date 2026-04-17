'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { BunnyCaption } from '@/lib/bunny';
import { displayPassageIs } from '@/lib/passages';

/**
 * SermonPlayer — Bunny iframe wrapper with chapter-aware URL seek,
 * caption language switcher, and passage badge overlay.
 *
 * Phase 2 MVP behaviour:
 *   - `initialSeek` (seconds) starts the video at a timestamp. Changing
 *     caption language or chapter reloads the iframe with new `t` / `captions`
 *     params. We accept the short reload cost for a dead-simple implementation;
 *     a proper postMessage-based seek can land in a later phase.
 *   - Passage badge in the top-left of the player links to the "#ritningin"
 *     anchor in the right sidebar — the passage is already rendered on page.
 *   - Language chip sits top-right; menu opens on click.
 *
 * See plan §4.2.
 */

interface SermonPlayerProps {
    videoId: string;
    libraryId: string;
    title?: string;
    bibleRef?: string | null;
    captions?: BunnyCaption[] | null;
    /** Preferred language for captions — matches Bunny srclang codes. */
    defaultCaptionLang?: string | null;
    initialSeek?: number;
    /** Optional poster shown behind the pre-play overlay. */
    posterUrl?: string;
    /**
     * Set to true when the videoId won't resolve in Bunny (dev mock). The
     * player then skips the iframe and shows a "demo preview" card on click.
     */
    isMock?: boolean;
}

export default function SermonPlayer({
    videoId,
    libraryId,
    title,
    bibleRef,
    captions,
    defaultCaptionLang,
    initialSeek = 0,
    posterUrl,
    isMock = false,
}: SermonPlayerProps) {
    const [capLang, setCapLang] = useState<string | null>(defaultCaptionLang ?? null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const embedUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set('autoplay', 'true');
        params.set('preload', 'true');
        params.set('chapters', 'true');
        if (capLang) params.set('captions', capLang);
        if (initialSeek > 0) params.set('t', String(Math.floor(initialSeek)));
        return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?${params.toString()}`;
    }, [libraryId, videoId, capLang, initialSeek]);

    const passageDisplay = displayPassageIs(bibleRef);

    return (
        <div
            id="sermon-player"
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                background: 'var(--nott)',
                overflow: 'hidden',
            }}
        >
            {/* Poster — always rendered behind the play overlay. */}
            {posterUrl && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${posterUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 1,
                    }}
                />
            )}

            {/* The actual Bunny iframe — only mounted after first interaction
                so we don't auto-play on page load. Skipped for dev-mock videos. */}
            {isPlaying && !isMock && (
                <iframe
                    src={embedUrl}
                    title={title ?? 'Omega myndband'}
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                        zIndex: 5,
                    }}
                />
            )}

            {/* Dev-mock "demo preview" overlay — appears instead of iframe. */}
            {isPlaying && isMock && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '14px',
                        background: 'rgba(20, 18, 15, 0.82)',
                        backdropFilter: 'blur(14px)',
                        padding: '24px',
                        textAlign: 'center',
                    }}
                >
                    <p className="type-merki" style={{ color: 'var(--kerti)', margin: 0, letterSpacing: '0.22em' }}>
                        Forskoðun
                    </p>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--ljos)',
                            fontSize: '1.1rem',
                            lineHeight: 1.5,
                            maxWidth: '42ch',
                            fontStyle: 'italic',
                        }}
                    >
                        Þetta er hönnunarforskoðun. Alvöru myndband verður spilað hér þegar þátturinn er tengdur við Bunny.
                    </p>
                </div>
            )}

            {/* Pre-play overlay — one-frame poster with a quiet amber play glyph. */}
            {!isPlaying && (
                <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    aria-label={`Spila ${title ?? ''}`}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                    }}
                >
                    {/* Semi-dark scrim so the play glyph always has contrast */}
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(20,18,15,0.55) 0%, rgba(20,18,15,0.2) 60%, transparent 100%)',
                        }}
                    />
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'relative',
                            width: '84px',
                            height: '84px',
                            borderRadius: '50%',
                            background: 'rgba(233, 168, 96, 0.96)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 16px 48px rgba(10,8,5,0.55)',
                        }}
                    >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="var(--nott)" style={{ marginLeft: '4px' }} aria-hidden="true">
                            <polygon points="6,3 20,12 6,21" />
                        </svg>
                    </span>
                </button>
            )}

            {/* Top-left — passage badge (only when the episode is anchored to a passage) */}
            {bibleRef && passageDisplay && (
                <Link
                    href="#ritningin"
                    className="type-merki"
                    style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        zIndex: 10,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'rgba(20,18,15,0.72)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(246, 242, 234, 0.14)',
                        borderRadius: '2px',
                        color: 'var(--ljos)',
                        fontSize: '0.66rem',
                        letterSpacing: '0.18em',
                        textDecoration: 'none',
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    {passageDisplay}
                </Link>
            )}

            {/* Top-right — caption language switcher (only when tracks exist) */}
            {captions && captions.length > 0 && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(v => !v)}
                        aria-haspopup="true"
                        aria-expanded={menuOpen}
                        className="type-merki"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            background: 'rgba(20,18,15,0.72)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(246, 242, 234, 0.14)',
                            borderRadius: '2px',
                            color: 'var(--ljos)',
                            fontSize: '0.66rem',
                            letterSpacing: '0.18em',
                            cursor: 'pointer',
                        }}
                    >
                        CC · {(capLang ?? 'IS').toUpperCase()}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <polyline points="6,9 12,15 18,9" />
                        </svg>
                    </button>
                    {menuOpen && (
                        <ul
                            role="menu"
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                minWidth: '160px',
                                listStyle: 'none',
                                padding: '6px',
                                margin: 0,
                                background: 'var(--torfa)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                boxShadow: 'var(--shadow-lift)',
                            }}
                        >
                            <li>
                                <button
                                    role="menuitem"
                                    type="button"
                                    onClick={() => { setCapLang(null); setMenuOpen(false); setIsPlaying(true); }}
                                    className="type-merki"
                                    style={captionMenuItemStyle(capLang === null)}
                                >
                                    Engar textar
                                </button>
                            </li>
                            {captions.map(cap => (
                                <li key={cap.srclang}>
                                    <button
                                        role="menuitem"
                                        type="button"
                                        onClick={() => { setCapLang(cap.srclang); setMenuOpen(false); setIsPlaying(true); }}
                                        className="type-merki"
                                        style={captionMenuItemStyle(capLang === cap.srclang)}
                                    >
                                        {cap.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

function captionMenuItemStyle(active: boolean): React.CSSProperties {
    return {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '9px 12px',
        background: active ? 'var(--reykur)' : 'transparent',
        color: active ? 'var(--ljos)' : 'var(--moskva)',
        border: 'none',
        borderRadius: '2px',
        fontSize: '0.66rem',
        letterSpacing: '0.18em',
        cursor: 'pointer',
    };
}
