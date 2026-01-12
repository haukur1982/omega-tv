import { supabase } from './supabase';
import { Database } from '@/types/supabase';

export type Series = Database['public']['Tables']['series']['Row'];
export type Season = Database['public']['Tables']['seasons']['Row'];
export type Episode = Database['public']['Tables']['episodes']['Row'];

export type NewSeries = Database['public']['Tables']['series']['Insert'];

export async function getAllSeries() {
    const { data, error } = await supabase
        .from('series')
        .select(`
            *,
            seasons ( count )
        `)
        .order('title');

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
}

export async function createSeries(series: NewSeries) {
    const { data, error } = await supabase
        .from('series')
        .insert(series)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createSeason(seriesId: string, seasonNumber: number, title?: string) {
    const { data, error } = await supabase
        .from('seasons')
        .insert({
            series_id: seriesId,
            season_number: seasonNumber,
            title: title || `Árgangur ${seasonNumber}`
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createEpisode(episode: {
    series_id: string;
    season_id: string;
    bunny_video_id: string;
    title: string;
    episode_number: number;
    description?: string;
}) {
    const { data, error } = await supabase
        .from('episodes')
        .insert(episode)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getLinkedBunnyIds() {
    const { data, error } = await supabase
        .from('episodes')
        .select('bunny_video_id');

    if (error) throw error;
    return data.map(d => d.bunny_video_id);
}
