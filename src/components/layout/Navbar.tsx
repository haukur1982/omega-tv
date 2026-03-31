'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Play, Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex justify-between items-center"
            >
                {/* Glass Background */}
                <div className="absolute inset-0 backdrop-blur-xl bg-[var(--bg-deep)]/80 border-b border-[var(--border)]" />

                {/* Brand */}
                <Link href="/" className="relative z-10 flex items-center gap-3">
                    <span className="text-[var(--accent)] font-bold text-2xl">Ω</span>
                    <span className="text-[var(--text-primary)] font-semibold tracking-[0.15em] text-sm uppercase">Omega</span>
                </Link>

                {/* Desktop Links */}
                <div className="relative z-10 hidden md:flex items-center gap-8">
                    <NavLink href="/live">Beint</NavLink>
                    <NavLink href="/sermons">Þáttasafn</NavLink>
                    <NavLink href="/baenatorg">Bænatorg</NavLink>
                    <NavLink href="/frettabref">Fréttir</NavLink>
                    <NavLink href="/about">Um okkur</NavLink>
                    <NavLink href="/give">Styrkja</NavLink>
                </div>

                {/* Actions */}
                <div className="relative z-10 flex items-center gap-4">
                    <Link href="/sermons" className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        <Search size={18} />
                    </Link>
                    <Link href="/live" className="hidden md:flex items-center gap-2 bg-[var(--accent)] text-[var(--bg-deep)] px-5 py-2 font-semibold text-xs uppercase tracking-[0.1em] hover:brightness-110 transition-all">
                        <Play size={14} fill="currentColor" />
                        <span>Horfa</span>
                    </Link>
                    <button
                        className="md:hidden p-2 text-[var(--text-primary)]"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-[var(--bg-deep)] flex flex-col p-8 md:hidden"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-[var(--accent)] font-bold text-2xl">Ω</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-[var(--text-primary)]"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8">
                            <MobileNavLink href="/live" onClick={() => setIsMobileMenuOpen(false)}>Bein útsending</MobileNavLink>
                            <MobileNavLink href="/sermons" onClick={() => setIsMobileMenuOpen(false)}>Þáttasafn</MobileNavLink>
                            <MobileNavLink href="/baenatorg" onClick={() => setIsMobileMenuOpen(false)}>Bænatorg</MobileNavLink>
                            <MobileNavLink href="/frettabref" onClick={() => setIsMobileMenuOpen(false)}>Fréttir</MobileNavLink>
                            <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>Um okkur</MobileNavLink>
                            <MobileNavLink href="/give" onClick={() => setIsMobileMenuOpen(false)}>Styrkja</MobileNavLink>
                        </div>

                        <div className="mt-auto">
                            <Link href="/live" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-3 bg-[var(--accent)] text-[var(--bg-deep)] py-4 font-bold text-sm uppercase tracking-[0.1em]">
                                <Play size={16} fill="currentColor" />
                                <span>Horfa núna</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
            className="text-2xl font-bold text-[var(--text-primary)] hover:text-white transition-colors"
        >
            {children}
        </Link>
    );
}
