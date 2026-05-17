import Link from "next/link";
import type { SeriesWithLatest } from "@/lib/vod-db";
import ThumbnailFrame from "@/components/media/ThumbnailFrame";

/**
 * SeriesShelf — reusable section for one editorial category on
 * /sermons. Used six times: Útsendingar Omega, Söfnuðir á Íslandi,
 * Frá útlöndum, Heimildarmyndir, Lofgjörð & tónlist, Barnaefni.
 *
 * Each instance: kicker + h2 + italic 1-line + grid of series cards.
 * If no series in this category yet, renders nothing OR a quiet
 * "fyllist innan tíðar" message — caller's choice via emptyMessage.
 *
 * Card click → /sermons/show/[slug] (per-series page with episode list).
 */

interface Props {
    kicker: string;
    title: string;
    subtitle?: string;
    series: SeriesWithLatest[];
    emptyMessage?: string;
    register?: 'cream' | 'pergament';
}

export default function SeriesShelf({
    kicker,
    title,
    subtitle,
    series,
    emptyMessage,
    register = 'cream',
}: Props) {
    const hasContent = series.length > 0;
    if (!hasContent && !emptyMessage) return null;

    const bg = register === 'pergament' ? 'var(--skra-warm)' : 'var(--skra)';

    return (
        <section
            style={{
                background: bg,
                color: 'var(--skra-djup)',
                borderTop: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(64px, 8vw, 96px) var(--rail-padding)',
                }}
            >
                <header
                    style={{
                        marginBottom: 'clamp(32px, 4vw, 48px)',
                        maxWidth: '52rem',
                    }}
                >
                    {/* Section opener — gold rule + dot, per design system §4.1 */}
                    <div
                        aria-hidden
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginBottom: '28px',
                        }}
                    >
                        <span style={{ width: '32px', height: '1px', background: 'var(--gull)' }} />
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                            <circle cx="5" cy="5" r="2" fill="var(--gull)" />
                        </svg>
                        <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
                    </div>

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
                            fontSize: 'clamp(28px, 3.2vw, 40px)',
                            lineHeight: 1.1,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                        }}
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p
                            style={{
                                margin: '14px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '17px',
                                lineHeight: 1.5,
                                color: 'var(--skra-mjuk)',
                                textWrap: 'pretty',
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                </header>

                {hasContent ? (
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'grid',
                            gap: 'clamp(20px, 2vw, 28px)',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        }}
                    >
                        {series.map((s) => (
                            <SeriesCard key={s.id} series={s} />
                        ))}
                    </ul>
                ) : (
                    <div
                        style={{
                            padding: 'clamp(40px, 5vw, 64px) clamp(28px, 4vw, 48px)',
                            border: '1px dashed rgba(63,47,35,0.2)',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(212,194,162,0.18)',
                            textAlign: 'center',
                            maxWidth: '46rem',
                            margin: '0 auto',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(16px, 1.5vw, 19px)',
                                lineHeight: 1.5,
                                color: 'var(--skra-djup)',
                            }}
                        >
                            {emptyMessage}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

function SeriesCard({ series }: { series: SeriesWithLatest }) {
    const ep = series.latest_episode;
    // Curated poster or episode custom art only — no Bunny auto-frame
    // (the design system uses the branded typographic fallback instead).
    const cover = series.poster_horizontal ?? ep?.thumbnail_custom ?? null;

    const date = ep?.published_at
        ? new Date(ep.published_at).toLocaleDateString('is-IS', {
            day: 'numeric',
            month: 'long',
        })
        : null;
    const count = series.episode_count > 0
        ? `${series.episode_count} ${series.episode_count === 1 ? 'þáttur' : 'þættir'}`
        : null;
    const meta = [count, date ? `Nýjasti þáttur · ${date}` : null]
        .filter(Boolean)
        .join('  ·  ');

    return (
        <li>
            <Link
                href={`/sermons/show/${series.slug}`}
                className="series-card-link"
                style={{ display: 'block', color: 'var(--skra-djup)', textDecoration: 'none' }}
            >
                <article style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <ThumbnailFrame
                        src={cover}
                        series={series.title}
                        aspect="4/5"
                    />
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(18px, 1.5vw, 22px)',
                                lineHeight: 1.2,
                                fontWeight: 400,
                                color: 'var(--skra-djup)',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            {series.title}
                        </h3>
                        {meta && (
                            <div
                                className="type-meta"
                                style={{ color: 'var(--skra-mjuk)', marginTop: '6px' }}
                            >
                                {meta}
                            </div>
                        )}
                        {series.description && (
                            <p
                                style={{
                                    margin: '10px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '14px',
                                    lineHeight: 1.5,
                                    color: 'var(--skra-mjuk)',
                                    textWrap: 'pretty',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {series.description}
                            </p>
                        )}
                    </div>
                </article>
            </Link>
        </li>
    );
}
