import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { type Article } from "@/components/articles/article-helpers";
import { MOCK_ARTICLES } from "@/components/articles/mock-articles";
import { getAllArticles } from "@/lib/articles-db";
import ArticleLibrary from "@/components/articles/ArticleLibrary";

/**
 * /greinar — "Omega Tímaritið" — the magazine.
 *
 * Dark masthead → cream library. The browse experience (featured hero,
 * sticky topic filter, search, streaming-style topic rows, and a
 * filtered card grid) lives in the ArticleLibrary client component so
 * readers can SEE and FILTER content, not just scroll a list.
 */

export const revalidate = 3600;

const SHOW_MOCK = process.env.NEXT_PUBLIC_CONTENT_MOCKS === '1';

export default async function ArticlesPage() {
    let articles: Article[] = [];
    try {
        const real = await getAllArticles();
        if (real && real.length > 0) articles = real;
    } catch (err) {
        console.error('Failed to load articles:', err);
    }
    // Launch policy: real articles only. Mock fillers are dev-only.
    if (articles.length === 0 && SHOW_MOCK) articles = [...MOCK_ARTICLES];

    articles.sort((a, b) => {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        return db - da;
    });

    const issueLabel = formatIssueLabel(articles[0]?.published_at);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* ─── Dark masthead ─────────────────────────────────────── */}
            <section
                className="article-cover"
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(56px, 7vw, 88px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(ellipse at 82% 18%, rgba(233,168,96,0.10) 0%, transparent 55%)',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    className="article-cover-shell baenatorg-cover-grid"
                    style={{
                        position: 'relative',
                        maxWidth: '80rem',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 48rem) 1fr',
                        gap: 'clamp(48px, 6vw, 96px)',
                        alignItems: 'end',
                    }}
                >
                    <div className="article-cover-copy">
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--nordurljos)',
                                marginBottom: '24px',
                            }}
                        >
                            Omega Tímaritið
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(40px, 5vw, 70px)',
                                lineHeight: 1.04,
                                letterSpacing: 0,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                textWrap: 'balance',
                                maxWidth: '14ch',
                            }}
                        >
                            Greinar.
                        </h1>

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
                                maxWidth: '36rem',
                            }}
                        >
                            Næring fyrir andann. Lesefni um trúna, lífið og vonina, í ritstjórn Omega.
                        </p>

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
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11.5px',
                                color: 'var(--steinn)',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            Síðan 1992 · {articles.length} {articles.length === 1 ? 'grein' : 'greinar'} í safni
                        </div>
                    </div>

                    {/* Magazine issue stamp — right column */}
                    <aside
                        className="baenatorg-epigraph"
                        style={{
                            textAlign: 'right',
                            color: 'var(--moskva)',
                            justifySelf: 'end',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                color: 'var(--steinn)',
                                marginBottom: '12px',
                            }}
                        >
                            Hefti
                        </div>
                        <div
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(36px, 4vw, 52px)',
                                lineHeight: 1,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.01em',
                                fontFeatureSettings: '"lnum", "tnum"',
                            }}
                        >
                            {issueLabel.number}
                        </div>
                        <div
                            style={{
                                marginTop: '12px',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '15px',
                                color: 'var(--moskva)',
                                letterSpacing: 0,
                            }}
                        >
                            {issueLabel.month}
                        </div>
                    </aside>
                </div>
            </section>

            {/* ─── Cream library ─────────────────────────────────────── */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <ArticleLibrary articles={articles} />
            </section>

            <Footer />
        </main>
    );
}

/* ─── Issue label helper — "Hefti 17 · Apríl 2026" style ──────────── */

function formatIssueLabel(iso: string | null | undefined): { number: string; month: string } {
    const date = iso ? new Date(iso) : new Date();
    // Approximate "issue number" — week of year, an editorial cadence stamp.
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = (date.getTime() - start.getTime()) / 86400000;
    const week = Math.ceil((diff + start.getDay() + 1) / 7);
    const monthLabel = date.toLocaleDateString('is-IS', { month: 'long', year: 'numeric' });
    const cap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    return {
        number: String(week).padStart(2, '0'),
        month: cap,
    };
}
