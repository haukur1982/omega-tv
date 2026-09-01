/**
 * Icelandic formatting for the prayer wall. Client-safe: no imports, no env,
 * no database — the server page and the client feed both render these strings,
 * so they must agree exactly.
 *
 * Deliberately NOT Intl-based, same reason as formatNumberIs in
 * fundraising-shared.ts: browser ICU for is-IS varies and a server/client
 * disagreement breaks hydration. Iceland is UTC year round with no DST, so the
 * UTC getters below ARE local time here.
 */

export const ICELANDIC_MONTHS = [
    'janúar',
    'febrúar',
    'mars',
    'apríl',
    'maí',
    'júní',
    'júlí',
    'ágúst',
    'september',
    'október',
    'nóvember',
    'desember',
];

export function formatIcelandicDayMonth(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getUTCDate()}. ${ICELANDIC_MONTHS[date.getUTCMonth()]}`;
}

export function relativeIs(timestamp: number): string {
    const diffMs = Date.now() - timestamp;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 2) return 'rétt í þessu';
    if (mins < 60) return `fyrir ${mins} mín`;
    if (hours < 24) return `fyrir ${hours} klst`;
    if (days === 1) return 'í gær';
    if (days < 7) return `fyrir ${days} dögum`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return 'fyrir 1 viku';
    if (weeks < 4) return `fyrir ${weeks} vikum`;
    return formatIcelandicDayMonth(timestamp);
}

/**
 * How many have held this prayer, as a quiet sentence rather than a score.
 * Icelandic agreement: 1, 21, 101 take the singular verb — 11 does not.
 * Returns null at zero: "0 hafa beðið" would read as a scoreboard with nobody
 * on it, which is the opposite of what the line is for.
 */
export function prayedCountLabel(count: number): string | null {
    if (count <= 0) return null;
    const singular = count % 10 === 1 && count % 100 !== 11;
    return `${groupDigitsIs(count)} ${singular ? 'hefur' : 'hafa'} beðið`;
}

/** Icelandic digit grouping with dots: 1200 → "1.200". Mirrors formatNumberIs. */
export function groupDigitsIs(n: number): string {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
