import { supabase } from './supabase';
import type { Episode } from './vod-db';

/**
 * ═══════════════════════════════════════════════════════════════════
 * Threads of Scripture — cross-content queries anchored on passage
 *
 * Every sermon has one `bible_ref`. Articles have `bible_refs[]`.
 * Prayers have optional `bible_ref`. A sermon detail page fills its
 * threads sidebar by pivoting on that passage. See plan §4.2.
 *
 * All queries return [] / null on empty or error — the UI renders
 * graceful empty states during the backfill period.
 * ═══════════════════════════════════════════════════════════════════
 */

// Phase 2 types not in generated Database types yet — use untyped handle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = supabase as any;

export type ThreadEpisode = Episode & {
    bible_ref?: string | null;
    editor_note?: string | null;
    captions_available?: string[] | null;
    chapters?: { t: number; title: string }[] | null;
    transcript_url?: string | null;
    tags?: string[] | null;
    language_primary?: string | null;
};

export type ThreadPrayer = {
    id: string;
    name: string | null;
    content: string;
    pray_count: number | null;
    is_answered: boolean | null;
    category_type: string | null;
    bible_ref: string | null;
    created_at: string | null;
};

export type ThreadArticle = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string | null;
    bible_refs: string[] | null;
    reading_minutes: number | null;
    author_name: string | null;
};

/**
 * Load a single episode by id (UUID) OR by bunny_video_id.
 * The sermon detail route takes a Bunny GUID; episodes table uses its own
 * UUID. Lookup-by-bunny keeps both paths working.
 */
export async function getEpisodeByBunnyId(bunnyVideoId: string): Promise<ThreadEpisode | null> {
    const { data, error } = await untyped
        .from('episodes')
        .select('*')
        .eq('bunny_video_id', bunnyVideoId)
        .maybeSingle();
    if (error || !data) return null;
    return data as ThreadEpisode;
}

/**
 * Other episodes anchored to the same passage.
 * Used by the "threads" sidebar — if more than one sermon lands on
 * the same passage over time, they surface together.
 */
export async function getEpisodesByPassage(
    bibleRef: string,
    excludeId?: string,
    limit = 3,
): Promise<ThreadEpisode[]> {
    if (!bibleRef) return [];
    let query = untyped
        .from('episodes')
        .select('*')
        .eq('bible_ref', bibleRef)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(limit);
    if (excludeId) query = query.neq('id', excludeId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data as ThreadEpisode[];
}

/**
 * One article that engages the same passage (by bible_refs containment).
 * Phase 2 surfaces the most recent match; later we can rank by tag overlap.
 */
export async function getArticleByPassage(bibleRef: string): Promise<ThreadArticle | null> {
    if (!bibleRef) return null;
    const { data, error } = await untyped
        .from('articles')
        .select('id, slug, title, excerpt, featured_image, published_at, bible_refs, reading_minutes, author_name')
        .contains('bible_refs', [bibleRef])
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error || !data) return null;
    return data as ThreadArticle;
}

/**
 * One prayer anchored to the same passage (approved + not private).
 * Falls back to an empty threads-sidebar slot if none exist yet.
 */
export async function getPrayerByPassage(bibleRef: string): Promise<ThreadPrayer | null> {
    if (!bibleRef) return null;
    const { data, error } = await untyped
        .from('prayers')
        .select('id, name, content, pray_count, is_answered, category_type, bible_ref, created_at')
        .eq('bible_ref', bibleRef)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error || !data) return null;
    return data as ThreadPrayer;
}

/**
 * Related sermons within the same series — the "Fleiri úr sömu seríu" rail.
 * Excludes the current episode. Falls back to Bunny-parsed siblings when
 * the DB has no rows yet.
 */
export async function getEpisodesInSeries(
    seriesId: string,
    excludeId?: string,
    limit = 4,
): Promise<ThreadEpisode[]> {
    if (!seriesId) return [];
    let query = untyped
        .from('episodes')
        .select('*')
        .eq('series_id', seriesId)
        .not('published_at', 'is', null)
        .order('episode_number', { ascending: false })
        .limit(limit);
    if (excludeId) query = query.neq('id', excludeId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data as ThreadEpisode[];
}
