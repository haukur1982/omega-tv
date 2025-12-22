import Navbar from "@/components/layout/Navbar";
import PrayerCard from "@/components/prayer/PrayerCard";
import PrayerForm from "@/components/prayer/PrayerForm";
import { Flame } from "lucide-react";
import { getPrayers } from "@/lib/prayer-db";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function PrayerPage() {
    const prayers = await getPrayers();
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative py-24 md:py-32 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[var(--primary-glow)] opacity-[0.05] blur-[100px]" />

                <div
                    className="mb-8 p-6 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] shadow-[0_0_50px_rgba(245,158,11,0.2)]"
                >
                    <Flame size={48} className="animate-pulse" />
                </div>

                <h1 className="relative z-10 text-5xl md:text-7xl font-bold mb-6">
                    Bænatorgið
                </h1>
                <p className="relative z-10 text-xl text-[var(--text-secondary)] max-w-2xl">
                    "Komið því fram með djörfung að hásæti náðarinnar, til þess að við öðlumst miskunn og finnum náð."
                    <br /><span className="text-sm font-serif italic mt-2 block">- Hebreabréfið 4:16</span>
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="container mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

                    {/* Left: Prayer Wall Feed */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">Nýjustu Bænirnar</h2>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 rounded-full bg-white/10 text-sm font-bold hover:bg-white/20 transition-colors">Allt</button>
                                <button className="px-4 py-2 rounded-full border border-[var(--glass-border)] text-sm font-bold text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors">Bænheyrsla</button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {prayers.map((prayer, idx) => (
                                <PrayerCard key={prayer.id} prayer={prayer} index={idx} />
                            ))}
                        </div>

                        {/* Loading / Pagination trigger */}
                        <div className="mt-12 text-center">
                            <button className="text-[var(--text-secondary)] hover:text-white transition-colors text-sm font-bold tracking-wider uppercase border-b border-[var(--glass-border)] pb-1">
                                Sýna Eldri Bænir
                            </button>
                        </div>
                    </div>

                    {/* Right: Sidebar / Form */}
                    <div className="relative">
                        <PrayerForm />

                        {/* Stats Card */}
                        <div className="mt-8 p-6 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--glass-border)] text-center">
                            <div className="text-3xl font-bold text-white mb-1">{prayers.length}</div>
                            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-6">Bænir á veggnum</div>

                            <div className="text-3xl font-bold text-[var(--accent-gold)] mb-1">85</div>
                            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">Bænheyrslur</div>
                        </div>
                    </div>

                </div>
            </div>

        </main>
    );
}
