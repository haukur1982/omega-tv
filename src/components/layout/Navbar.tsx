'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { OmegaMark } from '@/components/brand/OmegaMark';

/* ════════════════════════════════════════════════════════════════
   Omega Navbar — editorial, transparent-over-hero.

   Design notes (see plans/twinkling-mapping-pizza.md §3.5, §6):
   - Transparent over hero; warm-dark on scroll.
   - No pill CTA button that duplicates the hero's action.
   - Right-hand slot is reserved for state-aware live status:
     off-air = muted "Næsta sending" link; on-air = warm Live Badge.
   - Wordmark only in cream; Ω as typographic mark, not a blue disc.
   - Active route underline in nordurljos (wayfinding only — amber is
     reserved for primary CTAs per the Altingi palette rules).
   ════════════════════════════════════════════════════════════════ */

const SearchIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const MenuIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="13" x2="20" y2="13" />
        <line x1="4" y1="19" x2="20" y2="19" />
    </svg>
);

const CloseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const navLinks = [
    { href: '/live', label: 'Beint' },
    { href: '/sermons', label: 'Þáttasafn' },
    { href: '/greinar', label: 'Greinar' },
    { href: '/namskeid', label: 'Námskeið' },
    { href: '/baenatorg', label: 'Bænatorg' },
    { href: '/about', label: 'Um okkur' },
    { href: '/give', label: 'Styrkja' },
];

const isActive = (pathname: string | null, href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
};

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    return (
        <>
            <motion.nav
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 140, damping: 22 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0,
                    zIndex: 50,
                    height: '72px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 var(--rail-padding)',
                }}
            >
                {/* Backdrop — transparent over hero, warm-dark on scroll */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        transition: 'background 400ms ease, border-color 400ms ease, backdrop-filter 400ms ease',
                        backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
                        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
                        background: scrolled
                            ? 'rgba(27, 24, 20, 0.85)'  // --mold at 85% when scrolled
                            : 'linear-gradient(to bottom, rgba(20,18,15,0.55) 0%, transparent 100%)',
                        borderBottom: scrolled
                            ? '1px solid var(--border)'
                            : '1px solid transparent',
                    }}
                />

                {/* Inner — brand left, nav center, actions right */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        width: '100%',
                        maxWidth: '80rem',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'clamp(1rem, 3vw, 2rem)',
                    }}
                >
                    {/* ── Brand ─────────────────────────────────────────── */}
                    <Link
                        href="/"
                        aria-label="Omega — heim"
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '10px',
                            textDecoration: 'none',
                            color: 'var(--ljos)',
                        }}
                    >
                        <span style={{ color: 'var(--ljos)', display: 'inline-flex' }}>
                            <OmegaMark size={28} title="Omega" />
                        </span>
                        <span
                            className="type-merki"
                            style={{ color: 'var(--moskva)', letterSpacing: '0.22em', fontSize: '11px' }}
                        >
                            Omega
                        </span>
                    </Link>

                    {/* ── Desktop nav ───────────────────────────────────── */}
                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: 'clamp(1rem, 1.8vw, 1.75rem)' }}>
                        {navLinks.map(link => {
                            const active = isActive(pathname, link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="type-merki"
                                    style={{
                                        position: 'relative',
                                        padding: '24px 2px',
                                        color: active ? 'var(--ljos)' : 'var(--moskva)',
                                        textDecoration: 'none',
                                        transition: 'color 300ms ease',
                                        letterSpacing: '0.18em',
                                        fontSize: '0.7rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--ljos)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = active ? 'var(--ljos)' : 'var(--moskva)'; }}
                                >
                                    {link.label}
                                    {active && (
                                        <span
                                            aria-hidden="true"
                                            style={{
                                                position: 'absolute',
                                                left: 0, right: 0, bottom: '18px',
                                                height: '2px',
                                                background: 'var(--nordurljos)',
                                            }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Right: live status + search (+ mobile menu) ───── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Off-air schedule teaser (desktop only).
                            Phase 4 will swap this for a stateful Live Badge when on-air. */}
                        <Link
                            href="/live"
                            className="hidden md:inline-flex type-merki"
                            style={{
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--moskva)',
                                textDecoration: 'none',
                                letterSpacing: '0.18em',
                                fontSize: '0.7rem',
                                transition: 'color 300ms ease',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--ljos)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--moskva)'; }}
                        >
                            <span
                                aria-hidden="true"
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--nordurljos)',
                                    display: 'inline-block',
                                }}
                            />
                            Næsta sending
                        </Link>

                        <Link
                            href="/sermons"
                            aria-label="Leita"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px',
                                color: 'var(--moskva)',
                                transition: 'color 300ms ease',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--ljos)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--moskva)'; }}
                        >
                            <SearchIcon />
                        </Link>

                        <button
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px',
                                color: 'var(--ljos)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                            aria-label="Opna valmynd"
                        >
                            <MenuIcon />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* ═══════════════════════════════════════════════════════════
                Mobile Menu — full-screen overlay
                ═══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="md:hidden"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 60,
                            background: 'var(--nott)',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 'clamp(1.5rem, 4vw, 2rem)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(3rem, 6vh, 4rem)' }}>
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'flex', alignItems: 'baseline', gap: '10px', textDecoration: 'none' }}
                            >
                                <span style={{ color: 'var(--ljos)', display: 'inline-flex' }}>
                                    <OmegaMark size={32} title="Omega" />
                                </span>
                                <span className="type-merki" style={{ color: 'var(--moskva)', letterSpacing: '0.22em', fontSize: '11px' }}>
                                    Omega
                                </span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px',
                                    color: 'var(--ljos)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                aria-label="Loka valmynd"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.25rem, 2.8vh, 1.75rem)' }}>
                            {navLinks.map((link, i) => {
                                const active = isActive(pathname, link.href);
                                return (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.04 + i * 0.04 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            style={{
                                                display: 'inline-block',
                                                fontFamily: 'var(--font-display, var(--font-serif))',
                                                fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                                                fontWeight: 300,
                                                color: active ? 'var(--ljos)' : 'var(--moskva)',
                                                textDecoration: 'none',
                                                letterSpacing: '-0.02em',
                                                lineHeight: 1,
                                                borderLeft: active ? '2px solid var(--nordurljos)' : '2px solid transparent',
                                                paddingLeft: '14px',
                                            }}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2.5rem' }}>
                            <Link
                                href="/live"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="warm-hover"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '16px',
                                    background: 'var(--kerti)',
                                    color: 'var(--nott)',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    letterSpacing: '0.02em',
                                    textDecoration: 'none',
                                    borderRadius: '2px',
                                    border: '1px solid var(--kerti)',
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--nott)" aria-hidden="true">
                                    <polygon points="6,3 20,12 6,21" />
                                </svg>
                                Horfa beint
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
