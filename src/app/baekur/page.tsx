import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BOOKS } from '@/lib/books';

/**
 * /baekur — books published by Omega. A new room in the house:
 * the print ministry. First title: 90 mínútur á himnum (Don Piper).
 *
 * Composition: the cover IS the art — it stands on a dark stage with
 * its own ambient light (blurred cover as backdrop), the way a poster
 * carries the VOD shelf. Reading matter (description, commendation,
 * author) lives on vellum below, like the article pages. The list is
 * data-driven (src/lib/books.ts): the first book takes the stage,
 * later titles form a shelf beneath.
 */

export const metadata: Metadata = {
    title: 'Bækur | Omega Stöðin',
    description:
        'Bækur frá Omega — valdar bækur sem byggja upp trú, þýddar og gefnar út á íslensku. Fyrsta bókin: 90 mínútur á himnum eftir Don Piper.',
};

export default function BaekurPage() {
    const [featured, ...shelf] = BOOKS;

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* ═══ Stage — the book in its own light ═══ */}
            <section
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                {/* ambient: the cover itself, blurred to a glow */}
                {featured.backdrop && (
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${featured.backdrop})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.5,
                        }}
                    />
                )}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to bottom, rgba(20,18,15,0.82) 0%, rgba(20,18,15,0.55) 40%, rgba(20,18,15,0.92) 100%)',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding:
                            'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(64px, 8vw, 96px)',
                    }}
                >
                    <div
                        className="baekur-stage"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 380px)',
                            gap: 'clamp(40px, 6vw, 96px)',
                            alignItems: 'center',
                        }}
                    >
                        <style>{`@media (max-width: 860px) { .baekur-stage { grid-template-columns: 1fr !important; } .baekur-stage > .baekur-cover { order: -1; max-width: 240px; margin: 0 auto; } }`}</style>

                        {/* copy */}
                        <div>
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
                                Bækur frá Omega
                            </div>

                            {featured.badge && (
                                <div
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: 'var(--gull)',
                                        marginBottom: '18px',
                                    }}
                                >
                                    {featured.badge}
                                </div>
                            )}

                            <h1
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(40px, 5vw, 66px)',
                                    lineHeight: 1.05,
                                    fontWeight: 400,
                                    color: 'var(--ljos)',
                                    letterSpacing: '-0.01em',
                                    textWrap: 'balance',
                                }}
                            >
                                {featured.title}
                            </h1>

                            <div
                                style={{
                                    marginTop: '16px',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    color: 'var(--moskva)',
                                }}
                            >
                                {featured.author}
                                {featured.coauthor && (
                                    <span style={{ opacity: 0.7, fontWeight: 500 }}> {featured.coauthor}</span>
                                )}
                            </div>

                            <p
                                style={{
                                    margin: '26px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(19px, 1.8vw, 24px)',
                                    lineHeight: 1.5,
                                    color: 'var(--moskva)',
                                    maxWidth: '32rem',
                                }}
                            >
                                {featured.tagline}
                            </p>

                            {/* CTA — how to get the book (mirrors the June letter) */}
                            <div
                                style={{
                                    marginTop: 'clamp(32px, 4vw, 44px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <a
                                    href="mailto:omega@omega.is?subject=90%20m%C3%ADn%C3%BAtur%20%C3%A1%20himnum"
                                    style={{
                                        display: 'inline-block',
                                        padding: '14px 28px',
                                        background: 'var(--kerti)',
                                        color: '#1B1814',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '12.5px',
                                        fontWeight: 700,
                                        letterSpacing: '0.14em',
                                        textTransform: 'uppercase',
                                        textDecoration: 'none',
                                        borderRadius: '4px',
                                    }}
                                >
                                    Fáðu eintak
                                </a>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: '15.5px',
                                        color: 'var(--steinn)',
                                    }}
                                >
                                    eða hringdu í síma 800 9700
                                </span>
                            </div>
                        </div>

                        {/* the cover */}
                        <div className="baekur-cover" style={{ justifySelf: 'center' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={featured.cover}
                                alt={`${featured.title} — bókarkápa`}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    borderRadius: '4px 10px 10px 4px',
                                    boxShadow:
                                        '0 30px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.4), -6px 0 14px rgba(0,0,0,0.18)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Vellum — the reading room ═══ */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '46rem',
                        margin: '0 auto',
                        padding: 'clamp(64px, 8vw, 104px) var(--rail-padding) clamp(72px, 9vw, 120px)',
                    }}
                >
                    {/* commendation */}
                    {featured.quote && (
                        <blockquote
                            style={{
                                margin: '0 0 clamp(40px, 5vw, 56px)',
                                padding: '4px 0 4px 24px',
                                borderLeft: '2px solid var(--gull)',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(19px, 1.8vw, 23px)',
                                    lineHeight: 1.55,
                                    color: 'var(--skra-djup)',
                                }}
                            >
                                „{featured.quote.text}“
                            </p>
                            <footer
                                style={{
                                    marginTop: '14px',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(63,47,35,0.6)',
                                }}
                            >
                                — {featured.quote.source}
                            </footer>
                        </blockquote>
                    )}

                    {/* description */}
                    <div
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(17px, 1.4vw, 19.5px)',
                            lineHeight: 1.8,
                        }}
                    >
                        {featured.description.map((p, i) => (
                            <p key={i} style={{ margin: i === 0 ? 0 : '1.3em 0 0' }}>
                                {p}
                            </p>
                        ))}
                    </div>

                    {/* author */}
                    {featured.authorBio && (
                        <div
                            style={{
                                marginTop: 'clamp(44px, 5vw, 60px)',
                                paddingTop: 'clamp(28px, 3.5vw, 36px)',
                                borderTop: '1px solid rgba(63,47,35,0.16)',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gull)',
                                    marginBottom: '12px',
                                }}
                            >
                                Um höfundinn
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(15.5px, 1.25vw, 17.5px)',
                                    lineHeight: 1.7,
                                    color: 'rgba(63,47,35,0.85)',
                                }}
                            >
                                {featured.authorBio}
                            </p>
                        </div>
                    )}

                    {/* colophon line */}
                    <div
                        style={{
                            marginTop: 'clamp(36px, 4vw, 48px)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'rgba(63,47,35,0.45)',
                        }}
                    >
                        Útgefandi: Azotus · {featured.year}
                        {featured.isbn && <> · ISBN {featured.isbn}</>}
                    </div>
                </div>
            </section>

            {/* ═══ The shelf — future titles ═══ */}
            <section
                style={{
                    background: 'var(--nott)',
                    borderTop: '1px solid var(--border)',
                }}
            >
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 80px) var(--rail-padding)',
                        textAlign: 'center',
                    }}
                >
                    {shelf.length > 0 ? (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 'clamp(28px, 3vw, 40px)',
                            }}
                        >
                            {shelf.map((b) => (
                                <div key={b.slug}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={b.cover}
                                        alt={b.title}
                                        style={{ width: '100%', borderRadius: '4px 8px 8px 4px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}
                                    />
                                    <div style={{ marginTop: '12px', fontFamily: 'var(--font-serif)', fontSize: '17px', color: 'var(--ljos)' }}>{b.title}</div>
                                    <div style={{ marginTop: '4px', fontFamily: 'var(--font-sans)', fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--steinn)' }}>{b.author}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div
                                aria-hidden
                                style={{ width: '40px', height: '1px', background: 'var(--gull)', margin: '0 auto 22px' }}
                            />
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(17px, 1.5vw, 21px)',
                                    color: 'var(--moskva)',
                                }}
                            >
                                Þetta er fyrsta bókin af mörgum — fleiri eru á leiðinni.
                            </p>
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
