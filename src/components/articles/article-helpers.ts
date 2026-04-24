import type { Database } from "@/types/supabase";

export type Article = Database['public']['Tables']['articles']['Row'];

/** Reading time in whole minutes. 200 wpm is conservative for Icelandic. */
export function readingMinutes(content: string): number {
    const words = content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

/**
 * Icelandic date — "20. apríl 2026". Uses native toLocaleDateString with is-IS.
 * Returns empty string when the input is null/undefined so templates can fall
 * through without conditionals.
 */
export function formatDateIs(iso: string | null | undefined): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('is-IS', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * First letter of the article title — for the letter-placeholder pattern
 * used when an article has no featured_image. Preserves Icelandic glyphs
 * (Þ, Æ, Ö etc.) as-is.
 */
export function titleInitial(title: string): string {
    const first = title.trim().charAt(0);
    return first.toLocaleUpperCase('is-IS');
}
