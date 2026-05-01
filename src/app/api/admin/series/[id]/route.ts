import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * PATCH /api/admin/series/[id]
 *
 * Updates editable fields on a series row. Primary use today is the
 * inline category picker on the "Hvar mun þetta birtast?" panel in the
 * draft editor — a published episode in an uncategorized series is
 * invisible to all the SeriesShelf rails on /sermons, so flipping
 * `category` is the one-click fix to land it in the right shelf.
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

    const allowed = new Set([
        'title',
        'slug',
        'description',
        'host',
        'category',
        'poster_horizontal',
        'poster_vertical',
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
        .from('series')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Series update failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, series: data });
}
