import Navbar from "@/components/layout/Navbar";
import PrayerCard from "@/components/prayer/PrayerCard";
import PrayerForm from "@/components/prayer/PrayerForm";
import { getPrayers } from "@/lib/prayer-db";

export const dynamic = 'force-dynamic';

export default async function PrayerPage() {
    const prayers = await getPrayers();
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white">
            <Navbar />

            {/* Hero — with background image */}
            <div className="relative pt-40 pb-24 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=2600&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-15"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)]/50 to-[var(--bg-deep)]" />

                <div className="relative z-10">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-8">
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
            </div>

            {/* Main Content Grid */}
            <div className="max-w-6xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

                    {/* Left: Prayer Wall Feed */}
                    <div>
                        <h2 className="text-xl font-bold mb-8">Nýjustu Bænirnar</h2>

                        {prayers.length > 0 ? (
                            <div className="space-y-6">
                                {prayers.map((prayer, idx) => (
                                    <PrayerCard key={prayer.id} prayer={prayer} index={idx} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-[var(--text-secondary)] text-lg mb-2">Engar bænir ennþá.</p>
                                <p className="text-[var(--text-muted)] text-sm">Vertu fyrst/ur til að senda bænabeiðni.</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Form */}
                    <div className="relative">
                        <PrayerForm />
                    </div>

                </div>
            </div>

        </main>
    );
}
