import Navbar from "@/components/layout/Navbar";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import { Play, ChevronRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

const MOCK_SHOWS = [
    {
        title: "Nýlega bætt við",
        style: "landscape" as const,
        episodes: [
            { id: "m1", title: "Trúin sem sigrar", thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=340&fit=crop", duration: 28, show: "Í Snertingu" },
            { id: "m2", title: "Kraftur bænarinnar", thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&h=340&fit=crop", duration: 25, show: "Bænakvöld" },
            { id: "m3", title: "Framtíð Miðlunar", thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=340&fit=crop", duration: 65, show: "Sunnudagssamkoma" },
            { id: "m4", title: "Náð sem læknar", thumbnail: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=600&h=340&fit=crop", duration: 30, show: "Í Snertingu" },
            { id: "m5", title: "Vonin lifir", thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=340&fit=crop", duration: 27, show: "Fræðsla" },
        ]
    },
    {
        title: "Í Snertingu",
        style: "portrait" as const,
        episodes: [
            { id: "m6", title: "Trúin sem sigrar", thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&h=600&fit=crop", duration: 28, show: "Í Snertingu" },
            { id: "m7", title: "Kraftur fyrirgefningarinnar", thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=600&fit=crop", duration: 30, show: "Í Snertingu" },
            { id: "m8", title: "Guðs áætlun", thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=600&fit=crop", duration: 32, show: "Í Snertingu" },
            { id: "m9", title: "Friður í storminum", thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop", duration: 28, show: "Í Snertingu" },
            { id: "m10", title: "Styrkur í veikleika", thumbnail: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=600&fit=crop", duration: 26, show: "Í Snertingu" },
            { id: "m11", title: "Vonin uppi á móti", thumbnail: "https://images.unsplash.com/photo-1509225770129-c9951ab42a9d?w=400&h=600&fit=crop", duration: 29, show: "Í Snertingu" },
            { id: "m12", title: "Bænin breytir öllu", thumbnail: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=400&h=600&fit=crop", duration: 31, show: "Í Snertingu" },
        ]
    },
    {
        title: "Sunnudagssamkoma",
        style: "portrait" as const,
        episodes: [
            { id: "m13", title: "Framtíð Miðlunar", thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=600&fit=crop", duration: 65, show: "Sunnudagssamkoma" },
            { id: "m14", title: "Gleði Drottins", thumbnail: "https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=400&h=600&fit=crop", duration: 58, show: "Sunnudagssamkoma" },
            { id: "m15", title: "Kærleikur án skilyrða", thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400&h=600&fit=crop", duration: 62, show: "Sunnudagssamkoma" },
            { id: "m16", title: "Breyting innan frá", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=600&fit=crop", duration: 55, show: "Sunnudagssamkoma" },
            { id: "m17", title: "Frelsi í Kristi", thumbnail: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&h=600&fit=crop", duration: 60, show: "Sunnudagssamkoma" },
            { id: "m18", title: "Ný byrjun", thumbnail: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=600&fit=crop", duration: 57, show: "Sunnudagssamkoma" },
            { id: "m19", title: "Þakklæti", thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop", duration: 63, show: "Sunnudagssamkoma" },
        ]
    },
    {
        title: "Bænakvöld",
        style: "landscape" as const,
        episodes: [
            { id: "m20", title: "Bæn fyrir Íslandi", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=340&fit=crop", duration: 45, show: "Bænakvöld" },
            { id: "m21", title: "Bæn fyrir fjölskyldunni", thumbnail: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=600&h=340&fit=crop", duration: 40, show: "Bænakvöld" },
            { id: "m22", title: "Bæn fyrir kirkjunni", thumbnail: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=340&fit=crop", duration: 38, show: "Bænakvöld" },
            { id: "m23", title: "Bæn fyrir Ísrael", thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=340&fit=crop", duration: 42, show: "Bænakvöld" },
            { id: "m24", title: "Bæn um leiðsögn", thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600&h=340&fit=crop", duration: 35, show: "Bænakvöld" },
        ]
    },
    {
        title: "Fræðsla",
        style: "portrait" as const,
        episodes: [
            { id: "m25", title: "Grundvallaratriði trúarinnar", thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop", duration: 35, show: "Fræðsla" },
            { id: "m26", title: "Biblían á auðveldan hátt", thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop", duration: 28, show: "Fræðsla" },
            { id: "m27", title: "Heilagur Andi", thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop", duration: 33, show: "Fræðsla" },
            { id: "m28", title: "Bænin sem breytir", thumbnail: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=600&fit=crop", duration: 30, show: "Fræðsla" },
            { id: "m29", title: "Trúarjátningin", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop", duration: 42, show: "Fræðsla" },
            { id: "m30", title: "Sögulegur Jesús", thumbnail: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&h=600&fit=crop", duration: 38, show: "Fræðsla" },
            { id: "m31", title: "Dýrð Guðs", thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop", duration: 34, show: "Fræðsla" },
        ]
    },
];

export default async function SermonsPage() {
    const videos = await getVideos(1, 100);
    const hasRealContent = videos.length > 0;
    const categories = MOCK_SHOWS;
    const featured = categories[0]?.episodes[0];

    return (
        <main className="min-h-screen bg-[#141414] text-white">
            <Navbar />

            {/* Hero — massive, cinematic, Netflix-style */}
            {featured && (
                <div className="relative h-[85vh] w-full flex items-end">
                    <img
                        src={featured.thumbnail}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/70 via-transparent to-transparent" />

                    <div className="relative z-10 w-full px-[4%] pb-[8%]">
                        <p className="text-white/50 text-[13px] font-normal mb-2">
                            {featured.show}
                        </p>
                        <h1 className="text-[3.5vw] font-bold mb-3 tracking-tight leading-none max-w-[50%]" style={{ fontFamily: 'var(--font-sans)' }}>
                            {featured.title}
                        </h1>
                        <div className="flex gap-2 mt-4">
                            <Link href={`/sermons/${featured.id}`} className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded font-bold text-[14px] hover:bg-white/80 transition-colors">
                                <Play size={18} fill="currentColor" />
                                Spila
                            </Link>
                            <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-2.5 rounded font-medium text-[14px] hover:bg-white/30 transition-colors backdrop-blur-sm">
                                Meira
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Rows — Netflix style, tight, image-forward */}
            <div className="relative z-20 -mt-[5vh] space-y-8 pb-20">
                {categories.map((cat) => (
                    <section key={cat.title} className="px-[4%]">
                        <h2 className="text-[16px] font-semibold text-white/90 mb-2 flex items-center gap-1" style={{ fontFamily: 'var(--font-sans)' }}>
                            {cat.title}
                            <ChevronRight size={16} className="text-white/30" />
                        </h2>

                        {cat.style === 'landscape' ? (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {cat.episodes.map((ep: any) => (
                                    <Link href={`/sermons/${ep.id}`} key={ep.id} className="group flex-shrink-0 w-[calc(25%-6px)]">
                                        <div className="relative aspect-video overflow-hidden rounded-[4px] bg-[#2a2a2a]">
                                            <img
                                                src={ep.thumbnail}
                                                alt={ep.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <p className="text-white text-[13px] font-semibold leading-tight">{ep.title}</p>
                                                <p className="text-white/50 text-[11px] mt-0.5">{ep.show} · {ep.duration} mín</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                                {cat.episodes.map((ep: any) => (
                                    <Link href={`/sermons/${ep.id}`} key={ep.id} className="group flex-shrink-0 w-[calc(14.28%-4px)] min-w-[130px]">
                                        <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] bg-[#2a2a2a]">
                                            <img
                                                src={ep.thumbnail}
                                                alt={ep.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {!hasRealContent && (
                <div className="text-center pb-12">
                    <p className="text-[11px] text-white/20 uppercase tracking-[0.2em]">
                        Forskoðun — raunverulegt efni kemur fljótlega
                    </p>
                </div>
            )}
        </main>
    );
}
