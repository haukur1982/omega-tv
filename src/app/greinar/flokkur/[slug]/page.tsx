import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleListRow from "@/components/articles/ArticleListRow";
import TopicStrip from "@/components/articles/TopicStrip";
import { type Article } from "@/components/articles/article-helpers";
import { getArticlesByCategory } from "@/lib/articles-db";
import { ARTICLE_CATEGORIES, categoryBySlug } from "@/lib/article-categories";
import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * /greinar/flokkur/[slug] — a single topic's articles.
 *
 * Same dark masthead → cream rhythm as /greinar, with the topic name
 * as the title and the topic strip underneath so readers can hop
 * between subjects. Built simple and legible for an older readership.
 */

export const revalidate = 3600;

export function generateStaticParams() {
    return ARTICLE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const category = categoryBySlug(slug);
    if (!category) notFound();

    const articles: Article[] = await getArticlesByCategory(category.key).catch(() => []);

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

                <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto' }}>
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
                        <Link href="/greinar" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Omega Tímaritið
                        </Link>
                        <span style={{ color: 'var(--steinn)', margin: '0 10px' }}>·</span>
                        <span style={{ color: 'var(--moskva)' }}>Efnisflokkur</span>
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(40px, 5vw, 70px)',
                            lineHeight: 1.04,
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            textWrap: 'balance',
                            maxWidth: '14ch',
                        }}
                    >
                        {category.label}
                    </h1>

                    <p
                        style={{
                            margin: '28px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(20px, 1.8vw, 25px)',
                            lineHeight: 1.48,
                            color: 'var(--moskva)',
                            textWrap: 'pretty',
                            maxWidth: '36rem',
                        }}
                    >
                        {category.blurb}
                    </p>

                    <div
                        aria-hidden
                        style={{ width: '52px', height: '1px', background: 'var(--gull)', margin: '34px 0 20px' }}
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
                        {articles.length} {articles.length === 1 ? 'grein' : 'greinar'}
                    </div>
                </div>
            </section>

            <TopicStrip activeSlug={category.slug} />

            {/* ─── Cream list ─────────────────────────────────────────── */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '64rem',
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
                        <p
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '20px',
                                lineHeight: 1.55,
                                color: 'var(--skra-mjuk)',
                                maxWidth: '34rem',
                            }}
                        >
                            Greinar í þessum flokki bætast við fljótlega. Líttu á aðra flokka á meðan.
                        </p>
                    )}

                    <div style={{ marginTop: 'clamp(48px, 6vw, 72px)' }}>
                        <Link
                            href="/greinar"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '13px',
                                fontWeight: 700,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: 'var(--mor)',
                                textDecoration: 'none',
                            }}
                        >
                            ← Allar greinar
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
