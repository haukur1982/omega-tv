import Link from "next/link";

/**
 * HeroV2 — full-bleed broadcast-grandeur hero for the Heim redesign.
 *
 * Static brand moment: "Við biðjum fyrir Íslandi á hverjum degi."
 * This is the institution speaking, not this week's content. The
 * dynamic featured-week system is preserved elsewhere (it'll move to
 * a dedicated featured section in a future pass, or to a /dagskra
 * landing). The homepage hero's job is brand presence, not
 * content rotation.
 *
 * Composition per the Heim prototype:
 *   - Warm cinematic photo (55% opacity) + warm-black gradient stack
 *   - Small amber kicker: "Kristileg sjónvarpsstöð á Íslandi · 34 ár"
 *   - Fraunces display headline with italic Newsreader color-swap
 *     on "á hverjum degi." — the one amber typographic moment
 *   - Italic subtitle in Newsreader
 *   - Two CTAs: amber "Horfa beint" + ghost "Sjá dagskrá"
 */

export default function HeroV2() {
    return (
        <section
            style={{
                position: 'relative',
                width: '100%',
                minHeight: 'min(94vh, 880px)',
                overflow: 'hidden',
                background: 'var(--nott)',
            }}
        >
            {/* Photograph layer + warm-black gradient stack.
                Stack is intentional: darken at top so the navbar floats
                cleanly, lighter mid, darker again at bottom so the copy
                reads against the image, final fade to --mold so the
                section below doesn't hard-cut. */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2400&auto=format&fit=crop"
                    alt=""
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.55,
                        filter: 'saturate(0.75) contrast(1.05)',
                    }}
                />
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to bottom, rgba(20,18,15,0.55) 0%, rgba(20,18,15,0.35) 35%, rgba(20,18,15,0.78) 82%, var(--mold) 100%)',
                    }}
                />
                {/* Kerti-tinted warmth in the upper-right — the one warm
                    glow that makes the hero feel like evening light,
                    not just a dark image. */}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(ellipse at 78% 18%, rgba(233,168,96,0.14) 0%, transparent 55%)',
                    }}
                />
            </div>

            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(160px, 18vw, 200px) var(--rail-padding) clamp(80px, 10vw, 120px)',
                    minHeight: 'min(94vh, 880px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }}
            >
                {/* Pill kicker */}
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '7px 13px',
                        background: 'rgba(20,18,15,0.5)',
                        border: '1px solid rgba(246,242,234,0.18)',
                        borderRadius: '999px',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        marginBottom: '30px',
                        alignSelf: 'flex-start',
                    }}
                >
                    <span
                        aria-hidden
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--kerti)' }}
                    />
                    <span
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--ljos)',
                        }}
                    >
                        Kristileg sjónvarpsstöð á Íslandi · 34 ár
                    </span>
                </div>

                <h1
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(60px, 9.2vw, 144px)',
                        lineHeight: 0.94,
                        letterSpacing: '-0.032em',
                        fontWeight: 300,
                        color: 'var(--ljos)',
                        textWrap: 'balance',
                        maxWidth: '1200px',
                    }}
                >
                    Við biðjum fyrir Íslandi<br />
                    <span
                        style={{
                            fontStyle: 'italic',
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 400,
                            color: 'var(--kerti)',
                        }}
                    >
                        á hverjum degi.
                    </span>
                </h1>

                <p
                    style={{
                        margin: '36px 0 0',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(19px, 1.55vw, 24px)',
                        color: 'var(--ljos)',
                        opacity: 0.88,
                        maxWidth: '680px',
                        lineHeight: 1.5,
                        textWrap: 'pretty',
                    }}
                >
                    Orð Guðs, lofgjörð og bæn — send inn á heimili Íslendinga, allan sólarhringinn, án auglýsinga.
                </p>

                <div style={{ marginTop: '48px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <Link
                        href="/live"
                        className="warm-hover"
                        style={{
                            padding: '18px 28px',
                            background: 'var(--kerti)',
                            border: '1px solid var(--kerti)',
                            color: 'var(--nott)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            borderRadius: 'var(--radius-xs)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M6 4.5v15l13-7.5-13-7.5z" />
                        </svg>
                        Horfa í beinni
                    </Link>
                    <Link
                        href="#dagskra"
                        className="ghost-btn"
                        style={{
                            padding: '18px 26px',
                            background: 'transparent',
                            border: '1px solid rgba(246,242,234,0.25)',
                            color: 'var(--ljos)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            borderRadius: 'var(--radius-xs)',
                            textDecoration: 'none',
                        }}
                    >
                        Sjá dagskrá
                    </Link>
                </div>
            </div>
        </section>
    );
}
