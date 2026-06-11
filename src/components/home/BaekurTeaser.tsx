import Link from "next/link";

/**
 * BaekurTeaser — quiet dark band announcing the book ministry on /heim.
 *
 * Sibling of IsraelTeaser: kicker, italic title, one line, ghost link —
 * plus the one thing a book band earns: the cover itself, small and
 * physical, standing at the left like a spine on a shelf. Not a sales
 * pitch; "a new chapter exists, enter when ready."
 */

export default function BaekurTeaser() {
    return (
        <section
            style={{
                background: 'var(--nott)',
                borderBottom: '1px solid var(--border)',
                padding: 'clamp(56px, 7vw, 80px) var(--rail-padding)',
            }}
        >
            <div
                className="baekur-teaser-grid"
                style={{
                    maxWidth: '64rem',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                    gap: 'clamp(28px, 4vw, 56px)',
                    alignItems: 'center',
                }}
            >
                <style>{`@media (max-width: 720px) { .baekur-teaser-grid { grid-template-columns: 1fr !important; text-align: center; } .baekur-teaser-grid img { margin: 0 auto; } .baekur-teaser-grid a { justify-self: center; } }`}</style>

                {/* the cover, small and physical */}
                <Link href="/baekur" aria-label="Bækur frá Omega">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/baekur/90-minutur-a-himnum-cover.jpg"
                        alt="90 mínútur á himnum — bókarkápa"
                        style={{
                            display: 'block',
                            width: 'clamp(88px, 9vw, 116px)',
                            borderRadius: '2px 5px 5px 2px',
                            boxShadow: '0 14px 36px rgba(0,0,0,0.55), -3px 0 8px rgba(0,0,0,0.25)',
                        }}
                    />
                </Link>

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
                        Nýtt · Bækur frá Omega
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
                        Rödd til þjóðarinnar — nú einnig á bók.
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
                        Fyrsta bókin er komin út: 90 mínútur á himnum eftir Don Piper.
                        Skráðu þig sem bókavin og fáðu hana senda heim.
                    </p>
                </div>

                <Link
                    href="/baekur"
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
                    Skoða bókina →
                </Link>
            </div>
        </section>
    );
}
