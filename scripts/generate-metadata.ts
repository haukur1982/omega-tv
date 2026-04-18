/**
 * scripts/generate-metadata.ts
 *
 * Content pipeline — Phase A metadata generator.
 *
 * Given a transcript (and optional context: show name, speaker, filename),
 * produces the structured metadata a draft episode needs to become
 * publishable in 2-3 minutes of human review:
 *
 *   { title, description, editor_note, bible_ref, chapters, tags }
 *
 * Two modes:
 *   1. Gemini (if GEMINI_API_KEY is set) — real LLM generation.
 *   2. Mock (default) — deterministic placeholder output from transcript
 *      heuristics so the pipeline is testable without any API key.
 *
 * This is a LIBRARY (exports generateMetadata) and a CLI
 *   (pnpm tsx scripts/generate-metadata.ts <transcript_file> [bunny_id])
 *
 * The draft row is written to Supabase as status='draft' either way; Hawk
 * reviews at /admin/drafts, fixes anything that's off, hits Publish.
 *
 * See plan §8 Phase A + STATUS.md for where this fits.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { parseOsis } from '../src/lib/passages';

// ══════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════

export interface MetadataInput {
    /** Plain text transcript (or WebVTT raw). The generator will strip VTT timing lines. */
    transcriptText: string;
    /** Optional Bunny GUID — when present, the result is upserted as an episode row. */
    bunnyVideoId?: string;
    /** Hints the generator about voice / series. */
    show?: string;
    speaker?: string;
    /** Filename fallback for title extraction. */
    filename?: string;
    /** 'is' (default) or 'en'. Affects editor_note + description language. */
    language?: 'is' | 'en';
}

export interface GeneratedMetadata {
    title: string;
    description: string;
    editor_note: string;
    /** OSIS canonical — e.g. "MAT.5.3-MAT.5.10". May be null if model is unsure. */
    bible_ref: string | null;
    /** Suggested chapters — typically 4-8. */
    chapters: { t: number; title: string }[];
    /** Thematic tags, lowercase, Icelandic preferred. */
    tags: string[];
    /** Non-fatal notes for reviewer ("unsure about passage", "short transcript"). */
    notes: string[];
}

// ══════════════════════════════════════════════════════════════════════
// Entry point
// ══════════════════════════════════════════════════════════════════════

export async function generateMetadata(input: MetadataInput): Promise<GeneratedMetadata> {
    const transcript = stripVttTiming(input.transcriptText).trim();
    if (!transcript || transcript.length < 40) {
        return emptyMeta(input, ['Transcript er of stutt — Ritstjórn og lýsing birtast sem hvítt svæði.']);
    }

    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
        try {
            return await generateWithGemini(input, transcript);
        } catch (e) {
            console.warn('[generate-metadata] Gemini failed, falling back to mock:', (e as Error).message);
            // Fall through to mock
        }
    }

    return generateMock(input, transcript);
}

// ══════════════════════════════════════════════════════════════════════
// Gemini implementation
// ══════════════════════════════════════════════════════════════════════

async function generateWithGemini(input: MetadataInput, transcript: string): Promise<GeneratedMetadata> {
    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY!;
    const model = process.env.GEMINI_METADATA_MODEL ?? 'gemini-2.0-flash';

    const systemInstructions = `Þú ert ritstjórnarassistent fyrir Omega Stöðina — íslenska kristilega sjónvarpsstöð.
Omega er rótgróin í biblíulegri kenningu og ritstjórnin er rótfest í bæn.
Verkefni þitt er að búa til bjargir fyrir nýja þætti til yfirferðar.

Svaraðu ALLTAF sem gilt JSON, nákvæmlega þessa lögun:
{
  "title": "Stuttur titill á ${input.language === 'en' ? 'English' : 'íslensku'}, 3-9 orð",
  "description": "2-3 efnisgreinar á ${input.language === 'en' ? 'English' : 'íslensku'}, kraftmikil og einlæg, ekki markaðslegt",
  "editor_note": "Ein málsgrein í fyrstu persónu, 40-70 orð, ítölsk, innilegt — eins og Haukur sé að tala beint við áhorfandann",
  "bible_ref": "OSIS kanónískur tilvísunarstrengur eða null ef óviss. Dæmi: MAT.5.3-MAT.5.10, JHN.3.16, PSA.23",
  "chapters": [{"t": 0, "title": "Inngangur"}, ...],  // 4-8 kaflar, t í sekúndum
  "tags": ["heilog-andi", "bæn", "samfelag"],  // 2-5 merki, lágstafir, bandstrikir
  "notes": ["Valfrjálsir textar til ritstjóra — efasemdir, viðvaranir"]
}

Reglur:
- Engir markaðs­frasar. Engin uppskrúfuð orð. Raunveruleg mannleg rödd.
- bible_ref: ef transcript nefnir ritningu beint, notaðu hana. Annars álykta þú varlega. Ef óviss → null.
- tags: lágstafir, bandstrik milli orða, íslenska, þematísk (ekki merkingarlaus "vídeó", "þáttur").`;

    const userPrompt = `Þáttur frá ${input.show ? `þáttaröðinni "${input.show}"` : 'Omega Stöðinni'}${input.speaker ? `, talarinn er ${input.speaker}` : ''}.
${input.filename ? `Upphaflegt skráarheiti: ${input.filename}\n` : ''}
Transcript (hugsanlega niðurskert):
"""
${transcript.slice(0, 16000)}
"""

Svaraðu með JSON hlutnum, ekkert annað.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstructions }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 0.6,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = safeJsonParse(text);

    // Validate + canonicalize
    const bibleRef = typeof parsed.bible_ref === 'string' && parseOsis(parsed.bible_ref)
        ? parsed.bible_ref
        : null;

    return {
        title: clean(parsed.title, 9 * 16),
        description: clean(parsed.description, 1200),
        editor_note: clean(parsed.editor_note, 500),
        bible_ref: bibleRef,
        chapters: Array.isArray(parsed.chapters)
            ? parsed.chapters
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((c: any) => c && typeof c.t === 'number' && typeof c.title === 'string')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((c: any) => ({ t: Math.max(0, Math.floor(c.t)), title: clean(c.title, 120) }))
            : [],
        tags: Array.isArray(parsed.tags)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? parsed.tags.filter((t: any) => typeof t === 'string').map((t: string) => t.trim().toLowerCase()).filter(Boolean).slice(0, 6)
            : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
}

// ══════════════════════════════════════════════════════════════════════
// Mock implementation — deterministic, no API key required
// ══════════════════════════════════════════════════════════════════════

function generateMock(input: MetadataInput, transcript: string): GeneratedMetadata {
    // Simple heuristics: first line becomes the title if short, otherwise a
    // first-40-words excerpt. We explicitly do NOT invent bible_ref in mock
    // mode — leaving it null ensures the reviewer is never misled.
    const firstLine = transcript.split('\n').find(l => l.trim().length > 8)?.trim() ?? '';
    const title = firstLine.length <= 80 ? firstLine : firstLine.slice(0, 60).trim() + '…';
    const preview = transcript.slice(0, 320).trim();

    return {
        title: input.filename ? cleanFilenameTitle(input.filename) : title || 'Nýr þáttur',
        description: preview + (transcript.length > 320 ? '…' : ''),
        editor_note: '',   // Hawk writes this — mock never guesses Haukur's voice
        bible_ref: null,   // Intentionally null — drift is the highest-risk field
        chapters: [],      // Mock can't timestamp without LLM + VTT alignment
        tags: [],
        notes: [
            'Mock-stilling: Gemini lykil vantar. Bættu GEMINI_API_KEY við .env.local til að virkja sjálfvirka útfyllingu.',
            'Ritstjórnar­lína, ritningar­tilvísun og kaflar eru auðir — fylltu út handvirkt þar til LLM er tengt.',
        ],
    };
}

// ══════════════════════════════════════════════════════════════════════
// Writer — upserts draft episode into Supabase
// ══════════════════════════════════════════════════════════════════════

export async function upsertDraftEpisode(
    bunnyVideoId: string,
    meta: GeneratedMetadata,
    extra: { durationSec?: number; language_primary?: 'is' | 'en' } = {},
): Promise<string | null> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createClient(url, key) as any;

    // Is there already a row for this bunny video? Upsert by bunny_video_id.
    const { data: existing } = await sb
        .from('episodes')
        .select('id, status')
        .eq('bunny_video_id', bunnyVideoId)
        .maybeSingle();

    const payload: Record<string, unknown> = {
        bunny_video_id: bunnyVideoId,
        title: meta.title,
        description: meta.description,
        editor_note: meta.editor_note || null,
        bible_ref: meta.bible_ref,
        chapters: meta.chapters.length > 0 ? meta.chapters : null,
        tags: meta.tags,
        duration: extra.durationSec,
        language_primary: extra.language_primary ?? 'is',
        status: 'draft',
    };
    // episode_number is NOT NULL — new rows need a default.
    // Reviewer assigns the real number during editing.
    if (!existing) payload.episode_number = 1;

    if (existing) {
        const { error } = await sb.from('episodes').update(payload).eq('id', existing.id);
        if (error) { console.error('upsert failed:', error); return null; }
        return existing.id as string;
    }

    const { data: inserted, error } = await sb
        .from('episodes')
        .insert(payload)
        .select('id')
        .single();
    if (error) { console.error('insert failed:', error); return null; }
    return inserted.id as string;
}

// ══════════════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════════════

async function main() {
    const [, , transcriptPath, bunnyId] = process.argv;
    if (!transcriptPath) {
        console.error('Usage: pnpm tsx scripts/generate-metadata.ts <transcript.vtt|txt> [bunny_video_id]');
        process.exit(1);
    }

    const transcript = readFileSync(transcriptPath, 'utf8');
    const filename = transcriptPath.split('/').pop();

    console.log(`→ Generating metadata from ${transcriptPath}…`);
    const meta = await generateMetadata({ transcriptText: transcript, filename, bunnyVideoId: bunnyId });

    console.log('\n═══ METADATA ═══');
    console.log(JSON.stringify(meta, null, 2));

    if (bunnyId) {
        console.log(`\n→ Upserting draft episode for bunny_video_id=${bunnyId}…`);
        const id = await upsertDraftEpisode(bunnyId, meta);
        if (id) console.log(`✓ Draft ready at /admin/drafts/${id}`);
        else console.error('✗ Upsert failed');
    } else {
        console.log('\n(No bunny_video_id given — skipped DB write. Pass one to upsert as a draft.)');
    }
}

// Node's ESM "is this the entry module" check — works when invoked as `tsx script.ts`.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('generate-metadata.ts')) {
    main().catch((e) => { console.error(e); process.exit(1); });
}

// ══════════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════════

/**
 * Parse JSON that may contain unescaped control characters.
 *
 * Gemini's structured-output mode occasionally returns JSON with literal
 * newlines / tabs inside string values instead of escaped sequences.
 * That's technically invalid JSON, so we retry after sanitizing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeJsonParse(text: string): any {
    try {
        return JSON.parse(text);
    } catch {
        // Sanitize: escape any raw control chars (likely inside string values)
        const sanitized = text.replace(/[\u0000-\u001F]/g, (c) => {
            if (c === '\n') return '\\n';
            if (c === '\r') return '\\r';
            if (c === '\t') return '\\t';
            return '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0');
        });
        try {
            return JSON.parse(sanitized);
        } catch {
            // Last resort: try to extract the first {...} block via regex
            const match = sanitized.match(/\{[\s\S]*\}/);
            if (match) {
                try { return JSON.parse(match[0]); } catch { /* give up */ }
            }
            throw new Error('Gemini returned unparsable JSON');
        }
    }
}

function stripVttTiming(text: string): string {
    return text
        .split('\n')
        .filter(l => !/^\d\d:\d\d/.test(l) && !/^WEBVTT/.test(l) && !/-->/.test(l))
        .join('\n');
}

function clean(s: unknown, max: number): string {
    if (typeof s !== 'string') return '';
    return s.trim().slice(0, max);
}

function cleanFilenameTitle(filename: string): string {
    return filename
        .replace(/\.[^/.]+$/, '')
        .replace(/_SUBBED$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim()
        .slice(0, 100);
}

function emptyMeta(input: MetadataInput, notes: string[]): GeneratedMetadata {
    return {
        title: input.filename ? cleanFilenameTitle(input.filename) : 'Nýr þáttur',
        description: '',
        editor_note: '',
        bible_ref: null,
        chapters: [],
        tags: [],
        notes,
    };
}
