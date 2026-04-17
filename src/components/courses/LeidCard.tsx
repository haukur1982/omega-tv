import Link from 'next/link';
import Image from 'next/image';

/**
 * Leið — Course Card archetype (§3.3 of the redesign plan).
 *
 * A course is a journey with stages. Show the route, not just a poster.
 *
 * Layout (desktop): 4:3 ratio, visual split 50/50 —
 *   Left half : instructor portrait cropped tall
 *   Right half: `--torfa` panel with title · instructor · VISIBLE module ladder
 *
 * The module ladder is the differentiator. Progress isn't hidden behind
 * a "resume" button — it IS the card. Boxes fill from left as the viewer
 * completes modules. Purely visual via the CSS ladder pulse on hover.
 */

export interface LeidCardProps {
    href: string;
    title: string;
    instructor?: string | null;
    /** Instructor or course photo, used for the left half. */
    image: string;
    /** Total number of modules in the course. */
    moduleCount: number;
    /** 0..moduleCount — number of modules the viewer has completed. */
    moduleProgress?: number;
    /** Short description or tagline (1 line). */
    description?: string | null;
    /** Total hours, rounded. */
    totalHours?: number | null;
}

export default function LeidCard({
    href,
    title,
    instructor,
    image,
    moduleCount,
    moduleProgress = 0,
    description,
    totalHours,
}: LeidCardProps) {
    const metaParts: string[] = ['NÁMSKEIÐ', `${moduleCount} EININGAR`];
    if (totalHours) metaParts.push(`${totalHours} KLST`);

    return (
        <Link
            href={href}
            className="warm-hover leid-card"
            style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 6fr)',
                aspectRatio: '4 / 3',
                background: 'var(--torfa)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
            }}
        >
            {/* Left — instructor portrait, cropped tall */}
            <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--nott)' }}>
                <Image
                    src={image}
                    alt={instructor ?? title}
                    fill
                    sizes="(max-width: 768px) 40vw, 300px"
                    style={{ objectFit: 'cover' }}
                />
                {/* Warm edge fade into the panel */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, transparent 60%, rgba(36, 32, 25, 0.75) 100%)',
                    }}
                />
            </div>

            {/* Right — structured panel */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 'clamp(16px, 2vw, 22px) clamp(18px, 2.2vw, 24px)',
                    gap: '10px',
                    minWidth: 0,
                }}
            >
                <p
                    className="type-merki"
                    style={{
                        margin: 0,
                        color: 'var(--moskva)',
                        letterSpacing: '0.22em',
                        fontSize: '0.62rem',
                    }}
                >
                    {metaParts.join(' · ')}
                </p>

                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 700,
                        color: 'var(--ljos)',
                        fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                        lineHeight: 1.2,
                        letterSpacing: '-0.015em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {title}
                </h3>

                {instructor && (
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            color: 'var(--moskva)',
                            fontSize: '0.9rem',
                            lineHeight: 1.4,
                        }}
                    >
                        {instructor}
                    </p>
                )}

                {description && (
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--steinn)',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {description}
                    </p>
                )}

                {/* Module ladder — the differentiator. Filled boxes = completed. */}
                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    <div
                        className="leid-ladder"
                        aria-label={`${moduleProgress} af ${moduleCount} einingum lokið`}
                        style={{ display: 'flex', gap: '4px' }}
                    >
                        {Array.from({ length: Math.max(moduleCount, 1) }, (_, i) => {
                            const filled = i < moduleProgress;
                            return (
                                <span
                                    key={i}
                                    className="leid-rung"
                                    aria-hidden="true"
                                    style={{
                                        flex: '1 1 0',
                                        height: '6px',
                                        background: filled ? 'var(--kerti)' : 'var(--reykur)',
                                        borderRadius: '1px',
                                        transition: 'background 250ms ease',
                                    }}
                                />
                            );
                        })}
                    </div>
                    <p
                        className="type-meta"
                        style={{
                            margin: '8px 0 0',
                            color: filledText(moduleProgress, moduleCount),
                            fontSize: '0.72rem',
                        }}
                    >
                        {moduleProgress > 0
                            ? `${moduleProgress} af ${moduleCount} einingum lokið`
                            : `${moduleCount} einingar · byrjaðu í dag`}
                    </p>
                </div>
            </div>
        </Link>
    );
}

function filledText(progress: number, total: number): string {
    if (progress === 0) return 'var(--steinn)';
    if (progress === total) return 'var(--kerti)';
    return 'var(--moskva)';
}
