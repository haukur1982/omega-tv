import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePosterModel } from '@/lib/poster';
import { generateHeroPoster } from '@/lib/hero-poster';

/**
 * POST /api/admin/posters/hero
 *
 * Generate a premium hero poster (2:3, 1000×1500) for a flagship show, from a
 * FULL-RESOLUTION frame (not the 640px candidate) + designed Omega branding.
 *
 * Body:
 *   episodeId   — episode to source the frame from (has poster candidates)
 *   sourceId?   — candidate id to use (else selected_source, else first)
 *   title       — big Fraunces title
 *   tagline?    — italic line under title
 *   host?       — small-caps name at the bottom
 *   preview?    — if true, return a base64 data URL and DON'T persist
 *   seriesId?   — when persisting, also set this series' poster_vertical
 *
 * Source frame: uses the candidate frame Azotus delivered. Poster crispness is
 * therefore bounded by the candidate resolution — the real quality lever is
 * Azotus sending full-res candidates (see vod_publisher._extract_poster_candidates).
 * We deliberately do NOT mutate the Bunny cover thumbnail to pull a full-res
 * frame: that's flaky and it changes the live video's cover.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: {
        episodeId?: string;
        sourceId?: string;
        title?: string;
        tagline?: string;
        host?: string;
        preview?: boolean;
        seriesId?: string;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { episodeId, sourceId, title, tagline, host, preview, seriesId } = body;
    if (!episodeId) return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
    if (!title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const sb = supabaseAdmin as any;
    const { data: ep } = await sb
        .from('episodes')
        .select('id, bunny_video_id, poster_candidates')
        .eq('id', episodeId)
        .maybeSingle();
    if (!ep) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });

    const model = normalizePosterModel(ep.poster_candidates);

    // Resolve the source frame: chosen candidate → selected → first.
    const cand = sourceId
        ? model.source_candidates.find((c) => c.id === sourceId)
        : (model.selected_source ?? model.source_candidates[0]);
    const candidateUrl = (cand as any)?.url ?? null;
    if (!candidateUrl) {
        return NextResponse.json(
            { error: 'No source frame available. Pick a candidate first.' },
            { status: 400 },
        );
    }

    let sourceImage: Buffer | null = null;
    try {
        const r = await fetch(candidateUrl, { cache: 'no-store' });
        if (r.ok) sourceImage = Buffer.from(await r.arrayBuffer());
    } catch {
        /* handled below */
    }
    if (!sourceImage) {
        return NextResponse.json({ error: 'Could not fetch the source frame.' }, { status: 502 });
    }
    // Crispness is bounded by candidate resolution; ≥1200px wide ≈ full-res.
    const meta = await (await import('sharp')).default(sourceImage).metadata();
    const usedFullRes = (meta.width ?? 0) >= 1200;

    let poster: Buffer;
    try {
        poster = await generateHeroPoster({
            sourceImage,
            title: title.trim(),
            tagline: tagline?.trim() || undefined,
            host: host?.trim() || undefined,
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Poster generation failed' },
            { status: 500 },
        );
    }

    // Preview mode: return inline, don't persist.
    if (preview) {
        return NextResponse.json({
            ok: true,
            usedFullRes,
            dataUrl: `data:image/png;base64,${poster.toString('base64')}`,
        });
    }

    // Persist: upload to storage.
    const stamp = Date.now();
    const base = ep.bunny_video_id || ep.id;
    const filename = `hero_${base}_${stamp}.png`;
    const { error: upErr } = await sb.storage
        .from('thumbnails')
        .upload(filename, poster, { contentType: 'image/png', cacheControl: '3600', upsert: true });
    if (upErr) {
        return NextResponse.json({ error: `Upload failed: ${upErr.message ?? upErr}` }, { status: 500 });
    }
    const { data: urlData } = sb.storage.from('thumbnails').getPublicUrl(filename);
    const posterUrl = urlData.publicUrl as string;

    // Optionally set it as the series' vertical poster.
    if (seriesId) {
        const { error: serErr } = await sb
            .from('series')
            .update({ poster_vertical: posterUrl })
            .eq('id', seriesId);
        if (serErr) {
            return NextResponse.json(
                { ok: true, posterUrl, usedFullRes, warning: `Poster made but series update failed: ${serErr.message}` },
            );
        }
    }

    return NextResponse.json({ ok: true, posterUrl, usedFullRes, seriesUpdated: !!seriesId });
}
