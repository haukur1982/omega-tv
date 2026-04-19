'use client';

import { useState, useEffect, useCallback } from 'react';
import { emitPlayerEvent, onPlayerEvent } from './playerBus';

interface Chapter {
    t: number;       // seconds
    title: string;
}

/**
 * ChapterList — interactive, timestamped chapter ladder.
 *
 * Each row is clickable: click → the SermonPlayer seeks to that
 * timestamp (via Player.js if already playing, or via `?t=` URL param
 * if the video hasn't started — which then also kicks off playback).
 *
 * Actively plays back the viewer's position in the sermon: the chapter
 * currently containing the playhead gets an amber background and a
 * small flame glyph, so a viewer can always tell where they are. This
 * is disproportionately useful for the 50+ audience who don't scrub —
 * they want to pick "Bæn fyrir Íslandi" and jump there, then see that
 * they're actually in that chapter now.
 */
export default function ChapterList({ chapters }: { chapters: Chapter[] }) {
    const [expanded, setExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState<number>(0);

    // Subscribe to player time updates so we can highlight the active chapter.
    useEffect(() => {
        return onPlayerEvent((e) => {
            if (e.type === 'timeupdate') setCurrentTime(e.t);
        });
    }, []);

    const seekTo = useCallback((t: number) => {
        emitPlayerEvent({ type: 'seek', t });
        // Scroll the player into view so the viewer sees the jump happen,
        // especially important when they clicked a chapter below the fold.
        if (typeof document !== 'undefined') {
            const el = document.getElementById('sermon-player');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    if (!chapters || chapters.length === 0) return null;

    // Compute which chapter contains the current playhead.
    // The active chapter is the last one whose `t` is <= currentTime.
    const activeIndex = findActiveChapter(chapters, currentTime);

    // Show first 4 collapsed, all when expanded.
    const visible = expanded ? chapters : chapters.slice(0, 4);
    const showToggle = chapters.length > 4;

    return (
        <section
            aria-label="Kaflar"
            style={{
                margin: 'clamp(1.5rem, 2.5vw, 2.5rem) 0',
                paddingTop: 'clamp(1.25rem, 2vw, 1.75rem)',
                borderTop: '1px solid var(--border)',
            }}
        >
            <p
                className="type-merki"
                style={{
                    color: 'var(--moskva)',
                    margin: 0,
                    marginBottom: '14px',
                    letterSpacing: '0.2em',
                }}
            >
                Kaflar · {chapters.length}
            </p>

            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {visible.map((ch, i) => {
                    const absoluteIdx = expanded ? i : i; // visible index IS absolute for the collapsed 0..3 range
                    const isActive = absoluteIdx === activeIndex;
                    return (
                        <li key={`${ch.t}-${i}`}>
                            <button
                                type="button"
                                onClick={() => seekTo(ch.t)}
                                aria-label={`Hoppa í ${ch.title} (${formatTime(ch.t)})`}
                                aria-current={isActive ? 'true' : undefined}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '22px 68px 1fr',
                                    alignItems: 'center',
                                    gap: '12px',
                                    width: '100%',
                                    padding: isActive ? '14px 12px' : '12px 12px',
                                    borderRadius: '2px',
                                    background: isActive ? 'rgba(233, 168, 96, 0.09)' : 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    textAlign: 'left',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    transition: 'background 200ms ease, padding 200ms ease',
                                    fontFamily: 'inherit',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(246, 242, 234, 0.035)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                {/* Active indicator — flame glyph when currently playing this chapter */}
                                <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px' }}>
                                    {isActive ? (
                                        <svg
                                            width="14"
                                            height="16"
                                            viewBox="0 0 14 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="candle-breathe"
                                        >
                                            <path
                                                d="M7 0.5c1.5 2.5 4.5 5 4.5 8.5a4.5 4.5 0 1 1-9 0C2.5 5.5 5.5 3 7 0.5z"
                                                fill="var(--kerti)"
                                            />
                                            <ellipse cx="7" cy="10" rx="1.4" ry="2" fill="#FFE4B5" opacity="0.8" />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 10 10"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <polygon points="3,2 8,5 3,8" fill="var(--steinn)" />
                                        </svg>
                                    )}
                                </span>
                                <span
                                    className="type-kodi"
                                    style={{
                                        color: isActive ? 'var(--kerti)' : 'var(--moskva)',
                                        fontSize: '0.82rem',
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {formatTime(ch.t)}
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        color: isActive ? 'var(--ljos)' : 'var(--ljos)',
                                        fontWeight: isActive ? 700 : 400,
                                        fontSize: '1rem',
                                        lineHeight: 1.45,
                                    }}
                                >
                                    {ch.title}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            {showToggle && (
                <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    className="type-merki muted-link"
                    style={{
                        marginTop: '16px',
                        background: 'none',
                        border: 'none',
                        padding: '6px 0',
                        cursor: 'pointer',
                        letterSpacing: '0.18em',
                        fontSize: '0.7rem',
                    }}
                >
                    {expanded ? 'Fela' : `Sýna alla ${chapters.length}`}
                </button>
            )}
        </section>
    );
}

function findActiveChapter(chapters: Chapter[], currentTime: number): number {
    if (currentTime <= 0) return -1;
    // Chapters are expected in time order but don't rely on it.
    let active = -1;
    let activeT = -1;
    for (let i = 0; i < chapters.length; i++) {
        const t = chapters[i].t;
        if (t <= currentTime && t > activeT) {
            active = i;
            activeT = t;
        }
    }
    return active;
}

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}
