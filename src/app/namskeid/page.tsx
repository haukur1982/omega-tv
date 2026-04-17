import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LeidCard from "@/components/courses/LeidCard";
import { getAllCourses } from "@/lib/courses-db";
import type { Database } from "@/types/supabase";

/**
 * /namskeid — Courses index. Phase 3 rewrite (see plan §4.4).
 *
 * Editorial hero (Kveða serif) + 3-to-4-column grid of Leið cards.
 * Dropped the old "Akademía"-badged masterclass hero + stacked-cards
 * pattern — too Netflix-y and off-brand for the new editorial system.
 *
 * Progress tracking (per-user filled modules) lands in Phase 4; for
 * now the ladder shows total modules with 0 filled.
 */

export const revalidate = 300;

type Course = Database['public']['Tables']['courses']['Row'];

// Fallback mocks so the page renders before Supabase has rows.
const MOCK_COURSES: (Course & { _moduleCount: number })[] = [
  {
    id: 'c1',
    title: 'Að vaxa í trúinni',
    slug: 'vaxa-i-truinni',
    description: 'Djúp kafa í andagift, biblíulestur og andlegan þroska með færustu kennurum okkar.',
    instructor: 'Dr. Jón Friðrik Sigurðsson',
    poster_horizontal: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=1000&fit=crop',
    poster_vertical: null,
    status: 'published',
    created_at: '2026-01-01T00:00:00Z',
    _moduleCount: 6,
  },
  {
    id: 'c2',
    title: 'Skóli Bænarinnar',
    slug: 'skoli-baenarinnar',
    description: 'Frá grunnatriðum bænar til framhaldsnáms í samfélagi við Guð.',
    instructor: 'Sigrún Helga Kristjánsdóttir',
    poster_horizontal: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=800&h=1000&fit=crop',
    poster_vertical: null,
    status: 'published',
    created_at: '2026-02-01T00:00:00Z',
    _moduleCount: 4,
  },
  {
    id: 'c3',
    title: 'Gamla Testamentið',
    slug: 'gamla-testamentid',
    description: 'Meginþemu Gamla testamentisins — sköpun, fall, endurlausn, fyrirheit.',
    instructor: 'Ólafur Einarsson',
    poster_horizontal: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=1000&fit=crop',
    poster_vertical: null,
    status: 'published',
    created_at: '2026-03-01T00:00:00Z',
    _moduleCount: 8,
  },
  {
    id: 'c4',
    title: 'Heilbrigt fjölskyldulíf',
    slug: 'heilbrigt-fjolskyldulif',
    description: 'Byggðu sterkt heimili á traustum biblískum grunni — í praktískum skrefum.',
    instructor: 'Hjónin Björn og Lísa',
    poster_horizontal: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=800&h=1000&fit=crop',
    poster_vertical: null,
    status: 'published',
    created_at: '2026-03-15T00:00:00Z',
    _moduleCount: 5,
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countModules(c: any): number {
  if (typeof c?._moduleCount === 'number') return c._moduleCount;
  if (Array.isArray(c?.course_modules) && c.course_modules.length > 0) {
    const first = c.course_modules[0];
    if (typeof first?.count === 'number') return first.count;
    return c.course_modules.length;
  }
  return 6; // sensible default for an un-counted course
}

export default async function NamskeidPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let courses: any[] = [];
  try {
    const real = await getAllCourses();
    if (real && real.length > 0) courses = real;
  } catch (e) {
    console.error('Failed to load courses:', e);
  }
  if (courses.length === 0) courses = MOCK_COURSES;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--mold)', color: 'var(--ljos)' }}>
      <Navbar />

      {/* ═══ EDITORIAL HERO ═══ */}
      <section
        style={{
          padding: 'clamp(7rem, 12vw, 10rem) var(--rail-padding) clamp(2.5rem, 5vw, 4rem)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <p
            className="type-merki ink-arrive"
            style={{
              color: 'var(--kerti)',
              margin: 0,
              marginBottom: 'clamp(14px, 1.6vw, 20px)',
              letterSpacing: '0.22em',
              fontSize: '0.7rem',
            }}
          >
            Omega · Námskeið
          </p>
          <h1
            className="ink-arrive-delay-1"
            style={{
              fontFamily: 'var(--font-display, var(--font-serif))',
              fontWeight: 300,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 1,
              letterSpacing: '-0.035em',
              margin: 0,
              marginBottom: 'clamp(16px, 2vw, 22px)',
              color: 'var(--ljos)',
              maxWidth: '22ch',
            }}
          >
            Lærðu af þeim sem ganga með Guði.
          </h1>
          <p
            className="ink-arrive-delay-2"
            style={{
              margin: 0,
              fontFamily: 'var(--font-serif)',
              color: 'var(--moskva)',
              fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
              lineHeight: 1.65,
              maxWidth: '58ch',
            }}
          >
            Námskeið í biblíulestri, bæn, fjölskyldulífi og leiðtogaþjónustu — kennt af leiðtogum sem hafa þjónað á Íslandi í áratugi. Taktu þér tíma til að fara dýpra.
          </p>
        </div>
      </section>

      {/* ═══ GRID OF LEIÐ CARDS ═══ */}
      <section
        style={{
          padding: '0 var(--rail-padding) clamp(4rem, 6vw, 5.5rem)',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {courses.map((c) => (
            <LeidCard
              key={c.id}
              href={`/namskeid/${c.slug}`}
              title={c.title}
              instructor={c.instructor}
              image={c.poster_horizontal ?? c.poster_vertical ?? 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=1000&fit=crop'}
              moduleCount={countModules(c)}
              moduleProgress={0}
              description={c.description}
            />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
