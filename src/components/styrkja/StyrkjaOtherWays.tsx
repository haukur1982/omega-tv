/**
 * OtherWays — quiet alternative paths to give, cream register.
 *
 * Arfleifð (legacy giving), Fyrirtæki (corporate support),
 * Tækjabúnaður (equipment gifts). Plus the bank transfer details
 * so Millifærsla isn't a dead-end if someone prefers it over the
 * form flow above.
 */

const ROWS = [
    {
        title: 'Arfleifð',
        body: 'Omega má tilgreina í erfðaskrá. Við höfum starfsfólk sem aðstoðar við þann umgang með hlýju og algerri trúnaði.',
    },
    {
        title: 'Fyrirtæki',
        body: 'Mánaðarlegur stuðningur frá fyrirtækjum skiptir okkur miklu — án þess að birtar séu auglýsingar í staðinn. Við ræðum form sem hentar.',
    },
    {
        title: 'Tækjabúnaður',
        body: 'Myndavélar, hljóðnemar, ljós — sérhver gjöf sem er í lagi er vel þegin og kemur strax í gagnið.',
    },
];

export default function StyrkjaOtherWays() {
    return (
        <section
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
                borderTop: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(56px, 7vw, 80px) var(--rail-padding)',
                }}
            >
                <div
                    aria-hidden
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        marginBottom: '28px',
                    }}
                >
                    <span style={{ width: '32px', height: '1px', background: 'var(--gull)' }} />
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                        <circle cx="5" cy="5" r="2" fill="var(--gull)" />
                    </svg>
                    <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
                </div>
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--gull)',
                        marginBottom: '14px',
                    }}
                >
                    Aðrar leiðir
                </div>
                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(28px, 3.2vw, 40px)',
                        lineHeight: 1.1,
                        fontWeight: 400,
                        color: 'var(--skra-djup)',
                        letterSpacing: '-0.005em',
                        marginBottom: 'clamp(36px, 4vw, 48px)',
                    }}
                >
                    Annað en formið.
                </h2>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 'clamp(28px, 4vw, 40px)',
                        marginBottom: '56px',
                    }}
                >
                    {ROWS.map((r) => (
                        <div key={r.title}>
                            <h3
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '24px',
                                    fontWeight: 400,
                                    color: 'var(--skra-djup)',
                                    letterSpacing: '-0.005em',
                                }}
                            >
                                {r.title}
                            </h3>
                            <p
                                style={{
                                    margin: '14px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '15.5px',
                                    color: 'var(--skra-mjuk)',
                                    lineHeight: 1.6,
                                    textWrap: 'pretty',
                                }}
                            >
                                {r.body}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bank transfer block — typographic, on a pergament card */}
                <div
                    style={{
                        padding: 'clamp(28px, 3vw, 36px)',
                        background: 'var(--skra-warm)',
                        border: '1px solid rgba(63,47,35,0.14)',
                        borderRadius: 'var(--radius-md)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 'clamp(24px, 4vw, 40px)',
                        alignItems: 'baseline',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--gull)',
                                marginBottom: '10px',
                            }}
                        >
                            Millifærsla
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '15px',
                                color: 'var(--skra-mjuk)',
                                lineHeight: 1.55,
                            }}
                        >
                            Beinn stuðningur án forms — vel þeginn og lítið gegnumstreymi.
                        </p>
                    </div>
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '10px',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'var(--skra-mjuk)',
                                fontWeight: 600,
                                marginBottom: '4px',
                            }}
                        >
                            Reikningsnúmer
                        </div>
                        <div
                            className="select-all"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontVariantNumeric: 'tabular-nums',
                                fontSize: '18px',
                                fontWeight: 600,
                                color: 'var(--skra-djup)',
                                letterSpacing: '0.02em',
                            }}
                        >
                            0113-26-25707
                        </div>
                    </div>
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '10px',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'var(--skra-mjuk)',
                                fontWeight: 600,
                                marginBottom: '4px',
                            }}
                        >
                            Kennitala
                        </div>
                        <div
                            className="select-all"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontVariantNumeric: 'tabular-nums',
                                fontSize: '18px',
                                fontWeight: 600,
                                color: 'var(--skra-djup)',
                                letterSpacing: '0.02em',
                            }}
                        >
                            630890-1019
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
