import Link from "next/link";
import type { ScheduleSlot } from "@/lib/schedule-db";

/**
 * IsraelMasthead — opens the /israel section.
 *
 * Voice: Isaiah 62:6 — "I have set watchmen on your walls." Standing
 * with Israel as prayer, not politics; biblical covenant, not partisan
 * posture.
 *
 * Composition: editorial cover pattern (kicker / title / italic
 * statement of purpose / gold rule / byline). Right-side epigraph
 * carries the verse in full.
 *
 * Texture: a quiet dawn-light radial in the upper-right and a small
 * gold ornament between the masthead body and the schedule ribbon —
 * adds gravity without going to photographic backgrounds.
 *
 * Schedule ribbon: when a next Israel broadcast exists, a thin row
 * pinned to the bottom of the masthead surfaces it. Single-line,
 * one slot only — the full schedule lives at /live. This embeds the
 * "what's airing" signal IN the masthead so we don't need a separate
 * dark broadcast band immediately below (which clashed visually).
 */

interface Props {
    nextSlot?: ScheduleSlot | null;
}

export default function IsraelMasthead({ nextSlot }: Props) {
    return (
        <section
            className="article-cover"
            style={{
                position: 'relative',
                background: 'var(--nott)',
                overflow: 'hidden',
                paddingTop: 'clamp(124px, 11vw, 164px)',
                paddingBottom: 0,
                borderBottom: '1px solid var(--border)',
            }}
        >
            {/* Dawn light — quiet warmth in the upper-right. Stays well
                below the typography weight; just adds breath. */}
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
                style={{
                    position: 'relative',
                    paddingLeft: 'var(--rail-padding)',
                    paddingRight: 'var(--rail-padding)',
                    paddingBottom: 'clamp(56px, 7vw, 88px)',
                }}
            >
                <div
                    className="article-cover-shell baenatorg-cover-grid"
                    style={{
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
                            Ísrael
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
                                maxWidth: '14ch',
                            }}
                        >
                            Varðmenn á múrum.
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
                            Að standa með Ísrael er bæn, ekki stjórnmál. Hér safnar Omega saman Ritningunni, fræðslu og umfjöllun um þjóðina sem Drottinn kallar sína.
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
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '14px',
                                flexWrap: 'wrap',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11.5px',
                                color: 'var(--steinn)',
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '17px',
                                    color: 'var(--ljos)',
                                    letterSpacing: 0,
                                    textTransform: 'none',
                                    fontWeight: 400,
                                }}
                            >
                                Varðmenn á múra þína, Jerúsalem
                            </span>
                            <span style={{ opacity: 0.5 }}>·</span>
                            <span>Jesaja 62:6</span>
                        </div>
                    </div>

                    {/* Right-side epigraph — full verse */}
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
                            Ég setti varðmenn á múra þína, Jerúsalem, þeir mega aldrei þagna, hvorki dag né nótt.
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
                            Jesaja 62:6
                        </div>
                    </aside>
                </div>

                {/* Ornamental flourish — quiet centered gold mark
                    between the masthead body and the broadcast ribbon.
                    Visible only when the ribbon is present, otherwise
                    the masthead body padding-bottom carries the close. */}
                {nextSlot && (
                    <div
                        aria-hidden
                        style={{
                            maxWidth: '80rem',
                            margin: 'clamp(40px, 5vw, 56px) auto 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '14px',
                        }}
                    >
                        <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.22)' }} />
                        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden style={{ flexShrink: 0 }}>
                            <path
                                d="M7 1L8.2 5.8L13 7L8.2 8.2L7 13L5.8 8.2L1 7L5.8 5.8L7 1Z"
                                fill="var(--gull)"
                                opacity="0.6"
                            />
                        </svg>
                        <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.22)' }} />
                    </div>
                )}
            </div>

            {/* Schedule ribbon — embedded in the masthead, NOT a
                separate dark section below. Solves the dark→dark
                clash by keeping schedule signal inside the header. */}
            {nextSlot && <ScheduleRibbon slot={nextSlot} />}
        </section>
    );
}

function ScheduleRibbon({ slot }: { slot: ScheduleSlot }) {
    const starts = new Date(slot.starts_at);
    const date = starts.toLocaleDateString('is-IS', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    const time = starts.toLocaleTimeString('is-IS', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    const cap = date.charAt(0).toUpperCase() + date.slice(1);

    return (
        <div
            style={{
                position: 'relative',
                borderTop: '1px solid rgba(200,138,62,0.18)',
                background: 'rgba(20,18,15,0.55)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(18px, 2vw, 24px) var(--rail-padding)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '14px',
                        flexWrap: 'wrap',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--kerti)',
                        }}
                    >
                        Næsta sending
                    </span>
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '17px',
                            color: 'var(--ljos)',
                            letterSpacing: '-0.005em',
                        }}
                    >
                        {slot.program_title}
                    </span>
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '14.5px',
                            color: 'var(--moskva)',
                        }}
                    >
                        {cap} · kl. {time}
                    </span>
                </div>
                <Link
                    href="/live"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--nordurljos)',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Sjá dagskrá →
                </Link>
            </div>
        </div>
    );
}
