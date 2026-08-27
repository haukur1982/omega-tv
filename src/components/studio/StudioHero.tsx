'use client';

import Reveal from './Reveal';
import { formatNumberIs, formatMkr } from '@/lib/fundraising-shared';

/**
 * Landing hero for the camera campaign.
 *
 * Traffic arrives here from an ad and decides in about four seconds, so the
 * hero carries the whole proposition at once: the occasion (34 years), the
 * ask (three cameras), the proof (live total), and the action. No scrolling
 * required to understand what is being asked or how far along it is.
 */
export default function StudioHero({ raised, goal }: { raised: number; goal: number }) {
    const pct = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;

    return (
        <section
            style={{
                position: 'relative',
                minHeight: 'min(92vh, 940px)',
                display: 'flex',
                alignItems: 'flex-end',
                background: 'var(--nott)',
                overflow: 'hidden',
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/studio/hero.jpg"
                alt=""
                aria-hidden
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(to top, rgba(20,18,15,0.97) 0%, rgba(20,18,15,0.62) 42%, rgba(20,18,15,0.15) 72%, rgba(20,18,15,0.40) 100%)',
                }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(100deg, rgba(20,18,15,0.86) 0%, rgba(20,18,15,0.30) 52%, rgba(20,18,15,0) 78%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(120px, 16vh, 190px) var(--rail-padding) clamp(44px, 7vh, 72px)',
                }}
            >
                <Reveal>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.24em',
                            textTransform: 'uppercase',
                            color: 'var(--kerti)',
                            border: '1px solid rgba(233,168,96,0.35)',
                            borderRadius: '100px',
                            padding: '7px 16px',
                            marginBottom: '26px',
                        }}
                    >
                        Omega 34 ára · Afmælissöfnun
                    </div>
                </Reveal>

                <Reveal delay={0.1}>
                    <h1
                        style={{
                            margin: 0,
                            maxWidth: '15ch',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 300,
                            fontSize: 'clamp(42px, 6.6vw, 88px)',
                            lineHeight: 1.03,
                            letterSpacing: '-0.012em',
                            color: 'var(--ljos)',
                        }}
                    >
                        Þrjár myndavélar fyrir Omega.
                    </h1>
                </Reveal>

                <Reveal delay={0.2}>
                    <p
                        style={{
                            margin: '22px 0 0',
                            maxWidth: '50ch',
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(17px, 1.6vw, 21px)',
                            lineHeight: 1.55,
                            color: 'var(--moskva)',
                        }}
                    >
                        Í 34 ár hefur Omega borið ljós inn á íslensk heimili. Til að senda út
                        daglega dagskrá, viðtöl og hlaðvörp þarf stöðin þrjár stúdíómyndavélar.
                        Þetta er afmælisgjöfin.
                    </p>
                </Reveal>

                {/* The ask and the proof, before any scrolling */}
                <Reveal delay={0.3}>
                    <div style={{ marginTop: '38px', maxWidth: '620px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 300,
                                    fontSize: 'clamp(34px, 4.4vw, 52px)',
                                    lineHeight: 1,
                                    color: 'var(--ljos)',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {formatNumberIs(raised)} kr.
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '15px',
                                    color: 'var(--moskva)',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                af {formatMkr(goal)} markmiði
                            </span>
                        </div>

                        <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={goal}
                            aria-valuenow={raised}
                            aria-label="Söfnun fyrir myndavélar"
                            style={{
                                marginTop: '16px',
                                height: '8px',
                                borderRadius: '2px',
                                background: 'rgba(246,242,234,0.14)',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    width: `${Math.max(pct, raised > 0 ? 1.5 : 0)}%`,
                                    background: 'var(--kerti)',
                                    boxShadow: '0 0 20px rgba(233,168,96,0.6)',
                                }}
                            />
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.4}>
                    <div style={{ display: 'flex', gap: '13px', flexWrap: 'wrap', marginTop: '32px' }}>
                        <a
                            href="#gefa"
                            style={{
                                display: 'inline-block',
                                background: 'var(--kerti)',
                                color: 'var(--nott)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 700,
                                fontSize: '16px',
                                padding: '16px 32px',
                                borderRadius: '2px',
                                textDecoration: 'none',
                                boxShadow: '0 0 40px rgba(233,168,96,0.25)',
                            }}
                        >
                            Gefa til Omega
                        </a>
                        <a
                            href="#velarnar"
                            style={{
                                display: 'inline-block',
                                background: 'transparent',
                                color: 'var(--ljos)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                fontSize: '16px',
                                padding: '16px 28px',
                                borderRadius: '2px',
                                border: '1px solid rgba(246,242,234,0.22)',
                                textDecoration: 'none',
                            }}
                        >
                            Hvað fer gjöfin í? →
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
