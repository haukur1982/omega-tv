import Link from "next/link";

/**
 * PullQuote — single large italic sentence from the newest article.
 *
 * Replaces the magazine-grid block on the homepage with a single
 * editorial moment. Extracts the first sentence of the article's
 * excerpt (or a curated pull_quote field if/when that schema lands)
 * and renders it at display size. Links through to the full article.
 *
 * If there are no articles, the section hides.
 */

interface Article {
    slug?: string;
    title: string;
    excerpt?: string | null;
    pull_quote?: string | null;
    author_name?: string | null;
    published_at?: string | null;
    reading_minutes?: number | null;
}

interface Props {
    article: Article | null;
}

export default function PullQuote({ article }: Props) {
    if (!article) return null;

    const quote = article.pull_quote ?? firstSentence(article.excerpt ?? article.title);
    const href = article.slug ? `/greinar/${article.slug}` : '/greinar';
    const author = article.author_name ?? 'Omega';
    const dateLabel = article.published_at ? formatDateIs(article.published_at) : null;
    const readingLabel = article.reading_minutes ? `${article.reading_minutes} mín. lestur` : null;

    return (
        <section
            style={{
                padding: 'clamp(80px, 12vw, 128px) var(--rail-padding)',
                borderTop: '1px solid var(--border)',
            }}
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '14px',
                        marginBottom: '36px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--kerti)',
                    }}
                >
                    <span style={{ width: '28px', height: '1px', background: 'var(--kerti)', opacity: 0.6 }} />
                    Nýjasta grein
                    <span style={{ width: '28px', height: '1px', background: 'var(--kerti)', opacity: 0.6 }} />
                </div>

                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(28px, 3.4vw, 44px)',
                        lineHeight: 1.3,
                        color: 'var(--ljos)',
                        letterSpacing: '-0.012em',
                        textWrap: 'balance',
                    }}
                >
                    {quote}
                </p>

                <Link href={href} className="article-card-link" style={{ display: 'block', marginTop: '44px', textDecoration: 'none' }}>
                    <div
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '22px',
                            color: 'var(--ljos)',
                            letterSpacing: '-0.008em',
                            lineHeight: 1.3,
                            textWrap: 'balance',
                            maxWidth: '640px',
                            margin: '0 auto',
                        }}
                    >
                        {article.title}
                    </div>
                    <div
                        style={{
                            marginTop: '14px',
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: '12px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            color: 'var(--moskva)',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '14px',
                                color: 'var(--moskva)',
                                letterSpacing: 0,
                            }}
                        >
                            {author}
                        </span>
                        {dateLabel && (
                            <>
                                <span style={{ opacity: 0.5 }}>·</span>
                                <span>{dateLabel}</span>
                            </>
                        )}
                        {readingLabel && (
                            <>
                                <span style={{ opacity: 0.5 }}>·</span>
                                <span>{readingLabel.toUpperCase()}</span>
                            </>
                        )}
                    </div>
                    <div
                        style={{
                            marginTop: '22px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--kerti)',
                        }}
                    >
                        Lesa greinina →
                    </div>
                </Link>
            </div>
        </section>
    );
}

function firstSentence(text: string): string {
    const trimmed = text.trim();
    const match = trimmed.match(/^[^.!?]+[.!?]/);
    return match ? match[0] : trimmed;
}

function formatDateIs(iso: string): string {
    const d = new Date(iso);
    const day = d.getUTCDate();
    const monthName = d.toLocaleDateString('is-IS', { month: 'long' });
    return `${day}. ${monthName}`.toUpperCase();
}
