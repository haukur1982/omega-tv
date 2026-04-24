'use client';

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

// Inline SVG icons
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 12,15 16,10"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const TvIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17,2 12,7 7,2"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default function GivePage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] overflow-hidden">
            <Navbar />

            {/* ═══════════════════════════════════════════════════════════
                HERO — Cinematic with Icelandic northern lights
                ═══════════════════════════════════════════════════════════ */}
            <div className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2600&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ willChange: 'transform' }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-deep) 0%, rgba(12,10,8,0.7) 40%, rgba(12,10,8,0.4) 100%)' }} />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center bottom, rgba(111,165,216,0.08) 0%, transparent 70%)' }} />

                <div className="relative z-10 max-w-4xl text-center">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-semibold uppercase tracking-[0.25em] mb-10"
                        style={{ color: 'var(--accent)' }}
                    >
                        Styrkja Omega
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-bold leading-[0.85] tracking-tight mb-10"
                        style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 10vw, 7rem)' }}
                    >
                        Fjárfestu í<br />Eilífðinni.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="leading-relaxed max-w-2xl mx-auto"
                        style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                    >
                        Vertu hluti af því að bera ljós vonarinnar til íslensku þjóðarinnar.
                        Saman erum við rödd fagnaðarerindisins á Íslandi.
                    </motion.p>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5, y: [0, 8, 0] }}
                        transition={{ delay: 1, y: { repeat: Infinity, duration: 2 } }}
                        className="mt-16"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><polyline points="6,9 12,15 18,9"/></svg>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                IMPACT STATS — What your gift does
                ═══════════════════════════════════════════════════════════ */}
            <section style={{ borderTop: '1px solid var(--border)', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 6vw, 4rem)', fontWeight: 700, marginBottom: '0.5rem' }}>34</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Ár á lofti</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 6vw, 4rem)', fontWeight: 700, marginBottom: '0.5rem' }}>24/7</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Útsending</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 6vw, 4rem)', fontWeight: 700, marginBottom: '0.5rem' }}>1</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Þjóð</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                IMPACT AREAS — Where your money goes
                ═══════════════════════════════════════════════════════════ */}
            <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', borderTop: '1px solid var(--border)' }}>
                <div className="max-w-5xl mx-auto px-6">
                    <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', marginBottom: '1rem' }}>
                        Hvert fer stuðningurinn?
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em' }}>
                        Hver króna skiptir máli.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <TvIcon />, title: 'Dagleg útsending', desc: 'Framleiðsla og útsending 24/7 sjónvarpsefnis sem nær til allra Íslendinga.' },
                            { icon: <HeartIcon />, title: 'Nýtt efni', desc: 'Innlend efnisgerð — námskeið, viðtöl, heimildamyndir og uppbyggilegt efni. ' },
                            { icon: <UsersIcon />, title: 'Samfélag', desc: 'Bænatorg, fréttabréf, og samfélagsverkefni sem styrkja fólk um allt land.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    padding: '2rem',
                                    borderRadius: '12px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                QUOTE — Emotional pull
                ═══════════════════════════════════════════════════════════ */}
            <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <motion.blockquote
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                            fontWeight: 500,
                            lineHeight: 1.6,
                            fontStyle: 'italic',
                            color: 'var(--text-primary)',
                            margin: 0,
                        }}
                    >
                        &ldquo;Það er forréttindi að búa á Íslandi. Saman getum við borið ljós vonarinnar
                        inn á hvert heimili í landinu. Þetta er okkar kall — og það er fagnaðarefni.&rdquo;
                    </motion.blockquote>
                    <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        — Omega Stöðin
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                HOW TO GIVE — Aur + Bank Transfer
                ═══════════════════════════════════════════════════════════ */}
            <section style={{
                padding: 'clamp(4rem, 8vw, 6rem) 0',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-surface)',
            }}>
                <div className="max-w-4xl mx-auto px-6">
                    <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', marginBottom: '1rem' }}>
                        Hvernig á að styrkja
                    </p>
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 700,
                        textAlign: 'center',
                        marginBottom: 'clamp(3rem, 6vw, 5rem)',
                        letterSpacing: '-0.02em',
                    }}>
                        Tvær leiðir.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

                        {/* Aur */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', display: 'block', marginBottom: '1.5rem' }}>01</span>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Aur</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                                Einfaldasta leiðin. Opnaðu Aur appið og sendu á:
                            </p>

                            <motion.a
                                href="aur://pay?t=6308901019"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    display: 'inline-block',
                                    width: '100%',
                                    maxWidth: '280px',
                                    padding: '18px 0',
                                    background: '#E53E3E',
                                    color: 'white',
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    transition: 'box-shadow 0.3s ease',
                                    boxShadow: '0 8px 30px rgba(229,62,62,0.25)',
                                }}
                            >
                                <span style={{ fontWeight: 900, fontStyle: 'italic', marginRight: '6px' }}>aur</span>
                                @Omega
                            </motion.a>
                        </motion.div>

                        {/* Bank Transfer */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center"
                        >
                            <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', display: 'block', marginBottom: '1.5rem' }}>02</span>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Millifærsla</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                                Styrktu boðskapinn með millifærslu — sérhver króna skiptir máli.
                            </p>

                            <div style={{ maxWidth: '260px', margin: '0 auto', textAlign: 'left' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px', fontWeight: 600 }}>Reikningsnúmer</p>
                                    <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.05em' }} className="select-all">0113–26–25707</p>
                                </div>
                                <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px', fontWeight: 600 }}>Kennitala</p>
                                    <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.05em' }} className="select-all">630890–1019</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                TRUST FOOTER
                ═══════════════════════════════════════════════════════════ */}
            <section style={{ padding: '2.5rem 0', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldIcon />
                        <span>Frjáls félagasamtök</span>
                    </div>
                    <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} className="hidden md:block" />
                    <div>Skattfrádráttarbært</div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
