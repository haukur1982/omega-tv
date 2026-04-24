import Link from "next/link";
import { type Article, readingMinutes, formatDateIs } from "./article-helpers";
import LetterPlaceholder from "./LetterPlaceholder";

/**
 * ArticleMidCard — an "editor's pick" card sitting below the featured
 * slot on /greinar. Two of these per row, same image-top/text-bottom
 * grammar as UrDagskranni's episode cards on the homepage.
 */

interface Props {
    article: Article;
}

export default function ArticleMidCard({ article }: Props) {
    const minutes = article.content ? readingMinutes(article.content) : null;
    const published = formatDateIs(article.published_at);

    return (
        <Link
            href={`/greinar/${article.slug}`}
            className="warm-hover"
            style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'var(--torfa)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'inherit',
            }}
        >
            <div style={{ position: 'relative', aspectRatio: '16 / 10', background: 'var(--nott)', overflow: 'hidden' }}>
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
                    <LetterPlaceholder title={article.title} />
                )}
            </div>
            <div style={{ padding: 'clamp(20px, 2.4vw, 26px)', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <span className="type-merki" style={{ color: 'var(--nordurljos)' }}>Ritstjórarval</span>
                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        lineHeight: 1.2,
                        letterSpacing: '-0.012em',
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
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '15px',
                            lineHeight: 1.55,
                            color: 'var(--moskva)',
                        }}
                    >
                        {article.excerpt}
                    </p>
                )}
                <div style={{ flex: 1 }} />
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        color: 'var(--steinn)',
                        letterSpacing: '0.12em',
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
        </Link>
    );
}
