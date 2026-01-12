import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeatureGrid from "@/components/home/FeatureGrid";
import Legacy34YearsComponent from "@/components/home/Legacy34Years";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import VODCard from "@/components/vod/VODCard";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const latestVideos = await getVideos(1, 4);

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-white selection:bg-[var(--primary-glow)] selection:text-white">
      <Navbar />
      <Hero />

      <div className="relative z-20 -mt-20 pb-20 space-y-24">
        {/* Features Strip (High visibility for older users) */}
        <FeatureGrid />

        {/* NÝTT EFNI (Latest Videos) - Replaces the static gap */}
        <section className="px-6 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-1 h-6 bg-[var(--accent-gold)] rounded-full"></span>
              Nýtt Efni
            </h2>
            <Link href="/sermons" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1 group">
              Sjá Allt <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {latestVideos.map((video, idx) => {
              const meta = parseVideoMetadata(video);
              const videoProps = {
                id: video.guid, // Assuming VODCard uses ID for link construction
                title: meta.title,
                preacher: meta.show, // Using show name as preacher/category subtitle
                duration: Math.floor(video.length / 60).toString(),
                thumbnail: meta.thumbnail,
                date: video.date,
                category: meta.category
              };
              return <VODCard key={video.guid} video={videoProps} index={idx} />;
            })}
          </div>

          {/* CTA to Sermons */}
          <div className="mt-8 text-center md:hidden">
            <Link href="/sermons" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-full font-bold text-sm hover:bg-[var(--glass-shine)] transition-all">
              <span>Skoða safnið</span>
              <Play size={12} fill="currentColor" />
            </Link>
          </div>
        </section>

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
                  Janúarbréf Omega 2026
                </h2>
                <p className="text-gray-600 font-serif text-lg leading-relaxed mb-8 line-clamp-3">
                  Kæri vinur, Ég vil nota þetta tækifæri til að þakka þér af öllu hjarta fyrir allan þann kærleika, bænir og stuðning sem þú hefur sýnt Omega á árinu sem er að líða...
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
        <Legacy34YearsComponent />


      </div>
    </main>
  );
}
