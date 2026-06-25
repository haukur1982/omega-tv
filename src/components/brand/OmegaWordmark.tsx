interface Props {
    /** Rendered height in px. Width scales automatically. */
    height?: number;
    /** Unique suffix for the mask id — pass a different value when the
     *  wordmark renders more than once on a page so masks don't collide. */
    uid?: string;
}

/**
 * Omega wordmark — "ΩMEGA". The Ω serves as the O: a stroked ring plus the
 * Ω glyph (Fraunces) with a small masked notch beneath it, followed by
 * "MEGA". From the Heimakirkja design. Uses currentColor, so it inherits the
 * surrounding text color. Decorative by default (aria-hidden) — give the
 * wrapping link/button an aria-label.
 */
export function OmegaWordmark({ height = 26, uid = 'omega' }: Props) {
    const maskId = `omegaCut-${uid}`;
    return (
        <svg
            viewBox="0 0 1000 300"
            height={height}
            aria-hidden
            style={{ height, width: 'auto', display: 'block', color: 'inherit' }}
        >
            <defs>
                <mask id={maskId} maskUnits="userSpaceOnUse">
                    <rect width="1000" height="300" fill="white" />
                    <rect x="0" y="212" width="240" height="6" fill="black" />
                </mask>
            </defs>
            <g mask={`url(#${maskId})`}>
                <g transform="translate(0,10)">
                    <circle cx="120" cy="120" r="104" stroke="currentColor" strokeWidth="22" fill="none" />
                    <text x="120" y="202" fill="currentColor" fontFamily="'Fraunces','Newsreader',Georgia,serif" fontSize="235" fontWeight="700" textAnchor="middle">Ω</text>
                </g>
            </g>
            <text x="248" y="212" fill="currentColor" fontFamily="'Fraunces','Newsreader',Georgia,serif" fontSize="235" fontWeight="700" letterSpacing="-0.005em">MEGA</text>
        </svg>
    );
}
