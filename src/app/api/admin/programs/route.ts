import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

const WRITABLE_COLUMNS = [
    'title',
    'program_type',
    'host_name',
    'description',
    'is_usually_live',
    'is_featured_default',
    'default_bible_ref',
    'default_tags',
    'series_id',
];

export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { data, error } = await sb
        .from('programs')
        .select('*')
        .order('title', { ascending: true });
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

    const payload: Record<string, unknown> = {};
    for (const col of WRITABLE_COLUMNS) {
        if (col in body && body[col] !== undefined) payload[col] = body[col];
    }
    if (!payload.title || String(payload.title).trim() === '') {
        return NextResponse.json({ error: 'Titill er nauðsynlegur.' }, { status: 400 });
    }

    const { data, error } = await sb.from('programs').insert(payload).select().single();
    if (error) {
        // Unique constraint on title
        if (error.code === '23505') {
            return NextResponse.json({ error: `Þáttur "${payload.title}" er þegar til.` }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, item: data });
}
