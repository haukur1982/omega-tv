'use client';

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

const milestones = [
    { year: "1992", title: "Sýnin Fæðist", desc: "Sumarið 1992 hóf Eiríkur Sigurbjörnsson rekstur sjónvarpsstöðvarinnar Omega í Reykjavík." },
    { year: "1994", title: "Stórviðburðir", desc: "Benny Hinn heimsótti Ísland 1994 og 1995. Ríflega 11 þúsund manns sóttu samkomurnar." },
    { year: "2002", title: "Gospel Channel", desc: "Útsendingar hófust um gervihnött til Skandinavíu og náðu síðar til milljóna heimila í Evrópu, Mið-Austurlöndum og Norður-Afríku." },
    { year: "Í Dag", title: "Omega Stöðin", desc: "Kristinn miðill — von og sannleikur fyrir Ísland. Bein útsending, þáttasafn, bænir og fræðsluefni á íslensku." },
];

const values = [
    { title: "Fagnaðarerindið á Íslensku", desc: "Við framleiðum og þýðum efni á móðurmálinu svo sérhvert heimili á Íslandi geti heyrt boðskapinn." },
    { title: "Trúverðug Miðlun", desc: "Í yfir 34 ár höfum við boðað von og sannleika með heiðarleika og gæðum." },
    { title: "Þjóðin Öll", desc: "Frá Reykjavík til sveitanna — Omega er fyrir alla Íslendinga, á öllum aldri." },
    { title: "Næsta Kynslóð", desc: "Við byggjum brýr milli kynslóða með nýrri tækni og nýjum leiðum til að miðla trúnni." },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] overflow-hidden">
            <Navbar />

            {/* Hero — Full bleed image with text overlay */}
            <div className="relative h-[80vh] flex items-end overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2600&auto=format&fit=crop"
                    alt="Ísland"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-deep)]/70 via-transparent to-transparent" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 w-full">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-6"
                    >
                        Síðan 1992
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-bold leading-[0.9] tracking-tight mb-6"
                        style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 8vw, 6rem)' }}
                    >
                        Ljós Vonar.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-xl"
                    >
                        Í rúmlega 34 ár höfum við verið hjartsláttur kristinnar miðlunar á Íslandi.
                        Nýsköpun er okkar hefð. Fagnaðarerindið er okkar boðskapur.
                    </motion.p>
                </div>
            </div>

            {/* Big statement */}
            <section className="py-32 max-w-4xl mx-auto px-6 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="font-bold leading-snug tracking-tight"
                    style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}
                >
                    Eina kristna sjónvarpsstöðin á Íslandi. Stofnuð af trú, rekin af ást, varðveitt af Guði.
                </motion.p>
            </section>

            {/* Timeline with photo */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-16 items-start">

                        {/* Left: Photo */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="sticky top-32"
                        >
                            <div className="relative aspect-[3/4]">
                                <Image
                                    src="/history/broadcast-1992.jpg"
                                    alt="Omega 1992"
                                    fill
                                    className="object-cover grayscale"
                                />
                            </div>
                            <p className="text-[var(--text-muted)] text-xs mt-4 uppercase tracking-[0.15em]">Frá byrjun — 1992</p>
                        </motion.div>

                        {/* Right: Timeline entries */}
                        <div className="space-y-16">
                            {milestones.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <span className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] block mb-4">
                                        {item.year}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values — with visual weight */}
            <section className="py-32 border-t border-[var(--border)] bg-[var(--bg-surface)]">
                <div className="max-w-5xl mx-auto px-6">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Gildi okkar</p>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 'clamp(3rem, 6vw, 5rem)' }} className="font-bold tracking-tight leading-tight">
                        Stoðirnar sem starf<br />okkar hvílir á.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {values.map((val, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                                className="border-t border-[var(--border)] pt-8"
                            >
                                <span className="text-[var(--accent)] text-xs font-semibold tracking-[0.15em] block mb-4">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Söguleg augnablik</p>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 'clamp(2rem, 4vw, 4rem)' }} className="font-bold tracking-tight">
                        Glimt af vegferð okkar.
                    </h2>

                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {[
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
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.03 }}
                                className="relative break-inside-avoid overflow-hidden group mb-4"
                            >
                                <img
                                    src={item.src}
                                    alt="Omega saga"
                                    className="w-full h-auto object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4">
                                    <span className="text-[var(--accent)] text-[10px] font-semibold tracking-[0.2em] uppercase">{item.date}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
