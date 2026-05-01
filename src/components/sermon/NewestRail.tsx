import Link from "next/link";

/**
 * NewestRail — horizontal-scrolling rail of newest episodes across
 * all categories. The "up next" bridge between FeaturedSunday and
 * the categorized SeriesShelf sections.
 *
 * Visual register: cinematic 16:9 cards with title overlaid on the
 * lower third — Apple TV / HBO Max card pattern, but on cream so it
 * lives inside the editorial page rather than feeling like a bolted-on
 * streaming-service strip.
 *
 * No auto-rotation, no carousel arrows. Manual horizontal scroll only
 * (snap points, native swipe) — older audiences read scroll, not
 * carousel choreography.
 */

interface RailEpisode {
    id: string;
    title: string;
    published_at: string | null;
    thumbnail_custom: string | null;
    bunny_video_id: string;
    duration: number | null;
    series_title: string;
    series_slug: string;
}

interface Props {
    episodes: RailEpisode[];
}

export default function NewestRail({ episodes }: Props) {
    if (!episodes || episodes.length === 0) return null;

    return (
        <section
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
                borderTop: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(56px, 7vw, 80px) 0 clamp(56px, 7vw, 80px)',
                }}
            >
                <header
                    style={{
                        padding: '0 var(--rail-padding)',
                        marginBottom: 'clamp(28px, 3vw, 40px)',
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: '24px',
                        flexWrap: 'wrap',
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
                                color: 'var(--gull)',
                                marginBottom: '12px',
                            }}
                        >
                            Nýjast
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(28px, 3.2vw, 40px)',
                                lineHeight: 1.1,
                                fontWeight: 400,
                                color: 'var(--skra-djup)',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            Nýlega bætt við
                        </h2>
                    </div>
                </header>

                {/* Horizontal scroll rail */}
                <ul
                    className="newest-rail"
                    style={{
                        listStyle: 'none',
                        padding: '0 var(--rail-padding)',
                        margin: 0,
                        display: 'flex',
                        gap: 'clamp(16px, 2vw, 24px)',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        scrollPaddingLeft: 'var(--rail-padding)',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {episodes.map((ep) => (
                        <RailCard key={ep.id} ep={ep} />
                    ))}
                </ul>
            </div>
        </section>
    );
}

function RailCard({ ep }: { ep: RailEpisode }) {
    const date = ep.published_at
        ? new Date(ep.published_at).toLocaleDateString('is-IS', {
            day: 'numeric',
            month: 'long',
        })
        : null;
    const dur = ep.duration ? formatDuration(ep.duration) : null;
    const thumb = ep.thumbnail_custom
        ?? `https://vz-dd90f302-e7e.b-cdn.net/${ep.bunny_video_id}/thumbnail.jpg`;

    return (
        <li
            style={{
                flex: '0 0 auto',
                width: 'clamp(280px, 30vw, 380px)',
                scrollSnapAlign: 'start',
            }}
        >
            <Link
                href={`/sermons/${ep.bunny_video_id}`}
                className="rail-card-link"
                style={{
                    display: 'block',
                    color: 'var(--skra-djup)',
                    textDecoration: 'none',
                }}
            >
                <article style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div
                        className="rail-card-art"
                        style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16 / 9',
                            background: 'rgba(63,47,35,0.1)',
                            overflow: 'hidden',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: '0 18px 40px -24px rgba(20,18,15,0.45)',
                            transition: 'transform 320ms cubic-bezier(0.2,0.7,0.3,1), box-shadow 320ms ease',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="rail-card-img"
                            src={thumb}
                            alt=""
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 600ms cubic-bezier(0.2,0.7,0.3,1)',
                            }}
                        />
                        {/* Bottom gradient for title legibility */}
                        <div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: '60%',
                                background:
                                    'linear-gradient(to bottom, rgba(20,18,15,0) 0%, rgba(20,18,15,0.85) 100%)',
                            }}
                        />
                        {/* Series tag — top left */}
                        <span
                            style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                padding: '5px 10px',
                                background: 'rgba(20,18,15,0.7)',
                                backdropFilter: 'blur(8px)',
                                color: 'var(--ljos)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                borderRadius: '3px',
                            }}
                        >
                            {ep.series_title}
                        </span>
                        {/* Duration tag — top right */}
                        {dur && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    padding: '5px 9px',
                                    background: 'rgba(20,18,15,0.7)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'var(--ljos)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    letterSpacing: '0.04em',
                                    borderRadius: '3px',
                                }}
                            >
                                {dur}
                            </span>
                        )}
                        {/* Play button center */}
                        <div
                            className="rail-card-play"
                            aria-hidden
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 280ms ease',
                            }}
                        >
                            <span
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.92)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 6px 24px rgba(20,18,15,0.5)',
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--nott)" aria-hidden style={{ marginLeft: '3px' }}>
                                    <polygon points="6,3 20,12 6,21" />
                                </svg>
                            </span>
                        </div>
                        {/* Title overlay — bottom left */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '14px',
                                right: '14px',
                                bottom: '12px',
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(17px, 1.5vw, 21px)',
                                    lineHeight: 1.2,
                                    fontWeight: 400,
                                    color: 'var(--ljos)',
                                    letterSpacing: '-0.005em',
                                    textWrap: 'balance',
                                    textShadow: '0 1px 14px rgba(0,0,0,0.55)',
                                }}
                            >
                                {ep.title}
                            </h3>
                            {date && (
                                <div
                                    style={{
                                        marginTop: '4px',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '10.5px',
                                        fontWeight: 600,
                                        letterSpacing: '0.16em',
                                        textTransform: 'uppercase',
                                        color: 'var(--moskva)',
                                    }}
                                >
                                    {date}
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            </Link>
        </li>
    );
}

function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} mín`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} klst ${m} mín` : `${h} klst`;
}
