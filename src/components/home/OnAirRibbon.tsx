import Link from "next/link";
import { getCurrentAndNext, formatClockUtc } from "@/lib/schedule-db";

/**
 * OnAirRibbon — quiet full-width row directly under the hero.
 *
 * Shows the current program when live (BEINT dot pulsing), or the
 * next program when off-air (nordurljos dot, static). Real schedule
 * data, not a mock. Routes to /live for the full experience.
 *
 * This is the editorial replacement for the three-time-slot
 * DagskraStrip (Núna · Næst · Seinna). That strip still exists as
 * a component and can be reintroduced if we want the fuller
 * broadcast-aware view on a dedicated /dagskra page. For the
 * homepage, the ribbon gives the signal without the density.
 */

export default async function OnAirRibbon() {
    const { current, next } = await getCurrentAndNext();
    const onAir = !!current;
    const slot = current ?? next;
    if (!slot) return null;

    const startTime = formatClockUtc(slot.starts_at);
    const endTime = formatClockUtc(slot.ends_at);

    return (
        <section
            style={{
                background: 'var(--nott)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: '20px var(--rail-padding)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '28px',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {onAir ? (
                        <>
                            <span
                                className="live-dot"
                                aria-hidden
                                style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block' }}
                            />
                            <span
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'var(--ljos)',
                                }}
                            >
                                Nú í beinni
                            </span>
                        </>
                    ) : (
                        <>
                            <span
                                aria-hidden
                                style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--nordurljos)', display: 'inline-block' }}
                            />
                            <span
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'var(--moskva)',
                                }}
                            >
                                Næsta sending
                            </span>
                        </>
                    )}
                </div>

                <div
                    style={{
                        flex: 1,
                        minWidth: '240px',
                        borderLeft: '1px solid var(--border)',
                        paddingLeft: '28px',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '16px',
                        flexWrap: 'wrap',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '19px',
                            color: 'var(--ljos)',
                            letterSpacing: '-0.008em',
                        }}
                    >
                        {slot.program_title}
                    </span>
                    <span
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            color: 'var(--moskva)',
                        }}
                    >
                        {slot.host_name ? `· ${slot.host_name} · ` : '· '}
                        {onAir ? `${startTime}–${endTime}` : `Í kvöld kl. ${startTime}`}
                    </span>
                </div>

                {/* Ribbon CTA stays ghost in both states. The pulsing
                    --blod dot + "NÚ Í BEINNI" kicker already carry the
                    urgency signal when on-air; doubling that with an
                    amber button here would be a second amber CTA ~80px
                    below the hero's "Horfa í beinni" — breaks the
                    "amber appears once meaningfully" rule. Amber stays
                    in the hero as the single page-level watch CTA; the
                    ribbon is status-plus-link, not a primary action. */}
                <Link
                    href="/live"
                    className="ghost-btn"
                    style={{
                        padding: '12px 20px',
                        background: 'transparent',
                        border: '1px solid',
                        color: 'var(--ljos)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius-xs)',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {onAir ? 'Opna Beint' : 'Sjá dagskrá'}
                </Link>
            </div>
        </section>
    );
}
