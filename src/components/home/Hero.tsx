'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image - Icelandic Mountain */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2600&auto=format&fit=crop"
                    alt="Icelandic Mountain"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Cinematic Overlay - Darken for text readability */}
                <div className="absolute inset-0 bg-black/60" />
                {/* Gradient Blend - Fade into the deep background at the bottom */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[var(--bg-deep)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-xs font-medium uppercase tracking-wider mb-6 text-[var(--accent-gold)]">
                        Bein Útsending
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        Trú sem <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--text-secondary)]">
                            Flytur Fjöll
                        </span>
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
                        Upplifðu nýja vídd í þinni andlegu vegferð.
                        Lifandi tónlist, uppbyggjandi boðskap og samfélag trúaðra.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/live"
                            className="group relative px-8 py-4 bg-white text-black rounded-[var(--radius-md)] font-bold flex items-center gap-3 overflow-hidden transition-transform hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Play size={20} fill="currentColor" />
                            <span className="relative">Horfa Núna</span>
                        </Link>
                        <Link
                            href="/sermons"
                            className="px-8 py-4 rounded-[var(--radius-md)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors font-medium text-white"
                        >
                            Opna Brunninn
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-deep)] to-transparent" />
        </section>
    );
}
