import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TestimonialForm from '@/components/forms/TestimonialForm';
import { getTestimonials } from '@/lib/testimonials-db';

/**
 * /vitnisburdur — community testimony page (cathedral rhythm).
 *
 * Editorial flow:
 *   1. Dark masthead — kicker "Vitnisburðir" + serif title + italic deck
 *      + gold rule. Article-cover pattern matching the rest of the site.
 *   2. Cream body — submission form on a pergament card + grid of
 *      approved testimonies on cream cards.
 *   3. Dark footer.
 */

export const revalidate = 0;

export default async function TestimonialPage() {
    const testimonials = await getTestimonials();

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
                <div className="article-cover-shell" style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto' }}>
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
                            Vitnisburðir
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
                            Deildu þinni sögu.
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
                            Vitnisburður þinn getur uppörvað og styrkt trú annarra. Við fögnum hverri sögu um Guðs verk í lífi fólks.
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
                            Allir vitnisburðir eru lesnir yfir áður en þeir eru birtir
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Cream body ────────────────────────────────────────── */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '52rem',
                        margin: '0 auto',
                        padding: 'clamp(72px, 9vw, 112px) var(--rail-padding) clamp(64px, 8vw, 88px)',
                    }}
                >
                    {/* Form section */}
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
                            Senda vitnisburð
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
                            Skrifaðu söguna þína
                        </h2>
                    </header>

                    <div
                        style={{
                            background: 'var(--skra-warm)',
                            border: '1px solid rgba(63,47,35,0.14)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'clamp(28px, 3vw, 40px)',
                            marginBottom: 'clamp(64px, 8vw, 96px)',
                        }}
                    >
                        <TestimonialForm />
                    </div>

                    {/* Testimonials grid */}
                    {testimonials && testimonials.length > 0 && (
                        <>
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
                                    Frá samferðamönnum
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
                                    Nýlegir vitnisburðir
                                </h2>
                            </header>

                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'grid',
                                    gap: 'clamp(20px, 2vw, 28px)',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                }}
                            >
                                {testimonials.map((t) => (
                                    <li key={t.id}>
                                        <article
                                            style={{
                                                padding: 'clamp(22px, 2vw, 28px)',
                                                background: 'var(--skra)',
                                                border: '1px solid rgba(63,47,35,0.12)',
                                                borderRadius: 'var(--radius-sm)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '14px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.18em',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--skra-mjuk)',
                                                    display: 'flex',
                                                    alignItems: 'baseline',
                                                    gap: '12px',
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <span style={{ color: 'var(--skra-djup)' }}>{t.name}</span>
                                                {t.created_at && (
                                                    <>
                                                        <span style={{ opacity: 0.4 }}>·</span>
                                                        <span>
                                                            {new Date(t.created_at).toLocaleDateString('is-IS', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontFamily: 'var(--font-serif)',
                                                    fontStyle: 'italic',
                                                    fontSize: '16px',
                                                    lineHeight: 1.6,
                                                    color: 'var(--skra-djup)',
                                                    textWrap: 'pretty',
                                                }}
                                            >
                                                „{t.content}"
                                            </p>
                                        </article>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
