import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getRecentEvents } from '@/lib/system-events';

/**
 * GET /api/admin/health
 *
 * Returns the most recent system events (cron runs, sends, imports,
 * Bunny ops). Read by the /admin/health admin page.
 */
export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? '100'), 500);
    const events = await getRecentEvents(limit);
    return NextResponse.json(events);
}
