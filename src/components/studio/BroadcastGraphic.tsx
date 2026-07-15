'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { formatNumberIs, formatIsk } from '@/lib/fundraising-shared';

/**
 * Broadcast graphic for the TriCaster — one component, two layouts:
 *
 *   layout="full"  → full-screen status card (warm-black), taken full or
 *                    dropped into the between-programs rotation.
 *   layout="bordi" → lower-third on chroma green (#00B140) for keying;
 *                    only the bottom strip is opaque.
 *
 * Fixed 1920×1080 canvas, scaled to fit whatever window/capture it runs in
 * (crisp 1:1 at 1080p fullscreen). Polls /api/studio/status every 15s and
 * eases the total up when a new gift lands — so the number moves on air.
 * The QR (public/studio/qr-studio.png) points at omega.is/studio.
 */

const KEY_GREEN = '#00B140';

export interface BroadcastStatus {
    raised: number;
    goal: number;
    count: number;
    milestonesFunded: number;
    milestonesTotal: number;
    boundaries: number[];
}

function useEasedValue(target: number, ms = 1500): number {
    const [value, setValue] = useState(target);
    const fromRef = useRef(target);
    const rafRef = useRef(0);
    useEffect(() => {
        const from = fromRef.current;
        if (from === target) return;
        const t0 = performance.now();
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / ms);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = Math.round(from + (target - from) * eased);
            setValue(v);
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
            else fromRef.current = target;
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, ms]);
    return value;
}

function useFitScale(w: number, h: number): number {
    const [scale, setScale] = useState(1);
    useEffect(() => {
        const fit = () => setScale(Math.min(window.innerWidth / w, window.innerHeight / h));
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, [w, h]);
    return scale;
}

const KICKER: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: 'var(--kerti)',
};

function OmegaRing({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 240 240" fill="none" style={{ color: 'var(--kerti)' }}>
            <defs>
                <mask id="bc-omega-cut" maskUnits="userSpaceOnUse">
                    <rect width="240" height="240" fill="white" />
                    <rect x="0" y="202" width="240" height="6" fill="black" />
                </mask>
            </defs>
            <g mask="url(#bc-omega-cut)">
                <circle cx="120" cy="120" r="104" stroke="currentColor" strokeWidth="22" fill="none" />
                <text x="120" y="202" fill="currentColor" fontFamily="'Fraunces','Newsreader',Georgia,serif" fontSize="235" fontWeight="700" textAnchor="middle">Ω</text>
            </g>
        </svg>
    );
}

function ProgressBar({ pct, boundaries, height }: { pct: number; boundaries: number[]; height: number }) {
    return (
        <div
            style={{
                position: 'relative',
                height,
                borderRadius: '3px',
                background: 'rgba(246,242,234,0.10)',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${Math.min(100, pct * 100)}%`,
                    background: 'var(--kerti)',
                    boxShadow: '0 0 22px rgba(233,168,96,0.6)',
                    transition: 'width 1.5s cubic-bezier(0.2,0,0.1,1)',
                }}
            />
            {boundaries.slice(0, -1).map((b, i) => (
                <span key={i} aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, left: `${b * 100}%`, width: '2px', background: 'var(--nott)', opacity: 0.65 }} />
            ))}
        </div>
    );
}

function QrPanel({ scale = 1 }: { scale?: number }) {
    return (
        <div
            style={{
                background: 'var(--skra)',
                borderRadius: '16px',
                padding: `${28 * scale}px ${28 * scale}px ${22 * scale}px`,
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(10,8,5,0.5)',
            }}
        >
            <div style={{ ...KICKER, color: 'var(--skra-mjuk)', fontSize: `${18 * scale}px`, marginBottom: `${16 * scale}px` }}>
                Skannaðu og styrktu
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/studio/qr-studio.png" alt="" width={300 * scale} height={300 * scale} style={{ display: 'block', borderRadius: '8px' }} />
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: `${30 * scale}px`, letterSpacing: '0.04em', color: 'var(--skra-djup)', marginTop: `${16 * scale}px` }}>
                omega.is/studio
            </div>
        </div>
    );
}

export default function BroadcastGraphic({
    layout,
    initial,
}: {
    layout: 'full' | 'bordi';
    initial: BroadcastStatus;
}) {
    const [status, setStatus] = useState<BroadcastStatus>(initial);
    const raised = useEasedValue(status.raised);
    const scale = useFitScale(1920, 1080);

    const poll = useCallback(async () => {
        try {
            const res = await fetch('/api/studio/status', { cache: 'no-store' });
            if (!res.ok) return;
            const d = await res.json();
            if (typeof d.raised === 'number') setStatus(d);
        } catch { /* keep last-known on a hiccup — never blank on air */ }
    }, []);

    useEffect(() => {
        const id = setInterval(poll, 15000);
        return () => clearInterval(id);
    }, [poll]);

    const pct = status.goal > 0 ? status.raised / status.goal : 0;
    const outerBg = layout === 'bordi' ? KEY_GREEN : 'var(--nott)';

    const canvas: React.CSSProperties = {
        position: 'absolute',
        width: 1920,
        height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        color: 'var(--ljos)',
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: outerBg, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            {layout === 'full' ? (
                <div style={{ ...canvas, background: 'var(--nott)' }}>
                    {/* soft top glow */}
                    <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% -10%, rgba(233,168,96,0.16), transparent 55%)' }} />
                    <div style={{ position: 'absolute', inset: 0, padding: '96px 110px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '80px' }}>
                        <div style={{ maxWidth: '1060px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                                <OmegaRing size={64} />
                                <span style={{ ...KICKER, fontSize: '24px' }}>Söfnun fyrir Ljósið</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '150px', lineHeight: 0.98, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
                                {formatNumberIs(raised)} kr.
                            </div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--moskva)', marginTop: '14px' }}>
                                af {formatIsk(status.goal)}
                            </div>
                            <div style={{ width: '980px', marginTop: '40px' }}>
                                <ProgressBar pct={pct} boundaries={status.boundaries} height={16} />
                            </div>
                            <div style={{ display: 'flex', gap: '40px', marginTop: '26px', fontFamily: 'var(--font-sans)', fontSize: '27px', fontVariantNumeric: 'tabular-nums' }}>
                                <span style={{ color: 'var(--gull)', fontWeight: 700, letterSpacing: '0.06em' }}>
                                    {status.milestonesFunded} af {status.milestonesTotal} áföngum í höfn
                                </span>
                                <span style={{ color: 'var(--moskva)' }}>{status.count} gjafir</span>
                            </div>
                        </div>
                        <QrPanel />
                    </div>
                    <div style={{ position: 'absolute', left: '110px', bottom: '70px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 300, fontSize: '40px', color: 'var(--ljos)', opacity: 0.9 }}>
                        Kveikjum Ljósið.
                    </div>
                </div>
            ) : (
                <div style={{ ...canvas, background: KEY_GREEN }}>
                    <div
                        style={{
                            position: 'absolute',
                            left: '70px',
                            right: '70px',
                            bottom: '70px',
                            background: 'var(--nott)',
                            borderRadius: '14px',
                            padding: '34px 44px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '48px',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                                <OmegaRing size={40} />
                                <span style={{ ...KICKER, fontSize: '20px' }}>Söfnun fyrir Ljósið</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '18px' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '66px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                                    {formatNumberIs(raised)} kr.
                                </span>
                                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--moskva)' }}>af {formatIsk(status.goal)}</span>
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '22px', fontWeight: 700, color: 'var(--gull)', letterSpacing: '0.06em' }}>
                                    · {status.milestonesFunded}/{status.milestonesTotal} áföngum í höfn
                                </span>
                            </div>
                            <div style={{ marginTop: '18px' }}>
                                <ProgressBar pct={pct} boundaries={status.boundaries} height={12} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/studio/qr-studio.png" alt="" width={150} height={150} style={{ borderRadius: '8px', background: 'var(--skra)' }} />
                            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '30px', color: 'var(--ljos)', letterSpacing: '0.02em' }}>
                                omega.is/studio
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
