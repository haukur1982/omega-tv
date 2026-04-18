import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Legacy34YearsComponent from "@/components/home/Legacy34Years";
import Footer from "@/components/layout/Footer";
import HorizontalRail from "@/components/layout/HorizontalRail";
import SectionHeader from "@/components/layout/SectionHeader";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import VODRailCard from "@/components/vod/VODRailCard";
// import CourseRailCard from "@/components/courses/CourseRailCard"; // Hidden until courses are ready
import PortraitSermonCard from "@/components/vod/PortraitSermonCard";
import MagazineArticleCard from "@/components/articles/MagazineArticleCard";
import DagskraStrip from "@/components/home/DagskraStrip";
import PrayerPresence from "@/components/home/PrayerPresence";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles-db";
import { getCurrentFeaturedWeek } from "@/lib/featured-db";
// import { getAllCourses } from "@/lib/courses-db"; // Hidden until courses are ready

export const revalidate = 60;

// ─── Mock Data — reliable Unsplash URLs ─────────────────────────────

const MOCK_VIDEOS = [
  { id: 'v1', title: 'Trúin sem sigrar', speaker: 'Í Snertingu', duration: '28', thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=640&h=360&fit=crop', date: '2026-03-28' },
  { id: 'v2', title: 'Kraftur bænarinnar', speaker: 'Bænakvöld', duration: '25', thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=640&h=360&fit=crop', date: '2026-03-25' },
  { id: 'v3', title: 'Framtíð Miðlunar', speaker: 'Sunnudagssamkoma', duration: '65', thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=640&h=360&fit=crop', date: '2026-03-22' },
  { id: 'v4', title: 'Náð sem læknar', speaker: 'Í Snertingu', duration: '30', thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=640&h=360&fit=crop', date: '2026-03-20' },
  { id: 'v5', title: 'Vonin lifir', speaker: 'Fræðsla', duration: '27', thumbnail: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=640&h=360&fit=crop', date: '2026-03-18' },
  { id: 'v6', title: 'Guðs áætlun fyrir þig', speaker: 'Sunnudagssamkoma', duration: '55', thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=640&h=360&fit=crop', date: '2026-03-15' },
  { id: 'v7', title: 'Bænin breytir öllu', speaker: 'Bænakvöld', duration: '40', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=640&h=360&fit=crop', date: '2026-03-12' },
  { id: 'v8', title: 'Friður í storminum', speaker: 'Í Snertingu', duration: '32', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=640&h=360&fit=crop', date: '2026-03-10' },
];

const MOCK_COURSES = [
  { id: 'c1', slug: 'kristin-throun', title: 'Að vaxa í trúinni: Meistaraklass', description: 'Djúp kafa í andagift og biblíulestur með færustu kennurum.', poster_horizontal: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=760&h=428&fit=crop' },
  { id: 'c2', slug: 'baenin', title: 'Skóli Bænarinnar', description: 'Lærðu hvernig þú nærð dýpri tengingu við Guð.', poster_horizontal: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=760&h=428&fit=crop' },
  { id: 'c3', slug: 'gamla', title: 'Gamla Testamentið', description: 'Sagan skýrð frá upphafi til enda.', poster_horizontal: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=760&h=428&fit=crop' },
  { id: 'c4', slug: 'leidtogathjalfun', title: 'Leiðtogaþjálfun', description: 'Hvernig á að leiða með þjónustu og auðmýkt.', poster_horizontal: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=760&h=428&fit=crop' },
  { id: 'c5', slug: 'fjolskyldan', title: 'Heilbrigt fjölskyldulíf', description: 'Byggðu sterkt heimili á traustum grunni.', poster_horizontal: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=760&h=428&fit=crop' },
  { id: 'c6', slug: 'bodskapur', title: 'Boðskapur og þjóðernir', description: 'Sendingarálit og hlutverk kirkjunnar í heiminum.', poster_horizontal: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=760&h=428&fit=crop' },
];

const MOCK_PORTRAIT_SERMONS = [
  { id: 's1', title: 'Gleði Drottins', speaker: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=400&h=600&fit=crop' },
  { id: 's2', title: 'Kærleikur án skilyrða', speaker: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop' },
  { id: 's3', title: 'Breyting innan frá', speaker: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=600&fit=crop' },
  { id: 's4', title: 'Frelsi í Kristi', speaker: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&h=600&fit=crop' },
  { id: 's5', title: 'Ný byrjun', speaker: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=600&fit=crop' },
  { id: 's6', title: 'Þakklæti', speaker: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=600&fit=crop' },
  { id: 's7', title: 'Vonin uppi á móti', speaker: 'Sunnudagssamkoma', thumbnail: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=600&fit=crop' },
];

const MOCK_ARTICLES = [
  { id: 'a1', slug: 'fyrirlestur-omkar', title: 'Tíminn er núna: Framtíð trúar á Íslandi', excerpt: 'Hvernig við getum unnið saman að betra samfélagi.', published_at: new Date().toISOString(), featured_image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1400&h=875&fit=crop' },
  { id: 'a2', slug: 'samfelag', title: 'Aflgefandi Samfélag', excerpt: 'Samfélag sem styrkir og uppbyggir hvert annað.', published_at: new Date().toISOString(), featured_image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=400&fit=crop' },
  { id: 'a3', slug: 'nad-guds', title: 'Að finna náð í hversdeginum', excerpt: 'Hugvekja um náð og fyrirgefningu í dag.', published_at: new Date().toISOString(), featured_image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop' },
];

// ─── Shared style constants ─────────────────────────────────────────

const SECTION_STYLE: React.CSSProperties = {
  maxWidth: '80rem',
  margin: '0 auto',
  padding: '0 var(--rail-padding)',
};

// ─── Page ───────────────────────────────────────────────────────────

export default async function Home() {
  const latestVideos = await getVideos(1, 8);

  let latestArticles: any[] = [];
  let featuredWeek = null;
  // let latestCourses: any[] = []; // Hidden until courses are ready
  try {
    latestArticles = await getAllArticles() || [];
    // latestCourses = await getAllCourses() || []; // Hidden until courses are ready
  } catch (e) {
    console.error("Supabase data missing/empty", e);
  }
  try {
    featuredWeek = await getCurrentFeaturedWeek();
  } catch (e) {
    console.error("featured_weeks table not reachable (migration not run yet?)", e);
  }

  const videos = latestVideos.length > 0
    ? latestVideos.slice(0, 8).map((v) => {
        const meta = parseVideoMetadata(v);
        return { id: v.guid, title: meta.title, speaker: meta.show, duration: Math.floor(v.length / 60).toString(), thumbnail: meta.thumbnail, date: v.date };
      })
    : MOCK_VIDEOS;

  // const courses = latestCourses.length > 0 ? latestCourses : MOCK_COURSES; // Hidden until courses are ready
  const articles = latestArticles.length > 0 ? latestArticles : MOCK_ARTICLES;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)' }}>
      <Navbar />
      <Hero feature={featuredWeek} />

      <div style={{ position: 'relative', zIndex: 20, marginTop: '-2rem' }}>

        {/* ═══════════════════════════════════════════════════════════
            DAGSKRÁIN — Broadcast-aware strip (Núna · Næst · Seinna)
            ═══════════════════════════════════════════════════════════ */}
        <DagskraStrip />

        {/* ═══════════════════════════════════════════════════════════
            SAMFÉLAG Í BÆN — recent broadcast prayers
            ═══════════════════════════════════════════════════════════ */}
        <PrayerPresence />

        {/* ═══════════════════════════════════════════════════════════
            ROW 1 — NÝTT EFNI (Latest Videos)
            ═══════════════════════════════════════════════════════════ */}
        <section style={{ ...SECTION_STYLE, paddingTop: 'clamp(2rem, 4vw, 3rem)' }}>
          <SectionHeader title="Nýtt efni" href="/sermons" />
          <HorizontalRail>
            {videos.map((v) => (
              <VODRailCard key={v.id} video={v} />
            ))}
          </HorizontalRail>
        </section>

        {/* ROW 2 — VINSÆL NÁMSKEIÐ — Hidden until courses are ready
        <section style={{ ...SECTION_STYLE, paddingTop: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <SectionHeader title="Vinsæl Námskeið" href="/namskeid" />
          <HorizontalRail>
            {courses.map((c: any) => (
              <CourseRailCard key={c.id} course={c} />
            ))}
          </HorizontalRail>
        </section>
        */}

        {/* ═══════════════════════════════════════════════════════════
            ROW 3 — SUNNUDAGSSAMKOMUR (Sunday Services)
            Portrait 2:3 poster cards
            ═══════════════════════════════════════════════════════════ */}
        <section style={{ ...SECTION_STYLE, paddingTop: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <SectionHeader title="Sunnudagssamkomur" href="/sermons" />
          <HorizontalRail>
            {MOCK_PORTRAIT_SERMONS.map((s) => (
              <PortraitSermonCard key={s.id} sermon={s} />
            ))}
          </HorizontalRail>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ROW 4 — OMEGA TÍMARITIÐ (Editorial / Magazine)
            ═══════════════════════════════════════════════════════════ */}
        {articles.length > 0 && (
          <section style={{
            ...SECTION_STYLE,
            paddingTop: 'clamp(3rem, 6vw, 5rem)',
            paddingBottom: 'clamp(2rem, 4vw, 3rem)',
          }}>
            <SectionHeader
              title="Omega Tímaritið"
              href="/greinar"
              linkLabel="Öll Greinasöfn"
              serif
              accentLink
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1.5rem',
                overflow: 'hidden',
              }}
              className="editorial-grid"
            >
              {articles[0] && (
                <MagazineArticleCard article={articles[0]} isHero={true} index={0} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                {articles.slice(1, 3).map((art: any, idx: number) => (
                  <MagazineArticleCard key={art.id} article={art} isHero={false} index={idx + 1} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            STYRKJA RIBBON — one line, one button.
            Replaces the old 3-card Prayer/Newsletter/Give CTA row.
            See plan §4.1 row 7: editorial tone, not a merchandise shelf.
            ═══════════════════════════════════════════════════════════ */}
        <section style={{ ...SECTION_STYLE, paddingTop: 'clamp(3rem, 6vw, 5rem)', paddingBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'clamp(16px, 2vw, 28px)',
              padding: 'clamp(22px, 3vw, 36px) clamp(22px, 3vw, 40px)',
              background: 'var(--torfa)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div style={{ flex: '1 1 420px', minWidth: 0 }}>
              <p className="type-merki" style={{ color: 'var(--kerti)', margin: 0, marginBottom: '10px' }}>
                Styrkja Omega
              </p>
              <p
                className="type-lestur"
                style={{
                  color: 'var(--moskva)',
                  margin: 0,
                  maxWidth: '56ch',
                  fontSize: 'clamp(1rem, 1.15vw, 1.125rem)',
                  lineHeight: 1.6,
                }}
              >
                Omega er rekið af gjöfum — styðjið mánaðarlega til að halda útsendingunum gangandi.
              </p>
            </div>
            <Link
              href="/give"
              className="warm-hover"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 26px',
                borderRadius: '2px',
                background: 'var(--kerti)',
                color: 'var(--nott)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.01em',
                textDecoration: 'none',
                border: '1px solid var(--kerti)',
                flexShrink: 0,
              }}
            >
              Gefa mánaðarlega
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ROW 6 — LEGACY (34 Years)
            ═══════════════════════════════════════════════════════════ */}
        <Legacy34YearsComponent />

      </div>

      <Footer />
    </main>
  );
}
