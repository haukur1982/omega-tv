/**
 * Client-safe fundraising types + formatting. NO supabase imports here —
 * client components import from THIS module; the server data layer
 * (fundraising-db.ts) re-exports these for convenience.
 */

export interface ProjectItem {
    key: string;
    label: string;
    amount_isk: number;
    note?: string;
}

export interface PublicGift {
    amount_isk: number;
    given_at: string;
    /** Only present when the donor opted into public naming. */
    donor_name: string | null;
}

export interface ProjectUpdate {
    id: string;
    title: string;
    body: string;
    published_at: string;
}

/**
 * Icelandic digit grouping with dots: 9500000 → "9.500.000".
 * Deliberately NOT Intl-based: browser ICU availability for is-IS varies,
 * and a server/client disagreement (dots vs commas) breaks hydration.
 */
export function formatNumberIs(n: number): string {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Icelandic ISK formatting: 9.500.000 kr. */
export function formatIsk(amount: number): string {
    return `${formatNumberIs(amount)} kr.`;
}
