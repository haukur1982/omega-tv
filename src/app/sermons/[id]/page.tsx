import FuturisticPlayer from "@/components/player/FuturisticPlayer";
import { ArrowLeft, Play, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";

export const revalidate = 60;

export async function generateStaticParams() {
    const videos = await getVideos();
    return videos.map((video) => ({ id: video.guid }));
}

// Mock data
const MOCK_DATA: Record<string, { title: string; show: string; episode: string; desc: string; duration: number; thumbnail: string }> = {
    'm1': { title: 'Trúin sem sigrar', show: 'Í Snertingu', episode: 'Þáttur 12', desc: 'Í þessum þætti ræðum við um hvernig trúin getur sigrað á erfiðustu aðstæðum. Dr. Charles Stanley deilir kenningu sinni um hvernig við getum treyst Guði jafnvel þegar allt virðist vonlaust.', duration: 28, thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1400&h=800&fit=crop' },
    'm2': { title: 'Kraftur bænarinnar', show: 'Bænakvöld', episode: 'Þáttur 8', desc: 'Bænin er öflugasta vopnið okkar. Lærðu hvernig á að beita henni með trú og þolinmæði. Saman könnum við dýpt bænarinnar.', duration: 25, thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1400&h=800&fit=crop' },
    'm3': { title: 'Framtíð Miðlunar', show: 'Sunnudagssamkoma', episode: '31. mars 2026', desc: 'Sunnudagssamkoma þar sem við ræðum framtíð kristinnar miðlunar á Íslandi og hlutverk Omega Stöðinnar í nýrri tíð.', duration: 65, thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1400&h=800&fit=crop' },
    'm4': { title: 'Náð sem læknar', show: 'Í Snertingu', episode: 'Þáttur 11', desc: 'Guðs náð er nóg. Í þessum þætti skoðum við hvernig náðin læknar sár fortíðar og opnar dyr að framtíðinni.', duration: 30, thumbnail: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1400&h=800&fit=crop' },
    'm5': { title: 'Vonin lifir', show: 'Fræðsla', episode: 'Þáttur 3', desc: 'Þegar allt virðist vonlaust er Guð enn að verki. Saga um von sem breytir öllu.', duration: 27, thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1400&h=800&fit=crop' },
};

const MOCK_RELATED: Record<string, { id: string; title: string; thumbnail: string; duration: number; episode: string }[]> = {
    'Í Snertingu': [
        { id: 'm6', title: 'Trúin sem sigrar', thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=340&fit=crop', duration: 28, episode: 'Þáttur 12' },
        { id: 'm7', title: 'Kraftur fyrirgefningarinnar', thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=340&fit=crop', duration: 30, episode: 'Þáttur 10' },
        { id: 'm8', title: 'Guðs áætlun', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=340&fit=crop', duration: 32, episode: 'Þáttur 9' },
        { id: 'm9', title: 'Friður í storminum', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=340&fit=crop', duration: 28, episode: 'Þáttur 8' },
    ],
    'Sunnudagssamkoma': [
        { id: 'm13', title: 'Gleði Drottins', thumbnail: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=600&h=340&fit=crop', duration: 58, episode: '24. mars' },
        { id: 'm14', title: 'Kærleikur án skilyrða', thumbnail: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600&h=340&fit=crop', duration: 62, episode: '17. mars' },
        { id: 'm15', title: 'Breyting innan frá', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=340&fit=crop', duration: 55, episode: '10. mars' },
    ],
    'Bænakvöld': [
        { id: 'm20', title: 'Bæn fyrir Íslandi', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=340&fit=crop', duration: 45, episode: 'Þáttur 20' },
        { id: 'm21', title: 'Bæn fyrir fjölskyldunni', thumbnail: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=600&h=340&fit=crop', duration: 40, episode: 'Þáttur 19' },
        { id: 'm22', title: 'Bæn fyrir kirkjunni', thumbnail: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=340&fit=crop', duration: 38, episode: 'Þáttur 18' },
    ],
    'Fræðsla': [
        { id: 'm25', title: 'Grundvallaratriði trúarinnar', thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=340&fit=crop', duration: 35, episode: 'Þáttur 1' },
        { id: 'm26', title: 'Biblían á auðveldan hátt', thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop', duration: 28, episode: 'Þáttur 2' },
        { id: 'm27', title: 'Heilagur Andi', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=340&fit=crop', duration: 33, episode: 'Þáttur 4' },
    ],
};

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const videos = await getVideos();
    const video = videos.find(v => v.guid === id);

    let pageData: {
        id: string; title: string; show: string; episode: string;
        desc: string; duration: number; thumbnail: string; isReal: boolean;
        related: { id: string; title: string; thumbnail: string; duration: number; episode: string }[];
    };

    if (video) {
        const meta = parseVideoMetadata(video);
        const rel = videos.filter(v => v.guid !== id && parseVideoMetadata(v).show === meta.show).slice(0, 4);
        pageData = {
            id, title: meta.title, show: meta.show, episode: meta.dateDisplay,
            desc: `Horfðu á ${meta.title} úr þætti ${meta.show}. Uppbyggilegt efni á íslensku frá Omega Stöðinni.`,
            duration: Math.floor(video.length / 60), thumbnail: meta.thumbnail, isReal: true,
            related: rel.map(v => { const vm = parseVideoMetadata(v); return { id: v.guid, title: vm.title, thumbnail: vm.thumbnail, duration: Math.floor(v.length / 60), episode: vm.dateDisplay }; }),
        };
    } else if (MOCK_DATA[id]) {
        const mock = MOCK_DATA[id];
        pageData = { id, ...mock, isReal: false, related: (MOCK_RELATED[mock.show] || []).filter(r => r.id !== id) };
    } else {
        return (
            <div className="min-h-screen bg-[#141414] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Myndband fannst ekki</h1>
                    <Link href="/sermons" className="text-[#5b8abf] hover:underline">Til baka í þáttasafn</Link>
                </div>
            </div>
        );
    }

    const { title, show, episode, desc, duration, thumbnail, isReal, related } = pageData;

    return (
        <main className="min-h-screen bg-[#141414] text-white">
            {/* Player area — full width, cinematic */}
            <div className="relative bg-black">
                {/* Back nav */}
                <div className="absolute top-0 left-0 right-0 z-30 px-[4%] pt-5">
                    <Link href="/sermons" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[13px]">
                        <ArrowLeft size={16} />
                        Þáttasafn
                    </Link>
                </div>

                {/* Player / Preview */}
                <div className="max-w-[1400px] mx-auto">
                    {isReal ? (
                        <div className="aspect-video w-full">
                            <FuturisticPlayer videoId={id} libraryId={process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!} title={title} />
                        </div>
                    ) : (
                        <div className="aspect-video w-full relative">
                            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-110 transition-transform">
                                    <Play size={24} fill="black" className="ml-1 text-black" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Episode Info — Netflix style */}
            <div className="px-[4%] py-10 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
                    {/* Left: Main info */}
                    <div>
                        <div className="flex items-center gap-3 text-[13px] text-white/40 mb-3">
                            <span className="text-[#46d369] font-semibold">Nýtt</span>
                            <span>{duration} mín</span>
                        </div>
                        <h1 className="text-[28px] md:text-[32px] font-bold mb-4 leading-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                            {title}
                        </h1>
                        <p className="text-[15px] text-white/70 leading-relaxed max-w-xl">
                            {desc}
                        </p>
                    </div>

                    {/* Right: Metadata */}
                    <div className="text-[13px] text-white/40 space-y-2">
                        <p><span className="text-white/20">Þáttaröð:</span> <span className="text-white/70">{show}</span></p>
                        <p><span className="text-white/20">Þáttur:</span> <span className="text-white/70">{episode}</span></p>
                        <p><span className="text-white/20">Lengd:</span> <span className="text-white/70">{duration} mín</span></p>
                    </div>
                </div>
            </div>

            {/* Related Episodes — Netflix episode row */}
            {related.length > 0 && (
                <div className="px-[4%] pb-16 max-w-[1400px] mx-auto">
                    <h2 className="text-[15px] font-semibold text-[#e5e5e5] mb-4 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)' }}>
                        Fleira úr {show}
                        <ChevronRight size={15} className="text-white/20" />
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[6px]">
                        {related.map((r) => (
                            <Link key={r.id} href={`/sermons/${r.id}`} className="group">
                                <div className="relative aspect-video overflow-hidden rounded-md bg-[#1a1a1a] ring-0 group-hover:ring-1 group-hover:ring-white/20 transition-all duration-200">
                                    <img
                                        src={r.thumbnail}
                                        alt={r.title}
                                        className="w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.08]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                                            <Play size={16} fill="black" className="ml-0.5 text-black" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">{r.episode}</p>
                                        <p className="text-white text-[13px] font-semibold leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{r.title}</p>
                                        <p className="text-white/30 text-[11px] mt-0.5">{r.duration} mín</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
