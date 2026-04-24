import Link from "next/link";

/**
 * UrDagskranni — "Úr dagskránni" — three recent episode cards.
 *
 * Replaces the old multi-rail approach (Nýtt efni / Sunnudagssamkomur
 * portrait rail / etc.) with a single 3-card row. Editorial, not
 * content-catalog.
 *
 * Takes the freshest 3 videos from Bunny and renders them. No
 * filtering by show type for the first pass — just the most recent
 * 3 items from the feed. If we want separate rows later (e.g. a
 * "Sunnudagssamkomur" section below this one), that's a future
 * addition, not a regression.
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
}

export default function UrDagskranni({ episodes }: Props) {
    if (episodes.length === 0) return null;
    const top3 = episodes.slice(0, 3);

    return (
        <section
            id="dagskra"
            style={{
                borderTop: '1px solid var(--border)',
                background: 'var(--torfa)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(60px, 8vw, 80px) var(--rail-padding)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        marginBottom: '40px',
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
                                color: 'var(--moskva)',
                                marginBottom: '12px',
                            }}
                        >
                            Úr dagskránni
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(32px, 4vw, 48px)',
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.018em',
                            }}
                        >
                            Nýjustu þættir
                        </h2>
                    </div>
                    <Link
                        href="/sermons"
                        className="ghost-btn"
                        style={{
                            padding: '10px 18px',
                            border: '1px solid var(--border)',
                            color: 'var(--moskva)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            borderRadius: 'var(--radius-xs)',
                        }}
                    >
                        Sjá alla þætti
                    </Link>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '24px',
                    }}
                >
                    {top3.map((e) => (
                        <Link
                            key={e.id}
                            href={`/sermons/${e.id}`}
                            className="warm-hover"
                            style={{
                                display: 'block',
                                textDecoration: 'none',
                                color: 'inherit',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden',
                                background: 'var(--nott)',
                            }}
                        >
                            <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={e.thumbnail}
                                    alt=""
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        filter: 'saturate(0.8)',
                                    }}
                                />
                                <div
                                    aria-hidden
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(20,18,15,0.72) 0%, transparent 55%)',
                                    }}
                                />
                                <span
                                    style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        right: '12px',
                                        padding: '4px 9px',
                                        background: 'rgba(20,18,15,0.78)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: 'var(--ljos)',
                                        letterSpacing: '0.04em',
                                        borderRadius: '3px',
                                    }}
                                >
                                    {e.durationMin} mín
                                </span>
                            </div>
                            <div style={{ padding: '22px 22px 24px' }}>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '10.5px',
                                        fontWeight: 700,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: 'var(--moskva)',
                                        marginBottom: '12px',
                                    }}
                                >
                                    {e.speaker}
                                </div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '22px',
                                        fontWeight: 400,
                                        color: 'var(--ljos)',
                                        letterSpacing: '-0.01em',
                                        lineHeight: 1.22,
                                    }}
                                >
                                    {e.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
