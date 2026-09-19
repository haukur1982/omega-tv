import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEVOTIONAL_CONSENT, parseSubscription } from '../src/lib/subscription-input';

function form(values: Record<string, string>) {
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) data.set(key, value);
    return data;
}

test('normalizes an email and records the actual devotional consent', () => {
    const result = parseSubscription(form({ email: '  Reader@Example.is  ', segment: 'devotionals', consent: 'true', consent_text: 'forged' }));
    assert.equal(result.email, 'reader@example.is');
    assert.equal(result.consentText, DEVOTIONAL_CONSENT);
});

test('requires explicit devotional consent even if the checkbox is omitted', () => {
    for (const consent of [undefined, '', 'false']) {
        const data = form({ email: 'reader@example.is', segment: 'devotionals' });
        if (consent !== undefined) data.set('consent', consent);
        assert.ok(parseSubscription(data).error);
    }
});

test('rejects malformed addresses, file values and unknown lists', () => {
    for (const email of ['', 'reader@', 'a@b', 'a b@example.is', 'a@@example.is']) {
        assert.ok(parseSubscription(form({ email })).error);
    }
    const data = form({ email: 'reader@example.is' });
    data.set('email', new Blob(['not an email']));
    assert.ok(parseSubscription(data).error);
    assert.ok(parseSubscription(form({ email: 'reader@example.is', segment: 'admin' })).error);
});

test('preserves newsletter/vision signups and requires TV consent', () => {
    for (const segment of ['newsletter', 'vision']) {
        assert.equal(parseSubscription(form({ email: 'reader@example.is', segment })).segment, segment);
    }
    assert.ok(parseSubscription(form({ email: 'reader@example.is', segment: 'tv' })).error);
    assert.equal(parseSubscription(form({ email: 'reader@example.is', segment: 'tv', consent: 'on' })).segment, 'tv');
});
