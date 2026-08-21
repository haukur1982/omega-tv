import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

/**
 * Second-opinion helper for the devotional review desk.
 *
 * Given the English source paragraph and the current Icelandic rendering,
 * returns a suggested Icelandic rendering plus a short note on what it
 * changed. The reviewer accepts or ignores it — nothing is written here.
 *
 * Deliberately narrow: it improves ONE paragraph against ONE source. It is
 * not a bulk re-translator, because the reviewer's judgement is the product.
 */

const MODEL = process.env.GEMINI_METADATA_MODEL ?? 'gemini-3.5-flash';

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

    let body: { en?: string; is?: string; note?: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 }); }

    const en = (body.en ?? '').trim();
    const is = (body.is ?? '').trim();
    if (!en && !is) {
        return NextResponse.json({ error: 'Enginn texti' }, { status: 400 });
    }

    const system = `Þú ert íslenskur prófarkalesari sem yfirfer þýðingu á kristilegri hugleiðingu.

Verkefnið: berðu íslenska textann saman við enska frumtextann og skilaðu betri íslenskri útgáfu.

Reglur:
- Haltu merkingu frumtextans nákvæmlega. Ekki bæta við guðfræði sem er ekki í honum.
- Lagfærðu það sem er rangt: ranga beygingu, óeðlilega orðaröð, enskuslettur, heiti enskra biblíuþýðinga sem eiga ekki heima í íslenskum texta.
- Ritningarstaðir: nafn biblíubókar á íslensku á undan kafla og versi (t.d. „Galatabréfið 5:25"). Ef bókarheiti vantar, bættu því við sé það ljóst af samhenginu.
- Málsniðið er hlýtt, virðulegt og talað mál guðsþjónustu — ekki stofnanamál, ekki uppskrúfað.
- Ef íslenski textinn er þegar góður, skilaðu honum óbreyttum og segðu það.

Svaraðu ALLTAF með gildu JSON og engu öðru:
{"suggestion": "<íslenski textinn>", "note": "<stutt skýring á því sem breyttist, á íslensku>", "changed": true|false}`;

    const user = `ENSKUR FRUMTEXTI:\n"""${en}"""\n\nNÚVERANDI ÍSLENSK ÞÝÐING:\n"""${is}"""${
        body.note ? `\n\nÁBENDING FRÁ YFIRLESARA: ${body.note}` : ''
    }`;

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
                        temperature: 0.3,
                        responseMimeType: 'application/json',
                        maxOutputTokens: 4096,
                    },
                }),
            },
        );
        if (!res.ok) {
            return NextResponse.json({ error: `Gemini ${res.status}` }, { status: 502 });
        }
        const data = await res.json();
        const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        let parsed: { suggestion?: string; note?: string; changed?: boolean };
        try { parsed = JSON.parse(text); }
        catch {
            const m = text.match(/\{[\s\S]*\}/);
            if (!m) return NextResponse.json({ error: 'Ólæsilegt svar' }, { status: 502 });
            parsed = JSON.parse(m[0]);
        }
        return NextResponse.json({
            success: true,
            suggestion: String(parsed.suggestion ?? '').trim(),
            note: String(parsed.note ?? '').trim(),
            changed: parsed.changed !== false,
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Villa' },
            { status: 502 },
        );
    }
}
