import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
    normalizePosterModel,
    type PosterModel,
} from '@/lib/poster';
import { polishAndBrandEpisode } from '@/lib/poster-polish';

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
            // Delegate to the shared key-art pipeline: select (respecting any
            // human pick) → AI re-polish → brand → upload → persist. `force`
            // because this is a deliberate admin action.
            const outcome = await polishAndBrandEpisode(
                {
                    id: episode.id,
                    title: episode.title,
                    bunny_video_id: episode.bunny_video_id,
                    poster_candidates: episode.poster_candidates,
                    series_id: episode.series_id,
                },
                { force: true },
            );
            if (outcome.status === 'skipped_no_source') {
                return NextResponse.json(
                    { error: 'No source frame available to brand.' },
                    { status: 400 },
                );
            }
            if (outcome.status === 'failed') {
                return NextResponse.json(
                    { error: outcome.error ?? 'Poster generation failed' },
                    { status: 500 },
                );
            }
            return NextResponse.json({
                success: true,
                model: outcome.model ?? model,
                usedAi: outcome.usedAi ?? false,
            });
        }

        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Poster operation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
