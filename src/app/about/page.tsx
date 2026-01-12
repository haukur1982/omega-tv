'use client';

import Navbar from "@/components/layout/Navbar";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Globe, Heart, Radio, Users } from "lucide-react";

const milestones = [
    { year: "1992", title: "Sýnin Fæðist", desc: "Sumarið 1992 hóf Eiríkur Sigurbjörnsson rekstur sjónvarpsstöðvarinnar Omega í Reykjavík." },
    { year: "1994", title: "Stórviðburðir", desc: "Benny Hinn heimsótti Ísland 1994 og 1995. Ríflega 11 þúsund manns sóttu samkomurnar." },
    { year: "2002", title: "Gospel Channel", desc: "Útsendingar hófust um gervihnött til Skandinavíu og náðu síðar til milljóna heimila í Evrópu, Mið-Austurlöndum og Norður-Afríku." },
    { year: "Í Dag", title: "Landsdekkandi", desc: "Dagskrá Omega er aðgengileg um allt land gegnum Sjónvarp Símans og á netinu. Heimakirkja Omega er starfandi söfnuður okkar." },
];

const values = [
    { icon: Globe, title: "Öll Heimsbyggðin", desc: "Við ryðjum brautina svo fagnaðarerindið nái inn á hvert heimili." },
    { icon: Heart, title: "Kærleikur í Verki", desc: "Við þjónum samfélaginu með sýnilegum kærleika." },
    { icon: Radio, title: "Nýsköpun", desc: "Nýtum nýjustu tækni til að efla Guðs ríki." },
    { icon: Users, title: "Fjölskylda", desc: "Við byggjum upp samfélag, ekki bara áhorfendahóp." },
];

export default function AboutPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <main ref={containerRef} className="min-h-screen bg-[var(--bg-deep)] text-white overflow-hidden">
            <Navbar />

            {/* Parallax Hero */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-deep)] z-10" />
                {/* Animated Background Blob */}
                <motion.div style={{ y }} className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary-glow)] rounded-full blur-[150px] opacity-20" />
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--accent-gold)] rounded-full blur-[120px] opacity-10" />
                </motion.div>

                <div className="relative z-20 text-center max-w-4xl px-6">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block mb-4 text-[var(--accent-gold)] font-bold tracking-[0.3em] uppercase text-sm"
                    >
                        SÍÐAN 1992
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-6xl md:text-8xl font-bold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
                    >
                        Ljós <br /> Vonar.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed"
                    >
                        Í rúmlega 30 ár höfum við verið hjartsláttur kristinnar miðlunar á Íslandi.
                        <br className="hidden md:block" /> Nýsköpun er okkar hefð. Fagnaðarerindið er okkar boðskapur.
                    </motion.p>
                </div>
            </div>

            {/* History Timeline */}
            <section className="py-32 container mx-auto px-6 relative">
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[var(--glass-border)]" />

                <div className="space-y-24">
                    {milestones.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={`relative flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Flex Spacer */}
                            <div className="flex-1" />

                            {/* Timeline Dot */}
                            <div className="relative z-10 flex-shrink-0 w-4 h-4 rounded-full bg-[var(--accent-gold)] shadow-[0_0_20px_var(--accent-gold)] md:mx-12 ml-[5.5px]" />

                            {/* Content Card */}
                            <div className="flex-1 pl-12 md:pl-0">
                                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-8 rounded-[var(--radius-lg)] hover:border-[var(--accent-gold)] transition-colors">
                                    <span className="text-4xl font-bold text-white/10 absolute top-4 right-6">{item.year}</span>
                                    <h3 className="text-2xl font-bold mb-2 text-white">{item.title}</h3>
                                    <p className="text-[var(--text-secondary)]">{item.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Core Values Grid */}
            <section className="py-32 bg-black/20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold mb-4">Gildi Okkar</h2>
                        <p className="text-[var(--text-secondary)] text-lg">Stoðirnar sem starf okkar hvílir á.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((val, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--glass-border)] group hover:bg-[var(--glass-shine)] transition-all"
                            >
                                <div className="mb-6 w-12 h-12 rounded-full bg-[var(--primary-glow)]/10 flex items-center justify-center text-[var(--primary-glow)] group-hover:scale-110 transition-transform">
                                    <val.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team / Leadership Placeholder */}
            <section className="py-32 container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-16">Forysta</h2>
                <div className="inline-block p-1 bg-[var(--glass-border)] rounded-full">
                    <div className="px-8 py-4 bg-[var(--bg-surface)] rounded-full text-[var(--text-muted)]">
                        Myndir af Teyminu Væntanlegar
                    </div>
                </div>
            </section>


            {/* History Gallery */}
            <section className="py-20 bg-black/40">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Söguleg Augnablik</h2>
                        <p className="text-[var(--text-secondary)]">Glimt af vegferð okkar í gegnum árin.</p>
                    </div>

                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {[
                            { src: "/history/broadcast-1992.jpg", title: "Fyrstu skrefin", date: "1992" },
                            { src: "/history/founders-racks.jpg", title: "Stofnendur", date: "1994" },
                            { src: "/history/satellite-dish.jpg", title: "Gervihnattadiskurinn", date: "2000" },
                            { src: "/history/telethon-phones.jpg", title: "Söfnunarsímar", date: "Upphafsárin" },
                            { src: "/history/large-event.jpg", title: "Stórviðburður", date: "1995" },
                            { src: "/history/master-control.jpg", title: "Stjórnstöð", date: "2000s" },
                            { src: "/history/transmission-room.jpg", title: "Tæknibúnaður", date: "1992" },
                            { src: "/history/israel-agreement.jpg", title: "Alþjóðlegt samstarf", date: "1996" },
                            { src: "/history/editing-suite.jpg", title: "Klippistöð", date: "1998" },
                            { src: "/history/staff-lunch.jpg", title: "Góðar stundir", date: "1998" },
                            { src: "/history/station-exterior.jpg", title: "Húsnæðið", date: "1996" },
                            { src: "/history/studio-interview.jpg", title: "Viðtal í setti", date: "1995" },
                            { src: "/history/vision-planning.jpg", title: "Sýnin mótuð", date: "1990s" },
                            { src: "/history/building-transmission.jpg", title: "Uppbygging", date: "1992" },
                            { src: "/history/founders.jpg", title: "Brautryðjendur", date: "Upphafið" },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative break-inside-avoid rounded-[var(--radius-lg)] overflow-hidden group border border-[var(--glass-border)] mb-4"
                            >
                                <div className="relative">
                                    <img
                                        src={item.src}
                                        alt={item.title}
                                        className="w-full h-auto object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <span className="text-[var(--accent-gold)] text-xs font-bold tracking-widest uppercase mb-1 block">{item.date}</span>
                                        <h3 className="text-white text-sm font-bold">{item.title}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </main>
    );
}
