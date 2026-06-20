/**
 * Episode key-art pipeline — orchestration core.
 *
 * One episode → a good source frame → AI re-polish (upscale + face restore) →
 * Omega brand treatment (16:9 + 4:5) → uploaded + recorded on the episode.
 * This is the single place the whole pipeline lives; the cron, the admin
 * "generate" action, and the backfill all call `polishAndBrandEpisode`.
 *
 * Design guarantees:
 *  - It ALWAYS leaves an episode with a branded poster. AI is an enhancement;
 *    if FAL_KEY is missing or fal fails, it falls back to the raw frame + the
 *    existing Sharp grade and records `polish.used_ai = false` (upgradable later).
 *  - Identity-preserving: re-polish uses face *restoration* (fal codeformer at
 *    fidelity 0.8), never a generative face model. See src/lib/fal.ts.
 *  - Idempotent + cost-safe: AT MOST ONE fal call per episode; `needsPolish`
 *    won't re-queue finished work, won't loop without fal, and caps retries.
 */

import sharp from 'sharp';
import { supabaseAdmin } from './supabase';
import { generatePosterVariants } from './thumbnail-generator';
import {
    normalizePosterModel,
    POSTER_BRAND_VERSION,
    type PosterModel,
    type PosterPolish,
} from './poster';
import { selectBestCandidate } from './poster-select';
import { repolishFrame, falConfigured } from './fal';

const MAX_POLISH_ATTEMPTS = 3;
const FIDELITY = 0.8;

export interface PolishableEpisode {
    id: string;
    title: string | null;
    bunny_video_id: string | null;
    poster_candidates: unknown;
    series_id: string | null;
}

export interface PolishOutcome {
    episodeId: string;
    status: 'generated' | 'skipped_done' | 'skipped_no_source' | 'failed';
    usedAi?: boolean;
    selectMethod?: string;
    model?: PosterModel;
    error?: string;
}

/**
 * Idempotency rule (the cost guardrail). Returns true if this episode should be
 * (re)processed:
 *   - no branded variant yet                                  → process
 *   - branded but Sharp-only AND a re-polishable candidate exists AND fal is
 *     configured AND under the retry cap                       → upgrade to AI
 *   - otherwise (AI-done, legacy, no source, or no fal)        → skip
 */
export function needsPolish(model: PosterModel): boolean {
    const hasVariant = Boolean(model.variants.landscape_16x9 || model.variants.portrait_4x5);
    if (!hasVariant) return true;

    const hasRepolishableSource = Boolean(
        model.selected_source?.url || (model.source_candidates?.length ?? 0) > 0,
    );
    const p = model.polish;
    return Boolean(
        hasRepolishableSource &&
        p &&
        p.used_ai === false &&
        (p.attempts ?? 0) < MAX_POLISH_ATTEMPTS &&
        falConfigured(),
    );
}

async function fetchBuffer(url: string): Promise<Buffer> {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`fetch ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
}

/**
 * Run the full pipeline for one episode. Never throws — returns an outcome.
 * `force` bypasses the `needsPolish` guard (admin "re-polish" / deliberate
 * backfill upgrade).
 */
export async function polishAndBrandEpisode(
    ep: PolishableEpisode,
    opts: { force?: boolean } = {},
): Promise<PolishOutcome> {
    const model = normalizePosterModel(ep.poster_candidates);

    if (!opts.force && !needsPolish(model)) {
        return { episodeId: ep.id, status: 'skipped_done', model };
    }

    // 1. Choose the best source frame (human → Gemini vision → heuristic).
    const chosen = await selectBestCandidate(model);
    if (!chosen && !ep.bunny_video_id) {
        return { episodeId: ep.id, status: 'skipped_no_source', model };
    }

    try {
        // 2. AI re-polish the chosen frame (graceful — usedAi=false on skip/fail).
        let sourceImage: Buffer | undefined;
        let usedAi = false;
        let polishModel: string | null = null;
        let outW: number | null = null;
        let outH: number | null = null;
        let estCost = 0;

        if (chosen?.url) {
            const re = await repolishFrame(chosen.url, { fidelity: FIDELITY, upscaleFactor: 2 });
            if (re.usedAi && re.url) {
                usedAi = true;
                polishModel = re.model;
                outW = re.width;
                outH = re.height;
                estCost = re.estCostUsd;
                sourceImage = await fetchBuffer(re.url);
            } else {
                sourceImage = await fetchBuffer(chosen.url);
            }
        }
        // else: no candidate → generatePosterVariants pulls the Bunny auto-frame.

        let srcW: number | null = null;
        let srcH: number | null = null;
        if (sourceImage) {
            try {
                const m = await sharp(sourceImage).metadata();
                srcW = m.width ?? null;
                srcH = m.height ?? null;
            } catch {
                /* dims are best-effort metadata only */
            }
        }

        // 3. Brand into the two aspects the public UI consumes. CLEAN still —
        //    no baked text (the UI renders titles); just the graded,
        //    subtitle-cropped, centered frame.
        const variants = await generatePosterVariants({
            ...(sourceImage ? { sourceImage } : { bunnyVideoId: ep.bunny_video_id! }),
            cleanVodCrop: true,
        });

        // 4. Upload both variants to the thumbnails bucket.
        const sb = supabaseAdmin as unknown as { storage: any; from: (t: string) => any };
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

        // 5. Persist — variants + selected_source (so future upgrades reuse the
        //    same frame, no drift) + polish provenance + legacy thumbnail mirror.
        const nowIso = new Date().toISOString();
        const polish: PosterPolish = {
            provider: usedAi ? 'fal' : null,
            model: polishModel,
            fidelity: usedAi ? FIDELITY : null,
            select_method: chosen?.method ?? null,
            source_w: srcW,
            source_h: srcH,
            output_w: outW,
            output_h: outH,
            est_cost_usd: estCost,
            used_ai: usedAi,
            attempts: (model.polish?.attempts ?? 0) + 1,
            updated_at: nowIso,
        };
        const next: PosterModel = {
            ...model,
            selected_source: chosen
                ? { id: chosen.id, url: chosen.url, time_sec: chosen.time_sec }
                : model.selected_source,
            variants: {
                ...model.variants,
                landscape_16x9: uploaded.landscape_16x9,
                portrait_4x5: uploaded.portrait_4x5,
            },
            brand_version: POSTER_BRAND_VERSION,
            polish,
            updated_at: nowIso,
        };

        const { error: persistErr } = await sb
            .from('episodes')
            .update({ poster_candidates: next, thumbnail_custom: uploaded.landscape_16x9 })
            .eq('id', ep.id);
        if (persistErr) throw new Error(persistErr.message);

        return {
            episodeId: ep.id,
            status: 'generated',
            usedAi,
            selectMethod: chosen?.method,
            model: next,
        };
    } catch (e) {
        return {
            episodeId: ep.id,
            status: 'failed',
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
