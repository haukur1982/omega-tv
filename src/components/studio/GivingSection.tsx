'use client';

import Reveal from './Reveal';

/**
 * Taktu þátt — the two real ways to give today (Aur + millifærsla, same
 * details as /give), the online gateway marked as coming, and the quiet
 * Heimakirkja line. Honest by design: no invented tiers, no fake buttons.
 */
export default function GivingSection() {
    return (
        <section
            id="styrkja"
            style={{ background: 'var(--nott)', padding: 'clamp(72px, 10vw, 120px) 0', scrollMarginTop: '80px' }}
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
                            color: 'var(--kerti)',
                            marginBottom: '16px',
                        }}
                    >
                        Taktu þátt
                    </div>
                </Reveal>
                <Reveal delay={0.1}>
                    <h2
                        style={{
                            margin: '0 0 12px',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 300,
                            fontSize: 'clamp(30px, 3.6vw, 48px)',
                            lineHeight: 1.12,
                            color: 'var(--ljos)',
                            maxWidth: '24ch',
                        }}
                    >
                        Hver gjöf kveikir á einhverju.
                    </h2>
                </Reveal>
                <Reveal delay={0.18}>
                    <p
                        style={{
                            margin: '0 0 48px',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '17px',
                            lineHeight: 1.6,
                            color: 'var(--moskva)',
                            maxWidth: '58ch',
                        }}
                    >
                        Merktu gjöfina „Stúdíó" og hún birtist í framvindunni hér að ofan.
                        Viljir þú láta nafnið þitt fylgja, láttu það koma fram — annars er
                        gjöfin nafnlaus.
                    </p>
                </Reveal>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'clamp(16px, 2vw, 24px)',
                    }}
                >
                    <Reveal>
                        <div
                            style={{
                                background: 'var(--torfa)',
                                border: '1px solid rgba(246,242,234,0.06)',
                                borderRadius: '4px',
                                padding: '30px 30px 28px',
                                height: '100%',
                            }}
                        >
                            <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '22px', color: 'var(--ljos)' }}>
                                Millifærsla
                            </h3>
                            <p style={{ margin: '0 0 20px', fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--moskva)' }}>
                                Beint af heimabankanum, eins og alltaf.
                            </p>
                            <dl style={{ margin: 0, display: 'grid', gap: '12px', fontFamily: 'var(--font-sans)' }}>
                                <div>
                                    <dt style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--steinn)' }}>Reikningur</dt>
                                    <dd style={{ margin: '4px 0 0', fontSize: '17px', fontVariantNumeric: 'tabular-nums', color: 'var(--ljos)' }}>0113-26-25707</dd>
                                </div>
                                <div>
                                    <dt style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--steinn)' }}>Kennitala</dt>
                                    <dd style={{ margin: '4px 0 0', fontSize: '17px', fontVariantNumeric: 'tabular-nums', color: 'var(--ljos)' }}>630890-1019</dd>
                                </div>
                                <div>
                                    <dt style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--steinn)' }}>Skýring</dt>
                                    <dd style={{ margin: '4px 0 0', fontSize: '17px', color: 'var(--ljos)' }}>„Stúdíó" — og nafn ef á að birta</dd>
                                </div>
                            </dl>
                        </div>
                    </Reveal>

                    <Reveal delay={0.12}>
                        <div
                            style={{
                                background: 'var(--torfa)',
                                border: '1px solid rgba(246,242,234,0.06)',
                                borderRadius: '4px',
                                padding: '30px 30px 28px',
                                height: '100%',
                            }}
                        >
                            <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '22px', color: 'var(--ljos)' }}>
                                Aur
                            </h3>
                            <p style={{ margin: '0 0 20px', fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--moskva)' }}>
                                Úr símanum á nokkrum sekúndum.
                            </p>
                            <dl style={{ margin: 0, display: 'grid', gap: '12px', fontFamily: 'var(--font-sans)' }}>
                                <div>
                                    <dt style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--steinn)' }}>Móttakandi</dt>
                                    <dd style={{ margin: '4px 0 0', fontSize: '17px', color: 'var(--ljos)' }}>@Omega</dd>
                                </div>
                                <div>
                                    <dt style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--steinn)' }}>Skýring</dt>
                                    <dd style={{ margin: '4px 0 0', fontSize: '17px', color: 'var(--ljos)' }}>„Stúdíó"</dd>
                                </div>
                            </dl>
                        </div>
                    </Reveal>

                    <Reveal delay={0.24}>
                        <div
                            style={{
                                background: 'var(--torfa)',
                                border: '1px dashed rgba(246,242,234,0.14)',
                                borderRadius: '4px',
                                padding: '30px 30px 28px',
                                height: '100%',
                            }}
                        >
                            <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '22px', color: 'var(--ljos)' }}>
                                Kortagreiðsla á netinu
                            </h3>
                            <p style={{ margin: '0 0 14px', fontFamily: 'var(--font-serif)', fontSize: '15px', lineHeight: 1.6, color: 'var(--moskva)' }}>
                                Örugg greiðslugátt — stök gjöf eða mánaðarleg — opnar hér á
                                næstunni. Framvindan uppfærist þá sjálfkrafa um leið og gjöf
                                berst.
                            </p>
                            <span
                                style={{
                                    display: 'inline-block',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: 'var(--kerti)',
                                    border: '1px solid rgba(233,168,96,0.35)',
                                    borderRadius: '2px',
                                    padding: '6px 10px',
                                }}
                            >
                                Á leiðinni
                            </span>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={0.3}>
                    <p
                        style={{
                            margin: '40px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '15.5px',
                            lineHeight: 1.65,
                            color: 'var(--steinn)',
                            maxWidth: '62ch',
                        }}
                    >
                        Svo er til leið sem kostar þig ekkert: skráning í{' '}
                        <a href="/heimakirkja" style={{ color: 'var(--nordurljos)', textDecoration: 'none' }}>
                            Heimakirkju
                        </a>{' '}
                        beinir sóknargjaldinu þínu — sem ríkið innheimtir hvort sem er — í
                        þetta starf, mánuð eftir mánuð.
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
