import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TestimonialForm from '@/components/forms/TestimonialForm';
import { getTestimonials } from '@/lib/testimonials-db';

export const revalidate = 0;

// Inline SVG icons
const QuoteIcon = ({ size = 32, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/>
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

const CalendarIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

export default async function TestimonialPage() {
    const testimonials = await getTestimonials();

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', color: 'white' }}>
            <Navbar />

            {/* ═══════════════════════════════════════════════════════════
                HERO
                ═══════════════════════════════════════════════════════════ */}
            <div style={{ maxWidth: '48rem', margin: '0 auto', padding: 'clamp(10rem, 18vh, 14rem) 1.5rem 3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(91,138,191,0.1)', color: 'var(--accent)',
                        border: '1px solid rgba(91,138,191,0.2)', marginBottom: '1.5rem',
                    }}>
                        <QuoteIcon size={28} />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                        Deildu þinni sögu
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.6, maxWidth: '32rem', margin: '0 auto' }}>
                        Vitnisburður þinn getur uppörvað og styrkt trú annarra.
                        Við fögnum hverri sögu um Guðs verk í lífi fólks.
                    </p>
                </div>

                {/* Submission Form */}
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                    position: 'relative', overflow: 'hidden',
                    marginBottom: 'clamp(3rem, 6vw, 5rem)',
                }}>
                    <TestimonialForm />
                </div>

                {/* Approved Testimonials */}
                {testimonials && testimonials.length > 0 && (
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
                            Nýlegir vitnisburðir
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            {testimonials.map((t) => (
                                <div key={t.id} style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    transition: 'border-color 0.3s ease',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: 'var(--bg-deep)', border: '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--accent)', flexShrink: 0,
                                        }}>
                                            <UserIcon />
                                        </div>
                                        <div>
                                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                <CalendarIcon />
                                                {t.created_at ? new Date(t.created_at).toLocaleDateString('is-IS') : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', color: 'rgba(91,138,191,0.15)', transform: 'rotate(180deg)' }}>
                                            <QuoteIcon size={16} />
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                            &ldquo;{t.content}&rdquo;
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <p>Allir vitnisburðir eru lesnir yfir áður en þeir eru birtir á vefnum.</p>
                </div>
            </div>

            <Footer />
        </main>
    );
}
