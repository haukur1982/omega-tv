import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliverDevotionalWelcome, type WelcomeDelivery } from '../src/lib/devotional-welcome';
import { devotionalWelcomeTemplate } from '../src/lib/devotional-welcome-template';

const subscriber = { id: 'test-subscriber', email: 'reader@example.invalid', unsubscribe_token: 'test-token' };

function harness() {
    let sent = false;
    let attempts = 0;
    const delivery: WelcomeDelivery = {
        wasSent: async () => sent,
        send: async () => { attempts++; return 'email-id'; },
        record: async (id, emailId) => {
            assert.equal(id, subscriber.id);
            assert.equal(emailId, 'email-id');
            sent = true;
        },
    };
    return { delivery, attempts: () => attempts, recorded: () => sent };
}

test('sends a first receipt and skips an already recorded welcome', async () => {
    const h = harness();
    assert.equal(await deliverDevotionalWelcome(subscriber, h.delivery), 'sent');
    assert.equal(await deliverDevotionalWelcome(subscriber, h.delivery), 'already_sent');
    assert.equal(h.attempts(), 1);
});

test('provider failure stays retryable and is not marked sent', async () => {
    const h = harness();
    const firstSend = h.delivery.send;
    h.delivery.send = async () => { throw new Error('Provider unavailable'); };
    assert.equal(await deliverDevotionalWelcome(subscriber, h.delivery), 'failed');
    assert.equal(h.recorded(), false);
    h.delivery.send = firstSend;
    assert.equal(await deliverDevotionalWelcome(subscriber, h.delivery), 'sent');
});

test('unavailable history does not risk an untracked duplicate', async () => {
    const h = harness();
    h.delivery.wasSent = async () => { throw new Error('History unavailable'); };
    assert.equal(await deliverDevotionalWelcome(subscriber, h.delivery), 'failed');
    assert.equal(h.attempts(), 0);
});

test('an accepted email remains sent if only the event write fails', async () => {
    const h = harness();
    h.delivery.record = async () => { throw new Error('Storage unavailable'); };
    assert.equal(await deliverDevotionalWelcome(subscriber, h.delivery), 'sent');
    assert.equal(h.attempts(), 1);
});

test('welcome includes text alternative, open reading link and encoded unsubscribe', () => {
    const template = devotionalWelcomeTemplate('token"<&');
    assert.ok(template.html.includes('lang="is"'));
    assert.ok(template.html.includes('Þú þarft ekkert meira að gera.'));
    assert.ok(template.text.includes('Við erum að undirbúa daglegar sendingar'));
    assert.ok(template.html.includes('https://omega.is/hugleidingar#lesa'));
    assert.ok(template.text.includes(template.unsubscribeUrl));
    assert.ok(!template.html.includes('token"<&'));
    assert.ok(Buffer.byteLength(template.html, 'utf8') < 20000);
    assert.equal(template.html, devotionalWelcomeTemplate('token"<&').html);
});
