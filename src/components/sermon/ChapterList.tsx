'use client';

import { useState } from 'react';

interface Chapter {
    t: number;       // seconds
    title: string;
}

/**
 * ChapterList — expandable list of chapter timestamps.
 *
 * Clicking a chapter scrolls the player into view. For phase 2 this is
 * a visual affordance + anchor scroll. Full seek-on-click is a small
 * follow-up (postMessage to the Bunny iframe) but not required for the
 * design to land. See plan §4.2.
 */
export default function ChapterList({ chapters }: { chapters: Chapter[] }) {
    const [expanded, setExpanded] = useState(false);
    if (!chapters || chapters.length === 0) return null;

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
                {visible.map((ch, i) => (
                    <li key={`${ch.t}-${i}`}>
                        <a
                            href={`#sermon-player`}
                            onClick={() => { /* phase 4: postMessage seek */ }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '68px 1fr',
                                alignItems: 'baseline',
                                gap: '18px',
                                padding: '12px 0',
                                borderBottom: '1px solid var(--border)',
                                textDecoration: 'none',
                                color: 'inherit',
                            }}
                        >
                            <span
                                className="type-kodi"
                                style={{
                                    color: 'var(--kerti)',
                                    fontSize: '0.82rem',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {formatTime(ch.t)}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    color: 'var(--ljos)',
                                    fontSize: '1rem',
                                    lineHeight: 1.45,
                                }}
                            >
                                {ch.title}
                            </span>
                        </a>
                    </li>
                ))}
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

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}
