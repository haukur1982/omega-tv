import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveMeta from "@/components/live/LiveMeta";
import OnAirEditorial from "@/components/live/OnAirEditorial";
import DagskraTimeline from "@/components/live/DagskraTimeline";
import LivePrayerPulse from "@/components/live/LivePrayerPulse";
import { getCurrentAndNext, getScheduleInRange, type ScheduleSlot } from "@/lib/schedule-db";

/**
 * /live — "Beint"
 *
 * Omega is a 24/7 channel, so the live player is ALWAYS shown (embed via
 * NEXT_PUBLIC_LIVE_STREAM_EMBED_URL). The schedule is supplementary:
 *   - when a current slot is known → LiveMeta + OnAirEditorial + prayer pulse
 *   - otherwise → a quiet "Omega sendir út allan sólarhringinn" line
 * The DagskraTimeline shows only when the schedule has upcoming slots, so an
 * empty/unsynced schedule degrades to an honest player-only page (never a
 * broken "off-air" countdown or fabricated programming).
 *
 * PrayerHall is not inlined — "Senda bænaefni" links to /baenatorg.
 */

export const revalidate = 60;

interface LivePageProps {
    searchParams: Promise<{ state?: string }>;
}

export default async function LivePage({ searchParams }: LivePageProps) {
    const { state: stateParam } = await searchParams;
    const embedUrl = process.env.NEXT_PUBLIC_LIVE_STREAM_EMBED_URL;

    const now = new Date();
    const { current, next } = await getCurrentAndNext(now);

    // Dev escape hatch — force off-air to visually QA the State B composition.
    const forceOffAir = stateParam === 'off-air';
    const effectiveCurrent: ScheduleSlot | null = forceOffAir ? null : current;

    // Upcoming + recent slots for the timeline + "Síðasta útsending" card.
    const rangeStart = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const rangeEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const allSlots = await getScheduleInRange(rangeStart.toISOString(), rangeEnd.toISOString());

    const upcoming = allSlots.filter((s) => new Date(s.ends_at).getTime() > now.getTime()).slice(0, 6);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* Breadcrumb + page title */}
            <div
                style={{
                    maxWidth: '84rem',
                    margin: '0 auto',
                    padding: 'clamp(120px, 12vw, 160px) var(--rail-padding) 32px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '14px',
                        color: 'var(--steinn)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                    }}
                >
                    <span>Omega</span>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span style={{ color: 'var(--ljos)' }}>Beint</span>
                </div>
                <h1
                    className="type-vaka"
                    style={{ margin: 0, color: 'var(--ljos)' }}
                >
                    Í beinni útsendingu.
                </h1>
            </div>

            {/* Main panel slot — player (on-air) OR countdown (off-air) */}
            <section
                style={{
                    maxWidth: '84rem',
                    margin: '0 auto',
                    padding: '0 var(--rail-padding)',
                }}
            >
                {/* 24/7 channel — the live player is always shown. */}
                <div>
                        {/* Player */}
                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '16 / 9',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                background: 'var(--nott)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-lift)',
                            }}
                        >
                            {embedUrl ? (
                                <iframe
                                    src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                                    title="Omega — bein útsending"
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--steinn)',
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                    }}
                                >
                                    Útsendingin verður aðgengileg skömmu áður en hún hefst.
                                </div>
                            )}

                            {/* BEINT pill — top-left overlay. Only visual element
                                layered on the iframe because CSS overlay on a
                                cross-origin iframe is a thin veneer, not a real
                                control surface. No viewership counter (would be
                                fake data at the moment). */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '18px',
                                    left: '18px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '9px',
                                    padding: '7px 12px',
                                    borderRadius: 'var(--radius-xs)',
                                    background: 'rgba(20,18,15,0.72)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(216,75,58,0.35)',
                                    color: 'var(--blod)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    pointerEvents: 'none',
                                }}
                            >
                                <span
                                    className="live-dot"
                                    aria-hidden
                                    style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block' }}
                                />
                                Beint
                            </div>
                        </div>

                        {effectiveCurrent ? (
                            <>
                                <LiveMeta current={effectiveCurrent} />
                                <OnAirEditorial current={effectiveCurrent} />
                                <LivePrayerPulse slotId={effectiveCurrent.id} />
                            </>
                        ) : (
                            <p
                                style={{
                                    margin: '28px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(17px, 1.6vw, 20px)',
                                    lineHeight: 1.6,
                                    color: 'var(--moskva)',
                                    maxWidth: '54ch',
                                }}
                            >
                                Omega sendir út allan sólarhringinn — orð Guðs, lofgjörð og bæn.
                            </p>
                        )}
                    </div>
            </section>

            {/* Where to watch on TV — Omega's main audience watches on cable. */}
            <div style={{ textAlign: 'center', padding: '0 var(--rail-padding)', marginTop: '-8px' }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--moskva)' }}>
                    Omega er einnig í sjónvarpi —{' '}
                    <span style={{ color: 'var(--kerti)', fontWeight: 700 }}>Sjónvarp Símans, rás 6</span>
                </p>
            </div>

            {/* Dagskrá timeline — only when the schedule has upcoming slots. */}
            {upcoming.length > 0 && (
                <DagskraTimeline
                    slots={upcoming}
                    currentId={effectiveCurrent?.id ?? null}
                    nextId={next?.id ?? null}
                />
            )}

            <Footer />
        </main>
    );
}
