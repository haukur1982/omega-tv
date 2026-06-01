import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePosterVariants } from '@/lib/thumbnail-generator';
import { normalizePosterModel, POSTER_BRAND_VERSION, type PosterModel } from '@/lib/poster';

/**
 * POST /api/admin/posters/backfill
 *
 * One-shot: generate branded key art (16:9 + 4:5) for every episode that has a
 * usable source frame but no branded poster variant yet. Takes cards from raw
 * caption-cropped frame-grabs to designed, subtitle-free key art — the Netflix/
 * Apple-TV look — across the whole catalog at once.
 *
 * Source priority per episode:
 *   1. an already-selected poster source frame (Azotus candidate the reviewer picked)
 *   2. the first Azotus candidate frame, if any
 *   3. the Bunny auto-frame (generatePosterVariants pulls it via bunnyVideoId)
 * Episodes with none of these (no bunny video, no candidates) are skipped — there
 * is nothing to brand. getCleanVodCrop strips the burned-in subtitle band.
 *
 * Body (optional):
 *   - scan?: number   how many recent episodes to CONSIDER (default 1000, max 5000)
 *   - batch?: number  max episodes to actually GENERATE this call (default 12, max 50)
 *   - dryRun?: boolean
 *
 * Admin-gated. Idempotent: episodes that already have a branded variant are
 * skipped, so it's safe to call repeatedly. Each call generates at most `batch`
 * posters (image generation is the expensive part — 2 renders/episode) and
 * returns `more: true` while unbranded episodes remain, so a caller can loop
 * until `more: false` without any single invocation risking the function
 * timeout on a large catalog.
 */

// Poster generation (sharp + satori, 2 renders/episode) is heavy. Give the
// route the full Fluid Compute budget; the `batch` cap keeps a single call far
// under it, but a generous ceiling avoids a hard cut mid-episode.
export const maxDuration = 300;

type Row = {
    id: string;
    title: string | null;
    bunny_video_id: string | null;
    poster_candidates: unknown;
    series_id: string | null;
};

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: { scan?: number; batch?: number; dryRun?: boolean } = {};
    try {
        body = await request.json();
    } catch {
        /* body optional */
    }
    const scan = Math.min(Math.max(1, body.scan ?? 1000), 5000);
    const batch = Math.min(Math.max(1, body.batch ?? 12), 50);
    const dryRun = body.dryRun === true;

    const sb = supabaseAdmin as any;
    const { data, error } = await sb
        .from('episodes')
        .select('id, title, bunny_video_id, poster_candidates, series_id')
        .order('created_at', { ascending: false })
        .limit(scan);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as Row[];
    const seriesNameCache = new Map<string, string | undefined>();

    const result = {
        scanned: rows.length,
        generated: [] as string[],
        skipped_already_branded: 0,
        skipped_no_source: 0,
        failed: [] as { id: string; error: string }[],
        remaining: 0,
        more: false,
    };

    for (const ep of rows) {
        const model = normalizePosterModel(ep.poster_candidates);

        // Already has a branded variant → nothing to do (idempotent).
        if (model.variants.landscape_16x9 || model.variants.portrait_4x5) {
            result.skipped_already_branded++;
            continue;
        }

        // Resolve a source: selected → first candidate → Bunny auto-frame.
        const sourceUrl =
            model.selected_source?.url ??
            model.source_candidates[0]?.url ??
            null;
        if (!sourceUrl && !ep.bunny_video_id) {
            result.skipped_no_source++;
            continue;
        }

        if (dryRun) {
            // In dry-run, count everything that WOULD be generated (no batch cap)
            // so the caller sees the true backlog size.
            result.generated.push(ep.id);
            continue;
        }

        // Batch cap: this episode needs work, but we've already generated our
        // quota for this call. Count it as remaining and signal more work.
        if (result.generated.length >= batch) {
            result.remaining++;
            result.more = true;
            continue;
        }

        try {
            // Resolve series name (cached per series).
            let seriesName: string | undefined;
            if (ep.series_id) {
                if (!seriesNameCache.has(ep.series_id)) {
                    const { data: s } = await sb
                        .from('series')
                        .select('title')
                        .eq('id', ep.series_id)
                        .maybeSingle();
                    seriesNameCache.set(ep.series_id, s?.title ?? undefined);
                }
                seriesName = seriesNameCache.get(ep.series_id);
            }

            // Build the source buffer: a hosted candidate URL, else let the
            // generator pull the Bunny auto-frame via bunnyVideoId.
            let sourceImage: Buffer | undefined;
            if (sourceUrl) {
                const r = await fetch(sourceUrl, { cache: 'no-store' });
                if (!r.ok) throw new Error(`source fetch ${r.status}`);
                sourceImage = Buffer.from(await r.arrayBuffer());
            }

            const variants = await generatePosterVariants({
                ...(sourceImage
                    ? { sourceImage }
                    : { bunnyVideoId: ep.bunny_video_id! }),
                seriesName,
                episodeTitle: ep.title ?? undefined,
                cleanVodCrop: true,
            });

            const stamp = Date.now();
            const base = ep.bunny_video_id || ep.id;
            const uploaded: Record<'landscape_16x9' | 'portrait_4x5', string> = {
                landscape_16x9: '',
                portrait_4x5: '',
            };
            for (const aspect of ['landscape_16x9', 'portrait_4x5'] as const) {
                const filename = `${base}_${aspect}_${stamp}.png`;
                const { error: upErr } = await sb.storage
                    .from('thumbnails')
                    .upload(filename, variants[aspect], {
                        contentType: 'image/png',
                        cacheControl: '3600',
                        upsert: true,
                    });
                if (upErr) throw new Error(`upload ${aspect}: ${upErr.message ?? upErr}`);
                const { data: urlData } = sb.storage.from('thumbnails').getPublicUrl(filename);
                uploaded[aspect] = urlData.publicUrl;
            }

            const nextModel: PosterModel = {
                ...model,
                variants: {
                    ...model.variants,
                    landscape_16x9: uploaded.landscape_16x9,
                    portrait_4x5: uploaded.portrait_4x5,
                },
                brand_version: POSTER_BRAND_VERSION,
                updated_at: new Date().toISOString(),
            };

            const { error: persistErr } = await sb
                .from('episodes')
                .update({
                    poster_candidates: nextModel,
                    // Mirror the 16:9 into thumbnail_custom so every existing
                    // consumer upgrades with no other change.
                    thumbnail_custom: uploaded.landscape_16x9,
                })
                .eq('id', ep.id);
            if (persistErr) throw new Error(persistErr.message);

            result.generated.push(ep.id);
        } catch (e) {
            result.failed.push({
                id: ep.id,
                error: e instanceof Error ? e.message : String(e),
            });
        }
    }

    return NextResponse.json({ ok: true, dryRun, ...result });
}
