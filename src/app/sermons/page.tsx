import Navbar from "@/components/layout/Navbar";
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
    type SeriesWithLatest,
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

function withMockFallback(
    real: SeriesWithLatest[],
    category: keyof typeof MOCK_SERIES_BY_CATEGORY,
): SeriesWithLatest[] {
    return real.length > 0 ? real : (MOCK_SERIES_BY_CATEGORY[category] ?? []);
}

export default async function SermonsPage() {
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
