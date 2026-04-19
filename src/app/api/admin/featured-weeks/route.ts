import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET  /api/admin/featured-weeks  → list all (live + history), newest first
 * POST /api/admin/featured-weeks  → create a new featured-week row and publish it
 *
 * Publish semantics: a POST with `publish: true` (default) sets
 * `published_at = now()`. The frontend's `getCurrentFeaturedWeek()`
 * picks the most-recently-published non-fallback row, so POST-and-publish
 * atomically becomes "this week's hero."
 *
 * Fallback rows (`is_fallback = true`) are never created via this API —
 * they only exist from the seed migration. Admin editor only makes real
 * weekly features.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

const WRITABLE_COLUMNS = [
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
];

export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { data, error } = await sb
        .from('featured_weeks')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: Record<string, unknown> = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }

    // Whitelist input to the writable columns
    const payload: Record<string, unknown> = { is_fallback: false };
    for (const col of WRITABLE_COLUMNS) {
        if (col in body && body[col] !== undefined) payload[col] = body[col];
    }

    // Required fields
    const required = ['week_start_date', 'hero_image_url', 'kicker', 'headline', 'body', 'primary_cta_label', 'primary_cta_href'];
    const missing = required.filter((k) => !payload[k] || String(payload[k]).trim() === '');
    if (missing.length > 0) {
        return NextResponse.json({ error: `Vantar: ${missing.join(', ')}` }, { status: 400 });
    }

    // Publish immediately unless explicitly set to draft (publish: false)
    const shouldPublish = body.publish !== false;
    if (shouldPublish) {
        payload.published_at = new Date().toISOString();
    } else {
        payload.published_at = null;
    }

    const { data, error } = await sb
        .from('featured_weeks')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('featured-weeks insert failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: data });
}
