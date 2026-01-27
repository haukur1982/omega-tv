'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Tv, Heart, Sparkles, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DagskrargerdPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1504829857797-ddff29c27947?q=80&w=2070&auto=format&fit=crop"
                        alt="Icelandic Landscape"
                        fill
                        className="object-cover opacity-30 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-deep)]/50 to-[var(--bg-deep)]" />
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link href="/framtid" className="inline-flex items-center gap-2 text-[var(--accent-gold)] text-sm font-bold uppercase tracking-widest mb-8 hover:gap-3 transition-all">
                            <ArrowLeft size={16} /> Til baka í framtíðarsýn
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">Íslensk Dagskrárgerð</h1>
                        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            Boðskapurinn á okkar eigin tungumáli. Við trúum því að íslenskt efni hafi einstakan kraft til að snerta hjörtu þjóðarinnar.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <section className="py-24 container mx-auto px-6 lg:px-24">
                <div className="grid md:grid-cols-2 gap-24 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Tv size={32} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
                            Af hverju íslenskt efni skiptir máli
                        </h2>
                        <div className="space-y-6">
                            {[
                                { title: "Þýðingar 2026", progress: 65, color: "from-blue-500 to-cyan-500", desc: "Vinna við textun á nýjum þáttum er í fullum gangi." },
                                { title: "Íslensk Framleiðsla", progress: 45, color: "from-cyan-500 to-teal-500", desc: "4 nýir íslenskir þættir í tökum." }
                            ].map((item, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold uppercase tracking-wider">{item.title}</span>
                                        <span className="text-xs font-bold text-[var(--accent-gold)]">{item.progress}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${item.progress}%` }}
                                            transition={{ duration: 1.5 }}
                                            className={`h-full bg-gradient-to-r ${item.color}`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] italic">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-6">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-2xl font-bold text-white mb-1">1.200+</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Klukkustundir af efni</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-2xl font-bold text-white mb-1">100%</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Íslensk rödd</div>
                            </div>
                        </div>

                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                            Þótt mikið sé til af góðu erlendu efni, þá er það okkar eigin tungumál sem nær dýpst. Guð talar íslensku líka, og við viljum skapa vettvang þar sem íslenskir kristnir menn, kennarar og tónlistarfólk fær að njóta sín.
                        </p>
                        <div className="space-y-4">
                            {[
                                "Að efla íslenska trúarmenningu",
                                "Stuðningur við íslenska dagskrárgerðarmenn",
                                "Efni sem tekur mið af íslenskum veruleika",
                                "Vandaður undirbúningur og framleiðsla"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                                    <span className="text-[var(--text-secondary)] font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl skew-y-1">
                            <Image
                                src="https://images.unsplash.com/photo-1585672841ef8-d050630773d4?q=80&w=2073&auto=format&fit=crop"
                                alt="Studio Production"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/20 blur-[100px] -z-10" />
                    </motion.div>
                </div>

                {/* Call to Action */}
                <div className="bg-[var(--bg-surface)] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-[var(--glass-border)]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--primary-glow)_0%,transparent_70%)] opacity-10" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <Heart className="mx-auto mb-8 text-rose-500 animate-pulse" size={48} />
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Viltu styðja við íslenska dagskrárgerð?</h2>
                        <p className="text-xl text-[var(--text-secondary)] mb-12">
                            Þitt framlag gerir okkur kleift að halda áfram að framleiða vandað efni á okkar eigin tungumáli.
                        </p>
                        <Link href="/give" className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--accent-gold)] text-black font-bold rounded-full hover:scale-105 transition-transform">
                            Gerast Bakhjarl <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
