import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Devotional } from '../src/lib/devotional-db';
import { featuredPrayerLabel, selectHomeDevotional } from '../src/lib/home-content';

const piece = (day: number, slot: Devotional['slot'] = 'morning', patch: Partial<Devotional> = {}): Devotional => ({
    id: `${day}-${slot}`, day, slot, slug: `dagur-${day}-${slot}`, collection: 'test',
    title_is: 'Hugleiðing', title_en: null, body_is: ['Yfirlesinn texti.'], body_en: [], scripture_refs: [],
    reviewed: true, status: 'published', reviewed_at: null, review_note: null, source_url: null, ...patch,
});

test('homepage excludes drafts, unreviewed and empty pieces, even when they match today', () => {
    const now = new Date('2026-09-19T12:00:00Z');
    const hidden = [piece(19, 'morning', { status: 'draft' }), piece(19, 'evening', { reviewed: false }), piece(18, 'morning', { body_is: [' '] })];
    assert.equal(selectHomeDevotional(hidden, now), null);
    assert.equal(selectHomeDevotional([...hidden, piece(1)], now)?.day, 1);
});

test('monthly reading prefers today morning, then the nearest published day, without mutating the collection', () => {
    const entries = [piece(20), piece(19, 'evening'), piece(19), piece(18)];
    const order = entries.map(p => p.id);
    assert.equal(selectHomeDevotional(entries, new Date('2026-09-19T23:59:59Z'))?.id, '19-morning');
    assert.equal(selectHomeDevotional(entries, new Date('2026-09-20T00:00:00Z'))?.id, '20-morning');
    assert.equal(selectHomeDevotional(entries, new Date('2026-09-01T00:00:00Z'))?.id, '20-morning');
    assert.deepEqual(entries.map(p => p.id), order);
});

test('only a prayer dated today in Iceland is called the prayer of the day', () => {
    const now = new Date('2026-09-20T00:15:00Z');
    assert.equal(featuredPrayerLabel('2026-09-20', now), 'Bæn dagsins');
    assert.equal(featuredPrayerLabel('2026-09-19', now), 'Sameinumst í bæn');
    assert.equal(featuredPrayerLabel('2026-09-21', now), 'Sameinumst í bæn');
    assert.equal(featuredPrayerLabel(undefined, now), 'Sameinumst í bæn');
});
