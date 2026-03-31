'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";

const milestones = [
    { year: "1992", title: "Sýnin Fæðist", desc: "Sumarið 1992 hóf Eiríkur Sigurbjörnsson rekstur sjónvarpsstöðvarinnar Omega í Reykjavík." },
    { year: "1994", title: "Stórviðburðir", desc: "Benny Hinn heimsótti Ísland 1994 og 1995. Ríflega 11 þúsund manns sóttu samkomurnar." },
    { year: "2002", title: "Gospel Channel", desc: "Útsendingar hófust um gervihnött til Skandinavíu og náðu síðar til milljóna heimila í Evrópu, Mið-Austurlöndum og Norður-Afríku." },
    { year: "Í Dag", title: "Omega Stöðin", desc: "Dagskrá Omega er aðgengileg um allt land gegnum Sjónvarp Símans og á netinu. Kristinn miðill — von og sannleikur fyrir Ísland." },
];

const values = [
    { title: "Öll Heimsbyggðin", desc: "Við ryðjum brautina svo fagnaðarerindið nái inn á hvert heimili." },
    { title: "Kærleikur í Verki", desc: "Við þjónum samfélaginu með sýnilegum kærleika." },
    { title: "Nýsköpun", desc: "Nýtum nýjustu tækni til að efla Guðs ríki." },
    { title: "Fjölskylda", desc: "Við byggjum upp samfélag, ekki bara áhorfendahóp." },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] overflow-hidden">
            <Navbar />

            {/* Hero */}
            <div className="pt-40 pb-24 text-center max-w-4xl mx-auto px-6">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-8"
                >
                    Síðan 1992
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9] tracking-tight"
                >
                    Ljós Vonar.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto"
                >
                    Í rúmlega 34 ár höfum við verið hjartsláttur kristinnar miðlunar á Íslandi.
                    Nýsköpun er okkar hefð. Fagnaðarerindið er okkar boðskapur.
                </motion.p>
            </div>

            {/* Timeline */}
            <section className="py-24 max-w-4xl mx-auto px-6">
                <div className="space-y-16">
                    {milestones.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="grid grid-cols-[80px_1fr] gap-8 items-start"
                        >
                            <span className="text-[var(--accent)] text-sm font-semibold uppercase tracking-[0.1em] pt-1">
                                {item.year}
                            </span>
                            <div className="border-t border-[var(--border)] pt-6">
                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="max-w-4xl mx-auto px-6">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Gildi okkar</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 tracking-tight">
                        Stoðirnar sem starf<br />okkar hvílir á.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {values.map((val, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                            >
                                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* History Gallery */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Söguleg augnablik</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 tracking-tight">
                        Glimt af vegferð okkar.
                    </h2>

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
                                    alt={item.title}
                                    className="w-full h-auto object-cover grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4">
                                    <span className="text-[var(--accent)] text-[10px] font-semibold tracking-[0.2em] uppercase block mb-1">{item.date}</span>
                                    <h3 className="text-sm font-bold">{item.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
