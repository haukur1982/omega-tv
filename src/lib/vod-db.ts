import { supabase, supabaseAdmin } from './supabase';
import { Database } from '@/types/supabase';

export type Series = Database['public']['Tables']['series']['Row'];
export type Season = Database['public']['Tables']['seasons']['Row'];
export type Episode = Database['public']['Tables']['episodes']['Row'];

export type NewSeries = Database['public']['Tables']['series']['Insert'];
export type SeriesUpdate = Database['public']['Tables']['series']['Update'];
export type EpisodeInsert = Database['public']['Tables']['episodes']['Insert'];

// ===== PUBLIC QUERIES (only published content) =====

/**
 * Get published episodes that belong to Israel-themed series.
 * Matches any series whose title contains "ísrael" or "israel"
 * (case-insensitive). Used by /israel landing + /israel/heimildarmyndir
 * to surface CBN Fréttir frá Ísrael, Ísrael í brennidepli, and any
 * other Israel-tagged content from the existing episodes catalog —
 * no new schema, just a filter over what's already there.
 */
export type IsraelEpisode = {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    published_at: string | null;
    thumbnail_custom: string | null;
    bunny_video_id: string;
    episode_number: number;
    series: { id: string; title: string; slug: string; category: string | null } | null;
};

/**
 * Israel-section episodes. Canonical definition: series with
 * `category='israel'`. Soft fallback: any series or episode whose title
 * contains "Ísrael"/"Israel" — kept so existing CBN content lights up
 * before the back-catalog gets re-tagged. Once everything is tagged,
 * the regex fallback can be removed.
 */
export async function getIsraelEpisodes(limit = 24): Promise<IsraelEpisode[]> {
    const { data, error } = await supabase
        .from('episodes')
        .select(`
            id,
            title,
            description,
            duration,
            published_at,
            thumbnail_custom,
            bunny_video_id,
            episode_number,
            series:series_id ( id, title, slug, category )
        `)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(limit * 4); // overfetch — we mix tag + regex match below

    if (error) {
        console.error('Failed to fetch Israel episodes:', error);
        return [];
    }

    const rows = (data ?? []) as unknown as IsraelEpisode[];

    return rows
        .filter((e) => {
            // Primary path: explicit series.category='israel' (canonical).
            if (e.series?.category === 'israel') return true;
            // Legacy fallback while the back-catalog is still being tagged.
            const seriesTitle = e.series?.title?.toLowerCase() ?? '';
            const epTitle = e.title?.toLowerCase() ?? '';
            return /ísrael|israel/.test(seriesTitle) || /ísrael|israel/.test(epTitle);
        })
        .slice(0, limit);
}

export async function getAllSeries() {
    const { data, error } = await supabase
        .from('series')
        .select(`
            *,
            seasons ( count )
        `)
        .order('title');

    if (error) {
        console.error('Failed to fetch series:', error);
        return [];
    }
    return data || [];
}

/**
 * Get series filtered by their `category` tag. Used by the Þáttasafn
 * (/sermons) page to surface shows in editorial groups: Omega-produced,
 * Iceland partners, international, documentaries, music, kids.
 *
 * Each row also carries a `latest_episode` synthetic field — the most
 * recently published episode in the series — so cards can show a real
 * "newest" thumbnail and date without a second roundtrip per series.
 */
export type SeriesWithLatest = Series & {
    latest_episode: {
        id: string;
        title: string;
        published_at: string | null;
        thumbnail_custom: string | null;
        bunny_video_id: string;
        duration: number | null;
    } | null;
    episode_count: number;
};

export async function getSeriesByCategory(category: string): Promise<SeriesWithLatest[]> {
    // Two-step fetch — series first, then for each series its latest
    // published episode. Cleaner than a complex join with PostgREST
    // since we only need the single newest per series.
    const { data: seriesRows, error: seriesErr } = await supabase
        .from('series')
        .select('*')
        .eq('category', category)
        .order('title', { ascending: true });

    if (seriesErr) {
        console.error(`Failed to fetch series for category=${category}:`, seriesErr);
        return [];
    }

    const series = (seriesRows ?? []) as Series[];
    if (series.length === 0) return [];

    const ids = series.map((s) => s.id);
    const { data: episodesRows } = await supabase
        .from('episodes')
        .select('id, title, published_at, thumbnail_custom, bunny_video_id, duration, series_id, status')
        .in('series_id', ids)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

    type EpisodeRow = {
        id: string;
        title: string;
        published_at: string | null;
        thumbnail_custom: string | null;
        bunny_video_id: string;
        duration: number | null;
        series_id: string | null;
        status: string;
    };
    const eps = (episodesRows ?? []) as EpisodeRow[];

    return series.map((s) => {
        const seriesEps = eps.filter((e) => e.series_id === s.id);
        const latest = seriesEps[0];
        return {
            ...s,
            latest_episode: latest
                ? {
                    id: latest.id,
                    title: latest.title,
                    published_at: latest.published_at,
                    thumbnail_custom: latest.thumbnail_custom,
                    bunny_video_id: latest.bunny_video_id,
                    duration: latest.duration,
                }
                : null,
            episode_count: seriesEps.length,
        };
    });
}

/**
 * Same shape as getSeriesByCategory but for series with `category IS NULL`.
 * Surfaces newly-published episodes whose series hasn't been filed yet, so
 * they appear in an "Annað efni" shelf instead of being invisible. Acts as
 * a signal to the editor: "this series needs a category."
 */
export async function getUncategorizedSeries(): Promise<SeriesWithLatest[]> {
    const { data: seriesRows, error: seriesErr } = await supabase
        .from('series')
        .select('*')
        .is('category', null)
        .order('title', { ascending: true });

    if (seriesErr) {
        console.error('Failed to fetch uncategorized series:', seriesErr);
        return [];
    }

    const series = (seriesRows ?? []) as Series[];
    if (series.length === 0) return [];

    const ids = series.map((s) => s.id);
    const { data: episodesRows } = await supabase
        .from('episodes')
        .select('id, title, published_at, thumbnail_custom, bunny_video_id, duration, series_id, status')
        .in('series_id', ids)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

    type EpisodeRow = {
        id: string;
        title: string;
        published_at: string | null;
        thumbnail_custom: string | null;
        bunny_video_id: string;
        duration: number | null;
        series_id: string | null;
        status: string;
    };
    const eps = (episodesRows ?? []) as EpisodeRow[];

    return series
        .map((s) => {
            const seriesEps = eps.filter((e) => e.series_id === s.id);
            const latest = seriesEps[0];
            return {
                ...s,
                latest_episode: latest
                    ? {
                        id: latest.id,
                        title: latest.title,
                        published_at: latest.published_at,
                        thumbnail_custom: latest.thumbnail_custom,
                        bunny_video_id: latest.bunny_video_id,
                        duration: latest.duration,
                    }
                    : null,
                episode_count: seriesEps.length,
            };
        })
        .filter((s) => s.episode_count > 0);
}

/**
 * Newest published episodes across all series — feeds the NewestRail on
 * /sermons. Single query joining the parent series (title + slug) so the
 * rail card has everything it needs without a per-row roundtrip.
 *
 * Falls back to mock data at the page level when this returns [].
 */
export type NewestEpisode = {
    id: string;
    bunny_video_id: string;
    title: string;
    published_at: string | null;
    thumbnail_custom: string | null;
    duration: number | null;
    series_title: string;
    series_slug: string;
};

export async function getNewestEpisodes(limit = 8): Promise<NewestEpisode[]> {
    const { data, error } = await supabase
        .from('episodes')
        .select(`
            id,
            bunny_video_id,
            title,
            published_at,
            thumbnail_custom,
            duration,
            series:series_id ( title, slug )
        `)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .not('bunny_video_id', 'is', null)
        .order('published_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch newest episodes:', error);
        return [];
    }

    type Row = {
        id: string;
        bunny_video_id: string;
        title: string;
        published_at: string | null;
        thumbnail_custom: string | null;
        duration: number | null;
        series: { title: string; slug: string } | null;
    };

    return (data ?? []).map((row) => {
        const r = row as unknown as Row;
        return {
            id: r.id,
            bunny_video_id: r.bunny_video_id,
            title: r.title,
            published_at: r.published_at,
            thumbnail_custom: r.thumbnail_custom,
            duration: r.duration,
            series_title: r.series?.title ?? 'Omega',
            series_slug: r.series?.slug ?? '',
        };
    });
}

/**
 * Get the latest published episode of a specific series (by slug).
 * Used by the /sermons landing to pin "Sunnudagssamkoma vikunnar"
 * without hardcoding which series ID is the Sunday service.
 */
export async function getLatestEpisodeBySeriesSlug(slug: string) {
    const { data: series, error } = await supabase
        .from('series')
        .select('id, title, slug, description, host, poster_horizontal, poster_vertical')
        .eq('slug', slug)
        .single();

    if (error || !series) return null;

    const { data: episode } = await supabase
        .from('episodes')
        .select('*')
        .eq('series_id', series.id)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return episode ? { series, episode } : null;
}

/**
 * Get all published episodes for a series by slug — used by the
 * per-series page (/sermons/show/[slug]) to render the full catalog.
 */
export async function getEpisodesBySeriesSlug(slug: string) {
    const { data: series, error } = await supabase
        .from('series')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !series) return null;

    const { data: episodes } = await supabase
        .from('episodes')
        .select('*')
        .eq('series_id', series.id)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

    return { series, episodes: episodes ?? [] };
}

export async function getSeriesById(id: string) {
    const { data, error } = await supabase
        .from('series')
        .select(`
            *,
            seasons (
                *,
                episodes ( * )
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Failed to fetch series:', error);
        return null;
    }

    // Filter to only published episodes
    if (data?.seasons) {
        for (const season of data.seasons as any[]) {
            if (season.episodes) {
                season.episodes = season.episodes.filter((ep: any) => ep.status === 'published');
            }
        }
    }

    return data;
}

export async function getSeriesBySlug(slug: string) {
    const { data, error } = await supabase
        .from('series')
        .select(`
            *,
            seasons (
                *,
                episodes ( * )
            )
        `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Failed to fetch series by slug:', error);
        return null;
    }

    // Filter to only published episodes
    if (data?.seasons) {
        for (const season of data.seasons as any[]) {
            if (season.episodes) {
                season.episodes = season.episodes.filter((ep: any) => ep.status === 'published');
            }
        }
    }

    return data;
}

// ===== ADMIN QUERIES =====

export async function getDraftEpisodes() {
    const { data, error } = await supabaseAdmin
        .from('episodes')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch drafts:', error);
        return [];
    }
    return data || [];
}

export async function publishEpisode(id: string) {
    const { data, error } = await supabaseAdmin
        .from('episodes')
        .update({
            status: 'published',
            published_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Failed to publish episode:', error);
        return null;
    }
    return data;
}

export async function unpublishEpisode(id: string) {
    const { data, error } = await supabaseAdmin
        .from('episodes')
        .update({ status: 'draft' })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Failed to unpublish episode:', error);
        return null;
    }
    return data;
}

// ===== CREATE OPERATIONS =====

export async function createSeries(series: NewSeries) {
    const { data, error } = await supabaseAdmin
        .from('series')
        .insert(series)
        .select()
        .single();

    if (error) {
        console.error('Failed to create series:', error);
        return null;
    }
    return data;
}

export async function createSeason(seriesId: string, seasonNumber: number, title?: string) {
    const { data, error } = await supabaseAdmin
        .from('seasons')
        .insert({
            series_id: seriesId,
            season_number: seasonNumber,
            title: title || `Árgangur ${seasonNumber}`
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create season:', error);
        return null;
    }
    return data;
}

export async function createEpisode(episode: {
    series_id?: string | null;
    season_id?: string | null;
    bunny_video_id: string;
    title: string;
    episode_number?: number;
    description?: string;
    status?: string;
    source?: string;
}) {
    const { data, error } = await supabaseAdmin
        .from('episodes')
        .insert({
            ...episode,
            episode_number: episode.episode_number || 1,
            status: episode.status || 'published',
            source: episode.source || 'admin',
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create episode:', error);
        return null;
    }
    return data;
}

// ===== UPDATE OPERATIONS =====

export async function updateSeries(id: string, updates: SeriesUpdate): Promise<Series | null> {
    const { data, error } = await supabaseAdmin
        .from('series')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Failed to update series:', error);
        return null;
    }
    return data;
}

export async function updateEpisode(
    id: string,
    updates: Partial<Pick<Episode, 'title' | 'description' | 'episode_number' | 'thumbnail_custom' | 'series_id' | 'season_id' | 'status'>>
): Promise<Episode | null> {
    const { data, error } = await supabaseAdmin
        .from('episodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Failed to update episode:', error);
        return null;
    }
    return data;
}

// ===== DELETE OPERATIONS =====

export async function deleteSeries(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('series')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Failed to delete series:', error);
        return false;
    }
    return true;
}

export async function deleteEpisode(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('episodes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Failed to delete episode:', error);
        return false;
    }
    return true;
}

// ===== UTILITY =====

export async function getLinkedBunnyIds(): Promise<string[]> {
    const { data, error } = await supabase
        .from('episodes')
        .select('bunny_video_id');

    if (error) {
        console.error('Failed to fetch linked IDs:', error);
        return [];
    }
    return data.map(d => d.bunny_video_id);
}
