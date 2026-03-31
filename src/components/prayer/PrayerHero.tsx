'use client';

import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function PrayerHero({ totalPrayCount }: { totalPrayCount: number }) {
    const count = useMotionValue(0);
    const spring = useSpring(count, { stiffness: 30, damping: 20 });
    const display = useTransform(spring, (val) => Math.round(val).toLocaleString('is-IS'));

    useEffect(() => {
        count.set(totalPrayCount);
    }, [totalPrayCount, count]);

    return (
        <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
            {/* Warm, lighter background */}
            <img
                src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2600&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)]/40 to-[var(--bg-deep)]/90" />

            <div className="relative z-10">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-8"
                >
                    Bænatorg
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tight mb-6"
                >
                    Samfélag í bæn.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto mb-12"
                >
                    "Komið því fram með djörfung að hásæti náðarinnar, til þess
                    að við öðlumst miskunn og finnum náð."
                </motion.p>

                {/* Animated prayer counter */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col items-center gap-2"
                >
                    <motion.span className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
                        {display}
                    </motion.span>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em]">
                        bænir hafa verið beðnar
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
