import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleListRow from "@/components/articles/ArticleListRow";
import LetterPlaceholder from "@/components/articles/LetterPlaceholder";
import { type Article, readingMinutes, formatDateIs } from "@/components/articles/article-helpers";
import { MOCK_ARTICLES } from "@/components/articles/mock-articles";
import { getAllArticles } from "@/lib/articles-db";
import Link from "next/link";

/**
 * /greinar — "Omega Tímaritið" — the magazine.
 *
 * Editorial flow (dark masthead → cream body → dark footer):
 *
 *   1. Dark masthead — kicker "Omega Tímaritið", title "Greinar.",
 *      italic excerpt, gold rule, byline-row + right-side magazine
 *      issue stamp ("Hefti · Apríl 2026").
 *
 *   2. Cream featured (Brennidepill) — single cinematic editorial
 *      card. Big image left, kicker + serif title + italic excerpt +
 *      gold rule + byline + Lesa CTA right. Magazine front-of-section.
 *
 *   3. Pergament editor's picks (Ritstjórarval) — 2 mid-cards on
 *      slightly warmer cream tint for tonal breathing.
 *
 *   4. Cream archive (Safnið) — chronological list rows on cream.
 *
 * The dark→cream rhythm matches /baenatorg, /israel, /sermons and
 * fixes the all-dark heaviness the older /greinar had. Reading
 * surfaces live on cream — that's the cathedral psychology lock.
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

    articles.sort((a, b) => {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        return db - da;
    });

    const [featured, ...rest] = articles;
    const picks = rest.slice(0, 2);
    const archive = rest.slice(2);

    const issueLabel = formatIssueLabel(featured?.published_at);

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
                {/* Quiet dawn radial — same as /sermons + /israel */}
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
                            Næring fyrir andann — lesefni um trúna, lífið og vonina, í ritstjórn Omega.
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

            {/* ─── Cream featured (Brennidepill) ──────────────────────── */}
            {featured && (
                <section
                    style={{
                        background: 'var(--skra)',
                        color: 'var(--skra-djup)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '80rem',
                            margin: '0 auto',
                            padding: 'clamp(72px, 9vw, 112px) var(--rail-padding) clamp(56px, 7vw, 80px)',
                        }}
                    >
                        <FeaturedArticle article={featured} />
                    </div>
                </section>
            )}

            {/* ─── Pergament editor's picks (Ritstjórarval) ───────────── */}
            {picks.length > 0 && (
                <section
                    style={{
                        background: 'var(--skra-warm)',
                        color: 'var(--skra-djup)',
                        borderTop: '1px solid rgba(63,47,35,0.12)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '80rem',
                            margin: '0 auto',
                            padding: 'clamp(64px, 8vw, 96px) var(--rail-padding)',
                        }}
                    >
                        <header style={{ marginBottom: 'clamp(32px, 4vw, 48px)', maxWidth: '52rem' }}>
                            <div
                                aria-hidden
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    marginBottom: '28px',
                                }}
                            >
                                <span style={{ width: '32px', height: '1px', background: 'var(--gull)' }} />
                                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                                    <circle cx="5" cy="5" r="2" fill="var(--gull)" />
                                </svg>
                                <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
                            </div>

                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gull)',
                                    marginBottom: '14px',
                                }}
                            >
                                Ritstjórarval
                            </div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(28px, 3.2vw, 40px)',
                                    lineHeight: 1.1,
                                    fontWeight: 400,
                                    color: 'var(--skra-djup)',
                                    letterSpacing: '-0.005em',
                                }}
                            >
                                Annað sem ritstjórn mælir með
                            </h2>
                        </header>

                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'grid',
                                gap: 'clamp(28px, 3vw, 40px)',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            }}
                        >
                            {picks.map((p) => (
                                <li key={p.id}>
                                    <PickCard article={p} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* ─── Cream archive (Safnið) ─────────────────────────────── */}
            {archive.length > 0 && (
                <section
                    style={{
                        background: 'var(--skra)',
                        color: 'var(--skra-djup)',
                        borderTop: '1px solid rgba(63,47,35,0.12)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '64rem',
                            margin: '0 auto',
                            padding: 'clamp(64px, 8vw, 96px) var(--rail-padding) clamp(96px, 12vw, 144px)',
                        }}
                    >
                        <header style={{ marginBottom: 'clamp(32px, 4vw, 48px)', maxWidth: '52rem' }}>
                            <div
                                aria-hidden
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    marginBottom: '28px',
                                }}
                            >
                                <span style={{ width: '32px', height: '1px', background: 'var(--gull)' }} />
                                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                                    <circle cx="5" cy="5" r="2" fill="var(--gull)" />
                                </svg>
                                <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
                            </div>

                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gull)',
                                    marginBottom: '14px',
                                }}
                            >
                                Safnið
                            </div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(28px, 3.2vw, 40px)',
                                    lineHeight: 1.1,
                                    fontWeight: 400,
                                    color: 'var(--skra-djup)',
                                    letterSpacing: '-0.005em',
                                }}
                            >
                                Eldri greinar
                            </h2>
                        </header>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {archive.map((a) => (
                                <li key={a.id}>
                                    <ArticleListRow article={a} register="cream" />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <Footer />
        </main>
    );
}

/* ─── Featured article — cinematic cream layout ───────────────────── */

function FeaturedArticle({ article }: { article: Article }) {
    const minutes = article.content ? readingMinutes(article.content) : null;
    const published = formatDateIs(article.published_at);

    return (
        <article
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
                gap: 'clamp(32px, 5vw, 64px)',
                alignItems: 'center',
            }}
            className="featured-article-grid"
        >
            <Link
                href={`/greinar/${article.slug}`}
                style={{ display: 'block', textDecoration: 'none' }}
            >
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16 / 10',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(63,47,35,0.08)',
                        boxShadow: '0 30px 60px -32px rgba(20,18,15,0.4)',
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
                            }}
                        />
                    ) : (
                        <LetterPlaceholder title={article.title} size="lg" register="cream" />
                    )}
                </div>
            </Link>

            <div>
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--gull)',
                        marginBottom: '14px',
                    }}
                >
                    Brennidepill
                </div>

                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(28px, 3.4vw, 44px)',
                        lineHeight: 1.1,
                        fontWeight: 400,
                        color: 'var(--skra-djup)',
                        letterSpacing: '-0.008em',
                        textWrap: 'balance',
                    }}
                >
                    {article.title}
                </h2>

                {article.excerpt && (
                    <p
                        style={{
                            margin: '20px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(17px, 1.5vw, 20px)',
                            lineHeight: 1.55,
                            color: 'var(--skra-mjuk)',
                            textWrap: 'pretty',
                        }}
                    >
                        {article.excerpt}
                    </p>
                )}

                <div
                    aria-hidden
                    style={{
                        width: '40px',
                        height: '1px',
                        background: 'var(--gull)',
                        margin: '28px 0 16px',
                    }}
                />

                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--skra-mjuk)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'baseline',
                        flexWrap: 'wrap',
                    }}
                >
                    {article.author_name && <span>{article.author_name}</span>}
                    {article.author_name && published && <span style={{ opacity: 0.4 }}>·</span>}
                    {published && <span>{published}</span>}
                    {minutes !== null && <span style={{ opacity: 0.4 }}>·</span>}
                    {minutes !== null && <span>{minutes} mín lestur</span>}
                </div>

                <Link
                    href={`/greinar/${article.slug}`}
                    style={{
                        marginTop: '32px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 28px',
                        background: 'var(--skra-djup)',
                        color: 'var(--skra)',
                        border: '1px solid var(--skra-djup)',
                        borderRadius: 'var(--radius-xs)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                    }}
                >
                    Lesa greinina
                </Link>
            </div>
        </article>
    );
}

/* ─── Editor's pick mid-card — cream register ─────────────────────── */

function PickCard({ article }: { article: Article }) {
    const minutes = article.content ? readingMinutes(article.content) : null;
    const published = formatDateIs(article.published_at);

    return (
        <Link
            href={`/greinar/${article.slug}`}
            style={{ display: 'block', color: 'var(--skra-djup)', textDecoration: 'none' }}
        >
            <article style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16 / 10',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(63,47,35,0.08)',
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
                            }}
                        />
                    ) : (
                        <LetterPlaceholder title={article.title} size="md" register="cream" />
                    )}
                </div>
                <div>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(22px, 2vw, 28px)',
                            lineHeight: 1.18,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                            textWrap: 'balance',
                        }}
                    >
                        {article.title}
                    </h3>
                    {article.excerpt && (
                        <p
                            style={{
                                margin: '12px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '15.5px',
                                lineHeight: 1.55,
                                color: 'var(--skra-mjuk)',
                                textWrap: 'pretty',
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
                            marginTop: '16px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--skra-mjuk)',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'baseline',
                            flexWrap: 'wrap',
                        }}
                    >
                        {article.author_name && <span>{article.author_name}</span>}
                        {article.author_name && published && <span style={{ opacity: 0.4 }}>·</span>}
                        {published && <span>{published}</span>}
                        {minutes !== null && <span style={{ opacity: 0.4 }}>·</span>}
                        {minutes !== null && <span>{minutes} mín</span>}
                    </div>
                </div>
            </article>
        </Link>
    );
}

/* ─── Issue label helper — "Hefti 17 · Apríl 2026" style ──────────── */

function formatIssueLabel(iso: string | null | undefined): { number: string; month: string } {
    const date = iso ? new Date(iso) : new Date();
    // Approximate "issue number" — week of year. Magazines have weekly issues; this gives
    // an editorial cadence stamp without needing a separate issue table.
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
