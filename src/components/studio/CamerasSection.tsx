'use client';

import Reveal from './Reveal';
import { computeItemStates, formatIsk, type ProjectItem } from '@/lib/fundraising-shared';

/**
 * What the gift actually buys — three cameras, each one a named thing with a
 * job, a price, and a funding state.
 *
 * This replaces the old six-milestone grid AND the separate progress board:
 * on a landing page the progress belongs ON the thing being funded, not in a
 * section of its own. Gifts fill the cameras in order, so a donor can see
 * which camera their gift is finishing.
 */

const IMAGES: Record<string, string> = {
    adalvel: '/studio/cam-main.jpg',
    naermyndavel: '/studio/cam-close.jpg',
    hlidarvel: '/studio/cam-side.jpg',
};

export default function CamerasSection({
    items,
    raised,
}: {
    items: ProjectItem[];
    raised: number;
}) {
    const states = computeItemStates(items, raised);

    return (
        <section
            id="velarnar"
            style={{ background: 'var(--nott)', padding: 'clamp(72px, 10vw, 116px) 0', scrollMarginTop: '80px' }}
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
                        Hvað fer gjöfin í
                    </div>
                </Reveal>
                <Reveal delay={0.08}>
                    <h2
                        style={{
                            margin: '0 0 14px',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 300,
                            fontSize: 'clamp(30px, 3.6vw, 46px)',
                            lineHeight: 1.12,
                            color: 'var(--ljos)',
                            maxWidth: '20ch',
                        }}
                    >
                        Þrjár vélar, þrjú hlutverk.
                    </h2>
                </Reveal>
                <Reveal delay={0.14}>
                    <p
                        style={{
                            margin: '0 0 46px',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '17px',
                            lineHeight: 1.6,
                            color: 'var(--moskva)',
                            maxWidth: '54ch',
                        }}
                    >
                        Engin óljós upphæð. Þetta er tækjalisti, og þegar síðasta vélin er
                        komin er stúdíóið tilbúið til daglegra útsendinga.
                    </p>
                </Reveal>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                        gap: 'clamp(16px, 2vw, 26px)',
                    }}
                >
                    {states.map((cam, i) => {
                        const fill = Math.max(0, Math.min(1, cam.funded ? 1 : cam.active
                            ? (raised - states.slice(0, i).reduce((s, c) => s + c.amount_isk, 0)) / cam.amount_isk
                            : 0));
                        return (
                            <Reveal key={cam.key} delay={0.1 * i}>
                                <article
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        background: 'var(--torfa)',
                                        border: `1px solid ${cam.active ? 'rgba(233,168,96,0.4)' : 'rgba(246,242,234,0.07)'}`,
                                        boxShadow: cam.active ? '0 0 40px rgba(233,168,96,0.1)' : 'none',
                                    }}
                                >
                                    <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={IMAGES[cam.key] ?? '/studio/cam-main.jpg'}
                                            alt=""
                                            aria-hidden
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                filter: cam.funded ? 'none' : 'saturate(0.85) brightness(0.82)',
                                            }}
                                        />
                                        <div
                                            aria-hidden
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background:
                                                    'linear-gradient(to top, rgba(36,32,25,0.95) 0%, rgba(36,32,25,0.2) 55%, transparent 100%)',
                                            }}
                                        />
                                        {cam.funded && (
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '14px',
                                                    right: '14px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    background: 'var(--gull)',
                                                    color: 'var(--nott)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.14em',
                                                    textTransform: 'uppercase',
                                                    padding: '5px 10px',
                                                    borderRadius: '2px',
                                                }}
                                            >
                                                Fjármögnuð
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontFamily: 'var(--font-display)',
                                                fontWeight: 400,
                                                fontSize: '23px',
                                                color: 'var(--ljos)',
                                            }}
                                        >
                                            {cam.label}
                                        </h3>
                                        {cam.note && (
                                            <p
                                                style={{
                                                    margin: '9px 0 0',
                                                    fontFamily: 'var(--font-serif)',
                                                    fontSize: '15px',
                                                    lineHeight: 1.6,
                                                    color: 'var(--moskva)',
                                                    flex: 1,
                                                }}
                                            >
                                                {cam.note}
                                            </p>
                                        )}

                                        <div style={{ marginTop: '20px' }}>
                                            <div
                                                style={{
                                                    height: '5px',
                                                    borderRadius: '2px',
                                                    background: 'rgba(246,242,234,0.09)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${fill * 100}%`,
                                                        background: 'var(--kerti)',
                                                        boxShadow: fill > 0 ? '0 0 14px rgba(233,168,96,0.55)' : 'none',
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: '11px',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.04em',
                                                    color: cam.funded ? 'var(--gull)' : 'var(--kerti)',
                                                }}
                                            >
                                                {cam.funded ? 'Fjármögnuð að fullu' : formatIsk(cam.amount_isk)}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
