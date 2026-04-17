'use client';

import { motion } from 'framer-motion';

export default function IsraelHero() {
    return (
        <section 
            id="yfirlit"
            style={{
                position: 'relative',
                height: '80vh',
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: '#050505', // Deep black
            }}
        >
            {/* Background Image/Video Placeholder */}
            <div 
                style={{
                    position: 'absolute',
                    inset: 0,
                    // Typically a high-res image of Jerusalem here. For now a gradient placeholder simulating a cinematic lighting
                    background: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.15) 0%, rgba(5,5,5,1) 70%)',
                    zIndex: 1,
                }}
            />

            <div 
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.8) 70%, rgba(5,5,5,1) 100%)',
                    zIndex: 2,
                }}
            />

            <div 
                style={{
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center',
                    maxWidth: '800px',
                    padding: '0 24px',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <span 
                        style={{
                            display: 'block',
                            color: '#D4AF37', // Gold 
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginBottom: '24px',
                        }}
                    >
                        Sérvefur Omega Stöðvarinnar
                    </span>
                    <h1 
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            color: '#FFFFFF',
                            marginBottom: '32px',
                        }}
                    >
                        Ísrael: Orð Guðs & Framtíðin
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    <p
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            lineHeight: 1.6,
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}
                    >
                        Kannaðu dýpt sáttmálans, mikilvægi landsins í Ritningunni og spádómlegt hlutverk Ísraels á okkar tímum og í framtíðinni.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
