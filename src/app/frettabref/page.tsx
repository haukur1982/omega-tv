import { getNewsletters } from '@/lib/newsletter-db';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmailSignupForm from '@/components/forms/EmailSignupForm';

export default async function NewsletterPage() {
    const newsletters = await getNewsletters();
    const latest = newsletters[0];

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)' }}>
            <Navbar />

            {/* ═══════════════════════════════════════════════════════════
                HERO — Newsletter signup
                ═══════════════════════════════════════════════════════════ */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Background image */}
                <img
                    src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2600&auto=format&fit=crop"
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-deep) 0%, rgba(12,10,8,0.8) 50%, rgba(12,10,8,0.6) 100%)' }} />

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '48rem', margin: '0 auto', padding: 'clamp(10rem, 20vh, 14rem) 1.5rem clamp(5rem, 10vh, 8rem)' }}>
                    <div style={{ textAlign: 'center' }}>
                        {/* Label */}
                        <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '2.5rem' }}>
                            Fréttabréf
                        </p>

                        {/* Title */}
                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                            fontWeight: 700,
                            lineHeight: 0.9,
                            letterSpacing: '-0.02em',
                            marginBottom: '1.5rem',
                        }}>
                            Bréf frá Eiríki.
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                            maxWidth: '36rem',
                            margin: '0 auto',
                        }}>
                            Hugleiðingar, fréttir og hvatning frá stofnanda Omega.
                        </p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                SIGNUP FORM
                ═══════════════════════════════════════════════════════════ */}
            <section style={{
                maxWidth: '36rem',
                margin: '0 auto',
                padding: '0 1.5rem clamp(3rem, 6vw, 5rem)',
                textAlign: 'center',
            }}>
                <div style={{
                    padding: '2rem',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Vertu með í hópnum
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        Skráðu þig á póstlistann og fáðu vikulega uppörvun og fréttir af starfinu.
                    </p>
                    <EmailSignupForm
                        segment="newsletter"
                        layout="stacked"
                        placeholder="Netfangið þitt"
                        successMessage="Takk! Við munum hafa samband."
                    />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                LATEST NEWSLETTER
                ═══════════════════════════════════════════════════════════ */}
            <section style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1.5rem clamp(3rem, 6vw, 5rem)' }}>
                {latest ? (
                    <article style={{
                        background: '#fcfbf9',
                        color: '#1a1a1a',
                        padding: 'clamp(2rem, 4vw, 4rem)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                    }}>
                        <header style={{ textAlign: 'center', borderBottom: '1px solid #e5e5e5', paddingBottom: '2rem', marginBottom: '2.5rem' }}>
                            <h2 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                                fontWeight: 700,
                                color: '#1a1a1a',
                                lineHeight: 1.2,
                                marginBottom: '1rem',
                            }}>
                                {latest.title}
                            </h2>
                            <time style={{ color: '#888', fontWeight: 500, letterSpacing: '0.1em', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                {new Date(latest.date).toLocaleDateString('is-IS', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                        </header>

                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', lineHeight: 1.9 }}>
                            {latest.content.split('\n').map((paragraph: string, i: number) => (
                                paragraph.trim() && <p key={i} style={{ marginBottom: '1.25rem' }}>{paragraph}</p>
                            ))}
                        </div>

                        <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5' }}>
                            <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>{latest.author}</p>
                            <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '2px' }}>Omega Stöðin</p>
                        </footer>
                    </article>
                ) : (
                    <div style={{ textAlign: 'center', padding: 'clamp(3rem, 6vw, 5rem) 0' }}>
                        {/* Mail icon */}
                        <div style={{ color: 'var(--accent)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,7 12,13 2,7"/>
                            </svg>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontFamily: 'var(--font-serif)' }}>Engin bréf fundust að svo stöddu.</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Skráðu þig á póstlistann til að fá fyrsta bréfið.</p>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}
