import Link from "next/link";
import ThumbnailFrame from "@/components/media/ThumbnailFrame";

/**
 * UrDagskranni — "Úr dagskránni" — three recent episode cards.
 *
 * Cards use the shared <ThumbnailFrame> (cinematic grading + vignette
 * + warm glow + typographic fallback). Per the design system, the
 * title sits BELOW the art as page text (Apple TV+ pattern), not
 * overlaid on the image. Same treatment in dark and cream registers —
 * only the text colors below the card change by register.
 */

interface Episode {
    id: string;
    title: string;
    speaker: string;
    durationMin: string;
    thumbnail: string;
}

interface Props {
    episodes: Episode[];
    register?: 'dark' | 'cream';
}

export default function UrDagskranni({ episodes, register = 'dark' }: Props) {
    if (episodes.length === 0) return null;
    const top3 = episodes.slice(0, 3);
    const isCream = register === 'cream';

    const tokens = isCream
        ? {
            bg: 'var(--skra)',
            borderTop: 'rgba(63,47,35,0.12)',
            kickerColor: 'var(--gull)',
            titleColor: 'var(--skra-djup)',
            ctaBorder: 'rgba(63,47,35,0.3)',
            ctaColor: 'var(--skra-djup)',
        }
        : {
            bg: 'var(--torfa)',
            borderTop: 'var(--border)',
            kickerColor: 'var(--moskva)',
            titleColor: 'var(--ljos)',
            ctaBorder: 'var(--border)',
            ctaColor: 'var(--moskva)',
        };

    return (
        <section
            id="dagskra"
            style={{
                borderTop: `1px solid ${tokens.borderTop}`,
                background: tokens.bg,
                color: isCream ? 'var(--skra-djup)' : 'var(--ljos)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)',
                }}
            >
                {/* Ornamental section opener — matches /israel and BaenDagsins */}
                {isCream && (
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
                )}

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        marginBottom: 'clamp(36px, 4vw, 48px)',
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
                                color: tokens.kickerColor,
                                marginBottom: '14px',
                            }}
                        >
                            Úr dagskránni
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(28px, 3.2vw, 40px)',
                                fontWeight: 400,
                                color: tokens.titleColor,
                                letterSpacing: '-0.005em',
                                lineHeight: 1.1,
                            }}
                        >
                            Nýjustu þættir
                        </h2>
                    </div>
                    <Link
                        href="/sermons"
                        className="ghost-btn"
                        style={{
                            padding: '12px 20px',
                            border: `1px solid ${tokens.ctaBorder}`,
                            color: tokens.ctaColor,
                            textDecoration: 'none',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            borderRadius: 'var(--radius-xs)',
                        }}
                    >
                        Sjá þáttasafnið →
                    </Link>
                </div>

                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 'clamp(20px, 2vw, 28px)',
                    }}
                >
                    {top3.map((e) => (
                        <li key={e.id}>
                            <PosterCard episode={e} register={register} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function PosterCard({ episode, register }: { episode: Episode; register: 'dark' | 'cream' }) {
    const isCream = register === 'cream';
    const kickerColor = isCream ? 'var(--skra-mjuk)' : 'var(--moskva)';
    const titleColor = isCream ? 'var(--skra-djup)' : 'var(--ljos)';
    const metaColor = isCream ? 'var(--skra-mjuk)' : 'var(--steinn)';

    return (
        <Link
            href={`/sermons/${episode.id}`}
            className="ur-dagskra-card-link"
            style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
            }}
        >
            <article style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ThumbnailFrame
                    src={episode.thumbnail}
                    series={episode.speaker}
                    aspect="4/5"
                />
                <div>
                    <div
                        className="type-merki"
                        style={{ color: kickerColor, marginBottom: '6px' }}
                    >
                        {episode.speaker}
                    </div>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(17px, 1.4vw, 20px)',
                            fontWeight: 400,
                            lineHeight: 1.25,
                            color: titleColor,
                            letterSpacing: '-0.005em',
                        }}
                    >
                        {episode.title}
                    </h3>
                    <div
                        className="type-meta"
                        style={{ color: metaColor, marginTop: '4px' }}
                    >
                        {episode.durationMin} mín
                    </div>
                </div>
            </article>
        </Link>
    );
}
