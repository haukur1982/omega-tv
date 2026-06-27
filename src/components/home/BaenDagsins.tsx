import Link from "next/link";

/**
 * BaenDagsins — "Prayer of the day" — the contemplative center of
 * the homepage.
 *
 * Composition (cream register): single centered column, like a page
 * from a psalter or prayer book. Ornament + kicker line + italic
 * prayer body + meta + link, all stacked vertically and centered.
 *
 * The earlier two-column layout (date on left, body on right) split
 * the prayer from its identity; the manuscript-page composition
 * keeps everything as one moment. Drop cap is smaller and integrated
 * into the body as a textural marker, not a logo.
 *
 * TODO: wire to a `featured_prayers` table so this rotates daily.
 */

export interface DailyPrayer {
    date: string;
    body: string;
    scripture: string | null;
    author: string;
}

interface Props {
    register?: 'dark' | 'cream';
    /** Today's prayer from featured_prayers. Falls back to the constant below. */
    prayer?: DailyPrayer;
}

// Fallback only — used if featured_prayers is empty/unreachable so the slot
// never renders blank. The live prayer comes from the `prayer` prop.
const TODAY_PRAYER: DailyPrayer = {
    date: '',
    body: 'Drottinn, kenn mér að þekkja rödd þína í dag, í hávaðanum og í kyrrðinni. Lát mig ekki flýta mér fram úr þér, heldur ganga við hlið þér.',
    scripture: 'Sálmur 95:7-8',
    author: 'borið fram af Omega',
};

export default function BaenDagsins({ register = 'dark', prayer }: Props) {
    const isCream = register === 'cream';
    const p = prayer ?? TODAY_PRAYER;

    const tokens = isCream
        ? {
            bg: 'var(--skra)',
            kickerColor: 'var(--gull)',
            metaSecondaryColor: 'var(--skra-mjuk)',
            bodyColor: 'var(--skra-djup)',
            scriptureColor: 'var(--skra-djup)',
            authorColor: 'var(--skra-mjuk)',
            linkColor: 'var(--skra-djup)',
            dropCapColor: 'var(--gull)',
            ornamentColor: 'var(--gull)',
            ornamentRule: 'rgba(200,138,62,0.22)',
            divider: 'rgba(63,47,35,0.12)',
        }
        : {
            bg: 'transparent',
            kickerColor: 'var(--moskva)',
            metaSecondaryColor: 'var(--steinn)',
            bodyColor: 'var(--ljos)',
            scriptureColor: 'var(--ljos)',
            authorColor: 'var(--moskva)',
            linkColor: 'var(--nordurljos)',
            dropCapColor: 'var(--kerti)',
            ornamentColor: 'var(--kerti)',
            ornamentRule: 'rgba(233,168,96,0.22)',
            divider: 'var(--border)',
        };

    const firstLetter = p.body.charAt(0);
    const restOfBody = p.body.slice(1);

    return (
        <section
            style={{
                background: tokens.bg,
            }}
        >
            <div
                style={{
                    maxWidth: '40rem',
                    margin: '0 auto',
                    padding: 'clamp(64px, 8vw, 96px) var(--rail-padding)',
                    textAlign: 'center',
                }}
            >
                {/* Ornamental opener — gold rule + small mark + gold rule.
                    Sits directly above the kicker, tight to the content.
                    Restrained: width matches the kicker line below it. */}
                <div
                    aria-hidden
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '14px',
                        marginBottom: '24px',
                        maxWidth: '20rem',
                        marginInline: 'auto',
                    }}
                >
                    <span style={{ flex: 1, height: '1px', background: tokens.ornamentRule }} />
                    <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden>
                        <circle cx="4.5" cy="4.5" r="2" fill={tokens.ornamentColor} opacity="0.7" />
                    </svg>
                    <span style={{ flex: 1, height: '1px', background: tokens.ornamentRule }} />
                </div>

                {/* Kicker + date combined as one small-caps line */}
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: tokens.kickerColor,
                        marginBottom: 'clamp(28px, 4vw, 40px)',
                    }}
                >
                    Bæn dagsins
                    {p.date && (
                        <>
                            <span style={{ color: tokens.metaSecondaryColor, opacity: 0.6, padding: '0 10px' }}>·</span>
                            <span style={{ color: tokens.metaSecondaryColor, fontWeight: 600 }}>
                                {p.date}
                            </span>
                        </>
                    )}
                </div>

                {/* The prayer body — italic, centered, integrated drop cap.
                    Drop cap is "first letter only" floated, sized at ~2.5
                    line-heights so it integrates into the paragraph flow
                    rather than dominating it. */}
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(22px, 2.4vw, 30px)',
                        lineHeight: 1.5,
                        color: tokens.bodyColor,
                        letterSpacing: '-0.008em',
                        textWrap: 'pretty',
                        textAlign: 'left',
                    }}
                >
                    <span
                        aria-hidden
                        style={{
                            float: 'left',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'normal',
                            fontSize: 'clamp(46px, 5vw, 62px)',
                            lineHeight: 0.85,
                            fontWeight: 400,
                            color: tokens.dropCapColor,
                            opacity: 0.85,
                            marginRight: '12px',
                            marginTop: '4px',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {firstLetter}
                    </span>
                    {restOfBody}
                </p>

                {/* Hairline divider before the meta line */}
                <div
                    aria-hidden
                    style={{
                        width: '40px',
                        height: '1px',
                        background: tokens.ornamentRule,
                        margin: 'clamp(32px, 4vw, 44px) auto clamp(20px, 2.5vw, 28px)',
                    }}
                />

                {/* Meta line — scripture · author, centered small caps */}
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: tokens.metaSecondaryColor,
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: '14px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}
                >
                    {p.scripture && (
                        <>
                            <span style={{ color: tokens.scriptureColor, fontWeight: 700 }}>
                                {p.scripture}
                            </span>
                            <span style={{ opacity: 0.5 }}>·</span>
                        </>
                    )}
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '14px',
                            color: tokens.authorColor,
                            letterSpacing: 0,
                            textTransform: 'none',
                            fontWeight: 400,
                        }}
                    >
                        {p.author}
                    </span>
                </div>

                {/* Quiet link below — separated, not crowded */}
                <div style={{ marginTop: 'clamp(28px, 3.5vw, 36px)' }}>
                    <Link
                        href="/baenatorg"
                        style={{
                            color: tokens.linkColor,
                            textDecoration: 'none',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderBottom: isCream ? `1px solid ${tokens.ornamentColor}` : 'none',
                            paddingBottom: isCream ? '2px' : 0,
                        }}
                    >
                        Fara á Bænatorg →
                    </Link>
                </div>
            </div>
        </section>
    );
}
