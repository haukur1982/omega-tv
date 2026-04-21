/**
 * src/components/brand/OmegaMark.tsx
 *
 * The official Omega mark — Greek Ω inside a circle with the signature
 * horizontal cut at the bottom. Inline SVG so it inherits color from
 * the parent via `currentColor` (set the parent's CSS `color` to change
 * the mark's color).
 *
 * Source of truth: brand-assets/omega-mark.svg.
 * This component embeds the same geometry inline so it can be used
 * across React components without an extra HTTP request.
 *
 * See docs/brand-guide.md §2 for the rules around this mark:
 *   - Flat color only, ever (no gradients, chrome, bevel)
 *   - Primary: Kerti gold on Night Black
 *   - Inverse: Night Black on Vellum Cream
 */

import React from 'react';

export interface OmegaMarkProps {
    /** Pixel size (width = height). Defaults to 32. */
    size?: number;
    /** Optional className on the wrapping <span>. */
    className?: string;
    /** Optional accessible label. Defaults to "Omega". */
    title?: string;
}

export function OmegaMark({ size = 32, className, title = 'Omega' }: OmegaMarkProps) {
    return (
        <span
            className={className}
            style={{
                display: 'inline-flex',
                width: size,
                height: size,
                lineHeight: 0,
            }}
            aria-label={title}
            role="img"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 240 240"
                fill="none"
                width={size}
                height={size}
            >
                <title>{title}</title>
                <defs>
                    <mask id="omega-mark-cut" maskUnits="userSpaceOnUse">
                        <rect width="240" height="240" fill="white" />
                        <rect x="0" y="202" width="240" height="6" fill="black" />
                    </mask>
                </defs>
                <g mask="url(#omega-mark-cut)">
                    <circle
                        cx="120"
                        cy="120"
                        r="104"
                        stroke="currentColor"
                        strokeWidth="22"
                        fill="none"
                    />
                    <text
                        x="120"
                        y="202"
                        fill="currentColor"
                        fontFamily="'Fraunces', 'Newsreader', Georgia, serif"
                        fontSize="235"
                        fontWeight="700"
                        textAnchor="middle"
                    >
                        Ω
                    </text>
                </g>
            </svg>
        </span>
    );
}
