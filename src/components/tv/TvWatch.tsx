'use client';

import { useState } from 'react';

/**
 * /tv arrival player. Watch-first: the page leads with one big "Horfa núna"
 * tap target. The Restream embed (same source as /live) only loads on tap, so
 * the first view is a calm welcome, not an autoplaying iframe — and someone
 * arriving cold from the TV is asked to do exactly one thing.
 */
export default function TvWatch({ embedUrl }: { embedUrl?: string }) {
    const [playing, setPlaying] = useState(false);

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--nott)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lift)',
            }}
        >
            {playing && embedUrl ? (
                <>
                    <iframe
                        src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                        title="Omega bein útsending"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    />
                    <BeintPill />
                </>
            ) : embedUrl ? (
                <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label="Horfa á beina útsendingu Omega"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        border: 0,
                        cursor: 'pointer',
                        background:
                            'radial-gradient(120% 90% at 50% 35%, rgba(233,168,96,0.10) 0%, transparent 60%), var(--nott)',
                        color: 'var(--ljos)',
                    }}
                >
                    <span
                        aria-hidden
                        style={{
                            width: 'clamp(72px, 11vw, 96px)',
                            height: 'clamp(72px, 11vw, 96px)',
                            borderRadius: '50%',
                            background: 'var(--kerti)',
                            color: 'var(--nott)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 40px rgba(233,168,96,0.35)',
                        }}
                    >
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </span>
                    <span
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'clamp(1rem, 2.4vw, 1.25rem)',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                        }}
                    >
                        Horfa núna
                    </span>
                    <span className="live-dot-row" style={pillIdle}>
                        <span
                            aria-hidden
                            className="live-dot"
                            style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block' }}
                        />
                        Beint núna
                    </span>
                </button>
            ) : (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--steinn)',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        padding: '0 1.5rem',
                        textAlign: 'center',
                    }}
                >
                    Útsendingin verður aðgengileg hér eftir augnablik.
                </div>
            )}
        </div>
    );
}

const pillIdle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-xs)',
    background: 'rgba(20,18,15,0.55)',
    border: '1px solid rgba(216,75,58,0.35)',
    color: 'var(--blod)',
    fontFamily: 'var(--font-sans)',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
};

function BeintPill() {
    return (
        <div
            style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(20,18,15,0.72)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(216,75,58,0.35)',
                color: 'var(--blod)',
                fontFamily: 'var(--font-sans)',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                pointerEvents: 'none',
            }}
        >
            <span
                aria-hidden
                className="live-dot"
                style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block' }}
            />
            Beint
        </div>
    );
}
