import 'server-only';
import { supabaseAdmin } from '@/lib/supabase';
import { getVideos } from '@/lib/bunny';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Omega analytics aggregation — the real numbers behind /admin/analytics.
 *
 * Two sources, combined server-side:
 *   • Bunny Stream statistics  → what people actually watch (views, watch time,
 *     where they are, which episodes). This is the streaming-specific signal.
 *   • Supabase                 → content/pipeline + engagement (shows, episodes,
 *     subscribers, testimonials, prayers, recent imports).
 *
 * Site-wide web traffic (pageviews/visitors) is NOT here — that's Vercel Web
 * Analytics, viewed in the Vercel dashboard. This page covers what Vercel can't:
 * VOD performance + ministry engagement.
 */

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

export interface VodTopVideo {
    guid: string;
    title: string;
    show: string | null;
    views: number;
    lengthMin: number;
}

export interface AnalyticsPayload {
    generatedAt: string;
    vod: {
        views30d: number;
        views7d: number;
        watchHours30d: number;
        engagementScore: number | null;
        viewsByDay: { date: string; views: number }[];
        topVideos: VodTopVideo[];
        countries: { code: string; views: number }[];
        ok: boolean;
    };
    content: {
        shows: number;
        episodesPublished: number;
        episodesDraft: number;
        recentImports: { title: string; at: string }[];
    };
    engagement: {
        subscribers: number;
        testimonials: number;
        prayersTotal: number;
        prayersPending: number;
        bookSignups: number;
    };
}

interface BunnyStats {
    viewsChart?: Record<string, number>;
    watchTimeChart?: Record<string, number>;
    countryViewCounts?: Record<string, number>;
    engagementScore?: number;
}

async function fetchBunnyStats(): Promise<BunnyStats | null> {
    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) return null;
    try {
        const r = await fetch(
            `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/statistics`,
            { headers: { AccessKey: BUNNY_API_KEY, accept: 'application/json' }, cache: 'no-store' },
        );
        if (!r.ok) return null;
        return (await r.json()) as BunnyStats;
    } catch {
        return null;
    }
}

const sum = (o?: Record<string, number>) => Object.values(o ?? {}).reduce((a, b) => a + (b || 0), 0);

const db = supabaseAdmin as unknown as SupabaseClient;

/** A count query (head + exact), narrowed to the chain methods we use. */
type CountQuery = PromiseLike<{ count: number | null }> & {
    not(col: string, op: string, val: unknown): CountQuery;
    is(col: string, val: unknown): CountQuery;
    eq(col: string, val: unknown): CountQuery;
};
async function countRows(table: string, filter?: (q: CountQuery) => CountQuery): Promise<number> {
    const base = db.from(table).select('*', { count: 'exact', head: true }) as unknown as CountQuery;
    const { count } = await (filter ? filter(base) : base);
    return count ?? 0;
}

interface EpJoinRow { bunny_video_id: string | null; title: string; series: { title: string } | null }

export async function getAnalytics(): Promise<AnalyticsPayload> {
    const [stats, videos, epRes, recentRes] = await Promise.all([
        fetchBunnyStats(),
        getVideos(1, 100).catch(() => []),
        db.from('episodes').select('bunny_video_id, title, series:series_id ( title )'),
        db.from('episodes').select('title, created_at').order('created_at', { ascending: false }).limit(5),
    ]);
    // Supabase types a to-one embed as an array, but at runtime it's an object.
    const episodes = (epRes.data ?? []) as unknown as EpJoinRow[];

    // ── VOD (Bunny) ──────────────────────────────────────────────────────────
    const viewsChartObj = stats?.viewsChart ?? {};
    const viewsByDay = Object.entries(viewsChartObj)
        .map(([date, views]) => ({ date, views: views || 0 }))
        .sort((a, b) => a.date.localeCompare(b.date));
    const views7d = viewsByDay.slice(-7).reduce((a, d) => a + d.views, 0);

    // Map Bunny guid → nice episode/show title.
    const epByGuid = new Map<string, { title: string; show: string | null }>();
    for (const e of episodes) {
        if (e.bunny_video_id) {
            epByGuid.set(e.bunny_video_id, { title: e.title, show: e.series?.title ?? null });
        }
    }
    const topVideos: VodTopVideo[] = videos
        .filter((v) => (v.views ?? 0) > 0)
        .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        .slice(0, 8)
        .map((v) => {
            const ep = epByGuid.get(v.guid);
            return {
                guid: v.guid,
                title: ep?.title || v.title.replace(/^Omega TV - .*? - /, '').replace(/\.[^/.]+$/, ''),
                show: ep?.show ?? null,
                views: v.views ?? 0,
                lengthMin: Math.round((v.length ?? 0) / 60),
            };
        });

    const countries = Object.entries(stats?.countryViewCounts ?? {})
        .map(([code, views]) => ({ code, views: views || 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);

    // ── Content + engagement (Supabase) ──────────────────────────────────────
    const [
        shows, episodesPublished, episodesDraft,
        subscribers, testimonials, prayersTotal, prayersPending, bookSignups,
    ] = await Promise.all([
        countRows('series'),
        countRows('episodes', (q) => q.not('published_at', 'is', null)),
        countRows('episodes', (q) => q.is('published_at', null)),
        countRows('subscribers'),
        countRows('testimonials'),
        countRows('prayers'),
        countRows('prayers', (q) => q.eq('is_approved', false)),
        countRows('book_signups'),
    ]);

    const recentImports = ((recentRes.data ?? []) as { title: string; created_at: string }[])
        .map((e) => ({ title: e.title, at: e.created_at }));

    return {
        generatedAt: new Date().toISOString(),
        vod: {
            views30d: sum(viewsChartObj),
            views7d,
            watchHours30d: Math.round(sum(stats?.watchTimeChart) / 60),
            engagementScore: stats?.engagementScore ?? null,
            viewsByDay,
            topVideos,
            countries,
            ok: stats !== null,
        },
        content: { shows, episodesPublished, episodesDraft, recentImports },
        engagement: { subscribers, testimonials, prayersTotal, prayersPending, bookSignups },
    };
}
