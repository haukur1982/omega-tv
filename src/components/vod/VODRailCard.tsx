'use client';

import Link from 'next/link';

interface VODRailCardProps {
    video: {
        id: string;
        title: string;
        speaker: string;
        duration: string;
        thumbnail: string;
        date: string;
    };
}

export default function VODRailCard({ video }: VODRailCardProps) {
    return (
        <Link
            href={`/sermons/${video.id}`}
            style={{
                display: 'block',
                flex: '0 0 min(320px, 85vw)',
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                color: 'inherit',
            }}
        >
            <div
                style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease, border-color 0.3s ease',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(91,138,191,0.15)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                }}
            >
                {/* Thumbnail — 16:9 */}
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#0a0a0a' }}>
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.6s ease',
                        }}
                    />
                    {/* Bottom gradient for text contrast */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                            pointerEvents: 'none',
                        }}
                    />
                    {/* Type badge */}
                    <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        zIndex: 2,
                    }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21" /></svg>
                        Myndband
                    </span>
                    {/* Duration badge */}
                    <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(4px)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 7px',
                        borderRadius: '4px',
                        letterSpacing: '0.02em',
                    }}>
                        {video.duration} mín
                    </span>
                    {/* Play overlay */}
                    <div
                        className="vod-play-overlay"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.35)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none',
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s ease',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <polygon points="6,3 20,12 6,21" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div style={{ padding: '12px 14px 14px' }}>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {video.title}
                    </h3>
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        margin: '4px 0 0',
                        lineHeight: 1.3,
                    }}>
                        {video.speaker}
                    </p>
                </div>
            </div>
        </Link>
    );
}
