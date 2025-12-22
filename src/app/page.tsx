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

        {/* 33 Years Legacy Section */}
        <LegacySection />

        {/* Placeholder for Content Grid (Coming Soon) */}
        <section className="container mx-auto px-6 text-center text-[var(--text-muted)]">
          <p className="tracking-widest uppercase text-sm font-semibold">Latest Sermons Loading...</p>
        </section>
      </div>
    </main>
  );
}
