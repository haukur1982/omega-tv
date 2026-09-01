/**
 * Client-safe types + formatting for the prayer ministry settings.
 * NO supabase imports here — client components import from THIS module; the
 * server data layer (ministry-settings.ts) re-exports the type for convenience.
 *
 * Same split as fundraising-shared.ts / fundraising-db.ts.
 */

/** Named in every "keyrðu SQL-ið fyrst" panel, so the path is written once. */
export const PRAYER_MINISTRY_MIGRATION = 'supabase/migrations/20260901_prayer_ministry.sql';

export interface MinistrySettings {
    /** The number spoken on air and shown on the wall. Empty = the panel is hidden. */
    prayerPhone: string;
    /** Free text, e.g. "mán–fim kl. 20–22". */
    phoneHours: string;
    /** Free text about the prayer programs, e.g. "Bænastund alla fimmtudaga kl. 20." */
    scheduleNote: string;
    /** Manual override: a prayer program is on the air right now. */
    liveNow: boolean;
}

export const EMPTY_MINISTRY_SETTINGS: MinistrySettings = {
    prayerPhone: '',
    phoneHours: '',
    scheduleNote: '',
    liveNow: false,
};

/**
 * A tel: href from a typed Icelandic number. Strips everything a person might
 * type for readability (spaces, dashes) but keeps a leading +.
 */
export function telHref(phone: string): string {
    const trimmed = phone.trim();
    const plus = trimmed.startsWith('+') ? '+' : '';
    return `tel:${plus}${trimmed.replace(/[^0-9]/g, '')}`;
}

/**
 * Icelandic 7-digit numbers read as 555 1234. Anything else (a +354 prefix,
 * a shortcode) is left exactly as the station typed it.
 * Deliberately NOT Intl-based — see formatNumberIs in fundraising-shared.ts.
 */
export function formatPhoneIs(phone: string): string {
    const digits = phone.replace(/[^0-9]/g, '');
    if (phone.trim().startsWith('+') || digits.length !== 7) return phone.trim();
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}
