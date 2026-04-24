import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleContent from "@/components/articles/ArticleContent";
import ArticleRelated from "@/components/articles/ArticleRelated";
import { readingMinutes, formatDateIs, type Article } from "@/components/articles/article-helpers";
import { MOCK_ARTICLES } from "@/components/articles/mock-articles";
import { getArticleBySlug, getAllArticles } from "@/lib/articles-db";
import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * /greinar/[slug] — article detail.
 *
 * Dark editorial cover followed by a cream long-read frame.
 * The image supports the article instead of swallowing the first screen.
 */

export const revalidate = 60;

export async function generateStaticParams() {
    return [];
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
    const { slug } = await params;

    const real: Article | null = await getArticleBySlug(slug).catch(() => null);
    const article: Article | null =
        real ?? MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
    if (!article) notFound();

    const realAll = await getAllArticles().catch(() => [] as Article[]);
    const allArticles: Article[] =
        realAll && realAll.length > 0 ? realAll : [...MOCK_ARTICLES];
    const related = pickRelated(allArticles, article, 3);

    const minutes = readingMinutes(article.content);
    const published = formatDateIs(article.published_at);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            <section
                className="article-cover"
                style={{
                    position: 'relative',
                    background:
                        'linear-gradient(180deg, var(--nott) 0%, var(--mold) 100%)',
                    overflow: 'hidden',
                    padding: 'clamp(128px, 12vw, 176px) var(--rail-padding) clamp(64px, 8vw, 104px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div
                    className="article-cover-shell"
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        maxWidth: '80rem',
                        margin: '0 auto',
                    }}
                >
                    <div className="article-cover-copy">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                flexWrap: 'wrap',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--nordurljos)',
                                marginBottom: '24px',
                            }}
                        >
                            <Link
                                href="/greinar"
                                style={{ color: 'inherit', textDecoration: 'none' }}
                            >
                                Omega Tímaritið
                            </Link>
                            {published && (
                                <>
                                    <span style={{ color: 'var(--steinn)' }}>·</span>
                                    <span style={{ color: 'var(--moskva)' }}>{published}</span>
                                </>
                            )}
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(40px, 5.4vw, 76px)',
                                lineHeight: 1.02,
                                letterSpacing: 0,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                textWrap: 'balance',
                                maxWidth: '13ch',
                            }}
                        >
                            {article.title}
                        </h1>

                        {article.excerpt && (
                            <p
                                style={{
                                    margin: '28px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(20px, 1.8vw, 25px)',
                                    lineHeight: 1.48,
                                    color: 'var(--moskva)',
                                    letterSpacing: 0,
                                    textWrap: 'pretty',
                                    maxWidth: '34rem',
                                }}
                            >
                                {article.excerpt}
                            </p>
                        )}

                        <div
                            aria-hidden
                            style={{
                                width: '52px',
                                height: '1px',
                                background: 'var(--gull)',
                                margin: '34px 0 20px',
                            }}
                        />

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '14px',
                                flexWrap: 'wrap',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11.5px',
                                color: 'var(--steinn)',
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            {article.author_name && (
                                <>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-serif)',
                                            fontStyle: 'italic',
                                            fontSize: '15px',
                                            color: 'var(--ljos)',
                                            letterSpacing: 0,
                                            textTransform: 'none',
                                            fontWeight: 400,
                                        }}
                                    >
                                        {article.author_name}
                                    </span>
                                    <span style={{ opacity: 0.5 }}>·</span>
                                </>
                            )}
                            <span>{minutes} mín. lestur</span>
                        </div>
                    </div>

                    {article.featured_image && (
                        <div
                            className="article-cover-media"
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                background: 'var(--torfa)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-lift)',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={article.featured_image}
                                alt=""
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: '50% 58%',
                                    filter: 'saturate(0.88) contrast(1.04)',
                                }}
                            />
                            <div
                                aria-hidden
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background:
                                        'linear-gradient(180deg, rgba(20,18,15,0.08) 0%, rgba(20,18,15,0.22) 100%)',
                                }}
                            />
                        </div>
                    )}
                </div>
            </section>

            <article
                className="article-reading-frame"
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                    paddingBottom: 0,
                    boxShadow: 'var(--shadow-read)',
                }}
            >
                {/* Body — 46rem column at 19px body size gives ~78ch,
                    the magazine long-read sweet spot. */}
                <div
                    style={{
                        maxWidth: '46rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(64px, 10vw, 96px)',
                    }}
                >
                    <ArticleContent content={article.content} />
                </div>

                {/* Byline close */}
                {article.author_name && (
                    <div
                        style={{
                            maxWidth: '46rem',
                            margin: '0 auto',
                            padding: 'clamp(40px, 6vw, 56px) var(--rail-padding)',
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
                                color: 'var(--gull)',
                                marginBottom: '12px',
                            }}
                        >
                            Höfundur
                        </div>
                        <div
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '26px',
                                color: 'var(--skra-djup)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {article.author_name}
                        </div>
                    </div>
                )}

                {/* Related */}
                <ArticleRelated articles={related} />
            </article>

            <Footer />
        </main>
    );
}

/**
 * Pick related articles. Prefer same-author; fill the rest with the
 * newest-not-this. Caps at `count`. Skips the current article.
 */
function pickRelated(all: Article[], current: Article, count: number): Article[] {
    if (!all || all.length === 0) return [];
    const others = all.filter((a) => a.id !== current.id);
    others.sort((a, b) => {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        return db - da;
    });
    const sameAuthor = current.author_name
        ? others.filter((a) => a.author_name === current.author_name)
        : [];
    const rest = others.filter((a) => !sameAuthor.includes(a));
    return [...sameAuthor, ...rest].slice(0, count);
}
