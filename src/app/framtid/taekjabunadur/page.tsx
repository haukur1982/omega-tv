'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Camera, Zap, Sparkles, ArrowLeft, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TaekjabunadurPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1533440842484-bfaf1f03a71b?q=80&w=2072&auto=format&fit=crop"
                        alt="High-end Camera Lens"
                        fill
                        className="object-cover opacity-20"
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
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">Nýr Tækjabúnaður</h1>
                        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            Besta orðinu fylgir besta tæknin. Við erum að uppfæra okkar stúdíó til að mæta nútíma kröfum um gæði og fagmennsku.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <section className="py-24 container mx-auto px-6 lg:px-24">
                <div className="grid md:grid-cols-2 gap-24 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-[4/3] relative rounded-3xl overflow-hidden shadow-2xl -rotate-1">
                            <Image
                                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop"
                                alt="Modern Studio Equipment"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-purple-900/10 mix-blend-overlay" />
                        </div>
                        <div className="absolute -top-10 -left-10 w-64 h-64 bg-purple-500/20 blur-[100px] -z-10" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Camera size={32} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
                            Gæði sem skipta máli
                        </h2>
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                            Nýjar 4K myndavélar, kvikmyndaleg lýsing og tærara hljóð. Þetta snýst ekki bara um tækni, heldur um að fjarlægja truflanir svo boðskapurinn komist til skila með sem hreinustum hætti.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: Settings, label: "Sjálfvirkni" },
                                { icon: Zap, label: "Hraði" },
                                { icon: Sparkles, label: "Kvikmyndagæði" },
                                { icon: Zap, label: "Skýrleiki" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <item.icon size={20} className="text-[var(--accent-gold)]" />
                                    <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Technical Focus Grid & Progress */}
                <div className="space-y-16 mb-32">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Myndavélar", desc: "85% lokið - Nýjar einingar sem skila dýpt og litum í hæsta gæðaflokki.", progress: 85, color: "from-purple-500 to-blue-500" },
                            { title: "Lýsing", desc: "40% lokið - Nútímaleg LED lýsing sem skapar andrúmsloft og fagmannlegt útlit.", progress: 40, color: "from-blue-500 to-cyan-500" },
                            { title: "Hljóð & Subtitles", desc: "20% lokið - Hágæða hljóðkerfi og tækni fyrir sjálfvirka textun.", progress: 20, color: "from-cyan-500 to-teal-500" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                            >
                                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--accent-gold)] transition-colors">{item.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-6">{item.desc}</p>

                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${item.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full bg-gradient-to-r ${item.color}`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 rounded-2xl bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10 text-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-gold)] mb-2">Næsti áfangi</p>
                        <p className="text-[var(--text-secondary)]">Þegar 100% markinu er náð í lýsingu, getum við hafið upptökur á nýrri þáttaröð í háskerpu.</p>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-[var(--bg-surface)] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-[var(--glass-border)]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15)_0%,transparent_70%)]" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <Camera className="mx-auto mb-8 text-purple-500" size={48} />
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Viltu hjálpa okkur að uppfæra?</h2>
                        <p className="text-xl text-[var(--text-secondary)] mb-12">
                            Þitt framlag fer beint í kaup á nýjum tækjabúnaði sem mun þjóna okkur næstu árin.
                        </p>
                        <Link href="/give" className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--accent-gold)] text-black font-bold rounded-full hover:scale-105 transition-transform">
                            Styrkja Tækjakaup <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
