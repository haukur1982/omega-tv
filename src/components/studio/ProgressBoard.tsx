'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal';
import {
    computeItemStates,
    milestoneBoundaries,
    formatIsk,
    formatNumberIs,
    type ProjectItem,
    type PublicGift,
    type ProjectUpdate,
} from '@/lib/fundraising-shared';

/**
 * Framvindan — the living heart of /studio. Real data only: count-up total,
 * the glowing bar, recent gifts (anonymous unless the giver opted in) and
 * editorial updates. Per-item funding states live on the equipment cards
 * (GearGrid) — this board carries the money, the pulse and the news.
 */

function useCountUp(target: number, run: boolean, ms = 1400): number {
    const reduce = useReducedMotion();
    const [value, setValue] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (!run || started.current) return;
        started.current = true;
        if (reduce || target <= 0) {
            const id = requestAnimationFrame(() => setValue(target));
            return () => cancelAnimationFrame(id);
        }
        const t0 = performance.now();
        let raf = 0;
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / ms);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [run, target, ms, reduce]);
    return value;
}

// Deterministic Icelandic date — no locale dependence (browser ICU for
// is-IS is not guaranteed; "July 15" on a page that promises Icelandic
// would break the brand's first non-negotiable).
const MANUDIR = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];
function dateIs(d: string): string {
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return d;
    return `${Number(m[3])}. ${MANUDIR[Number(m[2]) - 1] ?? ''}`;
}

export default function ProgressBoard({
    goal,
    raised,
    giftCount,
    items,
    gifts,
    updates,
}: {
    goal: number;
    raised: number;
    giftCount: number;
    items: ProjectItem[];
    gifts: PublicGift[];
    updates: ProjectUpdate[];
}) {
    const boardRef = useRef<HTMLDivElement>(null);
    const inView = useInView(boardRef, { once: true, margin: '-80px' });
    const reduce = useReducedMotion();
    const shown = useCountUp(raised, inView);
    const pct = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;

    // Milestones: a funded count that celebrates progress even early, and
    // internal cumulative boundaries drawn as tick marks on the bar.
    const states = computeItemStates(items, raised);
    const milestonesFunded = states.filter((s) => s.funded).length;
    const tickPcts = milestoneBoundaries(items, goal).slice(0, -1).map((b) => b * 100);

    return (
        <section
            id="framvindan"
            style={{ background: 'var(--mold)', padding: 'clamp(72px, 10vw, 120px) 0', scrollMarginTop: '80px' }}
        >
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 var(--rail-padding)' }}>
                <Reveal>
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--nordurljos)',
                            marginBottom: '16px',
                        }}
                    >
                        Framvindan
                    </div>
                </Reveal>

                <div ref={boardRef}>
                    <Reveal delay={0.08}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '18px', flexWrap: 'wrap' }}>
                            <div
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 300,
                                    fontVariantNumeric: 'tabular-nums',
                                    fontSize: 'clamp(48px, 7vw, 92px)',
                                    lineHeight: 1,
                                    color: 'var(--ljos)',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {formatNumberIs(shown)} kr.
                            </div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(16px, 1.6vw, 20px)',
                                    color: 'var(--moskva)',
                                }}
                            >
                                af {formatIsk(goal)}
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.12}>
                        <div
                            style={{
                                marginTop: '12px',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '13px',
                                fontWeight: 700,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: 'var(--gull)',
                            }}
                        >
                            {milestonesFunded} af {states.length} áföngum í höfn
                        </div>
                    </Reveal>

                    {/* The glowing bar — kerti fill, candle-glow halo. Fills once, on view. */}
                    <Reveal delay={0.16}>
                        <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={goal}
                            aria-valuenow={raised}
                            aria-label="Söfnun í nýtt stúdíó"
                            style={{
                                position: 'relative',
                                marginTop: '24px',
                                height: '10px',
                                borderRadius: '2px',
                                background: 'var(--torfa)',
                                border: '1px solid rgba(246,242,234,0.06)',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    width: inView || reduce ? `${pct}%` : '0%',
                                    background: 'var(--kerti)',
                                    boxShadow: '0 0 18px rgba(233,168,96,0.55)',
                                    transition: reduce ? 'none' : 'width 1.4s cubic-bezier(0.2, 0, 0.1, 1) 0.2s',
                                }}
                            />
                            {/* Milestone boundaries — each tick is one funded goal to cross */}
                            {tickPcts.map((t, i) => (
                                <span
                                    key={i}
                                    aria-hidden
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: `${t}%`,
                                        width: '2px',
                                        background: 'var(--nott)',
                                        opacity: 0.65,
                                    }}
                                />
                            ))}
                        </div>
                    </Reveal>

                    <Reveal delay={0.24}>
                        <div
                            style={{
                                marginTop: '18px',
                                display: 'flex',
                                gap: '28px',
                                flexWrap: 'wrap',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '14px',
                                letterSpacing: '0.04em',
                                color: 'var(--moskva)',
                            }}
                        >
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                <strong style={{ color: 'var(--ljos)', fontWeight: 600 }}>{giftCount}</strong>{' '}
                                {giftCount === 1 ? 'gjöf hefur borist' : 'gjafir hafa borist'}
                            </span>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                <strong style={{ color: 'var(--ljos)', fontWeight: 600 }}>{Math.floor(pct)}%</strong>{' '}
                                af markmiðinu
                            </span>
                        </div>
                    </Reveal>
                </div>

                {/* Gifts + updates */}
                <div
                    style={{
                        marginTop: 'clamp(40px, 5vw, 64px)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 'clamp(32px, 4vw, 56px)',
                        alignItems: 'start',
                    }}
                >
                    <div>
                        <Reveal>
                            <h3
                                style={{
                                    margin: '0 0 18px',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 400,
                                    fontSize: '22px',
                                    color: 'var(--ljos)',
                                }}
                            >
                                Nýjustu gjafirnar
                            </h3>
                        </Reveal>
                        {gifts.length === 0 ? (
                            <Reveal>
                                <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16.5px', color: 'var(--moskva)' }}>
                                    Söfnunin er nýhafin. Gjafir birtast hér jafnóðum.
                                </p>
                            </Reveal>
                        ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {gifts.map((g, i) => (
                                    <Reveal key={`${g.given_at}-${i}`} delay={0.06 * i}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap',
                                                gap: '6px 16px',
                                                padding: '12px 18px',
                                                borderRadius: '4px',
                                                background: 'var(--torfa)',
                                                border: '1px solid rgba(246,242,234,0.06)',
                                            }}
                                        >
                                            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--moskva)' }}>
                                                {g.donor_name ?? 'Nafnlaus'}
                                                <span style={{ color: 'var(--steinn)' }}> · {dateIs(g.given_at)}</span>
                                            </span>
                                            <span style={{ fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--kerti)' }}>
                                                {formatIsk(g.amount_isk)}
                                            </span>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        )}
                    </div>

                    {updates.length > 0 && (
                        <div>
                            <Reveal>
                                <h3
                                    style={{
                                        margin: '0 0 18px',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: 400,
                                        fontSize: '22px',
                                        color: 'var(--ljos)',
                                    }}
                                >
                                    Fréttir af verkefninu
                                </h3>
                            </Reveal>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {updates.map((u, i) => (
                                    <Reveal key={u.id} delay={0.08 * i}>
                                        <article
                                            style={{
                                                padding: '20px 22px',
                                                borderRadius: '4px',
                                                background: 'var(--torfa)',
                                                border: '1px solid rgba(246,242,234,0.06)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.18em',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--moskva)',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                {dateIs(u.published_at.slice(0, 10))}
                                            </div>
                                            <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '18px', color: 'var(--ljos)' }}>
                                                {u.title}
                                            </h4>
                                            <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-serif)', fontSize: '15px', lineHeight: 1.6, color: 'var(--moskva)' }}>
                                                {u.body}
                                            </p>
                                        </article>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
