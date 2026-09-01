'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Prayer } from '@/lib/prayer-db';
import { IcoClose } from './PrayerIcons';

/**
 * Biðja-mode — the heart of the wall.
 *
 * The feed is a list you scan. This is the opposite: the room goes vellum, one
 * prayer fills the screen at the largest type on the site, and the only thing
 * to do is pray it and say Amen. Then the next one arrives like ink on the
 * page. No counts, no names of strangers ranked, nothing to compare.
 *
 * Order is least-prayed-first with recency mixed in, so the prayer nobody has
 * held yet is the one you get — but a cry from an hour ago still comes near the
 * front. Every prayer gets held; none sinks because it was unlucky.
 *
 * Session-local memory (sessionStorage) keeps one visitor from being handed the
 * same three prayers in a loop. It resets when the list is exhausted — the
 * ministry is bigger than one sitting.
 */

const SEEN_KEY = 'omega-bidja-sedar';

interface Props {
    prayers: Prayer[];
    onPray: (id: string) => void;
    onClose: () => void;
}

/** "Guðrún Jónsdóttir" → "Guðrún". Anonymous stays as it is. */
function firstName(name: string): string {
    const trimmed = (name || '').trim();
    if (!trimmed) return 'Nafnlaust systkin';
    if (/^nafnlaus/i.test(trimmed)) return 'Nafnlaust systkin';
    return trimmed.split(/\s+/)[0];
}

function readSeen(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.sessionStorage.getItem(SEEN_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
    } catch {
        return [];
    }
}

function writeSeen(ids: string[]) {
    if (typeof window === 'undefined') return;
    try {
        window.sessionStorage.setItem(SEEN_KEY, JSON.stringify(ids));
    } catch {
        /* private mode / storage disabled — the order just isn't remembered */
    }
}

/**
 * Least-prayed first, with recency lifting a fresh prayer forward. A prayer
 * borne in the last two days counts as two prayers "lighter", one in the last
 * week as one — enough to bring today's cry near the front without letting a
 * long-carried burden fall off the end.
 */
function heldOrder(prayers: Prayer[], now: number): Prayer[] {
    const DAY = 86_400_000;
    const weight = (p: Prayer) => {
        const age = now - p.timestamp;
        const lift = age < 2 * DAY ? 2 : age < 7 * DAY ? 1 : 0;
        return p.prayCount - lift;
    };
    return [...prayers].sort((a, b) => weight(a) - weight(b) || b.timestamp - a.timestamp);
}

export default function BidjaMode({ prayers, onPray, onClose }: Props) {
    /**
     * The queue is built ONCE, when the mode opens, and never rebuilt.
     *
     * This is deliberate and it is load-bearing. Saying Amen updates the
     * parent's list (optimistically), which would re-run a memo over
     * `prayers` — the prayer just held would drop out of the freshly filtered
     * queue, every later prayer would shift down one, and the visitor would
     * silently skip whoever moved into the index they had already passed.
     * "Every prayer gets held" only survives if the walk is fixed at the door.
     */
    const [queue] = useState<Prayer[]>(() => {
        const ordered = heldOrder(prayers, Date.now());
        const seen = new Set(readSeen());
        const fresh = ordered.filter((p) => !seen.has(p.id));
        // Everything already held this session: start the round again rather
        // than showing an empty room.
        return fresh.length > 0 ? fresh : ordered;
    });
    const [index, setIndex] = useState(0);
    const [prayed, setPrayed] = useState(false);
    const closeRef = useRef<HTMLButtonElement | null>(null);

    const current = queue[index] ?? null;
    const done = index >= queue.length;

    // Esc closes, body scroll is locked while the room is open.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const t = setTimeout(() => closeRef.current?.focus(), 60);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previous;
            clearTimeout(t);
        };
    }, [onClose]);

    // Remember what this visitor has been handed, so a second visit moves on.
    useEffect(() => {
        if (!current) return;
        const seen = readSeen();
        if (!seen.includes(current.id)) writeSeen([...seen, current.id].slice(-200));
    }, [current]);

    const advance = useCallback(() => {
        setPrayed(false);
        setIndex((i) => i + 1);
    }, []);

    const handleAmen = useCallback(() => {
        if (!current || prayed) return;
        setPrayed(true);          // optimistic — the count is the parent's job
        onPray(current.id);
        // A held beat so "Amen" is a moment, not a page-turn button.
        window.setTimeout(advance, 420);
    }, [current, prayed, onPray, advance]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Biðja með"
            className="bidja-room"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 120,
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
            }}
        >
            <style>{BIDJA_CSS}</style>

            {/* Chrome — kicker left, close right. Deliberately thin. */}
            <div className="bidja-top">
                <div className="bidja-kicker">
                    Biðja með
                    {!done && queue.length > 0 && (
                        <span className="bidja-progress">
                            {index + 1} af {queue.length}
                        </span>
                    )}
                </div>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    className="bidja-close"
                    aria-label="Loka bænastund"
                >
                    <IcoClose size={16} />
                    <span>Loka</span>
                </button>
            </div>

            {done || !current ? (
                <div className="bidja-body ink-arrive">
                    <p className="bidja-done">
                        Þú hefur beðið fyrir öllum bænum torgsins í dag.
                    </p>
                    <p className="bidja-done-sub">
                        „Biðjið hver fyrir öðrum.“ — Jak 5:16
                    </p>
                    <button type="button" onClick={onClose} className="bidja-amen">
                        Aftur á torgið
                    </button>
                </div>
            ) : (
                <div className="bidja-body">
                    {/* key on the prayer so each one arrives as ink, not a swap */}
                    <div key={current.id} className="bidja-card ink-arrive">
                        <div className="bidja-meta">
                            <span>{firstName(current.name)}</span>
                            {current.topic && (
                                <>
                                    <span aria-hidden className="bidja-dot">·</span>
                                    <span className="bidja-topic">{current.topic}</span>
                                </>
                            )}
                        </div>

                        <p className="bidja-text">{current.content}</p>

                        <div className="bidja-actions">
                            <button
                                type="button"
                                onClick={handleAmen}
                                disabled={prayed}
                                className="bidja-amen"
                            >
                                {prayed ? 'Amen.' : 'Amen'}
                            </button>
                            <button type="button" onClick={advance} className="bidja-skip">
                                Næsta bæn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * One style block rather than inline objects: this screen has real responsive
 * behaviour (390px to desktop) and a reduced-motion rule, and both read far
 * better as CSS than as branching style props.
 */
const BIDJA_CSS = `
.bidja-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px var(--rail-padding);
    border-bottom: 1px solid rgba(63,47,35,0.14);
}
.bidja-kicker {
    display: flex;
    align-items: baseline;
    gap: 14px;
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gull);
}
.bidja-progress {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
    color: var(--skra-mjuk);
}
.bidja-close {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 44px;
    padding: 10px 18px;
    background: transparent;
    border: 1px solid rgba(63,47,35,0.2);
    border-radius: var(--radius-xs);
    color: var(--skra-mjuk);
    font-family: var(--font-sans);
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
}
.bidja-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(40px, 8vh, 96px) var(--rail-padding) clamp(56px, 10vh, 120px);
}
.bidja-card {
    width: 100%;
    max-width: 44rem;
    text-align: center;
}
.bidja-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    font-family: var(--font-sans);
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--skra-mjuk);
}
.bidja-dot { opacity: 0.4; }
.bidja-topic {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
}
.bidja-text {
    margin: clamp(26px, 4vh, 44px) 0 0;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(26px, 4vw, 44px);
    line-height: 1.38;
    letter-spacing: -0.008em;
    color: var(--skra-djup);
    text-wrap: pretty;
}
.bidja-actions {
    margin-top: clamp(36px, 6vh, 64px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
}
.bidja-amen {
    min-height: 56px;
    min-width: 200px;
    padding: 16px 44px;
    background: var(--kerti);
    border: 1px solid var(--kerti);
    border-radius: var(--radius-sm);
    color: var(--nott);
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 200ms ease;
}
.bidja-amen:disabled {
    cursor: default;
    opacity: 0.72;
}
.bidja-skip {
    min-height: 44px;
    padding: 10px 18px;
    background: transparent;
    border: 0;
    color: var(--skra-mjuk);
    font-family: var(--font-sans);
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
}
.bidja-done {
    margin: 0;
    max-width: 26ch;
    text-align: center;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(24px, 3.4vw, 36px);
    line-height: 1.4;
    color: var(--skra-djup);
}
.bidja-done-sub {
    margin: 20px 0 40px;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 15px;
    color: var(--skra-mjuk);
}
@media (max-width: 420px) {
    .bidja-close span { display: none; }
    .bidja-close { padding: 10px 14px; }
    .bidja-amen { width: 100%; min-width: 0; }
    .bidja-actions { align-self: stretch; }
}
@media (prefers-reduced-motion: reduce) {
    .bidja-amen { transition: none; }
}
`;
