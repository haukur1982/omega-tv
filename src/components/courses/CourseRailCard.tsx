'use client';

import Link from 'next/link';

interface CourseRailCardProps {
    course: {
        id: string;
        slug: string;
        title: string;
        description: string;
        poster_horizontal: string | null;
        instructor?: string;
    };
}

const FALLBACK_GRADIENT = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

export default function CourseRailCard({ course }: CourseRailCardProps) {
    const imageUrl = course.poster_horizontal;

    return (
        <Link
            href={`/namskeid/${course.slug}`}
            style={{
                display: 'block',
                flex: '0 0 380px',
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                color: 'inherit',
            }}
        >
            <div
                style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease, border-color 0.3s ease',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 24px 55px rgba(0,0,0,0.5), 0 0 0 1px rgba(91,138,191,0.2)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                }}
            >
                {/* Thumbnail — 16:9, cinematic */}
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#0a0a0a' }}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={course.title}
                            loading="lazy"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transition: 'transform 0.6s ease',
                            }}
                            onError={(e) => {
                                // Fallback: hide broken image and show gradient
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) parent.style.background = FALLBACK_GRADIENT;
                            }}
                        />
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, background: FALLBACK_GRADIENT }} />
                    )}

                    {/* Gradient overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                        pointerEvents: 'none',
                    }} />

                    {/* Badge */}
                    <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'var(--accent)',
                        color: 'var(--bg-deep)',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                    }}>
                        Námskeið
                    </span>

                    {/* Play button overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                    }}>
                        <div
                            className="course-play-btn"
                            style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <polygon points="6,3 20,12 6,21" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div style={{ padding: '14px 16px 16px' }}>
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {course.title}
                    </h3>
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        margin: '6px 0 0',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {course.description}
                    </p>
                </div>
            </div>
        </Link>
    );
}
