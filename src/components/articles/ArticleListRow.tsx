import Link from "next/link";
import { type Article, readingMinutes, formatDateIs } from "./article-helpers";
import LetterPlaceholder from "./LetterPlaceholder";

/**
 * ArticleListRow — horizontal row for the chronological archive
 * below the editor's picks. Reads like a table of contents: small
 * image square on the left, title + excerpt + meta on the right.
 *
 * Hover: quiet torfa tint extending slightly beyond the row (same
 * halo pattern as PrayerCardV2 on Bænatorg — the "card breathes"
 * rather than getting a hard border).
 */

interface Props {
    article: Article;
}

export default function ArticleListRow({ article }: Props) {
    const minutes = article.content ? readingMinutes(article.content) : null;
    const published = formatDateIs(article.published_at);
    const HALO_X = 20;

    return (
        <Link
            href={`/greinar/${article.slug}`}
            className="warm-hover"
            style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                gap: 'clamp(20px, 3vw, 32px)',
                alignItems: 'center',
                padding: `clamp(18px, 2vw, 22px) ${HALO_X}px`,
                marginLeft: -HALO_X,
                marginRight: -HALO_X,
                borderBottom: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                color: 'inherit',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    width: '100%',
                    maxWidth: '120px',
                    borderRadius: 'var(--radius-xs)',
                    overflow: 'hidden',
                    background: 'var(--nott)',
                }}
            >
                {article.featured_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={article.featured_image}
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'saturate(0.85)',
                        }}
                    />
                ) : (
                    <LetterPlaceholder title={article.title} size="sm" />
                )}
            </div>

            <div style={{ minWidth: 0 }}>
                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(18px, 2vw, 22px)',
                        lineHeight: 1.25,
                        letterSpacing: '-0.01em',
                        fontWeight: 400,
                        color: 'var(--ljos)',
                        textWrap: 'balance',
                    }}
                >
                    {article.title}
                </h3>
                {article.excerpt && (
                    <p
                        style={{
                            margin: '8px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '14.5px',
                            lineHeight: 1.5,
                            color: 'var(--moskva)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {article.excerpt}
                    </p>
                )}
                <div
                    style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        color: 'var(--steinn)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}
                >
                    {article.author_name && <span>{article.author_name}</span>}
                    {article.author_name && published && <span style={{ opacity: 0.5 }}>·</span>}
                    {published && <span>{published}</span>}
                    {minutes !== null && <span style={{ opacity: 0.5 }}>·</span>}
                    {minutes !== null && <span>{minutes} mín</span>}
                </div>
            </div>

            <div
                aria-hidden
                style={{
                    color: 'var(--moskva)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '18px',
                    display: 'none',
                }}
                className="article-list-row-arrow"
            >
                →
            </div>

            <style>{`
                @media (min-width: 640px) {
                    .article-list-row-arrow { display: block !important; }
                }
            `}</style>
        </Link>
    );
}
