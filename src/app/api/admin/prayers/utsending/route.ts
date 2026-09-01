import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    getBroadcastBoard,
    addToBroadcastStack,
    removeFromBroadcastStack,
    setBroadcastOrder,
    markPrayerAired,
    type MinistryWrite,
} from '@/lib/prayer-db';

/**
 * The producer stack — what the studio has open during a prayer program.
 * Section `samskipti`, same as the queue it draws from.
 *
 *   GET                                   → { missing, eligible, stack }
 *   POST { action:'add',    id }          → onto the bottom of the stack
 *   POST { action:'remove', id }          → back to the eligible list
 *   POST { action:'order',  ids: [] }     → renumber the whole stack
 *   POST { action:'aired',  id, program } → it was prayed on air
 *
 * `missing: true` means 20260901_prayer_ministry.sql has not been applied. The
 * page turns that into run-this-SQL guidance rather than an error.
 */

const MIGRATION_HINT =
    'Bænaþjónustan er ekki komin í gagnagrunninn. Keyrðu SQL-ið fyrst: supabase/migrations/20260901_prayer_ministry.sql';

function answer(result: MinistryWrite) {
    if (result.missing) {
        return NextResponse.json({ error: MIGRATION_HINT, missing: true }, { status: 409 });
    }
    if (!result.ok) {
        return NextResponse.json({ error: result.error ?? 'Aðgerðin mistókst.' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request, { section: 'samskipti' });
    if (auth.error) return auth.error;

    const board = await getBroadcastBoard();
    return NextResponse.json({
        missing: board.missing,
        hint: board.missing ? MIGRATION_HINT : null,
        eligible: board.eligible,
        stack: board.stack,
    });
}

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request, { section: 'samskipti' });
    if (auth.error) return auth.error;

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 });
    }

    const id = typeof body.id === 'string' ? body.id : '';

    if (body.action === 'add') {
        if (!id) return NextResponse.json({ error: 'Vantar auðkenni.' }, { status: 400 });
        return answer(await addToBroadcastStack(id));
    }

    if (body.action === 'remove') {
        if (!id) return NextResponse.json({ error: 'Vantar auðkenni.' }, { status: 400 });
        return answer(await removeFromBroadcastStack(id));
    }

    if (body.action === 'order') {
        const ids = Array.isArray(body.ids) ? body.ids.filter((v): v is string => typeof v === 'string') : [];
        if (ids.length === 0) return NextResponse.json({ error: 'Vantar röðina.' }, { status: 400 });
        return answer(await setBroadcastOrder(ids));
    }

    if (body.action === 'aired') {
        if (!id) return NextResponse.json({ error: 'Vantar auðkenni.' }, { status: 400 });
        const program = typeof body.program === 'string' ? body.program : '';
        return answer(await markPrayerAired(id, program));
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
