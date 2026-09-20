export type HomeFeature = {
    id: string;
    bunny_video_id: string | null;
    title: string;
    description: string | null;
    published_at: string | null;
    thumbnail_custom: string | null;
    duration: number | null;
    status: string;
    series: {
        title: string;
        slug: string;
        host: string | null;
        description: string | null;
        status: string | null;
    } | null;
};

type PlayableHomeFeature = HomeFeature & { bunny_video_id: string; published_at: string };

/** A stable daily choice from up to 14 recent published programmes, in Iceland time. */
export function selectHomeFeature(episodes: HomeFeature[], now = new Date()): PlayableHomeFeature | null {
    const seen = new Set<string>();
    const candidates = episodes
        .filter((episode): episode is PlayableHomeFeature => Boolean(episode.status === 'published'
            && episode.bunny_video_id?.trim()
            && episode.title.trim()
            && episode.published_at
            && Number.isFinite(Date.parse(episode.published_at))
            && Date.parse(episode.published_at) <= now.getTime()
            && (!episode.series?.status || episode.series.status === 'active')))
        .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at) || a.id.localeCompare(b.id))
        .filter(episode => {
            const videoId = episode.bunny_video_id;
            if (seen.has(videoId)) return false;
            seen.add(videoId);
            return true;
        })
        .slice(0, 14);
    if (!candidates.length) return null;
    const day = Math.floor(now.getTime() / 86_400_000); // Iceland uses UTC year-round.
    return candidates[((day % candidates.length) + candidates.length) % candidates.length];
}
