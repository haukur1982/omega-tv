/**
 * Custom Omega-voice icons for Bænatorg.
 *
 * Hand-authored SVGs, never Lucide — per the brand rule.
 * Stroke-based, 24×24 viewBox, currentColor, round caps/joins.
 * Trailing strokeWidth 1.55 matches the Omega mark's ring stroke.
 */

type IconProps = { size?: number; className?: string };

const base = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

export function IcoHands({ size = 18, className }: IconProps) {
    return (
        <svg width={size} height={size} {...base} strokeWidth={1.55} className={className} aria-hidden>
            <path d="M7.4 20.5 C 5.6 19.6, 4.4 17.4, 4.4 14.8 L 4.4 10 C 4.4 8.4, 5.4 7.4, 6.6 7.4 C 7.8 7.4, 8.8 8.4, 8.8 10 L 8.8 13.2" />
            <path d="M16.6 20.5 C 18.4 19.6, 19.6 17.4, 19.6 14.8 L 19.6 10 C 19.6 8.4, 18.6 7.4, 17.4 7.4 C 16.2 7.4, 15.2 8.4, 15.2 10 L 15.2 13.2" />
            <path d="M8.8 13.2 C 8.8 10.6, 9.8 9.2, 12 9.2 C 14.2 9.2, 15.2 10.6, 15.2 13.2" />
            <path d="M7.4 20.5 L 16.6 20.5" />
        </svg>
    );
}

export function IcoFeather({ size = 18, className }: IconProps) {
    return (
        <svg width={size} height={size} {...base} strokeWidth={1.55} className={className} aria-hidden>
            <path d="M5 19 L 14.5 9.5" />
            <path d="M14.5 9.5 C 17 7, 19 6, 20 5 C 19 7, 18 9, 15.5 11 L 11.5 11" />
            <path d="M14 10.5 L 11.5 11" />
            <path d="M5 19 L 5.8 18.2" />
        </svg>
    );
}

export function IcoShare({ size = 16, className }: IconProps) {
    return (
        <svg width={size} height={size} {...base} strokeWidth={1.55} className={className} aria-hidden>
            <circle cx="6" cy="12" r="2.2" />
            <circle cx="17" cy="6.2" r="2.2" />
            <circle cx="17" cy="17.8" r="2.2" />
            <path d="M8 11 L 15 7.2" />
            <path d="M8 13 L 15 16.8" />
        </svg>
    );
}

export function IcoHeartCheck({ size = 14, className }: IconProps) {
    return (
        <svg width={size} height={size} {...base} strokeWidth={1.55} className={className} aria-hidden>
            <path d="M12 20 C 5.5 16, 3 12.5, 3 9 C 3 6.5, 5 4.5, 7.5 4.5 C 9.5 4.5, 11 5.5, 12 7 C 13 5.5, 14.5 4.5, 16.5 4.5 C 19 4.5, 21 6.5, 21 9 C 21 12.5, 18.5 16, 12 20 Z" />
            <path d="M9 11.2 L 11 13.2 L 15 9.2" />
        </svg>
    );
}

export function IcoClose({ size = 16, className }: IconProps) {
    return (
        <svg width={size} height={size} {...base} strokeWidth={1.7} className={className} aria-hidden>
            <path d="M6.5 6.5 L 17.5 17.5" />
            <path d="M17.5 6.5 L 6.5 17.5" />
        </svg>
    );
}

export function IcoQuote({ size = 28, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="currentColor" className={className} aria-hidden>
            <path d="M12 10 C 7 11, 4 14, 4 19 C 4 23, 6.5 25.5, 10 25.5 C 12.5 25.5, 14.5 23.5, 14.5 21 C 14.5 18.5, 12.8 17, 10.8 17 C 10.8 14.5, 12 13, 14 12 Z" />
            <path d="M26 10 C 21 11, 18 14, 18 19 C 18 23, 20.5 25.5, 24 25.5 C 26.5 25.5, 28.5 23.5, 28.5 21 C 28.5 18.5, 26.8 17, 24.8 17 C 24.8 14.5, 26 13, 28 12 Z" />
        </svg>
    );
}
