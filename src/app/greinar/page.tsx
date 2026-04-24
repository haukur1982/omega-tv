import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeaturedCard from "@/components/articles/ArticleFeaturedCard";
import ArticleMidCard from "@/components/articles/ArticleMidCard";
import ArticleListRow from "@/components/articles/ArticleListRow";
import type { Article } from "@/components/articles/article-helpers";
import { MOCK_ARTICLES } from "@/components/articles/mock-articles";
import { getAllArticles } from "@/lib/articles-db";

/**
 * /greinar — "Omega Tímaritið" article index.
 *
 * Composition (top to bottom):
 *   1. Masthead    — "Omega Tímaritið" kicker, "Greinar" Fraunces
 *                    title, italic Newsreader subtitle.
 *   2. Featured    — one full-width editorial card (newest article).
 *   3. Editor's picks — two ArticleMidCards (next two newest).
 *   4. Archive     — chronological list rows (the rest).
 *
 * Selection logic: newest-first across the board. No tag filters, no
 * pagination — the archive is small. When it grows past ~50 items we
 * revisit. For editorial control over what's featured, a simple
 * `is_featured` boolean on the articles table is enough; today's
 * heuristic is honest and low-maintenance.
 */

export const revalidate = 3600;

export default async function ArticlesPage() {
    let articles: Article[] = [];
    try {
        const real = await getAllArticles();
        if (real && real.length > 0) {
            const realSlugs = new Set(real.map((a) => a.slug));
            const uniqueMocks = MOCK_ARTICLES.filter((m) => !realSlugs.has(m.slug));
            articles = [...real, ...uniqueMocks];
        }
    } catch (err) {
        console.error('Failed to load articles:', err);
    }
    if (articles.length === 0) articles = [...MOCK_ARTICLES];

    // Newest first
    articles.sort((a, b) => {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        return db - da;
    });

    const [featured, ...rest] = articles;
    const picks = rest.slice(0, 2);
    const archive = rest.slice(2);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* Masthead */}
            <section
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(120px, 14vw, 160px) var(--rail-padding) clamp(32px, 4vw, 48px)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 'clamp(24px, 4vw, 48px)',
                        flexWrap: 'wrap',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: 'clamp(28px, 4vw, 40px)',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--nordurljos)',
                                marginBottom: '14px',
                            }}
                        >
                            Omega Tímaritið
                        </div>
                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(44px, 6vw, 76px)',
                                lineHeight: 1.02,
                                letterSpacing: '-0.018em',
                                fontWeight: 400,
                                color: 'var(--ljos)',
                            }}
                        >
                            Greinar
                        </h1>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(16px, 1.5vw, 19px)',
                            lineHeight: 1.55,
                            color: 'var(--moskva)',
                            maxWidth: '38ch',
                            paddingBottom: '6px',
                        }}
                    >
                        Næring fyrir andann — lesefni um trúna, lífið og vonina.
                    </p>
                </div>
            </section>

            {/* Featured */}
            {featured && (
                <section
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: '0 var(--rail-padding) clamp(32px, 4vw, 48px)',
                    }}
                >
                    <ArticleFeaturedCard article={featured} />
                </section>
            )}

            {/* Editor's picks */}
            {picks.length > 0 && (
                <section
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: '0 var(--rail-padding) clamp(48px, 6vw, 64px)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'clamp(18px, 2vw, 24px)',
                    }}
                >
                    {picks.map((a) => (
                        <ArticleMidCard key={a.id} article={a} />
                    ))}
                </section>
            )}

            {/* Archive list */}
            {archive.length > 0 && (
                <section
                    style={{
                        maxWidth: '72rem',
                        margin: '0 auto',
                        padding: '0 var(--rail-padding) clamp(72px, 10vw, 120px)',
                    }}
                >
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--moskva)',
                            marginBottom: '20px',
                            paddingBottom: '14px',
                            borderBottom: '1px solid var(--border)',
                        }}
                    >
                        Safnið
                    </div>
                    <div>
                        {archive.map((a) => (
                            <ArticleListRow key={a.id} article={a} />
                        ))}
                    </div>
                </section>
            )}

            <Footer />
        </main>
    );
}
