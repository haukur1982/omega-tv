'use client';

import { motion } from 'framer-motion';
import { Camera, Languages, Users, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const milestones = [
    {
        id: 'studio',
        title: "Nýr Tækjabúnaður",
        desc: "Phase 1: 4K Myndavélar & Lýsing",
        progress: 85,
        icon: Camera,
        color: "from-purple-500 to-blue-500",
        impact: "Hækkar gæði beinna útsendinga"
    },
    {
        id: 'translation',
        title: "Textun & Þýðingar",
        desc: "Undirbúningur fyrir 2026",
        progress: 60,
        icon: Languages,
        color: "from-blue-500 to-cyan-500",
        impact: "Opnar boðskapinn fyrir fleirum"
    },
    {
        id: 'youth',
        title: "Næsta Kynslóð",
        desc: "Hlaðvarpsstúdíó & Samfélagsmiðlar",
        progress: 45,
        icon: Users,
        color: "from-orange-500 to-amber-500",
        impact: "Nær til ungs fólks á stafrænum miðlum"
    }
];

const mockFeed = [
    "Nýr bakhjarl bættist í hópinn frá Akureyri",
    "Ljósabúnaður fyrir nýja stúdíóið hefur verið pantaður",
    "Þýðingar á nýrri þáttaröð eru hafnar",
    "Bakhjarl frá Reykjavík vildi styrkja tækjakaup",
    "Stúdíóuppfærsla er 85% lokið í þessum áfanga"
];

export default function VisionProgress() {
    const [feedIndex, setFeedIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setFeedIndex((prev) => (prev + 1) % mockFeed.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 container mx-auto px-6">
            <div className="max-w-6xl mx-auto">

                {/* Header with Impact Stats */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-16">
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-[var(--accent)] text-sm font-bold uppercase tracking-widest mb-4"
                        >
                            <TrendingUp size={16} />
                            Framvinda Verksins
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Breytum Íslandi saman</h2>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                            Við erum ekki bara að byggja sjónvarpsstöð. Við erum að skapa vettvang fyrir
                            kraftaverk, trú og von. Hér getur þú séð hvernig við erum að styrkja innviðina
                            til að mæta framtíðinni.
                        </p>
                    </div>

                    {/* Live-style Vision Feed */}
                    <div className="w-full md:w-80 p-6 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden h-40 flex flex-col justify-center">
                        <div className="absolute top-4 left-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Bein Uppfærsla</span>
                        </div>
                        <motion.div
                            key={feedIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-sm font-medium leading-relaxed italic text-white/80"
                        >
                            "{mockFeed[feedIndex]}"
                        </motion.div>
                        <div className="absolute bottom-0 left-0 h-1 bg-[var(--accent)]/20 w-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[var(--accent)]"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Milestone Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {milestones.map((m, idx) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-8 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--glass-border)] hover:border-[var(--accent)]/50 transition-all relative overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg`}>
                                        <m.icon size={24} className="text-white" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-white">{m.progress}%</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Nálgast Takmark</div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-8 line-clamp-1">{m.desc}</p>

                                {/* Progress Bar Container */}
                                <div className="h-2 w-full bg-white/5 rounded-full mb-6 overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${m.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full bg-gradient-to-r ${m.color} relative`}
                                    >
                                        <div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-sm" />
                                    </motion.div>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] italic">
                                    <Sparkles size={12} className="text-[var(--accent)]" />
                                    {m.impact}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Motivational Footer */}
                <div className="mt-20 text-center">
                    <p className="text-[var(--text-muted)] text-sm mb-8 flex items-center justify-center gap-2">
                        <Heart size={14} className="text-rose-500" />
                        Þetta er samvinnuverkefni trúaðra um allt Ísland. Hvert framlag telur.
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        <div className="h-px w-12 bg-[var(--glass-border)]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Vertu með í dag</span>
                        <div className="h-px w-12 bg-[var(--glass-border)]" />
                    </div>
                </div>

            </div>
        </section>
    );
}
