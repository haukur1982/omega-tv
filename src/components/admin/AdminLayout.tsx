'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Heart,
    Users,
    FileText,
    Film,
    Quote,
    Settings,
    LogOut,
    ChevronRight,
    Loader2,
    MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import '@/styles/admin.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: '/admin/dashboard', label: 'Yfirlit', icon: LayoutDashboard },
    { href: '/admin/series', label: 'Þáttaraðir', icon: Film },
    { href: '/admin/prayers', label: 'Bænir', icon: Heart },
    { href: '/admin/subscribers', label: 'Áskrifendur', icon: Users },
    { href: '/admin/newsletters', label: 'Fréttabréf', icon: FileText },
    { href: '/admin/videos', label: 'Myndbönd', icon: Film },
    { href: '/admin/campaigns', label: 'Bænaherferðir', icon: Heart },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthed, setIsAuthed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/admin');
            } else {
                setIsAuthed(true);
            }
            setIsLoading(false);
        });
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--admin-bg)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--admin-accent)] admin-spinner" />
            </div>
        );
    }

    if (!isAuthed) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--admin-bg)] flex">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-[var(--admin-sidebar-width)] bg-[var(--admin-surface)] border-r border-[var(--admin-border)] flex flex-col z-40">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-[var(--admin-border)]">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-[var(--admin-accent)] flex items-center justify-center shadow-lg">
                            <span className="text-black font-bold text-lg">Ω</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[var(--admin-text)] font-semibold text-sm">Omega</span>
                            <span className="text-[var(--admin-text-muted)] text-[10px] uppercase tracking-wider">Stjórnborð</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                                    transition-all duration-150 group relative
                                    ${isActive
                                        ? 'bg-[var(--admin-accent-subtle)] text-[var(--admin-accent)]'
                                        : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)]'
                                    }
                                `}
                            >
                                <item.icon size={18} className={isActive ? 'text-[var(--admin-accent)]' : ''} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <ChevronRight size={14} className="ml-auto opacity-60" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-[var(--admin-border)] space-y-1">
                    <Link
                        href="/admin/settings"
                        className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                            transition-all duration-150
                            ${pathname === '/admin/settings'
                                ? 'bg-[var(--admin-accent-subtle)] text-[var(--admin-accent)]'
                                : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)]'
                            }
                        `}
                    >
                        <Settings size={18} />
                        <span>Stillingar</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--admin-error)] hover:bg-[var(--admin-error-subtle)] transition-all duration-150"
                    >
                        <LogOut size={18} />
                        <span>Útskrá</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[var(--admin-sidebar-width)]">
                <div className="min-h-screen p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
