import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { listGlossary, upsertGlossaryTerm, deleteGlossaryTerm } from '@/lib/devotional-db';

/**
 * Locked terminology for the devotional collections.
 *
 * The reviewer decides once how a theological term should read in Icelandic;
 * the review desk then flags any paragraph whose English source uses that
 * term without the agreed rendering. This is the consistency check a human
 * cannot perform across 62 pieces from memory.
 */

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;
    const all = new URL(request.url).searchParams.get('all') === '1';
    return NextResponse.json({ success: true, terms: await listGlossary(!all) });
}

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: Record<string, unknown>;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 }); }

    const termEn = typeof body.term_en === 'string' ? body.term_en.trim() : '';
    const termIs = typeof body.term_is === 'string' ? body.term_is.trim() : '';
    if (!termEn || !termIs) {
        return NextResponse.json({ error: 'Bæði enska og íslenska hugtakið þurfa að fylgja' }, { status: 400 });
    }

    const res = await upsertGlossaryTerm({
        id: typeof body.id === 'string' ? body.id : undefined,
        term_en: termEn,
        term_is: termIs,
        variants_is: Array.isArray(body.variants_is)
            ? body.variants_is.filter((v): v is string => typeof v === 'string')
            : [],
        note: typeof body.note === 'string' ? body.note : null,
        active: body.active !== false,
    });
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id vantar' }, { status: 400 });
    const ok = await deleteGlossaryTerm(id);
    if (!ok) return NextResponse.json({ error: 'Tókst ekki að eyða' }, { status: 500 });
    return NextResponse.json({ success: true });
}
