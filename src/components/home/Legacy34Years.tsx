'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Legacy34YearsComponent() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Watermark Background */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20rem] font-bold text-white/[0.02] select-none pointer-events-none z-0 leading-none">
                1992
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">

                    {/* Left: Vintage Photo (Free Floating) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, type: "spring" }}
                        className="w-full md:w-1/2 relative"
                    >
                        <div className="relative aspect-[4/3] w-full max-w-lg mx-auto md:mx-0">
                            <Image
                                src="/history/broadcast-1992.jpg"
                                alt="Fyrsta útsending Omega 1992"
                                fill
                                className="object-cover rounded-sm shadow-2xl skew-y-1"
                            />
                            {/* Decorative Tape/Element */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/20 backdrop-blur-sm rotate-3 shadow-sm z-20"></div>
                        </div>
                    </motion.div>

                    {/* Right: Modern Typography */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-1/2"
                    >
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-[var(--accent-gold)] font-bold tracking-widest text-sm uppercase mb-4">
                                    Sögulegt Ferðalag
                                </h2>
                                <h3 className="text-5xl md:text-7xl font-black text-white leading-none">
                                    34 ÁR <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Í LOFTINU</span>
                                </h3>
                            </div>

                            <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-md">
                                Frá fyrstu útsendingu árið 1992 hefur Omega verið fastur punktur í tilveru þúsunda Íslendinga.
                                Við horfum björtum augum til framtíðar.
                            </p>

                            <Link
                                href="/about"
                                className="group inline-flex items-center gap-3 text-white border border-white/20 px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300"
                            >
                                <span className="font-bold tracking-wide">LESTU SÖGUNA</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
