import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BokavinirForm from '@/components/baekur/BokavinirForm';
import { BOOKS } from '@/lib/books';

/**
 * /baekur — Omega's book vision.
 *
 * Not a product page: a chapter of the station's calling. Structure:
 *
 *   1. Vision masthead — Omega has been a voice to the nation through
 *      television since 1992; now God has laid books on its heart.
 *   2. The book stage — the current title in its own ambient light,
 *      with a CSS "physical book" treatment (spine + page edges).
 *   3. Reading room (vellum) — commendation, description, author.
 *   4. Bókavinir Omega — the online signup: register name + home
 *      address, the book is mailed home, and you're on the list for
 *      every future title. No mailto links — everything on the page.
 *   5. The road ahead — first of many + the app, quietly.
 */

export const metadata: Metadata = {
    title: 'Bækur | Omega Stöðin',
    description:
        'Bókasýn Omega — rödd til þjóðarinnar, nú einnig á bók. Skráðu þig sem bókavin og fáðu fyrstu bókina senda heim: 90 mínútur á himnum eftir Don Piper.',
};

export default function BaekurPage() {
    const [featured, ...shelf] = BOOKS;

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* ═══ 1 · Vision masthead ═══ */}
            <section
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(ellipse at 78% 20%, rgba(233,168,96,0.12) 0%, transparent 55%)',
                        pointerEvents: 'none',
                    }}
                />
                <div
                    style={{
                        position: 'relative',
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding:
                            'clamp(124px, 11vw, 168px) var(--rail-padding) clamp(56px, 7vw, 88px)',
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
                            marginBottom: '24px',
                        }}
                    >
                        Bókasýn Omega
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(40px, 5vw, 70px)',
                            lineHeight: 1.05,
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            letterSpacing: '-0.005em',
                            maxWidth: '18ch',
                            textWrap: 'balance',
                        }}
                    >
                        Rödd til þjóðarinnar — nú einnig á bók.
                    </h1>
                    <p
                        style={{
                            margin: '28px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(19px, 1.8vw, 24px)',
                            lineHeight: 1.55,
                            color: 'var(--moskva)',
                            maxWidth: '42rem',
                            textWrap: 'pretty',
                        }}
                    >
                        Omega hefur verið rödd inn í íslensku þjóðina í gegnum
                        sjónvarpið frá 1992. Nú hefur Guð lagt okkur á hjarta að
                        bera fram bækur sem tala til þjóðarinnar — bækur sem
                        byggja upp trú, von og kærleika, valdar af kostgæfni og
                        gefnar út á íslensku.
                    </p>
                    <div
                        style={{
                            marginTop: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <span aria-hidden style={{ width: '34px', height: '1px', background: 'var(--gull)' }} />
                        <span
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: 'var(--steinn)',
                            }}
                        >
                            Hluti af framtíðarsýn Omega
                        </span>
                    </div>
                </div>
            </section>

            {/* ═══ 2 · The book stage ═══ */}
            <section
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                {featured.backdrop && (
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${featured.backdrop})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.45,
                        }}
                    />
                )}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to bottom, rgba(20,18,15,0.9) 0%, rgba(20,18,15,0.55) 45%, rgba(20,18,15,0.92) 100%)',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(64px, 8vw, 104px) var(--rail-padding)',
                    }}
                >
                    <div
                        className="baekur-stage"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 360px)',
                            gap: 'clamp(40px, 6vw, 96px)',
                            alignItems: 'center',
                        }}
                    >
                        <style>{`@media (max-width: 860px) { .baekur-stage { grid-template-columns: 1fr !important; } .baekur-stage > .baekur-cover { order: -1; max-width: 230px; margin: 0 auto; } }`}</style>

                        <div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gull)',
                                    marginBottom: '18px',
                                }}
                            >
                                Fyrsta bókin{featured.badge ? ` · ${featured.badge}` : ''}
                            </div>

                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(36px, 4.4vw, 58px)',
                                    lineHeight: 1.06,
                                    fontWeight: 400,
                                    color: 'var(--ljos)',
                                    letterSpacing: '-0.01em',
                                    textWrap: 'balance',
                                }}
                            >
                                {featured.title}
                            </h2>

                            <div
                                style={{
                                    marginTop: '14px',
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
                                    margin: '24px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(19px, 1.7vw, 23px)',
                                    lineHeight: 1.5,
                                    color: 'var(--moskva)',
                                    maxWidth: '30rem',
                                }}
                            >
                                {featured.tagline}
                            </p>

                            <div style={{ marginTop: 'clamp(30px, 4vw, 40px)' }}>
                                <a
                                    href="#bokavinir"
                                    style={{
                                        display: 'inline-block',
                                        padding: '15px 30px',
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
                                    Fáðu bókina senda heim ↓
                                </a>
                            </div>
                        </div>

                        {/* the book — CSS physical treatment: spine shadow + page edges */}
                        <div className="baekur-cover" style={{ justifySelf: 'center', perspective: '1400px' }}>
                            <div
                                style={{
                                    position: 'relative',
                                    transform: 'rotateY(-7deg)',
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                {/* page block peeking on the right */}
                                <div
                                    aria-hidden
                                    style={{
                                        position: 'absolute',
                                        top: '1.5%',
                                        bottom: '1.5%',
                                        right: '-7px',
                                        width: '14px',
                                        background:
                                            'repeating-linear-gradient(to bottom, #F4EFE2 0px, #F4EFE2 2px, #DCD4C0 3px)',
                                        borderRadius: '0 3px 3px 0',
                                        transform: 'translateZ(-8px)',
                                        boxShadow: '6px 8px 18px rgba(0,0,0,0.45)',
                                    }}
                                />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={featured.cover}
                                    alt={`${featured.title} — bókarkápa`}
                                    style={{
                                        position: 'relative',
                                        display: 'block',
                                        width: '100%',
                                        borderRadius: '3px 8px 8px 3px',
                                        boxShadow:
                                            '0 34px 80px rgba(0,0,0,0.6), 0 10px 26px rgba(0,0,0,0.45)',
                                    }}
                                />
                                {/* spine light + hinge crease */}
                                <div
                                    aria-hidden
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '3px 8px 8px 3px',
                                        background:
                                            'linear-gradient(to right, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.08) 4%, rgba(255,255,255,0.10) 7%, rgba(0,0,0,0) 12%)',
                                        pointerEvents: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 3 · Reading room ═══ */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '46rem',
                        margin: '0 auto',
                        padding: 'clamp(64px, 8vw, 104px) var(--rail-padding) clamp(64px, 8vw, 96px)',
                    }}
                >
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

                    <div
                        style={{
                            marginTop: 'clamp(32px, 4vw, 44px)',
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

            {/* ═══ 4 · Bókavinir Omega — the signup ═══ */}
            <section
                id="bokavinir"
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                    borderTop: '1px solid rgba(63,47,35,0.14)',
                    scrollMarginTop: '72px',
                }}
            >
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(64px, 8vw, 104px) var(--rail-padding) clamp(80px, 10vw, 128px)',
                    }}
                >
                    <div
                        className="bokavinir-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 30rem) minmax(0, 34rem)',
                            gap: 'clamp(48px, 6vw, 96px)',
                            justifyContent: 'center',
                        }}
                    >
                        <style>{`@media (max-width: 960px) { .bokavinir-grid { grid-template-columns: 1fr !important; } }`}</style>

                        {/* invitation copy */}
                        <div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gull)',
                                    marginBottom: '20px',
                                }}
                            >
                                Bókavinir Omega
                            </div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontWeight: 400,
                                    fontSize: 'clamp(30px, 3.6vw, 44px)',
                                    lineHeight: 1.12,
                                    color: 'var(--skra-djup)',
                                    textWrap: 'balance',
                                }}
                            >
                                Fáðu bókina senda heim — og vertu með frá upphafi.
                            </h2>
                            <div
                                style={{
                                    marginTop: '24px',
                                    display: 'grid',
                                    gap: '1.2em',
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(16px, 1.3vw, 18px)',
                                    lineHeight: 1.7,
                                    color: 'rgba(63,47,35,0.85)',
                                }}
                            >
                                <p style={{ margin: 0 }}>
                                    Skráðu nafn og heimilisfang hér til hliðar og við sendum
                                    þér <em>90 mínútur á himnum</em> heim.
                                </p>
                                <p style={{ margin: 0 }}>
                                    Sem bókavinur ertu jafnframt á lista yfir þau sem heyra
                                    fyrst þegar næsta bók kemur út. Þetta er upphafið að
                                    nýjum kafla í starfi Omega — og þú ert boðin(n) með frá
                                    fyrstu blaðsíðu.
                                </p>
                            </div>
                        </div>

                        {/* the form on its own paper card */}
                        <div
                            style={{
                                background: 'rgba(255,253,248,0.6)',
                                border: '1px solid rgba(63,47,35,0.14)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'clamp(28px, 3.5vw, 44px)',
                                boxShadow: '0 18px 48px rgba(63,47,35,0.08)',
                            }}
                        >
                            <BokavinirForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 5 · The road ahead ═══ */}
            <section style={{ background: 'var(--nott)', borderTop: '1px solid var(--border)' }}>
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
                                    lineHeight: 1.6,
                                    color: 'var(--moskva)',
                                    maxWidth: '38rem',
                                    marginInline: 'auto',
                                }}
                            >
                                Þetta er fyrsta bókin af mörgum — fleiri eru á leiðinni.
                                Og sýnin nær lengra: app fyrir hljóð- og rafbækur er í
                                smíðum.
                            </p>
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
