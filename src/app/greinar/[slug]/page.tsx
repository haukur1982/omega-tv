import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleContent from "@/components/articles/ArticleContent";
import ArticleRelated from "@/components/articles/ArticleRelated";
import { readingMinutes, formatDateIs, type Article } from "@/components/articles/article-helpers";
import { getArticleBySlug, getAllArticles } from "@/lib/articles-db";
import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * /greinar/[slug] — article detail.
 *
 * The one page on the site where the palette inverts: vellum cream
 * background, dark ink body. The .article-reading-frame and
 * .article-prose classes in globals.css do the heavy lifting (drop
 * cap, proper line-height, blockquote styling, em color, link color).
 *
 * Composition:
 *   - Dark Navbar (stays)
 *   - Vellum article frame begins — header (kicker, title, excerpt,
 *     byline meta), optional featured image, body, byline close.
 *   - Related articles on vellum at the bottom.
 *   - Dark Footer (horizon line flips back).
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

    const article: Article | null = await getArticleBySlug(slug).catch(() => null);
    if (!article) notFound();

    const allArticles = await getAllArticles().catch(() => [] as Article[]);
    const related = pickRelated(allArticles, article, 3);

    const minutes = readingMinutes(article.content);
    const published = formatDateIs(article.published_at);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* Vellum reading frame. .article-reading-frame inverts colors
                for the `.article-prose` block inside it. */}
            <article
                className="article-reading-frame"
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                    paddingTop: 'clamp(120px, 14vw, 160px)',
                    paddingBottom: 0,
                    boxShadow: 'var(--shadow-read)',
                }}
            >
                {/* Header */}
                <header
                    style={{
                        maxWidth: '40rem',
                        margin: '0 auto',
                        padding: '0 var(--rail-padding) clamp(32px, 5vw, 48px)',
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
                            marginBottom: '20px',
                        }}
                    >
                        <Link
                            href="/greinar"
                            style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                            Omega Tímaritið
                        </Link>
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(32px, 4.4vw, 52px)',
                            lineHeight: 1.08,
                            letterSpacing: '-0.016em',
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            textWrap: 'balance',
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
                                fontSize: 'clamp(18px, 1.8vw, 22px)',
                                lineHeight: 1.5,
                                color: 'var(--skra-mjuk)',
                                textWrap: 'pretty',
                            }}
                        >
                            {article.excerpt}
                        </p>
                    )}
                    <div
                        style={{
                            marginTop: '32px',
                            paddingTop: '20px',
                            borderTop: '1px solid rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            color: 'var(--skra-mjuk)',
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
                                        color: 'var(--skra-djup)',
                                        letterSpacing: 0,
                                    }}
                                >
                                    {article.author_name}
                                </span>
                                <span style={{ opacity: 0.4 }}>·</span>
                            </>
                        )}
                        {published && (
                            <>
                                <span style={{ textTransform: 'uppercase' }}>{published}</span>
                                <span style={{ opacity: 0.4 }}>·</span>
                            </>
                        )}
                        <span style={{ textTransform: 'uppercase' }}>{minutes} mín. lestur</span>
                    </div>
                </header>

                {/* Featured image, if present — sits between header and body
                    like a plate in a magazine article. */}
                {article.featured_image && (
                    <figure
                        style={{
                            maxWidth: '56rem',
                            margin: '0 auto',
                            padding: '0 var(--rail-padding) clamp(40px, 6vw, 56px)',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={article.featured_image}
                            alt=""
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 'var(--radius-sm)',
                                display: 'block',
                            }}
                        />
                    </figure>
                )}

                {/* Body */}
                <div
                    style={{
                        maxWidth: '40rem',
                        margin: '0 auto',
                        padding: '0 var(--rail-padding) clamp(64px, 10vw, 96px)',
                    }}
                >
                    <ArticleContent content={article.content} />
                </div>

                {/* Byline close */}
                {article.author_name && (
                    <div
                        style={{
                            maxWidth: '40rem',
                            margin: '0 auto',
                            padding: 'clamp(32px, 5vw, 48px) var(--rail-padding)',
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
                                marginBottom: '10px',
                            }}
                        >
                            Höfundur
                        </div>
                        <div
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '22px',
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
