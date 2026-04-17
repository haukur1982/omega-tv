'use client';

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Inline SVG icons
const ArrowLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
    </svg>
);

const TvIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17,2 12,7 7,2"/>
    </svg>
);

const HeartIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9,18 15,12 9,6"/>
    </svg>
);

export default function DagskrargerdPage() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', color: 'white', overflowX: 'hidden' }}>
            <Navbar />

            {/* Hero Section */}
            <div className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '70vh' }}>
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1504829857797-ddff29c27947?q=80&w=2070&auto=format&fit=crop"
                        alt="Icelandic Landscape"
                        fill
                        className="object-cover opacity-30 grayscale"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,10,8,0.5), var(--bg-deep))' }} />
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link href="/framtid" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2rem', textDecoration: 'none' }}>
                            <ArrowLeftIcon /> Til baka í framtíðarsýn
                        </Link>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Íslensk Dagskrárgerð</h1>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '40rem', margin: '0 auto', lineHeight: 1.6 }}>
                            Boðskapurinn á okkar eigin tungumáli. Við trúum því að íslenskt efni hafi einstakan kraft til að snerta hjörtu þjóðarinnar.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <section style={{ padding: 'clamp(3rem, 6vw, 6rem) 0' }} className="container mx-auto px-6 lg:px-24">
                <div className="grid md:grid-cols-2 gap-24 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '1rem', background: 'rgba(91,138,191,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,138,191,0.2)' }}>
                            <TvIcon />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2 }}>
                            Af hverju íslenskt efni skiptir máli
                        </h2>
                        <div className="space-y-6">
                            {[
                                { title: "Þýðingar 2026", progress: 65, color: "from-blue-500 to-cyan-500", desc: "Vinna við textun á nýjum þáttum er í fullum gangi." },
                                { title: "Íslensk Framleiðsla", progress: 45, color: "from-cyan-500 to-teal-500", desc: "4 nýir íslenskir þættir í tökum." }
                            ].map((item, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.title}</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>{item.progress}%</span>
                                    </div>
                                    <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${item.progress}%` }}
                                            transition={{ duration: 1.5 }}
                                            className={`h-full bg-gradient-to-r ${item.color}`}
                                        />
                                    </div>
                                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-6">
                            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>1.200+</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Klukkustundir af efni</div>
                            </div>
                            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>100%</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Íslensk rödd</div>
                            </div>
                        </div>

                        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            Þótt mikið sé til af góðu erlendu efni, þá er það okkar eigin tungumál sem nær dýpst. Guð talar íslensku líka, og við viljum skapa vettvang þar sem íslenskir kristnir menn, kennarar og tónlistarfólk fær að njóta sín.
                        </p>
                        <div className="space-y-4">
                            {[
                                "Að efla íslenska trúarmenningu",
                                "Stuðningur við íslenska dagskrárgerðarmenn",
                                "Efni sem tekur mið af íslenskum veruleika",
                                "Vandaður undirbúningur og framleiðsla"
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item}</span>
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
                        <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl" style={{ transform: 'skewY(1deg)' }}>
                            <Image
                                src="https://images.unsplash.com/photo-1585672841ef8-d050630773d4?q=80&w=2073&auto=format&fit=crop"
                                alt="Studio Production"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
                        </div>
                    </motion.div>
                </div>

                {/* Call to Action */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: '2rem', padding: 'clamp(3rem, 6vw, 5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div style={{ color: 'var(--accent)', margin: '0 auto 2rem', display: 'flex', justifyContent: 'center' }}>
                            <HeartIcon />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>Viltu styðja við íslenska dagskrárgerð?</h2>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                            Þitt framlag gerir okkur kleift að halda áfram að framleiða vandað efni á okkar eigin tungumáli.
                        </p>
                        <Link href="/give" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 40px', background: 'var(--accent)', color: 'var(--bg-deep)', fontWeight: 700, borderRadius: '10px', textDecoration: 'none', transition: 'transform 0.3s ease' }}>
                            Gerast Bakhjarl <ChevronRightIcon />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
