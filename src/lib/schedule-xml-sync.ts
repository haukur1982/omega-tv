/**
 * src/lib/schedule-xml-sync.ts
 *
 * Shared sync core used by both:
 *   - POST /api/admin/schedule/sync-xml  (admin-session, user-triggered)
 *   - GET  /api/cron/sync-schedule-xml   (Vercel Cron, daily hands-free)
 *
 * Given a date, this:
 *   1. Fetches the playout XML for that day from FTP
 *   2. Parses + derives end times
 *   3. Looks up enrichment from the `programs` catalog
 *   4. Purges only non-manual schedule_slots for that day
 *   5. Inserts the enriched rows
 *
 * Return shape is stable across callers so the cron logs and the admin
 * UI can both key off the same fields.
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
    fetchScheduleXmlFromFtp,
    parseScheduleXml,
    computeSlotsForDate,
    xmlFilenameForDate,
} from '@/lib/schedule-xml';
import { buildEnrichmentMap, enrichSlotFromTitle } from '@/lib/programs-db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

export type SyncOutcome =
    | {
          ok: true;
          filename: string;
          date: string;             // YYYY-MM-DD UTC
          imported: number;
          unlabeled: string[];
          skipped_manual: number;
      }
    | {
          ok: false;
          filename: string;
          reason: 'ftp_error' | 'not_found' | 'empty' | 'db_error';
          message: string;
          status: number;           // HTTP-style status for the caller
      };

/**
 * Run the full sync for a single day.
 *
 * Never throws — failures come back as `{ ok: false, reason, status }`
 * so both the admin route and the cron route can just forward them.
 */
export async function syncScheduleXmlForDate(date: Date): Promise<SyncOutcome> {
    const filename = xmlFilenameForDate(date);

    // 1. Fetch XML
    let xml: string | null;
    try {
        xml = await fetchScheduleXmlFromFtp(date);
    } catch (err) {
        console.error('[sync-xml] FTP fetch failed:', err);
        return {
            ok: false,
            filename,
            reason: 'ftp_error',
            message: (err as Error).message ?? 'óþekkt',
            status: 502,
        };
    }

    if (!xml) {
        return {
            ok: false,
            filename,
            reason: 'not_found',
            message: `Skráin ${filename} fannst ekki á FTP — playout hefur líklega ekki hlaðið upp ennþá.`,
            status: 404,
        };
    }

    // 2. Parse + compute slots
    const parsed = parseScheduleXml(xml);
    if (parsed.length === 0) {
        return {
            ok: false,
            filename,
            reason: 'empty',
            message: 'XML er tómt eða ógilt.',
            status: 422,
        };
    }
    const slots = computeSlotsForDate(date, parsed);

    // 3. Load enrichment map from programs table
    const programs = await buildEnrichmentMap();

    // 4. Purge existing XML-sourced slots for this day (keep manual overrides)
    const dayStart = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0),
    );
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const { error: purgeErr } = await sb
        .from('schedule_slots')
        .delete()
        .gte('starts_at', dayStart.toISOString())
        .lt('starts_at', dayEnd.toISOString())
        .eq('is_manual_override', false);
    if (purgeErr) {
        console.error('[sync-xml] purge failed:', purgeErr);
        return {
            ok: false,
            filename,
            reason: 'db_error',
            message: purgeErr.message,
            status: 500,
        };
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
            return {
                ok: false,
                filename,
                reason: 'db_error',
                message: insertErr.message,
                status: 500,
            };
        }
    }

    return {
        ok: true,
        filename,
        date: dayStart.toISOString().slice(0, 10),
        imported: rows.length,
        unlabeled: Array.from(unlabeled),
        skipped_manual: manualCount ?? 0,
    };
}
