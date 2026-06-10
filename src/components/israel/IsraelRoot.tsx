/**
 * IsraelRoot — "Rótin ber þig." (Romans 11)
 *
 * The section that names the reason this page exists: antisemitism is
 * real — also in Iceland — and the church's answer to it is Paul's own:
 * the grafted branch does not carry the root; the root carries the
 * branch. Covenant teaching (IsraelFoundation) says what God promised;
 * this section says what that demands of us now.
 *
 * Tone: sober, unflinching, zero kitsch. One photograph (olive branch
 * at dusk — the Romans 11 image itself), one short verse clause, one
 * plain declaration. Dark register between two vellum sections so the
 * page breathes dark→light→dark like the rest of the site.
 */

export default function IsraelRoot() {
    return (
        <section
            id="rotin"
            style={{
                position: 'relative',
                background: 'var(--nott)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                overflow: 'hidden',
                scrollMarginTop: '88px',
            }}
        >
            {/* Olive branch — fades in from the right, melts into the night bg.
                The Romans 11 metaphor, photographed: branches in dusk light. */}
            <div
                className="israel-root-photo"
                aria-hidden
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '52%',
                    backgroundImage: 'url(/images/israel/olive-branch.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center right',
                    opacity: 0.5,
                    maskImage:
                        'linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 96%)',
                    WebkitMaskImage:
                        'linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 96%)',
                }}
            />
            {/* extra floor shadow so text never fights the leaves */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(to bottom, rgba(20,18,15,0.2) 0%, transparent 30%, transparent 60%, rgba(20,18,15,0.85) 100%)',
                    pointerEvents: 'none',
                }}
            />

            <style>{`@media (max-width: 860px) { .israel-root-photo { width: 100%; opacity: 0.22; mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 40%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 40%); } }`}</style>

            <div
                style={{
                    position: 'relative',
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding:
                        'clamp(72px, 9vw, 128px) var(--rail-padding) clamp(80px, 10vw, 140px)',
                }}
            >
                <div style={{ maxWidth: '46rem' }}>
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--nordurljos)',
                            marginBottom: '22px',
                        }}
                    >
                        Rómverjabréfið 11
                    </div>

                    <h2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 400,
                            fontSize: 'clamp(34px, 4.2vw, 56px)',
                            lineHeight: 1.08,
                            color: 'var(--ljos)',
                            textWrap: 'balance',
                        }}
                    >
                        Rótin ber þig.
                    </h2>

                    {/* Verse clause — short, attributed, gold-ruled like the
                        Foundation quote so the two sections rhyme. */}
                    <blockquote
                        style={{
                            margin: 'clamp(32px, 4vw, 44px) 0 0',
                            padding: '4px 0 4px 22px',
                            borderLeft: '2px solid var(--gull)',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(20px, 2vw, 26px)',
                                lineHeight: 1.45,
                                color: 'var(--ljos)',
                            }}
                        >
                            „Þú berð ekki rótina, heldur ber rótin þig.“
                        </p>
                        <footer
                            style={{
                                marginTop: '12px',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: 'var(--steinn)',
                            }}
                        >
                            Rómverjabréfið 11:18
                        </footer>
                    </blockquote>

                    <div
                        style={{
                            marginTop: 'clamp(36px, 4.5vw, 52px)',
                            display: 'grid',
                            gap: '1.4em',
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(16.5px, 1.35vw, 19px)',
                            lineHeight: 1.75,
                            color: 'var(--moskva)',
                            maxWidth: '40rem',
                        }}
                    >
                        <p style={{ margin: 0 }}>
                            Kirkjan á Íslandi stendur ekki ein og sér. Hún er
                            villigrein, grædd inn á miklu eldra tré. Fagnaðarerindið
                            barst okkur frá Jerúsalem, í gegnum Ísrael — Ritningin,
                            spámennirnir, postularnir og Jesús sjálfur. Trú okkar á
                            sér gyðinglega rót, og sú rót ber okkur enn.
                        </p>
                        <p style={{ margin: 0 }}>
                            Andúð á Gyðingum hefur fylgt sögu kirkjunnar eins og
                            skuggi — og hún er ekki liðin tíð. Hún birtist líka hér á
                            landi: í orðum, í hálfkveðnum vísum, í þögn. Páll postuli
                            svarar henni beint. Greinin stærir sig ekki gegn rótinni
                            sem heldur henni uppi.
                        </p>
                    </div>

                    {/* The declaration — the one sentence this section exists for. */}
                    <div
                        style={{
                            marginTop: 'clamp(44px, 5.5vw, 64px)',
                            paddingTop: 'clamp(28px, 3.5vw, 40px)',
                            borderTop: '1px solid rgba(200,138,62,0.3)',
                            maxWidth: '40rem',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(22px, 2.4vw, 30px)',
                                lineHeight: 1.4,
                                color: 'var(--ljos)',
                                textWrap: 'balance',
                            }}
                        >
                            Andúð á Gyðingum á sér ekkert skjól í kristinni trú.
                        </p>
                        <p
                            style={{
                                margin: '18px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(15.5px, 1.25vw, 17.5px)',
                                lineHeight: 1.7,
                                color: 'var(--steinn)',
                                maxWidth: '36rem',
                            }}
                        >
                            Að standa með Gyðingum er ekki flokkspólitík heldur
                            þakklæti — og varðstaða. Varðmaður þegir ekki þegar hatri
                            er hvíslað.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
