import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Wording assistant for the devotional review desk.
 *
 * Three things make this more than a translate button:
 *
 *  1. It returns SEVERAL renderings at different registers, so the reviewer
 *     chooses rather than judges a single option.
 *  2. It accepts a free-form instruction in Icelandic ("þetta er of stíft"),
 *     so the help can be asked for in the reviewer's own words.
 *  3. It reads recent accepted corrections out of devotional_corrections and
 *     shows them to the model as examples of the house voice — so suggestions
 *     drift toward how THIS reviewer writes, not generic Icelandic.
 *
 * Nothing is written to the devotional here. The reviewer decides.
 */

const MODEL = process.env.GEMINI_METADATA_MODEL ?? 'gemini-3.5-flash';
const STYLE_EXAMPLES = 12;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

async function houseVoiceExamples(): Promise<string> {
    try {
        const { data } = await sb
            .from('devotional_corrections')
            .select('before_is, after_is, instruction')
            .order('created_at', { ascending: false })
            .limit(STYLE_EXAMPLES);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = (data ?? []) as any[];
        if (rows.length === 0) return '';
        const lines = rows
            .filter((r) => r.before_is && r.after_is && r.before_is !== r.after_is)
            .map(
                (r, i) =>
                    `${i + 1}. FYRIR: ${String(r.before_is).slice(0, 400)}\n   EFTIR: ${String(r.after_is).slice(0, 400)}${
                        r.instruction ? `\n   (ábending: ${String(r.instruction).slice(0, 120)})` : ''
                    }`,
            );
        if (lines.length === 0) return '';
        return `\n\nSVONA HEFUR YFIRLESARINN LAGFÆRT TEXTA ÁÐUR — lærðu af smekk hans og stíl:\n${lines.join('\n')}`;
    } catch {
        return '';
    }
}

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

    let body: { en?: string; is?: string; instruction?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 });
    }

    const en = (body.en ?? '').trim();
    const is = (body.is ?? '').trim();
    const instruction = (body.instruction ?? '').trim().slice(0, 500);
    if (!en && !is) return NextResponse.json({ error: 'Enginn texti' }, { status: 400 });

    const voice = await houseVoiceExamples();

    const system = `Þú aðstoðar íslenskan prédikara við að fínpússa þýðingu á kristilegri hugleiðingu. Hann les yfir vélþýddan texta og er að leita að réttu orðalagi.

Skilaðu ÞREMUR ólíkum útgáfum af málsgreininni:
- "nakvaemt": næst enska frumtextanum, trútt orðalag, engin skreyting.
- "eðlilegt": eðlilegt talað íslenskt mál, eins og maður myndi segja þetta við annan mann.
- "predikun": hrynjandi prédikunar — hlýtt, myndrænt, ætlað að vera lesið upphátt.

Reglur sem gilda um allar útgáfur:
- Merking frumtextans heldur sér. Ekki bæta við guðfræði sem er ekki í honum.
- Engar enskuslettur. Heiti enskra biblíuþýðinga (Weymouth, King James o.s.frv.) eiga ekki heima í íslenskum texta.
- Ritningarstaðir: íslenskt heiti biblíubókar á undan kafla og versi, t.d. „Galatabréfið 5:25".
- Aldrei stofnanamál, aldrei uppskrúfað sölumál.
- Ef íslenski textinn er þegar góður má skila honum nær óbreyttum og segja það í athugasemdinni.${voice}

Svaraðu ALLTAF með gildu JSON og engu öðru:
{"options":[{"label":"nakvaemt","text":"..."},{"label":"eðlilegt","text":"..."},{"label":"predikun","text":"..."}],"note":"<stutt athugasemd á íslensku um það sem helst mátti laga>"}`;

    const user = [
        `ENSKUR FRUMTEXTI:\n"""${en}"""`,
        `NÚVERANDI ÍSLENSK ÞÝÐING:\n"""${is}"""`,
        instruction ? `ÓSK YFIRLESARANS: ${instruction}` : '',
    ]
        .filter(Boolean)
        .join('\n\n');

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: system }] },
                    contents: [{ role: 'user', parts: [{ text: user }] }],
                    generationConfig: {
                        temperature: instruction ? 0.5 : 0.35,
                        responseMimeType: 'application/json',
                        maxOutputTokens: 6144,
                    },
                }),
            },
        );
        if (!res.ok) return NextResponse.json({ error: `Gemini ${res.status}` }, { status: 502 });

        const data = await res.json();
        const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let parsed: any;
        try {
            parsed = JSON.parse(text);
        } catch {
            const m = text.match(/\{[\s\S]*\}/);
            if (!m) return NextResponse.json({ error: 'Ólæsilegt svar' }, { status: 502 });
            parsed = JSON.parse(m[0]);
        }

        const LABELS: Record<string, string> = {
            nakvaemt: 'Nákvæmt',
            'eðlilegt': 'Eðlilegt',
            predikun: 'Prédikun',
        };
        const options = (Array.isArray(parsed.options) ? parsed.options : [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((o: any) => o && typeof o.text === 'string' && o.text.trim())
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((o: any) => ({
                label: LABELS[String(o.label)] ?? String(o.label ?? 'Tillaga'),
                text: String(o.text).trim(),
            }))
            .slice(0, 3);

        if (options.length === 0) {
            return NextResponse.json({ error: 'Engar tillögur bárust' }, { status: 502 });
        }

        return NextResponse.json({
            success: true,
            options,
            note: String(parsed.note ?? '').trim(),
            learnedFrom: voice ? STYLE_EXAMPLES : 0,
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Villa' },
            { status: 502 },
        );
    }
}
