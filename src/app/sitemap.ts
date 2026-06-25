import type { MetadataRoute } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import { SITE } from '@/lib/seo';

// Rebuild hourly so new sermons and articles enter the sitemap on their own.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = SITE.url;

    const staticPages: MetadataRoute.Sitemap = [
        { url: base, changeFrequency: 'daily', priority: 1 },
        { url: `${base}/live`, changeFrequency: 'always', priority: 0.9 },
        { url: `${base}/sermons`, changeFrequency: 'daily', priority: 0.9 },
        { url: `${base}/greinar`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${base}/baenatorg`, changeFrequency: 'daily', priority: 0.7 },
        { url: `${base}/vitnisburdur`, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${base}/israel`, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${base}/frettabref`, changeFrequency: 'weekly', priority: 0.5 },
        { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${base}/give`, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${base}/framtid`, changeFrequency: 'monthly', priority: 0.4 },
    ];

    const dynamic: MetadataRoute.Sitemap = [];
    try {
        const db = supabaseAdmin as unknown as SupabaseClient;
        const [eps, series, arts] = await Promise.all([
            db.from('episodes').select('bunny_video_id, published_at')
                .not('published_at', 'is', null).order('published_at', { ascending: false }).limit(2000),
            db.from('series').select('slug'),
            db.from('articles').select('slug, published_at').not('published_at', 'is', null),
        ]);

        for (const e of (eps.data ?? []) as { bunny_video_id: string | null; published_at: string | null }[]) {
            if (e.bunny_video_id) dynamic.push({
                url: `${base}/sermons/${e.bunny_video_id}`,
                lastModified: e.published_at ? new Date(e.published_at) : undefined,
                changeFrequency: 'monthly', priority: 0.7,
            });
        }
        for (const s of (series.data ?? []) as { slug: string | null }[]) {
            if (s.slug) dynamic.push({ url: `${base}/sermons/show/${s.slug}`, changeFrequency: 'weekly', priority: 0.7 });
        }
        for (const a of (arts.data ?? []) as { slug: string | null; published_at: string | null }[]) {
            if (a.slug) dynamic.push({
                url: `${base}/greinar/${a.slug}`,
                lastModified: a.published_at ? new Date(a.published_at) : undefined,
                changeFrequency: 'monthly', priority: 0.7,
            });
        }
    } catch {
        // DB unreachable at build — ship the static pages rather than fail.
    }

    return [...staticPages, ...dynamic];
}
