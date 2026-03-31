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
            <div className="relative pt-40 pb-24 flex flex-col items-center justify-center text-center px-6">
                <p className="text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-[0.2em] mb-8">
                    Bænatorg
                </p>

                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[0.9] tracking-tight">
                    Samfélag í bæn.
                </h1>
                <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                    "Komið því fram með djörfung að hásæti náðarinnar, til þess að við öðlumst miskunn og finnum náð."
                </p>
                <p className="text-sm text-[var(--text-muted)] italic mt-3">— Hebreabréfið 4:16</p>
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
