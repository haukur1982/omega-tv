import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeatureGrid from "@/components/home/FeatureGrid";
import LegacySection from "@/components/home/LegacySection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-white selection:bg-[var(--primary-glow)] selection:text-white">
      <Navbar />
      <Hero />

      <div className="relative z-20 -mt-20 pb-20 space-y-24">
        {/* Features Strip (High visibility for older users) */}
        <FeatureGrid />

        {/* Latest Newsletter Teaser - Elegant Card */}
        <section className="px-6 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[#fcfbf9] text-gray-900 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/10 rounded-bl-full -mr-16 -mt-16" />

            <div className="grid md:grid-cols-[1fr_300px] gap-8 p-8 md:p-12 items-center relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[var(--accent-gold)] text-black text-xs font-bold uppercase tracking-wider rounded-full">Nýtt</span>
                  <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">frá Sjónvarpsstöðinni</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">
                  Jólabréf Omega 2025
                </h2>
                <p className="text-gray-600 font-serif text-lg leading-relaxed mb-8 line-clamp-3">
                  Kæri vinur, mig langar að þakka þér innilega fyrir þann stuðning sem þú hefur sýnt Sjónvarpsstöðinni Omega...
                </p>
                <a href="/frettabref" className="inline-flex items-center gap-2 text-black font-bold border-b-2 border-[var(--accent-gold)] pb-1 hover:text-[var(--accent-gold)] transition-colors">
                  <span>Lesa allt bréfið</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              </div>

              {/* Visual Stamp / Icon */}
              <div className="hidden md:flex justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-[var(--accent-gold)]/30 flex items-center justify-center">
                  <span className="text-4xl font-serif font-bold text-[var(--accent-gold)] opacity-50">ES</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 33 Years Legacy Section */}
        <LegacySection />


      </div>
    </main>
  );
}
