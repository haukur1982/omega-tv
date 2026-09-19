/** Explicit live check: creates only reserved .invalid addresses and removes them.
 * node --env-file=.env.local --import tsx scripts/check-devotional-signup.ts
 * Does not send email, publish content, or change the schema.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { subscribeAction } from '../src/actions/subscribe';
import { DEVOTIONAL_CONSENT } from '../src/lib/subscription-input';

async function main() {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const email = `omega-signup-check-${randomUUID()}@example.invalid`;
    const submit = (segment: string, consent = 'true') => {
        const form = new FormData();
        form.set('email', email.toUpperCase());
        form.set('segment', segment);
        form.set('consent', consent);
        return subscribeAction(form);
    };
    try {
        assert.equal((await submit('devotionals', 'false')).success, false);
        const absent = await db.from('subscribers').select('id').eq('email', email);
        assert.ifError(absent.error);
        assert.equal(absent.data?.length, 0);
        assert.equal((await submit('devotionals')).success, true);
        let saved = await db.from('subscribers').select('*').eq('email', email).single();
        assert.ifError(saved.error);
        assert.deepEqual(saved.data.segments, ['devotionals']);
        assert.equal(saved.data.consent_text_version, DEVOTIONAL_CONSENT);
        assert.equal(saved.data.consent_source, 'devotionals');
        assert.ok(saved.data.consent_given_at);
        assert.ok(saved.data.unsubscribe_token);
        const newsletters = await db.from('subscribers').select('id').eq('email', email).overlaps('segments', ['newsletter', 'tv']);
        assert.ifError(newsletters.error);
        assert.equal(newsletters.data?.length, 0);
        assert.equal((await submit('devotionals')).success, true);
        const additions = await Promise.all([submit('newsletter'), submit('tv'), submit('vision')]);
        assert.ok(additions.every(result => result.success));
        saved = await db.from('subscribers').select('*').eq('email', email).single();
        assert.ifError(saved.error);
        assert.deepEqual([...saved.data.segments].sort(), ['devotionals', 'newsletter', 'tv', 'vision']);
        // Simulate an existing newsletter member joining devotionals.
        const reset = await db.from('subscribers').update({ segments: ['newsletter'] }).eq('email', email);
        assert.ifError(reset.error);
        assert.equal((await submit('devotionals')).success, true);
        saved = await db.from('subscribers').select('*').eq('email', email).single();
        assert.ifError(saved.error);
        assert.deepEqual(saved.data.segments, ['newsletter', 'devotionals']);
        assert.equal(saved.data.consent_text_version, DEVOTIONAL_CONSENT);
        console.log('PASS: consent, insert, normalization, duplicate, list isolation, concurrent merging, existing subscriber opt-in. No emails sent.');
    } finally {
        const cleanup = await db.from('subscribers').delete().eq('email', email);
        assert.ifError(cleanup.error);
        const remaining = await db.from('subscribers').select('id').eq('email', email);
        assert.ifError(remaining.error);
        assert.equal(remaining.data?.length, 0);
        console.log('PASS: test subscriber removed.');
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
