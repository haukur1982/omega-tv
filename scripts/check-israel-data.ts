/**
 * One-shot diagnostic: what Israel-related content already exists in
 * the database? Used to confirm whether /israel will render real
 * content on day one or empty states.
 *
 * Usage: pnpm exec tsx --env-file=.env.local scripts/check-israel-data.ts
 */

import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
) as any;

(async () => {
    console.log('═══ Israel content audit ═══\n');

    // 1. Series matching Israel pattern
    console.log('→ Series with "Ísrael" or "Israel" in the title:');
    const { data: series } = await sb
        .from('series')
        .select('id, title, slug')
        .or('title.ilike.%ísrael%,title.ilike.%israel%');
    if (series?.length) {
        series.forEach((s: { id: string; title: string; slug: string }) => {
            console.log(`  · ${s.title} (${s.slug})`);
        });
    } else {
        console.log('  (none)');
    }
    console.log(`  Total: ${series?.length ?? 0}\n`);

    // 2. Published episodes from those series + episodes with Israel in title
    console.log('→ Published episodes (Israel-tagged or in Israel series):');
    const { data: eps } = await sb
        .from('episodes')
        .select('id, title, status, published_at, series:series_id(title)')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

    interface Ep {
        id: string;
        title: string;
        status: string;
        published_at: string | null;
        series: { title: string } | null;
    }
    const israelEps = (eps ?? []).filter((e: Ep) => {
        const seriesTitle = e.series?.title?.toLowerCase() ?? '';
        const epTitle = e.title?.toLowerCase() ?? '';
        return /ísrael|israel/.test(seriesTitle) || /ísrael|israel/.test(epTitle);
    });
    israelEps.slice(0, 8).forEach((e: Ep) => {
        const date = e.published_at ? new Date(e.published_at).toISOString().slice(0, 10) : '?';
        console.log(`  · ${e.series?.title ?? '–'} · ${date} · ${e.title}`);
    });
    if (israelEps.length > 8) {
        console.log(`  … and ${israelEps.length - 8} more`);
    }
    console.log(`  Total: ${israelEps.length}\n`);

    // 3. Schedule slots
    console.log('→ Israel-related schedule slots (last 90d + next 30d):');
    const past = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: slots } = await sb
        .from('schedule_slots')
        .select('id, program_title, starts_at, host_name')
        .gte('starts_at', past)
        .lte('starts_at', future)
        .or('program_title.ilike.%ísrael%,program_title.ilike.%israel%')
        .order('starts_at', { ascending: false });
    slots?.slice(0, 8).forEach((s: { program_title: string; starts_at: string; host_name?: string }) => {
        const date = new Date(s.starts_at).toISOString().slice(0, 10);
        console.log(`  · ${date} · ${s.program_title}${s.host_name ? ` · ${s.host_name}` : ''}`);
    });
    if (slots && slots.length > 8) {
        console.log(`  … and ${slots.length - 8} more`);
    }
    console.log(`  Total: ${slots?.length ?? 0}\n`);

    // 4. Articles tagged Israel
    console.log('→ Articles with category=israel:');
    const { data: articles } = await sb
        .from('articles')
        .select('title, published_at')
        .eq('category', 'israel');
    articles?.forEach((a: { title: string; published_at: string | null }) => {
        const date = a.published_at ? new Date(a.published_at).toISOString().slice(0, 10) : '(draft)';
        console.log(`  · ${date} · ${a.title}`);
    });
    if (!articles?.length) console.log('  (none — category column may not exist yet)');
    console.log(`  Total: ${articles?.length ?? 0}\n`);

    console.log('✓ Done.');
})();
