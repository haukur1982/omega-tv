import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import WeekSchedule from "@/components/live/WeekSchedule";
import { getCurrentAndNext, formatClockUtc } from "@/lib/schedule-db";

/**
 * /live — "Beint"
 *
 * Full-width broadcast player with a DB-backed week schedule below.
 * Server-rendered now (was client-only). The schedule reads from
 * schedule_slots; the player embed stays on its existing env var.
 * See plan §4.3.
 *
 * Phase 3 ships: day-switcher, DB schedule, live/featured badges.
 * Phase 4 adds: candle presence drawer, prayer wall, timed notes.
 */

export const revalidate = 60;

interface LivePageProps {
    searchParams: Promise<{ day?: string }>;
}

export default async function LivePage({ searchParams }: LivePageProps) {
    const { day } = await searchParams;
    const embedUrl = process.env.NEXT_PUBLIC_LIVE_STREAM_EMBED_URL;
    const { current, next } = await getCurrentAndNext();

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* ═══ PLAYER ═══ */}
            <div style={{ paddingTop: '72px', background: 'var(--nott)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: 'var(--nott)' }}>
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
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                }}
                            >
                                <p className="type-merki" style={{ color: 'var(--steinn)', margin: 0, letterSpacing: '0.22em' }}>
                                    Engin útsending í gangi
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        color: 'var(--moskva)',
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: '0.98rem',
                                    }}
                                >
                                    {next ? `Næsta sending: ${next.program_title} kl. ${formatClockUtc(next.starts_at)}` : 'Líttu aftur síðar.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ NOW / NEXT info bar ═══ */}
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 2.5vw, 2rem) var(--rail-padding)',
                    borderBottom: '1px solid var(--border)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: 'clamp(1rem, 2vw, 2rem)',
                    alignItems: 'center',
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        {current ? (
                            <span
                                className="type-merki"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '4px 10px',
                                    background: 'rgba(216, 75, 58, 0.14)',
                                    border: '1px solid rgba(216, 75, 58, 0.4)',
                                    borderRadius: '2px',
                                    color: 'var(--blod)',
                                    letterSpacing: '0.22em',
                                    fontSize: '0.62rem',
                                }}
                            >
                                <span className="live-dot" aria-hidden="true" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block' }} />
                                Í beinni
                            </span>
                        ) : (
                            <span className="type-merki" style={{ color: 'var(--moskva)', letterSpacing: '0.22em' }}>
                                Dagskrá
                            </span>
                        )}
                        {current && (
                            <span className="type-meta" style={{ color: 'var(--steinn)' }}>
                                {formatClockUtc(current.starts_at)} – {formatClockUtc(current.ends_at)}
                            </span>
                        )}
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: 'var(--ljos)',
                        }}
                    >
                        {current?.program_title ?? 'Omega Stöðin'}
                    </h1>
                    {current?.description && (
                        <p
                            style={{
                                margin: '6px 0 0',
                                color: 'var(--moskva)',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '0.95rem',
                                lineHeight: 1.5,
                                maxWidth: '64ch',
                            }}
                        >
                            {current.description}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    <Link
                        href="/baenatorg"
                        className="ghost-btn"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '2px',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            color: 'var(--ljos)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            letterSpacing: '0.02em',
                            textDecoration: 'none',
                        }}
                    >
                        Senda bæn
                    </Link>
                    <Link
                        href="/give"
                        className="warm-hover"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'var(--kerti)',
                            color: 'var(--nott)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '2px',
                            border: '1px solid var(--kerti)',
                            textDecoration: 'none',
                        }}
                    >
                        Styrkja
                    </Link>
                </div>
            </div>

            {/* ═══ SCHEDULE ═══ */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--rail-padding)' }}>
                <WeekSchedule selectedDay={day} />
            </div>

            <Footer />
        </main>
    );
}
