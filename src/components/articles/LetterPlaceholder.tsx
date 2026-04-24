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
}

const SIZE_MAP = {
    sm: '5rem',
    md: '8rem',
    lg: 'clamp(8rem, 14vw, 14rem)',
} as const;

export default function LetterPlaceholder({ title, size = 'md' }: Props) {
    return (
        <div
            aria-hidden
            style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--torfa)',
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
                    color: 'var(--steinn)',
                    letterSpacing: '-0.035em',
                    lineHeight: 1,
                    opacity: 0.55,
                }}
            >
                {titleInitial(title)}
            </span>
        </div>
    );
}
