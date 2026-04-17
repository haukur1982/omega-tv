import { supabase } from './supabase';

/**
 * ═══════════════════════════════════════════════════════════════════
 * Schedule (Dagskrá) — reads from `schedule_slots` (Phase 3).
 *
 * The old FTP-sourced /api/schedule endpoint is the fallback; these
 * helpers are the new primary path. See plan §4.1 row 4, §4.3, §7.
 * ═══════════════════════════════════════════════════════════════════
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = supabase as any;

export type ProgramType =
    | 'service'
    | 'prayer_night'
    | 'teaching'
    | 'broadcast'
    | 'rerun'
    | 'special'
    | 'filler';

export type ScheduleSlot = {
    id: string;
    starts_at: string;
    ends_at: string;
    program_title: string;
    program_subtitle: string | null;
    program_type: ProgramType;
    episode_id: string | null;
    series_id: string | null;
    host_name: string | null;
    description: string | null;
    is_live_broadcast: boolean;
    is_featured: boolean;
};

/** All slots within a [start, end) UTC range, ordered by starts_at ASC. */
export async function getScheduleInRange(startIso: string, endIso: string): Promise<ScheduleSlot[]> {
    const { data, error } = await untyped
        .from('schedule_slots')
        .select('*')
        .gte('starts_at', startIso)
        .lt('starts_at', endIso)
        .order('starts_at', { ascending: true });
    if (!error && data && data.length > 0) return data as ScheduleSlot[];

    // Dev fallback — mirror the migration seed so the UI is usable before
    // `schedule_slots` is populated. Filtered to the requested range and
    // re-anchored on the current week so it always feels fresh in dev.
    return getMockScheduleInRange(startIso, endIso);
}

/** Slots for a single day (local Iceland day — Iceland uses UTC year-round). */
export async function getScheduleForDay(day: Date): Promise<ScheduleSlot[]> {
    const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return getScheduleInRange(start.toISOString(), end.toISOString());
}

/** Slots for the 7-day window starting Monday of the given date. */
export async function getScheduleForWeek(anchor: Date): Promise<ScheduleSlot[]> {
    // Find Monday of the ISO week containing `anchor` (getUTCDay: Sun=0..Sat=6).
    const dow = anchor.getUTCDay();
    const daysFromMonday = (dow + 6) % 7;
    const monday = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate() - daysFromMonday, 0, 0, 0));
    const sundayEnd = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
    return getScheduleInRange(monday.toISOString(), sundayEnd.toISOString());
}

/**
 * Returns `{ current, next }` for right-now display.
 *   current: the slot whose window contains `now` (or null if off-air)
 *   next: the upcoming slot (for the "Næsta sending" pill in the nav
 *         and the next-up row under the player)
 */
export async function getCurrentAndNext(now: Date = new Date()): Promise<{
    current: ScheduleSlot | null;
    next: ScheduleSlot | null;
}> {
    // Use getScheduleInRange so the dev mock fallback applies here too.
    // 36-hour window is plenty to locate "now" and "next" even at midnight.
    const start = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const slots = await getScheduleInRange(start.toISOString(), end.toISOString());
    const nowMs = now.getTime();
    const current = slots.find(s => {
        const a = new Date(s.starts_at).getTime();
        const b = new Date(s.ends_at).getTime();
        return a <= nowMs && nowMs < b;
    }) ?? null;
    const next = slots.find(s => new Date(s.starts_at).getTime() > nowMs) ?? null;
    return { current, next };
}

/** Group slots by ISO date (YYYY-MM-DD in UTC). Handy for week views. */
export function groupByDay(slots: ScheduleSlot[]): Record<string, ScheduleSlot[]> {
    const out: Record<string, ScheduleSlot[]> = {};
    for (const s of slots) {
        const key = s.starts_at.slice(0, 10);
        (out[key] ??= []).push(s);
    }
    return out;
}

/** Icelandic weekday name ("Mánudagur") for a given date. */
export function weekdayIs(d: Date): string {
    return d.toLocaleDateString('is-IS', { weekday: 'long' });
}

/** Short Icelandic weekday ("Mán") + date ("17."). */
export function shortWeekdayIs(d: Date): { weekday: string; day: string } {
    const full = d.toLocaleDateString('is-IS', { weekday: 'short' });
    const weekday = full.charAt(0).toUpperCase() + full.slice(1, 3);
    return { weekday, day: `${d.getUTCDate()}.` };
}

/** Hour:minute formatter, UTC (= Iceland wall-clock). */
export function formatClockUtc(iso: string): string {
    const d = new Date(iso);
    const h = d.getUTCHours().toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

/** Duration in minutes, rounded. */
export function durationMinutes(slot: ScheduleSlot): number {
    const s = new Date(slot.starts_at).getTime();
    const e = new Date(slot.ends_at).getTime();
    return Math.round((e - s) / 60000);
}

// ═══════════════════════════════════════════════════════════════════
// Dev fallback — re-anchored mock week of programming.
// Used when schedule_slots is empty (pre-migration). Drops out in prod
// the moment even one real row exists.
// ═══════════════════════════════════════════════════════════════════

type MockSlotTemplate = {
    dayOffset: number;      // 0 = Monday
    startHourUtc: number;
    durationMin: number;
    program_title: string;
    program_type: ProgramType;
    host_name: string | null;
    description: string | null;
    is_live_broadcast: boolean;
    is_featured: boolean;
};

const MOCK_WEEK: MockSlotTemplate[] = [
    // Monday
    { dayOffset: 0, startHourUtc: 7,  durationMin: 60, program_title: 'Morgunbæn', program_type: 'prayer_night', host_name: 'Omega', description: 'Opnum daginn í bæn með íslenskri rödd.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 0, startHourUtc: 12, durationMin: 60, program_title: 'Í Snertingu', program_type: 'rerun', host_name: 'Dr. Charles Stanley', description: 'Daglegur boðskapur um náð og sannleika.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 0, startHourUtc: 18, durationMin: 60, program_title: 'Fræðsla', program_type: 'teaching', host_name: 'Omega', description: 'Grunnatriði kristinnar trúar.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 0, startHourUtc: 20, durationMin: 90, program_title: 'Sunnudagssamkoma (endurtekin)', program_type: 'rerun', host_name: 'Eiríkur Sigurbjörnsson', description: 'Samkoman frá síðasta sunnudegi.', is_live_broadcast: false, is_featured: false },
    // Tuesday
    { dayOffset: 1, startHourUtc: 7,  durationMin: 60, program_title: 'Morgunbæn', program_type: 'prayer_night', host_name: 'Omega', description: 'Opnum daginn í bæn.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 1, startHourUtc: 12, durationMin: 60, program_title: 'Í Snertingu', program_type: 'rerun', host_name: 'Dr. Charles Stanley', description: 'Daglegur boðskapur.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 1, startHourUtc: 18, durationMin: 60, program_title: 'Vitnisburðir', program_type: 'teaching', host_name: 'Omega', description: 'Sögur af náð og endurnýjun.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 1, startHourUtc: 20, durationMin: 60, program_title: 'Omega Tímaritið', program_type: 'teaching', host_name: 'Omega', description: 'Vikuleg umfjöllun um trú og samtíma.', is_live_broadcast: false, is_featured: false },
    // Wednesday — Bænakvöld live
    { dayOffset: 2, startHourUtc: 7,  durationMin: 60, program_title: 'Morgunbæn', program_type: 'prayer_night', host_name: 'Omega', description: 'Opnum daginn í bæn.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 2, startHourUtc: 12, durationMin: 60, program_title: 'Í Snertingu', program_type: 'rerun', host_name: 'Dr. Charles Stanley', description: 'Daglegur boðskapur.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 2, startHourUtc: 18, durationMin: 90, program_title: 'Bænakvöld', program_type: 'prayer_night', host_name: 'Eiríkur Sigurbjörnsson', description: 'Vikulegt bænakvöld — bænir fyrir Ísland og fjölskyldur.', is_live_broadcast: true, is_featured: true },
    { dayOffset: 2, startHourUtc: 20, durationMin: 60, program_title: 'Sunnudagssamkoma (endurtekin)', program_type: 'rerun', host_name: 'Eiríkur Sigurbjörnsson', description: 'Samkoman frá síðasta sunnudegi.', is_live_broadcast: false, is_featured: false },
    // Thursday
    { dayOffset: 3, startHourUtc: 7,  durationMin: 60, program_title: 'Morgunbæn', program_type: 'prayer_night', host_name: 'Omega', description: 'Opnum daginn í bæn.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 3, startHourUtc: 12, durationMin: 60, program_title: 'Í Snertingu', program_type: 'rerun', host_name: 'Dr. Charles Stanley', description: 'Daglegur boðskapur.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 3, startHourUtc: 18, durationMin: 60, program_title: 'Fræðsla', program_type: 'teaching', host_name: 'Omega', description: 'Grunnatriði kristinnar trúar.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 3, startHourUtc: 20, durationMin: 60, program_title: 'Ísrael í brennidepli', program_type: 'special', host_name: 'Omega', description: 'Mánaðarleg umfjöllun um fyrirheitna landið.', is_live_broadcast: false, is_featured: false },
    // Friday
    { dayOffset: 4, startHourUtc: 7,  durationMin: 60, program_title: 'Morgunbæn', program_type: 'prayer_night', host_name: 'Omega', description: 'Opnum daginn í bæn.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 4, startHourUtc: 12, durationMin: 60, program_title: 'Í Snertingu', program_type: 'rerun', host_name: 'Dr. Charles Stanley', description: 'Daglegur boðskapur.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 4, startHourUtc: 18, durationMin: 60, program_title: 'Vitnisburðir', program_type: 'teaching', host_name: 'Omega', description: 'Sögur af trú og von.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 4, startHourUtc: 20, durationMin: 90, program_title: 'Bænakvöld (endurtekið)', program_type: 'rerun', host_name: 'Eiríkur Sigurbjörnsson', description: 'Endurtekið bænakvöld frá miðvikudagskvöldi.', is_live_broadcast: false, is_featured: false },
    // Saturday
    { dayOffset: 5, startHourUtc: 9,  durationMin: 60, program_title: 'Fjölskyldustund', program_type: 'teaching', host_name: 'Omega', description: 'Biblíusögur og söngur fyrir börn og foreldra.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 5, startHourUtc: 12, durationMin: 60, program_title: 'Í Snertingu — vikuhlaðvarp', program_type: 'rerun', host_name: 'Dr. Charles Stanley', description: 'Safn vikunnar.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 5, startHourUtc: 19, durationMin: 90, program_title: 'Tónleikakvöld', program_type: 'special', host_name: 'Omega', description: 'Lofgjörð og íslenskir listamenn.', is_live_broadcast: false, is_featured: false },
    // Sunday — live service
    { dayOffset: 6, startHourUtc: 7,  durationMin: 60, program_title: 'Morgunbæn', program_type: 'prayer_night', host_name: 'Omega', description: 'Opnum daginn í bæn.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 6, startHourUtc: 11, durationMin: 90, program_title: 'Sunnudagssamkoma', program_type: 'service', host_name: 'Eiríkur Sigurbjörnsson', description: 'Vikulegi lofgjörðar- og prédikunarþátturinn — í beinni útsendingu.', is_live_broadcast: true, is_featured: true },
    { dayOffset: 6, startHourUtc: 14, durationMin: 60, program_title: 'Í Snertingu', program_type: 'rerun', host_name: 'Dr. Charles Stanley', description: 'Daglegur boðskapur.', is_live_broadcast: false, is_featured: false },
    { dayOffset: 6, startHourUtc: 19, durationMin: 60, program_title: 'Sunnudagssamkoma (endurtekin)', program_type: 'rerun', host_name: 'Eiríkur Sigurbjörnsson', description: 'Samkoman frá morgninum í dag.', is_live_broadcast: false, is_featured: false },
];

function getMockScheduleInRange(startIso: string, endIso: string): ScheduleSlot[] {
    const rangeStart = new Date(startIso).getTime();
    const rangeEnd = new Date(endIso).getTime();

    // Anchor mock week on Monday of the week containing rangeStart.
    const anchor = new Date(rangeStart);
    const dow = anchor.getUTCDay();
    const daysFromMonday = (dow + 6) % 7;
    const monday = new Date(Date.UTC(
        anchor.getUTCFullYear(),
        anchor.getUTCMonth(),
        anchor.getUTCDate() - daysFromMonday,
    ));

    const out: ScheduleSlot[] = [];
    // Render two weeks so cross-week windows (e.g. home's 48h lookahead
    // run past Sunday) still have data.
    for (let w = 0; w < 2; w++) {
        for (const t of MOCK_WEEK) {
            const starts = new Date(Date.UTC(
                monday.getUTCFullYear(),
                monday.getUTCMonth(),
                monday.getUTCDate() + t.dayOffset + w * 7,
                t.startHourUtc, 0, 0,
            ));
            const ends = new Date(starts.getTime() + t.durationMin * 60000);
            if (ends.getTime() <= rangeStart || starts.getTime() >= rangeEnd) continue;
            out.push({
                id: `mock-${w}-${t.dayOffset}-${t.startHourUtc}`,
                starts_at: starts.toISOString(),
                ends_at: ends.toISOString(),
                program_title: t.program_title,
                program_subtitle: null,
                program_type: t.program_type,
                episode_id: null,
                series_id: null,
                host_name: t.host_name,
                description: t.description,
                is_live_broadcast: t.is_live_broadcast,
                is_featured: t.is_featured,
            });
        }
    }
    out.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return out;
}
