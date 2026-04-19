import { NextResponse, type NextRequest } from 'next/server';
import { syncScheduleXmlForDate } from '@/lib/schedule-xml-sync';

/**
 * GET /api/cron/sync-schedule-xml
 *
 * Hands-free daily sync invoked by Vercel Cron. See `vercel.json` for
 * the schedule. Auth is a bearer token match against `CRON_SECRET` env
 * var — Vercel automatically sends `Authorization: Bearer ${CRON_SECRET}`
 * when the cron fires, and manual curl calls with the same header work
 * for testing.
 *
 *   # Manual test (replace with real secret):
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *        https://omega.is/api/cron/sync-schedule-xml
 *
 * Optional query param: ?date=YYYY-MM-DD to force a specific day.
 * Defaults to today (UTC = Iceland).
 *
 * Always returns 200 on 404-from-FTP ("file not there yet") so the
 * cron log stays clean — a missing file is expected on weekends or
 * when the playout system is late. Only true errors return 5xx.
 */

// Prevent any incidental caching — this endpoint must always run fresh.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        // Misconfigured deployment — refuse loudly so the error is visible.
        return NextResponse.json(
            { ok: false, error: 'CRON_SECRET not configured' },
            { status: 500 },
        );
    }

    const authHeader = req.headers.get('authorization') ?? '';
    const expected = `Bearer ${secret}`;
    if (authHeader !== expected) {
        return NextResponse.json(
            { ok: false, error: 'Unauthorized' },
            { status: 401 },
        );
    }

    const dateParam = req.nextUrl.searchParams.get('date');
    const date = dateParam ? new Date(dateParam + 'T00:00:00Z') : new Date();

    const result = await syncScheduleXmlForDate(date);

    if (result.ok) {
        console.log(
            `[cron sync-xml] ${result.date} — imported ${result.imported} slots from ${result.filename}` +
                (result.unlabeled.length > 0
                    ? ` · ${result.unlabeled.length} unlabeled: ${result.unlabeled.join(', ')}`
                    : '') +
                (result.skipped_manual > 0 ? ` · kept ${result.skipped_manual} manual overrides` : ''),
        );
        return NextResponse.json(result);
    }

    // Soft-succeed on "file not on FTP yet" — return 200 with reason so
    // the cron log shows what happened without alerting as a failure.
    if (result.reason === 'not_found') {
        console.log(`[cron sync-xml] ${result.filename} not on FTP yet — will retry tomorrow.`);
        return NextResponse.json({
            ok: false,
            filename: result.filename,
            reason: result.reason,
            message: result.message,
        });
    }

    // True errors propagate as 5xx so Vercel surfaces them in cron logs.
    console.error(`[cron sync-xml] ${result.reason}: ${result.message}`);
    return NextResponse.json(
        {
            ok: false,
            filename: result.filename,
            reason: result.reason,
            error: result.message,
        },
        { status: result.status },
    );
}
