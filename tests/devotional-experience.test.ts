import { test } from 'node:test';
import assert from 'node:assert/strict';
import { devotionalEmailTemplate, type DevotionalEmailPiece } from '../src/lib/devotional-email-template';
import { escapeEmailHtml, isScriptureParagraph, splitScriptureParagraph } from '../src/lib/devotional-presentation';
import { unsubscribeHandlers } from '../src/lib/unsubscribe-response';
import { devotionalWelcomeTemplate } from '../src/lib/devotional-welcome-template';
import { removeSubscription } from '../src/lib/subscription-unsubscribe';
import type { SupabaseClient } from '@supabase/supabase-js';

const piece: DevotionalEmailPiece = {
    slug: 'dagur-01-morgunn', day: 1, slot: 'morning', title_is: 'Að leita hærra', reviewed: true, status: 'published',
    body_is: ['„Þeir sem vona á Drottin fá nýjan kraft.“ Jesaja 40:31', 'Fullur texti & óbreytt orðalag <script>alert(1)</script>.', 'Síðasta málsgreinin.'],
};
const token = 'preview-test-token-123456';
const url = `https://omega.is/api/subscribers/unsubscribe?token=${token}&list=devotionals`;
const request = (body: string, target = url) => new Request(target, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

test('separate Scripture references preserve all original text and do not mistake prose for a quotation', () => {
    for (const original of ['„Þeir sem vona á Drottin fá nýjan kraft.“ Jesaja 40:31', '„Hann fór út í þann bátinn…“  Lúkasarguðspjall 5:1-3']) {
        const parts = splitScriptureParagraph(original);
        assert.ok(parts);
        assert.equal(parts.quote + parts.separator + parts.reference, original);
        assert.ok(!parts.reference.includes('“'));
    }
    assert.equal(splitScriptureParagraph('„Fjallræðan“ fjallar um hvötina að baki verkinu.'), null);
});

test('email preserves complete reviewed text in order, escapes HTML and includes accessible alternative', () => {
    const email = devotionalEmailTemplate(piece, token);
    let htmlCursor = 0, textCursor = 0;
    for (const paragraph of piece.body_is) {
        const htmlIndex = email.html.indexOf(escapeEmailHtml(paragraph), htmlCursor);
        const textIndex = email.text.indexOf(paragraph, textCursor);
        assert.ok(htmlIndex >= htmlCursor);
        assert.ok(textIndex >= textCursor);
        htmlCursor = htmlIndex+escapeEmailHtml(paragraph).length;
        textCursor = textIndex+paragraph.length;
    }
    assert.ok(!email.html.includes('<script>'));
    assert.ok(email.html.includes('lang="is"'));
    assert.ok(email.html.includes(email.readUrl));
    assert.ok(email.text.includes(email.unsubscribeUrl));
    assert.ok(email.unsubscribeUrl.endsWith('&list=devotionals'));
    assert.ok(email.html.includes('prefers-color-scheme:dark'));
});

test('draft, unreviewed and empty devotional emails are rejected', () => {
    assert.throws(() => devotionalEmailTemplate({ ...piece, status: 'draft' }, token));
    assert.throws(() => devotionalEmailTemplate({ ...piece, reviewed: false }, token));
    assert.throws(() => devotionalEmailTemplate({ ...piece, body_is: [] }, token));
    assert.equal(isScriptureParagraph(piece.body_is[0]), true);
    assert.equal(isScriptureParagraph('„Drag mig“ er bæn okkar.'), false);
});

test('welcome offers a first reading and keeps a useful fallback when no reading is available', () => {
    const email = devotionalWelcomeTemplate(token, piece);
    assert.ok(email.html.includes(`https://omega.is/hugleidingar/${piece.slug}`));
    assert.ok(email.html.includes(escapeEmailHtml(piece.body_is[0])));
    assert.ok(email.text.includes(piece.title_is));
    assert.ok(email.text.includes('látum þig vita þegar þær hefjast'));
    const fallback = devotionalWelcomeTemplate(token);
    assert.ok(fallback.html.includes('https://omega.is/hugleidingar#lesa'));
    assert.ok(!fallback.html.includes('ÞÍN FYRSTA HUGLEIÐING'));
});

test('opening an unsubscribe link never changes a subscription', async () => {
    let writes = 0;
    const h = unsubscribeHandlers(async () => { writes++; });
    const response = await h.GET(new Request(url));
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes('method="post"'));
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
    assert.equal(writes, 0);
});

test('one-click removal targets its topic and returns empty 200 without redirect', async () => {
    const h = unsubscribeHandlers(async (t, list) => {
        assert.equal(t, token); assert.equal(list, 'devotionals');
    });
    const response = await h.POST(request('List-Unsubscribe=One-Click'));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Location'), null);
    assert.equal(await response.text(), '');
});

test('manual confirmation shows a clear receipt; legacy links retain explicit all-list scope', async () => {
    const h = unsubscribeHandlers(async (_token, list) => { assert.equal(list, 'all'); });
    const legacy = `https://omega.is/api/subscribers/unsubscribe?token=${token}`;
    const confirm = await h.GET(new Request(legacy));
    assert.ok((await confirm.text()).includes('Afskrá alla póstlista Omega'));
    const response = await h.POST(request('intent=unsubscribe', legacy));
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes('Afskráning tókst'));
});

test('invalid inputs and missing intent never mutate; provider failures stay retryable', async () => {
    let writes = 0;
    const h = unsubscribeHandlers(async () => { writes++; throw new Error('offline'); });
    assert.equal((await h.POST(request(''))).status, 400);
    assert.equal((await h.POST(request('List-Unsubscribe=One-Click', url.replace('devotionals', 'invalid')))).status, 400);
    assert.equal((await h.GET(new Request('https://omega.is/api/subscribers/unsubscribe'))).status, 400);
    assert.equal(writes, 0);
    const response = await h.POST(request('List-Unsubscribe=One-Click'));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Location'), null);
    assert.equal(await response.text(), '');
});

test('a new topic added during unsubscribe survives the retry', async () => {
    let segments = ['devotionals'];
    let firstRead = true;
    let comparisons = 0;
    const db = {
        from() {
            const filters = new Map<string, string>();
            let replacement: string[] | null | undefined;
            const query = {
                update(value: { segments: string[] }) { replacement = value.segments; return query; },
                delete() { replacement = null; return query; },
                eq(key: string, value: string) { filters.set(key, value); return query; },
                select() {
                    if (replacement === undefined) return query;
                    comparisons++;
                    if (filters.get('segments') !== `{${segments.map(s => JSON.stringify(s)).join(',')}}`) return { data: [], error: null };
                    segments = replacement ?? [];
                    return { data: [{ id: 'row' }], error: null };
                },
                async maybeSingle() {
                    const snapshot = [...segments];
                    if (firstRead) { segments.push('newsletter'); firstRead = false; }
                    return { data: { id: 'row', segments: snapshot }, error: null };
                },
            };
            return query;
        },
    };
    await removeSubscription(db as unknown as SupabaseClient, token, 'devotionals');
    assert.deepEqual(segments, ['newsletter']);
    assert.equal(comparisons, 2);
});
