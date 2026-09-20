import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { removeSubscription } from '../src/lib/subscription-unsubscribe';

// Only disposable, unverified .invalid recipients. Never sends email.
async function main() {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const token = randomUUID();
    const email = `codex-unsubscribe-${token}@example.invalid`;
    const base = process.env.TEST_BASE_URL || 'http://localhost:3010';
    const row = await db.from('subscribers').insert({ email, segments: ['newsletter', 'devotionals'], is_verified: false, verified_at: null, unsubscribe_token: token }).select('id').single();
    if (row.error) throw new Error(row.error.message);
    const id = row.data.id;
    const url = `${base}/api/subscribers/unsubscribe?token=${token}&list=devotionals`;
    async function read() {
        const result = await db.from('subscribers').select('segments').eq('id', id).maybeSingle();
        if (result.error) throw new Error(result.error.message);
        return result.data;
    }
    try {
        const get = await fetch(url);
        assert.equal(get.status, 200);
        assert.ok((await get.text()).includes('Afskrá hugleiðingar?'));
        assert.deepEqual((await read())?.segments, ['newsletter', 'devotionals']);
        const post = () => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click', redirect: 'manual' });
        let response = await post();
        assert.equal(response.status, 200);
        assert.equal(await response.text(), '');
        assert.deepEqual((await read())?.segments, ['newsletter']);
        response = await post();
        assert.equal(response.status, 200);
        assert.deepEqual((await read())?.segments, ['newsletter']);

        // The final opt-out leaves no inactive subscriber in admin counts.
        const reset = await db.from('subscribers').update({ segments: ['devotionals'] }).eq('id', id);
        if (reset.error) throw new Error(reset.error.message);
        await removeSubscription(db, token, 'devotionals');
        assert.equal(await read(), null);

        // The explicitly labelled legacy all-list action retains its old scope.
        const recreated = await db.from('subscribers').insert({ id, email, segments: ['newsletter', 'devotionals'], is_verified: false, verified_at: null, unsubscribe_token: token });
        if (recreated.error) throw new Error(recreated.error.message);
        response = await fetch(`${base}/api/subscribers/unsubscribe?token=${token}`, {
            method: 'POST', body: new URLSearchParams({ intent: 'unsubscribe' }), redirect: 'manual',
        });
        assert.equal(response.status, 200);
        assert.ok((await response.text()).includes('Afskráning tókst'));
        assert.equal(await read(), null);
        console.log('PASS: GET is read-only; topic removal preserves other lists; repeat is safe; final opt-out removes only its test row; legacy explicit all-list unsubscribe works.');
    } finally {
        const cleanup = await db.from('subscribers').delete().eq('id', id).eq('email', email);
        if (cleanup.error) throw new Error('Disposable unsubscribe test row cleanup failed');
    }
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Unsubscribe test failed'); process.exitCode = 1; });
