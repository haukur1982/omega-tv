'use client';

import Reveal from './Reveal';

/**
 * /studio hero — full-bleed cinematic camera silhouette (public/studio/hero.jpg,
 * generated in the brand's warm light) under the standard bottom-left
 * warm-black gradient stack. Kicker + Fraunces 300 headline + two CTAs.
 */
export default function StudioHero() {
    return (
        <section
            style={{
                position: 'relative',
                minHeight: 'min(88vh, 900px)',
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
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
            {/* Content-over-image gradient stack — strong at bottom-left (brand-allowed gradient) */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(to top, rgba(20,18,15,0.96) 0%, rgba(20,18,15,0.55) 38%, rgba(20,18,15,0.12) 70%, rgba(20,18,15,0.35) 100%)',
                }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(105deg, rgba(20,18,15,0.82) 0%, rgba(20,18,15,0.25) 55%, rgba(20,18,15,0) 80%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(120px, 18vh, 200px) var(--rail-padding) clamp(56px, 9vh, 96px)',
                }}
            >
                <Reveal>
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--kerti)',
                            marginBottom: '20px',
                        }}
                    >
                        Omega · Nýtt stúdíó
                    </div>
                </Reveal>
                <Reveal delay={0.12}>
                    <h1
                        style={{
                            margin: 0,
                            maxWidth: '13ch',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 300,
                            fontSize: 'clamp(44px, 7vw, 96px)',
                            lineHeight: 1.02,
                            letterSpacing: '-0.01em',
                            color: 'var(--ljos)',
                        }}
                    >
                        Ljósið þarf stúdíó.
                    </h1>
                </Reveal>
                <Reveal delay={0.24}>
                    <p
                        style={{
                            margin: '24px 0 0',
                            maxWidth: '54ch',
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(17px, 1.6vw, 21px)',
                            lineHeight: 1.55,
                            color: 'var(--moskva)',
                        }}
                    >
                        Í 34 ár hefur Omega sent fagnaðarerindið inn á íslensk heimili. Nú
                        byggjum við stúdíó fyrir daglega dagskrá, viðtöl og hlaðvörp. Hér
                        sérðu hvert hver króna fer og hvernig verkið vex.
                    </p>
                </Reveal>
                <Reveal delay={0.36}>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '36px' }}>
                        <a
                            href="#styrkja"
                            style={{
                                display: 'inline-block',
                                background: 'var(--kerti)',
                                color: 'var(--nott)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                fontSize: '15px',
                                padding: '14px 26px',
                                borderRadius: '2px',
                                textDecoration: 'none',
                            }}
                        >
                            Styrkja verkefnið
                        </a>
                        <a
                            href="#framvindan"
                            style={{
                                display: 'inline-block',
                                background: 'transparent',
                                color: 'var(--ljos)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                fontSize: '15px',
                                padding: '14px 26px',
                                borderRadius: '2px',
                                border: '1px solid rgba(246,242,234,0.18)',
                                textDecoration: 'none',
                            }}
                        >
                            Sjá framvinduna →
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
