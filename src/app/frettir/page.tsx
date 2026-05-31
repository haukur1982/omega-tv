import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { getPublishedNews, type NewsItem } from '@/lib/news-db';

/**
 * /frettir — translated Christian world news, time-sensitive feed.
 *
 * Editorial frame: dark masthead → cream body. Cards show title +
 * summary + source attribution + date. Click → /frettir/[slug].
 *
 * Cathedral rhythm matches the rest of the site, but the visual weight
 * is lighter than /sermons (no posters) and lighter than /greinar
 * (shorter, time-decaying content).
 */

export const revalidate = 60;
export const metadata = {
    title: 'Fréttir | Omega Stöðin',
    description: 'Þýddar kristnar heimsfréttir — það sem skiptir máli í alþjóðakirkjunni.',
};

function formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('is-IS', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

export default async function FrettirPage() {
    const items = await getPublishedNews(50).catch(() => [] as NewsItem[]);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* Dark masthead */}
            <section
                style={{
                    background: 'var(--nott)',
                    padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(56px, 7vw, 88px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
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
                        Fréttir
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(40px, 5vw, 70px)',
                            lineHeight: 1.04,
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            letterSpacing: 0,
                            textWrap: 'balance',
                            maxWidth: '20ch',
                        }}
                    >
                        Heimsfréttir frá kristnu sjónarhorni.
                    </h1>
                    <p
                        style={{
                            margin: '28px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(20px, 1.8vw, 25px)',
                            lineHeight: 1.48,
                            color: 'var(--moskva)',
                            maxWidth: '36rem',
                            textWrap: 'pretty',
                        }}
                    >
                        Það sem skiptir máli í alþjóðlegu kirkjunni — ofsóknir, vöxtur ríkisins, trúboð — þýtt á íslensku með heimild til upprunalegu greinarinnar.
                    </p>
                    <div
                        aria-hidden
                        style={{ width: '52px', height: '1px', background: 'var(--gull)', margin: '34px 0 0' }}
                    />
                </div>
            </section>

            {/* Cream feed */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '64rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(96px, 12vw, 144px)',
                    }}
                >
                    {items.length === 0 ? (
                        <div
                            style={{
                                padding: 'clamp(56px, 7vw, 80px) clamp(28px, 4vw, 48px)',
                                border: '1px dashed rgba(63,47,35,0.2)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--skra-warm)',
                                textAlign: 'center',
                                maxWidth: '46rem',
                                margin: '0 auto',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(18px, 1.7vw, 22px)',
                                    lineHeight: 1.55,
                                }}
                            >
                                Fréttir bætast hér við þegar þær koma. Á meðan — biðjið fyrir bræðrum og systrum okkar um allan heim.
                            </p>
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(40px, 5vw, 64px)' }}>
                            {items.map((item) => (
                                <NewsCard key={item.id} item={item} />
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

function NewsCard({ item }: { item: NewsItem }) {
    return (
        <li>
            <Link
                href={`/frettir/${item.slug}`}
                style={{
                    display: 'block',
                    color: 'var(--skra-djup)',
                    textDecoration: 'none',
                    paddingBottom: 'clamp(36px, 4vw, 56px)',
                    borderBottom: '1px solid rgba(63,47,35,0.1)',
                }}
            >
                <article style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Meta row */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flexWrap: 'wrap',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--mor)',
                        }}
                    >
                        {item.region && <span>{item.region}</span>}
                        {item.region && item.publishedAt && <span style={{ opacity: 0.4 }}>·</span>}
                        {item.publishedAt && <span style={{ color: 'var(--skra-mjuk)' }}>{formatDate(item.publishedAt)}</span>}
                    </div>

                    {/* Title */}
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(26px, 2.8vw, 36px)',
                            lineHeight: 1.18,
                            fontWeight: 400,
                            letterSpacing: '-0.005em',
                            textWrap: 'balance',
                        }}
                    >
                        {item.title}
                    </h2>

                    {/* Summary */}
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(16px, 1.4vw, 18px)',
                            lineHeight: 1.6,
                            color: 'var(--skra-mjuk)',
                            textWrap: 'pretty',
                            maxWidth: '46rem',
                        }}
                    >
                        {item.summary}
                    </p>

                    {/* Source */}
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11.5px',
                            color: 'var(--skra-mjuk)',
                            letterSpacing: '0.04em',
                        }}
                    >
                        Heimild: <span style={{ fontWeight: 600, color: 'var(--skra-djup)' }}>{item.sourceName}</span>
                    </div>
                </article>
            </Link>
        </li>
    );
}
