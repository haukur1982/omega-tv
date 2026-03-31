'use client';

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import EmailSignupForm from "@/components/forms/EmailSignupForm";

const projects = [
    {
        title: "Íslensk Dagskrárgerð",
        desc: "Við leggjum alla áherslu á vandað íslenskt efni sem talar til þjóðarinnar. Markmiðið er að bjóða opið safn af þáttum og fræðslu sem eflir trú á okkar eigin tungumáli.",
    },
    {
        title: "Nýr Tækjabúnaður",
        desc: "Við fjárfestum í nýrri tækni til að skila boðskapnum með sem bestum hætti. Nýjar myndavélar og lýsing gera okkur kleift að framleiða efni í hæsta gæðaflokki.",
    },
    {
        title: "Næsta Kynslóð",
        desc: "Með podcast-stúdíói og samfélagsmiðlum tryggjum við að boðskapurinn berist til nýrrar kynslóðar á þeirra forsendum.",
    }
];

export default function VisionPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] overflow-hidden">
            <Navbar />

            {/* Hero */}
            <div className="pt-40 pb-24 text-center max-w-4xl mx-auto px-6">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-[0.2em] mb-8"
                >
                    Framtíðarsýn
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold mb-8 leading-[0.9] tracking-tight"
                >
                    Hjartað í<br />Starfi Omega.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto"
                >
                    Omega er í sókn. Við erum að uppfæra tækni, stúdíó og dagskrárgerð til
                    að þjóna íslensku þjóðinni enn betur á stafrænum grunni.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10"
                >
                    <Link href="/give" className="inline-flex items-center gap-3 bg-[var(--accent-gold)] text-[var(--bg-deep)] px-8 py-4 font-bold text-sm tracking-wide hover:brightness-110 transition-all">
                        Gerast Bakhjarl
                    </Link>
                </motion.div>
            </div>

            {/* Focus Areas */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="max-w-4xl mx-auto px-6">
                    <p className="text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Áherslur</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 tracking-tight">
                        Þrjár stoðir framtíðarinnar.
                    </h2>

                    <div className="space-y-16">
                        {projects.map((proj, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="grid grid-cols-[40px_1fr] gap-6 items-start"
                            >
                                <span className="text-[var(--accent-gold)] text-sm font-bold pt-1">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div className="border-t border-[var(--border)] pt-6">
                                    <h3 className="text-2xl font-bold mb-3">{proj.title}</h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed">{proj.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Email Signup */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="max-w-xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4 tracking-tight">Vertu hluti af hreyfingunni</h2>
                    <p className="text-[var(--text-secondary)] mb-10">
                        Skráðu þig á póstlistann okkar til að fá fréttir af nýju efni og vitnisburði.
                    </p>
                    <EmailSignupForm
                        segment="vision"
                        successMessage="Velkomin/n í hópinn!"
                    />
                </div>
            </section>
        </main>
    );
}
