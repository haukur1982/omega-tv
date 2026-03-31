'use client';

import Navbar from "@/components/layout/Navbar";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Rocket, Smartphone, Globe, Heart } from "lucide-react";
import Link from "next/link";
import EmailSignupForm from "@/components/forms/EmailSignupForm";
import VisionProgress from "@/components/vision/VisionProgress";

const projects = [
    {
        title: "Íslensk Dagskrárgerð",
        desc: "Við leggjum alla áherslu á vandað íslenskt efni sem talar til þjóðarinnar. Markmiðið er að bjóða opið safn af þáttum og fræðslu sem eflir trú á okkar eigin tungumáli.",
        icon: Smartphone,
        color: "from-blue-500 to-cyan-500",
    },
    {
        title: "Nýr Tækjabúnaður",
        desc: "Við fjárfestum í nýrri tækni til að skila boðskapnum með sem bestum hætti. Nýjar myndavélar og lýsing gera okkur kleift að framleiða efni í hæsta gæðaflokki.",
        icon: Globe,
        color: "from-purple-500 to-pink-500",
    },
    {
        title: "Næsta Kynslóð",
        desc: "Með podcast-stúdíói og samfélagsmiðlum tryggjum við að boðskapurinn berist til nýrrar kynslóðar á þeirra forsendum.",
        icon: Rocket,
        color: "from-amber-500 to-orange-500",
    }
];

export default function VisionPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <main ref={containerRef} className="min-h-screen bg-[var(--bg-deep)] text-white overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 filter blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)]/80 via-[var(--bg-deep)]/90 to-[var(--bg-deep)]" />

                <motion.div
                    style={{ y }}
                    className="relative z-10 container mx-auto px-6 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20 mb-8"
                    >
                        <Heart size={16} />
                        <span className="font-bold tracking-wider text-sm uppercase">Okkar Áherslur</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                        Hjartað í <br /> Starfi Omega
                    </h1>

                    <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-12">
                        Omega er í sókn. Við erum að uppfæra tækni, stúdíó og dagskrárgerð til að þjóna íslensku þjóðinni enn betur á stafrænum grunni.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link href="/give" className="px-8 py-4 bg-[var(--accent-gold)] text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                            <Heart size={20} fill="black" />
                            Gerast Bakhjarl
                        </Link>
                        <a href="#focus" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/20 transition-colors">
                            Kynntu þér málin
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Vision Progress Dashboard */}
            <VisionProgress />

            {/* Focus Grid */}
            <section id="focus" className="py-32 container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {projects.map((proj, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="group h-full relative p-8 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--glass-border)] hover:border-[var(--accent-gold)]/50 transition-all overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${proj.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${proj.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <proj.icon size={28} className="text-white" />
                                </div>

                                <h3 className="text-2xl font-bold mb-4">{proj.title}</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {proj.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Email Signup / Community Section */}
            <section className="py-32 bg-[var(--glass-bg)] border-y border-[var(--glass-border)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--primary-glow)_0%,transparent_50%)] opacity-5" />

                <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
                    <h2 className="text-4xl font-bold mb-6">Vertu hluti af hreyfingunni</h2>
                    <p className="text-[var(--text-secondary)] text-lg mb-10">
                        Skráðu þig á póstlistann okkar til að fá fréttir af nýju efni, bækur í þýðingu og vitnisburði.
                        Við sendum ekki ruslpóst, bara uppbyggingu.
                    </p>

                    <EmailSignupForm
                        segment="vision"
                        successMessage="Velkomin/n í hópinn! 🚀"
                    />

                    <p className="mt-4 text-sm text-[var(--text-muted)]">
                        Fáðu "7 Daga Bænabók" ókeypis við skráningu.
                    </p>
                </div>
            </section>

        </main>
    );
}
