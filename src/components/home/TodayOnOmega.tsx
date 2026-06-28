import Link from 'next/link';

/**
 * "Í dag á Omega" — the daily front door (from the 2026-06-27 review:
 * "this is where your Christian day starts. watch, read, pray, return.").
 *
 * One compact dashboard right under the hero that pulls today's living
 * pieces together: watch live, today's prayer, the newest teaching, one
 * thing to read. The deeper sections below remain the full versions; this
 * is the quick morning check-in.
 */

interface TodayPrayer { date?: string; body: string; scripture: string | null; }
interface TodayEpisode { id: string; title: string; speaker: string | null; }
interface TodayArticle { slug?: string; title: string; }
interface TodayWord { reference: string; verse: string | null; reflection: string; }

interface Props {
    prayer?: TodayPrayer | null;
    word?: TodayWord | null;
    episode?: TodayEpisode | null;
    article?: TodayArticle | null;
}

export default function TodayOnOmega({ prayer, word, episode, article }: Props) {
    return (
        <section style={{ background: 'var(--nott)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div
                style={{
                    maxWidth: '84rem',
                    margin: '0 auto',
                    padding: 'clamp(2.75rem, 5vw, 4rem) var(--rail-padding)',
                }}
            >
                {/* Heading */}
                <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                    <p
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--kerti)',
                            margin: 0,
                        }}
                    >
                        Í dag á Omega
                    </p>
                    <h2
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.6rem, 3.4vw, 2.25rem)',
                            fontWeight: 500,
                            lineHeight: 1.15,
                            color: 'var(--ljos)',
                            margin: '0.6rem 0 0',
                        }}
                    >
                        Hér byrjar dagurinn.
                    </h2>
                </div>

                {/* Cards */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem',
                    }}
                >
                    {/* Live — the one clear action, accented */}
                    <Link href="/live" style={{ ...cardBase, background: 'var(--kerti-gloed)', borderColor: 'rgba(233,168,96,0.35)' }}>
                        <span style={kicker}>
                            <span aria-hidden className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block', marginRight: '7px' }} />
                            Beint núna
                        </span>
                        <span style={{ ...cardTitle, color: 'var(--ljos)' }}>Horfa í beinni</span>
                        <span style={cardMeta}>Omega sendir út allan sólarhringinn</span>
                        <span style={{ ...arrow, color: 'var(--kerti)' }}>Horfa →</span>
                    </Link>

                    {/* Orð dagsins — the daily word */}
                    {word && (
                        <Link href="/greinar" style={cardBase}>
                            <span style={kicker}>Orð dagsins</span>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--kerti)' }}>
                                {word.reference}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1rem',
                                    lineHeight: 1.5,
                                    color: 'var(--ljos)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {word.reflection}
                            </span>
                            <span style={arrow}>Meira →</span>
                        </Link>
                    )}

                    {/* Today's prayer */}
                    {prayer && (
                        <Link href="/baenatorg" style={cardBase}>
                            <span style={kicker}>Bæn dagsins</span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '1rem',
                                    lineHeight: 1.5,
                                    color: 'var(--ljos)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {prayer.body}
                            </span>
                            {prayer.scripture && <span style={cardMeta}>{prayer.scripture}</span>}
                            <span style={arrow}>Biðja með okkur →</span>
                        </Link>
                    )}

                    {/* Newest teaching */}
                    {episode && (
                        <Link href={`/sermons/${episode.id}`} style={cardBase}>
                            <span style={kicker}>Nýjasta kennslan</span>
                            <span style={{ ...cardTitle, color: 'var(--ljos)' }}>{episode.title}</span>
                            {episode.speaker && <span style={cardMeta}>{episode.speaker}</span>}
                            <span style={arrow}>Horfa →</span>
                        </Link>
                    )}

                    {/* One thing to read */}
                    {article && (
                        <Link href={article.slug ? `/greinar/${article.slug}` : '/greinar'} style={cardBase}>
                            <span style={kicker}>Til íhugunar</span>
                            <span style={{ ...cardTitle, color: 'var(--ljos)' }}>{article.title}</span>
                            <span style={arrow}>Lesa →</span>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

const cardBase: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
    padding: '1.25rem 1.35rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(246,242,234,0.03)',
    border: '1px solid var(--border)',
    textDecoration: 'none',
    minHeight: '150px',
};

const kicker: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--font-sans)',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--moskva)',
};

const cardTitle: React.CSSProperties = {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    lineHeight: 1.3,
    fontWeight: 500,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
};

const cardMeta: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: 'var(--steinn)',
};

const arrow: React.CSSProperties = {
    marginTop: 'auto',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--moskva)',
};
