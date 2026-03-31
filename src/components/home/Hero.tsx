'use client';

import { motion } from 'framer-motion';
import { Play, Radio } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative w-full h-screen flex items-end overflow-hidden">
            {/* Background — Featured Content / Live Stream Visual */}
            <div className="absolute inset-0 z-0">
                {/* This will be replaced with actual content thumbnails or live stream preview */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster="https://images.unsplash.com/photo-1504829857797-ddff29c27927?q=80&w=2600&auto=format&fit=crop"
                >
                    {/* When we have a trailer/promo reel, it goes here */}
                </video>

                {/* Cinematic gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-deep)]/80 via-transparent to-transparent" />
            </div>

            {/* Content — Bottom-left like Netflix/Apple TV+ */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-2xl"
                >
                    {/* Live indicator */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                            Í loftinu núna
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-4">
                        Omega Stöðin
                    </h1>

                    <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-10 max-w-lg">
                        Kristinn miðill — von og sannleikur fyrir Ísland.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/live"
                            className="group flex items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-deep)] px-8 py-4 font-bold text-sm tracking-wide hover:bg-white transition-colors"
                        >
                            <Play size={18} fill="currentColor" />
                            Horfa Núna
                        </Link>
                        <Link
                            href="/sermons"
                            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-[var(--text-primary)] px-8 py-4 font-medium text-sm tracking-wide hover:bg-white/20 transition-colors"
                        >
                            <Radio size={18} />
                            Skoða Safnið
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
