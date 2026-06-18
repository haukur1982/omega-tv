import { NextResponse, type NextRequest } from 'next/server';
import { syncScheduleXmlForDate } from '@/lib/schedule-xml-sync';
import { logEvent } from '@/lib/system-events';

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

    // Dates to sync: a single ?date=YYYY-MM-DD (manual/testing), or a rolling
    // window of today + the next 7 days. The window keeps schedule_slots
    // populated ahead so the /live timeline never empties when the day rolls
    // over or one cron run is missed — the FTP holds several days in advance.
    const dates: Date[] = [];
    if (dateParam) {
        dates.push(new Date(dateParam + 'T00:00:00Z'));
    } else {
        const base = new Date();
        for (let i = 0; i < 8; i++) dates.push(new Date(base.getTime() + i * 86_400_000));
    }

    let daysImported = 0;
    let totalSlots = 0;
    const notFound: string[] = [];
    const failed: { filename: string; reason: string; message: string; status: number }[] = [];

    for (const d of dates) {
        const r = await syncScheduleXmlForDate(d);
        if (r.ok) {
            daysImported += 1;
            totalSlots += r.imported;
        } else if (r.reason === 'not_found') {
            notFound.push(r.filename);
        } else {
            failed.push({ filename: r.filename, reason: r.reason, message: r.message, status: r.status });
        }
    }

    const summary =
        `Synced ${daysImported}/${dates.length} day(s), ${totalSlots} slots` +
        (notFound.length ? ` · not on FTP yet: ${notFound.join(', ')}` : '') +
        (failed.length ? ` · failed: ${failed.map((f) => f.filename).join(', ')}` : '');
    console.log(`[cron sync-xml] ${summary}`);
    await logEvent(
        'cron.schedule_xml',
        failed.length ? 'error' : 'info',
        summary,
        { daysImported, totalSlots, notFound, failed },
        'vercel-cron',
    );

    // Hard error only when nothing imported AND a real (non-404) failure occurred.
    if (daysImported === 0 && failed.length > 0) {
        return NextResponse.json({ ok: false, summary, notFound, failed }, { status: failed[0].status });
    }

    return NextResponse.json({ ok: true, summary, daysImported, totalSlots, notFound });
}
