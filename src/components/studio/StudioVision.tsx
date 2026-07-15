'use client';

import Reveal from './Reveal';

/**
 * The WHY — daily programs + podcasts, gospel of the kingdom to the nation.
 * Editorial two-column: statement + the three concrete outcomes.
 * One short Scripture line in the human voice (italic Newsreader).
 */
export default function StudioVision() {
    const outcomes = [
        {
            title: 'Dagleg dagskrá',
            body: 'Orðsending á hverjum degi — stutt, skýr og fyrir venjulegt fólk. Stöð sem lifir daglega, ekki bara á sunnudögum.',
        },
        {
            title: 'Hlaðvörp',
            body: 'Samtöl og kennsla þar sem þjóðin hlustar nú þegar — í símanum, í bílnum, á leið til vinnu.',
        },
        {
            title: 'Fjölbreyttir þættir',
            body: 'Samtalsþættir, biblíukennsla, vitnisburðir og lofgjörð — dagskrárgerð fyrir hverja kynslóð.',
        },
    ];

    return (
        <section
            style={{
                background: 'var(--mold)',
                padding: 'clamp(72px, 10vw, 120px) 0',
            }}
        >
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 var(--rail-padding)' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 'clamp(40px, 6vw, 88px)',
                        alignItems: 'start',
                    }}
                >
                    <div>
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
                                Af hverju
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 300,
                                    fontSize: 'clamp(30px, 3.6vw, 48px)',
                                    lineHeight: 1.12,
                                    color: 'var(--ljos)',
                                }}
                            >
                                Þjóð sem heyrir daglega, ekki stundum.
                            </h2>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <p
                                style={{
                                    margin: '22px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '17px',
                                    lineHeight: 1.65,
                                    color: 'var(--moskva)',
                                    maxWidth: '52ch',
                                }}
                            >
                                Omega hefur sent út í 34 ár. Núna er markmiðið stærra: dagleg
                                dagskrá sem fylgir fólki í gegnum vikuna og hlaðvörp sem ná til
                                kynslóðar sem horfir ekki á sjónvarp. Það gerist ekki með
                                gömlum búnaði í láni. Það gerist í stúdíói sem er byggt fyrir
                                verkið.
                            </p>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <blockquote
                                style={{
                                    margin: '32px 0 0',
                                    padding: '4px 0 4px 20px',
                                    borderLeft: '3px solid var(--gull)',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '19px',
                                    lineHeight: 1.5,
                                    color: 'var(--ljos)',
                                }}
                            >
                                Fagnaðarerindið um ríkið verður prédikað öllum þjóðum til
                                vitnisburðar.
                                <cite
                                    style={{
                                        display: 'block',
                                        marginTop: '10px',
                                        fontStyle: 'normal',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '12px',
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: 'var(--steinn)',
                                    }}
                                >
                                    Matteus 24:14
                                </cite>
                            </blockquote>
                        </Reveal>
                    </div>

                    <div style={{ display: 'grid', gap: '14px' }}>
                        {outcomes.map((o, i) => (
                            <Reveal key={o.title} delay={0.12 * i}>
                                <div
                                    style={{
                                        background: 'var(--torfa)',
                                        border: '1px solid rgba(246,242,234,0.06)',
                                        borderRadius: '4px',
                                        padding: '26px 28px',
                                    }}
                                >
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontFamily: 'var(--font-display)',
                                            fontWeight: 400,
                                            fontSize: '21px',
                                            color: 'var(--ljos)',
                                        }}
                                    >
                                        {o.title}
                                    </h3>
                                    <p
                                        style={{
                                            margin: '10px 0 0',
                                            fontFamily: 'var(--font-serif)',
                                            fontSize: '15.5px',
                                            lineHeight: 1.6,
                                            color: 'var(--moskva)',
                                        }}
                                    >
                                        {o.body}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
