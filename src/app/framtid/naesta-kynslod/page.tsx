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

const RocketIcon = ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
);

const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
);

const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9,18 15,12 9,6"/>
    </svg>
);

export default function NaestaKynslodPage() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', color: 'white', overflowX: 'hidden' }}>
            <Navbar />

            {/* Hero Section */}
            <div className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '70vh' }}>
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1557461762-e08315322e3d?q=80&w=2600&auto=format&fit=crop"
                        alt="Creator in Studio"
                        fill
                        className="object-cover opacity-30"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,10,8,0.5), var(--bg-deep))' }} />
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <Link href="/framtid" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2rem', textDecoration: 'none' }}>
                            <ArrowLeftIcon /> Til baka í framtíðarsýn
                        </Link>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Næsta Kynslóð</h1>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '40rem', margin: '0 auto', lineHeight: 1.6 }}>
                            Við mætum nýju fólki á þeirra forsendum. Með hlaðvörpum, samfélagsmiðlum og skapandi nálgun tryggjum við framtíðina.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <section style={{ padding: 'clamp(3rem, 6vw, 6rem) 0' }} className="container mx-auto px-6 lg:px-24">
                <div className="grid md:grid-cols-2 gap-24 items-center mb-32">
                    <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
                        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '1rem', background: 'rgba(91,138,191,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,138,191,0.2)' }}>
                            <RocketIcon />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2 }}>
                            Hvar er fólkið í dag?
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            Heimurinn hefur breyst og miðlunarleiðirnar með. Við viljum ekki bara bíða eftir fólki, heldur fara þangað sem það er.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: "Hlaðvörp", progress: 35, color: "from-blue-400 to-cyan-400", desc: "Hljóðeinangrun og púlt í vinnslu." },
                                { title: "TikTok & Reels", progress: 75, color: "from-cyan-400 to-teal-400", desc: "Daglega nýtt efni fyrir unga fólkið." }
                            ].map((item, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.title}</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>{item.progress}%</span>
                                    </div>
                                    <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.progress}%` }} transition={{ duration: 1.5 }} className={`h-full bg-gradient-to-r ${item.color}`} />
                                    </div>
                                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6 pt-6">
                            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(91,138,191,0.15)', color: 'var(--accent)', height: 'fit-content' }}>
                                    <MicIcon />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Hlaðvarps-Stúdíó</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vettvangur fyrir dýpri samtöl, vitnisburði og kennslu í hljóðformi.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(91,138,191,0.15)', color: 'var(--accent)', height: 'fit-content' }}>
                                    <UsersIcon />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Samfélagsmiðlar</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stutt, hnitmiðað og hvetjandi efni sem nær til yfir 100 þúsund manns í hverri viku.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative grid grid-cols-2 gap-4">
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
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', marginBottom: '4rem', opacity: 0.4, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
                    <span>INSTAGRAM</span>
                    <span>YOUTUBE</span>
                    <span>TIKTOK</span>
                    <span>SPOTIFY</span>
                </div>

                {/* Call to Action */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: '2rem', padding: 'clamp(3rem, 6vw, 5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div style={{ color: 'var(--accent)', margin: '0 auto 2rem', display: 'flex', justifyContent: 'center' }}>
                            <RocketIcon size={48} />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>Viltu brúa bilið með okkur?</h2>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                            Þitt framlag gerir okkur kleift að búa til efni sem talar tungumál unga fólksins.
                        </p>
                        <Link href="/give" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 40px', background: 'var(--accent)', color: 'var(--bg-deep)', fontWeight: 700, borderRadius: '10px', textDecoration: 'none' }}>
                            Styðja Nýja Kynslóð <ChevronRightIcon />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
