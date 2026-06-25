import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAnalytics } from '@/lib/analytics';

/**
 * GET /api/admin/analytics — aggregated VOD + content + engagement analytics
 * for the admin Greining page. Bunny viewership + Supabase counts, server-side.
 */
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    try {
        const data = await getAnalytics();
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Analytics failed' },
            { status: 500 },
        );
    }
}
