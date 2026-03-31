import FuturisticPlayer from "@/components/player/FuturisticPlayer";
import { ArrowLeft, Clock, Play } from "lucide-react";
import Link from "next/link";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";

export const revalidate = 60;

export async function generateStaticParams() {
    const videos = await getVideos();
    return videos.map((video) => ({ id: video.guid }));
}

// Mock data lookup for preview
const MOCK_DATA: Record<string, { title: string; show: string; episode: string; desc: string; duration: number; thumbnail: string }> = {
    'm1': { title: 'Trúin sem sigrar', show: 'Í Snertingu', episode: 'Þáttur 12', desc: 'Í þessum þætti ræðum við um hvernig trúin getur sigrað á erfiðustu aðstæðum. Dr. Charles Stanley deilir kenningu sinni um trú sem hreyfir fjöll.', duration: 28, thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&h=680&fit=crop' },
    'm2': { title: 'Kraftur bænarinnar', show: 'Bænakvöld', episode: 'Þáttur 8', desc: 'Bænin er öflugasta vopnið okkar. Lærðu hvernig á að beita henni með trú og þolinmæði.', duration: 25, thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&h=680&fit=crop' },
    'm3': { title: 'Framtíð Miðlunar', show: 'Sunnudagssamkoma', episode: '31. mars', desc: 'Sunnudagssamkoma þar sem við ræðum framtíð kristinnar miðlunar á Íslandi og hlutverk Omega.', duration: 65, thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&h=680&fit=crop' },
    'm4': { title: 'Náð sem læknar', show: 'Í Snertingu', episode: 'Þáttur 11', desc: 'Guðs náð er nóg. Í þessum þætti skoðum við hvernig náðin læknar sár fortíðar og opnar dyr að framtíðinni.', duration: 30, thumbnail: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&h=680&fit=crop' },
    'm5': { title: 'Vonin lifir', show: 'Fræðsla', episode: 'Þáttur 3', desc: 'Þegar allt virðist vonlaust er Guð enn að verki. Saga um von sem breytir öllu.', duration: 27, thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=680&fit=crop' },
};

// Generate more mock entries for related content
const MOCK_RELATED: Record<string, { id: string; title: string; thumbnail: string; duration: number }[]> = {
    'Í Snertingu': [
        { id: 'm6', title: 'Trúin sem sigrar', thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=340&fit=crop', duration: 28 },
        { id: 'm7', title: 'Kraftur fyrirgefningarinnar', thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=340&fit=crop', duration: 30 },
        { id: 'm8', title: 'Guðs áætlun', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=340&fit=crop', duration: 32 },
        { id: 'm9', title: 'Friður í storminum', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=340&fit=crop', duration: 28 },
    ],
    'Sunnudagssamkoma': [
        { id: 'm13', title: 'Gleði Drottins', thumbnail: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=600&h=340&fit=crop', duration: 58 },
        { id: 'm14', title: 'Kærleikur án skilyrða', thumbnail: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600&h=340&fit=crop', duration: 62 },
        { id: 'm15', title: 'Breyting innan frá', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=340&fit=crop', duration: 55 },
    ],
    'Bænakvöld': [
        { id: 'm20', title: 'Bæn fyrir Íslandi', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=340&fit=crop', duration: 45 },
        { id: 'm21', title: 'Bæn fyrir fjölskyldunni', thumbnail: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=600&h=340&fit=crop', duration: 40 },
        { id: 'm22', title: 'Bæn fyrir kirkjunni', thumbnail: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=340&fit=crop', duration: 38 },
    ],
    'Fræðsla': [
        { id: 'm25', title: 'Grundvallaratriði trúarinnar', thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=340&fit=crop', duration: 35 },
        { id: 'm26', title: 'Biblían á auðveldan hátt', thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop', duration: 28 },
        { id: 'm27', title: 'Heilagur Andi', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=340&fit=crop', duration: 33 },
    ],
};

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Try real content first
    const videos = await getVideos();
    const video = videos.find(v => v.guid === id);

    if (video) {
        // Real Bunny content
        const meta = parseVideoMetadata(video);
        const relatedVideos = videos
            .filter(v => v.guid !== id && parseVideoMetadata(v).show === meta.show)
            .slice(0, 6);

        return renderPage({
            id,
            title: meta.title,
            show: meta.show,
            episode: meta.dateDisplay,
            desc: `Horfðu á ${meta.title} úr þætti ${meta.show}. Uppbyggilegt efni á íslensku frá Omega Stöðinni.`,
            duration: Math.floor(video.length / 60),
            thumbnail: meta.thumbnail,
            isReal: true,
            related: relatedVideos.map(v => {
                const vm = parseVideoMetadata(v);
                return { id: v.guid, title: vm.title, thumbnail: vm.thumbnail, duration: Math.floor(v.length / 60) };
            }),
        });
    }

    // Mock content fallback
    const mock = MOCK_DATA[id];
    if (mock) {
        return renderPage({
            id,
            ...mock,
            isReal: false,
            related: (MOCK_RELATED[mock.show] || []).filter(r => r.id !== id),
        });
    }

    // Not found
    return (
        <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Myndband fannst ekki</h1>
                <Link href="/sermons" className="text-[#5b8abf] hover:underline">
                    Til baka í þáttasafn
                </Link>
            </div>
        </div>
    );
}

function renderPage({ id, title, show, episode, desc, duration, thumbnail, isReal, related }: {
    id: string; title: string; show: string; episode: string; desc: string;
    duration: number; thumbnail: string; isReal: boolean;
    related: { id: string; title: string; thumbnail: string; duration: number }[];
}) {
    return (
        <main className="min-h-screen bg-[#f8f7f4]">
            {/* Dark player section */}
            <div className="bg-black">
                <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-3">
                    <Link href="/sermons" className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm">
                        <ArrowLeft size={16} />
                        <span>Þáttasafn</span>
                    </Link>
                </div>

                <div className="max-w-[1200px] mx-auto px-6 pb-8">
                    {isReal ? (
                        <div className="aspect-video w-full bg-black overflow-hidden">
                            <FuturisticPlayer
                                videoId={id}
                                libraryId={process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!}
                                title={title}
                            />
                        </div>
                    ) : (
                        /* Mock player with thumbnail */
                        <div className="aspect-video w-full bg-black overflow-hidden relative">
                            <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                                    <Play size={28} className="ml-1 text-white fill-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 text-white/60 text-xs">
                                Forskoðun — myndband ekki tiltækt
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content — warm light */}
            <div className="max-w-[1200px] mx-auto px-6 py-10">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-[#5b8abf] text-[11px] font-semibold uppercase tracking-[0.15em]">{show}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400 text-[11px] uppercase tracking-wider">{episode}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3" style={{ fontFamily: 'var(--font-sans)' }}>
                        {title}
                    </h1>
                    <p className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
                        <Clock size={14} /> {duration} mín
                    </p>
                    <p className="text-gray-500 leading-relaxed max-w-2xl">{desc}</p>
                </div>

                {/* Related episodes */}
                {related.length > 0 && (
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-sans)' }}>
                            Fleira úr {show}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {related.map((r) => (
                                <Link key={r.id} href={`/sermons/${r.id}`} className="group">
                                    <div className="relative aspect-video overflow-hidden rounded-2xl mb-2.5 bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-all duration-300">
                                        <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white/95 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                                                <Play size={14} fill="black" className="ml-0.5 text-black" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-sans)' }}>
                                        {r.title}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{r.duration} mín</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-16 pt-8 border-t border-black/[0.06]">
                    <Link href="/sermons" className="text-[#5b8abf] text-sm font-medium hover:underline">
                        ← Til baka í þáttasafn
                    </Link>
                </div>
            </div>
        </main>
    );
}
