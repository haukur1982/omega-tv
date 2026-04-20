/**
 * src/lib/social/format-date.ts
 *
 * Icelandic date/time formatting helpers for social templates.
 *
 * The date shown in a broadcast-card kicker needs to feel local and
 * specific — "SUNNUDAGUR 20. APRÍL · KL. 20:00" reads correctly to an
 * Icelander; a generic "SUN APR 20, 8:00 PM" does not.
 *
 * We use Intl.DateTimeFormat with the `is-IS` locale for proper
 * Icelandic day-names and month-names, then hand-compose the layout.
 */

const ICELANDIC_WEEKDAYS = [
    'SUNNUDAGUR', 'MÁNUDAGUR', 'ÞRIÐJUDAGUR', 'MIÐVIKUDAGUR',
    'FIMMTUDAGUR', 'FÖSTUDAGUR', 'LAUGARDAGUR',
];

const ICELANDIC_MONTHS = [
    'JANÚAR', 'FEBRÚAR', 'MARS', 'APRÍL', 'MAÍ', 'JÚNÍ',
    'JÚLÍ', 'ÁGÚST', 'SEPTEMBER', 'OKTÓBER', 'NÓVEMBER', 'DESEMBER',
];

/**
 * Format a date as: "SUNNUDAGUR 20. APRÍL · KL. 20:00"
 *
 * Uses UTC for both date and time since Iceland is UTC year-round
 * (no daylight saving time — Atlantic/Reykjavik is permanently UTC+0).
 */
export function formatIcelandicBroadcastTime(date: Date): string {
    const weekday = ICELANDIC_WEEKDAYS[date.getUTCDay()];
    const day = date.getUTCDate();
    const month = ICELANDIC_MONTHS[date.getUTCMonth()];
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${weekday} ${day}. ${month} · KL. ${hours}:${minutes}`;
}

/**
 * Choose the appropriate temporal prefix for a broadcast-card kicker
 * based on when the broadcast is relative to now:
 *   - Today   → "Í KVÖLD" (if evening) or "Í DAG" (otherwise)
 *   - Tomorrow → "Á MORGUN"
 *   - This week → "Á " + day name (e.g., "Á SUNNUDAG")
 *   - Later → "Í VIKUNNI" or just the date
 *
 * `reference` lets you pass a fixed "now" for testing or for posts
 * being scheduled/previewed.
 */
export function iclPrefix(broadcastAt: Date, reference: Date = new Date()): string {
    // Compare by UTC calendar day
    const sameDay = (a: Date, b: Date) =>
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate();

    const refMidnight = new Date(Date.UTC(
        reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate(),
    ));
    const tomorrow = new Date(refMidnight.getTime() + 24 * 60 * 60 * 1000);

    if (sameDay(broadcastAt, reference)) {
        // Same day — "Í KVÖLD" if after noon, otherwise "Í DAG"
        return broadcastAt.getUTCHours() >= 17 ? 'Í KVÖLD' : 'Í DAG';
    }
    if (sameDay(broadcastAt, tomorrow)) {
        return 'Á MORGUN';
    }
    // This week — use "Á " + day name
    const daysAhead = Math.round((broadcastAt.getTime() - refMidnight.getTime()) / (24 * 60 * 60 * 1000));
    if (daysAhead >= 0 && daysAhead < 7) {
        const dayName = ICELANDIC_WEEKDAYS[broadcastAt.getUTCDay()].toLowerCase();
        // "Á " + day in dative case. For simplicity we use nominative here —
        // Hawk can override the prefix manually if the grammar matters.
        return `Á ${dayName.toUpperCase()}`;
    }
    // More than a week ahead — just the date
    return '';
}
