import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePosterVariants } from '@/lib/thumbnail-generator';
import {
    normalizePosterModel,
    POSTER_BRAND_VERSION,
    type PosterModel,
} from '@/lib/poster';

/**
 * Poster Machine V1 — admin endpoint (DISPATCH-003 §4).
 *
 *   GET  ?episodeId=…                         → normalized poster model
 *   POST { episodeId, action:'select', sourceId }
 *   POST { episodeId, action:'generate' }     → brand 16:9 + 4:5 from selection
 *   POST { episodeId, action:'manual', landscape_16x9?, portrait_4x5? }
 *
 * The reviewer must always be able to override automation — `manual`
 * exists for exactly that. Nothing here publishes; it only writes poster
 * assets onto the (still-draft) episode.
 */

type EpisodeRow = {
    id: string;
    title: string | null;
    bunny_video_id: string | null;
    thumbnail_custom: string | null;
    poster_candidates: unknown;
    series_id: string | null;
};

async function loadEpisode(episodeId: string): Promise<EpisodeRow | null> {
    const sb = supabaseAdmin as any;
    const { data } = await sb
        .from('episodes')
        .select('id, title, bunny_video_id, thumbnail_custom, poster_candidates, series_id')
        .eq('id', episodeId)
        .maybeSingle();
    return (data as EpisodeRow) ?? null;
}

async function seriesTitle(seriesId: string | null): Promise<string | undefined> {
    if (!seriesId) return undefined;
    const sb = supabaseAdmin as any;
    const { data } = await sb.from('series').select('title').eq('id', seriesId).maybeSingle();
    return data?.title ?? undefined;
}

async function persistModel(
    episodeId: string,
    model: PosterModel,
    extra: Record<string, unknown> = {},
): Promise<void> {
    const sb = supabaseAdmin as any;
    const { error } = await sb
        .from('episodes')
        .update({ poster_candidates: model, ...extra })
        .eq('id', episodeId);
    if (error) throw error;
}

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');
    if (!episodeId) {
        return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
    }

    const episode = await loadEpisode(episodeId);
    if (!episode) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        model: normalizePosterModel(episode.poster_candidates),
        thumbnail_custom: episode.thumbnail_custom,
        bunny_video_id: episode.bunny_video_id,
    });
}

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: {
        episodeId?: string;
        action?: 'select' | 'generate' | 'manual';
        sourceId?: string;
        landscape_16x9?: string;
        portrait_4x5?: string;
        seriesName?: string;
        episodeTitle?: string;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { episodeId, action } = body;
    if (!episodeId) return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
    if (!action) return NextResponse.json({ error: 'action is required' }, { status: 400 });

    const episode = await loadEpisode(episodeId);
    if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });

    const model = normalizePosterModel(episode.poster_candidates);

    try {
        if (action === 'select') {
            const sourceId = body.sourceId;
            const candidate = model.source_candidates.find((c) => c.id === sourceId);
            if (!candidate) {
                return NextResponse.json({ error: 'Unknown candidate sourceId' }, { status: 400 });
            }
            model.selected_source = {
                id: candidate.id,
                url: candidate.url,
                time_sec: candidate.time_sec,
            };
            model.updated_at = new Date().toISOString();
            await persistModel(episodeId, model);
            return NextResponse.json({ success: true, model });
        }

        if (action === 'manual') {
            const landscape = typeof body.landscape_16x9 === 'string' && body.landscape_16x9.trim()
                ? body.landscape_16x9.trim()
                : null;
            const portrait = typeof body.portrait_4x5 === 'string' && body.portrait_4x5.trim()
                ? body.portrait_4x5.trim()
                : null;
            if (!landscape && !portrait) {
                return NextResponse.json(
                    { error: 'Provide landscape_16x9 and/or portrait_4x5 URL' },
                    { status: 400 },
                );
            }
            if (landscape) model.variants.landscape_16x9 = landscape;
            if (portrait) model.variants.portrait_4x5 = portrait;
            model.brand_version = 'manual';
            model.updated_at = new Date().toISOString();
            // Mirror the landscape into thumbnail_custom so every existing
            // consumer (sermons list, show page, ThumbnailFrame) upgrades
            // with zero changes — one smooth machine.
            await persistModel(
                episodeId,
                model,
                landscape ? { thumbnail_custom: landscape } : {},
            );
            return NextResponse.json({ success: true, model });
        }

        if (action === 'generate') {
            if (!model.selected_source?.url) {
                return NextResponse.json(
                    { error: 'No source frame selected. Pick a candidate first.' },
                    { status: 400 },
                );
            }

            // Fetch the chosen source frame into a buffer.
            const srcRes = await fetch(model.selected_source.url, { cache: 'no-store' });
            if (!srcRes.ok) {
                return NextResponse.json(
                    { error: `Could not fetch selected source frame (${srcRes.status})` },
                    { status: 502 },
                );
            }
            const sourceImage = Buffer.from(await srcRes.arrayBuffer());

            const variants = await generatePosterVariants({
                sourceImage,
                seriesName: body.seriesName ?? (await seriesTitle(episode.series_id)),
                episodeTitle: body.episodeTitle ?? episode.title ?? undefined,
                cleanVodCrop: true,
            });

            const stamp = Date.now();
            const base = episode.bunny_video_id || episode.id;
            const uploads: Record<'landscape_16x9' | 'portrait_4x5', string> = {
                landscape_16x9: '',
                portrait_4x5: '',
            };

            for (const aspect of ['landscape_16x9', 'portrait_4x5'] as const) {
                const filename = `${base}_${aspect}_${stamp}.png`;
                const { error: upErr } = await (supabaseAdmin as any).storage
                    .from('thumbnails')
                    .upload(filename, variants[aspect], {
                        contentType: 'image/png',
                        cacheControl: '3600',
                        upsert: true,
                    });
                if (upErr) {
                    return NextResponse.json(
                        { error: `Failed to upload ${aspect}: ${upErr.message ?? upErr}` },
                        { status: 500 },
                    );
                }
                const { data: urlData } = (supabaseAdmin as any).storage
                    .from('thumbnails')
                    .getPublicUrl(filename);
                uploads[aspect] = urlData.publicUrl;
            }

            model.variants.landscape_16x9 = uploads.landscape_16x9;
            model.variants.portrait_4x5 = uploads.portrait_4x5;
            model.brand_version = POSTER_BRAND_VERSION;
            model.updated_at = new Date().toISOString();

            await persistModel(episodeId, model, {
                thumbnail_custom: uploads.landscape_16x9,
            });
            return NextResponse.json({ success: true, model });
        }

        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Poster operation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
