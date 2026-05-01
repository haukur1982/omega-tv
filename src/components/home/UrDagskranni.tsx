import Link from "next/link";

/**
 * UrDagskranni — "Úr dagskránni" — three recent episode cards.
 *
 * Two registers:
 *   - 'dark' (legacy)  — torfa bg with 16:10 landscape cards
 *   - 'cream' (new)    — vellum bg with poster-style 4:5 cards,
 *                        title overlaid on artwork, hover lift +
 *                        play-button reveal. Matches /sermons VOD
 *                        aesthetic so the homepage's library tease
 *                        feels continuous with the full archive.
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

    return (
        <Link
            href={`/sermons/${episode.id}`}
            className="ur-dagskra-card-link"
            style={{
                display: 'block',
                textDecoration: 'none',
                color: isCream ? 'var(--skra-djup)' : 'var(--ljos)',
            }}
        >
            <article style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                    className="ur-dagskra-card-art"
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '4 / 5',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius-sm)',
                        background: isCream ? 'rgba(63,47,35,0.1)' : 'var(--nott)',
                        boxShadow: isCream
                            ? '0 14px 32px -22px rgba(20,18,15,0.4)'
                            : '0 14px 32px -22px rgba(0,0,0,0.5)',
                        transition: 'transform 320ms cubic-bezier(0.2,0.7,0.3,1), box-shadow 320ms ease',
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="ur-dagskra-card-img"
                        src={episode.thumbnail}
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
                        {episode.speaker}
                    </span>
                    {/* Duration tag — top right */}
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
                        {episode.durationMin} mín
                    </span>
                    {/* Play button center — reveals on hover */}
                    <div
                        className="ur-dagskra-card-play"
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
                    {/* Title overlay — bottom */}
                    <div
                        style={{
                            position: 'absolute',
                            left: '14px',
                            right: '14px',
                            bottom: '14px',
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(18px, 1.6vw, 22px)',
                                lineHeight: 1.2,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.005em',
                                textWrap: 'balance',
                                textShadow: '0 1px 14px rgba(0,0,0,0.55)',
                            }}
                        >
                            {episode.title}
                        </h3>
                    </div>
                </div>
            </article>
        </Link>
    );
}
