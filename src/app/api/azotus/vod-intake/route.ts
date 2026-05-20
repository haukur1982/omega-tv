import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateMetadata, type GeneratedMetadata } from '../../../../../scripts/generate-metadata';
import { normalizePosterModel, type PosterModel } from '@/lib/poster';

type IntakePayload = {
    azotus_track_id?: string;
    azotus_job_id?: string;
    bunny_video_id?: string;
    language?: 'is' | 'en' | string;
    source_language?: string | null;
    show_slug?: string | null;
    show_name?: string | null;
    episode_code?: string | null;
    source_filename?: string | null;
    transcript_text?: string | null;
    vtt_text?: string | null;
    duration_sec?: number | null;
    scripture_hits?: unknown[];
    candidate_chapters?: { t?: number; title?: string }[];
    poster_candidates?: unknown[];
    processing_notes?: unknown;
};

type IntakeStatus = 'received' | 'metadata_pending' | 'poster_pending' | 'draft_ready' | 'needs_attention' | 'failed';

export async function POST(req: NextRequest) {
    const secret = process.env.AZOTUS_WEBHOOK_SECRET;
    if (!secret) {
        return NextResponse.json({ error: 'AZOTUS_WEBHOOK_SECRET is not configured.' }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-azotus-signature') ?? '';
    const timestamp = req.headers.get('x-azotus-timestamp') ?? '';

    if (!verifySignature({ rawBody, signature, timestamp, secret })) {
        return NextResponse.json({ error: 'Invalid Azotus signature.' }, { status: 401 });
    }

    let payload: IntakePayload;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const validation = validatePayload(payload);
    if (validation) {
        return NextResponse.json({ error: validation }, { status: 400 });
    }

    const sb = supabaseAdmin as any;
    const azotusTrackId = payload.azotus_track_id!.trim();
    const bunnyVideoId = payload.bunny_video_id!.trim();

    try {
        const existingJob = await findExistingIntakeJob(azotusTrackId, bunnyVideoId);
        if (existingJob?.episode_id && existingJob.status === 'draft_ready') {
            await logVodEvent('vod_intake.idempotent', 'info', 'Azotus VOD intake already has a draft.', {
                azotus_track_id: azotusTrackId,
                bunny_video_id: bunnyVideoId,
                episode_id: existingJob.episode_id,
            });
            return NextResponse.json({
                ok: true,
                existing: true,
                intake_job_id: existingJob.id,
                episode_id: existingJob.episode_id,
                status: existingJob.status,
            });
        }

        const job = await upsertIntakeJob({
            azotusTrackId,
            azotusJobId: payload.azotus_job_id ?? null,
            bunnyVideoId,
            status: 'metadata_pending',
            payload,
            episodeId: existingJob?.episode_id ?? null,
        });

        await enqueueMetadataJob(job.id, azotusTrackId, bunnyVideoId);

        const transcript = cleanTranscript(payload.transcript_text || payload.vtt_text || '');
        const metadata = await buildMetadata(payload, transcript, bunnyVideoId);
        const episodeId = await upsertDraftEpisodeFromIntake(payload, metadata, transcript);

        const { error: jobErr } = await sb
            .from('vod_intake_jobs')
            .update({
                status: 'draft_ready',
                episode_id: episodeId,
                error_message: null,
            })
            .eq('id', job.id);
        if (jobErr) throw jobErr;

        await logVodEvent('vod_intake.draft_ready', 'info', 'Azotus VOD intake created/updated an Omega draft.', {
            azotus_track_id: azotusTrackId,
            bunny_video_id: bunnyVideoId,
            episode_id: episodeId,
        });

        return NextResponse.json({
            ok: true,
            existing: Boolean(existingJob?.episode_id),
            intake_job_id: job.id,
            episode_id: episodeId,
            status: 'draft_ready',
        });
    } catch (error) {
        // Robust extraction — Supabase JS client surfaces errors as plain
        // {message, code, details, hint} objects (NOT Error instances),
        // so `error instanceof Error` was always false and we lost the
        // real cause as "Unknown intake failure.". Capture every shape.
        const err = (error && typeof error === 'object') ? error as Record<string, unknown> : null;
        const rawMessage =
            (err && typeof err.message === 'string' && err.message) ||
            (typeof error === 'string' && error) ||
            '';
        const message = rawMessage || 'Unknown intake failure.';
        const diagnostic = {
            code: err && typeof err.code === 'string' ? err.code : null,
            details: err && typeof err.details === 'string' ? err.details : null,
            hint: err && typeof err.hint === 'string' ? err.hint : null,
            stack: error instanceof Error ? error.stack : null,
        };
        await markIntakeFailed(azotusTrackId, bunnyVideoId, payload, message);
        await logVodEvent('vod_intake.failed', 'error', message, {
            azotus_track_id: azotusTrackId,
            bunny_video_id: bunnyVideoId,
            diagnostic,
        });
        return NextResponse.json({ error: message, diagnostic }, { status: 500 });
    }
}

function verifySignature({
    rawBody,
    signature,
    timestamp,
    secret,
}: {
    rawBody: string;
    signature: string;
    timestamp: string;
    secret: string;
}): boolean {
    if (!signature || !timestamp) return false;
    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) return false;

    const ageMs = Math.abs(Date.now() - ts * 1000);
    if (ageMs > 10 * 60 * 1000) return false;

    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex');

    const expectedBuffer = Buffer.from(expected, 'hex');
    const actualBuffer = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
    return expectedBuffer.length === actualBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function validatePayload(payload: IntakePayload): string | null {
    if (!payload.azotus_track_id?.trim()) return 'azotus_track_id is required.';
    if (!payload.bunny_video_id?.trim()) return 'bunny_video_id is required.';
    if (!payload.language?.trim()) return 'language is required.';
    if (!payload.transcript_text?.trim() && !payload.vtt_text?.trim()) {
        return 'transcript_text or vtt_text is required.';
    }
    return null;
}

async function findExistingIntakeJob(azotusTrackId: string, bunnyVideoId: string) {
    const sb = supabaseAdmin as any;
    const { data: byTrack } = await sb
        .from('vod_intake_jobs')
        .select('id, status, episode_id')
        .eq('azotus_track_id', azotusTrackId)
        .maybeSingle();
    if (byTrack) return byTrack;

    const { data: byBunny } = await sb
        .from('vod_intake_jobs')
        .select('id, status, episode_id')
        .eq('bunny_video_id', bunnyVideoId)
        .maybeSingle();
    return byBunny ?? null;
}

async function upsertIntakeJob({
    azotusTrackId,
    azotusJobId,
    bunnyVideoId,
    status,
    payload,
    episodeId,
}: {
    azotusTrackId: string;
    azotusJobId: string | null;
    bunnyVideoId: string;
    status: IntakeStatus;
    payload: IntakePayload;
    episodeId: string | null;
}) {
    const sb = supabaseAdmin as any;
    const { data, error } = await sb
        .from('vod_intake_jobs')
        .upsert({
            azotus_track_id: azotusTrackId,
            azotus_job_id: azotusJobId,
            bunny_video_id: bunnyVideoId,
            status,
            payload,
            episode_id: episodeId,
            error_message: null,
        }, { onConflict: 'azotus_track_id' })
        .select('id, status, episode_id')
        .single();
    if (error) throw error;
    return data;
}

async function enqueueMetadataJob(jobId: string, azotusTrackId: string, bunnyVideoId: string) {
    const sb = supabaseAdmin as any;
    const { error } = await sb.rpc('enqueue_vod_metadata_job', {
        job_payload: {
            vod_intake_job_id: jobId,
            azotus_track_id: azotusTrackId,
            bunny_video_id: bunnyVideoId,
            requested_at: new Date().toISOString(),
        },
    });
    if (error) {
        await logVodEvent('vod_intake.queue_warn', 'warn', 'Could not enqueue metadata job; continuing inline.', {
            vod_intake_job_id: jobId,
            error: error.message,
        });
    }
}

async function buildMetadata(payload: IntakePayload, transcript: string, bunnyVideoId: string): Promise<GeneratedMetadata> {
    const generated = await generateMetadata({
        transcriptText: transcript,
        bunnyVideoId,
        show: payload.show_name ?? payload.show_slug ?? undefined,
        filename: payload.source_filename ?? payload.episode_code ?? undefined,
        language: payload.language === 'en' ? 'en' : 'is',
    });

    const fallbackChapters = normalizeChapters(payload.candidate_chapters);
    return {
        ...generated,
        chapters: generated.chapters.length > 0 ? generated.chapters : fallbackChapters,
    };
}

/**
 * Poster Machine V1 (DISPATCH-003 §1–2).
 *
 * Azotus extracts candidate frames locally (it owns the finished video)
 * and sends them inline as small base64 JPEGs. Here we move each one into
 * Supabase Storage and return a normalized poster model holding only
 * compact descriptors + public URLs — base64 never touches the DB, so the
 * JSONB column stays small.
 *
 * Fully degradable: no candidates (extraction not ready / failed) → empty
 * model, and the existing single clean Bunny frame still works downstream.
 */
async function ingestPosterCandidates(
    rawCandidates: unknown,
    baseName: string,
): Promise<PosterModel> {
    if (!Array.isArray(rawCandidates) || rawCandidates.length === 0) {
        return normalizePosterModel(null);
    }

    const sb = supabaseAdmin as any;
    const hydrated: Array<Record<string, unknown>> = [];

    for (let i = 0; i < rawCandidates.length && i < 16; i++) {
        const c = rawCandidates[i];
        if (!c || typeof c !== 'object') continue;
        const cand = c as Record<string, unknown>;

        const id = typeof cand.id === 'string' && cand.id.trim()
            ? cand.id.trim()
            : `frame-${i + 1}`;
        const meta = {
            id,
            time_sec: cand.time_sec ?? cand.t ?? null,
            score: cand.score ?? null,
            notes: Array.isArray(cand.notes) ? cand.notes : [],
        };

        // Already-hosted URL (forward-compatible if Azotus later moves to
        // GCS/Bunny-hosted candidate frames) — keep as-is.
        const existingUrl = typeof cand.url === 'string' && cand.url.trim()
            ? cand.url.trim()
            : null;
        if (existingUrl) {
            hydrated.push({ ...meta, url: existingUrl });
            continue;
        }

        const b64 = typeof cand.image_b64 === 'string' ? cand.image_b64 : null;
        if (!b64) continue;
        let buffer: Buffer;
        try {
            buffer = Buffer.from(b64, 'base64');
        } catch {
            continue;
        }
        if (buffer.length === 0) continue;

        const mime = typeof cand.mime === 'string' && cand.mime.startsWith('image/')
            ? cand.mime
            : 'image/jpeg';
        const ext = mime === 'image/png' ? 'png' : 'jpg';
        const filename = `${baseName}_cand_${id}.${ext}`;

        const { error: upErr } = await sb.storage
            .from('thumbnails')
            .upload(filename, buffer, {
                contentType: mime,
                cacheControl: '3600',
                upsert: true,
            });
        if (upErr) {
            await logVodEvent('vod_intake.poster_warn', 'warn', 'Poster candidate upload failed.', {
                base_name: baseName,
                candidate_id: id,
                error: upErr.message ?? String(upErr),
            });
            continue;
        }
        const { data: urlData } = sb.storage.from('thumbnails').getPublicUrl(filename);
        hydrated.push({ ...meta, url: urlData.publicUrl });
    }

    // normalizePosterModel turns the array into the canonical model shape
    // (source_candidates only; selected_source null; no variants yet —
    // the reviewer picks + Omega brands later in the admin cockpit).
    return normalizePosterModel(hydrated);
}

async function upsertDraftEpisodeFromIntake(
    payload: IntakePayload,
    metadata: GeneratedMetadata,
    transcript: string,
): Promise<string> {
    const sb = supabaseAdmin as any;
    const azotusTrackId = payload.azotus_track_id!.trim();
    const bunnyVideoId = payload.bunny_video_id!.trim();

    const existing = await findExistingEpisode(azotusTrackId, bunnyVideoId);
    const posterModel = await ingestPosterCandidates(payload.poster_candidates, bunnyVideoId);
    const commonPayload: Record<string, unknown> = {
        azotus_track_id: azotusTrackId,
        azotus_job_id: payload.azotus_job_id ?? null,
        bunny_video_id: bunnyVideoId,
        title: metadata.title || payload.episode_code || payload.source_filename || 'Nýtt drag',
        description: metadata.description || null,
        editor_note: metadata.editor_note || null,
        bible_ref: metadata.bible_ref,
        chapters: metadata.chapters.length > 0 ? metadata.chapters : null,
        tags: metadata.tags,
        duration: payload.duration_sec != null ? Math.round(payload.duration_sec) : null,
        language_primary: payload.language ?? 'is',
        source_language: payload.source_language ?? null,
        transcript,
        source: 'azotus',
        metadata_confidence: estimateMetadataConfidence(transcript, metadata),
        poster_candidates: posterModel,
    };

    if (existing) {
        const updatePayload = { ...commonPayload };
        delete updatePayload.status;
        delete updatePayload.series_id;
        delete updatePayload.season_id;
        delete updatePayload.episode_number;
        delete updatePayload.thumbnail_custom;
        // Never clobber poster work on re-delivery: once a reviewer has
        // picked a frame / generated branded variants, a repeat intake
        // must not reset it back to raw candidates. Posters only land on
        // first creation; the admin cockpit owns them afterwards.
        delete updatePayload.poster_candidates;
        if (existing.status !== 'published' && !existing.review_status) {
            updatePayload.review_status = 'new';
        }
        const { data, error } = await sb
            .from('episodes')
            .update(updatePayload)
            .eq('id', existing.id)
            .select('id')
            .single();
        if (error) throw error;
        return data.id as string;
    }

    const { data, error } = await sb
        .from('episodes')
        .insert({
            ...commonPayload,
            status: 'draft',
            review_status: 'new',
            episode_number: 1,
        })
        .select('id')
        .single();
    if (error) throw error;
    return data.id as string;
}

async function findExistingEpisode(azotusTrackId: string, bunnyVideoId: string) {
    const sb = supabaseAdmin as any;
    const select = 'id, status, review_status';
    const { data: byBunny } = await sb
        .from('episodes')
        .select(select)
        .eq('bunny_video_id', bunnyVideoId)
        .maybeSingle();
    if (byBunny) return byBunny;

    const { data: byTrack } = await sb
        .from('episodes')
        .select(select)
        .eq('azotus_track_id', azotusTrackId)
        .maybeSingle();
    return byTrack ?? null;
}

async function markIntakeFailed(
    azotusTrackId: string,
    bunnyVideoId: string,
    payload: IntakePayload,
    errorMessage: string,
) {
    const sb = supabaseAdmin as any;
    await sb
        .from('vod_intake_jobs')
        .upsert({
            azotus_track_id: azotusTrackId,
            azotus_job_id: payload.azotus_job_id ?? null,
            bunny_video_id: bunnyVideoId,
            status: 'failed',
            payload,
            error_message: errorMessage,
        }, { onConflict: 'azotus_track_id' });
}

async function logVodEvent(eventType: string, severity: 'info' | 'warn' | 'error', message: string, payload: unknown) {
    try {
        const sb = supabaseAdmin as any;
        await sb.from('system_events').insert({
            event_type: eventType,
            severity,
            message,
            payload,
            actor: 'azotus',
        });
    } catch {
        // Logging must never break intake.
    }
}

function cleanTranscript(text: string): string {
    return text
        .split('\n')
        .filter((line) => {
            const trimmed = line.trim();
            return trimmed
                && !/^WEBVTT/i.test(trimmed)
                && !/^\d+$/.test(trimmed)
                && !/^\d\d:\d\d[:.]/.test(trimmed)
                && !/-->/.test(trimmed);
        })
        .join('\n')
        .trim();
}

function normalizeChapters(chapters: IntakePayload['candidate_chapters']) {
    if (!Array.isArray(chapters)) return [];
    return chapters
        .map((chapter) => ({
            t: typeof chapter.t === 'number' ? Math.max(0, Math.floor(chapter.t)) : NaN,
            title: typeof chapter.title === 'string' ? chapter.title.trim().slice(0, 120) : '',
        }))
        .filter((chapter) => Number.isFinite(chapter.t) && chapter.title.length > 0)
        .sort((a, b) => a.t - b.t)
        .slice(0, 12);
}

function estimateMetadataConfidence(transcript: string, metadata: GeneratedMetadata): number {
    let score = transcript.length > 2000 ? 0.55 : 0.3;
    if (metadata.description.length > 120) score += 0.15;
    if (metadata.chapters.length >= 3) score += 0.15;
    if (metadata.tags.length >= 2) score += 0.05;
    if (metadata.bible_ref) score += 0.05;
    return Math.min(0.95, Number(score.toFixed(3)));
}
