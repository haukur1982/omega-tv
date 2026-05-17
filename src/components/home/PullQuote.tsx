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
    register?: 'dark' | 'pergament';
}

export default function PullQuote({ article, register = 'dark' }: Props) {
    if (!article) return null;

    const quote = article.pull_quote ?? firstSentence(article.excerpt ?? article.title);
    const href = article.slug ? `/greinar/${article.slug}` : '/greinar';
    const author = article.author_name ?? 'Omega';
    const dateLabel = article.published_at ? formatDateIs(article.published_at) : null;
    const readingLabel = article.reading_minutes ? `${article.reading_minutes} mín. lestur` : null;

    const isPergament = register === 'pergament';
    const tokens = isPergament
        ? {
            bg: 'var(--skra-warm)',
            borderTop: 'rgba(63,47,35,0.12)',
            kickerColor: 'var(--gull)',
            kickerRule: 'var(--gull)',
            quoteColor: 'var(--skra-djup)',
            titleColor: 'var(--skra-djup)',
            metaColor: 'var(--skra-mjuk)',
            authorColor: 'var(--skra-mjuk)',
            ctaColor: 'var(--skra-djup)',
        }
        : {
            bg: 'transparent',
            borderTop: 'var(--border)',
            kickerColor: 'var(--kerti)',
            kickerRule: 'var(--kerti)',
            quoteColor: 'var(--ljos)',
            titleColor: 'var(--ljos)',
            metaColor: 'var(--moskva)',
            authorColor: 'var(--moskva)',
            ctaColor: 'var(--kerti)',
        };

    return (
        <section
            style={{
                background: tokens.bg,
                padding: 'clamp(80px, 12vw, 128px) var(--rail-padding)',
                borderTop: `1px solid ${tokens.borderTop}`,
            }}
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                {/* Centered ornament — design system §4.2 */}
                <div
                    aria-hidden
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '14px',
                        marginBottom: '24px',
                        maxWidth: '20rem',
                        marginInline: 'auto',
                    }}
                >
                    <span style={{ flex: 1, height: '1px', background: tokens.kickerRule, opacity: 0.4 }} />
                    <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden>
                        <circle cx="4.5" cy="4.5" r="2" fill={tokens.kickerRule} opacity="0.7" />
                    </svg>
                    <span style={{ flex: 1, height: '1px', background: tokens.kickerRule, opacity: 0.4 }} />
                </div>

                <div
                    style={{
                        marginBottom: '36px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: tokens.kickerColor,
                    }}
                >
                    Nýjasta grein
                </div>

                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(28px, 3.4vw, 44px)',
                        lineHeight: 1.3,
                        color: tokens.quoteColor,
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
                            color: tokens.titleColor,
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
                            color: tokens.metaColor,
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '14px',
                                color: tokens.authorColor,
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
                            color: tokens.ctaColor,
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
