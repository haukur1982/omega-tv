'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function GivePage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] overflow-hidden">
            <Navbar />

            {/* Hero — Cinematic with Icelandic imagery */}
            <div className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden">
                {/* Background image */}
                <img
                    src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2600&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[var(--bg-deep)]/75" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-[var(--bg-deep)]/40" />

                <div className="relative z-10 max-w-4xl text-center">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-10"
                    >
                        Styrkja Omega
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl lg:text-9xl font-bold leading-[0.85] tracking-tight mb-10"
                    >
                        Fjárfestu í<br />Eilífðinni.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto"
                    >
                        Framlag þitt heldur einustu kristnu sjónvarpsstöðinni á Íslandi á lofti.
                        Saman tryggjum við að boðskapurinn nái til næstu kynslóðar.
                    </motion.p>
                </div>
            </div>

            {/* Impact — What your gift does */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-5xl md:text-6xl font-bold mb-4">34</p>
                            <p className="text-sm text-[var(--text-secondary)] uppercase tracking-[0.15em]">Ár á lofti</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <p className="text-5xl md:text-6xl font-bold mb-4">24/7</p>
                            <p className="text-sm text-[var(--text-secondary)] uppercase tracking-[0.15em]">Útsending</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <p className="text-5xl md:text-6xl font-bold mb-4">1</p>
                            <p className="text-sm text-[var(--text-secondary)] uppercase tracking-[0.15em]">Þjóð</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Emotional pull */}
            <section className="py-32">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-3xl font-bold leading-relaxed tracking-tight"
                    >
                        "Það er forréttindi að búa á Íslandi. Saman getum við borið ljós vonarinnar
                        inn á hvert heimili í landinu. Þetta er okkar kall — og það er fagnaðarefni."
                    </motion.p>
                    <p className="text-[var(--text-muted)] mt-6 text-sm italic">
                        — Omega Stöðin
                    </p>
                </div>
            </section>

            {/* How to give */}
            <section className="py-24 border-t border-[var(--border)] bg-[var(--bg-surface)]">
                <div className="max-w-4xl mx-auto px-6">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-center">
                        Hvernig á að styrkja
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold mb-20 tracking-tight text-center">
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
                            <span className="text-[var(--accent)] text-xs font-semibold tracking-[0.15em] block mb-6">01</span>
                            <h3 className="text-2xl font-bold mb-4">Aur</h3>
                            <p className="text-[var(--text-secondary)] text-sm mb-8">Einfaldasta leiðin. Opnaðu Aur appið og sendu á:</p>

                            <motion.a
                                href="aur://pay?t=6308901019"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-block w-full max-w-xs py-5 bg-[#E53E3E] text-white text-center font-bold text-lg transition-all"
                            >
                                <span className="font-extrabold italic mr-2">aur</span>
                                @Omega
                            </motion.a>
                        </motion.div>

                        {/* Bank */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center"
                        >
                            <span className="text-[var(--accent)] text-xs font-semibold tracking-[0.15em] block mb-6">02</span>
                            <h3 className="text-2xl font-bold mb-4">Millifærsla</h3>
                            <p className="text-[var(--text-secondary)] text-sm mb-8">Millifærðu hvaða upphæð sem er beint á reikninginn okkar.</p>

                            <div className="space-y-5 text-left max-w-xs mx-auto">
                                <div>
                                    <p className="text-[var(--text-muted)] text-xs uppercase tracking-[0.15em] mb-1">Reikningsnúmer</p>
                                    <p className="font-mono font-bold text-xl tracking-wider select-all">0113–26–25707</p>
                                </div>
                                <div className="w-full h-px bg-[var(--border)]" />
                                <div>
                                    <p className="text-[var(--text-muted)] text-xs uppercase tracking-[0.15em] mb-1">Kennitala</p>
                                    <p className="font-mono font-bold text-xl tracking-wider select-all">630890–1019</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust footer */}
            <section className="py-16 border-t border-[var(--border)]">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-[var(--text-muted)] text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} />
                        <span>Frjáls félagasamtök</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-[var(--border)]" />
                    <div>Skattfrádráttarbært</div>
                </div>
            </section>
        </main>
    );
}
