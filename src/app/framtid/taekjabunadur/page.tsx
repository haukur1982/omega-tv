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

const CameraIcon = ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9,18 15,12 9,6"/>
    </svg>
);

// Feature icons as simple inline SVGs
const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);

const ZapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
    </svg>
);

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
);

const featureIcons = [
    { icon: <SettingsIcon />, label: "Sjálfvirkni" },
    { icon: <ZapIcon />, label: "Hraði" },
    { icon: <SparklesIcon />, label: "Kvikmyndagæði" },
    { icon: <ZapIcon />, label: "Skýrleiki" },
];

export default function TaekjabunadurPage() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', color: 'white', overflowX: 'hidden' }}>
            <Navbar />

            {/* Hero Section */}
            <div className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '70vh' }}>
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1533440842484-bfaf1f03a71b?q=80&w=2072&auto=format&fit=crop"
                        alt="High-end Camera Lens"
                        fill
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,10,8,0.5), var(--bg-deep))' }} />
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <Link href="/framtid" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2rem', textDecoration: 'none' }}>
                            <ArrowLeftIcon /> Til baka í framtíðarsýn
                        </Link>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Nýr Tækjabúnaður</h1>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '40rem', margin: '0 auto', lineHeight: 1.6 }}>
                            Besta orðinu fylgir besta tæknin. Við erum að uppfæra okkar stúdíó til að mæta nútíma kröfum um gæði og fagmennsku.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <section style={{ padding: 'clamp(3rem, 6vw, 6rem) 0' }} className="container mx-auto px-6 lg:px-24">
                <div className="grid md:grid-cols-2 gap-24 items-center mb-32">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
                        <div className="aspect-[4/3] relative rounded-3xl overflow-hidden shadow-2xl" style={{ transform: 'rotate(-1deg)' }}>
                            <Image src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop" alt="Modern Studio Equipment" fill className="object-cover" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
                        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '1rem', background: 'rgba(91,138,191,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,138,191,0.2)' }}>
                            <CameraIcon />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2 }}>
                            Gæði sem skipta máli
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            Nýjar 4K myndavélar, kvikmyndaleg lýsing og tærara hljóð. Þetta snýst ekki bara um tækni, heldur um að fjarlægja truflanir svo boðskapurinn komist til skila.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            {featureIcons.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Technical Focus Grid & Progress */}
                <div className="space-y-16 mb-32">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Myndavélar", desc: "85% lokið - Nýjar einingar sem skila dýpt og litum í hæsta gæðaflokki.", progress: 85, color: "from-blue-400 to-cyan-400" },
                            { title: "Lýsing", desc: "40% lokið - Nútímaleg LED lýsing sem skapar andrúmsloft og fagmannlegt útlit.", progress: 40, color: "from-cyan-400 to-teal-400" },
                            { title: "Hljóð & Subtitles", desc: "20% lokið - Hágæða hljóðkerfi og tækni fyrir sjálfvirka textun.", progress: 20, color: "from-teal-400 to-emerald-400" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ padding: '2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s ease' }}
                            >
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{item.desc}</p>
                                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
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

                    <div style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(91,138,191,0.05)', border: '1px solid rgba(91,138,191,0.1)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: '8px' }}>Næsti áfangi</p>
                        <p style={{ color: 'var(--text-secondary)' }}>Þegar 100% markinu er náð í lýsingu, getum við hafið upptökur á nýrri þáttaröð í háskerpu.</p>
                    </div>
                </div>

                {/* Call to Action */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: '2rem', padding: 'clamp(3rem, 6vw, 5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div style={{ color: 'var(--accent)', margin: '0 auto 2rem', display: 'flex', justifyContent: 'center' }}>
                            <CameraIcon size={48} />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>Viltu hjálpa okkur að uppfæra?</h2>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                            Þitt framlag fer beint í kaup á nýjum tækjabúnaði sem mun þjóna okkur næstu árin.
                        </p>
                        <Link href="/give" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 40px', background: 'var(--accent)', color: 'var(--bg-deep)', fontWeight: 700, borderRadius: '10px', textDecoration: 'none' }}>
                            Styrkja Tækjakaup <ChevronRightIcon />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
