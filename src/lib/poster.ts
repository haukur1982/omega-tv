/**
 * Poster model — Omega VOD Poster Machine V1 (DISPATCH-003).
 *
 * One selected source frame → multiple branded variants → each public
 * surface gets the right aspect ratio. The whole model lives inside the
 * existing `episodes.poster_candidates` JSONB column. No schema change
 * (per the dispatch: "Prefer using the existing poster_candidates field
 * first ... avoid schema changes unless necessary").
 *
 * The column has historically held a bare array (fresh-from-Azotus
 * candidate descriptors). `normalizePosterModel` accepts that legacy
 * array, the full object, or null — so old rows keep working and the
 * clean single-frame fallback is never broken.
 */

export type PosterAspect = 'landscape_16x9' | 'portrait_4x5';

export interface PosterSourceCandidate {
    id: string;
    url: string;
    time_sec: number | null;
    score: number | null;
    notes: string[];
}

export interface PosterSelectedSource {
    id: string;
    url: string;
    time_sec: number | null;
}

export interface PosterVariants {
    landscape_16x9?: string | null;
    portrait_4x5?: string | null;
    /** Forward-compatible — not generated in V1, only consumed if present. */
    square_1x1?: string | null;
    wide_21x9?: string | null;
}

export interface PosterModel {
    source_candidates: PosterSourceCandidate[];
    selected_source: PosterSelectedSource | null;
    variants: PosterVariants;
    brand_version: string | null;
    updated_at: string | null;
}

export const POSTER_BRAND_VERSION = 'omega-v1';

export function emptyPosterModel(): PosterModel {
    return {
        source_candidates: [],
        selected_source: null,
        variants: {},
        brand_version: null,
        updated_at: null,
    };
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
        return Number(value);
    }
    return null;
}

function asNotes(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((n) => (typeof n === 'string' ? n.trim() : ''))
        .filter((n) => n.length > 0)
        .slice(0, 12);
}

/**
 * Normalize one raw candidate. Liberal: accepts a full descriptor object,
 * a `{ url }` object, or a bare URL string. Anything without a usable URL
 * is dropped by the caller.
 */
function normalizeCandidate(raw: unknown, index: number): PosterSourceCandidate | null {
    if (typeof raw === 'string') {
        const url = asString(raw);
        if (!url) return null;
        return { id: `frame-${index + 1}`, url, time_sec: null, score: null, notes: [] };
    }
    if (!raw || typeof raw !== 'object') return null;
    const obj = raw as Record<string, unknown>;
    const url = asString(obj.url) ?? asString(obj.image_url) ?? asString(obj.src);
    if (!url) return null;
    return {
        id: asString(obj.id) ?? `frame-${index + 1}`,
        url,
        time_sec: asNumber(obj.time_sec ?? obj.t ?? obj.timestamp),
        score: asNumber(obj.score),
        notes: asNotes(obj.notes),
    };
}

function normalizeVariants(raw: unknown): PosterVariants {
    if (!raw || typeof raw !== 'object') return {};
    const obj = raw as Record<string, unknown>;
    const out: PosterVariants = {};
    const landscape = asString(obj.landscape_16x9) ?? asString(obj.landscape);
    const portrait = asString(obj.portrait_4x5) ?? asString(obj.portrait);
    const square = asString(obj.square_1x1) ?? asString(obj.square);
    const wide = asString(obj.wide_21x9) ?? asString(obj.wide);
    if (landscape) out.landscape_16x9 = landscape;
    if (portrait) out.portrait_4x5 = portrait;
    if (square) out.square_1x1 = square;
    if (wide) out.wide_21x9 = wide;
    return out;
}

/**
 * Accepts any historical shape and returns the canonical PosterModel.
 *
 * - `null` / `undefined`            → empty model
 * - bare array                      → those are source_candidates only
 * - object with the model keys      → normalized model
 */
export function normalizePosterModel(raw: unknown): PosterModel {
    const model = emptyPosterModel();
    if (raw == null) return model;

    if (Array.isArray(raw)) {
        model.source_candidates = raw
            .map((c, i) => normalizeCandidate(c, i))
            .filter((c): c is PosterSourceCandidate => c !== null);
        return model;
    }

    if (typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        const candidates = Array.isArray(obj.source_candidates)
            ? obj.source_candidates
            : Array.isArray(obj.candidates)
                ? obj.candidates
                : [];
        model.source_candidates = candidates
            .map((c, i) => normalizeCandidate(c, i))
            .filter((c): c is PosterSourceCandidate => c !== null);

        const sel = obj.selected_source;
        if (sel && typeof sel === 'object') {
            const s = sel as Record<string, unknown>;
            const url = asString(s.url);
            if (url) {
                model.selected_source = {
                    id: asString(s.id) ?? 'selected',
                    url,
                    time_sec: asNumber(s.time_sec),
                };
            }
        }

        model.variants = normalizeVariants(obj.variants);
        model.brand_version = asString(obj.brand_version);
        model.updated_at = asString(obj.updated_at);
        return model;
    }

    return model;
}

/** The Bunny thumbnail proxy URL — same convention used across public pages. */
export function bunnyProxyUrl(bunnyVideoId: string | null | undefined): string | null {
    if (!bunnyVideoId) return null;
    return `/api/bunny/thumbnail/${encodeURIComponent(bunnyVideoId)}`;
}

export interface PosterEpisodeLike {
    poster_candidates?: unknown;
    thumbnail_custom?: string | null;
    bunny_video_id?: string | null;
}

/**
 * Resolve the best image URL for a given aspect, with the full V1 fallback
 * chain (DISPATCH-003 §5):
 *
 *   1. branded variant for the requested aspect
 *   2. the other branded variant (better a real frame than a placeholder)
 *   3. thumbnail_custom (legacy / manual / mirrored landscape)
 *   4. Bunny proxy thumbnail
 *   5. null → caller renders the typographic ThumbnailFrame fallback
 *
 * Never throws. Safe in both server and client components.
 */
export function resolvePoster(
    ep: PosterEpisodeLike | null | undefined,
    aspect: PosterAspect = 'landscape_16x9',
): string | null {
    if (!ep) return null;
    const model = normalizePosterModel(ep.poster_candidates);
    const v = model.variants;

    const primary = v[aspect];
    if (primary) return primary;

    const other = aspect === 'portrait_4x5' ? v.landscape_16x9 : v.portrait_4x5;
    if (other) return other;

    const custom = asString(ep.thumbnail_custom);
    if (custom) return custom;

    return bunnyProxyUrl(ep.bunny_video_id);
}
