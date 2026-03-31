import Navbar from "@/components/layout/Navbar";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import { Play, Clock, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

// Mock content for preview — will be replaced by real Bunny content
const MOCK_SHOWS = [
    {
        title: "Í Snertingu",
        episodes: [
            { id: "mock-1", title: "Trúin sem sigrar", thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&h=600&fit=crop", duration: 28, show: "Í Snertingu" },
            { id: "mock-2", title: "Kraftur bænarinnar", thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=600&fit=crop", duration: 25, show: "Í Snertingu" },
            { id: "mock-3", title: "Náð sem læknar", thumbnail: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&h=600&fit=crop", duration: 30, show: "Í Snertingu" },
            { id: "mock-4", title: "Vonin lifir", thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop", duration: 27, show: "Í Snertingu" },
            { id: "mock-5", title: "Guðs áætlun", thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=600&fit=crop", duration: 32, show: "Í Snertingu" },
        ]
    },
    {
        title: "Sunnudagssamkoma",
        episodes: [
            { id: "mock-6", title: "Framtíð Miðlunar", thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=600&fit=crop", duration: 65, show: "Sunnudagssamkoma" },
            { id: "mock-7", title: "Gleði Drottins", thumbnail: "https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=400&h=600&fit=crop", duration: 58, show: "Sunnudagssamkoma" },
            { id: "mock-8", title: "Kærleikur án skilyrða", thumbnail: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=400&h=600&fit=crop", duration: 62, show: "Sunnudagssamkoma" },
            { id: "mock-9", title: "Breyting innan frá", thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=600&fit=crop", duration: 55, show: "Sunnudagssamkoma" },
            { id: "mock-10", title: "Frelsi í Kristi", thumbnail: "https://images.unsplash.com/photo-1509225770129-c9951ab42a9d?w=400&h=600&fit=crop", duration: 60, show: "Sunnudagssamkoma" },
        ]
    },
    {
        title: "Bænakvöld",
        episodes: [
            { id: "mock-11", title: "Bæn fyrir Íslandi", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=600&fit=crop", duration: 45, show: "Bænakvöld" },
            { id: "mock-12", title: "Bæn fyrir fjölskyldunni", thumbnail: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&h=600&fit=crop", duration: 40, show: "Bænakvöld" },
            { id: "mock-13", title: "Bæn fyrir kirkjunni", thumbnail: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=600&fit=crop", duration: 38, show: "Bænakvöld" },
            { id: "mock-14", title: "Bæn fyrir Ísrael", thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop", duration: 42, show: "Bænakvöld" },
            { id: "mock-15", title: "Bæn um leiðsögn", thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400&h=600&fit=crop", duration: 35, show: "Bænakvöld" },
        ]
    },
    {
        title: "Fræðsla",
        episodes: [
            { id: "mock-16", title: "Grundvallaratriði trúarinnar", thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop", duration: 35, show: "Fræðsla" },
            { id: "mock-17", title: "Biblían á auðveldan hátt", thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop", duration: 28, show: "Fræðsla" },
            { id: "mock-18", title: "Sögulegur Jesús", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop", duration: 42, show: "Fræðsla" },
            { id: "mock-19", title: "Heilagur Andi", thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop", duration: 33, show: "Fræðsla" },
            { id: "mock-20", title: "Bænin sem breytir", thumbnail: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=600&fit=crop", duration: 30, show: "Fræðsla" },
        ]
    },
];

export default async function SermonsPage() {
    const videos = await getVideos(1, 100);
    const hasRealContent = videos.length > 0;

    // Use real content if available, otherwise show mock
    let categories: { title: string; episodes: any[] }[];

    if (hasRealContent) {
        const grouped: Record<string, any[]> = {};
        videos.forEach(video => {
            const meta = parseVideoMetadata(video);
            if (!grouped[meta.show]) grouped[meta.show] = [];
            grouped[meta.show].push({
                id: video.guid,
                title: meta.title,
                thumbnail: meta.thumbnail,
                duration: Math.floor(video.length / 60),
                show: meta.show,
            });
        });
        categories = Object.keys(grouped).map(key => ({ title: key, episodes: grouped[key] }));
    } else {
        categories = MOCK_SHOWS;
    }

    // Featured content (first episode of first category)
    const featured = categories[0]?.episodes[0];

    return (
        <main className="min-h-screen bg-[var(--bg-deep)]">
            <Navbar />

            {/* Hero — Featured Content */}
            {featured && (
                <div className="relative h-[80vh] w-full flex items-end">
                    <div className="absolute inset-0">
                        <img
                            src={featured.thumbnail}
                            alt={featured.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-deep)]/80 via-[var(--bg-deep)]/30 to-transparent" />
                    </div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20">
                        <div className="max-w-lg">
                            <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                                {featured.show}
                            </p>
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-[0.95]">
                                {featured.title}
                            </h1>
                            <p className="text-[var(--text-secondary)] mb-6 flex items-center gap-2 text-sm">
                                <Clock size={14} />
                                {featured.duration} mín
                            </p>
                            <div className="flex gap-3">
                                <Link href={hasRealContent ? `/sermons/${featured.id}` : '#'} className="flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-deep)] px-8 py-4 font-bold text-sm hover:bg-white transition-colors">
                                    <Play size={18} fill="currentColor" />
                                    Spila
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Rows — Netflix/Apple TV style */}
            <div className="relative z-20 -mt-16 pb-20 max-w-7xl mx-auto px-6 space-y-12">
                {categories.map((cat) => (
                    <section key={cat.title}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold tracking-tight">{cat.title}</h2>
                            <span className="text-xs text-[var(--text-muted)] uppercase tracking-[0.15em] flex items-center gap-1 cursor-pointer hover:text-[var(--text-primary)] transition-colors">
                                Sjá allt <ChevronRight size={14} />
                            </span>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6">
                            {cat.episodes.map((ep: any) => (
                                <Link
                                    href={hasRealContent ? `/sermons/${ep.id}` : '#'}
                                    key={ep.id}
                                    className="group flex-shrink-0 w-[160px] md:w-[185px]"
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg mb-2 bg-[var(--bg-surface)]">
                                        <img
                                            src={ep.thumbnail}
                                            alt={ep.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                                                <Play size={18} fill="black" className="ml-0.5 text-black" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-[var(--text-primary)] leading-tight line-clamp-2 group-hover:text-white transition-colors">
                                        {ep.title}
                                    </h3>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">{ep.duration} mín</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {!hasRealContent && (
                <div className="text-center pb-20">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em]">
                        Forskoðun — raunverulegt efni kemur fljótlega
                    </p>
                </div>
            )}
        </main>
    );
}
