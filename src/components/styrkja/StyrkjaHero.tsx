/**
 * StyrkjaHero — cathedral-masthead pattern for /give.
 *
 * Article-cover composition matching every other page on the site:
 * kicker / serif title / italic deck / gold rule / byline-row. Frames
 * the donation form below, in the same editorial register that runs
 * across /baenatorg, /israel, /sermons, /greinar, /namskeid,
 * /vitnisburdur, /about — so /give doesn't read as a different site.
 */

export default function StyrkjaHero() {
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
            {/* Dawn radial — quiet warmth in the upper-right, matches
                the rest of the site's masthead atmosphere. */}
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
                className="article-cover-shell"
                style={{
                    position: 'relative',
                    maxWidth: '80rem',
                    margin: '0 auto',
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
                        Styrkja
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
                            maxWidth: '20ch',
                        }}
                    >
                        Omega lifir af þeim sem kunna að meta hana.
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
                        Engar auglýsingar. Engin áskrift. Aðeins sú einfalda samþykkt að þetta skipti máli — og að við berum það saman.
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
                        Stuðningur þinn er reksturinn — ekki rentur, heldur sáning
                    </div>
                </div>
            </div>
        </section>
    );
}
