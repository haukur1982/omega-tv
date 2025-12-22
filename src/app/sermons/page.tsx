import Navbar from "@/components/layout/Navbar";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import { Play, Info, ChevronRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion"; // Note: Server Component wrapping Client Component logic needed if using framer-motion directly in page. 
// ACTUALLY: SermonsPage is a Server Component. We cannot use `motion` directly here unless we export a Client Component part.
// FIX: I will keep the page simple server-side and make a Client Component for the Card if needed, OR just use standard CSS/Tailwind for hover effects to avoid "use client" pollution?
// User likes the "Series" page which uses Framer Motion. The Series page was "use client".
// To keep it simple and high quality, I will make this page "use client" but fetch data in a separate Server Action or just keep it Server Side and pass data to a Client "SermonsBrowser" component?
// Simplest path: Make it `use client` and fetch data inside `useEffect` OR keep it `use client` and prop drill data? 
// No, Next.js 13+ App Router: Page can be Async Server Component.
// I will create a Client Component `CategoryRow` or `SeriesCard` to handle the motion/interactivity.
// Let's define the client components at the bottom or import them? Next.js allows defining strictly client components.
// BETTER: I will make the whole page `use client` like `SeriesPage` was, but data fetching `await getVideos` needs to happen server side.
// SO: Page (Server) -> passes data to -> ContentBrowser (Client).

// Wait, simplest structure for "Launch":
// Keep `page.tsx` as Server Component.
// Create `SermonsBrowser.tsx` (Client Component) that takes the grouped data and renders the potentially interactive UI.
// But I can't create new files easily without overhead.
// I will try to make the page `export default async function` (Server) and only use simple Tailwind transitions for the cards to avoid Client Component needing `framer-motion` for everything.
// OR: I can just make the whole page `use client` and fetch data via a `useEffect`? No, that's a downgrade from the current SSR.
// PLAN: Page is Server. Button/Card is Client. 
// I'll inline a simple "SeriesCard" that is a Client Component? No, that's messy in one file.
// I will make the `SeriesCard` a separate file in components if I have to.
// Actually, `VODCard.tsx` exists! I can just use `VODCard` but style it differently?
// No, `VODCard` is horizontal/standard.
// I will make this file `use client` and fetch data using a direct import? No, `getVideos` uses `process.env` which is fine in Client if prefixed NEXT_PUBLIC, but `API_KEY` is usually private.
// `bunny.ts` uses `process.env.BUNNY_API_KEY` (Server Only usually).
// So Page MUST be Server.
// So I will render the Hero (Static) and Rows (Server loops) and use `Link` for interaction.
// The "Motion" effects from `SeriesPage` (lines 112-118 in series/page.tsx) need a client wrapper.
// I will remove `motion` for the cards to keep it pure Server Component for now (faster load) and use CSS hover effects. It will still look 95% as good.

export const revalidate = 60;

export default async function SermonsPage() {
    const videos = await getVideos(1, 100);

    // Dynamic Hero Logic
    const latestVideo = videos[0];
    const heroMeta = latestVideo ? parseVideoMetadata(latestVideo) : null;

    // Grouping Logic
    const grouped: Record<string, any[]> = {};
    videos.forEach(video => {
        const meta = parseVideoMetadata(video);
        if (!grouped[meta.show]) grouped[meta.show] = [];
        grouped[meta.show].push({ ...video, meta });
    });

    const showCategories = Object.keys(grouped).map(key => ({
        title: key,
        series: grouped[key]
    }));

    // Add "New Releases" Row first
    const categories = [
        { title: "Nýtt Efni", series: videos.slice(0, 10).map(v => ({ ...v, meta: parseVideoMetadata(v) })) },
        ...showCategories
    ];

    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white overflow-hidden pb-32">
            <Navbar />

            {/* Cinematic Hero (Dynamically Featured: Latest Video) */}
            {latestVideo && (
                <div className="relative h-[85vh] w-full flex items-center">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={heroMeta.thumbnail}
                            alt={heroMeta.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Deep Gradient Overlays for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-deep)] via-[var(--bg-deep)]/80 to-[var(--bg-deep)]/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/40 to-transparent" />
                    </div>

                    <div className="relative z-10 w-full container mx-auto px-6 pt-20">
                        <div className="max-w-2xl">
                            {/* Metadata Badge */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-[var(--accent-gold)] text-black font-bold px-3 py-1 text-xs rounded uppercase tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                                    Nýtt Efni
                                </span>
                                <span className="flex items-center gap-2 text-[var(--text-secondary)] font-medium text-sm tracking-wide bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                                    <Clock size={12} className="text-[var(--accent-gold)]" />
                                    {Math.floor(latestVideo.length / 60)} mín
                                </span>
                                <span className="text-white/80 font-medium text-sm border-l border-white/20 pl-3">
                                    {heroMeta.show}
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif tracking-tight drop-shadow-2xl leading-[1.1]">
                                {heroMeta.title}
                            </h1>

                            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 leading-relaxed drop-shadow-md line-clamp-3">
                                {heroMeta.category !== "Almennt" ? heroMeta.category : "Horfðu á nýjasta þáttinn frá Omega TV. Uppbyggilegt efni fyrir alla fjölskylduna."}
                            </p>

                            <div className="flex gap-4">
                                <Link
                                    href={`/sermons/${latestVideo.guid}`}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-[var(--radius-md)] hover:scale-105 transition-transform shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                                >
                                    <Play size={20} fill="currentColor" />
                                    <span>Spila Þátt</span>
                                </Link>
                                <button className="flex items-center gap-3 px-8 py-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white font-bold rounded-[var(--radius-md)] hover:bg-[var(--glass-shine)] transition-colors">
                                    <Info size={20} />
                                    <span>Meira</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Rows */}
            <div className={`relative z-20 space-y-20 container mx-auto px-6 ${latestVideo ? '-mt-24' : 'pt-32'}`}>
                {categories.map((cat) => (
                    <section key={cat.title}>
                        <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3 cursor-pointer hover:text-[var(--accent-gold)] transition-colors">
                                <span className="w-1 h-6 bg-[var(--accent-gold)] rounded-full"></span>
                                {cat.title}
                            </h2>
                            <button className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1 group">
                                Sjá Allt <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cat.series.map((show: any) => (
                                <Link
                                    href={`/sermons/${show.guid}`}
                                    key={show.guid}
                                    className="group relative aspect-[2/3] bg-[var(--bg-surface)] rounded-[var(--radius-md)] overflow-hidden cursor-pointer shadow-lg border border-[var(--glass-border)] transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl"
                                >
                                    <Image
                                        src={show.meta.thumbnail}
                                        alt={show.meta.title}
                                        fill
                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                                    {/* Hover Play Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-12 h-12 rounded-full bg-[var(--primary-glow)] flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)] scale-75 group-hover:scale-100 transition-transform">
                                            <Play size={20} fill="white" className="ml-1 text-white" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-[var(--accent-gold)] tracking-wider mb-2">
                                            <Clock size={10} />
                                            <span>{Math.floor(show.length / 60)} min</span>
                                        </div>
                                        <h3 className="text-white font-bold leading-tight drop-shadow-md line-clamp-2 text-sm mb-1 group-hover:text-[var(--accent-gold)] transition-colors">
                                            {show.meta.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-[10px] text-white/50 border-t border-white/10 pt-2 mt-2">
                                            <span>{show.meta.show}</span>
                                            <span>{show.meta.dateDisplay}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

        </main>
    );
}
