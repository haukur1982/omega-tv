import Link from 'next/link';
import Image from 'next/image';

/**
 * Gluggi — Sermon Card archetype (§3.1 of the redesign plan).
 *
 * A sermon is a moment in time captured on video — cinematic 16:9 frame,
 * warm-not-lift hover, optional italic editor annotation above the title.
 * No play-button overlay (the warming IS the affordance).
 */

export interface GluggiCardProps {
    href: string;
    thumbnail: string;
    title: string;
    show?: string | null;
    durationMin?: number | null;
    /** Short date line — e.g. "3. APR" */
    dateDisplay?: string | null;
    /** Optional editor annotation, italic amber, ≤80 chars */
    editorNote?: string | null;
    /** If captions_available has entries, shows a small "CC IS/EN" chip */
    captions?: string[] | null;
}

export default function GluggiCard({
    href,
    thumbnail,
    title,
    show,
    durationMin,
    dateDisplay,
    editorNote,
    captions,
}: GluggiCardProps) {
    // Build the single-line metadata overlay text: "SHOW · 28 MÍN · 3. APR"
    const metaParts: string[] = [];
    if (show) metaParts.push(show.toUpperCase());
    if (durationMin) metaParts.push(`${durationMin} MÍN`);
    if (dateDisplay) metaParts.push(dateDisplay.toUpperCase());
    const metaLine = metaParts.join(' · ');

    const ccChip = captions && captions.length > 0
        ? captions.map(c => c.toUpperCase()).join('/')
        : null;

    return (
        <Link
            href={href}
            className="warm-hover"
            style={{
                position: 'relative',
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                background: 'var(--torfa)',
            }}
        >
            {/* 16:9 thumbnail */}
            <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--nott)' }}>
                <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 360px"
                    style={{ objectFit: 'cover' }}
                />
                {/* Bottom gradient so overlay text stays readable */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(20,18,15,0.9) 0%, rgba(20,18,15,0.25) 38%, transparent 60%)',
                    }}
                />
                {/* Metadata line — bottom-left */}
                {metaLine && (
                    <p
                        className="type-merki"
                        style={{
                            position: 'absolute',
                            left: '14px',
                            right: '14px',
                            bottom: '12px',
                            margin: 0,
                            color: 'var(--ljos)',
                            fontSize: '0.62rem',
                            letterSpacing: '0.2em',
                            textShadow: '0 1px 6px rgba(10,8,5,0.6)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {metaLine}
                    </p>
                )}
                {/* CC chip — top-right, only when captions exist */}
                {ccChip && (
                    <span
                        className="type-merki"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '3px 7px',
                            background: 'rgba(20,18,15,0.7)',
                            backdropFilter: 'blur(6px)',
                            color: 'var(--ljos)',
                            fontSize: '0.58rem',
                            letterSpacing: '0.16em',
                            borderRadius: '2px',
                            border: '1px solid rgba(246, 242, 234, 0.12)',
                        }}
                    >
                        CC · {ccChip}
                    </span>
                )}
            </div>

            {/* Text block */}
            <div style={{ padding: '14px 16px 18px' }}>
                {editorNote && (
                    <p
                        style={{
                            margin: '0 0 6px',
                            color: 'var(--kerti)',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '0.82rem',
                            lineHeight: 1.45,
                        }}
                    >
                        {editorNote}
                    </p>
                )}
                <h3
                    className="type-yfirskrift"
                    style={{
                        margin: 0,
                        color: 'var(--ljos)',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        lineHeight: 1.25,
                        letterSpacing: '-0.01em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {title}
                </h3>
            </div>
        </Link>
    );
}
