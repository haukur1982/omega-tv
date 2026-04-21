/**
 * src/lib/social/typeface.ts
 *
 * Typeface families that templates can switch between.
 *
 * Each family maps logical roles (display, body, ui) to specific font
 * families that Satori knows about (must be registered in fonts.ts).
 *
 * Used for A/B comparing typography directions without duplicating
 * template code. Templates accept a `typeface` prop and read role
 * names from this map.
 */

export type TypefaceId = 'classic' | 'fraunces';

export interface TypefaceFamily {
    /** Display face — hero text, Scripture verses, program titles */
    display: string;
    /** Editorial body face — pull quotes, host attribution, descriptions */
    body: string;
    /** UI face — kickers, citations, meta, labels */
    ui: string;
}

export const TYPEFACES: Record<TypefaceId, TypefaceFamily> = {
    /**
     * Classic — the v1 brand stack.
     * Source Serif 4 + Libre Baskerville + Inter.
     * Tasteful, ubiquitous in premium dark-mode design.
     */
    classic: {
        display: 'Source Serif 4',
        body: 'Libre Baskerville',
        ui: 'Inter',
    },

    /**
     * Fraunces — the distinctiveness experiment.
     * Fraunces (Undercase Type) + Newsreader (Production Type) + Inter.
     * Variable optical sizing on display, less common in 2026 premium
     * design, designed specifically for editorial reading.
     */
    fraunces: {
        display: 'Fraunces',
        body: 'Newsreader',
        ui: 'Inter',
    },
};

export function resolveTypeface(id?: string | null): TypefaceFamily {
    if (id && id in TYPEFACES) {
        return TYPEFACES[id as TypefaceId];
    }
    // Default: Fraunces + Newsreader + Inter (the v2 stack).
    // Pass ?typeface=classic to opt back into Source Serif 4 + Libre Baskerville.
    return TYPEFACES.fraunces;
}
