import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SermonPlayer from "@/components/sermon/SermonPlayer";
import ChapterList from "@/components/sermon/ChapterList";
import ThreadsSidebar from "@/components/sermon/ThreadsSidebar";
import GluggiCard from "@/components/vod/GluggiCard";
import SectionHeader from "@/components/layout/SectionHeader";
import ShareCopyLink from "@/components/sermon/ShareCopyLink";
import { getVideos, parseVideoMetadata, getBunnyVideoDetail } from "@/lib/bunny";
import { getEpisodeByBunnyId, getEpisodesInSeries, getArticleByPassage, getPrayerByPassage } from "@/lib/threads-db";
import { getBiblePassage, displayPassageIs } from "@/lib/passages";

/**
 * Sermon detail — "Horfusíða"
 *
 * The highest-impact surface on the whole site (plan §4.2).
 *
 * Structure:
 *   Player (with passage badge + caption switcher)
 *   ┌─ Left (2fr): kicker · title · speaker · editor note · synopsis · chapters
 *   └─ Right (360px): ThreadsSidebar — passage · prayer · article · next broadcast
 *   Share rail — text links only
 *   "Fleiri úr sömu seríu" — Gluggi card rail
 *
 * Data strategy: enrich the Bunny video with its matching DB episode row.
 * When the episode row exists and has a bible_ref, threads light up.
 * When it doesn't (not yet backfilled), threads show graceful empty states.
 */

export const revalidate = 60;

export async function generateStaticParams() {
  const videos = await getVideos();
  return videos.map((video) => ({ id: video.guid }));
}

/**
 * Minimal mock videos for local dev when the Bunny library is empty.
 * Mirrors the home page's MOCK_VIDEOS shape so demo sermon pages render
 * with the new design. Safe in prod — only reached when a real Bunny
 * GUID isn't found AND the ID matches a known mock pattern.
 */
const MOCK_SERMONS: Record<string, {
  title: string;
  show: string;
  thumbnail: string;
  durationSec: number;
  dateDisplay: string;
  description: string;
  bibleRef?: string;
  editorNote?: string;
  chapters?: { t: number; title: string }[];
  captions?: string[];
}> = {
  v1: {
    title: 'Trúin sem sigrar',
    show: 'Í Snertingu',
    thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&h=900&fit=crop',
    durationSec: 28 * 60,
    dateDisplay: '28. MAR',
    description: 'Dr. Charles Stanley deilir kenningu sinni um hvernig við getum treyst Guði jafnvel þegar allt virðist vonlaust og vegurinn er óljós.\n\nTrúin er ekki bara hugmynd — hún er lífsreynsla sem þroskast í gegnum reynslur. Þegar við stöndum frammi fyrir áskorunum er trúin okkar prófuð, og í þeim prófum verðum við sterkari.',
    bibleRef: 'MAT.5.3-MAT.5.10',
    editorNote: 'Þetta er þátturinn sem ég deili mest — byrjaðu hér ef þú ert nýr hjá Omega.',
    chapters: [
      { t: 0, title: 'Inngangur · Hvað er trú í raun?' },
      { t: 240, title: 'Sælir eru fátækir í anda' },
      { t: 720, title: 'Þegar prófin þyngjast' },
      { t: 1200, title: 'Saga úr Ísrael' },
      { t: 1560, title: 'Bæn saman' },
    ],
    captions: ['is', 'en'],
  },
  v2: { title: 'Kraftur bænarinnar', show: 'Bænakvöld', thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&h=900&fit=crop', durationSec: 25 * 60, dateDisplay: '25. MAR', description: 'Saman könnum við dýpt bænarinnar og hvernig hún breytir öllu.' },
  v3: { title: 'Framtíð Miðlunar', show: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&h=900&fit=crop', durationSec: 65 * 60, dateDisplay: '22. MAR', description: 'Hlutverk Omega Stöðinnar í nýrri tíð.' },
  v4: { title: 'Náð sem læknar', show: 'Í Snertingu', thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=900&fit=crop', durationSec: 30 * 60, dateDisplay: '20. MAR', description: 'Náðin opnar dyr að framtíðinni sem við höfðum þegar gefist upp á.', bibleRef: 'ROM.8.28' },
  v5: { title: 'Vonin lifir', show: 'Fræðsla', thumbnail: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=1600&h=900&fit=crop', durationSec: 27 * 60, dateDisplay: '18. MAR', description: 'Vonin er ekki bara ósk — hún er viss vissa um eitthvað betra.', bibleRef: 'PHP.4.6-PHP.4.7' },
  v6: { title: 'Guðs áætlun fyrir þig', show: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=900&fit=crop', durationSec: 55 * 60, dateDisplay: '15. MAR', description: 'Guð hefur áætlun.' },
  v7: { title: 'Bænin breytir öllu', show: 'Bænakvöld', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop', durationSec: 40 * 60, dateDisplay: '12. MAR', description: 'Bænin breytir fyrst og fremst okkur sjálfum.', bibleRef: 'JHN.3.16' },
  v8: { title: 'Friður í storminum', show: 'Í Snertingu', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&h=900&fit=crop', durationSec: 32 * 60, dateDisplay: '10. MAR', description: 'Hvernig við finnum frið í miðjum stormi lífsins.', bibleRef: 'PSA.23' },
};

export default async function SermonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Pull the video from Bunny
  const videos = await getVideos();
  const video = videos.find(v => v.guid === id);
  const mock = !video ? MOCK_SERMONS[id] : null;
  const isMock = !video && !!mock;

  if (!video && !mock) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--mold)', color: 'var(--ljos)' }}>
        <Navbar />
        <section style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--rail-padding)',
          textAlign: 'center',
        }}>
          <p className="type-merki" style={{ color: 'var(--steinn)', marginBottom: '18px' }}>404</p>
          <h1 className="type-kveda" style={{ margin: 0, marginBottom: '12px' }}>
            Myndband fannst ekki
          </h1>
          <p className="type-lestur" style={{ color: 'var(--moskva)', margin: 0, marginBottom: '24px', maxWidth: '40ch' }}>
            Þetta myndband er ekki til eða hefur verið fjarlægt úr safninu.
          </p>
          <Link href="/sermons" className="type-merki muted-link" style={{ textDecoration: 'none' }}>
            ← Til baka í þáttasafn
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  const bunnyMeta = video
    ? parseVideoMetadata(video)
    : {
        title: mock!.title,
        show: mock!.show,
        dateDisplay: mock!.dateDisplay,
        category: 'Almennt',
        thumbnail: mock!.thumbnail,
      };
  const durationSec = video ? video.length : mock!.durationSec;
  const durationMin = Math.floor(durationSec / 60);

  // 2. Pull the matching DB row (may be null — sermon not yet connected)
  // + fresh Bunny detail (captions + chapters if Bunny has them).
  const [episode, bunnyDetail] = await Promise.all([
    video ? getEpisodeByBunnyId(video.guid) : Promise.resolve(null),
    video ? getBunnyVideoDetail(video.guid) : Promise.resolve(null),
  ]);

  // The DB row is the source of truth — it carries the reviewed,
  // Gemini-or-human title/description, the joined series (which gives us
  // the show name we want to render), the published_at date, and the
  // editor-chosen thumbnail. Bunny metadata is the fallback for episodes
  // that haven't been reviewed yet (just uploaded, no draft row written).
  const dbDate = episode?.published_at
    ? new Date(episode.published_at).toLocaleDateString('is-IS', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const meta = {
    ...bunnyMeta,
    title: episode?.title ?? bunnyMeta.title,
    show: episode?.series?.title ?? bunnyMeta.show,
    dateDisplay: dbDate ?? bunnyMeta.dateDisplay,
    thumbnail: episode?.thumbnail_custom ?? bunnyMeta.thumbnail,
  };
  const bibleRef = episode?.bible_ref ?? mock?.bibleRef ?? null;
  const editorNote = episode?.editor_note ?? mock?.editorNote ?? null;
  const description = episode?.description ?? mock?.description ?? null;

  // Caption tracks — prefer live Bunny data, fall back to what's stored on episode,
  // fall back again to the mock shape in dev so the switcher has something to show.
  const bunnyCaptions = bunnyDetail?.captions
    ?? (mock?.captions ?? []).map(code => ({
      srclang: code,
      label: code === 'is' ? 'Íslenska' : code === 'en' ? 'English' : code.toUpperCase(),
      url: '',
    }));
  const captionCodes = bunnyCaptions.length > 0
    ? bunnyCaptions.map(c => c.srclang)
    : (episode?.captions_available ?? mock?.captions ?? []);

  // Chapters — prefer the episode's own chapters jsonb, fall back to Bunny's,
  // fall back to mock chapters in dev.
  const chapters = (episode?.chapters && episode.chapters.length > 0)
    ? episode.chapters
    : (bunnyDetail?.chapters ?? []).length > 0
      ? (bunnyDetail?.chapters ?? []).map(c => ({ t: c.start, title: c.title }))
      : (mock?.chapters ?? []);

  // 3. Threads — only query if we have a passage anchor.
  const [passage, prayer, article] = await Promise.all([
    bibleRef ? getBiblePassage(bibleRef) : Promise.resolve(null),
    bibleRef ? getPrayerByPassage(bibleRef) : Promise.resolve(null),
    bibleRef ? getArticleByPassage(bibleRef) : Promise.resolve(null),
  ]);

  // 4. Related rail — series siblings from DB, fallback to Bunny-parsed siblings.
  let related: {
    id: string;
    title: string;
    show?: string | null;
    durationMin?: number | null;
    dateDisplay?: string | null;
    thumbnail: string;
    editorNote?: string | null;
    captions?: string[] | null;
  }[] = [];

  if (episode?.series_id) {
    const seriesEps = await getEpisodesInSeries(episode.series_id, episode.id, 4);
    related = seriesEps
      .filter(e => e.bunny_video_id)
      .map(e => ({
        id: e.bunny_video_id as string,
        title: e.title,
        show: meta.show,
        durationMin: e.duration ? Math.floor(e.duration / 60) : null,
        dateDisplay: e.published_at
          ? new Date(e.published_at).toLocaleDateString('is-IS', { day: 'numeric', month: 'short' })
          : null,
        thumbnail: e.thumbnail_custom || `https://iframe.mediadelivery.net/thumbnail/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${e.bunny_video_id}/thumbnail.jpg`,
        editorNote: e.editor_note,
        captions: e.captions_available,
      }));
  }

  if (related.length === 0) {
    // Fallback: siblings by show name from Bunny
    related = videos
      .filter(v => v.guid !== id && parseVideoMetadata(v).show === meta.show)
      .slice(0, 4)
      .map(v => {
        const vm = parseVideoMetadata(v);
        return {
          id: v.guid,
          title: vm.title,
          show: vm.show,
          durationMin: Math.floor(v.length / 60),
          dateDisplay: vm.dateDisplay,
          thumbnail: vm.thumbnail,
          editorNote: null,
          captions: null,
        };
      });
  }

  if (related.length === 0 && isMock) {
    // Last-resort fallback for dev: sibling mocks from the same show
    related = Object.entries(MOCK_SERMONS)
      .filter(([mid, m]) => mid !== id && m.show === meta.show)
      .slice(0, 4)
      .map(([mid, m]) => ({
        id: mid,
        title: m.title,
        show: m.show,
        durationMin: Math.floor(m.durationSec / 60),
        dateDisplay: m.dateDisplay,
        thumbnail: m.thumbnail,
        editorNote: m.editorNote ?? null,
        captions: m.captions ?? null,
      }));
  }

  // Build the kicker line: "SHOW · 28 MÍN · 3. APR · CC IS/EN"
  const kickerParts: string[] = [];
  if (meta.show) kickerParts.push(meta.show);
  if (meta.dateDisplay) kickerParts.push(meta.dateDisplay);
  kickerParts.push(`${durationMin} mín`);
  if (captionCodes.length > 0) kickerParts.push(`CC · ${captionCodes.map(c => c.toUpperCase()).join('/')}`);
  const passageDisplay = displayPassageIs(bibleRef);
  if (passageDisplay) kickerParts.unshift(passageDisplay);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--mold)', color: 'var(--ljos)' }}>
      <Navbar />

      {/* ═══ PLAYER ═══ */}
      <div
        style={{
          paddingTop: '72px',  /* navbar offset */
          background: 'var(--nott)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <SermonPlayer
            videoId={id}
            libraryId={process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID ?? ''}
            title={meta.title}
            bibleRef={bibleRef}
            captions={bunnyCaptions}
            defaultCaptionLang={episode?.language_primary ?? 'is'}
            posterUrl={meta.thumbnail}
            isMock={isMock}
          />
        </div>
      </div>

      {/* ═══ DETAIL BODY ═══ */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(2rem, 4vw, 3.5rem) var(--rail-padding)',
        }}
      >
        <div className="detail-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'clamp(2rem, 4vw, 3.5rem)',
        }}>
          {/* ─── Left: story column ──────────────────────────────── */}
          <div>
            {/* Kicker line — passage · show · duration · date · CC */}
            <p
              className="type-merki ink-arrive"
              style={{
                color: 'var(--moskva)',
                margin: 0,
                marginBottom: 'clamp(14px, 1.6vw, 20px)',
                letterSpacing: '0.22em',
                fontSize: '0.7rem',
              }}
            >
              {kickerParts.join(' · ')}
            </p>

            {/* Title — Editorial H1 weight (400), Newsreader, balanced
                with the player above so it doesn't compete. */}
            <h1
              className="ink-arrive-delay-1"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                color: 'var(--ljos)',
                fontSize: 'clamp(1.9rem, 4vw, 2.9rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.018em',
                margin: 0,
                marginBottom: 'clamp(10px, 1.4vw, 16px)',
                textWrap: 'balance',
              }}
            >
              {meta.title}
            </h1>

            {/* Speaker / host line */}
            <p
              className="ink-arrive-delay-2"
              style={{
                margin: 0,
                marginBottom: 'clamp(20px, 2.4vw, 28px)',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--moskva)',
                fontSize: '1.02rem',
                lineHeight: 1.5,
              }}
            >
              {meta.show}
            </p>

            {/* Gold rule — matches the masthead byline-rule on every other
                editorial page; gives this page the same cathedral spine. */}
            <div
              aria-hidden
              style={{
                width: '52px',
                height: '1px',
                background: 'var(--gull)',
                margin: '0 0 clamp(26px, 3vw, 34px)',
              }}
            />

            {/* Editor's note — shown only when present */}
            {editorNote && (
              <blockquote
                style={{
                  margin: '0 0 clamp(24px, 3vw, 32px)',
                  padding: 'clamp(18px, 2vw, 24px) clamp(22px, 2.4vw, 28px)',
                  background: 'var(--torfa)',
                  borderLeft: '2px solid var(--kerti)',
                  borderRadius: '0 2px 2px 0',
                }}
              >
                <p className="type-merki" style={{ color: 'var(--kerti)', margin: 0, marginBottom: '10px', letterSpacing: '0.2em' }}>
                  Ritstjórn
                </p>
                <p
                  className="type-tilvisun"
                  style={{
                    margin: 0,
                    color: 'var(--ljos)',
                    fontSize: '1.1rem',
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                  }}
                >
                  {editorNote}
                </p>
              </blockquote>
            )}

            {/* Synopsis */}
            {description && (
              <div style={{ maxWidth: '65ch' }}>
                {description.split('\n\n').map((p, i) => (
                  <p
                    key={i}
                    style={{
                      margin: 0,
                      marginBottom: '1.2rem',
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--moskva)',
                      fontSize: '1.06rem',
                      lineHeight: 1.75,
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}

            {/* Chapters */}
            {chapters && chapters.length > 0 && <ChapterList chapters={chapters} />}

            {/* Share rail — text links only */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 'clamp(16px, 2vw, 28px)',
                marginTop: 'clamp(2rem, 3vw, 2.5rem)',
                paddingTop: 'clamp(1.5rem, 2vw, 2rem)',
                borderTop: '1px solid var(--border)',
              }}
            >
              <p className="type-merki" style={{ color: 'var(--moskva)', margin: 0, letterSpacing: '0.2em' }}>
                Deila
              </p>
              <a
                href={`mailto:?subject=${encodeURIComponent(meta.title + ' — Omega')}&body=${encodeURIComponent(`https://omega.is/sermons/${id}`)}`}
                className="type-merki muted-link"
                style={{ textDecoration: 'none', letterSpacing: '0.18em', fontSize: '0.7rem' }}
              >
                Senda með tölvupósti
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://omega.is/sermons/${id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="type-merki muted-link"
                style={{ textDecoration: 'none', letterSpacing: '0.18em', fontSize: '0.7rem' }}
              >
                Deila á Facebook
              </a>
              <ShareCopyLink url={`https://omega.is/sermons/${id}`} />
            </div>
          </div>

          {/* ─── Right: threads sidebar ─────────────────────────── */}
          <ThreadsSidebar
            bibleRef={bibleRef}
            passage={passage}
            prayer={prayer}
            article={article}
          />
        </div>
      </div>

      {/* ═══ "FLEIRI ÚR SÖMU SERÍU" ═══ */}
      {related.length > 0 && (
        <section
          style={{
            padding: 'clamp(3rem, 5vw, 4.5rem) var(--rail-padding) clamp(4rem, 6vw, 5.5rem)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <SectionHeader title={`Fleiri úr ${meta.show}`} href="/sermons" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                gap: 'clamp(1rem, 2vw, 1.5rem)',
              }}
            >
              {related.map(r => (
                <GluggiCard
                  key={r.id}
                  href={`/sermons/${r.id}`}
                  thumbnail={r.thumbnail}
                  title={r.title}
                  show={r.show}
                  durationMin={r.durationMin}
                  dateDisplay={r.dateDisplay}
                  editorNote={r.editorNote}
                  captions={r.captions}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Responsive grid — sidebar stacks below on mobile, sits beside on desktop */}
      <style>{`
        @media (min-width: 980px) {
          .detail-grid {
            grid-template-columns: minmax(0, 1fr) 360px !important;
          }
        }
      `}</style>
    </main>
  );
}

