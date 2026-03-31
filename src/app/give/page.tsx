'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function GivePage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] overflow-hidden">
            <Navbar />

            {/* Hero — Cinematic with Icelandic landscape */}
            <div className="relative h-[80vh] flex items-end overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1509225770129-c9951ab42a9d?q=80&w=2600&auto=format&fit=crop"
                    alt="Ísland"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-deep)]/60 via-transparent to-transparent" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 w-full">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-6"
                    >
                        Styrkja
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tight mb-6"
                    >
                        Fjárfestu í<br />Eilífðinni.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg"
                    >
                        Framlag þitt gerir okkur kleift að framleiða vandað íslenskt efni og boða fagnaðarerindið til næstu kynslóðar.
                    </motion.p>
                </div>
            </div>

            {/* Impact statement */}
            <section className="py-32 max-w-4xl mx-auto px-6 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-4xl font-bold leading-snug tracking-tight"
                >
                    Þegar þú styrkir Omega, fjárfestir þú í íslenskri dagskrárgerð, þýðingu fagnaðarerindisins og framtíð kristinnar miðlunar á Íslandi.
                </motion.p>
            </section>

            {/* Aur — Primary CTA */}
            <section className="py-20 border-t border-[var(--border)]">
                <div className="max-w-lg mx-auto px-6 text-center">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-8">
                        Einfaldasta leiðin
                    </p>
                    <motion.a
                        href="aur://pay?t=6308901019"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="block w-full py-6 bg-[#E53E3E] text-white text-center font-bold text-xl transition-all flex items-center justify-center gap-3"
                    >
                        <span>Styrkja með</span>
                        <span className="font-extrabold italic">aur</span>
                        <span className="bg-white/20 text-sm py-1 px-3 ml-2">@Omega</span>
                    </motion.a>
                    <p className="text-[var(--text-muted)] mt-4 text-sm">
                        Sláðu inn <strong className="text-[var(--text-secondary)]">@Omega</strong> í Aur appið.
                    </p>
                </div>
            </section>

            {/* Bank Transfer */}
            <section className="py-20 border-t border-[var(--border)]">
                <div className="max-w-lg mx-auto px-6">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-8 text-center">
                        Millifærsla
                    </p>
                    <p className="text-[var(--text-secondary)] text-sm text-center mb-8">Fyrir stærri gjafir og fyrirtæki.</p>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--text-muted)] text-sm">Reikningsnúmer</span>
                            <span className="font-mono font-bold text-lg tracking-wider select-all">0113–26–25707</span>
                        </div>
                        <div className="w-full h-px bg-[var(--border)]" />
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--text-muted)] text-sm">Kennitala</span>
                            <span className="font-mono font-bold text-lg tracking-wider select-all">630890–1019</span>
                        </div>
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
