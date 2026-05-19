import Navbar from "@/components/layout/Navbar";
import type { CSSProperties } from "react";
import Footer from "@/components/layout/Footer";
import SermonsMasthead from "@/components/sermon/SermonsMasthead";
import FeaturedSunday from "@/components/sermon/FeaturedSunday";
import NewestRail from "@/components/sermon/NewestRail";
import SeriesShelf from "@/components/sermon/SeriesShelf";
import {
    getSeriesByCategory,
    getLatestEpisodeBySeriesSlug,
    getNewestEpisodes,
    getUncategorizedSeries,
    searchVodEpisodes,
    type SeriesWithLatest,
    type VodSearchEpisode,
} from "@/lib/vod-db";
import {
    MOCK_SERIES_BY_CATEGORY,
    MOCK_SUNDAY_FEATURED,
    getMockNewestEpisodes,
} from "@/lib/mock-series";

/**
 * /sermons — Þáttasafn (show archive).
 *
 * Editorial flow:
 *   1. Masthead
 *   2. Sunnudagssamkoma vikunnar (featured card)
 *   3. Nýlega bætt við (cinematic 16:9 horizontal rail — Apple-TV "up next")
 *   4. Útsendingar Omega          [omega-produced]
 *   5. Söfnuðir á Íslandi         [iceland-partners]    pergament tint
 *   6. Frá útlöndum               [international]
 *   7. Heimildarmyndir            [documentaries]       pergament tint
 *   8. Lofgjörð & tónlist         [music]
 *   9. Barnaefni                  [kids]                pergament tint
 *
 * Mock fallback: when a category has no real series tagged yet, the
 * mock data fills it in so the layout reads as it will when populated.
 * Real data takes precedence — once `series.category='omega-produced'`
 * has actual rows, the mocks for that category are dropped.
 */

export const revalidate = 60;

const CATEGORY_FILTERS = [
    { value: '', label: 'Allar hillur' },
    { value: 'omega-produced', label: 'Útsendingar Omega' },
    { value: 'iceland-partners', label: 'Söfnuðir á Íslandi' },
    { value: 'international', label: 'Frá útlöndum' },
    { value: 'documentaries', label: 'Heimildarmyndir' },
    { value: 'music', label: 'Lofgjörð' },
    { value: 'kids', label: 'Barnaefni' },
];

function withMockFallback(
    real: SeriesWithLatest[],
    category: keyof typeof MOCK_SERIES_BY_CATEGORY,
): SeriesWithLatest[] {
    return real.length > 0 ? real : (MOCK_SERIES_BY_CATEGORY[category] ?? []);
}

export default async function SermonsPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string; language?: string; category?: string }>;
}) {
    const params = await searchParams;
    const searchQuery = params?.q?.trim() ?? '';
    const languageFilter = params?.language?.trim() ?? '';
    const categoryFilter = params?.category?.trim() ?? '';
    const hasDiscoveryFilter = Boolean(searchQuery || languageFilter || categoryFilter);

    const [
        sundayLatestReal,
        omegaReal,
        icelandReal,
        intlReal,
        docsReal,
        musicReal,
        kidsReal,
        newestReal,
        uncategorized,
        discoveryResults,
    ] = await Promise.all([
        getLatestEpisodeBySeriesSlug('sunnudagssamkoma').catch(() => null),
        getSeriesByCategory('omega-produced').catch(() => []),
        getSeriesByCategory('iceland-partners').catch(() => []),
        getSeriesByCategory('international').catch(() => []),
        getSeriesByCategory('documentaries').catch(() => []),
        getSeriesByCategory('music').catch(() => []),
        getSeriesByCategory('kids').catch(() => []),
        getNewestEpisodes(8).catch(() => []),
        getUncategorizedSeries().catch(() => []),
        hasDiscoveryFilter
            ? searchVodEpisodes({
                q: searchQuery,
                language: languageFilter,
                category: categoryFilter,
                limit: 24,
            }).catch(() => [])
            : Promise.resolve([]),
    ]);

    const sundayLatest = sundayLatestReal ?? MOCK_SUNDAY_FEATURED;
    const omegaProduced = withMockFallback(omegaReal, 'omega-produced');
    const icelandPartners = withMockFallback(icelandReal, 'iceland-partners');
    const international = withMockFallback(intlReal, 'international');
    const documentaries = withMockFallback(docsReal, 'documentaries');
    const music = withMockFallback(musicReal, 'music');
    const kids = withMockFallback(kidsReal, 'kids');

    // Prefer real published episodes; fall back to mock only when zero exist.
    // Don't merge — a half-real, half-mock rail is worse than either alone.
    const newestEpisodes = newestReal.length > 0 ? newestReal : getMockNewestEpisodes(8);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            <SermonsMasthead />

            <VodDiscoverySearch
                q={searchQuery}
                language={languageFilter}
                category={categoryFilter}
                results={discoveryResults}
                active={hasDiscoveryFilter}
            />

            <FeaturedSunday
                series={sundayLatest.series}
                episode={sundayLatest.episode}
            />

            <NewestRail episodes={newestEpisodes} />

            <SeriesShelf
                kicker="Eigin dagskrá"
                title="Útsendingar Omega"
                subtitle="Sunnudagssamkomur, bænakvöld, viðtöl og fræðsla — frá Omega Stöðinni sjálfri."
                series={omegaProduced}
                emptyMessage="Þættir Omega bætast hér við jafnóðum og þeir koma úr safninu."
            />

            <SeriesShelf
                kicker="Söfnuðir"
                title="Söfnuðir á Íslandi"
                subtitle="Samkomur frá íslenskum kirkjum og söfnuðum — endurfluttar í þáttasafni."
                series={icelandPartners}
                emptyMessage="Samkomur frá íslenskum söfnuðum birtast hér jafnóðum."
                register="pergament"
            />

            <SeriesShelf
                kicker="Útlönd"
                title="Frá útlöndum"
                subtitle="Þáttaraðir frá samstarfsaðilum erlendis — þýtt og textað á íslensku samkvæmt heimildarsamningum."
                series={international}
                emptyMessage="Erlent efni er á leiðinni, þýtt og textað."
            />

            <SeriesShelf
                kicker="Heimildarmyndir"
                title="Heimildarmyndir og þáttaraðir"
                subtitle="Lengri verk — saga, vitnisburðir, og þættir sem dýpka skilninginn á trú og tímum."
                series={documentaries}
                emptyMessage="Heimildarmyndir bætast hér við þegar þær koma úr þýðingarstöðinni."
                register="pergament"
            />

            <SeriesShelf
                kicker="Tónlist"
                title="Lofgjörð & tónleikar"
                subtitle="Lofgjörðarstundir, tónleikakvöld og tónlist sem nærir andann."
                series={music}
                emptyMessage="Tónlistarefni birtist hér jafnóðum."
            />

            <SeriesShelf
                kicker="Krakkar"
                title="Barnaefni"
                subtitle="Biblíusögur, söngur og þættir sem börn og foreldrar geta horft á saman."
                series={kids}
                emptyMessage="Barnaefni birtist hér jafnóðum."
                register="pergament"
            />

            {/* "Annað efni" — uncategorized real series. No mock fallback —
                this shelf exists precisely to surface unfiled content so
                the editor can go set the category. Hidden when empty. */}
            {uncategorized.length > 0 && (
                <SeriesShelf
                    kicker="Annað"
                    title="Annað efni"
                    subtitle="Nýtt efni sem hefur ekki enn verið flokkað í hilluna sína."
                    series={uncategorized}
                    emptyMessage=""
                />
            )}

            <Footer />
        </main>
    );
}

function VodDiscoverySearch({
    q,
    language,
    category,
    results,
    active,
}: {
    q: string;
    language: string;
    category: string;
    results: VodSearchEpisode[];
    active: boolean;
}) {
    return (
        <section style={{ background: 'var(--skra)', color: 'var(--mold)', padding: '34px 24px 42px' }}>
            <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
                <form
                    action="/sermons"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                        gap: '10px',
                        alignItems: 'center',
                    }}
                >
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Leita í þáttum, ritningu, lýsingum…"
                        style={searchInputStyle}
                    />
                    <select name="language" defaultValue={language} style={searchInputStyle} aria-label="Tungumál">
                        <option value="">Öll tungumál</option>
                        <option value="is">Íslenska</option>
                        <option value="en">English</option>
                    </select>
                    <select name="category" defaultValue={category} style={searchInputStyle} aria-label="Hilla">
                        {CATEGORY_FILTERS.map((item) => (
                            <option key={item.value || 'all'} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        style={{
                            border: '1px solid var(--mold)',
                            background: 'var(--mold)',
                            color: 'var(--skra)',
                            borderRadius: '4px',
                            padding: '12px 18px',
                            fontSize: '0.84rem',
                            fontWeight: 750,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Leita
                    </button>
                </form>

                {active && (
                    <div style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'baseline', marginBottom: '14px' }}>
                            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 500 }}>
                                Niðurstöður
                            </h2>
                            <a href="/sermons" style={{ color: 'var(--skra-djup)', fontSize: '0.84rem', fontWeight: 700 }}>
                                Hreinsa leit
                            </a>
                        </div>
                        {results.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
                                {results.map((episode) => (
                                    <a
                                        key={episode.id}
                                        href={`/sermons/${episode.bunny_video_id}`}
                                        style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}
                                    >
                                        <article style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                                            <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: '6px', background: 'rgba(28,28,30,0.12)' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={episode.thumbnail_custom ?? `/api/bunny/thumbnail/${episode.bunny_video_id}`}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 5px', fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--skra-djup)', fontWeight: 750 }}>
                                                    {episode.series_title} · {(episode.language_primary ?? 'is').toUpperCase()}
                                                </p>
                                                <h3 style={{ margin: 0, fontSize: '1rem', lineHeight: 1.25, fontWeight: 750 }}>
                                                    {episode.title}
                                                </h3>
                                                {episode.description && (
                                                    <p style={{ margin: '6px 0 0', color: 'rgba(28,28,30,0.72)', fontSize: '0.84rem', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {episode.description}
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p style={{ margin: 0, color: 'rgba(28,28,30,0.72)' }}>
                                Engin birt myndbönd fundust fyrir þessa leit.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

const searchInputStyle: CSSProperties = {
    width: '100%',
    border: '1px solid rgba(28,28,30,0.18)',
    background: '#fffaf0',
    color: 'var(--mold)',
    borderRadius: '4px',
    padding: '12px 13px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
};
