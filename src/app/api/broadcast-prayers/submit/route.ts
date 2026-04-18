import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { submitBroadcastPrayer, getSanctuaryAnchor } from '@/lib/sanctuary-db';

/**
 * POST /api/broadcast-prayers/submit
 *
 * Body: { content: string, name?: string, slotId?: string }
 *
 * Submits a prayer into the moderation queue, pinned to the current or
 * upcoming live-broadcast slot. Admin approves through existing prayer
 * moderation UI; approved prayers surface in the /beint drawer on next
 * page render.
 *
 * Light rate limit: one submission per browser per 5 minutes.
 */
export async function POST(req: NextRequest) {
    let body: { content?: string; name?: string; slotId?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }

    const content = (body.content ?? '').trim();
    if (content.length < 3) {
        return NextResponse.json({ error: 'Bænin er of stutt.' }, { status: 400 });
    }
    if (content.length > 600) {
        return NextResponse.json({ error: 'Bænin er of löng (hámark 600 stafir).' }, { status: 400 });
    }

    let slotId = body.slotId;
    if (!slotId) {
        const anchor = await getSanctuaryAnchor();
        if (!anchor.slot) {
            return NextResponse.json(
                { error: 'Engin útsending í gangi.' },
                { status: 409 },
            );
        }
        slotId = anchor.slot.id;
    }

    // 5-min rate limit per browser
    const jar = await cookies();
    const last = jar.get('omega_prayer_submit')?.value;
    if (last) {
        const lastMs = parseInt(last, 10);
        if (!isNaN(lastMs) && Date.now() - lastMs < 300_000) {
            return NextResponse.json(
                { error: 'Þú sendir bæn fyrir stundu síðan — takk. Við biðjum saman.' },
                { status: 429 },
            );
        }
    }

    const ok = await submitBroadcastPrayer(slotId, { content, name: body.name });
    if (!ok) {
        return NextResponse.json({ error: 'Ekki tókst að senda. Reyndu aftur.' }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('omega_prayer_submit', Date.now().toString(), {
        path: '/',
        maxAge: 900,
        sameSite: 'lax',
        httpOnly: false,
    });
    return res;
}
