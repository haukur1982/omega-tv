/**
 * OtherWays — small, quiet ways to give beyond the form.
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
                maxWidth: '80rem',
                margin: '0 auto',
                padding: 'clamp(48px, 6vw, 64px) var(--rail-padding)',
                borderTop: '1px solid var(--border)',
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--moskva)',
                    marginBottom: '24px',
                }}
            >
                Aðrar leiðir
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 'clamp(24px, 4vw, 32px)',
                    marginBottom: '56px',
                }}
            >
                {ROWS.map((r) => (
                    <div key={r.title}>
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: '22px',
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {r.title}
                        </h3>
                        <p
                            style={{
                                margin: '12px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '15px',
                                color: 'var(--moskva)',
                                lineHeight: 1.55,
                                textWrap: 'pretty',
                            }}
                        >
                            {r.body}
                        </p>
                    </div>
                ))}
            </div>

            {/* Bank transfer block — explicit, typographic, not a form field.
                Kept here so the page isn't a dead end for people who want
                to give via millifærsla directly. */}
            <div
                style={{
                    paddingTop: '32px',
                    borderTop: '1px solid var(--border)',
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
                            color: 'var(--moskva)',
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
                            color: 'var(--moskva)',
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
                            color: 'var(--steinn)',
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
                            color: 'var(--ljos)',
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
                            color: 'var(--steinn)',
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
                            color: 'var(--ljos)',
                            letterSpacing: '0.02em',
                        }}
                    >
                        630890-1019
                    </div>
                </div>
            </div>
        </section>
    );
}
