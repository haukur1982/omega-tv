'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Rocket, Instagram, Youtube, ArrowLeft, ChevronRight, Mic2, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NaestaKynslodPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1557461762-e08315322e3d?q=80&w=2600&auto=format&fit=crop"
                        alt="Creator in Studio"
                        fill
                        className="object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-deep)]/50 to-[var(--bg-deep)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.1)_0%,transparent_50%)]" />
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
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-orange-500">Næsta Kynslóð</h1>
                        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            Við mætum nýju fólki á þeirra forsendum. Með hlaðvörpum, samfélagsmiðlum og skapandi nálgun tryggjum við framtíðina.
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
                        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Rocket size={32} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
                            Hvar er fólkið í dag?
                        </h2>
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                            Heimurinn hefur breyst og miðlunarleiðirnar með. Við viljum ekki bara bíða eftir fólki, heldur fara þangað sem það er. Það þýðir öflug viðvera á TikTok, Instagram og Youtube, ásamt vönduðu hlaðvarpsefni sem hægt er að hlusta á hvar og hvenær sem er.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400 h-fit">
                                    <Mic2 size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Hlaðvarps-Stúdíó</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">Vettvangur fyrir dýpri samtöl, vitnisburði og kennslu í hljóðformi.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400 h-fit">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Samfélagsmiðlar</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">Stutt, hnitmiðað og hvetjandi efni sem nær til yfir 100 þúsund manns í hverri viku.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative grid grid-cols-2 gap-4"
                    >
                        <div className="space-y-4">
                            <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-xl">
                                <Image src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" alt="Mobile Creation" fill className="object-cover" />
                            </div>
                            <div className="aspect-square relative rounded-2xl overflow-hidden shadow-xl">
                                <Image src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=2574&auto=format&fit=crop" alt="Social Media" fill className="object-cover" />
                            </div>
                        </div>
                        <div className="space-y-4 pt-8">
                            <div className="aspect-square relative rounded-2xl overflow-hidden shadow-xl">
                                <Image src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2070&auto=format&fit=crop" alt="Microphone" fill className="object-cover" />
                            </div>
                            <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-xl">
                                <Image src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" alt="Headphones" fill className="object-cover" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Platform Icons */}
                <div className="flex flex-wrap justify-center gap-12 mb-32 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <Instagram size={40} />
                    <Youtube size={40} />
                    <div className="text-2xl font-bold tracking-tighter">TIKTOK</div>
                    <div className="text-2xl font-bold tracking-tighter">SPOTIFY</div>
                    <Rocket size={40} />
                </div>

                {/* Call to Action */}
                <div className="bg-[var(--bg-surface)] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-[var(--glass-border)]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.15)_0%,transparent_70%)]" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <Rocket className="mx-auto mb-8 text-amber-500" size={48} />
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Viltu brúa bilið með okkur?</h2>
                        <p className="text-xl text-[var(--text-secondary)] mb-12">
                            Þitt framlag gerir okkur kleift að búa til efni sem talar tungumál unga fólksins.
                        </p>
                        <Link href="/give" className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--accent-gold)] text-black font-bold rounded-full hover:scale-105 transition-transform">
                            Styðja Nýja Kynslóð <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
