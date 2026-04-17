import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCourseBySlug } from "@/lib/courses-db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";

export const revalidate = 60;

type Course = Database['public']['Tables']['courses']['Row'];
type CourseModule = Database['public']['Tables']['course_modules']['Row'];
type CourseLesson = Database['public']['Tables']['course_lessons']['Row'];

// ─── Mock course detail matching exact Supabase schema ───
const MOCK_COURSE: Course & { course_modules: (CourseModule & { course_lessons: CourseLesson[] })[] } = {
  id: 'c1',
  title: 'Að vaxa í trúinni: Meistaraklass',
  slug: 'vaxa-i-truinni',
  description: 'Djúp kafa í andagift og biblíulestur með færustu kennurum. Þetta námskeið tekur þig í gegnum grundvallaratriði kirkjusögunnar, biblískrar túlkunar og andlegs þroska.',
  instructor: 'Dr. Jón Friðrik Sigurðsson',
  poster_horizontal: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1400&h=800&fit=crop',
  poster_vertical: null,
  status: 'published',
  created_at: '2026-01-01T00:00:00Z',
  course_modules: [
    {
      id: 'mod1',
      course_id: 'c1',
      module_number: 1,
      title: 'Grundvöllurinn',
      description: 'Grunnsteinar kristinnar trúar',
      created_at: '2026-01-01T00:00:00Z',
      course_lessons: [
        { id: 'l1', module_id: 'mod1', lesson_number: 1, title: 'Hvað er trúin?', bunny_video_id: null, is_free_preview: true, text_content: null, created_at: '2026-01-01T00:00:00Z' },
        { id: 'l2', module_id: 'mod1', lesson_number: 2, title: 'Biblían sem leiðarljós', bunny_video_id: null, is_free_preview: false, text_content: null, created_at: '2026-01-01T00:00:00Z' },
        { id: 'l3', module_id: 'mod1', lesson_number: 3, title: 'Bænin í daglegu lífi', bunny_video_id: null, is_free_preview: false, text_content: null, created_at: '2026-01-01T00:00:00Z' },
      ],
    },
    {
      id: 'mod2',
      course_id: 'c1',
      module_number: 2,
      title: 'Dýpri skilningur',
      description: 'Framhaldsnám í túlkun og sögu',
      created_at: '2026-01-02T00:00:00Z',
      course_lessons: [
        { id: 'l4', module_id: 'mod2', lesson_number: 1, title: 'Kirkjusagan á Íslandi', bunny_video_id: null, is_free_preview: false, text_content: null, created_at: '2026-01-02T00:00:00Z' },
        { id: 'l5', module_id: 'mod2', lesson_number: 2, title: 'Spádómarnir', bunny_video_id: null, is_free_preview: false, text_content: null, created_at: '2026-01-02T00:00:00Z' },
      ],
    },
  ],
};

export default async function CoursePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;

  let course: any = null;
  try {
    course = await getCourseBySlug(params.slug);
  } catch (error) {
    console.error(error);
  }

  // Fallback to mock
  if (!course) {
    if (params.slug === MOCK_COURSE.slug) {
      course = MOCK_COURSE;
    } else {
      // Try other mock slugs
      const mockSlugs: Record<string, any> = {
        'vaxa-i-truinni': MOCK_COURSE,
        'skoli-baenarinnar': { ...MOCK_COURSE, id: 'c2', title: 'Skóli Bænarinnar', slug: 'skoli-baenarinnar', description: 'Lærðu hvernig þú nærð dýpri tengingu við Guð.', instructor: 'Sigrún Helga Kristjánsdóttir', poster_horizontal: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=1400&h=800&fit=crop' },
        'gamla-testamentid': { ...MOCK_COURSE, id: 'c3', title: 'Gamla Testamentið', slug: 'gamla-testamentid', description: 'Sagan skyrð frá upphafi til enda.', instructor: 'Ólafur Einarsson', poster_horizontal: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1400&h=800&fit=crop' },
      };
      course = mockSlugs[params.slug] || null;
    }
  }

  if (!course) notFound();

  const modules = course.course_modules || [];
  const totalLessons = modules.reduce((acc: number, mod: any) => acc + (mod.course_lessons?.length || 0), 0);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ═══ CINEMATIC HERO ═══ */}
      <div style={{
        position: 'relative',
        height: 'clamp(300px, 50vh, 500px)',
        background: '#0a0a0a',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {course.poster_horizontal && (
          <img
            src={course.poster_horizontal}
            alt={course.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.45,
            }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-deep) 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg-deep) 0%, rgba(12,10,8,0.6) 50%, transparent 100%)' }} />

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: 'clamp(1.5rem, 4vw, 3rem) var(--rail-padding)',
          maxWidth: '80rem',
          margin: '0 auto',
          right: 0,
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--accent)',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontSize: '12px',
            marginBottom: '0.75rem',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 12 3 12 0v-5"/>
            </svg>
            Omega Námskeið
          </span>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: '0 0 0.75rem',
          }}>
            {course.title}
          </h1>
          <p style={{
            maxWidth: '600px',
            fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            margin: 0,
          }}>
            {course.description}
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            {course.instructor && (
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                Kennari: {course.instructor}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {modules.length} kaflar · {totalLessons} kennslustundir
            </span>
          </div>
        </div>
      </div>

      {/* ═══ COURSE LAYOUT ═══ */}
      <div style={{
        flex: 1,
        maxWidth: '80rem',
        margin: '0 auto',
        width: '100%',
        padding: 'clamp(2rem, 4vw, 3rem) var(--rail-padding)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Video Player Placeholder */}
          <div style={{
            aspectRatio: '16/9',
            background: 'var(--bg-surface)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)"><polygon points="6,3 20,12 6,21" /></svg>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Kynningarmyndband hefst fljótlega...</p>
          </div>

          {/* Instructor Info */}
          <div style={{
            padding: '1.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Um Kennarann</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
              {course.instructor || 'Sérfræðingur á þessu sviði.'}
            </p>
          </div>
        </div>

        {/* ═══ CURRICULUM SIDEBAR ═══ */}
        <div>
          <h3 style={{
            fontWeight: 800,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
          }}>
            Námsefni
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {modules.map((module: any, mIdx: number) => (
              <div key={module.id}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
                  {module.module_number}. {module.title}
                </h4>
                {module.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                    {module.description}
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {module.course_lessons?.map((lesson: any, lIdx: number) => {
                    const isCompleted = mIdx === 0 && lIdx === 0;
                    const isCurrent = mIdx === 0 && lIdx === 1;
                    const isLocked = !isCompleted && !isCurrent;

                    return (
                      <div
                        key={lesson.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: `1px solid ${isCurrent ? 'var(--accent)' : isCompleted ? 'var(--border)' : 'transparent'}`,
                          background: isCurrent ? 'var(--accent-dim)' : isCompleted ? 'var(--bg-surface)' : 'var(--bg-deep)',
                          opacity: isLocked ? 0.5 : 1,
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
                            {module.module_number}.{lesson.lesson_number}
                          </span>
                          <span style={{
                            fontWeight: 500,
                            fontSize: '14px',
                            color: isCurrent ? 'white' : 'var(--text-secondary)',
                          }}>
                            {lesson.title}
                          </span>
                          {lesson.is_free_preview && (
                            <span style={{
                              fontSize: '8px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              color: 'var(--accent)',
                              background: 'var(--accent-dim)',
                              padding: '2px 6px',
                              borderRadius: '3px',
                            }}>
                              Forskoðun
                            </span>
                          )}
                        </div>
                        <div>
                          {isCompleted && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
                            </svg>
                          )}
                          {isCurrent && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)"><polygon points="6,3 20,12 6,21" /></svg>
                          )}
                          {isLocked && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {modules.length === 0 && (
              <div style={{
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}>
                Engar kennslustundir skráðar.
              </div>
            )}
          </div>

          {/* Support CTA */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            borderRadius: '14px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(91, 138, 191, 0.15)',
            textAlign: 'center',
          }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem', fontSize: '1rem' }}>
              Viltu styðja við gerð hágæða efnis?
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem', lineHeight: 1.5 }}>
              Þessi námskeið eru ókeypis þökk sé umhyggjusömum gjöfum.
            </p>
            <Link
              href="/give"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: 'var(--accent)',
                color: 'white',
                fontWeight: 700,
                fontSize: '13px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Styrkja Omega TV
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
