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
 * Layered composition (top → bottom):
 *
 *   1. Dark overture — the hero photograph occupies a ~68vh band at
 *      the top of the page. Navbar floats over it in its default
 *      transparent-over-hero state. A gradient stack darkens the top
 *      (so the navbar reads) and fades the bottom edge into --skra
 *      vellum cream, so the image dissolves into the page rather
 *      than ending in a hard rectangle.
 *
 *      When an article has no featured_image, the overture degrades
 *      gracefully to a warm-black band with a quiet amber radial
 *      wash — the page still opens with a dark corridor before
 *      stepping into cream.
 *
 *   2. Vellum article frame — kicker · large Fraunces title · italic
 *      deck · gold-foil rule · byline in smallcaps. Wider container
 *      (48rem) so the masthead has room to breathe.
 *
 *   3. Body — .article-reading-frame + .article-prose rules in
 *      globals.css do the drop cap, line-height, blockquote, em
 *      color work. Body column widened to 44rem (~74ch), which is
 *      inside the typographically orthodox range for vellum-on-cream
 *      and reads more like a magazine long-read than a blog post.
 *
 *   4. Byline close — quiet, slightly tighter than before.
 *
 *   5. Related articles on vellum.
 *
 *   6. Dark Footer — horizon flips back.
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

            {/* 1. DARK OVERTURE — hero image or warm-black amber wash.
                The navbar floats over this in its transparent state.
                Bottom edge fades into --skra so the vellum begins
                without a seam. */}
            <section
                aria-hidden={article.featured_image ? undefined : true}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: 'clamp(380px, 58vh, 680px)',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                }}
            >
                {article.featured_image ? (
                    <>
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
                                filter: 'saturate(0.85) contrast(1.02)',
                            }}
                        />
                        {/* Top darkening so the navbar sits cleanly */}
                        <div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'linear-gradient(to bottom, rgba(20,18,15,0.62) 0%, rgba(20,18,15,0.12) 28%, rgba(20,18,15,0.04) 58%, rgba(243,237,224,0.18) 78%, var(--skra) 100%)',
                            }}
                        />
                        {/* Amber tint in the upper corner — evening-light warmth */}
                        <div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'radial-gradient(ellipse at 78% 20%, rgba(233,168,96,0.12) 0%, transparent 55%)',
                                pointerEvents: 'none',
                            }}
                        />
                    </>
                ) : (
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'radial-gradient(ellipse at 50% 30%, rgba(233,168,96,0.14) 0%, transparent 55%), linear-gradient(to bottom, var(--nott) 0%, var(--mold) 60%, var(--skra) 100%)',
                        }}
                    />
                )}
            </section>

            {/* 2–5. VELLUM ARTICLE FRAME */}
            <article
                className="article-reading-frame"
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                    paddingBottom: 0,
                    boxShadow: 'var(--shadow-read)',
                    // Pull the vellum into the bottom of the photograph so the
                    // masthead feels connected to the opening image.
                    marginTop: 'clamp(-92px, -7vw, -64px)',
                }}
            >
                {/* Header — centered masthead composition, matches the
                    full-width image above. Left-aligned body follows
                    (different modes: masthead announces, body reads). */}
                <header
                    style={{
                        maxWidth: '48rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 6vw, 76px) var(--rail-padding) clamp(34px, 5vw, 46px)',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: '14px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--gull)',
                            marginBottom: '32px',
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
                                <span style={{ color: 'var(--skra-mjuk)', opacity: 0.4 }}>·</span>
                                <span style={{ color: 'var(--skra-mjuk)' }}>{published}</span>
                            </>
                        )}
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(32px, 5vw, 58px)',
                            lineHeight: 1.08,
                            letterSpacing: 0,
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
                                margin: '32px auto 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(19px, 1.9vw, 24px)',
                                lineHeight: 1.5,
                                color: 'var(--skra-mjuk)',
                                letterSpacing: 0,
                                textWrap: 'pretty',
                                maxWidth: '38rem',
                            }}
                        >
                            {article.excerpt}
                        </p>
                    )}

                    {/* Short gold-foil rule as a visual anchor (not a
                        full-width divider — this is an ornament, not a
                        section break). Centered byline underneath. */}
                    <div
                        aria-hidden
                        style={{
                            width: '56px',
                            height: '1px',
                            background: 'var(--gull)',
                            margin: '40px auto 20px',
                        }}
                    />
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: '14px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11.5px',
                            color: 'var(--skra-mjuk)',
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
                                        color: 'var(--skra-djup)',
                                        letterSpacing: 0,
                                        textTransform: 'none',
                                        fontWeight: 400,
                                    }}
                                >
                                    {article.author_name}
                                </span>
                                <span style={{ opacity: 0.4 }}>·</span>
                            </>
                        )}
                        <span>{minutes} mín. lestur</span>
                    </div>
                </header>

                {/* Body — 46rem column at 19px body size gives ~78ch,
                    the magazine long-read sweet spot. */}
                <div
                    style={{
                        maxWidth: '46rem',
                        margin: '0 auto',
                        padding: 'clamp(16px, 3vw, 24px) var(--rail-padding) clamp(64px, 10vw, 96px)',
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
