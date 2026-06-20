import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePosterModel } from '@/lib/poster';
import {
    needsPolish,
    polishAndBrandEpisode,
    type PolishableEpisode,
} from '@/lib/poster-polish';

/**
 * POST /api/admin/posters/backfill
 *
 * One-shot catalog sweep: generate AI-polished, branded key art (16:9 + 4:5)
 * for every episode that needs it. Delegates the actual work to the shared
 * pipeline (src/lib/poster-polish.ts) so the cron, the admin "generate" action,
 * and this backfill all behave identically.
 *
 * Body (optional):
 *   - scan?: number    how many recent episodes to consider (default 1000, max 5000)
 *   - batch?: number   max episodes to generate this call (default 6, max 50)
 *   - dryRun?: boolean report the backlog without generating
 *   - force?: boolean  re-polish even already-branded episodes — used once when
 *                      FAL_KEY first lands to upgrade the whole catalog to AI.
 *
 * Admin-gated. Idempotent without `force` (skips finished episodes), so it's safe
 * to call repeatedly and returns `more: true` while work remains.
 */

export const maxDuration = 300;

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: { scan?: number; batch?: number; dryRun?: boolean; force?: boolean } = {};
    try {
        body = await request.json();
    } catch {
        /* body optional */
    }
    const scan = Math.min(Math.max(1, body.scan ?? 1000), 5000);
    const batch = Math.min(Math.max(1, body.batch ?? 6), 50);
    const dryRun = body.dryRun === true;
    const force = body.force === true;

    const sb = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data, error } = await sb
        .from('episodes')
        .select('id, title, bunny_video_id, poster_candidates, series_id')
        .order('created_at', { ascending: false })
        .limit(scan);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as PolishableEpisode[];
    const eligible = rows.filter((r) => {
        const model = normalizePosterModel(r.poster_candidates);
        if (force) {
            return Boolean(
                model.selected_source?.url ||
                (model.source_candidates?.length ?? 0) > 0 ||
                r.bunny_video_id,
            );
        }
        return needsPolish(model);
    });

    const result = {
        scanned: rows.length,
        eligible: eligible.length,
        generated: [] as string[],
        failed: [] as { id: string; error: string }[],
        remaining: 0,
        more: false,
    };

    if (dryRun) {
        result.generated = eligible.map((e) => e.id);
        return NextResponse.json({ ok: true, dryRun: true, ...result });
    }

    const toProcess = eligible.slice(0, batch);
    for (const ep of toProcess) {
        const out = await polishAndBrandEpisode(ep, { force });
        if (out.status === 'generated') result.generated.push(ep.id);
        else if (out.status === 'failed') {
            result.failed.push({ id: ep.id, error: out.error ?? 'unknown' });
        }
    }
    result.remaining = Math.max(0, eligible.length - toProcess.length);
    result.more = result.remaining > 0;

    return NextResponse.json({ ok: true, dryRun: false, ...result });
}
