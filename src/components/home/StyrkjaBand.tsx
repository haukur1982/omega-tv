import Link from "next/link";

/**
 * StyrkjaBand — editorial donation band, one line, one button.
 *
 * Replaces the earlier Styrkja ribbon with the prototype's
 * amber-gradient band. Kicker → editorial headline → italic
 * supporting line → single amber CTA. This is the only place on
 * the homepage where the donation ask lives — per the brand
 * rule ("not a store"), there's no repeat CTA in the footer
 * area or between sections.
 */

export default function StyrkjaBand() {
    return (
        <section
            style={{
                borderTop: '1px solid var(--border)',
                background:
                    'linear-gradient(to right, var(--torfa) 0%, color-mix(in oklab, var(--kerti) 6%, var(--torfa)) 100%)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(60px, 8vw, 80px) var(--rail-padding)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) auto',
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
                            color: 'var(--kerti)',
                            marginBottom: '18px',
                        }}
                    >
                        Styrkja
                    </div>
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(28px, 3vw, 40px)',
                            lineHeight: 1.2,
                            letterSpacing: '-0.012em',
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            maxWidth: '720px',
                            textWrap: 'balance',
                        }}
                    >
                        Omega lifir af þeim sem sá í hana — og uppsker með Drottni.
                    </h2>
                    <p
                        style={{
                            margin: '18px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '17px',
                            color: 'var(--moskva)',
                            maxWidth: '620px',
                            lineHeight: 1.55,
                        }}
                    >
                        Engar auglýsingar. Engin áskrift. Aðeins hendur sem halda merkinu uppi.
                    </p>
                </div>

                <Link
                    href="/give"
                    className="warm-hover"
                    style={{
                        padding: '20px 32px',
                        background: 'var(--kerti)',
                        border: '1px solid var(--kerti)',
                        color: 'var(--nott)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius-xs)',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Styðja Omega
                </Link>
            </div>
        </section>
    );
}
