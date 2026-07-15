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

/** Compact millions for tight spaces: 9500000 → "9,5 m.kr." (Icelandic decimal comma). */
export function formatMkr(amount: number): string {
    if (amount < 1_000_000) return formatIsk(amount);
    const m = Math.round(amount / 100_000) / 10;
    const s = String(m).replace('.', ',').replace(/,0$/, '');
    return `${s} m.kr.`;
}

export interface ItemState extends ProjectItem {
    funded: boolean;
    active: boolean;
}

/**
 * Cumulative milestone boundaries as fractions of goal (0..1), one per item.
 * Drop the last (always ~1.0) to get the internal tick positions on a bar.
 * A plain function so the accumulator isn't a mutation during React render.
 */
export function milestoneBoundaries(items: ProjectItem[], goal: number): number[] {
    const out: number[] = [];
    let acc = 0;
    for (const it of items) {
        acc += it.amount_isk;
        out.push(goal > 0 ? acc / goal : 0);
    }
    return out;
}

/** Cumulative funding: gifts fill the item list top-down. */
export function computeItemStates(items: ProjectItem[], raised: number): ItemState[] {
    let cumulative = 0;
    return items.map((item) => {
        const start = cumulative;
        cumulative += item.amount_isk;
        return { ...item, funded: raised >= cumulative, active: raised < cumulative && raised > start };
    });
}
