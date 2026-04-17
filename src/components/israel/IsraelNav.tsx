'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function IsraelNav() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Need to show it either on scroll down or if it's placed after Hero
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { id: 'yfirlit', label: 'Yfirlit' },
        { id: 'skrifin', label: 'Guðs Orð' },
        { id: 'heimildarmyndir', label: 'Heimildarmyndir' },
        { id: 'spadomar', label: 'Spádómar' },
        { id: 'baen', label: 'Bæn' },
    ];

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                position: 'sticky',
                top: '64px', // Below main navbar
                zIndex: 40,
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(1rem, 3vw, 2.5rem)',
                padding: '16px',
                background: scrolled ? 'rgba(5, 5, 5, 0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(212, 175, 55, 0.1)' : '1px solid transparent',
                transition: 'all 0.3s ease',
            }}
        >
            {navLinks.map((link) => (
                <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        transition: 'color 0.3s ease',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = '#D4AF37'; }} // Gold focus
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                    {link.label}
                </button>
            ))}
        </motion.div>
    );
}
