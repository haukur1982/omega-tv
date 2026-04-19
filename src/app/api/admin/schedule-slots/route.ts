import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET  /api/admin/schedule-slots?week=YYYY-MM-DD  → slots for that ISO week
 *                                                  (Mon-Sun of week containing given date)
 *                                                  If `week` omitted, returns the current week.
 * POST /api/admin/schedule-slots                  → create a new slot
 *
 * Auth: admin session required. Write path uses service-role so RLS
 * policies don't need to accommodate admin clients.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

const WRITABLE_COLUMNS = [
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
];

function weekBoundsUtc(anchorIso?: string): { startIso: string; endIso: string } {
    const anchor = anchorIso ? new Date(anchorIso + 'T00:00:00Z') : new Date();
    const dow = anchor.getUTCDay();
    const daysFromMonday = (dow + 6) % 7;
    const monday = new Date(Date.UTC(
        anchor.getUTCFullYear(),
        anchor.getUTCMonth(),
        anchor.getUTCDate() - daysFromMonday,
    ));
    const sundayEnd = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { startIso: monday.toISOString(), endIso: sundayEnd.toISOString() };
}

export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get('week');
    const { startIso, endIso } = weekBoundsUtc(weekParam ?? undefined);

    const { data, error } = await sb
        .from('schedule_slots')
        .select('*')
        .gte('starts_at', startIso)
        .lt('starts_at', endIso)
        .order('starts_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [], week_start: startIso, week_end: endIso });
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

    const required = ['starts_at', 'ends_at', 'program_title'];
    const missing = required.filter((k) => !payload[k] || String(payload[k]).trim() === '');
    if (missing.length > 0) {
        return NextResponse.json({ error: `Vantar: ${missing.join(', ')}` }, { status: 400 });
    }

    // Sanity: ends_at must be after starts_at
    if (new Date(String(payload.ends_at)).getTime() <= new Date(String(payload.starts_at)).getTime()) {
        return NextResponse.json({ error: 'Lokatími verður að vera á eftir byrjunartíma.' }, { status: 400 });
    }

    const { data, error } = await sb
        .from('schedule_slots')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('schedule_slots insert failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, item: data });
}
