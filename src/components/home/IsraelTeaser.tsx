import Link from "next/link";

/**
 * IsraelTeaser — quiet dark band between the cream sanctuary and
 * the closing donor anchor on /heim.
 *
 * Acknowledges the /israel section without making it loud. Single
 * line treatment: kicker, italic title, slate "→" link. The
 * donor-stewardship reading: "we built this. it's here. enter when
 * ready." Not a CTA-heavy sales pitch.
 *
 * Lives between the cream PullQuote and the dark StyrkjaBand —
 * acts as the transition from "here's what we publish" to "here's
 * who funds it."
 */

export default function IsraelTeaser() {
    return (
        <section
            style={{
                background: 'var(--nott)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                padding: 'clamp(56px, 7vw, 80px) var(--rail-padding)',
            }}
        >
            <div
                style={{
                    maxWidth: '64rem',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: 'clamp(24px, 4vw, 48px)',
                    alignItems: 'center',
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
                            marginBottom: '16px',
                        }}
                    >
                        Ísrael
                    </div>
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(28px, 3.4vw, 44px)',
                            lineHeight: 1.08,
                            fontWeight: 400,
                            fontStyle: 'italic',
                            color: 'var(--ljos)',
                            letterSpacing: '-0.005em',
                            textWrap: 'balance',
                        }}
                    >
                        Varðmenn á múrum.
                    </h2>
                    <p
                        style={{
                            margin: '18px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '17px',
                            lineHeight: 1.55,
                            color: 'var(--moskva)',
                            maxWidth: '36rem',
                        }}
                    >
                        Sáttmálinn, fræðslan, og útsendingarnar á Omega — sem varðmaður á múrnum, í bæn ekki stjórnmálum.
                    </p>
                </div>

                <Link
                    href="/israel"
                    className="ghost-btn"
                    style={{
                        padding: '14px 24px',
                        background: 'transparent',
                        border: '1px solid rgba(246,242,234,0.25)',
                        color: 'var(--ljos)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius-xs)',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Sjá fræðsluna →
                </Link>
            </div>
        </section>
    );
}
