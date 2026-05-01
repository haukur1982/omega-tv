import Link from "next/link";

/**
 * IsraelPrayerCall — Psalm 122:6 closing call.
 *
 * Anchors the section in prayer, not politics. Same theological
 * content as the old PrayerCall. What changed:
 *
 *   - Tokens (no hardcoded #D4AF37 / #FFFFFF / #050505)
 *   - CTA matches the rest of the site (--kerti amber, no
 *     translateY hover that doesn't fit the static editorial tone)
 *   - Composition uses the same kicker + serif title rhythm as the
 *     other Israel sections, so the closing reads as continuation,
 *     not a separate "you might also be interested in" CTA card
 */

export default function IsraelPrayerCall() {
    return (
        <section
            id="baen"
            style={{
                background: 'var(--nott)',
                borderTop: '1px solid var(--border)',
            }}
        >
            <div
                style={{
                    maxWidth: '46rem',
                    margin: '0 auto',
                    padding: 'clamp(80px, 11vw, 128px) var(--rail-padding) clamp(80px, 11vw, 128px)',
                    textAlign: 'center',
                }}
            >
                {/* Centered ornamental opener — gold mark with hairlines
                    flanking it. Closes the section flow with weight. */}
                <div
                    aria-hidden
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '14px',
                        marginBottom: '32px',
                    }}
                >
                    <span style={{ width: '48px', height: '1px', background: 'rgba(200,138,62,0.35)' }} />
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                        <path
                            d="M7 1L8.2 5.8L13 7L8.2 8.2L7 13L5.8 8.2L1 7L5.8 5.8L7 1Z"
                            fill="var(--gull)"
                            opacity="0.7"
                        />
                    </svg>
                    <span style={{ width: '48px', height: '1px', background: 'rgba(200,138,62,0.35)' }} />
                </div>

                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--gull)',
                        marginBottom: '18px',
                    }}
                >
                    Sálmur 122:6
                </div>

                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(34px, 4.5vw, 56px)',
                        lineHeight: 1.08,
                        fontWeight: 400,
                        color: 'var(--ljos)',
                        letterSpacing: '-0.01em',
                        marginBottom: '28px',
                        fontStyle: 'italic',
                        textWrap: 'balance',
                    }}
                >
                    „Biðjið um frið fyrir Jerúsalem.“
                </h2>

                <p
                    style={{
                        margin: '0 0 40px',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(17px, 1.6vw, 20px)',
                        lineHeight: 1.6,
                        color: 'var(--moskva)',
                        textWrap: 'pretty',
                    }}
                >
                    Omega trúir á mátt bænarinnar. Við stöndum með Ísrael og biðjum fyrir friði, vakningu og velferð þjóðarinnar. Þú mátt taka undir með okkur — á Bænatorginu er pláss fyrir bæn þína.
                </p>

                <Link
                    href="/baenatorg"
                    className="warm-hover"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '15px 28px',
                        background: 'var(--kerti)',
                        color: 'var(--nott)',
                        border: '1px solid var(--kerti)',
                        borderRadius: 'var(--radius-xs)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                    }}
                >
                    Senda bæn fyrir Ísrael
                </Link>
            </div>
        </section>
    );
}
