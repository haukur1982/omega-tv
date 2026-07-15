'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatNumberIs, formatIsk } from '@/lib/fundraising-shared';
import type { BroadcastStatus } from './BroadcastGraphic';

/**
 * /studio/filler — the self-updating between-programs spot. One ~26s
 * looping animated sequence (five scenes, brand "ink on vellum" arrivals),
 * ending on the live total + QR. Reads /api/studio/status so every airing
 * shows the real current number. Drop it in the TriCaster junction rotation
 * once; it never goes stale. No voice, no shoot — that's Layer 2.
 */

const DUR = 26; // seconds, whole loop

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

// One scene's fade-in/hold/fade-out keyframes as % of the whole loop.
function sceneKeyframes(name: string, inS: number, inE: number, outS: number, outE: number): string {
    const p = (n: number) => `${+(n * 100 / DUR).toFixed(2)}%`;
    return `@keyframes ${name}{
    0%{opacity:0;filter:blur(8px)}
    ${p(inS)}{opacity:0;filter:blur(8px)}
    ${p(inE)}{opacity:1;filter:blur(0)}
    ${p(outS)}{opacity:1;filter:blur(0)}
    ${p(outE)}{opacity:0;filter:blur(6px)}
    100%{opacity:0;filter:blur(6px)}
  }`;
}

const SCENES = [
    { name: 'scn1', inS: 0.4, inE: 1.6, outS: 4.6, outE: 5.6 },
    { name: 'scn2', inS: 5.6, inE: 6.8, outS: 9.6, outE: 10.6 },
    { name: 'scn3', inS: 10.6, inE: 11.8, outS: 15.6, outE: 16.6 },
    { name: 'scn4', inS: 16.6, inE: 17.8, outS: 20.6, outE: 21.6 },
    { name: 'scn5', inS: 21.6, inE: 22.8, outS: 25.4, outE: 26 },
];

const KEYFRAMES = SCENES.map((s) => sceneKeyframes(s.name, s.inS, s.inE, s.outS, s.outE)).join('\n');

function sceneStyle(name: string): React.CSSProperties {
    return {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 160px',
        opacity: 0,
        animation: `${name} ${DUR}s linear infinite`,
    };
}

function OmegaRing({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 240 240" fill="none" style={{ color: 'var(--kerti)' }}>
            <defs>
                <mask id="fill-omega-cut" maskUnits="userSpaceOnUse">
                    <rect width="240" height="240" fill="white" />
                    <rect x="0" y="202" width="240" height="6" fill="black" />
                </mask>
            </defs>
            <g mask="url(#fill-omega-cut)">
                <circle cx="120" cy="120" r="104" stroke="currentColor" strokeWidth="22" fill="none" />
                <text x="120" y="202" fill="currentColor" fontFamily="'Fraunces','Newsreader',Georgia,serif" fontSize="235" fontWeight="700" textAnchor="middle">Ω</text>
            </g>
        </svg>
    );
}

const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--ljos)', lineHeight: 1.06, letterSpacing: '-0.01em' };
const KICKER: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--kerti)' };

const GEAR = [
    { src: '/studio/lens.jpg', label: 'Myndavélar' },
    { src: '/studio/lights.jpg', label: 'Ljós' },
    { src: '/studio/podcast.jpg', label: 'Hljóð' },
];

export default function StudioFiller({ initial }: { initial: BroadcastStatus }) {
    const [status, setStatus] = useState<BroadcastStatus>(initial);
    const scale = useFitScale(1920, 1080);

    const poll = useCallback(async () => {
        try {
            const res = await fetch('/api/studio/status', { cache: 'no-store' });
            if (!res.ok) return;
            const d = await res.json();
            if (typeof d.raised === 'number') setStatus(d);
        } catch { /* keep last-known */ }
    }, []);
    useEffect(() => {
        const id = setInterval(poll, 20000);
        return () => clearInterval(id);
    }, [poll]);

    const pct = status.goal > 0 ? status.raised / status.goal : 0;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--nott)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            <style>{KEYFRAMES}</style>
            <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'center', background: 'var(--nott)', color: 'var(--ljos)', overflow: 'hidden' }}>
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% -10%, rgba(233,168,96,0.14), transparent 55%)' }} />

                {/* Scene 1 — the mark + the line */}
                <div style={sceneStyle('scn1')}>
                    <OmegaRing size={140} />
                    <div style={{ ...DISPLAY, fontSize: '116px', marginTop: '44px' }}>Kveikjum Ljósið.</div>
                </div>

                {/* Scene 2 — the vision */}
                <div style={sceneStyle('scn2')}>
                    <div style={{ ...DISPLAY, fontSize: '92px', maxWidth: '1500px' }}>Dagleg dagskrá og hlaðvörp.</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '46px', color: 'var(--moskva)', marginTop: '34px' }}>
                        Fagnaðarerindið inn á hvert heimili.
                    </div>
                </div>

                {/* Scene 3 — what it takes */}
                <div style={sceneStyle('scn3')}>
                    <div style={{ ...KICKER, fontSize: '26px', marginBottom: '40px' }}>Til þess þarf</div>
                    <div style={{ display: 'flex', gap: '40px' }}>
                        {GEAR.map((g) => (
                            <div key={g.label} style={{ width: '380px' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={g.src} alt="" style={{ width: '380px', height: '300px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(246,242,234,0.08)' }} />
                                <div style={{ ...DISPLAY, fontWeight: 400, fontSize: '34px', marginTop: '18px' }}>{g.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scene 4 — the ask + live progress */}
                <div style={sceneStyle('scn4')}>
                    <div style={{ ...KICKER, fontSize: '26px', marginBottom: '30px' }}>Taktu þátt</div>
                    <div style={{ ...DISPLAY, fontSize: '150px', fontVariantNumeric: 'tabular-nums' }}>{formatNumberIs(status.raised)} kr.</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', color: 'var(--moskva)', marginTop: '12px' }}>
                        af {formatIsk(status.goal)} · {status.milestonesFunded} af {status.milestonesTotal} áföngum í höfn
                    </div>
                    <div style={{ position: 'relative', width: '1100px', height: '14px', marginTop: '40px', borderRadius: '3px', background: 'rgba(246,242,234,0.10)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, pct * 100)}%`, background: 'var(--kerti)', boxShadow: '0 0 22px rgba(233,168,96,0.6)' }} />
                        {status.boundaries.slice(0, -1).map((b, i) => (
                            <span key={i} aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, left: `${b * 100}%`, width: '2px', background: 'var(--nott)', opacity: 0.65 }} />
                        ))}
                    </div>
                </div>

                {/* Scene 5 — the QR hold */}
                <div style={sceneStyle('scn5')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '64px' }}>
                        <div style={{ background: 'var(--skra)', borderRadius: '18px', padding: '30px', boxShadow: '0 24px 60px rgba(10,8,5,0.5)' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/studio/qr-studio.png" alt="" width={340} height={340} style={{ display: 'block', borderRadius: '8px' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ ...KICKER, fontSize: '26px', marginBottom: '18px' }}>Skannaðu og styrktu</div>
                            <div style={{ ...DISPLAY, fontSize: '84px' }}>omega.is/studio</div>
                            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '28px', color: 'var(--moskva)', marginTop: '22px', letterSpacing: '0.04em' }}>
                                Sjónvarpsstöðin Omega · síðan 1992
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
