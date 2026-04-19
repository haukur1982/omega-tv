import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * PATCH  /api/admin/featured-weeks/[id]  → edit any writable column
 * DELETE /api/admin/featured-weeks/[id]  → delete (not soft-delete; use unpublish for soft)
 *
 * To unpublish without deleting, PATCH with { published_at: null }.
 * To republish, PATCH with { published_at: <ISO> } or omit (frontend picks
 * the most-recently-published non-fallback row automatically).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

const WRITABLE_COLUMNS = new Set([
    'week_start_date',
    'hero_image_url',
    'hero_image_alt',
    'kicker',
    'headline',
    'body',
    'primary_cta_label',
    'primary_cta_href',
    'secondary_cta_label',
    'secondary_cta_href',
    'sermon_id_pick',
    'article_id_pick',
    'prayer_id_pick',
    'featured_passage_ref',
    'featured_series_id',
    'published_at',
]);

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

    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
        if (WRITABLE_COLUMNS.has(k)) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: 'Engin breyting.' }, { status: 400 });
    }

    const { data, error } = await sb
        .from('featured_weeks')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('featured-weeks PATCH failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { id } = await params;

    // Guard against deleting the fallback row
    const { data: row } = await sb.from('featured_weeks').select('is_fallback').eq('id', id).maybeSingle();
    if (row?.is_fallback) {
        return NextResponse.json({ error: 'Ekki er hægt að eyða vararöðinni (fallback). Búðu til nýja vikuforsíðu eða afbirtu þessa í staðinn.' }, { status: 400 });
    }

    const { error } = await sb.from('featured_weeks').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
