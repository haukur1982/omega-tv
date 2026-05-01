import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CoursePosterCard from "@/components/courses/CoursePosterCard";
import { getAllCourses } from "@/lib/courses-db";
import type { Database } from "@/types/supabase";

/**
 * /namskeid — Námskeið (courses) index, cathedral rhythm.
 *
 * Editorial flow:
 *   1. Dark masthead — "Námskeið" kicker, "Lærðu af þeim sem ganga
 *      með Guði." big serif title, italic deck, gold rule, byline.
 *   2. Cream body — poster-style course cards in a 4:5 grid,
 *      matching /sermons SeriesShelf aesthetic. Each course is a
 *      door to its own detail page where the module ladder lives.
 *   3. Dark footer.
 *
 * Course detail pages (/namskeid/[slug]) keep the LeidCard-with-
 * module-ladder treatment — that's where progress matters. The
 * index is for discovery.
 */

export const revalidate = 300;

type Course = Database['public']['Tables']['courses']['Row'];

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
    return 6;
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
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* ─── Dark masthead ─────────────────────────────────────── */}
            <section
                className="article-cover"
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(56px, 7vw, 88px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(ellipse at 82% 18%, rgba(233,168,96,0.10) 0%, transparent 55%)',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    className="article-cover-shell"
                    style={{
                        position: 'relative',
                        maxWidth: '80rem',
                        margin: '0 auto',
                    }}
                >
                    <div className="article-cover-copy">
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--nordurljos)',
                                marginBottom: '24px',
                            }}
                        >
                            Námskeið
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
                                maxWidth: '15ch',
                            }}
                        >
                            Lærðu af þeim sem ganga með Guði.
                        </h1>

                        <p
                            style={{
                                margin: '28px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(20px, 1.8vw, 25px)',
                                lineHeight: 1.48,
                                color: 'var(--moskva)',
                                letterSpacing: 0,
                                textWrap: 'pretty',
                                maxWidth: '36rem',
                            }}
                        >
                            Námskeið í biblíulestri, bæn, fjölskyldulífi og leiðtogaþjónustu — kennt af þeim sem hafa þjónað í áratugi. Taktu þér tíma til að fara dýpra.
                        </p>

                        <div
                            aria-hidden
                            style={{
                                width: '52px',
                                height: '1px',
                                background: 'var(--gull)',
                                margin: '34px 0 20px',
                            }}
                        />

                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11.5px',
                                color: 'var(--steinn)',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            {courses.length} {courses.length === 1 ? 'námskeið' : 'námskeið'} í safni
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Cream body — course poster grid ───────────────────── */}
            <section
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                }}
            >
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(72px, 9vw, 112px) var(--rail-padding) clamp(96px, 12vw, 144px)',
                    }}
                >
                    <header style={{ marginBottom: 'clamp(32px, 4vw, 48px)', maxWidth: '52rem' }}>
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
                            Námskeiðin
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
                            Veldu þér leið
                        </h2>
                        <p
                            style={{
                                margin: '14px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '17px',
                                lineHeight: 1.5,
                                color: 'var(--skra-mjuk)',
                                textWrap: 'pretty',
                                maxWidth: '40rem',
                            }}
                        >
                            Hvert námskeið skiptist í einingar — taktu þær á þeim hraða sem hentar þér.
                        </p>
                    </header>

                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'grid',
                            gap: 'clamp(20px, 2vw, 28px)',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        }}
                    >
                        {courses.map((c) => (
                            <li key={c.id}>
                                <CoursePosterCard
                                    href={`/namskeid/${c.slug}`}
                                    title={c.title}
                                    instructor={c.instructor}
                                    description={c.description}
                                    image={c.poster_horizontal ?? c.poster_vertical ?? 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=1000&fit=crop'}
                                    moduleCount={countModules(c)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <Footer />
        </main>
    );
}
