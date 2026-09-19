/** Live integration check. Sends ONE email to Resend's documented simulator.
 * node --env-file=.env.local --import tsx scripts/check-devotional-welcome.ts
 * Removes only the test subscriber/events. Never sends to a person's inbox.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { subscribeAction } from '../src/actions/subscribe';

async function main() {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const email = `delivered+omega-welcome-${randomUUID()}@resend.dev`;
    const form = new FormData();
    form.set('email', email);
    form.set('segment', 'devotionals');
    form.set('consent', 'true');
    try {
        const first = await subscribeAction(form);
        assert.equal(first.success, true);
        assert.equal(first.confirmation, 'sent');
        const second = await subscribeAction(form);
        assert.equal(second.success, true);
        assert.equal(second.confirmation, 'already_sent');
        const saved = await db.from('subscribers').select('id').eq('email', email).single();
        assert.ifError(saved.error);
        const events = await db.from('system_events').select('payload').eq('event_type', 'devotional.welcome.sent')
            .eq('payload->>subscriber_id', saved.data!.id);
        assert.ifError(events.error);
        assert.equal(events.data?.length, 1);
        const receipt = await new Resend(process.env.RESEND_API_KEY!).emails.get(events.data![0].payload.email_id);
        assert.ifError(receipt.error);
        assert.equal(receipt.data?.subject, 'Takk fyrir skráninguna — Hugleiðingar Omega');
        console.log('PASS: signup sends a receipt, repeat skips sending, provider email exists. Status:', receipt.data?.last_event);
    } finally {
        const saved = await db.from('subscribers').select('id').eq('email', email).maybeSingle();
        assert.ifError(saved.error);
        if (saved.data) {
            const events = await db.from('system_events').delete().eq('event_type', 'devotional.welcome.sent')
                .eq('payload->>subscriber_id', saved.data.id);
            assert.ifError(events.error);
            const deletion = await db.from('subscribers').delete().eq('id', saved.data.id).eq('email', email);
            assert.ifError(deletion.error);
        }
        console.log('Test subscriber and test event removed.');
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
