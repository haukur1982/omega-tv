import Link from "next/link";
import ThumbnailFrame from "@/components/media/ThumbnailFrame";

/**
 * NewestRail — horizontal-scrolling rail of newest episodes across
 * all categories. The "up next" bridge between FeaturedSunday and
 * the categorized SeriesShelf sections.
 *
 * Cards use the shared <ThumbnailFrame> (cinematic 16:9, grading +
 * vignette + glow). Title sits BELOW the art as page text (Apple TV+
 * pattern), not overlaid. Episodes without a curated thumbnail show
 * the branded typographic fallback instead of Bunny's auto-frame.
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
    const meta = [date, dur].filter(Boolean).join('  ·  ');

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
                    <ThumbnailFrame
                        src={ep.thumbnail_custom}
                        series={ep.series_title}
                        aspect="16/9"
                    />
                    <div>
                        <div
                            className="type-merki"
                            style={{ color: 'var(--skra-mjuk)', marginBottom: '6px' }}
                        >
                            {ep.series_title}
                        </div>
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(17px, 1.4vw, 20px)',
                                lineHeight: 1.25,
                                fontWeight: 400,
                                color: 'var(--skra-djup)',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            {ep.title}
                        </h3>
                        {meta && (
                            <div
                                className="type-meta"
                                style={{ color: 'var(--skra-mjuk)', marginTop: '4px' }}
                            >
                                {meta}
                            </div>
                        )}
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
