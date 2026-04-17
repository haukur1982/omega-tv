'use client';

import { useState, useEffect } from 'react';

interface Program {
    title: string;
    startTime: string;
    endTime: string;
    duration: number;
}

interface ScheduleData {
    current: Program | null;
    next: Program[];
    all: Program[];
}

export default function LiveSchedule({ onUpdate }: { onUpdate?: (current: Program | null) => void }) {
    const [data, setData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showPast, setShowPast] = useState(false);

    const fetchSchedule = async () => {
        try {
            const res = await fetch('/api/schedule');
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setError(false);
                if (onUpdate && json.current) {
                    onUpdate(json.current);
                }
            } else {
                setError(true);
            }
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
        const interval = setInterval(fetchSchedule, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{
                padding: '3rem 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
            }}>
                Sæki dagskrá...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{
                padding: '3rem 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
            }}>
                Ekki tókst að sækja dagskrá.
            </div>
        );
    }

    const programs = data.all || [];
    if (programs.length === 0) return null;

    const now = new Date();

    // Categorize programs
    const currentProgram = data.current;
    const pastPrograms: Program[] = [];
    const upcomingPrograms: Program[] = [];

    programs.forEach(p => {
        const endDate = new Date(p.endTime);
        const isCurrent = currentProgram &&
            p.startTime === currentProgram.startTime &&
            p.title === currentProgram.title;

        if (isCurrent) return; // Skip — rendered separately
        if (now > endDate) {
            pastPrograms.push(p);
        } else {
            upcomingPrograms.push(p);
        }
    });

    const nextUp = upcomingPrograms[0];
    const laterPrograms = upcomingPrograms.slice(1);

    // Progress bar for current show
    let progress = 0;
    if (currentProgram) {
        const start = new Date(currentProgram.startTime).getTime();
        const end = new Date(currentProgram.endTime).getTime();
        const total = end - start;
        const elapsed = now.getTime() - start;
        progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }

    const todayDate = now.toLocaleDateString('is-IS', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    const capitalizedDate = todayDate.charAt(0).toUpperCase() + todayDate.slice(1);

    return (
        <div style={{ padding: '2rem 0 3rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1.5rem',
            }}>
                <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: 0,
                    color: 'var(--text-primary)',
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Dagskrá
                </h3>
                <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 500,
                }}>
                    {capitalizedDate}
                </span>
            </div>

            {/* ═══ NOW PLAYING — Prominent card ═══ */}
            {currentProgram && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(91,138,191,0.12) 0%, rgba(91,138,191,0.04) 100%)',
                    border: '1px solid rgba(91,138,191,0.2)',
                    borderRadius: '14px',
                    padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                    marginBottom: '1rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Progress bar at top */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'rgba(255,255,255,0.06)',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'var(--accent)',
                            borderRadius: '0 2px 2px 0',
                            transition: 'width 1s linear',
                        }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            {/* Live badge + label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '3px 10px',
                                    background: '#ef4444',
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}>
                                    <span className="animate-pulse" style={{
                                        width: '5px',
                                        height: '5px',
                                        borderRadius: '50%',
                                        background: 'white',
                                    }} />
                                    Í beinni
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>
                                    {formatTime(currentProgram.startTime)} – {formatTime(currentProgram.endTime)}
                                </span>
                            </div>

                            {/* Title */}
                            <h4 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                margin: 0,
                                letterSpacing: '-0.01em',
                            }}>
                                {currentProgram.title}
                            </h4>
                        </div>

                        {/* Duration */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                            }}>
                                {Math.round(currentProgram.duration / 60)} mín
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ UP NEXT — Single highlighted row ═══ */}
            {nextUp && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: 'clamp(0.9rem, 2vw, 1.25rem) clamp(1rem, 2vw, 1.5rem)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    marginBottom: '0.75rem',
                }}>
                    <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: 'var(--accent)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}>
                        Næst
                    </span>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)', flexShrink: 0 }} />
                    <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        flexShrink: 0,
                        width: '48px',
                    }}>
                        {formatTime(nextUp.startTime)}
                    </span>
                    <span style={{
                        flex: 1,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {nextUp.title}
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                    }}>
                        {Math.round(nextUp.duration / 60)} mín
                    </span>
                </div>
            )}

            {/* ═══ LATER TODAY — Compact list ═══ */}
            {laterPrograms.length > 0 && (
                <div style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                }}>
                    {/* Section label */}
                    <div style={{
                        padding: '10px 16px',
                        background: 'var(--bg-elevated)',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        color: 'var(--text-muted)',
                        borderBottom: '1px solid var(--border)',
                    }}>
                        Seinna í dag
                    </div>
                    {laterPrograms.map((program, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'clamp(0.5rem, 1.5vw, 1rem)',
                                padding: '10px 16px',
                                background: 'var(--bg-surface)',
                                borderBottom: idx < laterPrograms.length - 1 ? '1px solid var(--border)' : 'none',
                            }}
                        >
                            <span style={{
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                flexShrink: 0,
                                width: '48px',
                            }}>
                                {formatTime(program.startTime)}
                            </span>
                            <span style={{
                                flex: 1,
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {program.title}
                            </span>
                            <span style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                flexShrink: 0,
                            }}>
                                {Math.round(program.duration / 60)} mín
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ PAST SHOWS — Collapsed by default ═══ */}
            {pastPrograms.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                    <button
                        onClick={() => setShowPast(!showPast)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '6px 0',
                            letterSpacing: '0.05em',
                        }}
                    >
                        <svg
                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{
                                transform: showPast ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        >
                            <polyline points="6,9 12,15 18,9" />
                        </svg>
                        {showPast ? 'Fela liðna dagskrá' : `Sýna liðna dagskrá (${pastPrograms.length})`}
                    </button>

                    {showPast && (
                        <div style={{
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            opacity: 0.5,
                            marginTop: '6px',
                        }}>
                            {pastPrograms.map((program, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '8px 16px',
                                        background: 'var(--bg-surface)',
                                        borderBottom: idx < pastPrograms.length - 1 ? '1px solid var(--border)' : 'none',
                                    }}
                                >
                                    <span style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'var(--text-muted)',
                                        flexShrink: 0,
                                        width: '44px',
                                        textDecoration: 'line-through',
                                        textDecorationColor: 'var(--text-muted)',
                                    }}>
                                        {formatTime(program.startTime)}
                                    </span>
                                    <span style={{
                                        flex: 1,
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        color: 'var(--text-muted)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {program.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer note */}
            <p style={{
                textAlign: 'center',
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
                marginTop: '1.25rem',
                letterSpacing: '0.05em',
                opacity: 0.6,
            }}>
                Dagskrá er birt með fyrirvara um breytingar.
            </p>
        </div>
    );
}

function formatTime(isoString: string) {
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
