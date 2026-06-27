import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    getUpcomingFeaturedPrayers,
    createFeaturedPrayer,
    deleteFeaturedPrayer,
} from '@/lib/featured-prayer-db';

/**
 * Admin CRUD for "Bæn dagsins" (featured_prayers). Auth-gated like every other
 * admin route (verifyAdminSession). Powers /admin/baen-dagsins.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;
    const prayers = await getUpcomingFeaturedPrayers();
    return NextResponse.json({ prayers });
}

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: { featureDate?: string; body?: string; scripture?: string; author?: string };
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ógild beiðni.' }, { status: 400 }); }

    const result = await createFeaturedPrayer({
        featureDate: body.featureDate ?? '',
        body: body.body ?? '',
        scripture: body.scripture,
        author: body.author,
    });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Vantar auðkenni.' }, { status: 400 });

    const ok = await deleteFeaturedPrayer(id);
    return NextResponse.json({ success: ok });
}
