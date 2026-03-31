'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Legacy34YearsComponent() {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">

                    {/* Left: Photo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="relative aspect-[4/3] w-full">
                            <Image
                                src="/history/broadcast-1992.jpg"
                                alt="Fyrsta útsending Omega 1992"
                                fill
                                className="object-cover grayscale"
                            />
                        </div>
                    </motion.div>

                    {/* Right: Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <p className="text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-[0.2em]">
                            Síðan 1992
                        </p>

                        <h2 className="text-5xl md:text-7xl font-bold leading-[0.9] tracking-tight">
                            34 ár<br />
                            í loftinu.
                        </h2>

                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-md">
                            Frá fyrstu útsendingu hefur Omega verið fastur punktur í tilveru
                            þúsunda Íslendinga. Við horfum björtum augum til framtíðar.
                        </p>

                        <Link
                            href="/about"
                            className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] border-b border-[var(--accent-gold)] pb-2 hover:text-[var(--accent-gold)] transition-colors"
                        >
                            Lestu Söguna
                            <span>→</span>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
