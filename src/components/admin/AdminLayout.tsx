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
    Share2,
    Settings,
    LogOut,
    ChevronRight,
    Loader2,
    MessageSquare,
    Inbox,
    Star,
    CalendarDays,
    Tv,
    Megaphone,
    Newspaper,
    Quote,
    Activity,
    BookOpen,
    BarChart3,
    Sunrise,
    ScrollText,
    HandCoins,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OmegaMark } from '@/components/brand/OmegaMark';
import '@/styles/admin.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

/**
 * Admin nav grouped by the four jobs (see docs/ORIENTATION.md):
 *   1. Efni & dagskrá   — the content pipeline (where Azotus lands:
 *                          Innhólf → Þáttaraðir → publish). The spine.
 *   2. Samskipti        — communication with viewers/supporters.
 *   3. Ritstjórn        — editorial / site curation.
 *   4. Rekstur          — operations & system.
 * Content pipeline is first on purpose: it's the daily path. Sections
 * that previously had no nav entry (Bænaátak, Fréttir, Tilvitnanir,
 * Kerfisheilsa) are now reachable instead of URL-only.
 */
const navGroups: {
    title: string | null;
    items: { href: string; label: string; icon: React.ElementType }[];
}[] = [
    {
        title: null,
        items: [
            { href: '/admin/dashboard', label: 'Yfirlit', icon: LayoutDashboard },
            { href: '/admin/analytics', label: 'Greining', icon: BarChart3 },
        ],
    },
    {
        title: 'Efni & dagskrá',
        items: [
            { href: '/admin/drafts', label: 'Innhólf', icon: Inbox },
            { href: '/admin/series', label: 'Þáttaraðir', icon: Film },
            { href: '/admin/videos', label: 'Myndbönd', icon: Tv },
            { href: '/admin/programs', label: 'Sýningar', icon: Film },
            { href: '/admin/schedule', label: 'Dagskrá', icon: CalendarDays },
            { href: '/admin/featured', label: 'Vikuforsíða', icon: Star },
        ],
    },
    {
        title: 'Samskipti',
        items: [
            { href: '/admin/prayers', label: 'Bænir', icon: Heart },
            { href: '/admin/baen-dagsins', label: 'Bæn dagsins', icon: Sunrise },
            { href: '/admin/ord-dagsins', label: 'Orð dagsins', icon: ScrollText },
            { href: '/admin/campaigns', label: 'Bænaátak', icon: Megaphone },
            { href: '/admin/testimonials', label: 'Vitnisburðir', icon: MessageSquare },
            { href: '/admin/bokavinir', label: 'Bókavinir', icon: BookOpen },
            { href: '/admin/subscribers', label: 'Áskrifendur', icon: Users },
            { href: '/admin/newsletters', label: 'Fréttabréf', icon: FileText },
            { href: '/admin/styrkir', label: 'Styrkir', icon: HandCoins },
        ],
    },
    {
        title: 'Ritstjórn',
        items: [
            { href: '/admin/articles', label: 'Greinar', icon: FileText },
            // Fréttir hidden until the news translation pipeline is built (table
            // not yet created; the real feature is EN→Gemini→IS with sourcing).
            // { href: '/admin/news', label: 'Fréttir', icon: Newspaper },
            { href: '/admin/quotes', label: 'Tilvitnanir', icon: Quote },
            { href: '/admin/social', label: 'Samfélagsmiðlar', icon: Share2 },
        ],
    },
    {
        title: 'Rekstur',
        items: [
            { href: '/admin/health', label: 'Kerfisheilsa', icon: Activity },
        ],
    },
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

    const renderItem = (item: { href: string; label: string; icon: React.ElementType }) => {
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
    };

    return (
        <div className="min-h-screen bg-[var(--admin-bg)] flex">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-[var(--admin-sidebar-width)] bg-[var(--admin-surface)] border-r border-[var(--admin-border)] flex flex-col z-40">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-[var(--admin-border)]">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 flex items-center justify-center text-[var(--admin-accent)]">
                            <OmegaMark size={36} title="Omega" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[var(--admin-text)] font-semibold text-sm">Omega</span>
                            <span className="text-[var(--admin-text-muted)] text-[10px] uppercase tracking-wider">Stjórnborð</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation — grouped by job (docs/ORIENTATION.md) */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {navGroups.map((group, gi) => (
                        <div key={group.title ?? `g${gi}`} className={gi === 0 ? 'space-y-1' : 'mt-5 space-y-1'}>
                            {group.title && (
                                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                                    {group.title}
                                </div>
                            )}
                            {group.items.map(renderItem)}
                        </div>
                    ))}
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
