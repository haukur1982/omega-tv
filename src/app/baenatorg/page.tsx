import Navbar from "@/components/layout/Navbar";
import PrayerCard from "@/components/prayer/PrayerCard";
import PrayerForm from "@/components/prayer/PrayerForm";
import QuickPrayerButtons from "@/components/prayer/QuickPrayerButtons";
import PrayerCampaignBanner from "@/components/prayer/PrayerCampaignBanner";
import { getPrayers, getTotalPrayCount, getActiveCampaigns } from "@/lib/prayer-db";

export const dynamic = 'force-dynamic';

export default async function PrayerPage() {
    const [prayers, totalCount, campaigns] = await Promise.all([
        getPrayers(),
        getTotalPrayCount(),
        getActiveCampaigns(),
    ]);

    const activeCampaign = campaigns[0] || null;
    const displayCount = totalCount + prayers.length;

    return (
        <main className="min-h-screen bg-[#121210]">
            <Navbar />

            {/* Hero + Quick Prayers — one continuous section with shared background */}
            <div className="relative overflow-hidden">
                {/* Background image that spans hero AND quick prayers */}
                <img
                    src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2600&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#121210]/30 via-transparent to-[#121210]" />

                {/* Hero content */}
                <div className="relative z-10 pt-40 pb-16 text-center px-6">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-8">
                        Bænatorg
                    </p>
                    <h1 className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tight mb-8">
                        Samfélag í bæn.
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto mb-16">
                        "Komið því fram með djörfung að hásæti náðarinnar, til þess
                        að við öðlumst miskunn og finnum náð."
                    </p>

                    {/* Prayer counter */}
                    <div className="flex flex-col items-center gap-2 mb-20">
                        <span className="text-5xl md:text-6xl font-bold">{displayCount.toLocaleString('is-IS')}</span>
                        <span className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em]">
                            bænir hafa verið beðnar
                        </span>
                    </div>

                    {/* Quick prayer section — still inside the hero background */}
                    <div className="max-w-4xl mx-auto text-left">
                        <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
                            Biðja fyrir þjóðinni
                        </p>
                        <QuickPrayerButtons />
                    </div>
                </div>
            </div>

            {/* Campaign banner */}
            {activeCampaign && (
                <section className="max-w-6xl mx-auto px-6 py-12">
                    <PrayerCampaignBanner campaign={activeCampaign} />
                </section>
            )}

            {/* Prayer Feed + Form */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16">

                    {/* Left: Prayer Feed */}
                    <div>
                        <h2 className="text-xl font-bold mb-10">Bænir samfélagsins</h2>

                        {prayers.length > 0 ? (
                            <div className="space-y-8">
                                {prayers.map((prayer, idx) => (
                                    <PrayerCard key={prayer.id} prayer={prayer} index={idx} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <p className="text-2xl font-bold mb-3">Engar bænir ennþá.</p>
                                <p className="text-[var(--text-secondary)]">Vertu fyrst/ur til að senda bænabeiðni.</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Submission Form */}
                    <div>
                        <PrayerForm />
                    </div>
                </div>
            </section>
        </main>
    );
}
