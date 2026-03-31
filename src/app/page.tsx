import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Legacy34YearsComponent from "@/components/home/Legacy34Years";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import VODCard from "@/components/vod/VODCard";
import Link from "next/link";
import { ChevronRight, Flame, BookOpen, Heart } from "lucide-react";
import Image from "next/image";

export const revalidate = 60;

export default async function Home() {
  const latestVideos = await getVideos(1, 8);

  return (
    <main className="min-h-screen bg-[var(--bg-deep)]">
      <Navbar />
      <Hero />

      <div className="relative z-20">

        {/* Content Rows */}
        {latestVideos.length > 0 && (
          <section className="py-16 max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">Nýtt efni</h2>
              <Link href="/sermons" className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1">
                Sjá allt <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {latestVideos.slice(0, 4).map((video, idx) => {
                const meta = parseVideoMetadata(video);
                return (
                  <VODCard
                    key={video.guid}
                    video={{
                      id: video.guid,
                      title: meta.title,
                      preacher: meta.show,
                      duration: Math.floor(video.length / 60).toString(),
                      thumbnail: meta.thumbnail,
                      date: video.date,
                      category: meta.category
                    }}
                    index={idx}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Editorial Cards — Visual, not text-only */}
        <section className="py-8 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Prayer Wall */}
            <Link href="/baenatorg" className="group relative overflow-hidden aspect-[4/3] flex items-end">
              <Image
                src="https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1200&auto=format&fit=crop"
                alt="Bæn"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={14} className="text-[var(--accent-gold)]" />
                  <span className="text-[var(--accent-gold)] text-[10px] font-semibold uppercase tracking-[0.2em]">Bænatorg</span>
                </div>
                <h3 className="text-xl font-bold leading-tight">Samfélag í bæn</h3>
              </div>
            </Link>

            {/* Newsletter / Fréttir */}
            <Link href="/frettabref" className="group relative overflow-hidden aspect-[4/3] flex items-end">
              <Image
                src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop"
                alt="Fræðsla"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-[var(--accent-gold)]" />
                  <span className="text-[var(--accent-gold)] text-[10px] font-semibold uppercase tracking-[0.2em]">Fréttabréf</span>
                </div>
                <h3 className="text-xl font-bold leading-tight">Nýjasta bréfið</h3>
              </div>
            </Link>

            {/* Give / Styrkja */}
            <Link href="/give" className="group relative overflow-hidden aspect-[4/3] flex items-end">
              <Image
                src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop"
                alt="Styrkja"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={14} className="text-[var(--accent-gold)]" />
                  <span className="text-[var(--accent-gold)] text-[10px] font-semibold uppercase tracking-[0.2em]">Styrkja</span>
                </div>
                <h3 className="text-xl font-bold leading-tight">Vertu hluti af þessu</h3>
              </div>
            </Link>

          </div>
        </section>

        {/* Legacy */}
        <div className="mt-16">
          <Legacy34YearsComponent />
        </div>

      </div>
    </main>
  );
}
