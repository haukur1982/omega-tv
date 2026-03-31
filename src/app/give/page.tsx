'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Heart, ShieldCheck } from "lucide-react";

export default function GivePage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] overflow-hidden">
            <Navbar />

            <div className="relative z-10 pt-40 pb-20 max-w-4xl mx-auto px-6">

                {/* Hero */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-8">
                            Styrkja
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[0.9] tracking-tight">
                            Fjárfestu í<br />Eilífðinni.
                        </h1>
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
                            Framlag þitt gerir okkur kleift að framleiða vandað íslenskt efni og boða fagnaðarerindið til næstu kynslóðar.
                            Saman byggjum við upp ríki Guðs.
                        </p>
                    </motion.div>
                </div>

                {/* Why Give — Text only, no icons */}
                <div className="grid md:grid-cols-3 gap-12 mb-24 text-center">
                    {[
                        { label: "Íslenskt Efni", desc: "Vönduð framleiðsla á móðurmálinu." },
                        { label: "Boðskapur Vonar", desc: "Fagnaðarerindið inn á hvert heimili." },
                        { label: "Eilífðar Sýn", desc: "Fjárfestum í því sem varir." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <h3 className="font-bold text-lg mb-2">{item.label}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Aur Button */}
                <div className="max-w-md mx-auto mb-20">
                    <motion.a
                        href="aur://pay?t=6308901019"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="block w-full py-5 bg-[#E53E3E] text-white text-center font-bold text-xl transition-all flex items-center justify-center gap-3"
                    >
                        <span>Styrkja með</span>
                        <span className="font-extrabold italic">aur</span>
                        <span className="bg-white/20 text-sm py-1 px-3 ml-2">@Omega</span>
                    </motion.a>
                    <p className="text-center text-[var(--text-muted)] mt-4 text-sm">
                        Einfaldasta leiðin til að gefa. Sláðu inn <strong>@Omega</strong> í Aur appið.
                    </p>
                </div>

                {/* Donation Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">

                    {/* Bank Transfer */}
                    <div className="p-8 border border-[var(--border)] flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-2 text-center">Millifærsla</h3>
                        <p className="text-[var(--text-secondary)] text-sm text-center mb-6">Fyrir stærri gjafir og fyrirtæki.</p>
                        <div className="space-y-4 p-6 bg-[var(--bg-surface)]">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-muted)]">Reikningsnúmer:</span>
                                <span className="font-mono font-bold tracking-wider select-all">0113-26-25707</span>
                            </div>
                            <div className="w-full h-px bg-[var(--border)]" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-muted)]">Kennitala:</span>
                                <span className="font-mono font-bold tracking-wider select-all">630890-1019</span>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Partner */}
                    <div className="relative p-8 border border-[var(--accent)] flex flex-col overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-[var(--accent)]" />
                        <div className="absolute top-4 right-4 text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.15em]">
                            Vinsælast
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <Heart size={24} className="text-[var(--accent)]" />
                            <div>
                                <h3 className="text-2xl font-bold">Omega Félagi</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Mánaðarlegur stuðningur</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {['1.500', '3.000', '5.000'].map(amt => (
                                    <button key={amt} className="py-2 border border-[var(--border)] hover:border-[var(--accent)] transition-colors text-sm font-bold">
                                        {amt}
                                    </button>
                                ))}
                            </div>
                            <button className="w-full py-3 bg-[var(--accent)] text-[var(--bg-deep)] font-bold hover:brightness-110 transition-all">
                                Gerast Félagi (Kort)
                            </button>
                            <p className="text-center text-[10px] text-[var(--text-muted)] pt-2">
                                Örugg greiðslugátt í gegnum Straumur / SaltPay.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-[var(--text-muted)] text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} />
                        <span>256-bita SSL Örugg Greiðsla</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-[var(--border)]" />
                    <div>Frjáls félagasamtök — Skattfrádráttarbært</div>
                </div>
            </div>
        </main>
    );
}
