import Link from "next/link";
import { type Article, readingMinutes, formatDateIs } from "./article-helpers";
import LetterPlaceholder from "./LetterPlaceholder";

/**
 * ArticleFeaturedCard — the big featured slot at the top of /greinar.
 *
 * Full-width editorial card. Large image on the left, editorial text
 * block on the right on desktop; stacks to one column below ~820px.
 * Kicker + Fraunces title + italic Newsreader excerpt + author row.
 *
 * No amber — the card's pull comes from typography and image weight,
 * not a CTA. Warm-hover underglow on the whole card, no lift.
 */

interface Props {
    article: Article;
}

export default function ArticleFeaturedCard({ article }: Props) {
    const minutes = article.content ? readingMinutes(article.content) : null;
    const published = formatDateIs(article.published_at);

    return (
        <Link
            href={`/greinar/${article.slug}`}
            className="warm-hover"
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
                gap: 'clamp(24px, 4vw, 48px)',
                alignItems: 'stretch',
                padding: 'clamp(16px, 2vw, 24px)',
                background: 'var(--torfa)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'inherit',
            }}
            className-responsive="article-featured-grid"
        >
            {/* Image */}
            <div
                style={{
                    position: 'relative',
                    aspectRatio: '4 / 3',
                    borderRadius: 'var(--radius-sm)',
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
                    <LetterPlaceholder title={article.title} size="lg" />
                )}
            </div>

            {/* Text */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '16px',
                    padding: 'clamp(8px, 2vw, 20px) clamp(0px, 1vw, 8px)',
                    minWidth: 0,
                }}
            >
                <span
                    className="type-merki"
                    style={{ color: 'var(--nordurljos)' }}
                >
                    Brennidepill
                </span>
                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(28px, 3.4vw, 44px)',
                        lineHeight: 1.12,
                        letterSpacing: '-0.015em',
                        fontWeight: 400,
                        color: 'var(--ljos)',
                        textWrap: 'balance',
                    }}
                >
                    {article.title}
                </h2>
                {article.excerpt && (
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(16px, 1.4vw, 19px)',
                            lineHeight: 1.55,
                            color: 'var(--moskva)',
                            maxWidth: '48ch',
                            textWrap: 'pretty',
                        }}
                    >
                        {article.excerpt}
                    </p>
                )}
                <div
                    style={{
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        color: 'var(--steinn)',
                        letterSpacing: '0.08em',
                    }}
                >
                    {article.author_name && (
                        <>
                            <span
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '14px',
                                    color: 'var(--moskva)',
                                    letterSpacing: 0,
                                }}
                            >
                                {article.author_name}
                            </span>
                            <span style={{ opacity: 0.5 }}>·</span>
                        </>
                    )}
                    {published && (
                        <>
                            <span style={{ textTransform: 'uppercase' }}>{published}</span>
                            {minutes !== null && <span style={{ opacity: 0.5 }}>·</span>}
                        </>
                    )}
                    {minutes !== null && (
                        <span style={{ textTransform: 'uppercase' }}>{minutes} mín. lestur</span>
                    )}
                </div>
                <div
                    style={{
                        marginTop: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
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
            </div>
        </Link>
    );
}
