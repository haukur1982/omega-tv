import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prayAlongWith } from '@/lib/sanctuary-db';

/**
 * POST /api/broadcast-prayers/pray-along
 * Body: { prayerId: string }
 *
 * Anonymous "bið með" tap — increments pray_count on an approved prayer.
 * Rate-limited at the cookie layer: one tap per prayer per browser per
 * hour, which is plenty of warmth without being exploitable.
 */
export async function POST(req: NextRequest) {
    let body: { prayerId?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }

    const prayerId = body.prayerId?.trim();
    if (!prayerId) {
        return NextResponse.json({ error: 'Vantar bænaauðkenni.' }, { status: 400 });
    }

    // Cookie-based rate limit
    const jar = await cookies();
    const cookieName = `omega_bid_${prayerId.slice(0, 8)}`;
    const last = jar.get(cookieName)?.value;
    if (last) {
        const lastMs = parseInt(last, 10);
        if (!isNaN(lastMs) && Date.now() - lastMs < 60 * 60 * 1000) {
            return NextResponse.json(
                { error: 'Þú hefur þegar beðið með þessari bæn nýlega — takk.' },
                { status: 429 },
            );
        }
    }

    const newCount = await prayAlongWith(prayerId);
    if (newCount === null) {
        return NextResponse.json({ error: 'Ekki tókst að skrá bænina.' }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, pray_count: newCount });
    res.cookies.set(cookieName, Date.now().toString(), {
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
        httpOnly: false,
    });
    return res;
}
