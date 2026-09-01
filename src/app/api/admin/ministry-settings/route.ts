import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getMinistrySettings, saveMinistrySettings } from '@/lib/ministry-settings';
import { EMPTY_MINISTRY_SETTINGS } from '@/lib/ministry-shared';

/**
 * The prayer ministry settings card on /admin/settings — section `kerfi`.
 *
 *   GET  → { settings, missing }
 *   PUT  → { settings } saved; { missing:true } when the table is not there yet
 *
 * The number and the hours here are what the public wall prints and what the
 * broadcast says out loud, so they are stjórnandi-level, not bænavörður-level.
 */

const MIGRATION_HINT =
    'Bænaþjónustan er ekki komin í gagnagrunninn. Keyrðu SQL-ið fyrst: supabase/migrations/20260901_prayer_ministry.sql';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request, { section: 'kerfi' });
    if (auth.error) return auth.error;

    const { settings, missing } = await getMinistrySettings();
    return NextResponse.json({ settings, missing, hint: missing ? MIGRATION_HINT : null });
}

export async function PUT(request: Request) {
    const auth = await verifyAdminSession(request, { section: 'kerfi' });
    if (auth.error) return auth.error;

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 });
    }

    const text = (value: unknown) => (typeof value === 'string' ? value : '');
    const next = {
        ...EMPTY_MINISTRY_SETTINGS,
        prayerPhone: text(body.prayerPhone),
        phoneHours: text(body.phoneHours),
        scheduleNote: text(body.scheduleNote),
        liveNow: body.liveNow === true,
    };

    const result = await saveMinistrySettings(next);
    if (result.missing) {
        return NextResponse.json({ error: MIGRATION_HINT, missing: true }, { status: 409 });
    }
    if (!result.ok) {
        return NextResponse.json({ error: result.error ?? 'Tókst ekki að vista.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, settings: next });
}
