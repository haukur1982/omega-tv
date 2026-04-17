import { supabase, supabaseAdmin } from './supabase';
import { Database } from '@/types/supabase';

export type Series = Database['public']['Tables']['series']['Row'];
export type Season = Database['public']['Tables']['seasons']['Row'];
export type Episode = Database['public']['Tables']['episodes']['Row'];

export type NewSeries = Database['public']['Tables']['series']['Insert'];
export type SeriesUpdate = Database['public']['Tables']['series']['Update'];
export type EpisodeInsert = Database['public']['Tables']['episodes']['Insert'];

// ===== PUBLIC QUERIES (only published content) =====

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
