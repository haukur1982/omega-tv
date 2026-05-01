'use client';

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * /about — Omega Stöðin's history + identity (cathedral rhythm).
 *
 * Three-act composition:
 *   1. Dark hero        — Iceland landscape + "Ljós Vonar." (keeps the
 *                         cinematic arrival moment from the original)
 *   2. Cream story      — pull-quote + timeline. Reading-led act, this
 *                         is where the history is told carefully.
 *   3. Pergament values — four pillars on warm cream
 *   4. Dark gallery     — archival grayscale photos, museum feel.
 *                         Photos read better on dark.
 *
 * Tokens migrated from old system (`--accent`, `--text-secondary`,
 * `--bg-surface`) to Altingi palette throughout.
 */

const milestones = [
    { year: "1992", title: "Sýnin fæðist", desc: "Sumarið 1992 hóf Eiríkur Sigurbjörnsson rekstur sjónvarpsstöðvarinnar Omega í Reykjavík." },
    { year: "1994", title: "Stórviðburðir", desc: "Benny Hinn heimsótti Ísland 1994 og 1995. Ríflega 11 þúsund manns sóttu samkomurnar." },
    { year: "2002", title: "Gospel Channel", desc: "Útsendingar hófust um gervihnött til Skandinavíu og náðu síðar til milljóna heimila í Evrópu, Mið-Austurlöndum og Norður-Afríku." },
    { year: "Í dag", title: "Omega Stöðin", desc: "Kristinn miðill — von og sannleikur fyrir Ísland. Bein útsending, þáttasafn, bænir og fræðsluefni á íslensku." },
];

const values = [
    { title: "Fagnaðarerindið á íslensku", desc: "Við framleiðum og þýðum efni á móðurmálinu svo sérhvert heimili á Íslandi geti heyrt boðskapinn." },
    { title: "Trúverðug miðlun", desc: "Í yfir 34 ár höfum við boðað von og sannleika með heiðarleika og gæðum." },
    { title: "Þjóðin öll", desc: "Frá Reykjavík til sveitanna — Omega er fyrir alla Íslendinga, á öllum aldri." },
    { title: "Næsta kynslóð", desc: "Við byggjum brýr milli kynslóða með nýrri tækni og nýjum leiðum til að miðla trúnni." },
];

const gallery = [
    { src: "/history/broadcast-1992.jpg", date: "1992" },
    { src: "/history/founders-racks.jpg", date: "1990s" },
    { src: "/history/satellite-dish.jpg", date: "2000s" },
    { src: "/history/telethon-phones.jpg", date: "1990s" },
    { src: "/history/large-event.jpg", date: "1990s" },
    { src: "/history/master-control.jpg", date: "2000s" },
    { src: "/history/transmission-room.jpg", date: "1992" },
    { src: "/history/israel-agreement.jpg", date: "1990s" },
    { src: "/history/editing-suite.jpg", date: "1990s" },
    { src: "/history/staff-lunch.jpg", date: "1990s" },
    { src: "/history/station-exterior.jpg", date: "1990s" },
    { src: "/history/studio-interview.jpg", date: "1990s" },
];

export default function AboutPage() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)', overflow: 'hidden' }}>
            <Navbar />

            {/* ─── Dark hero ─────────────────────────────────────────── */}
            <section
                style={{
                    position: 'relative',
                    height: '80vh',
                    minHeight: '600px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    overflow: 'hidden',
                    background: 'var(--nott)',
                }}
            >
                <Image
                    src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2600&auto=format&fit=crop"
                    alt="Ísland"
                    fill
                    priority
                    style={{ objectFit: 'cover' }}
                />
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to top, var(--nott) 0%, rgba(20,18,15,0.6) 50%, transparent 100%)',
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
                {/* Dawn radial — warm corner light */}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(ellipse at 82% 18%, rgba(233,168,96,0.14) 0%, transparent 55%)',
                    }}
                />

                <div style={{ position: 'relative', zIndex: 2, maxWidth: '80rem', margin: '0 auto', padding: '0 var(--rail-padding) clamp(80px, 10vw, 120px)', width: '100%' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--gull)',
                                marginBottom: '24px',
                            }}
                        >
                            Síðan 1992 · Um Omega
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
                                marginBottom: '28px',
                            }}
                        >
                            Ljós vonar.
                        </h1>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(20px, 1.8vw, 25px)',
                                lineHeight: 1.55,
                                color: 'var(--moskva)',
                                maxWidth: '34rem',
                                textWrap: 'pretty',
                            }}
                        >
                            Í rúmlega 34 ár höfum við verið hjartsláttur kristinnar miðlunar á Íslandi. Nýsköpun er okkar hefð. Fagnaðarerindið er okkar boðskapur.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ─── Cream story body — pull-quote + timeline ──────────── */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div style={{ maxWidth: '50rem', margin: '0 auto', padding: 'clamp(80px, 11vw, 128px) var(--rail-padding) clamp(56px, 7vw, 80px)', textAlign: 'center' }}>
                    {/* Centered ornament */}
                    <div
                        aria-hidden
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '14px',
                            marginBottom: '32px',
                            maxWidth: '20rem',
                            marginInline: 'auto',
                        }}
                    >
                        <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.32)' }} />
                        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                            <path
                                d="M7 1L8.2 5.8L13 7L8.2 8.2L7 13L5.8 8.2L1 7L5.8 5.8L7 1Z"
                                fill="var(--gull)"
                                opacity="0.7"
                            />
                        </svg>
                        <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.32)' }} />
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(24px, 3vw, 36px)',
                            lineHeight: 1.35,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.012em',
                            textWrap: 'balance',
                        }}
                    >
                        Eina kristna sjónvarpsstöðin á Íslandi. Stofnuð af trú, rekin af ást, varðveitt af Guði.
                    </motion.p>
                </div>
            </section>

            {/* ─── Cream timeline ────────────────────────────────────── */}
            <section
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                    borderTop: '1px solid rgba(63,47,35,0.1)',
                }}
            >
                <div style={{ maxWidth: '76rem', margin: '0 auto', padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)' }}>
                    <header style={{ marginBottom: 'clamp(40px, 5vw, 64px)', maxWidth: '50rem' }}>
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
                            Sagan
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(32px, 4vw, 48px)',
                                lineHeight: 1.08,
                                fontWeight: 400,
                                color: 'var(--skra-djup)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Frá fyrstu útsendingu.
                        </h2>
                    </header>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                            gap: 'clamp(40px, 5vw, 64px)',
                            alignItems: 'start',
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            style={{ position: 'sticky', top: '120px' }}
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    aspectRatio: '3/4',
                                    width: '100%',
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                    background: 'rgba(63,47,35,0.1)',
                                    boxShadow: '0 24px 48px -28px rgba(20,18,15,0.4)',
                                }}
                            >
                                <Image
                                    src="/history/broadcast-1992.jpg"
                                    alt="Omega 1992"
                                    fill
                                    style={{ objectFit: 'cover', filter: 'grayscale(1) contrast(1.05)' }}
                                />
                            </div>
                            <p
                                style={{
                                    marginTop: '14px',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: 'var(--skra-mjuk)',
                                }}
                            >
                                Frá byrjun · 1992
                            </p>
                        </motion.div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(40px, 5vw, 56px)' }}>
                            {milestones.map((item, idx) => (
                                <motion.article
                                    key={idx}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.08 }}
                                >
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
                                        {item.year}
                                    </div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontFamily: 'var(--font-serif)',
                                            fontSize: 'clamp(22px, 2.4vw, 30px)',
                                            lineHeight: 1.15,
                                            fontWeight: 400,
                                            color: 'var(--skra-djup)',
                                            letterSpacing: '-0.005em',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        {item.title}
                                    </h3>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontFamily: 'var(--font-serif)',
                                            fontSize: 'clamp(16px, 1.4vw, 18px)',
                                            lineHeight: 1.65,
                                            color: 'var(--skra-mjuk)',
                                            textWrap: 'pretty',
                                        }}
                                    >
                                        {item.desc}
                                    </p>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Pergament values ──────────────────────────────────── */}
            <section
                style={{
                    background: 'var(--skra-warm)',
                    color: 'var(--skra-djup)',
                    borderTop: '1px solid rgba(63,47,35,0.12)',
                }}
            >
                <div style={{ maxWidth: '64rem', margin: '0 auto', padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)' }}>
                    <header style={{ marginBottom: 'clamp(40px, 5vw, 64px)', maxWidth: '50rem' }}>
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
                            Gildi okkar
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
                            Stoðirnar sem starf okkar hvílir á.
                        </h2>
                    </header>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                            gap: 'clamp(36px, 4vw, 56px)',
                        }}
                    >
                        {values.map((val, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.06 }}
                                style={{
                                    paddingTop: '32px',
                                    borderTop: '1px solid rgba(63,47,35,0.16)',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: '14px',
                                        color: 'var(--gull)',
                                        marginBottom: '12px',
                                        fontFeatureSettings: '"lnum", "tnum"',
                                    }}
                                >
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: 'clamp(20px, 2vw, 24px)',
                                        lineHeight: 1.18,
                                        fontWeight: 400,
                                        color: 'var(--skra-djup)',
                                        letterSpacing: '-0.005em',
                                        marginBottom: '12px',
                                    }}
                                >
                                    {val.title}
                                </h3>
                                <p
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '15.5px',
                                        lineHeight: 1.65,
                                        color: 'var(--skra-mjuk)',
                                        textWrap: 'pretty',
                                    }}
                                >
                                    {val.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Dark gallery ──────────────────────────────────────── */}
            <section
                style={{
                    background: 'var(--mold)',
                    borderTop: '1px solid var(--border)',
                    padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)',
                }}
            >
                <div style={{ maxWidth: '76rem', margin: '0 auto' }}>
                    <header style={{ marginBottom: 'clamp(36px, 4vw, 56px)', maxWidth: '50rem' }}>
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
                            Söguleg augnablik
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(28px, 3.2vw, 40px)',
                                lineHeight: 1.1,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            Glimt af vegferð okkar.
                        </h2>
                    </header>

                    <div style={{ columns: '1', columnGap: '16px' }} className="about-gallery">
                        {gallery.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.03 }}
                                style={{
                                    position: 'relative',
                                    breakInside: 'avoid',
                                    overflow: 'hidden',
                                    marginBottom: '16px',
                                    borderRadius: 'var(--radius-sm)',
                                }}
                                className="about-gallery-item"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.src}
                                    alt="Omega saga"
                                    className="about-gallery-img"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'cover',
                                        filter: 'grayscale(1) brightness(0.85)',
                                        opacity: 0.75,
                                        transition: 'filter 600ms ease, opacity 600ms ease',
                                    }}
                                />
                                <div
                                    aria-hidden
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(20,18,15,0.7) 0%, transparent 50%)',
                                        pointerEvents: 'none',
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '14px',
                                        left: '16px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '10.5px',
                                            fontWeight: 700,
                                            letterSpacing: '0.22em',
                                            textTransform: 'uppercase',
                                            color: 'var(--gull)',
                                        }}
                                    >
                                        {item.date}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />

            {/* Responsive masonry columns */}
            <style>{`
                @media (min-width: 720px) {
                    .about-gallery { column-count: 2; }
                }
                @media (min-width: 1100px) {
                    .about-gallery { column-count: 3; }
                }
                .about-gallery-item:hover .about-gallery-img {
                    filter: grayscale(0) brightness(1);
                    opacity: 1;
                }
            `}</style>
        </main>
    );
}
