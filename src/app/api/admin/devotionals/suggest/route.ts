import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    listGlossary, recentCorrections,
    paragraphHash, getCachedSuggestion, putCachedSuggestion,
} from '@/lib/devotional-db';
import {
    generateSuggestion, topMinedRules, STYLE_EXAMPLES,
    type HouseVoice,
} from '@/lib/devotional-suggest';

/**
 * Wording assistant for the devotional review desk.
 *
 * Four things make this more than a translate button:
 *
 *  1. It returns SEVERAL renderings at different registers, so the reviewer
 *     chooses rather than judges a single option.
 *  2. It accepts a free-form instruction in Icelandic ("þetta er of stíft"),
 *     so the help can be asked for in the reviewer's own words.
 *  3. It carries the house voice: locked glossary terms and mined phrasing
 *     rules go in as HARD CONSTRAINTS, and recent corrections follow as
 *     examples of taste. Rules first, because a term is not a matter of taste.
 *  4. It answers instantly when the paragraph was pre-warmed
 *     (scripts/warm-suggestions.ts), and warms the cache when it was not.
 *
 * Nothing is written to the devotional here. The reviewer decides.
 *
 * The cache is keyed on a hash of the exact Icelandic paragraph, so an edited
 * paragraph can never be answered with the old text's suggestions. A request
 * carrying an instruction skips the cache in both directions: that answer was
 * asked for in the reviewer's own words and belongs to this moment only.
 */

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY vantar — tillögur eru óvirkar.' },
            { status: 503 },
        );
    }

    let body: { en?: string; is?: string; instruction?: string; devotionalId?: string; index?: number };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 });
    }

    const en = (body.en ?? '').trim();
    const is = (body.is ?? '').trim();
    const instruction = (body.instruction ?? '').trim().slice(0, 500);
    const devotionalId = typeof body.devotionalId === 'string' ? body.devotionalId : undefined;
    const index = typeof body.index === 'number' && body.index >= 0 ? body.index : undefined;
    if (!en && !is) return NextResponse.json({ error: 'Enginn texti' }, { status: 400 });

    const hash = paragraphHash(is);

    if (!instruction) {
        const cached = await getCachedSuggestion(hash, devotionalId, index);
        if (cached) {
            return NextResponse.json({
                success: true,
                options: cached.options,
                note: cached.note,
                learnedFrom: cached.learnedFrom ?? 0,
                cached: true,
            });
        }
    }

    const [glossary, examples] = await Promise.all([
        listGlossary().catch(() => []),
        recentCorrections(STYLE_EXAMPLES).catch(() => []),
    ]);
    const voice: HouseVoice = { glossary, rules: topMinedRules(), examples };

    try {
        const payload = await generateSuggestion({ apiKey, en, is, instruction, voice });

        // Warm the cache on the way past — a paragraph asked for once is very
        // often asked for again, and this costs nothing extra.
        if (!instruction && devotionalId && index !== undefined) {
            await putCachedSuggestion(devotionalId, index, hash, payload);
        }

        return NextResponse.json({
            success: true,
            options: payload.options,
            note: payload.note,
            learnedFrom: payload.learnedFrom,
            cached: false,
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Villa' },
            { status: 502 },
        );
    }
}
