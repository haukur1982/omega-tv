import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import Link from "next/link";

export const revalidate = 60;

/* ═══════════════════════════════════════════════
   MOCK DATA — Organized by show/series
   ═══════════════════════════════════════════════ */

interface Episode {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  show: string;
  episode: string;
  description: string;
}

interface ShowRow {
  title: string;
  style: 'landscape' | 'portrait';
  episodes: Episode[];
}

const SHOWS: ShowRow[] = [
  {
    title: "Nýlega bætt við",
    style: "landscape",
    episodes: [
      { id: "m1", title: "Trúin sem sigrar", thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=720&h=405&fit=crop", duration: 28, show: "Í Snertingu", episode: "Þ. 12", description: "Hvernig trúin getur sigrað á erfiðustu aðstæðum." },
      { id: "m2", title: "Kraftur bænarinnar", thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=720&h=405&fit=crop", duration: 25, show: "Bænakvöld", episode: "Þ. 8", description: "Bænin er öflugasta vopnið okkar." },
      { id: "m3", title: "Framtíð Miðlunar", thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=720&h=405&fit=crop", duration: 65, show: "Sunnudagssamkoma", episode: "31. mars", description: "Framtíð kristinnar miðlunar á Íslandi." },
      { id: "m4", title: "Náð sem læknar", thumbnail: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=720&h=405&fit=crop", duration: 30, show: "Í Snertingu", episode: "Þ. 11", description: "Guðs náð er nóg — alltaf." },
      { id: "m5", title: "Vonin lifir", thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=720&h=405&fit=crop", duration: 27, show: "Fræðsla", episode: "Þ. 3", description: "Þegar allt virðist vonlaust er Guð enn að verki." },
    ],
  },
  {
    title: "Í Snertingu",
    style: "portrait",
    episodes: [
      { id: "m6", title: "Trúin sem sigrar", thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&h=600&fit=crop", duration: 28, show: "Í Snertingu", episode: "Þ. 12", description: "Hvernig trúin getur sigrað á erfiðustu aðstæðum." },
      { id: "m7", title: "Kraftur fyrirgefningarinnar", thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=600&fit=crop", duration: 30, show: "Í Snertingu", episode: "Þ. 10", description: "Fyrirgefning er lykillinn að frelsi." },
      { id: "m8", title: "Guðs áætlun", thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=600&fit=crop", duration: 32, show: "Í Snertingu", episode: "Þ. 9", description: "Guð hefur áætlun fyrir líf þitt." },
      { id: "m9", title: "Friður í storminum", thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop", duration: 28, show: "Í Snertingu", episode: "Þ. 8", description: "Hvernig við finnum frið í miðjum stormi lífsins." },
      { id: "m10", title: "Styrkur í veikleika", thumbnail: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=600&fit=crop", duration: 26, show: "Í Snertingu", episode: "Þ. 7", description: "Þegar við erum veikust er Guð sterkastur." },
      { id: "m11", title: "Vonin uppi á móti", thumbnail: "https://images.unsplash.com/photo-1509225770129-c9951ab42a9d?w=400&h=600&fit=crop", duration: 29, show: "Í Snertingu", episode: "Þ. 6", description: "Von sem situr djúpt og endist." },
      { id: "m12", title: "Bænin breytir öllu", thumbnail: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=400&h=600&fit=crop", duration: 31, show: "Í Snertingu", episode: "Þ. 5", description: "Dýpt bænarinnar og hvernig hún breytir öllu." },
    ],
  },
  {
    title: "Sunnudagssamkoma",
    style: "landscape",
    episodes: [
      { id: "m13", title: "Framtíð Miðlunar", thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=720&h=405&fit=crop", duration: 65, show: "Sunnudagssamkoma", episode: "31. mars", description: "Framtíð kristinnar miðlunar á Íslandi." },
      { id: "m14", title: "Gleði Drottins", thumbnail: "https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=720&h=405&fit=crop", duration: 58, show: "Sunnudagssamkoma", episode: "24. mars", description: "Gleðin í Drottni er styrkur okkar." },
      { id: "m15", title: "Kærleikur án skilyrða", thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=720&h=405&fit=crop", duration: 62, show: "Sunnudagssamkoma", episode: "17. mars", description: "Guðs kærleikur er án skilyrða og takmarkana." },
      { id: "m16", title: "Breyting innan frá", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=720&h=405&fit=crop", duration: 55, show: "Sunnudagssamkoma", episode: "10. mars", description: "Sannur árangur byrjar innra með okkur." },
      { id: "m17", title: "Frelsi í Kristi", thumbnail: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=720&h=405&fit=crop", duration: 60, show: "Sunnudagssamkoma", episode: "3. mars", description: "Hvað þýðir sannfrelsi í Kristi?" },
    ],
  },
  {
    title: "Bænakvöld",
    style: "portrait",
    episodes: [
      { id: "m20", title: "Bæn fyrir Íslandi", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=600&fit=crop", duration: 45, show: "Bænakvöld", episode: "Þ. 20", description: "Saman biðjum við fyrir þjóðinni okkar." },
      { id: "m21", title: "Bæn fyrir fjölskyldunni", thumbnail: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&h=600&fit=crop", duration: 40, show: "Bænakvöld", episode: "Þ. 19", description: "Fjölskyldan er grundvöllur samfélagsins." },
      { id: "m22", title: "Bæn fyrir kirkjunni", thumbnail: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=600&fit=crop", duration: 38, show: "Bænakvöld", episode: "Þ. 18", description: "Kirkjan á Íslandi þarfnast vakningu." },
      { id: "m23", title: "Bæn fyrir Ísrael", thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop", duration: 42, show: "Bænakvöld", episode: "Þ. 17", description: "Ísrael — einstaklegt land, einstaklegt fólk." },
      { id: "m24", title: "Bæn um leiðsögn", thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400&h=600&fit=crop", duration: 35, show: "Bænakvöld", episode: "Þ. 16", description: "Hvernig heyrum við rödd Guðs?" },
      { id: "m25b", title: "Bæn um heilun", thumbnail: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&h=600&fit=crop", duration: 44, show: "Bænakvöld", episode: "Þ. 15", description: "Guð er enn læknarinn okkar." },
    ],
  },
  {
    title: "Fræðsla",
    style: "landscape",
    episodes: [
      { id: "m25", title: "Grundvallaratriði trúarinnar", thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=720&h=405&fit=crop", duration: 35, show: "Fræðsla", episode: "Þ. 1", description: "Hvað þýðir það í raun að trúa?" },
      { id: "m26", title: "Biblían á auðveldan hátt", thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=720&h=405&fit=crop", duration: 28, show: "Fræðsla", episode: "Þ. 2", description: "Einfalt inntak í heilaga ritningu." },
      { id: "m27", title: "Heilagur Andi", thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=720&h=405&fit=crop", duration: 33, show: "Fræðsla", episode: "Þ. 4", description: "Persóna og verk Heilags Anda." },
      { id: "m28", title: "Bænin sem breytir", thumbnail: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=720&h=405&fit=crop", duration: 30, show: "Fræðsla", episode: "Þ. 5", description: "Hvernig bænin breytir innra með okkur." },
      { id: "m29", title: "Trúarjátningin", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=720&h=405&fit=crop", duration: 42, show: "Fræðsla", episode: "Þ. 6", description: "Hvað fólst í fyrstu trúarjátningunni?" },
    ],
  },
];

const HERO = {
  id: "m1",
  title: "Trúin sem sigrar",
  show: "Í Snertingu",
  episode: "Þáttur 12",
  description: "Í þessum þætti ræðum við um hvernig trúin getur sigrað á erfiðustu aðstæðum. Guð er trúr — jafnvel þegar við erum ekki.",
  thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&h=900&fit=crop",
  duration: 28,
};

export default async function SermonsPage() {
  const videos = await getVideos(1, 100);
  const hasRealContent = videos.length > 0;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
      <Navbar />

      {/* ═══ CINEMATIC HERO BILLBOARD ═══ */}
      <section style={{
        position: 'relative',
        height: '90vh',
        maxHeight: '800px',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}>
        <img
          src={HERO.thumbnail}
          alt={HERO.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Bottom fade — deep & cinematic */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-deep) 0%, rgba(28,28,30,0.7) 35%, rgba(28,28,30,0.2) 60%, transparent 100%)' }} />
        {/* Left vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(28,28,30,0.8) 0%, rgba(28,28,30,0.35) 25%, transparent 55%)' }} />
        {/* Top navbar fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(28,28,30,0.7) 0%, transparent 15%)' }} />

        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 var(--rail-padding) clamp(4rem, 8vh, 6rem)',
        }}>
          {/* Show name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: 'var(--accent)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent)"><polygon points="6,3 20,12 6,21" /></svg>
              Þáttaröð
            </span>
            <span style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em' }}>
              {HERO.show}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            maxWidth: '600px',
            margin: '0 0 1rem',
          }}>
            {HERO.title}
          </h1>

          {/* Description */}
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
            lineHeight: 1.6,
            maxWidth: '480px',
            margin: '0 0 0.5rem',
          }}>
            {HERO.description}
          </p>

          {/* Meta */}
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            margin: '0 0 1.5rem',
          }}>
            2026 · {HERO.episode} · {HERO.duration} mín
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href={`/sermons/${HERO.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'white',
                color: '#1C1C1E',
                padding: '14px 32px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1C1C1E"><polygon points="6,3 20,12 6,21" /></svg>
              Horfa
            </Link>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Um þáttaröðina
            </button>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT ROWS ═══ */}
      <div style={{ position: 'relative', zIndex: 20, paddingTop: '1rem', paddingBottom: '2rem' }}>
        {SHOWS.map((row, rowIdx) => (
          <section
            key={row.title}
            style={{
              padding: `clamp(1.5rem, 3vw, 2.5rem) var(--rail-padding)`,
              maxWidth: '80rem',
              margin: '0 auto',
            }}
          >
            {/* Section header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                margin: 0,
              }}>
                {row.title}
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--accent)',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                cursor: 'pointer',
              }}>
                Sjá allt
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
              </span>
            </div>

            {/* Divider */}
            <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: 'clamp(1rem, 2vw, 1.5rem)' }} />

            {row.style === 'landscape' ? (
              /* ─── LANDSCAPE ROW ─── */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                gap: 'clamp(1rem, 2vw, 1.5rem)',
              }}>
                {row.episodes.map((ep) => (
                  <Link href={`/sermons/${ep.id}`} key={ep.id} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease, border-color 0.3s',
                    }}>
                      {/* Thumbnail */}
                      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                        <img
                          src={ep.thumbnail}
                          alt={ep.title}
                          loading={rowIdx === 0 ? 'eager' : 'lazy'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.6s ease',
                          }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)', pointerEvents: 'none' }} />

                        {/* Play button center */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.7,
                          transition: 'opacity 0.3s',
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(6px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '2px' }}><polygon points="6,3 20,12 6,21" /></svg>
                          </div>
                        </div>

                        {/* Duration */}
                        <span style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.75)',
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 7px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                        }}>
                          {ep.duration} mín
                        </span>
                      </div>

                      {/* Text */}
                      <div style={{ padding: '14px 16px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            {ep.show}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>·</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600 }}>
                            {ep.episode}
                          </span>
                        </div>
                        <h3 style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          lineHeight: 1.3,
                          margin: '0 0 4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {ep.title}
                        </h3>
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.4,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {ep.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* ─── PORTRAIT ROW — Horizontal scroll ─── */
              <div style={{
                display: 'flex',
                gap: 'clamp(0.75rem, 1.5vw, 1.25rem)',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                paddingBottom: '0.5rem',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}>
                {row.episodes.map((ep) => (
                  <Link
                    href={`/sermons/${ep.id}`}
                    key={ep.id}
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      color: 'inherit',
                      flexShrink: 0,
                      width: 'clamp(140px, 18vw, 180px)',
                      scrollSnapAlign: 'start',
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      aspectRatio: '2/3',
                      overflow: 'hidden',
                      borderRadius: '12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease',
                    }}>
                      <img
                        src={ep.thumbnail}
                        alt={ep.title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.6s ease',
                        }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', pointerEvents: 'none' }} />

                      {/* Bottom info on card */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px' }}>
                        <p style={{
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 700,
                          lineHeight: 1.25,
                          margin: '0 0 2px',
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                        }}>
                          {ep.title}
                        </p>
                        <p style={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '10px',
                          fontWeight: 600,
                          margin: 0,
                        }}>
                          {ep.episode} · {ep.duration} mín
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* ═══ DISCLAIMER ═══ */}
      {!hasRealContent && (
        <div style={{ textAlign: 'center', padding: '0 0 2rem' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Forskoðun — raunverulegt efni kemur fljótlega
          </p>
        </div>
      )}

      <Footer />
    </main>
  );
}
