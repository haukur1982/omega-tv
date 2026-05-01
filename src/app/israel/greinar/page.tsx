import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArticleListRow from '@/components/articles/ArticleListRow';
import { getArticlesByCategory } from '@/lib/articles-db';

/**
 * /israel/greinar — focused list of Israel-tagged articles.
 *
 * Same article-helpers/ArticleListRow components as /greinar — these
 * are the same articles, just filtered to category='israel'. An
 * Israel article appears in both /greinar and here.
 *
 * Empty state intentionally honest. We don't seed mock Israel articles
 * to make the list look populated — articles are Hawk's voice
 * (project standing rule).
 */

export const metadata: Metadata = {
    title: 'Greinar um Ísrael | Omega Stöðin',
    description:
        'Fræðsla og umfjöllun um Ísrael — sáttmálinn, Ritninguna, og þjóðina sem Drottinn kallar sína.',
};

export const revalidate = 60;

export default async function IsraelGreinarPage() {
    const articles = await getArticlesByCategory('israel').catch(() => []);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* Dark masthead */}
            <section
                className="article-cover"
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(48px, 6vw, 72px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div className="article-cover-shell" style={{ maxWidth: '80rem', margin: '0 auto' }}>
                    <div className="article-cover-copy">
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--nordurljos)',
                                marginBottom: '20px',
                            }}
                        >
                            <Link
                                href="/israel"
                                style={{ color: 'inherit', textDecoration: 'none' }}
                            >
                                Ísrael
                            </Link>
                            <span style={{ opacity: 0.5, padding: '0 8px' }}>·</span>
                            <span style={{ color: 'var(--moskva)' }}>Greinar</span>
                        </div>
                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(40px, 5vw, 70px)',
                                lineHeight: 1.04,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.005em',
                                maxWidth: '15ch',
                            }}
                        >
                            Greinar um Ísrael.
                        </h1>
                        <p
                            style={{
                                margin: '24px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(18px, 1.6vw, 22px)',
                                color: 'var(--moskva)',
                                maxWidth: '34rem',
                                lineHeight: 1.55,
                            }}
                        >
                            Fræðsla um sáttmálann, Ritninguna og þjóðina sem Drottinn kallar sína.
                        </p>
                    </div>
                </div>
            </section>

            {/* Cream body */}
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
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(96px, 12vw, 144px)',
                    }}
                >
                    {articles.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {articles.map((a) => (
                                <li key={a.id}>
                                    <ArticleListRow article={a} register="cream" />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div
                            style={{
                                padding: 'clamp(56px, 7vw, 80px) clamp(28px, 4vw, 48px)',
                                border: '1px dashed rgba(63,47,35,0.2)',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(212,194,162,0.18)',
                                textAlign: 'center',
                                maxWidth: '46rem',
                                margin: '0 auto',
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
                                    marginBottom: '14px',
                                }}
                            >
                                Komandi greinar
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(18px, 1.7vw, 22px)',
                                    lineHeight: 1.55,
                                    color: 'var(--skra-djup)',
                                    maxWidth: '34rem',
                                    marginInline: 'auto',
                                }}
                            >
                                Fræðsla um Ísrael — sáttmálinn, Rómverjabréfið 11, og kall Íslands sem þjóðar — er á leiðinni. Greinar eru skrifaðar af sannfæringu, ekki af áætlun.
                            </p>
                            <Link
                                href="/israel"
                                style={{
                                    display: 'inline-block',
                                    marginTop: '28px',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    letterSpacing: '0.16em',
                                    textTransform: 'uppercase',
                                    color: 'var(--skra-djup)',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid var(--gull)',
                                    paddingBottom: '2px',
                                }}
                            >
                                ← Aftur í Ísrael
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
