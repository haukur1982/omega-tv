'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { type Article, readingMinutes } from './article-helpers';
import LetterPlaceholder from './LetterPlaceholder';
import { ARTICLE_CATEGORIES, categoryByKey } from '@/lib/article-categories';

/**
 * ArticleLibrary — the browse experience for /greinar.
 *
 * Default (browse) mode: a cinematic featured piece, then one
 * horizontally-scrolling row per topic (Lækning, Bænheyrsla...).
 * Pick a topic chip or type in search and it switches to a filtered
 * card grid in place. Built on the cream register with the same gold
 * and serif language as the rest of the magazine, and deliberately
 * large and legible for an older readership.
 */

interface Props {
    articles: Article[];
}

export default function ArticleLibrary({ articles }: Props) {
    const [topic, setTopic] = useState<string | null>(null);
    const [q, setQ] = useState('');

    const query = q.trim().toLowerCase();
    const searching = query.length > 0;
    const browseMode = !topic && !searching;

    const topics = useMemo(
        () =>
            ARTICLE_CATEGORIES.map((c) => ({
                ...c,
                n: articles.filter((a) => a.category === c.key).length,
            })).filter((c) => c.n > 0),
        [articles],
    );

    const filtered = useMemo(
        () =>
            articles.filter((a) => {
                if (topic && a.category !== topic) return false;
                if (query) {
                    const hay = `${a.title} ${a.excerpt ?? ''} ${a.author_name ?? ''}`.toLowerCase();
                    if (!hay.includes(query)) return false;
                }
                return true;
            }),
        [articles, topic, query],
    );

    const featured = articles[0];

    return (
        <div style={{ paddingBottom: 'clamp(96px, 12vw, 144px)' }}>
            {browseMode && featured && (
                <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(40px, 5vw, 64px)' }}>
                    <FeaturedHero article={featured} />
                </div>
            )}

            <FilterBar
                topics={topics}
                active={topic}
                onTopic={(k) => setTopic((cur) => (cur === k ? null : k))}
                q={q}
                onQ={setQ}
            />

            {browseMode ? (
                <div>
                    {topics.map((t) => {
                        const row = articles.filter((a) => a.category === t.key && a.id !== featured?.id);
                        if (row.length === 0) return null;
                        return <TopicRow key={t.key} label={t.label} slug={t.slug} articles={row} />;
                    })}
                </div>
            ) : (
                <ResultsGrid
                    articles={filtered}
                    onClear={() => {
                        setTopic(null);
                        setQ('');
                    }}
                />
            )}
        </div>
    );
}

/* ─── Featured hero ──────────────────────────────────────────────── */

function FeaturedHero({ article }: { article: Article }) {
    const cat = categoryByKey(article.category);
    const minutes = article.content ? readingMinutes(article.content) : null;

    return (
        <Link
            href={`/greinar/${article.slug}`}
            style={{ display: 'block', textDecoration: 'none', color: 'var(--skra-djup)' }}
        >
            <article
                className="featured-article-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
                    gap: 'clamp(32px, 5vw, 64px)',
                    alignItems: 'center',
                }}
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
                        <img src={article.featured_image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <LetterPlaceholder title={article.title} size="lg" register="cream" />
                    )}
                </div>

                <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--mor)', marginBottom: '14px' }}>
                        Brennidepill{cat ? ` · ${cat.label}` : ''}
                    </div>
                    <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1.1, fontWeight: 400, color: 'var(--skra-djup)', letterSpacing: '-0.008em', textWrap: 'balance' }}>
                        {article.title}
                    </h2>
                    {article.excerpt && (
                        <p style={{ margin: '20px 0 0', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(17px, 1.5vw, 20px)', lineHeight: 1.55, color: 'var(--skra-mjuk)', textWrap: 'pretty' }}>
                            {article.excerpt}
                        </p>
                    )}
                    <div aria-hidden style={{ width: '40px', height: '1px', background: 'var(--gull)', margin: '28px 0 16px' }} />
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--skra-mjuk)', display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        {article.author_name && <span>{article.author_name}</span>}
                        {minutes !== null && <span style={{ opacity: 0.4 }}>·</span>}
                        {minutes !== null && <span>{minutes} mín lestur</span>}
                    </div>
                </div>
            </article>
        </Link>
    );
}

/* ─── Sticky filter + search ─────────────────────────────────────── */

function FilterBar({
    topics,
    active,
    onTopic,
    q,
    onQ,
}: {
    topics: { key: string; slug: string; label: string }[];
    active: string | null;
    onTopic: (key: string) => void;
    q: string;
    onQ: (v: string) => void;
}) {
    return (
        <div
            style={{
                position: 'sticky',
                top: 72,
                zIndex: 20,
                background: 'var(--skra)',
                borderTop: '1px solid rgba(63,47,35,0.12)',
                borderBottom: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: '16px var(--rail-padding)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <li>
                        <Chip label="Allt" active={active === null} onClick={() => onTopic(active ?? '')} />
                    </li>
                    {topics.map((t) => (
                        <li key={t.slug}>
                            <Chip label={t.label} active={active === t.key} onClick={() => onTopic(t.key)} />
                        </li>
                    ))}
                </ul>

                <input
                    type="search"
                    value={q}
                    onChange={(e) => onQ(e.target.value)}
                    placeholder="Leita í safninu…"
                    aria-label="Leita í greinum"
                    style={{
                        flex: '0 1 240px',
                        padding: '11px 16px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '15px',
                        color: 'var(--skra-djup)',
                        background: 'rgba(63,47,35,0.05)',
                        border: '1px solid rgba(63,47,35,0.2)',
                        borderRadius: 'var(--radius-xs)',
                        outline: 'none',
                    }}
                />
            </div>
        </div>
    );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="warm-hover"
            style={{
                padding: '11px 20px',
                border: `1px solid ${active ? 'var(--skra-djup)' : 'rgba(63,47,35,0.25)'}`,
                background: active ? 'var(--skra-djup)' : 'transparent',
                color: active ? 'var(--skra)' : 'var(--skra-djup)',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                cursor: 'pointer',
            }}
        >
            {label}
        </button>
    );
}

/* ─── Topic row (horizontal) ─────────────────────────────────────── */

function TopicRow({ label, slug, articles }: { label: string; slug: string; articles: Article[] }) {
    return (
        <section style={{ maxWidth: '80rem', margin: '0 auto', padding: 'clamp(40px, 5vw, 60px) var(--rail-padding) 0' }}>
            <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 400, color: 'var(--skra-djup)', letterSpacing: '-0.005em' }}>
                    {label}
                </h2>
                <Link
                    href={`/greinar/flokkur/${slug}`}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mor)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                    Sjá allt →
                </Link>
            </header>

            <div
                style={{
                    display: 'flex',
                    gap: 'clamp(20px, 2vw, 28px)',
                    overflowX: 'auto',
                    scrollSnapType: 'x proximity',
                    paddingBottom: '10px',
                    scrollbarWidth: 'thin',
                }}
            >
                {articles.map((a) => (
                    <div key={a.id} style={{ flex: '0 0 clamp(260px, 80vw, 320px)', scrollSnapAlign: 'start' }}>
                        <Card article={a} />
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ─── Filtered grid ──────────────────────────────────────────────── */

function ResultsGrid({ articles, onClear }: { articles: Article[]; onClear: () => void }) {
    return (
        <section style={{ maxWidth: '80rem', margin: '0 auto', padding: 'clamp(40px, 5vw, 60px) var(--rail-padding) 0' }}>
            {articles.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: 'var(--skra-mjuk)' }}>
                    Engar greinar fundust.{' '}
                    <button type="button" onClick={onClear} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--mor)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>
                        Hreinsa síu
                    </button>
                </p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(28px, 3vw, 40px)' }}>
                    {articles.map((a) => (
                        <Card key={a.id} article={a} />
                    ))}
                </div>
            )}
        </section>
    );
}

/* ─── Card (shared by rows + grid) ───────────────────────────────── */

function Card({ article }: { article: Article }) {
    const cat = categoryByKey(article.category);
    const minutes = article.content ? readingMinutes(article.content) : null;

    return (
        <Link href={`/greinar/${article.slug}`} style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--skra-djup)' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: 'var(--radius-sm)', background: 'rgba(63,47,35,0.08)' }}>
                {article.featured_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={article.featured_image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <LetterPlaceholder title={article.title} register="cream" />
                )}
            </div>

            {cat && (
                <div style={{ marginTop: '14px', fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mor)' }}>
                    {cat.label}
                </div>
            )}
            <h3 style={{ margin: '8px 0 0', fontFamily: 'var(--font-serif)', fontSize: '21px', lineHeight: 1.2, fontWeight: 400, color: 'var(--skra-djup)', letterSpacing: '-0.005em', textWrap: 'balance' }}>
                {article.title}
            </h3>
            {article.excerpt && (
                <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '15px', lineHeight: 1.5, color: 'var(--skra-mjuk)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.excerpt}
                </p>
            )}
            <div style={{ marginTop: '12px', fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--skra-mjuk)', display: 'flex', gap: '8px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                {article.author_name && <span>{article.author_name}</span>}
                {article.author_name && minutes !== null && <span style={{ opacity: 0.4 }}>·</span>}
                {minutes !== null && <span>{minutes} mín</span>}
            </div>
        </Link>
    );
}
