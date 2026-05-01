/**
 * Mock series + episode data for /sermons preview when the real
 * Supabase tables are empty (which is the day-1 state). Used as a
 * fallback so Hawk can see what the page looks like populated.
 *
 * When real series rows exist for a category, real data takes
 * precedence — mocks only fill empty categories.
 *
 * All thumbnails are from the curated Unsplash photo set already
 * verified-in-use elsewhere on the site. Some are nature/atmospheric
 * (placeholder for designed show posters); when real designed
 * posters land in series.poster_vertical, those replace the mock.
 */

import type { SeriesWithLatest } from "./vod-db";

const POSTER = (id: string, w = 600, h = 750) =>
    `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const THUMB = (id: string, w = 1280, h = 720) =>
    `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

function makeSeries(args: {
    slug: string;
    title: string;
    host: string | null;
    description: string;
    category: string;
    poster: string;
    epTitle: string;
    epDate: string; // ISO
    epThumb: string;
    epDuration: number;
    episodeCount: number;
}): SeriesWithLatest {
    return {
        id: `mock-${args.slug}`,
        slug: args.slug,
        title: args.title,
        description: args.description,
        host: args.host,
        poster_horizontal: null,
        poster_vertical: args.poster,
        category: args.category,
        created_at: null,
        status: 'published',
        latest_episode: {
            id: `mock-ep-${args.slug}`,
            title: args.epTitle,
            published_at: args.epDate,
            thumbnail_custom: args.epThumb,
            bunny_video_id: 'mock',
            duration: args.epDuration,
        },
        episode_count: args.episodeCount,
    };
}

export const MOCK_SERIES_BY_CATEGORY: Record<string, SeriesWithLatest[]> = {
    'omega-produced': [
        makeSeries({
            slug: 'sunnudagssamkoma',
            title: 'Sunnudagssamkoma',
            host: 'Eiríkur Sigurbjörnsson',
            description: 'Vikulegi lofgjörðar- og prédikunarþátturinn — í beinni úr safnaðarsalnum.',
            category: 'omega-produced',
            poster: POSTER('photo-1438232992991-995b7058bbb3'),
            epTitle: 'Trúin sem stendur',
            epDate: '2026-04-20T11:00:00Z',
            epThumb: THUMB('photo-1438232992991-995b7058bbb3'),
            epDuration: 3900,
            episodeCount: 142,
        }),
        makeSeries({
            slug: 'baenakvold',
            title: 'Bænakvöld',
            host: 'Eiríkur Sigurbjörnsson',
            description: 'Vikulegt bænakvöld — bænir fyrir Ísland og fjölskyldur.',
            category: 'omega-produced',
            poster: POSTER('photo-1507692049790-de58290a4334'),
            epTitle: 'Bæn fyrir Íslandi',
            epDate: '2026-04-23T18:00:00Z',
            epThumb: THUMB('photo-1507692049790-de58290a4334'),
            epDuration: 2700,
            episodeCount: 76,
        }),
        makeSeries({
            slug: 'utsending',
            title: 'Útsending',
            host: 'Snorri Óskarsson',
            description: 'Viðtöl og umfjöllun um trú, samfélag, og samtíma.',
            category: 'omega-produced',
            poster: POSTER('photo-1457369804613-52c61a468e7d'),
            epTitle: 'Snorri ræðir við Guðmund Þórir',
            epDate: '2026-04-17T20:00:00Z',
            epThumb: THUMB('photo-1457369804613-52c61a468e7d'),
            epDuration: 3540,
            episodeCount: 38,
        }),
        makeSeries({
            slug: 'truarlif',
            title: 'TrúarLíf',
            host: 'Indriði Kristjánsson',
            description: 'Samtöl um líf trúarinnar í íslenskum veruleika.',
            category: 'omega-produced',
            poster: POSTER('photo-1473773508845-188df298d2d1'),
            epTitle: 'WOKE-hreyfingin og kirkjan',
            epDate: '2026-04-15T20:00:00Z',
            epThumb: THUMB('photo-1473773508845-188df298d2d1'),
            epDuration: 3470,
            episodeCount: 24,
        }),
        makeSeries({
            slug: 'morgunbaen',
            title: 'Morgunbæn',
            host: 'Omega',
            description: 'Opnum daginn í bæn — daglega, með íslenskri rödd.',
            category: 'omega-produced',
            poster: POSTER('photo-1518837695005-2083093ee35b'),
            epTitle: 'Morgunbæn 23. apríl',
            epDate: '2026-04-23T07:00:00Z',
            epThumb: THUMB('photo-1518837695005-2083093ee35b'),
            epDuration: 600,
            episodeCount: 312,
        }),
        makeSeries({
            slug: 'tonleikakvold',
            title: 'Tónleikakvöld',
            host: 'Omega',
            description: 'Lofgjörð og íslenskir listamenn.',
            category: 'omega-produced',
            poster: POSTER('photo-1474418397713-7ede21d49118'),
            epTitle: 'Lofgjörðarstund — apríl 2026',
            epDate: '2026-04-19T19:00:00Z',
            epThumb: THUMB('photo-1474418397713-7ede21d49118'),
            epDuration: 4500,
            episodeCount: 18,
        }),
    ],

    'iceland-partners': [
        makeSeries({
            slug: 'ctf-samkoma',
            title: 'CTF samkoma',
            host: null,
            description: 'Samkomur frá CTF söfnuðinum, vikulega.',
            category: 'iceland-partners',
            poster: POSTER('photo-1504052434569-70ad5836ab65'),
            epTitle: 'Samkoma 8. september',
            epDate: '2026-04-14T11:00:00Z',
            epThumb: THUMB('photo-1504052434569-70ad5836ab65'),
            epDuration: 2360,
            episodeCount: 64,
        }),
        makeSeries({
            slug: 'united-samkoma',
            title: 'United samkoma',
            host: null,
            description: 'Samkomur frá United söfnuðinum.',
            category: 'iceland-partners',
            poster: POSTER('photo-1501785888041-af3ef285b470'),
            epTitle: 'United — 4. september',
            epDate: '2026-04-12T11:00:00Z',
            epThumb: THUMB('photo-1501785888041-af3ef285b470'),
            epDuration: 5440,
            episodeCount: 51,
        }),
        makeSeries({
            slug: 'hvitasunnukirkjan-keflavik',
            title: 'Hvítasunnukirkjan í Keflavík',
            host: null,
            description: 'Samkomur frá Hvítasunnukirkjunni í Keflavík.',
            category: 'iceland-partners',
            poster: POSTER('photo-1464822759023-fed622ff2c3b'),
            epTitle: 'Samkoma 27. ágúst',
            epDate: '2026-04-09T11:00:00Z',
            epThumb: THUMB('photo-1464822759023-fed622ff2c3b'),
            epDuration: 2095,
            episodeCount: 33,
        }),
        makeSeries({
            slug: 'austurbaer-samkoma',
            title: 'Samkoma í Austurbæ',
            host: null,
            description: 'Söguleg samkomusafn úr Austurbæ.',
            category: 'iceland-partners',
            poster: POSTER('photo-1454496522488-7a8e488e8606'),
            epTitle: 'Saman stöndum við',
            epDate: '2026-04-05T11:00:00Z',
            epThumb: THUMB('photo-1454496522488-7a8e488e8606'),
            epDuration: 6953,
            episodeCount: 12,
        }),
    ],

    'international': [
        makeSeries({
            slug: 'times-square-church',
            title: 'Times Square Church',
            host: null,
            description: 'Þjónusta frá Times Square söfnuðinum í New York. Þýtt á íslensku.',
            category: 'international',
            poster: POSTER('photo-1531366936337-7c912a4589a7'),
            epTitle: 'Carter Conlon — Þegar trúin þrýstir',
            epDate: '2026-04-21T18:00:00Z',
            epThumb: THUMB('photo-1531366936337-7c912a4589a7'),
            epDuration: 3300,
            episodeCount: 28,
        }),
        makeSeries({
            slug: 'shekinah-worship',
            title: 'Shekinah Worship',
            host: null,
            description: 'Lofgjörðar- og dýrðarstund frá Shekinah Worship Center.',
            category: 'international',
            poster: POSTER('photo-1547036967-23d11aacaee0'),
            epTitle: 'Lofgjörð úr Branson',
            epDate: '2026-04-18T19:00:00Z',
            epThumb: THUMB('photo-1547036967-23d11aacaee0'),
            epDuration: 4200,
            episodeCount: 22,
        }),
        makeSeries({
            slug: 'cbn-jerusalem-dateline',
            title: 'CBN Jerusalem Dateline',
            host: 'Chris Mitchell',
            description: 'Vikulegar fréttir frá Mið-Austurlöndum með biblíulegu sjónarhorni.',
            category: 'international',
            poster: POSTER('photo-1444703686981-a3abbc4d4fe3'),
            epTitle: 'Vikan í Ísrael — apríl 2026',
            epDate: '2026-04-22T20:00:00Z',
            epThumb: THUMB('photo-1444703686981-a3abbc4d4fe3'),
            epDuration: 1800,
            episodeCount: 156,
        }),
        makeSeries({
            slug: 'cbn-700-club',
            title: 'CBN — 700 klúbburinn',
            host: 'Pat Robertson Legacy',
            description: 'Daglegur þáttur með fréttum, vitnisburðum og fræðslu.',
            category: 'international',
            poster: POSTER('photo-1481627834876-b7833e8f5570'),
            epTitle: '700 klúbburinn — 22. maí',
            epDate: '2026-04-20T12:00:00Z',
            epThumb: THUMB('photo-1481627834876-b7833e8f5570'),
            epDuration: 2680,
            episodeCount: 410,
        }),
        makeSeries({
            slug: 'i-snertingu',
            title: 'Í snertingu',
            host: 'Dr. Charles Stanley',
            description: 'Daglegur boðskapur um náð, sannleika og daglega trú.',
            category: 'international',
            poster: POSTER('photo-1519750157634-b6d493a0f77c'),
            epTitle: 'Þegar Guð virðist hljóður',
            epDate: '2026-04-22T12:00:00Z',
            epThumb: THUMB('photo-1519750157634-b6d493a0f77c'),
            epDuration: 1740,
            episodeCount: 380,
        }),
        makeSeries({
            slug: 'joyce-meyer',
            title: 'Joyce Meyer',
            host: 'Joyce Meyer',
            description: 'Hagnýt biblíufræðsla — að lifa af Orðinu.',
            category: 'international',
            poster: POSTER('photo-1492691527719-9d1e07e534b4'),
            epTitle: 'Hugarheimur trúarinnar',
            epDate: '2026-04-19T16:00:00Z',
            epThumb: THUMB('photo-1492691527719-9d1e07e534b4'),
            epDuration: 1800,
            episodeCount: 210,
        }),
    ],

    'documentaries': [
        makeSeries({
            slug: 'fingur-guds',
            title: 'Fingur Guðs',
            host: null,
            description: 'Heimildarmynd um nútíma kraftaverk og hreyfingu Heilags Anda í dag.',
            category: 'documentaries',
            poster: POSTER('photo-1476610182048-b716b8515aaa'),
            epTitle: 'Fingur Guðs — síðari þáttur',
            epDate: '2026-04-10T20:00:00Z',
            epThumb: THUMB('photo-1476610182048-b716b8515aaa'),
            epDuration: 5543,
            episodeCount: 2,
        }),
        makeSeries({
            slug: 'hinir-utvoldu',
            title: 'Hinir útvöldu',
            host: 'Dallas Jenkins',
            description: 'Sjónvarpsröð um líf Jesú og lærisveina hans — þýdd á íslensku.',
            category: 'documentaries',
            poster: POSTER('photo-1521295121783-8a321d551ad2'),
            epTitle: 'Þáttaröð I — 1. og 2. þáttur',
            epDate: '2026-04-08T20:00:00Z',
            epThumb: THUMB('photo-1521295121783-8a321d551ad2'),
            epDuration: 5483,
            episodeCount: 8,
        }),
        makeSeries({
            slug: 'svo-ad-vid-gleymum-ekki',
            title: 'Svo að við gleymum EKKI',
            host: null,
            description: 'Heimildarþættir um Helförina og aðrar stundir sem mega aldrei gleymast.',
            category: 'documentaries',
            poster: POSTER('photo-1516450360452-9312f5e86fc7'),
            epTitle: 'Frá ösku til upprisu',
            epDate: '2026-04-04T20:00:00Z',
            epThumb: THUMB('photo-1516450360452-9312f5e86fc7'),
            epDuration: 3600,
            episodeCount: 4,
        }),
    ],

    'music': [
        makeSeries({
            slug: 'lofgjord',
            title: 'Lofgjörð',
            host: 'Omega',
            description: 'Lofgjörðarstundir og söngsamkomur úr safni Omega.',
            category: 'music',
            poster: POSTER('photo-1470225620780-dba8ba36b745'),
            epTitle: 'Lofgjörðarstund — Bethel kvartettinn',
            epDate: '2026-04-21T19:00:00Z',
            epThumb: THUMB('photo-1470225620780-dba8ba36b745'),
            epDuration: 1072,
            episodeCount: 47,
        }),
        makeSeries({
            slug: 'tonleikar-ut-og-inn',
            title: 'Tónleikar út og inn',
            host: 'Omega',
            description: 'Heilir tónleikar úr íslenskum kirkjum og samkomum.',
            category: 'music',
            poster: POSTER('photo-1470071459604-3b5ec3a7fe05'),
            epTitle: 'Daniel Kolenda — Hallelujah',
            epDate: '2026-04-15T20:00:00Z',
            epThumb: THUMB('photo-1470071459604-3b5ec3a7fe05'),
            epDuration: 162,
            episodeCount: 19,
        }),
    ],

    'kids': [
        makeSeries({
            slug: 'aevintyravindar',
            title: 'Ævintýravindar',
            host: 'Omega',
            description: 'Biblíusögur fyrir börn — söngur, sögur og leikir.',
            category: 'kids',
            poster: POSTER('photo-1502086223501-7ea6ecd79368'),
            epTitle: 'Ævintýravindar 15',
            epDate: '2026-04-20T09:00:00Z',
            epThumb: THUMB('photo-1502086223501-7ea6ecd79368'),
            epDuration: 785,
            episodeCount: 16,
        }),
        makeSeries({
            slug: 'fjolskyldustund',
            title: 'Fjölskyldustund',
            host: 'Omega',
            description: 'Biblíusögur og söngur fyrir börn og foreldra saman.',
            category: 'kids',
            poster: POSTER('photo-1503454537195-1dcabb73ffb9'),
            epTitle: 'Sagan af Móse',
            epDate: '2026-04-18T09:00:00Z',
            epThumb: THUMB('photo-1503454537195-1dcabb73ffb9'),
            epDuration: 1800,
            episodeCount: 22,
        }),
    ],
};

export const MOCK_SUNDAY_FEATURED = {
    series: {
        title: 'Sunnudagssamkoma',
        slug: 'sunnudagssamkoma',
        host: 'Eiríkur Sigurbjörnsson',
        description: 'Vikulegi lofgjörðar- og prédikunarþátturinn frá Omega Stöðinni.',
    },
    episode: {
        id: 'mock-sunday-latest',
        title: 'Trúin sem stendur',
        description:
            'Þegar allt í kringum okkur skelfur — fjölskylda, samfélag, samtími — þá er trúin það eina sem heldur. Eiríkur prédikar úr Hebreabréfinu 12 um varanlega ríkið sem ekki er hægt að hrista.',
        duration: 3900,
        published_at: '2026-04-20T11:00:00Z',
        thumbnail_custom: THUMB('photo-1438232992991-995b7058bbb3', 1600, 1000),
        bunny_video_id: 'mock',
        episode_number: 142,
        season_id: null,
        series_id: 'mock-sunnudagssamkoma',
        source: null,
        status: 'published',
        created_at: null,
    },
};

/**
 * Look up a mock series by slug across all categories.
 * Used by /sermons/show/[slug] as a fallback when the real DB has no
 * series matching that slug — keeps mock cards on /sermons from being
 * dead-end 404s.
 */
export function findMockSeriesBySlug(slug: string): SeriesWithLatest | null {
    const all = Object.values(MOCK_SERIES_BY_CATEGORY).flat();
    return all.find((s) => s.slug === slug) ?? null;
}

/**
 * Build a fabricated 4-week catalog from a mock series's `latest_episode`
 * so the show page reads as populated rather than empty. All entries are
 * non-clickable on the rendering side — the "Sýnishorn" banner explains.
 */
export function getMockEpisodesForMockSeries(series: SeriesWithLatest): Array<{
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    published_at: string | null;
    thumbnail_custom: string | null;
    bunny_video_id: string;
}> {
    const latest = series.latest_episode;
    if (!latest) return [];
    const baseDate = latest.published_at ? new Date(latest.published_at) : new Date();
    return Array.from({ length: 4 }).map((_, i) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - i * 7);
        return {
            id: `mock-${series.slug}-${i}`,
            title: i === 0 ? latest.title : `${latest.title} — vika ${i + 1}`,
            description: null,
            duration: latest.duration,
            published_at: d.toISOString(),
            thumbnail_custom: latest.thumbnail_custom,
            bunny_video_id: 'mock',
        };
    });
}

/**
 * Pull the most recently published episodes across all mock series.
 * Used for the "Nýjast bætt við" rail.
 */
export function getMockNewestEpisodes(limit = 8) {
    const all = Object.values(MOCK_SERIES_BY_CATEGORY).flat();
    return all
        .filter((s) => s.latest_episode)
        .map((s) => ({
            ...s.latest_episode!,
            series_title: s.title,
            series_slug: s.slug,
        }))
        .sort((a, b) => {
            const da = a.published_at ? new Date(a.published_at).getTime() : 0;
            const db = b.published_at ? new Date(b.published_at).getTime() : 0;
            return db - da;
        })
        .slice(0, limit);
}
