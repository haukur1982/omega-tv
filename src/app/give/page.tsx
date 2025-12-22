'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Heart, CreditCard, ShieldCheck, Globe, Zap, Gift, Film } from "lucide-react";

export default function GivePage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white overflow-hidden">
            <Navbar />

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent-gold)] opacity-[0.05] rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary-glow)] opacity-[0.05] rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 pt-32 pb-20 container mx-auto px-6 max-w-5xl">

                {/* Hero Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-[var(--accent-gold)] font-bold uppercase tracking-[0.2em] mb-4 inline-block text-sm bg-[var(--glass-bg)] px-4 py-2 rounded-full border border-[var(--glass-border)]">
                            Vertu hluti af sýninni
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 mt-6">
                            Fjárfestu í <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[var(--text-secondary)]">
                                Eilífðinni.
                            </span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
                            Framlag þitt gerir okkur kleift að framleiða vandað íslenskt efni og boða fagnaðarerindið til næstu kynslóðar.<br />
                            Saman byggjum við upp ríki Guðs.
                        </p>
                    </motion.div>
                </div>

                {/* Impact Visuals (Why Give?) */}
                <div className="grid md:grid-cols-3 gap-6 mb-24">
                    {[
                        { icon: Film, label: "Íslenskt Efni", desc: "Vönduð framleiðsla á móðurmálinu." },
                        { icon: Heart, label: "Boðskapur Vonar", desc: "Fagnaðarerindið inn á hvert heimili." },
                        { icon: Gift, label: "Eilífðar Sýn", desc: "Fjárfestum í því sem varir." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-6 rounded-[var(--radius-lg)]"
                        >
                            <div className="mx-auto w-12 h-12 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                                <item.icon size={20} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{item.label}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Aur Section (mobile-first optimizations) */}
                <div className="max-w-md mx-auto mb-16">
                    <motion.a
                        href="aur://pay?t=6308901019" // Deep link attempt, otherwise just fallback
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="block w-full py-5 rounded-full bg-[#E53E3E] text-white text-center font-bold text-xl shadow-[0_0_30px_rgba(229,62,62,0.4)] hover:shadow-[0_0_50px_rgba(229,62,62,0.6)] transition-all flex items-center justify-center gap-3"
                    >
                        <span>Styrkja með</span>
                        <span className="font-extrabold italic">aur</span>
                        <span className="bg-white/20 text-sm py-1 px-3 rounded-md ml-2">@Omega</span>
                    </motion.a>
                    <p className="text-center text-[var(--text-muted)] mt-4 text-sm">
                        Einfaldasta leiðin til að gefa. Sláðu inn <strong>@Omega</strong> í Aur appið.
                    </p>
                </div>

                {/* Main Donation Grid */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch mb-20">

                    {/* Left: Bank Transfer (Direct) */}
                    <div className="p-8 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--glass-border)] flex flex-col justify-center">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">Millifærsla</h3>
                            <p className="text-[var(--text-secondary)] text-sm">Fyrir stærri gjafir og fyrirtæki.</p>
                        </div>

                        <div className="space-y-4 bg-black/20 p-6 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-muted)]">Reikningsnúmer:</span>
                                <span className="font-mono font-bold tracking-wider select-all">0113-26-25707</span>
                            </div>
                            <div className="w-full h-px bg-white/10" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-muted)]">Kennitala:</span>
                                <span className="font-mono font-bold tracking-wider select-all">630890-1019</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Monthly Partner (Card) */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="relative p-8 rounded-[2rem] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-deep)] border border-[var(--accent-gold)] shadow-[0_0_30px_rgba(212,175,55,0.1)] flex flex-col overflow-hidden"
                    >
                        {/* Gold Shine Effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent-gold)]" />
                        <div className="absolute top-4 right-4 bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] text-[10px] font-bold px-3 py-1 rounded-full border border-[var(--accent-gold)]/20 tracking-wider">
                            VINSÆLAST
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Omega Félagi</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Mánaðarlegur stuðningur</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {['1.500', '3.000', '5.000'].map(amt => (
                                    <button key={amt} className="py-2 rounded-lg border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5 hover:bg-[var(--accent-gold)]/20 transition-colors text-sm font-bold text-[var(--accent-gold)]">
                                        {amt}
                                    </button>
                                ))}
                            </div>
                            <button className="w-full py-3 rounded-[var(--radius-md)] bg-[var(--accent-gold)] text-black font-bold hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                                Gerast Félagi (Kort)
                            </button>
                            <p className="text-center text-[10px] text-[var(--text-muted)] pt-2">
                                Örugg greiðslugátt í gegnum Straumur / SaltPay.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Trust Badges */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 text-[var(--text-muted)] text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} />
                        <span>256-bita SSL Örugg Greiðsla</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-[var(--glass-border)]" />
                    <div>
                        Frjáls félagasamtök - Skattfrádráttarbært
                    </div>
                </div>

            </div>
        </main>
    );
}
