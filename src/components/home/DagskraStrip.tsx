import Link from 'next/link';
import { getScheduleInRange, formatClockUtc } from '@/lib/schedule-db';
import type { ScheduleSlot } from '@/lib/schedule-db';

/**
 * DagskraStrip — homepage "Dagskrá vikunnar" module (plan §4.1 row 2).
 *
 * Three columns: NÚNA (what's on right now), NÆST (next up today),
 * SEINNA (next featured broadcast — usually Sunday service or Bænakvöld).
 * The page is broadcast-aware; no other streaming platform can do this
 * because they don't have a broadcast.
 */
export default async function DagskraStrip() {
    const now = new Date();
    // 48-hour window so we always have something in NEXT / LATER even late at night
    const end = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const slots = await getScheduleInRange(now.toISOString().slice(0, 10) + 'T00:00:00Z', end.toISOString());

    const current = slots.find(s => new Date(s.starts_at) <= now && new Date(s.ends_at) > now) ?? null;
    const upcoming = slots.filter(s => new Date(s.starts_at) > now);
    const next = upcoming[0] ?? null;
    const featured = upcoming.find(s => s.is_featured) ?? upcoming[1] ?? null;

    // Hide entirely if we have no data — avoid an awkward empty strip.
    if (!current && !next && !featured) return null;

    return (
        <section
            aria-label="Dagskrá vikunnar"
            style={{
                maxWidth: '80rem',
                margin: '0 auto',
                padding: '0 var(--rail-padding)',
                marginTop: 'clamp(3rem, 5vw, 4.5rem)',
            }}
        >
            <header
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: 'clamp(1rem, 1.6vw, 1.5rem)',
                }}
            >
                <h2 className="type-yfirskrift" style={{ margin: 0, color: 'var(--ljos)' }}>
                    Dagskráin
                </h2>
                <Link
                    href="/live"
                    className="type-merki muted-link"
                    style={{
                        textDecoration: 'none',
                        letterSpacing: '0.18em',
                        fontSize: '0.7rem',
                    }}
                >
                    Heil vika →
                </Link>
            </header>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 'clamp(0.75rem, 1.5vw, 1rem)',
                }}
            >
                <SlotCell label="Núna" slot={current} emptyText="Engin útsending akkúrat núna." live={!!current?.is_live_broadcast} featured />
                <SlotCell label="Næst" slot={next} emptyText="Engin útsending skráð í dag." />
                <SlotCell label="Seinna" slot={featured && featured !== next ? featured : null} emptyText="—" />
            </div>
        </section>
    );
}

function SlotCell({
    label,
    slot,
    emptyText,
    live,
    featured,
}: {
    label: string;
    slot: ScheduleSlot | null;
    emptyText: string;
    live?: boolean;
    featured?: boolean;
}) {
    return (
        <Link
            href="/live"
            className="warm-hover"
            style={{
                position: 'relative',
                display: 'block',
                padding: 'clamp(18px, 2vw, 22px)',
                background: 'var(--torfa)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                textDecoration: 'none',
                color: 'inherit',
                minHeight: '112px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span
                    className="type-merki"
                    style={{
                        color: featured || live ? 'var(--kerti)' : 'var(--moskva)',
                        letterSpacing: '0.22em',
                    }}
                >
                    {label}
                </span>
                {live && (
                    <span
                        className="type-merki"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'var(--blod)',
                            letterSpacing: '0.22em',
                            fontSize: '0.58rem',
                        }}
                    >
                        <span className="live-dot" aria-hidden="true" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block' }} />
                        Beint
                    </span>
                )}
            </div>
            {slot ? (
                <>
                    <p
                        className="type-kodi"
                        style={{
                            margin: 0,
                            marginBottom: '6px',
                            color: 'var(--moskva)',
                            fontSize: '0.8rem',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {formatClockUtc(slot.starts_at)} – {formatClockUtc(slot.ends_at)}
                    </p>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--ljos)',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            lineHeight: 1.25,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {slot.program_title}
                    </h3>
                    {slot.description && (
                        <p
                            style={{
                                margin: '6px 0 0',
                                fontFamily: 'var(--font-serif)',
                                color: 'var(--moskva)',
                                fontStyle: 'italic',
                                fontSize: '0.88rem',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {slot.description}
                        </p>
                    )}
                </>
            ) : (
                <p
                    className="type-ritskrift"
                    style={{
                        margin: 0,
                        color: 'var(--steinn)',
                    }}
                >
                    {emptyText}
                </p>
            )}
        </Link>
    );
}
