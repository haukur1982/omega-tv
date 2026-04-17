'use client';

import Link from 'next/link';

export default function PrayerCall() {
    return (
        <section 
            id="baen"
            style={{
                backgroundColor: '#030303',
                padding: 'clamp(5rem, 12vw, 10rem) 24px',
                textAlign: 'center',
                borderTop: '1px solid rgba(212, 175, 55, 0.05)',
            }}
        >
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <span 
                    style={{
                        display: 'block',
                        color: '#D4AF37',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginBottom: '24px',
                    }}
                >
                    Sálmur 122:6
                </span>
                
                <h2 
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        marginBottom: '32px',
                        lineHeight: 1.2,
                    }}
                >
                    „Biðjið um frið fyrir Jerúsalem“
                </h2>

                <p 
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.1rem',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '48px',
                        lineHeight: 1.6,
                    }}
                >
                    Við hjá Omega tréum á mátt bænarinnar. Við stöndum með Ísrael og biðjum fyrir friði, vakningu og velferð þjóðarinnar. Viltu taka undir með okkur?
                </p>

                <Link
                    href="/baenatorg"
                    style={{
                        display: 'inline-block',
                        padding: '16px 32px',
                        backgroundColor: '#D4AF37',
                        color: '#050505',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        transition: 'transform 0.2s ease, filter 0.2s ease',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    Senda inn bæn
                </Link>
            </div>
        </section>
    );
}
