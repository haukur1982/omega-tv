'use client';

import Link from 'next/link';

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

interface ArticleProps {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    featured_image?: string | null;
    published_at: string;
}

export default function MagazineArticleCard({ article, isHero = false }: { article: ArticleProps; isHero?: boolean; index?: number }) {
    const imageUrl = article.featured_image || null;

    // ─── HERO CARD ─── Full-width cinematic feature card
    if (isHero) {
        return (
            <Link
                href={`/greinar/${article.slug}`}
                style={{
                    display: 'block',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    background: 'var(--bg-surface)',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid var(--border)',
                    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={article.title}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.75,
                                transition: 'transform 0.8s ease, opacity 0.5s ease',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.opacity = '0.6'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.75'; }}
                        />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />

                    {/* Type badge */}
                    <span style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '5px 10px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        zIndex: 3,
                    }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
                        Grein
                    </span>

                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Brennidepill
                            </span>
                            <span style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.25)' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {formatDate(article.published_at)}
                            </span>
                        </div>
                        <h3 style={{
                            fontFamily: 'var(--font-serif)',
                            color: 'white',
                            fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
                            fontWeight: 700,
                            lineHeight: 1.08,
                            letterSpacing: '-0.02em',
                            marginBottom: '0.75rem',
                            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                        }}>
                            {article.title}
                        </h3>
                        {article.excerpt && (
                            <p style={{
                                fontFamily: 'var(--font-serif)',
                                color: 'var(--text-secondary)',
                                fontSize: 'clamp(0.9rem, 1.5vw, 1.15rem)',
                                fontStyle: 'italic',
                                lineHeight: 1.55,
                                maxWidth: '50ch',
                                opacity: 0.85,
                            }}>
                                {article.excerpt}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        );
    }

    // ─── SIDE CARD ─── Mini tile card with thumbnail + text
    return (
        <Link
            href={`/greinar/${article.slug}`}
            style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                marginBottom: '0.75rem',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-surface)';
                e.currentTarget.style.transform = 'translateX(0)';
            }}
        >
            {/* Thumbnail */}
            {imageUrl ? (
                <div style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#1a1a1a',
                }}>
                    <img
                        src={imageUrl}
                        alt={article.title}
                        style={{ width: '88px', height: '88px', objectFit: 'cover', display: 'block' }}
                    />
                </div>
            ) : (
                <div style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '10px',
                    flexShrink: 0,
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                    </svg>
                </div>
            )}

            {/* Text content */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{
                    color: 'var(--accent)',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '0.35rem',
                }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
                    Grein · {formatDate(article.published_at)}
                </span>
                <h4 style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {article.title}
                </h4>
                {article.excerpt && (
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        lineHeight: 1.45,
                        margin: '0.3rem 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {article.excerpt}
                    </p>
                )}
            </div>
        </Link>
    );
}
