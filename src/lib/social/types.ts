/**
 * src/lib/social/types.ts
 *
 * Shared types for the social template system.
 */

/**
 * Output formats a template can render to.
 * - `square` — Instagram feed, Facebook feed (1:1, 1080×1080)
 * - `story` — Instagram Story, Facebook Story (9:16, 1080×1920)
 * - `landscape` — Facebook feed wide, Twitter card (1.91:1, 1200×628)
 */
export type SocialFormat = 'square' | 'story' | 'landscape';

export const FORMAT_DIMENSIONS: Record<SocialFormat, { width: number; height: number }> = {
    square:    { width: 1080, height: 1080 },
    story:     { width: 1080, height: 1920 },
    landscape: { width: 1200, height: 628  },
};

/**
 * Altingi palette — re-exported here so templates can import without
 * reaching into globals.css token names.
 */
export const ALTINGI = {
    nott:    '#14120F', // Night Black
    mold:    '#1B1814', // Dark earth
    torfa:   '#242019', // Turf
    reykur:  '#2E2921', // Smoke
    skra:    '#F3EDE0', // Vellum
    ljos:    '#F6F2EA', // Light
    moskva:  '#B9B2A6', // Mist
    steinn:  '#7A7268', // Stone
    kerti:   '#E9A860', // Candle
    gull:    '#C88A3E', // Gold-foil
    blod:    '#D84B3A', // Blood (live-dot only)
} as const;

/**
 * A social template is a function that takes structured data + format
 * and returns a React element (JSX) for Satori to render.
 */
export interface SocialTemplateRegistry {
    id: string;
    label: string;            // Human-readable name ("Ritningin vikunnar")
    description: string;      // What this template is for
    formats: SocialFormat[];  // Which formats it supports
}
