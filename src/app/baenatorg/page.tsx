import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)' }}>
            <Navbar />

            {/* Hero + Quick Prayers */}
            <div className="relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2600&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(12,10,8,0.3) 0%, transparent 50%, var(--bg-deep) 100%)' }} />

                <div className="relative z-10 pt-40 pb-16 text-center px-6">
                    <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '2rem' }}>
                        Bænatorg
                    </p>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
                        Samfélag í bæn.
                    </h1>
                    <p className="text-lg leading-relaxed max-w-xl mx-auto mb-16" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        &ldquo;Komið því fram með djörfung að hásæti náðarinnar, til þess
                        að við öðlumst miskunn og finnum náð.&rdquo;
                    </p>

                    {/* Prayer counter */}
                    <div className="flex flex-col items-center gap-2 mb-20">
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 6vw, 4rem)', fontWeight: 700 }}>{displayCount.toLocaleString('is-IS')}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>
                            bænir hafa verið beðnar
                        </span>
                    </div>

                    {/* Quick prayer section */}
                    <div className="max-w-4xl mx-auto text-left">
                        <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
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
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2.5rem' }}>Bænir samfélagsins</h2>

                        {prayers.length > 0 ? (
                            <div className="space-y-8">
                                {prayers.map((prayer, idx) => (
                                    <PrayerCard key={prayer.id} prayer={prayer} index={idx} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Engar bænir ennþá.</p>
                                <p style={{ color: 'var(--text-secondary)' }}>Vertu fyrst/ur til að senda bænabeiðni.</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Submission Form */}
                    <div>
                        <PrayerForm />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
