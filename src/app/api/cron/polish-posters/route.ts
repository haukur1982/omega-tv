import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePosterModel } from '@/lib/poster';
import {
    needsPolish,
    polishAndBrandEpisode,
    type PolishableEpisode,
} from '@/lib/poster-polish';
import { logEvent } from '@/lib/system-events';

/**
 * GET /api/cron/polish-posters
 *
 * Hands-free episode key-art generation. Vercel Cron fires this on a schedule
 * (see vercel.json). It finds episodes that need key art (no branded variant,
 * or a Sharp-only result upgradable to AI now that FAL_KEY exists) and polishes
 * a small BATCH per run, so import bursts drain over a few runs and a single
 * call never risks the function timeout.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}` (Vercel sends this automatically;
 * manual curl with the same header works for testing). Same pattern as
 * /api/cron/sync-schedule-xml.
 *
 * Cost is structurally bounded: BATCH per run, one fal call per episode, and the
 * idempotency in `needsPolish` (won't reprocess finished work, won't loop
 * without fal, caps retries).
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SCAN_LIMIT = 1000;
const BATCH = 4;

export async function GET(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 500 });
    }
    if (req.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sb = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data, error } = await sb
        .from('episodes')
        .select('id, title, bunny_video_id, poster_candidates, series_id')
        .order('created_at', { ascending: false })
        .limit(SCAN_LIMIT);
    if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as PolishableEpisode[];
    const eligible = rows.filter((r) => needsPolish(normalizePosterModel(r.poster_candidates)));
    const toProcess = eligible.slice(0, BATCH);

    const generated: string[] = [];
    const failed: { id: string; error: string }[] = [];
    let aiCount = 0;

    for (const ep of toProcess) {
        const out = await polishAndBrandEpisode(ep);
        if (out.status === 'generated') {
            generated.push(ep.id);
            if (out.usedAi) aiCount += 1;
        } else if (out.status === 'failed') {
            failed.push({ id: ep.id, error: out.error ?? 'unknown' });
        }
    }

    const remaining = Math.max(0, eligible.length - toProcess.length);
    const summary =
        `Polished ${generated.length}/${toProcess.length} (AI ${aiCount}) · ${remaining} remaining` +
        (failed.length ? ` · ${failed.length} failed` : '');
    await logEvent(
        'cron.polish_posters',
        failed.length ? 'warn' : 'info',
        summary,
        { generated, failed, remaining, aiCount },
        'vercel-cron',
    );

    return NextResponse.json({ ok: true, summary, generated, failed, remaining, more: remaining > 0 });
}
