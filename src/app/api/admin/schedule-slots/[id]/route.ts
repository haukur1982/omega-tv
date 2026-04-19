import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

const WRITABLE_COLUMNS = new Set([
    'starts_at',
    'ends_at',
    'program_title',
    'program_subtitle',
    'program_type',
    'episode_id',
    'series_id',
    'host_name',
    'description',
    'is_live_broadcast',
    'is_featured',
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

    // If both starts_at and ends_at supplied, sanity check ordering
    if (patch.starts_at && patch.ends_at) {
        if (new Date(String(patch.ends_at)).getTime() <= new Date(String(patch.starts_at)).getTime()) {
            return NextResponse.json({ error: 'Lokatími verður að vera á eftir byrjunartíma.' }, { status: 400 });
        }
    }

    const { data, error } = await sb
        .from('schedule_slots')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('schedule_slots PATCH failed:', error);
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
    const { error } = await sb.from('schedule_slots').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
