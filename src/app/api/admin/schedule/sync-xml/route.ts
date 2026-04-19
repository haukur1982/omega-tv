import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { syncScheduleXmlForDate } from '@/lib/schedule-xml-sync';

/**
 * POST /api/admin/schedule/sync-xml
 * Body: { date?: "YYYY-MM-DD" }  (defaults to today in UTC)
 *
 * Admin-session gated. Delegates to the shared sync core in
 * `src/lib/schedule-xml-sync.ts`. The hands-free daily counterpart
 * lives at GET /api/cron/sync-schedule-xml (Vercel Cron).
 *
 * Response (success):
 *   { ok: true, filename, date, imported, unlabeled: [...titles], skipped_manual }
 *
 * Response (failure):
 *   { ok: false, filename, error } with appropriate HTTP status
 */

export async function POST(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: { date?: string } = {};
    try {
        body = await req.json();
    } catch {
        /* body optional */
    }

    const date = body.date ? new Date(body.date + 'T00:00:00Z') : new Date();
    const result = await syncScheduleXmlForDate(date);

    if (!result.ok) {
        return NextResponse.json(
            { ok: false, filename: result.filename, error: result.message },
            { status: result.status },
        );
    }

    return NextResponse.json(result);
}
