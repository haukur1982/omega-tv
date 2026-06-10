import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArticleListRow from '@/components/articles/ArticleListRow';
import IsraelSubMasthead from '@/components/israel/IsraelSubMasthead';
import { getArticlesByCategory } from '@/lib/articles-db';

/**
 * /israel/greinar — the read surface of the Israel section.
 *
 * Same article components as /greinar, filtered to category='israel'.
 * Empty state stays honest (articles are Hawk's voice; never seeded) —
 * but instead of a dead-end it is a corridor: while no articles exist
 * yet, it points the reader to the teaching already living on /israel.
 */

export const metadata: Metadata = {
    title: 'Greinar um Ísrael | Omega Stöðin',
    description:
        'Fræðsla og umfjöllun um Ísrael — sáttmálinn, Ritninguna, og þjóðina sem Drottinn kallar sína.',
};

export const revalidate = 60;

export default async function IsraelGreinarPage() {
    const articles = await getArticlesByCategory('israel').catch(() => []);
    const metaLine =
        articles.length > 0
            ? articles.length === 1
                ? '1 grein'
                : `${articles.length} greinar`
            : undefined;

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            <IsraelSubMasthead
                crumb="Greinar"
                title="Greinar um Ísrael."
                lede="Fræðsla um sáttmálann, Ritninguna og þjóðina sem Drottinn kallar sína."
                image="/images/israel/greinar-masthead.jpg"
                metaLine={metaLine}
            />

            {/* Cream body — the reading room */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(96px, 12vw, 144px)',
                    }}
                >
                    {articles.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: '52rem' }}>
                            {articles.map((a) => (
                                <li key={a.id}>
                                    <ArticleListRow article={a} register="cream" />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyCorridor />
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

/**
 * The honest empty state, elevated: a promise (greinar koma) plus a
 * corridor into the teaching already on /israel — never a dead-end.
 */
function EmptyCorridor() {
    const doors: { href: string; kicker: string; title: string; line: string }[] = [
        {
            href: '/israel#skrifin',
            kicker: '1. Mósebók 12',
            title: 'Sáttmáli frá upphafi',
            line: 'Guð valdi sér land og þjóð — og stendur við orð sín.',
        },
        {
            href: '/israel#rotin',
            kicker: 'Rómverjabréfið 11',
            title: 'Rótin ber þig',
            line: 'Hvers vegna andúð á Gyðingum á sér ekkert skjól í kristinni trú.',
        },
        {
            href: '/israel#spadomar',
            kicker: 'Esekíel 37',
            title: 'Þurru beinin lifa',
            line: 'Spádómurinn um þjóð sem safnast aftur saman í landi feðra sinna.',
        },
    ];

    return (
        <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
            {/* the promise — kept honest, no fake articles */}
            <div style={{ textAlign: 'center' }}>
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--gull)',
                        marginBottom: '16px',
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
                        maxWidth: '36rem',
                        marginInline: 'auto',
                    }}
                >
                    Greinar um Ísrael — sáttmálinn, Rómverjabréfið 11, og kall
                    Íslands sem þjóðar — eru á leiðinni. Þær eru skrifaðar af
                    sannfæringu, ekki af áætlun.
                </p>
            </div>

            {/* the corridor — teaching that already exists */}
            <div
                style={{
                    marginTop: 'clamp(48px, 6vw, 64px)',
                    paddingTop: 'clamp(36px, 4.5vw, 48px)',
                    borderTop: '1px solid rgba(63,47,35,0.16)',
                }}
            >
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'rgba(63,47,35,0.55)',
                        marginBottom: 'clamp(24px, 3vw, 32px)',
                        textAlign: 'center',
                    }}
                >
                    Á meðan — fræðslan á Ísraelssíðunni
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 'clamp(20px, 2.5vw, 28px)',
                    }}
                >
                    {doors.map((d) => (
                        <Link
                            key={d.href}
                            href={d.href}
                            style={{
                                display: 'block',
                                padding: 'clamp(22px, 2.5vw, 30px)',
                                background: 'rgba(212,194,162,0.22)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(63,47,35,0.1)',
                                textDecoration: 'none',
                                color: 'var(--skra-djup)',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gull)',
                                    marginBottom: '10px',
                                }}
                            >
                                {d.kicker}
                            </div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontWeight: 400,
                                    fontSize: 'clamp(19px, 1.7vw, 23px)',
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.005em',
                                }}
                            >
                                {d.title}
                            </div>
                            <p
                                style={{
                                    margin: '10px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '14.5px',
                                    lineHeight: 1.5,
                                    color: 'rgba(63,47,35,0.7)',
                                }}
                            >
                                {d.line}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
