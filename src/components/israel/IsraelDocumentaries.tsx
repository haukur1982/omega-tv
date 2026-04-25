import Link from "next/link";
import type { IsraelEpisode } from "@/lib/vod-db";

/**
 * IsraelDocumentaries — surfaces Israel-themed episodes from the
 * existing /sermons (þáttasafn) catalog. CBN Fréttir frá Ísrael,
 * Ísrael í brennidepli, and any other Israel-tagged content already
 * flowing in via Azotus → Bunny → episodes table.
 *
 * Cream register — matches /baenatorg body and /greinar/[slug] reading
 * frame. The watching/reading split stays: dark for masthead and
 * prayer call (gravity), cream for the editorial body.
 *
 * Up to 6 thumbnails on the landing. Full archive lives at
 * /israel/heimildarmyndir.
 */

interface Props {
    episodes: IsraelEpisode[];
}

const RAIL_LIMIT = 6;

export default function IsraelDocumentaries({ episodes }: Props) {
    if (!episodes || episodes.length === 0) {
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
                        padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)',
                    }}
                >
                    <SectionHeader />
                    <div
                        style={{
                            padding: 'clamp(48px, 6vw, 72px)',
                            border: '1px dashed rgba(63,47,35,0.2)',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(212,194,162,0.18)',
                            textAlign: 'center',
                            maxWidth: '46rem',
                            margin: '32px auto 0',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(18px, 1.7vw, 22px)',
                                color: 'var(--skra-djup)',
                                lineHeight: 1.55,
                            }}
                        >
                            Þættir um Ísrael safnast saman hér jafnóðum og þeir koma úr þýðingarstöðinni.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const display = episodes.slice(0, RAIL_LIMIT);
    const hasMore = episodes.length > RAIL_LIMIT;

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
                    padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)',
                }}
            >
                <SectionHeader showAllLink={hasMore} />

                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 'clamp(28px, 3vw, 40px) 0 0',
                        display: 'grid',
                        gap: 'clamp(28px, 3vw, 40px)',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    }}
                >
                    {display.map((ep) => (
                        <EpisodeCard key={ep.id} ep={ep} />
                    ))}
                </ul>
            </div>
        </section>
    );
}

function SectionHeader({ showAllLink = false }: { showAllLink?: boolean }) {
    return (
        <header
            style={{
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
                        marginBottom: '14px',
                    }}
                >
                    Heimildarmyndir
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
                    Þættir um Ísrael
                </h2>
                <p
                    style={{
                        margin: '14px 0 0',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '17px',
                        lineHeight: 1.5,
                        color: 'var(--skra-mjuk)',
                        maxWidth: '40rem',
                    }}
                >
                    Útsendingar, fréttir, og fræðsluþættir úr safninu — þýddir og uppsettir til íslensks áhorfs.
                </p>
            </div>
            {showAllLink && (
                <Link
                    href="/israel/heimildarmyndir"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--skra-djup)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--gull)',
                        paddingBottom: '2px',
                    }}
                >
                    Sjá öll →
                </Link>
            )}
        </header>
    );
}

function EpisodeCard({ ep }: { ep: IsraelEpisode }) {
    const date = ep.published_at
        ? new Date(ep.published_at).toLocaleDateString('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : '';
    const dur = ep.duration ? formatDuration(ep.duration) : null;
    const thumb = ep.thumbnail_custom
        ?? `https://vz-dd90f302-e7e.b-cdn.net/${ep.bunny_video_id}/thumbnail.jpg`;

    return (
        <li>
            <Link
                href={`/sermons/${ep.id}`}
                style={{ display: 'block', color: 'var(--skra-djup)', textDecoration: 'none' }}
            >
                <article style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '4 / 5',
                            background: 'rgba(63,47,35,0.1)',
                            overflow: 'hidden',
                            borderRadius: 'var(--radius-sm)',
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
                        {/* Bottom gradient for title legibility */}
                        <div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: '55%',
                                background:
                                    'linear-gradient(to bottom, rgba(20,18,15,0) 0%, rgba(20,18,15,0.82) 100%)',
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
                                backdropFilter: 'blur(6px)',
                                color: 'var(--ljos)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                borderRadius: '3px',
                            }}
                        >
                            {ep.series?.title ?? 'Heimildarmynd'}
                        </span>
                        {dur && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    padding: '5px 9px',
                                    background: 'rgba(20,18,15,0.7)',
                                    backdropFilter: 'blur(6px)',
                                    color: 'var(--ljos)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    letterSpacing: '0.02em',
                                    borderRadius: '3px',
                                }}
                            >
                                {dur}
                            </span>
                        )}
                        {/* Title overlaid bottom — poster style */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '16px',
                                right: '16px',
                                bottom: '14px',
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(17px, 1.5vw, 20px)',
                                    lineHeight: 1.2,
                                    fontWeight: 400,
                                    color: 'var(--ljos)',
                                    letterSpacing: '-0.005em',
                                    textWrap: 'balance',
                                    textShadow: '0 1px 12px rgba(0,0,0,0.5)',
                                }}
                            >
                                {ep.title}
                            </h3>
                            {date && (
                                <div
                                    style={{
                                        marginTop: '6px',
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
