import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectHomeFeature, type HomeFeature } from '../src/lib/home-feature';

const episode = (id: string, patch: Partial<HomeFeature> = {}): HomeFeature => ({
    id, bunny_video_id: `video-${id}`, title: `Þáttur ${id}`, description: null,
    published_at: '2026-09-01T12:00:00Z', thumbnail_custom: null, duration: 1200,
    status: 'published', series: null, ...patch,
});

test('daily feature is stable for a day and changes at Iceland midnight, including unassigned programmes', () => {
    const entries = [episode('c'), episode('a'), episode('b')];
    const order = entries.map(e => e.id);
    const early = selectHomeFeature(entries, new Date('2026-09-20T00:00:00Z'));
    assert.ok(early);
    assert.equal(selectHomeFeature(entries, new Date('2026-09-20T23:59:59Z'))?.id, early.id);
    assert.notEqual(selectHomeFeature(entries, new Date('2026-09-21T00:00:00Z'))?.id, early.id);
    assert.deepEqual(entries.map(e => e.id), order);
    assert.equal(selectHomeFeature([...entries].reverse(), new Date('2026-09-20T12:00:00Z'))?.id, early.id);
});

test('drafts, future/invalid dates, missing videos, empty titles and inactive series are never featured', () => {
    const hidden = [
        episode('draft', { status: 'draft' }),
        episode('future', { published_at: '2026-09-21T00:00:00Z' }),
        episode('undated', { published_at: null }), episode('invalid', { published_at: 'bad date' }),
        episode('no-video', { bunny_video_id: null }), episode('blank-video', { bunny_video_id: ' ' }),
        episode('no-title', { title: ' ' }),
        episode('inactive', { series: { title: 'Series', slug: 'series', host: null, description: null, status: 'draft' } }),
    ];
    const now = new Date('2026-09-20T12:00:00Z');
    assert.equal(selectHomeFeature(hidden, now), null);
    assert.equal(selectHomeFeature([...hidden, episode('ok')], now)?.id, 'ok');
});

test('rotation includes fourteen recent unique videos and handles empty and single-item catalogues', () => {
    const entries = Array.from({ length: 15 }, (_, i) => episode(String(i), {
        published_at: `2026-09-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
    }));
    const duplicate = episode('duplicate', { bunny_video_id: 'video-14', published_at: '2026-09-15T12:00:00Z' });
    const chosen = new Set(Array.from({ length: 14 }, (_, day) =>
        selectHomeFeature([...entries, duplicate], new Date(Date.UTC(2026, 9, day + 1)))?.bunny_video_id));
    assert.equal(chosen.size, 14);
    assert.ok(!chosen.has('video-0'));
    assert.equal(selectHomeFeature([], new Date('2026-09-20')), null);
    assert.equal(selectHomeFeature([episode('one')], new Date('2026-09-20'))?.id, 'one');
});
