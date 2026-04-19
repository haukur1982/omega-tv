import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getBunnyVideoDetail } from '@/lib/bunny';
import { generateMetadata } from '../../../../../../scripts/generate-metadata';

/**
 * POST /api/admin/drafts/create
 *
 * Creates a new draft episode from a Bunny video ID. Entry point for the
 * "Nýtt drag" admin page. Works for:
 *   - Native Icelandic content uploaded manually to Bunny (no Azotus)
 *   - One-off content from phone recordings, guest contributions, archive cleanup
 *
 * Flow:
 *   1. Validate that the Bunny video exists (fetch its detail)
 *   2. If a transcript is supplied, call generateMetadata() — same path
 *      Azotus uses, so Gemini (when keyed) or mock mode (when not)
 *   3. Upsert an episodes row with status='draft'
 *   4. Return the episode id so the client can redirect to the edit form
 *
 * Body (JSON):
 *   { bunny_video_id: string, title?: string, transcript?: string,
 *     series_id?: string, season_id?: string, language?: 'is' | 'en' }
 */
export async function POST(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: {
        bunny_video_id?: string;
        title?: string;
        transcript?: string;
        series_id?: string;
        season_id?: string;
        language?: 'is' | 'en';
    } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }

    const bunnyId = body.bunny_video_id?.trim();
    if (!bunnyId) {
        return NextResponse.json({ error: 'Bunny myndband ID vantar.' }, { status: 400 });
    }

    // Pull Bunny detail — gives us duration + canonical title + caption list.
    // We still allow the request through if Bunny doesn't respond (dev mode
    // with empty library), just with less populated data.
    const bunnyDetail = await getBunnyVideoDetail(bunnyId);

    // If a transcript was pasted, generate metadata. Otherwise we create a
    // nearly-empty draft and Hawk fills in the fields in the edit form.
    let metaTitle = body.title?.trim() || bunnyDetail?.title?.replace(/\.[^/.]+$/, '') || 'Nýtt drag';
    let metaDescription: string | null = null;
    let metaEditorNote: string | null = null;
    let metaBibleRef: string | null = null;
    let metaChapters: { t: number; title: string }[] | null = null;
    let metaTags: string[] = [];

    if (body.transcript && body.transcript.trim().length > 40) {
        try {
            const m = await generateMetadata({
                transcriptText: body.transcript,
                bunnyVideoId: bunnyId,
                filename: bunnyDetail?.title,
                language: body.language ?? 'is',
            });
            // Respect explicit title override from the form
            if (!body.title) metaTitle = m.title || metaTitle;
            metaDescription = m.description || null;
            metaEditorNote = m.editor_note || null;
            metaBibleRef = m.bible_ref;
            metaChapters = m.chapters.length > 0 ? m.chapters : null;
            metaTags = m.tags;
        } catch (e) {
            console.warn('[drafts/create] metadata generation failed:', (e as Error).message);
        }
    }

    const captionsAvailable = bunnyDetail?.captions
        ? bunnyDetail.captions.map((c) => c.srclang)
        : [];

    // Upsert by bunny_video_id — if a draft/published row already exists, we
    // update it rather than creating duplicates.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { data: existing } = await sb
        .from('episodes')
        .select('id, status')
        .eq('bunny_video_id', bunnyId)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({
            error: `Þetta myndband er þegar til í gagnagrunni${existing.status === 'published' ? ' og birt' : ''}. Opnaðu það til að laga.`,
            existing_id: existing.id,
        }, { status: 409 });
    }

    const payload: Record<string, unknown> = {
        bunny_video_id: bunnyId,
        title: metaTitle,
        description: metaDescription,
        editor_note: metaEditorNote,
        bible_ref: metaBibleRef,
        chapters: metaChapters,
        tags: metaTags,
        captions_available: captionsAvailable,
        duration: bunnyDetail?.length ?? null,
        language_primary: body.language ?? 'is',
        series_id: body.series_id || null,
        season_id: body.season_id || null,
        status: 'draft',
        episode_number: 1, // reviewer sets the real number
    };
    // Persist the transcript so downstream generators (articles etc.)
    // can re-read it without the user re-pasting.
    if (body.transcript && body.transcript.trim().length > 40) {
        payload.transcript = body.transcript.trim();
    }

    const { data: created, error } = await sb
        .from('episodes')
        .insert(payload)
        .select('id')
        .single();

    if (error) {
        console.error('[drafts/create] insert failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: created.id });
}
