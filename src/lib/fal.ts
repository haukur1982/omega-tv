/**
 * fal.ai — AI image re-polish (upscale + face restoration), identity-preserving.
 *
 * Turns a small (~640×360) VOD candidate frame into a crisp, clean still before
 * the Omega brand treatment is applied. We use `fal-ai/codeformer` — a face
 * *restoration* model, NOT a generative face model — so real people (Eiríkur,
 * Snorri) stay exactly themselves. `fidelity` is held high (0.8) to lock
 * identity; this is the guardrail: we never re-imagine a face.
 *
 * Called via fal's synchronous REST endpoint with `fetch` (no SDK — same
 * "try the AI, fall back gracefully" pattern as the Gemini calls in
 * scripts/generate-metadata.ts). If `FAL_KEY` is absent or the call fails,
 * the caller falls back to the raw frame + the existing Sharp grade. AI is an
 * enhancement, never a hard dependency.
 *
 * Cost ≈ $0.002 per image at this size. The pipeline calls this AT MOST ONCE
 * per episode (the chosen frame only) — never per candidate — so there is no
 * path to a runaway bill.
 */

const FAL_BASE = 'https://fal.run';
const CODEFORMER_MODEL = 'fal-ai/codeformer';
const CODEFORMER_COST_USD = 0.002;

export interface RepolishResult {
    /** Enhanced image URL (fal-hosted) when AI ran; null otherwise. */
    url: string | null;
    usedAi: boolean;
    model: string | null;
    width: number | null;
    height: number | null;
    estCostUsd: number;
    /** Why AI was skipped/failed (for logging) — undefined on success. */
    reason?: string;
}

/** True when a FAL_KEY is configured. Callers use this to decide whether to
 *  attempt AI re-polish at all (and whether a Sharp-only result is upgradable). */
export function falConfigured(): boolean {
    return Boolean(process.env.FAL_KEY && process.env.FAL_KEY.trim());
}

interface RepolishOptions {
    /** Identity preservation — higher = more faithful to the original face. */
    fidelity?: number;
    upscaleFactor?: number;
    timeoutMs?: number;
}

/**
 * Re-polish one frame by URL. Never throws — returns a result object whose
 * `usedAi` flag tells the caller whether to use `url` (enhanced) or fall back
 * to the original frame.
 */
export async function repolishFrame(
    imageUrl: string,
    opts: RepolishOptions = {},
): Promise<RepolishResult> {
    const skip = (reason: string): RepolishResult => ({
        url: null,
        usedAi: false,
        model: null,
        width: null,
        height: null,
        estCostUsd: 0,
        reason,
    });

    const key = process.env.FAL_KEY?.trim();
    if (!key) return skip('no_fal_key');
    if (!imageUrl) return skip('no_source_url');

    const fidelity = opts.fidelity ?? 0.8;
    const upscale_factor = opts.upscaleFactor ?? 2;
    const timeoutMs = opts.timeoutMs ?? 120_000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(`${FAL_BASE}/${CODEFORMER_MODEL}`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                Authorization: `Key ${key}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                image_url: imageUrl,
                fidelity,
                upscale_factor,
                face_upscale: true,
            }),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            return skip(`fal_${res.status}: ${text.slice(0, 160)}`);
        }

        const data = (await res.json().catch(() => null)) as {
            image?: { url?: string; width?: number; height?: number };
        } | null;
        const img = data?.image;
        if (!img?.url) return skip('fal_no_image');

        return {
            url: img.url,
            usedAi: true,
            model: CODEFORMER_MODEL,
            width: typeof img.width === 'number' ? img.width : null,
            height: typeof img.height === 'number' ? img.height : null,
            estCostUsd: CODEFORMER_COST_USD,
        };
    } catch (e) {
        const reason =
            e instanceof Error && e.name === 'AbortError'
                ? 'fal_timeout'
                : `fal_error: ${e instanceof Error ? e.message : String(e)}`;
        return skip(reason);
    } finally {
        clearTimeout(timer);
    }
}
