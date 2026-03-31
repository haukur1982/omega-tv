import Navbar from "@/components/layout/Navbar";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import { Play, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

// Mock content for preview
const MOCK_SHOWS = [
    {
        title: "Nýlega bætt við",
        style: "landscape" as const,
        episodes: [
            { id: "m1", title: "Trúin sem sigrar", desc: "Í þessum þætti ræðum við um hvernig trúin getur sigrað á erfiðustu aðstæðum.", thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=340&fit=crop", duration: 28, show: "Í Snertingu", episode: "Þáttur 12" },
            { id: "m2", title: "Kraftur bænarinnar", desc: "Bænin er öflugasta vopnið okkar. Lærðu hvernig á að beita henni.", thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&h=340&fit=crop", duration: 25, show: "Bænakvöld", episode: "Þáttur 8" },
            { id: "m3", title: "Framtíð Miðlunar", desc: "Sunnudagssamkoma þar sem við ræðum framtíð kristinnar miðlunar á Íslandi.", thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=340&fit=crop", duration: 65, show: "Sunnudagssamkoma", episode: "31. mars" },
            { id: "m4", title: "Náð sem læknar", desc: "Guðs náð er nóg. Í þessum þætti skoðum við hvernig náðin læknar sár.", thumbnail: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=600&h=340&fit=crop", duration: 30, show: "Í Snertingu", episode: "Þáttur 11" },
            { id: "m5", title: "Vonin lifir", desc: "Þegar allt virðist vonlaust er Guð enn að verki. Saga um von.", thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=340&fit=crop", duration: 27, show: "Fræðsla", episode: "Þáttur 3" },
        ]
    },
    {
        title: "Í Snertingu með Dr. Charles Stanley",
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
            { id: "m20", title: "Bæn fyrir Íslandi", desc: "Saman biðjum við fyrir þjóðinni — fyrir friði og veru Guðs.", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=340&fit=crop", duration: 45, show: "Bænakvöld", episode: "Þáttur 20" },
            { id: "m21", title: "Bæn fyrir fjölskyldunni", desc: "Fjölskyldan er grundvöllur samfélagsins. Biðjum saman.", thumbnail: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=600&h=340&fit=crop", duration: 40, show: "Bænakvöld", episode: "Þáttur 19" },
            { id: "m22", title: "Bæn fyrir kirkjunni", desc: "Kirkjan á Íslandi þarfnast vakningu. Biðjum saman um nýjan eld.", thumbnail: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=340&fit=crop", duration: 38, show: "Bænakvöld", episode: "Þáttur 18" },
            { id: "m23", title: "Bæn fyrir Ísrael", desc: "Biðjið fyrir friði Jerúsalem — Sálmur 122:6.", thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=340&fit=crop", duration: 42, show: "Bænakvöld", episode: "Þáttur 17" },
            { id: "m24", title: "Bæn um leiðsögn", desc: "Þegar vegurinn er óljós, leiðir Guð okkur skref fyrir skref.", thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600&h=340&fit=crop", duration: 35, show: "Bænakvöld", episode: "Þáttur 16" },
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

    // Use mock for now
    const categories = MOCK_SHOWS;
    const featured = categories[0]?.episodes[0];

    return (
        <main className="min-h-screen bg-[#f8f7f4]">
            {/* Refined light navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-3.5 flex justify-between items-center bg-[#f8f7f4]/80 backdrop-blur-2xl border-b border-black/[0.04]">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="text-[#5b8abf] font-bold text-xl">Ω</span>
                    <span className="text-gray-800 font-semibold tracking-[0.12em] text-[13px] uppercase">Omega</span>
                </Link>
                <div className="hidden md:flex items-center gap-7">
                    {[
                        { href: '/live', label: 'Beint' },
                        { href: '/sermons', label: 'Þáttasafn' },
                        { href: '/baenatorg', label: 'Bænatorg' },
                        { href: '/about', label: 'Um okkur' },
                        { href: '/give', label: 'Styrkja' },
                    ].map(link => (
                        <Link key={link.href} href={link.href} className="text-[13px] font-medium text-gray-400 hover:text-gray-800 transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>
                <Link href="/live" className="flex items-center gap-2 bg-[#5b8abf] text-white px-5 py-2 rounded-full font-medium text-[13px] hover:brightness-110 transition-all">
                    <Play size={11} fill="currentColor" />
                    Horfa
                </Link>
            </nav>

            {/* Hero — Cinematic, blends smoothly into warm background */}
            {featured && (
                <div className="relative h-[68vh] w-full flex items-end">
                    <img
                        src={featured.thumbnail}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Smooth gradient from content into warm bg */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#f8f7f4] via-black/50 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pb-12">
                        <div className="max-w-md">
                            <p className="text-white/50 text-[11px] font-medium uppercase tracking-[0.18em] mb-2">
                                {featured.show} · {(featured as any).episode || ''}
                            </p>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white tracking-tight leading-[1.1]" style={{ fontFamily: 'var(--font-sans)' }}>
                                {featured.title}
                            </h1>
                            {(featured as any).desc && (
                                <p className="text-white/50 text-[13px] leading-relaxed mb-5 line-clamp-2 max-w-sm">
                                    {(featured as any).desc}
                                </p>
                            )}
                            <button className="flex items-center gap-2 bg-white/95 text-black px-6 py-2.5 rounded-lg font-semibold text-[13px] hover:bg-white transition-colors shadow-lg shadow-black/20">
                                <Play size={14} fill="currentColor" />
                                Spila
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Rows — refined Apple TV+ style */}
            <div className="pt-6 pb-16 max-w-7xl mx-auto px-8 space-y-8">
                {categories.map((cat) => (
                    <section key={cat.title}>
                        <h2 className="text-[17px] font-bold text-gray-900 mb-4 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)' }}>
                            {cat.title}
                            <ChevronRight size={16} className="text-gray-300" />
                        </h2>

                        {cat.style === 'landscape' ? (
                            <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none -mx-8 px-8">
                                {cat.episodes.map((ep: any) => (
                                    <Link href={`/sermons/${ep.id}`} key={ep.id} className="group flex-shrink-0 w-[280px] md:w-[320px]">
                                        <div className="relative aspect-video overflow-hidden rounded-2xl mb-3 bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300">
                                            <img
                                                src={ep.thumbnail}
                                                alt={ep.title}
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-center justify-center">
                                                <div className="w-11 h-11 rounded-full bg-white/95 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                                                    <Play size={16} fill="black" className="ml-0.5 text-black" />
                                                </div>
                                            </div>
                                        </div>
                                        {ep.episode && <p className="text-[10px] text-gray-400 uppercase tracking-[0.08em] mb-0.5 font-medium">{ep.episode}</p>}
                                        <h3 className="text-[14px] font-semibold text-gray-900 leading-snug" style={{ fontFamily: 'var(--font-sans)' }}>{ep.title}</h3>
                                        {ep.desc && <p className="text-[12px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed font-normal">{ep.desc}</p>}
                                        <p className="text-[11px] text-gray-300 mt-1 flex items-center gap-1">
                                            <Play size={8} fill="currentColor" /> {ep.duration} mín
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none -mx-8 px-8">
                                {cat.episodes.map((ep: any) => (
                                    <Link href={`/sermons/${ep.id}`} key={ep.id} className="group flex-shrink-0 w-[140px] md:w-[160px]">
                                        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl mb-2 bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all duration-300">
                                            <img
                                                src={ep.thumbnail}
                                                alt={ep.title}
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                            />
                                        </div>
                                        <h3 className="text-[12px] font-medium text-gray-700 leading-tight line-clamp-2" style={{ fontFamily: 'var(--font-sans)' }}>
                                            {ep.title}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {!hasRealContent && (
                <div className="text-center pb-16">
                    <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">
                        Forskoðun — raunverulegt efni kemur fljótlega
                    </p>
                </div>
            )}
        </main>
    );
}
