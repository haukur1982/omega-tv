'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Tv, Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center"
            >
                {/* Glass Background */}
                <div className="absolute inset-0 backdrop-blur-xl bg-black/10 border-b border-[var(--glass-border)]" />

                {/* Brand */}
                <Link href="/" className="relative z-10 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-glow)] flex items-center justify-center shadow-[0_0_15px_var(--primary-glow)]">
                        <span className="text-white font-bold text-lg">Ω</span>
                    </div>
                    <span className="text-white font-semibold tracking-wide text-lg">OMEGA</span>
                </Link>

                {/* Desktop Links */}
                <div className="relative z-10 hidden md:flex items-center gap-8">
                    <NavLink href="/live" active>Beint</NavLink>
                    <NavLink href="/sermons">Brunnurinn</NavLink>
                    <NavLink href="/baenatorg">Bænatorg</NavLink>
                    <NavLink href="/frettabref">Fréttir</NavLink>
                    <NavLink href="/about">Hjartað</NavLink>
                    <NavLink href="/give">Sáðkorn</NavLink>
                </div>

                {/* Actions */}
                <div className="relative z-10 flex items-center gap-4">
                    <Link href="/sermons" className="p-2 rounded-full hover:bg-[var(--glass-shine)] transition-colors text-white/80 hover:text-white">
                        <Search size={20} />
                    </Link>
                    <Link href="/live" className="hidden md:flex items-center gap-2 bg-[var(--text-primary)] text-black px-4 py-2 rounded-full font-medium hover:scale-105 transition-transform">
                        <Tv size={16} />
                        <span>Horfa</span>
                    </Link>
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-[var(--bg-deep)] flex flex-col p-6 md:hidden"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-white font-bold text-xl">Valmynd</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-white hover:text-[var(--accent-gold)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 text-2xl font-bold">
                            <MobileNavLink href="/live" onClick={() => setIsMobileMenuOpen(false)}>Beint</MobileNavLink>
                            <MobileNavLink href="/sermons" onClick={() => setIsMobileMenuOpen(false)}>Brunnurinn</MobileNavLink>
                            <MobileNavLink href="/baenatorg" onClick={() => setIsMobileMenuOpen(false)}>Bænatorg</MobileNavLink>
                            <MobileNavLink href="/frettabref" onClick={() => setIsMobileMenuOpen(false)}>Fréttir</MobileNavLink>
                            <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>Hjartað</MobileNavLink>
                            <MobileNavLink href="/give" onClick={() => setIsMobileMenuOpen(false)}>Sáðkorn</MobileNavLink>
                        </div>

                        <div className="mt-auto">
                            <Link href="/live" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-[var(--text-primary)] text-black px-4 py-4 rounded-xl font-bold">
                                <Tv size={20} />
                                <span>Horfa</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
    return (
        <Link
            href={href}
            className={clsx(
                "text-sm font-medium transition-colors hover:text-[var(--accent-gold)]",
                active ? "text-white" : "text-[var(--text-secondary)]"
            )}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="text-white hover:text-[var(--accent-gold)] transition-colors border-b border-white/10 pb-4"
        >
            {children}
        </Link>
    );
}
