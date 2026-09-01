import { supabaseAdmin } from '@/lib/supabase';
import { EMPTY_MINISTRY_SETTINGS, type MinistrySettings } from '@/lib/ministry-shared';

/**
 * The prayer ministry settings — the phone number spoken on air, the hours it
 * is answered, the schedule note, and the live-now override.
 *
 * SERVER-ONLY (imports supabaseAdmin). The table is RLS-locked with no
 * policies, so reads happen here and only the four sanitized values ever reach
 * a page. Client components import the type from ministry-shared.ts.
 *
 * `missing` is the same contract as admin-staff.ts: it means "the migration
 * has not been applied", which is a different thing from "the station has not
 * filled the number in yet". The public wall hides the panel for both; the
 * admin card only shows the run-SQL guidance for the first.
 */

export type { MinistrySettings };
export { EMPTY_MINISTRY_SETTINGS };

export const MINISTRY_SETTINGS_TABLE = 'ministry_settings';
const SETTINGS_ID = 'default';

// Generated Supabase types predate this table — same single cast at the data
// layer as fundraising-db.ts / featured-prayer-db.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = () => supabaseAdmin as any;

/** True when the failure is "there is no ministry_settings table" (see admin-staff.ts). */
export function isMissingMinistryTable(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const e = error as { code?: string; message?: string };
    if (e.code === 'PGRST205' || e.code === '42P01') return true;
    return /schema cache|does not exist/i.test(e.message ?? '');
}

export interface MinistrySettingsResult {
    settings: MinistrySettings;
    /** The table is not there yet — run the migration. */
    missing: boolean;
}

function mapSettings(row: Record<string, unknown> | null): MinistrySettings {
    if (!row) return { ...EMPTY_MINISTRY_SETTINGS };
    return {
        prayerPhone: typeof row.prayer_phone === 'string' ? row.prayer_phone : '',
        phoneHours: typeof row.phone_hours === 'string' ? row.phone_hours : '',
        scheduleNote: typeof row.schedule_note === 'string' ? row.schedule_note : '',
        liveNow: row.live_now === true,
    };
}

export async function getMinistrySettings(): Promise<MinistrySettingsResult> {
    const { data, error } = await sb()
        .from(MINISTRY_SETTINGS_TABLE)
        .select('prayer_phone, phone_hours, schedule_note, live_now')
        .eq('id', SETTINGS_ID)
        .maybeSingle();

    if (error) {
        if (!isMissingMinistryTable(error)) {
            console.error('Failed to read ministry settings:', error);
        }
        return { settings: { ...EMPTY_MINISTRY_SETTINGS }, missing: isMissingMinistryTable(error) };
    }
    return { settings: mapSettings(data), missing: false };
}

export async function saveMinistrySettings(
    next: MinistrySettings,
): Promise<{ ok: boolean; missing: boolean; error?: string }> {
    const { error } = await sb()
        .from(MINISTRY_SETTINGS_TABLE)
        .upsert({
            id: SETTINGS_ID,
            prayer_phone: next.prayerPhone.trim() || null,
            phone_hours: next.phoneHours.trim() || null,
            schedule_note: next.scheduleNote.trim() || null,
            live_now: next.liveNow,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        if (isMissingMinistryTable(error)) return { ok: false, missing: true };
        console.error('Failed to save ministry settings:', error);
        return { ok: false, missing: false, error: error.message };
    }
    return { ok: true, missing: false };
}
