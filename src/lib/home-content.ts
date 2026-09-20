import type { Devotional } from './devotional-db';

/** The monthly cycle prefers today's morning reading, then the nearest published day. */
export function selectHomeDevotional(pieces: Devotional[], now = new Date()): Devotional | null {
    const day = now.getUTCDate(); // Iceland uses UTC year round.
    return pieces
        .filter(piece => piece.status === 'published' && piece.reviewed && piece.body_is.some(p => p.trim()))
        .sort((a, b) => {
            const distance = (day - a.day + 31) % 31 - (day - b.day + 31) % 31;
            return distance || Number(a.slot === 'evening') - Number(b.slot === 'evening');
        })[0] ?? null;
}

export function featuredPrayerLabel(featureDate?: string, now = new Date()): string {
    return featureDate === now.toISOString().slice(0, 10) ? 'Bæn dagsins' : 'Sameinumst í bæn';
}
