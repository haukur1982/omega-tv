import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

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
    const { data, error } = await untyped
        .from('episodes')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Episode update failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, episode: data });
}
