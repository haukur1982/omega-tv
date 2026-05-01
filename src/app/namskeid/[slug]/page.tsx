import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCourseBySlug } from "@/lib/courses-db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";

/**
 * /namskeid/[slug] — individual course detail.
 *
 * Cathedral rhythm:
 *   1. Dark cinematic hero — course poster as backdrop with editorial
 *      cover typography (kicker / serif title / italic excerpt / meta)
 *   2. Cream body — video player + instructor card + course curriculum
 *      (modules and lessons with state markers: completed / current /
 *      locked / free preview)
 *   3. Pergament support card — quiet "this is donor-funded" CTA
 *   4. Dark footer
 *
 * Lesson state UX preserved from the older design:
 *   - Completed → green check
 *   - Current   → amber play arrow (the page's single amber accent)
 *   - Locked    → muted padlock + reduced opacity
 *   - Free preview → small kicker badge
 */

export const revalidate = 60;

type Course = Database['public']['Tables']['courses']['Row'];
type CourseModule = Database['public']['Tables']['course_modules']['Row'];
type CourseLesson = Database['public']['Tables']['course_lessons']['Row'];

const MOCK_COURSE: Course & { course_modules: (CourseModule & { course_lessons: CourseLesson[] })[] } = {
    id: 'c1',
    title: 'Að vaxa í trúinni',
    slug: 'vaxa-i-truinni',
    description: 'Djúp kafa í andagift og biblíulestur með færustu kennurum. Námskeiðið tekur þig í gegnum grundvallaratriði kirkjusögunnar, biblískrar túlkunar og andlegs þroska.',
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
            description: 'Grunnsteinar kristinnar trúar — hvar byrjum við og hvers vegna.',
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
            description: 'Framhaldsnám í túlkun og sögu — hvernig kirkjan hefur lesið Ritninguna.',
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let course: any = null;
    try {
        course = await getCourseBySlug(params.slug);
    } catch (error) {
        console.error(error);
    }

    if (!course) {
        if (params.slug === MOCK_COURSE.slug) {
            course = MOCK_COURSE;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockSlugs: Record<string, any> = {
                'vaxa-i-truinni': MOCK_COURSE,
                'skoli-baenarinnar': { ...MOCK_COURSE, id: 'c2', title: 'Skóli Bænarinnar', slug: 'skoli-baenarinnar', description: 'Frá grunnatriðum bænar til framhaldsnáms í samfélagi við Guð.', instructor: 'Sigrún Helga Kristjánsdóttir', poster_horizontal: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=1400&h=800&fit=crop' },
                'gamla-testamentid': { ...MOCK_COURSE, id: 'c3', title: 'Gamla Testamentið', slug: 'gamla-testamentid', description: 'Meginþemu Gamla testamentisins — sköpun, fall, endurlausn, fyrirheit.', instructor: 'Ólafur Einarsson', poster_horizontal: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1400&h=800&fit=crop' },
                'heilbrigt-fjolskyldulif': { ...MOCK_COURSE, id: 'c4', title: 'Heilbrigt fjölskyldulíf', slug: 'heilbrigt-fjolskyldulif', description: 'Byggðu sterkt heimili á traustum biblískum grunni.', instructor: 'Hjónin Björn og Lísa', poster_horizontal: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=1400&h=800&fit=crop' },
            };
            course = mockSlugs[params.slug] || null;
        }
    }

    if (!course) notFound();

    const modules = course.course_modules || [];
    const totalLessons = modules.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: number, mod: any) => acc + (mod.course_lessons?.length || 0),
        0,
    );

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* ─── Cinematic dark hero ───────────────────────────────── */}
            <section
                style={{
                    position: 'relative',
                    minHeight: 'clamp(420px, 55vh, 580px)',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                {course.poster_horizontal && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={course.poster_horizontal}
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.4,
                            filter: 'saturate(0.85) contrast(1.05)',
                        }}
                    />
                )}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to top, var(--nott) 0%, rgba(20,18,15,0.6) 50%, rgba(20,18,15,0.45) 100%)',
                    }}
                />
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to right, rgba(20,18,15,0.7) 0%, transparent 60%)',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(48px, 6vw, 64px)',
                        minHeight: 'clamp(420px, 55vh, 580px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                    }}
                >
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--nordurljos)',
                            marginBottom: '20px',
                        }}
                    >
                        <Link href="/namskeid" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Námskeið
                        </Link>
                        <span style={{ opacity: 0.5, padding: '0 8px' }}>·</span>
                        <span style={{ color: 'var(--moskva)' }}>{modules.length} {modules.length === 1 ? 'kafli' : 'kaflar'} · {totalLessons} kennslustundir</span>
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(40px, 5vw, 70px)',
                            lineHeight: 1.04,
                            letterSpacing: 0,
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            textWrap: 'balance',
                            maxWidth: '20ch',
                            textShadow: '0 2px 24px rgba(20,18,15,0.5)',
                        }}
                    >
                        {course.title}
                    </h1>

                    {course.description && (
                        <p
                            style={{
                                margin: '24px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(18px, 1.6vw, 22px)',
                                lineHeight: 1.55,
                                color: 'var(--moskva)',
                                maxWidth: '40rem',
                                textWrap: 'pretty',
                                textShadow: '0 1px 18px rgba(20,18,15,0.6)',
                            }}
                        >
                            {course.description}
                        </p>
                    )}

                    <div
                        aria-hidden
                        style={{
                            width: '52px',
                            height: '1px',
                            background: 'var(--gull)',
                            margin: '32px 0 18px',
                        }}
                    />

                    {course.instructor && (
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11.5px',
                                color: 'var(--steinn)',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '14px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '17px',
                                    color: 'var(--ljos)',
                                    letterSpacing: 0,
                                    textTransform: 'none',
                                    fontWeight: 400,
                                }}
                            >
                                {course.instructor}
                            </span>
                            <span style={{ opacity: 0.5 }}>·</span>
                            <span>Kennari</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Cream body — video + curriculum ───────────────────── */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '76rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(72px, 9vw, 112px)',
                    }}
                >
                    {/* Video player placeholder — 16:9 */}
                    <div
                        style={{
                            aspectRatio: '16/9',
                            background: 'var(--nott)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(63,47,35,0.14)',
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 30px 60px -32px rgba(20,18,15,0.4)',
                            marginBottom: 'clamp(40px, 5vw, 64px)',
                        }}
                    >
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'rgba(233,168,96,0.16)',
                                border: '1px solid var(--kerti)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--kerti)" aria-hidden style={{ marginLeft: '3px' }}>
                                <polygon points="6,3 20,12 6,21" />
                            </svg>
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '15px',
                                color: 'var(--moskva)',
                            }}
                        >
                            Kynningarmyndband hefst fljótlega
                        </p>
                    </div>

                    {/* Curriculum section header */}
                    <header style={{ marginBottom: 'clamp(28px, 3vw, 40px)' }}>
                        <div
                            aria-hidden
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                marginBottom: '28px',
                            }}
                        >
                            <span style={{ width: '32px', height: '1px', background: 'var(--gull)' }} />
                            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                                <circle cx="5" cy="5" r="2" fill="var(--gull)" />
                            </svg>
                            <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
                        </div>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--gull)',
                                marginBottom: '14px',
                            }}
                        >
                            Námsefni
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(28px, 3.2vw, 40px)',
                                lineHeight: 1.1,
                                fontWeight: 400,
                                color: 'var(--skra-djup)',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            Námskeiðið í köflum
                        </h2>
                    </header>

                    {modules.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(36px, 4vw, 56px)' }}>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {modules.map((module: any, mIdx: number) => (
                                <article key={module.id}>
                                    <header style={{ marginBottom: 'clamp(16px, 2vw, 22px)' }}>
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                letterSpacing: '0.22em',
                                                textTransform: 'uppercase',
                                                color: 'var(--gull)',
                                                marginBottom: '10px',
                                            }}
                                        >
                                            Kafli {String(module.module_number).padStart(2, '0')}
                                        </div>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontFamily: 'var(--font-serif)',
                                                fontSize: 'clamp(22px, 2.4vw, 28px)',
                                                lineHeight: 1.15,
                                                fontWeight: 400,
                                                color: 'var(--skra-djup)',
                                                letterSpacing: '-0.005em',
                                            }}
                                        >
                                            {module.title}
                                        </h3>
                                        {module.description && (
                                            <p
                                                style={{
                                                    margin: '10px 0 0',
                                                    fontFamily: 'var(--font-serif)',
                                                    fontStyle: 'italic',
                                                    fontSize: '15.5px',
                                                    lineHeight: 1.6,
                                                    color: 'var(--skra-mjuk)',
                                                    maxWidth: '46rem',
                                                    textWrap: 'pretty',
                                                }}
                                            >
                                                {module.description}
                                            </p>
                                        )}
                                    </header>

                                    <ul
                                        style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                        }}
                                    >
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {module.course_lessons?.map((lesson: any, lIdx: number) => {
                                            const isCompleted = mIdx === 0 && lIdx === 0;
                                            const isCurrent = mIdx === 0 && lIdx === 1;
                                            const isLocked = !isCompleted && !isCurrent;

                                            return (
                                                <li key={lesson.id}>
                                                    <div
                                                        style={{
                                                            padding: '14px 16px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            display: 'grid',
                                                            gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                                                            alignItems: 'center',
                                                            gap: '14px',
                                                            border: `1px solid ${isCurrent ? 'var(--kerti)' : 'rgba(63,47,35,0.12)'}`,
                                                            background: isCurrent
                                                                ? 'rgba(233,168,96,0.10)'
                                                                : 'var(--skra-warm)',
                                                            opacity: isLocked ? 0.55 : 1,
                                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                                            transition: 'background 220ms ease, border-color 220ms ease',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontFamily: 'var(--font-sans)',
                                                                fontSize: '11px',
                                                                fontWeight: 700,
                                                                letterSpacing: '0.18em',
                                                                color: 'var(--skra-mjuk)',
                                                                fontVariantNumeric: 'tabular-nums',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {String(module.module_number).padStart(2, '0')}.{String(lesson.lesson_number).padStart(2, '0')}
                                                        </span>

                                                        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                            <span
                                                                style={{
                                                                    fontFamily: 'var(--font-serif)',
                                                                    fontSize: '17px',
                                                                    color: 'var(--skra-djup)',
                                                                    letterSpacing: '-0.005em',
                                                                    fontWeight: 400,
                                                                }}
                                                            >
                                                                {lesson.title}
                                                            </span>
                                                            {lesson.is_free_preview && (
                                                                <span
                                                                    style={{
                                                                        fontFamily: 'var(--font-sans)',
                                                                        fontSize: '9.5px',
                                                                        fontWeight: 700,
                                                                        letterSpacing: '0.18em',
                                                                        textTransform: 'uppercase',
                                                                        color: 'var(--gull)',
                                                                        background: 'rgba(200,138,62,0.12)',
                                                                        padding: '3px 8px',
                                                                        borderRadius: '3px',
                                                                    }}
                                                                >
                                                                    Forskoðun
                                                                </span>
                                                            )}
                                                        </div>

                                                        <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                                                            {isCompleted && (
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(80, 130, 88)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                                    <polyline points="22,4 12,14.01 9,11.01" />
                                                                </svg>
                                                            )}
                                                            {isCurrent && (
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--kerti)" style={{ marginLeft: '2px' }}>
                                                                    <polygon points="6,3 20,12 6,21" />
                                                                </svg>
                                                            )}
                                                            {isLocked && (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--skra-mjuk)" strokeWidth="2" strokeLinecap="round">
                                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                                </svg>
                                                            )}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                padding: 'clamp(40px, 5vw, 64px)',
                                border: '1px dashed rgba(63,47,35,0.2)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--skra-warm)',
                                textAlign: 'center',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '17px',
                                    color: 'var(--skra-djup)',
                                }}
                            >
                                Kennslustundir bætast við hér jafnóðum.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Pergament support card ───────────────────────────── */}
            <section
                style={{
                    background: 'var(--skra-warm)',
                    color: 'var(--skra-djup)',
                    borderTop: '1px solid rgba(63,47,35,0.12)',
                }}
            >
                <div
                    style={{
                        maxWidth: '52rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding)',
                        textAlign: 'center',
                    }}
                >
                    <div
                        aria-hidden
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '14px',
                            marginBottom: '24px',
                            maxWidth: '20rem',
                            marginInline: 'auto',
                        }}
                    >
                        <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.32)' }} />
                        <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden>
                            <circle cx="4.5" cy="4.5" r="2" fill="var(--gull)" opacity="0.7" />
                        </svg>
                        <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.32)' }} />
                    </div>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(22px, 2.4vw, 28px)',
                            lineHeight: 1.25,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                            marginBottom: '12px',
                        }}
                    >
                        Þessi námskeið eru ókeypis — þökk sé umhyggjusömum gjöfum.
                    </h3>
                    <p
                        style={{
                            margin: '0 0 24px',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '16px',
                            lineHeight: 1.6,
                            color: 'var(--skra-mjuk)',
                            maxWidth: '36rem',
                            marginInline: 'auto',
                        }}
                    >
                        Stuðningur þinn gerir okkur kleift að framleiða gæðaefni á íslensku, án auglýsinga og án áskriftar.
                    </p>
                    <Link
                        href="/give"
                        className="warm-hover"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 28px',
                            background: 'transparent',
                            color: 'var(--skra-djup)',
                            border: '1px solid var(--kerti)',
                            borderRadius: 'var(--radius-xs)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                        }}
                    >
                        Styðja Omega
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
