import Link from "next/link";
import { type Article, readingMinutes, formatDateIs } from "./article-helpers";
import LetterPlaceholder from "./LetterPlaceholder";

/**
 * ArticleRelated — "Fleiri greinar" section at the bottom of a vellum
 * article detail. Two cards. Lives on cream, so colors invert from
 * the dark-page pattern.
 *
 * Content selection is the caller's responsibility (the /greinar/[slug]
 * page picks same-author-first, then newest-not-this). This component
 * just renders.
 */

interface Props {
    articles: Article[];
}

export default function ArticleRelated({ articles }: Props) {
    if (articles.length === 0) return null;

    return (
        <section
            style={{
                maxWidth: '56rem',
                margin: '0 auto',
                padding: 'clamp(64px, 8vw, 96px) var(--rail-padding)',
                borderTop: '1px solid rgba(0,0,0,0.1)',
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--skra-mjuk)',
                    marginBottom: '32px',
                }}
            >
                Fleiri greinar
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '24px',
                }}
            >
                {articles.map((a) => (
                    <Link
                        key={a.id}
                        href={`/greinar/${a.slug}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        <div
                            style={{
                                position: 'relative',
                                aspectRatio: '16 / 10',
                                overflow: 'hidden',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(0,0,0,0.08)',
                            }}
                        >
                            {a.featured_image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={a.featured_image}
                                    alt=""
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        filter: 'saturate(0.9)',
                                    }}
                                />
                            ) : (
                                <LetterPlaceholder title={a.title} />
                            )}
                        </div>
                        <h4
                            style={{
                                margin: '16px 0 6px',
                                fontFamily: 'var(--font-serif)',
                                fontSize: '19px',
                                lineHeight: 1.25,
                                letterSpacing: '-0.01em',
                                fontWeight: 400,
                                color: 'var(--skra-djup)',
                            }}
                        >
                            {a.title}
                        </h4>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                color: 'var(--skra-mjuk)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                            }}
                        >
                            {a.author_name && <span>{a.author_name}</span>}
                            {a.author_name && a.published_at && <span style={{ opacity: 0.5 }}>·</span>}
                            {a.published_at && <span>{formatDateIs(a.published_at)}</span>}
                            {a.content && (
                                <>
                                    <span style={{ opacity: 0.5 }}>·</span>
                                    <span>{readingMinutes(a.content)} mín</span>
                                </>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
