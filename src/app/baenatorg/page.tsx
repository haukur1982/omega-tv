import Navbar from "@/components/layout/Navbar";
import PrayerCard from "@/components/prayer/PrayerCard";
import PrayerForm from "@/components/prayer/PrayerForm";
import PrayerHero from "@/components/prayer/PrayerHero";
import PrayerCampaignBanner from "@/components/prayer/PrayerCampaignBanner";
import QuickPrayerButtons from "@/components/prayer/QuickPrayerButtons";
import { getPrayers, getTotalPrayCount, getActiveCampaigns } from "@/lib/prayer-db";

export const dynamic = 'force-dynamic';

export default async function PrayerPage() {
    const [prayers, totalCount, campaigns] = await Promise.all([
        getPrayers(),
        getTotalPrayCount(),
        getActiveCampaigns(),
    ]);

    const activeCampaign = campaigns[0] || null;

    return (
        <main className="min-h-screen bg-[var(--bg-deep)]">
            <Navbar />

            {/* Immersive Hero with Counter */}
            <PrayerHero totalPrayCount={totalCount + prayers.length} />

            {/* Active Campaign */}
            {activeCampaign && (
                <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 mb-12">
                    <PrayerCampaignBanner campaign={activeCampaign} />
                </section>
            )}

            {/* Quick National Prayer Buttons */}
            <section className="max-w-6xl mx-auto px-6 mb-16">
                <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
                    Biðja í einu smelli
                </p>
                <QuickPrayerButtons />
            </section>

            {/* Prayer Feed + Form */}
            <section className="max-w-6xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

                    {/* Left: Prayer Feed */}
                    <div>
                        <h2 className="text-xl font-bold mb-8">Bænir samfélagsins</h2>

                        {prayers.length > 0 ? (
                            <div className="space-y-6">
                                {prayers.map((prayer, idx) => (
                                    <PrayerCard key={prayer.id} prayer={prayer} index={idx} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center border border-[var(--border)]">
                                <p className="text-[var(--text-secondary)] text-lg mb-2">Engar bænir ennþá.</p>
                                <p className="text-[var(--text-muted)] text-sm">Vertu fyrst/ur til að senda bænabeiðni.</p>
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
