'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { BunnyCaption } from '@/lib/bunny';
import { displayPassageIs } from '@/lib/passages';
import { onPlayerEvent, emitPlayerEvent } from './playerBus';

/**
 * SermonPlayer — Bunny iframe wrapper with chapter-aware seeking, caption
 * language switcher, and passage badge overlay.
 *
 * Phase 4 upgrade (2026-04-18):
 *   - Loads Bunny's Player.js library on first play
 *   - Listens for `seek` events on the player bus (dispatched by
 *     ChapterList and any future transcript/scrub UI)
 *   - Broadcasts `timeupdate` via the bus so other components can
 *     highlight the active chapter, sync transcripts, etc.
 *   - When a seek arrives BEFORE the user has started the video, we
 *     bake the timestamp into the Bunny iframe's `?t=` param and start
 *     playback — no awkward double-click required.
 *
 * See plan §4.2 + `docs/content-pipeline.md`.
 */

// Bunny's Player.js library exposes `playerjs.Player` once loaded.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlayerJsInstance = {
    on: (event: string, cb: (data: unknown) => void) => void;
    off: (event: string, cb?: (data: unknown) => void) => void;
    setCurrentTime: (seconds: number) => void;
    getCurrentTime: (cb: (seconds: number) => void) => void;
    play: () => void;
    pause: () => void;
};

declare global {
    interface Window {
        playerjs?: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Player: new (iframe: HTMLIFrameElement) => PlayerJsInstance;
        };
    }
}

const PLAYERJS_SRC = 'https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js';

/**
 * Load the Player.js script once per page. Multiple components calling
 * this share the same <script> and resolved promise.
 */
let playerJsPromise: Promise<void> | null = null;
function loadPlayerJs(): Promise<void> {
    if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
    if (window.playerjs) return Promise.resolve();
    if (playerJsPromise) return playerJsPromise;

    playerJsPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLAYERJS_SRC}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('playerjs failed to load')), { once: true });
            return;
        }
        const s = document.createElement('script');
        s.src = PLAYERJS_SRC;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('playerjs failed to load'));
        document.head.appendChild(s);
    });
    return playerJsPromise;
}

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
    /**
     * Pending-or-committed seek timestamp. Baked into the embed URL via
     * `?t=` so it works whether the user clicked play or came in via a
     * chapter-click (start video + start at timestamp in one move).
     */
    const [seekSeconds, setSeekSeconds] = useState<number>(initialSeek);

    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const playerRef = useRef<PlayerJsInstance | null>(null);

    const embedUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set('autoplay', 'true');
        params.set('preload', 'true');
        params.set('chapters', 'true');
        if (capLang) params.set('captions', capLang);
        if (seekSeconds > 0) params.set('t', String(Math.floor(seekSeconds)));
        return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?${params.toString()}`;
    }, [libraryId, videoId, capLang, seekSeconds]);

    const passageDisplay = displayPassageIs(bibleRef);

    /**
     * Handle incoming seek requests from the bus (ChapterList, transcript, etc.).
     * Three paths:
     *   1. Player is live with a Player.js handle → setCurrentTime, done.
     *   2. Video hasn't started → set seekSeconds + isPlaying so the iframe
     *      mounts with `?t=N` and starts playing at the requested position.
     *   3. Video started but Player.js hasn't loaded yet → store seekSeconds;
     *      when the iframe src rebuilds, Bunny will jump to that time.
     */
    const handleSeek = useCallback((t: number) => {
        if (!isMock && playerRef.current && isPlaying) {
            try {
                playerRef.current.setCurrentTime(t);
                return;
            } catch (err) {
                console.warn('Player.js seek failed, falling back to URL reload:', err);
            }
        }
        // Not live yet — bake the timestamp into the embed URL and start.
        setSeekSeconds(t);
        setIsPlaying(true);
    }, [isMock, isPlaying]);

    // Subscribe to the player bus for `seek` events
    useEffect(() => {
        return onPlayerEvent((e) => {
            if (e.type === 'seek') handleSeek(e.t);
        });
    }, [handleSeek]);

    /**
     * When the iframe mounts, attach Player.js so we can:
     *   - Seek programmatically (setCurrentTime)
     *   - Broadcast timeupdate so chapter highlighting stays in sync
     */
    useEffect(() => {
        if (!isPlaying || isMock) return;

        let cancelled = false;
        let timeupdateHandler: ((d: unknown) => void) | null = null;

        (async () => {
            try {
                await loadPlayerJs();
                if (cancelled) return;
                const iframe = iframeRef.current;
                if (!iframe || !window.playerjs) return;

                const player = new window.playerjs.Player(iframe);
                playerRef.current = player;

                player.on('ready', () => {
                    if (cancelled) return;
                    emitPlayerEvent({ type: 'ready' });
                });

                timeupdateHandler = (data: unknown) => {
                    if (cancelled) return;
                    // Player.js payload: { seconds, duration }
                    const d = data as { seconds?: number; duration?: number };
                    if (typeof d?.seconds === 'number') {
                        emitPlayerEvent({ type: 'timeupdate', t: d.seconds, duration: d.duration });
                    }
                };
                player.on('timeupdate', timeupdateHandler);
            } catch (err) {
                console.warn('Failed to attach Player.js — seek will still work via URL reload:', err);
            }
        })();

        return () => {
            cancelled = true;
            if (playerRef.current && timeupdateHandler) {
                try { playerRef.current.off('timeupdate', timeupdateHandler); } catch { /* noop */ }
            }
            playerRef.current = null;
        };
    }, [isPlaying, isMock, embedUrl]);

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
                    ref={iframeRef}
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
                    {seekSeconds > 0 && (
                        <p className="type-meta" style={{ margin: 0, color: 'var(--steinn)' }}>
                            Byrjar við {formatSeekLabel(seekSeconds)}
                        </p>
                    )}
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

function formatSeekLabel(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
}
