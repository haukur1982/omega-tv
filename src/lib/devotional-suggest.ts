import { MINED_RULES, type MinedRule } from '@/lib/translation-rules/mined';
import { alignSentences, joinSentences, splitSentences } from '@/lib/devotional-review';

/**
 * The wording assistant: its prompt, and its one call to Gemini.
 *
 * This lives apart from the route because two callers need EXACTLY the same
 * generation. The editor asks for a paragraph on demand; scripts/warm-suggestions.ts
 * asks for the flagged ones ahead of time and stores the answer. If the two
 * drifted apart the cache would be serving something the editor would never
 * have produced, which is worse than no cache at all.
 *
 * Nothing here imports Supabase on purpose — the caller supplies the house
 * voice, so a script can use its own client and the route can use supabaseAdmin.
 *
 * Wording judgement, not bulk metadata: this runs a few dozen times across a
 * collection and the whole point is nuance in Icelandic literary prose, so it
 * uses Pro rather than the Flash model the metadata pipeline shares. Override
 * with GEMINI_SUGGEST_MODEL if Google rotates the name — a retired id returns
 * 404 and the UI surfaces it rather than failing quietly.
 */

export const SUGGEST_MODEL = process.env.GEMINI_SUGGEST_MODEL ?? 'gemini-3.1-pro-preview';

/** How many correction pairs are shown as examples of the house voice. */
export const STYLE_EXAMPLES = 12;
/** Hard caps, so the prompt cannot grow with the library. */
export const GLOSSARY_MAX = 40;
export const RULES_MAX = 12;

/**
 * `sentences` is additive and optional ON PURPOSE: rows cached before the
 * composer shipped carry only `text`, and they must keep rendering. When it is
 * there it is one sentence per sentence of the reviewer's paragraph, same
 * order — which is what lets him take sentence 1 from one register and
 * sentence 3 from another.
 */
export interface SuggestOption { label: string; text: string; sentences?: string[] }
export interface SuggestPayload {
    options: SuggestOption[];
    note: string;
    learnedFrom: number;
    /** Set when generation failed — a recorded miss, so nothing retries it in a loop. */
    failed?: string;
}

export interface VoiceTerm { term_en: string; term_is: string; variants_is?: string[] | null }
export interface VoiceExample { before_is: string; after_is: string; instruction?: string | null }

export interface HouseVoice {
    /** Locked terminology — the hard constraints, ahead of everything else. */
    glossary: VoiceTerm[];
    /** Phrasing the reviewer has already corrected more than once. */
    rules: MinedRule[];
    /** Recent before/after pairs, as examples of taste. */
    examples: VoiceExample[];
}

export const EMPTY_VOICE: HouseVoice = { glossary: [], rules: [], examples: [] };

/** The mined rules as the prompt wants them: most frequent first, capped. */
export function topMinedRules(limit = RULES_MAX): MinedRule[] {
    return [...MINED_RULES].sort((a, b) => b.hits - a.hits).slice(0, limit);
}

const LABELS: Record<string, string> = {
    nakvaemt: 'Nákvæmt',
    'eðlilegt': 'Eðlilegt',
    predikun: 'Prédikun',
};

/**
 * Terminology and mined phrasing go in as RULES, above the examples: an
 * example is taste and can be argued with, a locked term cannot.
 */
function constraintBlock(voice: HouseVoice): string {
    const out: string[] = [];

    const terms = voice.glossary
        .filter((t) => t.term_en?.trim() && t.term_is?.trim())
        .slice(0, GLOSSARY_MAX)
        .map((t) => {
            const variants = (t.variants_is ?? []).filter(Boolean);
            return `- „${t.term_en}“ → „${t.term_is}“${variants.length ? ` (einnig gilt: ${variants.join(', ')})` : ''}`;
        });
    if (terms.length > 0) {
        out.push(
            `\n\nHÚSORÐALISTI — bindandi þýðingar. Þegar frumtextinn notar enska hugtakið SKAL íslenska hliðin standa í þýðingunni:\n${terms.join('\n')}`,
        );
    }

    const rules = voice.rules
        .filter((r) => r.from?.trim() && r.to?.trim())
        .slice(0, RULES_MAX)
        .map((r) => `- ekki „${r.from}“ — heldur „${r.to}“ (${r.hits}×)`);
    if (rules.length > 0) {
        out.push(
            `\n\nORÐALAG SEM YFIRLESARINN HEFUR ÞEGAR LAGFÆRT OFTAR EN EINU SINNI — forðastu vinstri hliðina:\n${rules.join('\n')}`,
        );
    }

    return out.join('');
}

function exampleBlock(examples: VoiceExample[]): string {
    const lines = examples
        .filter((r) => r.before_is && r.after_is && r.before_is !== r.after_is)
        .slice(0, STYLE_EXAMPLES)
        .map(
            (r, i) =>
                `${i + 1}. FYRIR: ${String(r.before_is).slice(0, 400)}\n   EFTIR: ${String(r.after_is).slice(0, 400)}${
                    r.instruction ? `\n   (ábending: ${String(r.instruction).slice(0, 120)})` : ''
                }`,
        );
    if (lines.length === 0) return '';
    return `\n\nSVONA HEFUR YFIRLESARINN LAGFÆRT TEXTA ÁÐUR — lærðu af smekk hans og stíl:\n${lines.join('\n')}`;
}

export function buildSystemPrompt(voice: HouseVoice): string {
    return `Þú aðstoðar íslenskan prédikara við að fínpússa þýðingu á kristilegri hugleiðingu. Hann les yfir vélþýddan texta og er að leita að réttu orðalagi.

Skilaðu ÞREMUR ólíkum útgáfum af málsgreininni:
- "nakvaemt": næst enska frumtextanum, trútt orðalag, engin skreyting.
- "eðlilegt": eðlilegt talað íslenskt mál, eins og maður myndi segja þetta við annan mann.
- "predikun": hrynjandi prédikunar — hlýtt, myndrænt, ætlað að vera lesið upphátt.

Reglur sem gilda um allar útgáfur:
- Merking frumtextans heldur sér. Ekki bæta við guðfræði sem er ekki í honum.
- Engar enskuslettur. Heiti enskra biblíuþýðinga (Weymouth, King James o.s.frv.) eiga ekki heima í íslenskum texta.
- Ritningarstaðir: íslenskt heiti biblíubókar á undan kafla og versi, t.d. „Galatabréfið 5:25".
- Aldrei stofnanamál, aldrei uppskrúfað sölumál.
- Ef íslenski textinn er þegar góður má skila honum nær óbreyttum og segja það í athugasemdinni.${constraintBlock(voice)}${exampleBlock(voice.examples)}

SETNINGASKIPTING — yfirlesarinn velur eina setningu í einu:
- Íslenska málsgreinin fylgir með tölusettum lista yfir setningar hennar.
- Hver útgáfa skal skila "sentences": fylki með NÁKVÆMLEGA jafn mörgum setningum og eru í listanum, í sömu röð.
- Setning númer 3 í svarinu svarar til setningar númer 3 í listanum. Ekki sameina tvær setningar í eina og ekki kljúfa eina setningu í tvær.
- Setning má standa alveg óbreytt ef hún er þegar góð.
- "text" er sama efni og "sentences", sett saman í samfellt mál.

Svaraðu ALLTAF með gildu JSON og engu öðru:
{"options":[{"label":"nakvaemt","text":"...","sentences":["...","..."]},{"label":"eðlilegt","text":"...","sentences":["...","..."]},{"label":"predikun","text":"...","sentences":["...","..."]}],"note":"<stutt athugasemd á íslensku um það sem helst mátti laga>"}`;
}

export function buildUserPrompt(
    en: string,
    is: string,
    instruction: string,
    sentences: string[] = [],
): string {
    const numbered = sentences.length > 0
        ? `SETNINGAR ÍSLENSKU MÁLSGREINARINNAR (${sentences.length} talsins — skilaðu jafn mörgum):\n${
            sentences.map((s, i) => `${i + 1}. ${s}`).join('\n')
        }`
        : '';
    return [
        `ENSKUR FRUMTEXTI:\n"""${en}"""`,
        `NÚVERANDI ÍSLENSK ÞÝÐING:\n"""${is}"""`,
        numbered,
        instruction ? `ÓSK YFIRLESARANS: ${instruction}` : '',
    ]
        .filter(Boolean)
        .join('\n\n');
}

/**
 * One generation. Throws with a short Icelandic message the UI can show —
 * callers decide whether to retry, and the warm script deliberately does not
 * retry more than once.
 */
export async function generateSuggestion(opts: {
    apiKey: string;
    en: string;
    is: string;
    instruction?: string;
    voice?: HouseVoice;
}): Promise<SuggestPayload> {
    const voice = opts.voice ?? EMPTY_VOICE;
    const instruction = (opts.instruction ?? '').trim().slice(0, 500);
    /** The reviewer's own sentences — the rows the composer will offer. */
    const base = splitSentences(opts.is);

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${SUGGEST_MODEL}:generateContent?key=${encodeURIComponent(opts.apiKey)}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: buildSystemPrompt(voice) }] },
                contents: [{
                    role: 'user',
                    parts: [{ text: buildUserPrompt(opts.en, opts.is, instruction, base.sentences) }],
                }],
                generationConfig: {
                    temperature: instruction ? 0.5 : 0.35,
                    responseMimeType: 'application/json',
                    maxOutputTokens: 6144,
                },
            }),
        },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    try {
        parsed = JSON.parse(text);
    } catch {
        const m = text.match(/\{[\s\S]*\}/);
        if (!m) throw new Error('Ólæsilegt svar');
        parsed = JSON.parse(m[0]);
    }

    /**
     * Alignment is checked, never trusted, and never fatal. A model that
     * ignored the sentence contract still gives usable prose: the splitter
     * gets a second try at its `text`, and if THAT does not line up either the
     * option ships without `sentences` and the card offers it whole.
     */
    const options: SuggestOption[] = (Array.isArray(parsed.options) ? parsed.options : [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((o: any) => o && typeof o.text === 'string' && o.text.trim())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((o: any) => {
            const text = String(o.text).trim();
            const lines = alignSentences(
                text,
                base.sentences.length,
                Array.isArray(o.sentences) ? o.sentences.map((s: unknown) => String(s ?? '')) : null,
            );
            return {
                label: LABELS[String(o.label)] ?? String(o.label ?? 'Tillaga'),
                // Joined from the sentences when they aligned, so the whole-option
                // text and the per-sentence rows can never disagree.
                text: lines ? joinSentences(lines, base.separators) : text,
                ...(lines ? { sentences: lines } : {}),
            };
        })
        .slice(0, 3);

    if (options.length === 0) throw new Error('Engar tillögur bárust');

    return {
        options,
        note: String(parsed.note ?? '').trim(),
        learnedFrom: voice.examples.length,
    };
}
