import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getAllArticles } from "@/lib/articles-db";
import Link from "next/link";
import type { Database } from "@/types/supabase";

export const revalidate = 3600;

type Article = Database['public']['Tables']['articles']['Row'];

// ─── Mock data matching exact Supabase schema ───
const MOCK_ARTICLES: Article[] = [
  {
    id: 'a00',
    title: 'Aska — Hvers vegna fortíðin skilgreinir þig ekki',
    slug: 'aska',
    excerpt: 'Hvað ef syndir þínar eru ekki bara fyrirgefnar — heldur tortímdar svo fullkomlega að ekkert stendur eftir nema aska?',
    content: 'Allir burðast með eitthvað. Minningu sem svíður enn þegar hún skýtur upp kollinum. Lífskafla sem þú vildir óska að þú gætir endurskrifað...',
    featured_image: '/images/articles/aska.png',
    author_name: 'Omega TV',
    published_at: '2026-04-05T10:00:00Z',
    created_at: '2026-04-05T10:00:00Z',
  },
  {
    id: 'a0',
    title: 'Þú þarft ekki að vinna þér inn það sem er þegar þitt',
    slug: 'thu-tharft-ekki-ad-vinna',
    excerpt: 'Hvað ef allur sá hugsunarháttur sem segir þér að þú sért ekki að gera nóg — byggist á misskilningi?',
    content: 'Það er ákveðin byrði sem margir bera með sér — jafnvel fólk sem trúir á Guð. Og kannski sérstaklega fólk sem trúir á Guð. Þetta er þessi hljóðláta, stöðuga tilfinning um að þú sért ekki að gera nóg...',
    featured_image: '/images/articles/thu-tharft-ekki.png',
    author_name: 'Omega TV',
    published_at: '2026-04-05T08:00:00Z',
    created_at: '2026-04-05T08:00:00Z',
  },
  {
    id: 'a1',
    title: 'Tíminn er núna: Framtíð trúar á Íslandi',
    slug: 'timinn-er-nuna',
    excerpt: 'Hvernig við getum unnið saman að betra samfélagi og sterkari trú í nútímanum.',
    content: 'Ísland stendur á krossgötum. Í samfélagi sem þróast hratt þurfum við að spyrja okkur: hvert stefnir trú okkar?\\n\\nSagan kennir okkur að trúin hefur alltaf verið aflvaki breytinga. Frá kristnitöku til nútímans hefur trúin mótað menningu, siðferði og samfélag.\\n\\nEn í dag stöndum við frammi fyrir nýjum áskorunum. Tæknin breytist, samfélagið breytist, og við þurfum að finna nýjar leiðir til að miðla eldgömlu sannleikanum.\\n\\nOmega Stöðin er hluti af þessari framtíðarsýn — að nota bestu tækni samtímans til að bera von og sannleika til hvers einasta heimilis á Íslandi.',
    featured_image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&h=800&fit=crop',
    author_name: 'Omega TV',
    published_at: '2026-04-04T10:00:00Z',
    created_at: '2026-04-04T10:00:00Z',
  },
  {
    id: 'a2',
    title: 'Aflgefandi Samfélag',
    slug: 'aflgefandi-samfelag',
    excerpt: 'Samfélag sem styrkir og uppbyggir hvert annað.',
    content: 'Kristið samfélag er ekki bara sunnudagssamkoma — það er lífsstíll...',
    featured_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop',
    author_name: 'Guðrún Helga',
    published_at: '2026-04-03T10:00:00Z',
    created_at: '2026-04-03T10:00:00Z',
  },
  {
    id: 'a3',
    title: 'Að finna náð í hversdeginum',
    slug: 'nad-i-hversdeginum',
    excerpt: 'Hugvekja um náð og fyrirgefningu í dag.',
    content: 'Náðin er ekki bara hugtak — hún er reynsla...',
    featured_image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop',
    author_name: 'Jón Þór',
    published_at: '2026-04-02T10:00:00Z',
    created_at: '2026-04-02T10:00:00Z',
  },
  {
    id: 'a4',
    title: 'Bænin sem breytir öllu',
    slug: 'baenin-sem-breytir',
    excerpt: 'Hvað gerist þegar við leggjum allt í hendur Guðs?',
    content: 'Bænin er samtal við Guð — og Guð svarar alltaf...',
    featured_image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=600&h=400&fit=crop',
    author_name: 'Sigríður Anna',
    published_at: '2026-04-01T10:00:00Z',
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'a5',
    title: 'Vonin lifir — jafnvel á erfiðum tímum',
    slug: 'vonin-lifir',
    excerpt: 'Sagan af fjölskyldu sem fann ljós í myrkri.',
    content: 'Þegar allt virðist vonlaust er Guð enn að verki...',
    featured_image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop',
    author_name: 'Ólafur Helgi',
    published_at: '2026-03-30T10:00:00Z',
    created_at: '2026-03-30T10:00:00Z',
  },
  {
    id: 'a6',
    title: 'Grundvöllur trúarinnar: Hvað segir Biblían?',
    slug: 'grundvollur-truarinnar',
    excerpt: 'Einfalt inntak í grundvallaratriði kristinnar trúar.',
    content: 'Biblían er grunntexti trúarinnar og í henni finnum við svör...',
    featured_image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=400&fit=crop',
    author_name: 'Omega TV',
    published_at: '2026-03-28T10:00:00Z',
    created_at: '2026-03-28T10:00:00Z',
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl', 'ág', 'sep', 'okt', 'nóv', 'des'];
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function ArticlesPage() {
  // Merge real Supabase articles with mocks, deduplicate by slug
  let articles: Article[] = [];
  try {
    const real = await getAllArticles();
    if (real && real.length > 0) {
      const realSlugs = new Set(real.map(a => a.slug));
      const uniqueMocks = MOCK_ARTICLES.filter(m => !realSlugs.has(m.slug));
      articles = [...real, ...uniqueMocks];
    }
  } catch (e) {
    console.error("Failed to load articles:", e);
  }

  if (articles.length === 0) articles = MOCK_ARTICLES;

  // Sort by date descending
  articles.sort((a, b) => {
    const da = a.published_at ? new Date(a.published_at).getTime() : 0;
    const db = b.published_at ? new Date(b.published_at).getTime() : 0;
    return db - da;
  });

  const hero = articles[0];
  const editorial = articles.slice(1, 3);
  const grid = articles.slice(3);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════
          COMPACT MASTHEAD + BENTO EDITORIAL GRID
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        paddingTop: 'calc(64px + 3rem)',
        paddingLeft: 'var(--rail-padding)',
        paddingRight: 'var(--rail-padding)',
        paddingBottom: '1.5rem',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Masthead row — title left, description right */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
                </svg>
                <span style={{
                  color: 'var(--accent)',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                }}>
                  Omega Tímaritið
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
              }}>
                Greinar
              </h1>
            </div>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              maxWidth: '340px',
              lineHeight: 1.5,
              margin: 0,
              paddingBottom: '4px',
            }}>
              Næring fyrir andann. Lesefni um trúna, lífið og vonina.
            </p>
          </div>

          {/* Thin divider */}
          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BENTO GRID — Hero left + 2 stacked right
      ═══════════════════════════════════════════════════════════════ */}
      {hero && (
        <section style={{ padding: '0 var(--rail-padding)', marginBottom: '4rem' }}>
          <div style={{
            maxWidth: '80rem',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '1rem',
            minHeight: '560px',
          }}>
            {/* ── MAIN HERO (left, spans both rows) ── */}
            <Link
              href={`/greinar/${hero.slug}`}
              id="featured-article"
              style={{
                display: 'block',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                textDecoration: 'none',
                color: 'inherit',
                gridRow: '1 / 3',
              }}
            >
              {hero.featured_image && (
                <img
                  src={hero.featured_image}
                  alt={hero.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />

              {/* Nýjast badge */}
              <span style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                zIndex: 3,
              }}>
                ✦ Nýjast
              </span>

              {/* Content overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                zIndex: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                    Brennidepill
                  </span>
                  <span style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px', fontWeight: 600 }}>
                    {hero.published_at ? formatDate(hero.published_at) : ''}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px', fontWeight: 600 }}>
                    {estimateReadingTime(hero.content)} mín lestur
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'white',
                  fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  margin: '0 0 0.6rem',
                  maxWidth: '600px',
                }}>
                  {hero.title}
                </h2>
                {hero.excerpt && (
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    maxWidth: '480px',
                    margin: '0 0 0.75rem',
                  }}>
                    {hero.excerpt}
                  </p>
                )}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  Lesa grein
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </Link>

            {/* ── EDITORIAL PICKS (right, two stacked) ── */}
            {editorial.map((article) => (
              <Link
                key={article.id}
                href={`/greinar/${article.slug}`}
                style={{
                  display: 'block',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {article.featured_image ? (
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                  }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.08) 100%)' }} />

                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  zIndex: 2,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      {article.author_name || 'Omega TV'}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>·</span>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', fontWeight: 600 }}>
                      {estimateReadingTime(article.content)} mín
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(0.95rem, 1.5vw, 1.2rem)',
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.25,
                    letterSpacing: '-0.01em',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ARTICLE GRID — Remaining articles in editorial cards
      ═══════════════════════════════════════════════════════════════ */}
      {grid.length > 0 && (
        <section style={{ padding: '0 var(--rail-padding)', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            {/* Section divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}>
                Allar Greinar
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: '1.5rem',
            }}>
              {grid.map((article) => (
                <Link
                  key={article.id}
                  href={`/greinar/${article.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease, border-color 0.3s ease',
                  }}
                >
                  {/* Image */}
                  <div style={{
                    position: 'relative',
                    aspectRatio: '16/10',
                    overflow: 'hidden',
                    background: '#111',
                  }}>
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
                        </svg>
                      </div>
                    )}
                    {/* Soft bottom gradient */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '50%',
                      background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 100%)',
                      pointerEvents: 'none',
                    }} />
                  </div>

                  {/* Text */}
                  <div style={{ padding: '12px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        {article.author_name || 'Omega TV'}
                      </span>
                      {article.published_at && (
                        <>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>·</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600 }}>
                            {formatDate(article.published_at)}
                          </span>
                        </>
                      )}
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>·</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600 }}>
                        {estimateReadingTime(article.content)} mín
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      letterSpacing: '-0.01em',
                      margin: '0 0 6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}>
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                      }}>
                        {article.excerpt}
                      </p>
                    )}
                    {/* Read link */}
                    <div style={{ marginTop: 'auto', paddingTop: '14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: 'var(--accent)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                      }}>
                        Lesa grein
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          NEWSLETTER CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 var(--rail-padding)', marginBottom: 'var(--section-gap)' }}>
        <div style={{
          maxWidth: '56rem',
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          textAlign: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: '1rem' }}>
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <polyline points="22,7 12,13 2,7"/>
          </svg>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem',
          }}>
            Fáðu nýjar greinar í tölvupósti
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            maxWidth: '400px',
            margin: '0 auto 1.5rem',
          }}>
            Skráðu þig á fréttabréfið og fáðu uppbyggilegt lesefni beint í pósthólfið.
          </p>
          <Link
            href="/frettabref"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              background: 'var(--accent)',
              color: 'white',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'opacity 0.2s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="22,7 12,13 2,7"/>
            </svg>
            Skrá mig
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
