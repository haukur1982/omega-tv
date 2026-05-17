'use client';

import { useMemo } from 'react';

interface ThumbnailFrameProps {
    /** Series cover image URL. If absent → typographic fallback. */
    src?: string | null;
    /** Series identity, used for fallback letter and alt text. */
    series?: string;
    /** Optional manual fallback letter override (for series whose names
        start with awkward glyphs at scale, or before naming is final). */
    fallbackLetter?: string;
    /** Card aspect ratio. */
    aspect?: '4/5' | '16/9' | '1/1' | '2/3';
    /** Optional badge in top-left. Use sparingly. */
    badge?: { label: string; tone: 'live' | 'new' | 'next' } | null;
    /** Whether to reveal a play icon on hover. Default true. */
    playOnHover?: boolean;
    /** Hover treatment. 'lift' for poster cards, 'none' for static. */
    hover?: 'lift' | 'none';
    /** Optional className passthrough for layout. */
    className?: string;
}

export default function ThumbnailFrame({
    src,
    series,
    fallbackLetter,
    aspect = '4/5',
    badge = null,
    playOnHover = true,
    hover = 'lift',
}: ThumbnailFrameProps) {
    const letter = useMemo(() => {
        if (fallbackLetter) return fallbackLetter;
        if (series && series.trim()) return series.trim().charAt(0).toUpperCase();
        return 'Ω';
    }, [fallbackLetter, series]);

    const badgeColor = badge?.tone === 'live'
        ? 'var(--blod)'
        : badge?.tone === 'next'
        ? 'var(--nordurljos)'
        : 'var(--kerti)';

    return (
        <div
            className={`thumb-frame ${hover === 'lift' ? 'thumb-frame--lift' : ''}`}
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: aspect,
                overflow: 'hidden',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--torfa)',
                boxShadow: '0 14px 32px -22px rgba(20,18,15,0.5)',
                transition: 'transform 320ms cubic-bezier(0.2,0.7,0.3,1), box-shadow 320ms ease',
            }}
        >
            {src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    className="thumb-img"
                    src={src}
                    alt={series ? `${series} — cover` : ''}
                    loading="lazy"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'contrast(1.08) saturate(0.82) brightness(0.96)',
                        transition: 'transform 600ms cubic-bezier(0.2,0.7,0.3,1)',
                    }}
                />
            ) : (
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--torfa)',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'var(--font-display, var(--font-serif))',
                            fontWeight: 300,
                            fontSize: 'clamp(72px, 12vw, 144px)',
                            color: 'var(--steinn)',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {letter}
                    </span>
                </div>
            )}

            {/* Vignette — soft falloff to edges, draws eye to subject */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(ellipse at center, transparent 55%, rgba(20,18,15,0.4) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Warm evening glow — upper right */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(ellipse at 80% 15%, rgba(233,168,96,0.08) 0%, transparent 50%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Optional badge — top-left only, never paired with another corner element */}
            {badge && (
                <span
                    style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        padding: '5px 10px',
                        background: 'rgba(20,18,15,0.78)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        color: badgeColor,
                        fontFamily: 'var(--font-sans)',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        borderRadius: '3px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    {badge.tone === 'live' && (
                        <span
                            aria-hidden
                            className="live-dot"
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--blod)',
                                display: 'inline-block',
                            }}
                        />
                    )}
                    {badge.label}
                </span>
            )}

            {/* Play button — fades in on hover */}
            {playOnHover && src && (
                <div
                    className="thumb-play"
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 280ms ease',
                        pointerEvents: 'none',
                    }}
                >
                    <span
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: 'rgba(246,242,234,0.94)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 24px rgba(20,18,15,0.5)',
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="var(--nott)"
                            aria-hidden
                            style={{ marginLeft: '3px' }}
                        >
                            <polygon points="6,3 20,12 6,21" />
                        </svg>
                    </span>
                </div>
            )}
        </div>
    );
}
