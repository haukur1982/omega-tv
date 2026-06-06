import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { updateBunnyChapters } from '@/lib/bunny';
import { logEvent } from '@/lib/system-events';

/**
 * GET /api/admin/episodes/[id]
 *
 * Service-role read of a single episode (all fields, drafts + transcript
 * included). Admin-gated, so the cockpit at /admin/drafts/[id] can load an
 * unpublished draft WITHOUT exposing it to the public anon key. This is the
 * secure replacement for the cockpit's old client-side anon read.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const untyped = supabaseAdmin as any;
    // Resolve by episode id first; fall back to the Bunny video guid so the
    // editor is reachable from the Videos section (which only has the guid).
    // Both are UUID-shaped, so we can't tell them apart by format — try in order.
    let { data, error } = await untyped
        .from('episodes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (!data) {
        ({ data, error } = await untyped
            .from('episodes')
            .select('*')
            .eq('bunny_video_id', id)
            .maybeSingle());
    }

    if (error || !data) {
        return NextResponse.json({ error: error?.message ?? 'Fann ekki þátt.' }, { status: 404 });
    }
    return NextResponse.json({ episode: data });
}

/**
 * PATCH /api/admin/episodes/[id]
 *
 * Updates any editable field on an episode. Used by the /admin/drafts
 * edit form. Accepts all the Phase 2/3 fields (bible_ref, editor_note,
 * chapters, tags, transcript_url, captions_available, language_primary)
 * plus the originals (title, description, thumbnail_custom, etc.).
 *
 * Service-role insert bypasses RLS; admin auth checks ensure only
 * signed-in admins can hit this.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    let body: Record<string, unknown> = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }

    // Whitelist of updatable columns — never trust arbitrary keys.
    const allowed = new Set([
        'title',
        'description',
        'episode_number',
        'thumbnail_custom',
        'series_id',
        'season_id',
        'status',
        'bible_ref',
        'editor_note',
        'chapters',
        'tags',
        'transcript_url',
        'captions_available',
        'language_primary',
        'review_status',
        'assigned_to',
        'review_notes',
        'metadata_confidence',
        'poster_candidates',
        'azotus_track_id',
        'azotus_job_id',
        'source_language',
    ]);

    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
        if (allowed.has(key)) patch[key] = value;
    }
    if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: 'Engin breyting.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const untyped = supabaseAdmin as any;
    // The editor is reachable by episode id OR Bunny video guid (Videos section),
    // and both are UUID-shaped — resolve to the real episode id before updating so
    // the .single() never matches zero rows ("cannot coerce ... single JSON object").
    let realId = id;
    const byId = await untyped.from('episodes').select('id').eq('id', id).maybeSingle();
    if (!byId.data) {
        const byGuid = await untyped.from('episodes').select('id').eq('bunny_video_id', id).maybeSingle();
        if (byGuid.data) realId = byGuid.data.id;
    }

    const { data, error } = await untyped
        .from('episodes')
        .update(patch)
        .eq('id', realId)
        .select()
        .single();

    if (error) {
        console.error('Episode update failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if ('chapters' in patch && data?.bunny_video_id) {
        const ok = await updateBunnyChapters(
            data.bunny_video_id,
            Array.isArray(data.chapters) ? data.chapters : [],
        );
        await logEvent(
            ok ? 'bunny.chapters_updated' : 'bunny.chapters_update_failed',
            ok ? 'info' : 'warn',
            ok ? 'Updated Bunny chapters from Omega draft review.' : 'Could not update Bunny chapters from Omega draft review.',
            { episode_id: id, bunny_video_id: data.bunny_video_id },
            auth.user.email ?? auth.user.id ?? 'admin',
        );
    }

    return NextResponse.json({ ok: true, episode: data });
}
