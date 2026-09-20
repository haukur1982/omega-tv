import { supabase } from './supabase';
import type { HomeFeature } from './home-feature';

/** Published catalogue only; unassigned programmes remain eligible for the homepage. */
export async function getHomeFeatureCandidates(): Promise<HomeFeature[]> {
    const { data, error } = await supabase
        .from('episodes')
        .select('id,bunny_video_id,title,description,published_at,thumbnail_custom,duration,status,series:series_id(title,slug,host,description,status)')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .not('bunny_video_id', 'is', null)
        .order('published_at', { ascending: false })
        .order('id', { ascending: true })
        .limit(40);
    if (error) throw new Error(`Homepage feature unavailable: ${error.message}`);
    return (data ?? []) as unknown as HomeFeature[];
}
