import { titleInitial } from "./article-helpers";

/**
 * LetterPlaceholder — Fraunces glyph on --torfa, per brand-guide.md
 * ("Placeholders: solid --torfa with a small serif letter in --steinn").
 *
 * Used when an article has no featured_image. Kept visually quiet so
 * it reads as "there will be an image here" rather than competing
 * with articles that have real imagery.
 */

interface Props {
    title: string;
    size?: 'sm' | 'md' | 'lg';
    register?: 'dark' | 'cream';
}

const SIZE_MAP = {
    sm: '5rem',
    md: '8rem',
    lg: 'clamp(8rem, 14vw, 14rem)',
} as const;

export default function LetterPlaceholder({ title, size = 'md', register = 'dark' }: Props) {
    const tokens =
        register === 'cream'
            ? { bg: 'rgba(212,194,162,0.32)', color: 'rgba(63,47,35,0.55)', opacity: 0.85 }
            : { bg: 'var(--torfa)', color: 'var(--steinn)', opacity: 0.55 };

    return (
        <div
            aria-hidden
            style={{
                position: 'absolute',
                inset: 0,
                background: tokens.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <span
                style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    fontSize: SIZE_MAP[size],
                    color: tokens.color,
                    letterSpacing: '-0.035em',
                    lineHeight: 1,
                    opacity: tokens.opacity,
                }}
            >
                {titleInitial(title)}
            </span>
        </div>
    );
}
