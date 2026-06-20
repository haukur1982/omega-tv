/**
 * Best-frame selection for the key-art pipeline.
 *
 * Azotus extracts 2–16 candidate frames per video (each with a quality `score`
 * and `notes` like ["yavg=97"] = mean luminance). The hard part is picking a
 * frame that works as TV key art — specifically AVOIDING scripture/text slides
 * (which is exactly why the Snorri card looked like a screenshot of paperwork).
 *
 * Strategy (hybrid):
 *   1. A human/prior selection always wins (model.selected_source).
 *   2. Heuristic pre-filter: drop very dark frames (yavg < 45), rank by score.
 *   3. Gemini vision tie-break over the top survivors — picks the sharp,
 *      face-present, non-slide frame. Reuses the Gemini fetch+JSON+fallback
 *      pattern from scripts/generate-metadata.ts. Near-zero cost.
 *   4. If Gemini is unavailable or errors → fall back to the heuristic winner.
 *
 * Never throws.
 */

import type { PosterModel, PosterSourceCandidate } from './poster';

export interface SelectedFrame {
    id: string;
    url: string;
    time_sec: number | null;
    method: 'human' | 'gemini' | 'heuristic';
}

const DARK_YAVG_THRESHOLD = 45;
const VISION_POOL = 6;

function parseYavg(notes: string[]): number | null {
    for (const n of notes) {
        const m = n.match(/yavg\s*[=:]\s*(\d+(?:\.\d+)?)/i);
        if (m) return Number(m[1]);
    }
    return null;
}

/** Reject very dark frames (unless they're all dark), then rank by Azotus score. */
function heuristicRank(candidates: PosterSourceCandidate[]): PosterSourceCandidate[] {
    const notDark = candidates.filter((c) => {
        const y = parseYavg(c.notes);
        return y == null || y >= DARK_YAVG_THRESHOLD;
    });
    const pool = notDark.length > 0 ? notDark : candidates;
    return [...pool].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/**
 * Ask Gemini to pick the best frame for key art among a small shortlist.
 * Returns the chosen candidate's id, or null on any failure.
 */
async function geminiPick(shortlist: PosterSourceCandidate[]): Promise<string | null> {
    const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!key) return null;

    // Fetch each shortlist frame as inline base64 (they're small ~640px JPEGs).
    const imageParts: { inline_data: { mime_type: string; data: string } }[] = [];
    const order: PosterSourceCandidate[] = [];
    for (const c of shortlist) {
        try {
            const r = await fetch(c.url, { cache: 'no-store' });
            if (!r.ok) continue;
            const buf = Buffer.from(await r.arrayBuffer());
            const mime = r.headers.get('content-type') || 'image/jpeg';
            imageParts.push({ inline_data: { mime_type: mime, data: buf.toString('base64') } });
            order.push(c);
        } catch {
            /* skip unreachable frame */
        }
    }
    if (order.length === 0) return null;
    if (order.length === 1) return order[0].id;

    const prompt =
        `You are choosing the single best still frame to use as TV key art for a ` +
        `Christian talk/teaching show. I will show you ${order.length} candidate frames ` +
        `in order (index 0 to ${order.length - 1}). Pick the ONE that works best as a ` +
        `poster image: a sharp, well-lit frame showing a person's face, eyes open, ` +
        `looking engaged. STRONGLY AVOID: frames that are mostly a scripture/text slide ` +
        `or on-screen text, blurry or motion-blurred frames, mid-blink or awkward mouth, ` +
        `very dark frames, and empty/transition frames. Respond with STRICT JSON only: ` +
        `{"pick": <index>, "reason": "<short>"}.`;

    const model = process.env.GEMINI_METADATA_MODEL ?? 'gemini-3.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    try {
        const res = await fetch(url, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }, ...imageParts] }],
                generationConfig: { responseMimeType: 'application/json', temperature: 0 },
            }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
        const parsed = JSON.parse(text) as { pick?: number };
        const idx = parsed.pick;
        if (typeof idx === 'number' && idx >= 0 && idx < order.length) {
            return order[idx].id;
        }
        return null;
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Choose the best source frame for an episode's key art.
 * Returns null only when there are no candidate frames at all (caller then
 * falls back to the Bunny auto-frame via bunnyVideoId).
 */
export async function selectBestCandidate(model: PosterModel): Promise<SelectedFrame | null> {
    // 1. Respect a human/prior selection (also how upgrades reuse the same frame).
    if (model.selected_source?.url) {
        return {
            id: model.selected_source.id,
            url: model.selected_source.url,
            time_sec: model.selected_source.time_sec,
            method: 'human',
        };
    }

    const candidates = model.source_candidates ?? [];
    if (candidates.length === 0) return null;

    const ranked = heuristicRank(candidates);
    if (ranked.length === 1) {
        const c = ranked[0];
        return { id: c.id, url: c.url, time_sec: c.time_sec, method: 'heuristic' };
    }

    // 2. Gemini vision tie-break over the top survivors.
    const shortlist = ranked.slice(0, VISION_POOL);
    const pickedId = await geminiPick(shortlist);
    if (pickedId) {
        const c = candidates.find((x) => x.id === pickedId);
        if (c) return { id: c.id, url: c.url, time_sec: c.time_sec, method: 'gemini' };
    }

    // 3. Heuristic winner.
    const c = ranked[0];
    return { id: c.id, url: c.url, time_sec: c.time_sec, method: 'heuristic' };
}
