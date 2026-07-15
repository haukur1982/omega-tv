'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal';
import {
    formatIsk,
    formatNumberIs,
    type ProjectItem,
    type PublicGift,
    type ProjectUpdate,
} from '@/lib/fundraising-shared';

/**
 * Framvindan — the living heart of /studio. Everything here is real data:
 * the count-up total, the glowing bar, per-item funding states (cumulative:
 * gifts fund the list top-down), recent gifts (anonymous unless the giver
 * opted in) and editorial updates. Designed to encourage: every number is
 * someone who said já.
 */

function useCountUp(target: number, run: boolean, ms = 1400): number {
    const reduce = useReducedMotion();
    const [value, setValue] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (!run || started.current) return;
        started.current = true;
        if (reduce || target <= 0) { setValue(target); return; }
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

    // Cumulative funding: gifts fill the item list top-down.
    let cumulative = 0;
    const itemStates = items.map((item) => {
        const start = cumulative;
        cumulative += item.amount_isk;
        const funded = raised >= cumulative;
        const active = !funded && raised > start;
        return { ...item, funded, active };
    });

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

                    {/* The glowing bar — kerti fill, candle-glow halo. Fills once, on view. */}
                    <Reveal delay={0.16}>
                        <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={goal}
                            aria-valuenow={raised}
                            aria-label="Söfnun í nýtt stúdíó"
                            style={{
                                marginTop: '30px',
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
                                fontSize: '13px',
                                letterSpacing: '0.06em',
                                color: 'var(--steinn)',
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

                {/* Milestones + gifts/updates */}
                <div
                    style={{
                        marginTop: 'clamp(48px, 6vw, 72px)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 'clamp(32px, 4vw, 56px)',
                        alignItems: 'start',
                    }}
                >
                    {/* Item funding states */}
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
                                Áfangarnir
                            </h3>
                        </Reveal>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {itemStates.map((item, i) => (
                                <Reveal key={item.key || item.label} delay={0.07 * i}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '10px 14px',
                                            padding: '14px 18px',
                                            borderRadius: '4px',
                                            background: 'var(--torfa)',
                                            border: `1px solid ${item.active ? 'rgba(233,168,96,0.35)' : 'rgba(246,242,234,0.06)'}`,
                                            boxShadow: item.active ? '0 0 22px rgba(233,168,96,0.12)' : 'none',
                                        }}
                                    >
                                        {/* state mark: hand-authored stroke icons per brand */}
                                        <span aria-hidden style={{ display: 'inline-flex', width: 20, height: 20, color: item.funded ? 'var(--gull)' : item.active ? 'var(--kerti)' : 'var(--steinn)' }}>
                                            {item.funded ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5 9.5 18 20 6.5" /></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="8" /></svg>
                                            )}
                                        </span>
                                        <span
                                            style={{
                                                flex: 1,
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '14.5px',
                                                fontWeight: 500,
                                                color: item.funded ? 'var(--ljos)' : 'var(--moskva)',
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontVariantNumeric: 'tabular-nums',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                color: item.funded ? 'var(--gull)' : item.active ? 'var(--kerti)' : 'var(--steinn)',
                                                letterSpacing: '0.04em',
                                            }}
                                        >
                                            {item.funded ? 'Fjármagnað' : item.active ? 'Í söfnun' : formatIsk(item.amount_isk)}
                                        </span>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    {/* Recent gifts + updates */}
                    <div style={{ display: 'grid', gap: '40px' }}>
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
                                    <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px', color: 'var(--steinn)' }}>
                                        Fyrsta gjöfin er ekki komin enn. Hún gæti verið þín.
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
                                                    gap: '16px',
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
                                                <span style={{ fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', fontSize: '14px', fontWeight: 600, color: 'var(--kerti)' }}>
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
                                                        color: 'var(--steinn)',
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
            </div>
        </section>
    );
}
