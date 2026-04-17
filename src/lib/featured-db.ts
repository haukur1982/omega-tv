import { supabase } from './supabase';

// Phase 1: `featured_weeks` isn't in the generated Database types yet.
// Use an untyped view of the client for this table only; the return
// shape is validated via the FeaturedWeek type below.
// When typegen is re-run, switch this back to the typed `supabase` client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = supabase as any;

/**
 * The weekly feature row that anchors the homepage.
 *
 * Written by admin in the new `featured_weeks` table. One row per week.
 * Falls back to an evergreen row (is_fallback = true) if no new feature
 * ships for the current week.
 *
 * Phase 1: minimal fields — image, kicker, headline, body, two CTAs.
 * Later phases will light up sermon_id_pick / article_id_pick / prayer_id_pick
 * / featured_passage_ref / featured_series_id as the cross-content threads
 * go live (see plans/twinkling-mapping-pizza.md §8).
 */
export type FeaturedWeek = {
    id: string;
    week_start_date: string;
    hero_image_url: string;
    hero_image_alt: string | null;
    kicker: string;
    headline: string;
    body: string;
    primary_cta_label: string;
    primary_cta_href: string;
    secondary_cta_label: string | null;
    secondary_cta_href: string | null;
    sermon_id_pick: string | null;
    article_id_pick: string | null;
    prayer_id_pick: string | null;
    featured_passage_ref: string | null;
    featured_series_id: string | null;
    is_fallback: boolean;
    published_at: string | null;
};

/**
 * Get the currently-featured week.
 *
 * Strategy:
 * 1. Prefer the most recently published non-fallback row (the "real" weekly).
 * 2. If none, return the fallback row.
 * 3. If no rows exist at all (fresh install, migration not run), return null —
 *    the Hero component handles this with sensible hardcoded defaults so the
 *    site never crashes.
 */
export async function getCurrentFeaturedWeek(): Promise<FeaturedWeek | null> {
    // Try real weekly features first
    const { data: real, error: realError } = await untyped
        .from('featured_weeks')
        .select('*')
        .eq('is_fallback', false)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1);

    if (!realError && real && real.length > 0) {
        return real[0] as FeaturedWeek;
    }

    // Fall back to the evergreen row
    const { data: fallback, error: fbError } = await untyped
        .from('featured_weeks')
        .select('*')
        .eq('is_fallback', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1);

    if (!fbError && fallback && fallback.length > 0) {
        return fallback[0] as FeaturedWeek;
    }

    return null;
}
