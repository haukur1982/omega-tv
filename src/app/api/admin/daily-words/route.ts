import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    getUpcomingDailyWords,
    createDailyWord,
    deleteDailyWord,
} from '@/lib/daily-word-db';

/**
 * Admin CRUD for "Orð dagsins" (daily_words). Auth-gated like every admin route.
 * Powers /admin/ord-dagsins.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;
    const words = await getUpcomingDailyWords();
    return NextResponse.json({ words });
}

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: { featureDate?: string; reference?: string; verse?: string; reflection?: string; source?: string };
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ógild beiðni.' }, { status: 400 }); }

    const result = await createDailyWord({
        featureDate: body.featureDate ?? '',
        reference: body.reference ?? '',
        verse: body.verse,
        reflection: body.reflection ?? '',
        source: body.source,
    });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Vantar auðkenni.' }, { status: 400 });

    const ok = await deleteDailyWord(id);
    return NextResponse.json({ success: ok });
}
