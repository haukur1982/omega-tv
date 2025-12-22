'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LegacySection() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

                {/* Left: Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-[1px] bg-[var(--accent-gold)]"></div>
                        <span className="text-[var(--accent-gold)] uppercase tracking-widest text-sm font-semibold">Síðan 1990</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Að byggja Guðs ríki <br />
                        <span className="text-white">einn þátt í einu.</span>
                    </h2>

                    <p className="text-lg text-[var(--text-secondary)] mb-6 leading-relaxed">
                        Í 33 ár hefur Omega TV verið ljós í myrkrinu og flutt fagnaðarerindið inn á íslensk heimili.
                        Sýn sem hófst smátt er nú orðin öflugt ráðuneyti sem brúar kynslóðir með krafti miðlunar.
                    </p>

                    <button className="text-white border-b border-[var(--accent-gold)] pb-1 hover:text-[var(--accent-gold)] transition-colors">
                        Lestu Okkar Sögu
                    </button>
                </motion.div>

                {/* Right: Visual Placeholder (Mockup for now) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative aspect-video rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-surface)] border border-[var(--glass-border)] flex items-center justify-center group"
                >
                    {/* Background Image - Studio/Broadcast Theme */}
                    <div className="absolute inset-0">
                        <Image
                            src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop"
                            alt="Omega TV History"
                            fill
                            className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/50 to-transparent" />
                    </div>

                    <div className="relative z-10 text-center p-8">
                        <span className="block text-7xl font-bold text-white mb-2 drop-shadow-2xl">33</span>
                        <span className="block text-xl text-[var(--accent-gold)] uppercase tracking-[0.5em] font-semibold">Ár í Loftinu</span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
