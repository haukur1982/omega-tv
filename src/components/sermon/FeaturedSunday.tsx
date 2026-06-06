import Link from "next/link";
import type { Database } from "@/types/supabase";

type Series = Database['public']['Tables']['series']['Row'];
type FeaturedEpisode = Pick<
    Database['public']['Tables']['episodes']['Row'],
    'id' | 'title' | 'description' | 'duration' | 'published_at' | 'thumbnail_custom' | 'bunny_video_id'
>;

/**
 * FeaturedSunday — single large editorial card pinning the latest
 * Sunnudagssamkoma at the top of the cream body.
 *
 * Donors and viewers want to find Sunday's service first. This is
 * its dedicated home, treated with weight (large image, big serif
 * title, italic excerpt, prominent watch CTA).
 *
 * Renders nothing if no Sunday episode exists yet — the rest of the
 * page still works.
 */

interface Props {
    series: Pick<Series, 'title' | 'slug' | 'host' | 'description'>;
    episode: FeaturedEpisode;
    /**
     * 'primary' — amber Horfa button (default; correct on /sermons where this
     *             is the page's single amber CTA).
     * 'ghost'   — ghost button (use on /heim where the Hero already owns
     *             the amber CTA; "amber appears once per page" rule).
     */
    ctaAccent?: 'primary' | 'ghost';
    /** Eyebrow label above the title. Defaults to the Sunday-service label. */
    kicker?: string;
}

export default function FeaturedSunday({ series, episode, ctaAccent = 'primary', kicker = 'Sunnudagssamkoma vikunnar' }: Props) {
    const date = episode.published_at
        ? new Date(episode.published_at).toLocaleDateString('is-IS', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : '';
    const cap = date ? date.charAt(0).toUpperCase() + date.slice(1) : '';
    const dur = episode.duration ? formatDuration(episode.duration) : null;
    const thumb = episode.thumbnail_custom
        ?? `/api/bunny/thumbnail/${episode.bunny_video_id}`;

    return (
        <section
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(72px, 9vw, 112px) var(--rail-padding) clamp(56px, 7vw, 80px)',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
                        gap: 'clamp(32px, 5vw, 64px)',
                        alignItems: 'center',
                    }}
                    className="featured-sunday-grid"
                >
                    {/* Cover image */}
                    <Link
                        href={`/sermons/${episode.bunny_video_id ?? episode.id}`}
                        className="featured-sunday-media"
                        style={{ display: 'block', textDecoration: 'none' }}
                    >
                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '16 / 10',
                                overflow: 'hidden',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(63,47,35,0.1)',
                                boxShadow: '0 30px 60px -30px rgba(20,18,15,0.45)',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={thumb}
                                alt=""
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                            {dur && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        bottom: '14px',
                                        padding: '6px 12px',
                                        background: 'rgba(20,18,15,0.78)',
                                        backdropFilter: 'blur(6px)',
                                        color: 'var(--ljos)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '11.5px',
                                        fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        borderRadius: '4px',
                                    }}
                                >
                                    {dur}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* Editorial copy */}
                    <div className="featured-sunday-copy">
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--gull)',
                                marginBottom: '14px',
                            }}
                        >
                            {kicker}
                        </div>

                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(28px, 3.4vw, 44px)',
                                lineHeight: 1.1,
                                fontWeight: 400,
                                color: 'var(--skra-djup)',
                                letterSpacing: '-0.01em',
                                textWrap: 'balance',
                            }}
                        >
                            {episode.title}
                        </h2>

                        {episode.description && (
                            <p
                                style={{
                                    margin: '20px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(16px, 1.4vw, 18px)',
                                    lineHeight: 1.55,
                                    color: 'var(--skra-mjuk)',
                                    textWrap: 'pretty',
                                }}
                            >
                                {episode.description}
                            </p>
                        )}

                        <div
                            aria-hidden
                            style={{
                                width: '40px',
                                height: '1px',
                                background: 'var(--gull)',
                                margin: '28px 0 16px',
                            }}
                        />

                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'var(--skra-mjuk)',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'baseline',
                                flexWrap: 'wrap',
                            }}
                        >
                            {series.host && <span>{series.host}</span>}
                            {series.host && cap && <span style={{ opacity: 0.4 }}>·</span>}
                            {cap && <span>{cap}</span>}
                        </div>

                        <Link
                            href={`/sermons/${episode.bunny_video_id ?? episode.id}`}
                            className="warm-hover"
                            style={{
                                marginTop: '32px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '14px 28px',
                                background: ctaAccent === 'primary' ? 'var(--kerti)' : 'transparent',
                                color: ctaAccent === 'primary' ? 'var(--nott)' : 'var(--skra-djup)',
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <polygon points="6,3 20,12 6,21" />
                            </svg>
                            Horfa
                        </Link>
                    </div>
                </div>
            </div>
            <style>{`
                @media (max-width: 820px) {
                    .featured-sunday-grid {
                        grid-template-columns: minmax(0, 1fr) !important;
                        gap: 28px !important;
                    }

                    .featured-sunday-copy {
                        order: 1;
                    }

                    .featured-sunday-media {
                        order: 2;
                    }
                }
            `}</style>
        </section>
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
