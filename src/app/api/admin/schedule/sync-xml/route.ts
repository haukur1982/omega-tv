import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
    fetchScheduleXmlFromFtp,
    parseScheduleXml,
    computeSlotsForDate,
    xmlFilenameForDate,
} from '@/lib/schedule-xml';
import { buildEnrichmentMap, enrichSlotFromTitle } from '@/lib/programs-db';

/**
 * POST /api/admin/schedule/sync-xml
 * Body: { date?: "YYYY-MM-DD" }  (defaults to today in UTC)
 *
 * Fetches the playout XML from FTP for the given day, parses it,
 * enriches each slot from the `programs` table, and upserts into
 * `schedule_slots`. Manual overrides (is_manual_override=TRUE) are
 * preserved; all previous XML-sourced slots for that day are replaced.
 *
 * Response:
 *   { ok, filename, imported, unlabeled: [...titles], skipped_manual }
 *
 * Setting up a cron (Vercel):
 *   Add an entry to vercel.json with schedule "5 0 * * *" pointing at
 *   this endpoint. Pass a short-lived bearer token via env for CRON
 *   auth (separate from admin-session), or call with a private
 *   service-key header. For now this endpoint is admin-session gated.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

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
    const filename = xmlFilenameForDate(date);

    // 1. Fetch XML
    let xml: string | null;
    try {
        xml = await fetchScheduleXmlFromFtp(date);
    } catch (err) {
        console.error('[sync-xml] FTP fetch failed:', err);
        return NextResponse.json(
            { error: `FTP villa: ${(err as Error).message ?? 'óþekkt'}`, filename },
            { status: 502 },
        );
    }

    if (!xml) {
        return NextResponse.json(
            { error: `Skráin ${filename} fannst ekki á FTP — playout hefur líklega ekki hlaðið upp ennþá.`, filename },
            { status: 404 },
        );
    }

    // 2. Parse + compute slots
    const parsed = parseScheduleXml(xml);
    if (parsed.length === 0) {
        return NextResponse.json(
            { error: 'XML er tómt eða ógilt.', filename },
            { status: 422 },
        );
    }
    const slots = computeSlotsForDate(date, parsed);

    // 3. Load enrichment map from programs table
    const programs = await buildEnrichmentMap();

    // 4. Purge existing XML-sourced slots for this day (keep manual overrides)
    const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const { error: purgeErr } = await sb
        .from('schedule_slots')
        .delete()
        .gte('starts_at', dayStart.toISOString())
        .lt('starts_at', dayEnd.toISOString())
        .eq('is_manual_override', false);
    if (purgeErr) {
        console.error('[sync-xml] purge failed:', purgeErr);
        return NextResponse.json({ error: purgeErr.message }, { status: 500 });
    }

    // Count manual overrides that survived so reporter knows
    const { count: manualCount } = await sb
        .from('schedule_slots')
        .select('*', { count: 'exact', head: true })
        .gte('starts_at', dayStart.toISOString())
        .lt('starts_at', dayEnd.toISOString())
        .eq('is_manual_override', true);

    // 5. Enrich + insert
    const unlabeled = new Set<string>();
    const rows = slots.map((s) => {
        const enrich = enrichSlotFromTitle(s.program_title, programs);
        if (!programs.has(s.program_title.toLocaleLowerCase('is'))) unlabeled.add(s.program_title);
        return {
            starts_at: s.starts_at,
            ends_at: s.ends_at,
            program_title: s.program_title,
            xml_source_id: s.xml_source_id,
            is_manual_override: false,
            program_type: enrich.program_type,
            host_name: enrich.host_name,
            description: enrich.description,
            is_live_broadcast: enrich.is_live_broadcast,
            is_featured: enrich.is_featured,
            series_id: enrich.series_id,
        };
    });

    if (rows.length > 0) {
        const { error: insertErr } = await sb.from('schedule_slots').insert(rows);
        if (insertErr) {
            console.error('[sync-xml] insert failed:', insertErr);
            return NextResponse.json({ error: insertErr.message }, { status: 500 });
        }
    }

    return NextResponse.json({
        ok: true,
        filename,
        date: dayStart.toISOString().slice(0, 10),
        imported: rows.length,
        unlabeled: Array.from(unlabeled),
        skipped_manual: manualCount ?? 0,
    });
}
