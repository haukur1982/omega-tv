'use client';

import Link from 'next/link';

interface PortraitCardProps {
    sermon: {
        id: string;
        title: string;
        speaker?: string;
        thumbnail: string;
    };
}

export default function PortraitSermonCard({ sermon }: PortraitCardProps) {
    return (
        <Link
            href={`/sermons/${sermon.id}`}
            style={{
                display: 'block',
                flex: '0 0 200px',
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                color: 'inherit',
            }}
        >
            <div
                style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    aspectRatio: '2/3',
                    position: 'relative',
                    background: '#1c1c1e',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease, border-color 0.3s ease',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.04)';
                    e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,138,191,0.15)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                }}
            >
                <img
                    src={sermon.thumbnail}
                    alt={sermon.title}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.6s ease',
                    }}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
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
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    fontSize: '8px',
                    fontWeight: 800,
                    padding: '3px 7px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    zIndex: 2,
                }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    Prédikun
                </span>

                {/* Bottom gradient with title overlay */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '2rem 14px 14px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                    }}
                >
                    <p style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'white',
                        lineHeight: 1.3,
                        margin: 0,
                        textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {sermon.title}
                    </p>
                </div>

                {/* Play icon (hover) */}
                <div
                    className="vod-play-overlay"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.25)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                    }}
                >
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <polygon points="6,3 20,12 6,21" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
