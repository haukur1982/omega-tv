/**
 * SermonsMasthead — opens the /sermons (Þáttasafn) page.
 *
 * Same article-cover pattern proven on /israel and /baenatorg.
 * Editorial restraint: typography only, no Netflix-style billboard.
 *
 * The library is the soul of the network. The masthead frames it as
 * "everything we've broadcast" — donor-stewardship-evidence, not
 * a streaming-service homescreen.
 */

export default function SermonsMasthead() {
    return (
        <section
            className="article-cover"
            style={{
                position: 'relative',
                background: 'var(--nott)',
                overflow: 'hidden',
                padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(56px, 7vw, 88px)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            {/* Quiet warmth in the upper-right — same dawn radial as
                Israel masthead. Adds breath without going to photos. */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(ellipse at 82% 18%, rgba(233,168,96,0.10) 0%, transparent 55%)',
                    pointerEvents: 'none',
                }}
            />

            <div
                className="article-cover-shell baenatorg-cover-grid"
                style={{
                    position: 'relative',
                    maxWidth: '80rem',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 48rem) 1fr',
                    gap: 'clamp(48px, 6vw, 96px)',
                    alignItems: 'end',
                }}
            >
                <div className="article-cover-copy">
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--nordurljos)',
                            marginBottom: '24px',
                        }}
                    >
                        Þáttasafn
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(40px, 5vw, 70px)',
                            lineHeight: 1.04,
                            letterSpacing: 0,
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            textWrap: 'balance',
                            maxWidth: '15ch',
                        }}
                    >
                        Allt sem hefur birst.
                    </h1>

                    <p
                        style={{
                            margin: '28px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(20px, 1.8vw, 25px)',
                            lineHeight: 1.48,
                            color: 'var(--moskva)',
                            letterSpacing: 0,
                            textWrap: 'pretty',
                            maxWidth: '36rem',
                        }}
                    >
                        Sunnudagssamkomur, bænakvöld, viðtöl, samkomur frá söfnuðum landsins, þættir frá útlöndum, heimildarmyndir og barnaefni — safnið vex hverja viku.
                    </p>

                    <div
                        aria-hidden
                        style={{
                            width: '52px',
                            height: '1px',
                            background: 'var(--gull)',
                            margin: '34px 0 20px',
                        }}
                    />

                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11.5px',
                            color: 'var(--steinn)',
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        Á Omega Stöðinni síðan 1992
                    </div>
                </div>

                {/* Right-side epigraph — quiet ministry framing */}
                <aside
                    className="baenatorg-epigraph"
                    style={{
                        textAlign: 'right',
                        color: 'var(--moskva)',
                        maxWidth: '28rem',
                        justifySelf: 'end',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '19px',
                            lineHeight: 1.5,
                            color: 'var(--moskva)',
                            letterSpacing: 0,
                            textWrap: 'pretty',
                        }}
                    >
                        Trú kemur við að heyra, og að heyra fyrir orð Krists.
                    </p>
                    <div
                        style={{
                            marginTop: '14px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--steinn)',
                        }}
                    >
                        Rómverjabréfið 10:17
                    </div>
                </aside>
            </div>
        </section>
    );
}
