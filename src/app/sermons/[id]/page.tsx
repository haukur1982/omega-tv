import FuturisticPlayer from "@/components/player/FuturisticPlayer";
import { ArrowLeft, Play, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";

export const revalidate = 60;

export async function generateStaticParams() {
    const videos = await getVideos();
    return videos.map((video) => ({ id: video.guid }));
}

const MOCK_DATA: Record<string, { title: string; show: string; episode: string; desc: string; duration: number; thumbnail: string }> = {
    'm1': { title: 'Trúin sem sigrar', show: 'Í Snertingu', episode: 'Þáttur 12', desc: 'Í þessum þætti ræðum við um hvernig trúin getur sigrað á erfiðustu aðstæðum. Dr. Charles Stanley deilir kenningu sinni um hvernig við getum treyst Guði jafnvel þegar allt virðist vonlaust og vegurinn er óljós.', duration: 28, thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1400&h=800&fit=crop' },
    'm2': { title: 'Kraftur bænarinnar', show: 'Bænakvöld', episode: 'Þáttur 8', desc: 'Bænin er öflugasta vopnið okkar. Lærðu hvernig á að beita henni með trú og þolinmæði. Saman könnum við dýpt bænarinnar og hvernig hún breytir öllu.', duration: 25, thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1400&h=800&fit=crop' },
    'm3': { title: 'Framtíð Miðlunar', show: 'Sunnudagssamkoma', episode: '31. mars 2026', desc: 'Sunnudagssamkoma þar sem við ræðum framtíð kristinnar miðlunar á Íslandi og hlutverk Omega Stöðinnar í nýrri tíð.', duration: 65, thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1400&h=800&fit=crop' },
    'm4': { title: 'Náð sem læknar', show: 'Í Snertingu', episode: 'Þáttur 11', desc: 'Guðs náð er nóg. Í þessum þætti skoðum við hvernig náðin læknar sár fortíðar og opnar dyr að framtíðinni.', duration: 30, thumbnail: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1400&h=800&fit=crop' },
    'm5': { title: 'Vonin lifir', show: 'Fræðsla', episode: 'Þáttur 3', desc: 'Þegar allt virðist vonlaust er Guð enn að verki. Saga um von sem breytir öllu.', duration: 27, thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1400&h=800&fit=crop' },
};

const MOCK_RELATED: Record<string, { id: string; title: string; desc: string; thumbnail: string; duration: number; episode: string }[]> = {
    'Í Snertingu': [
        { id: 'm6', title: 'Trúin sem sigrar', desc: 'Hvernig trúin getur sigrað á erfiðustu aðstæðum.', thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=340&fit=crop', duration: 28, episode: 'Þáttur 12' },
        { id: 'm7', title: 'Kraftur fyrirgefningarinnar', desc: 'Fyrirgefning er lykillinn að frelsi.', thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=340&fit=crop', duration: 30, episode: 'Þáttur 10' },
        { id: 'm8', title: 'Guðs áætlun', desc: 'Guð hefur áætlun fyrir líf þitt — jafnvel á erfiðum tímum.', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=340&fit=crop', duration: 32, episode: 'Þáttur 9' },
        { id: 'm9', title: 'Friður í storminum', desc: 'Hvernig við finnum frið í miðjum stormi lífsins.', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=340&fit=crop', duration: 28, episode: 'Þáttur 8' },
    ],
    'Sunnudagssamkoma': [
        { id: 'm13', title: 'Gleði Drottins', desc: 'Gleðin í Drottni er styrkur okkar.', thumbnail: 'https://images.unsplash.com/photo-1476610182048-b716b8515aaa?w=600&h=340&fit=crop', duration: 58, episode: '24. mars' },
        { id: 'm14', title: 'Kærleikur án skilyrða', desc: 'Guðs kærleikur er án skilyrða og takmarkana.', thumbnail: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600&h=340&fit=crop', duration: 62, episode: '17. mars' },
        { id: 'm15', title: 'Breyting innan frá', desc: 'Sannur árangur byrjar innra með okkur.', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=340&fit=crop', duration: 55, episode: '10. mars' },
    ],
    'Bænakvöld': [
        { id: 'm20', title: 'Bæn fyrir Íslandi', desc: 'Saman biðjum við fyrir þjóðinni okkar.', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=340&fit=crop', duration: 45, episode: 'Þáttur 20' },
        { id: 'm21', title: 'Bæn fyrir fjölskyldunni', desc: 'Fjölskyldan er grundvöllur samfélagsins.', thumbnail: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=600&h=340&fit=crop', duration: 40, episode: 'Þáttur 19' },
        { id: 'm22', title: 'Bæn fyrir kirkjunni', desc: 'Kirkjan á Íslandi þarfnast vakningu.', thumbnail: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=340&fit=crop', duration: 38, episode: 'Þáttur 18' },
    ],
    'Fræðsla': [
        { id: 'm25', title: 'Grundvallaratriði trúarinnar', desc: 'Hvað þýðir það í raun að trúa?', thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=340&fit=crop', duration: 35, episode: 'Þáttur 1' },
        { id: 'm26', title: 'Biblían á auðveldan hátt', desc: 'Einfalt inntak í heilaga ritningu.', thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop', duration: 28, episode: 'Þáttur 2' },
        { id: 'm27', title: 'Heilagur Andi', desc: 'Persóna og verk Heilags Anda.', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=340&fit=crop', duration: 33, episode: 'Þáttur 4' },
    ],
};

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const videos = await getVideos();
    const video = videos.find(v => v.guid === id);

    let title: string, show: string, episode: string, desc: string, duration: number, thumbnail: string, isReal: boolean;
    let related: { id: string; title: string; desc: string; thumbnail: string; duration: number; episode: string }[] = [];

    if (video) {
        const meta = parseVideoMetadata(video);
        title = meta.title; show = meta.show; episode = meta.dateDisplay;
        desc = `Horfðu á ${meta.title} úr þætti ${meta.show}. Uppbyggilegt efni á íslensku frá Omega Stöðinni.`;
        duration = Math.floor(video.length / 60); thumbnail = meta.thumbnail; isReal = true;
        related = videos.filter(v => v.guid !== id && parseVideoMetadata(v).show === meta.show).slice(0, 4).map(v => {
            const vm = parseVideoMetadata(v);
            return { id: v.guid, title: vm.title, desc: '', thumbnail: vm.thumbnail, duration: Math.floor(v.length / 60), episode: vm.dateDisplay };
        });
    } else if (MOCK_DATA[id]) {
        const mock = MOCK_DATA[id];
        title = mock.title; show = mock.show; episode = mock.episode; desc = mock.desc;
        duration = mock.duration; thumbnail = mock.thumbnail; isReal = false;
        related = (MOCK_RELATED[mock.show] || []).filter(r => r.id !== id);
    } else {
        return (
            <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Myndband fannst ekki</h1>
                    <Link href="/sermons" className="text-[#5b8abf] hover:underline">Til baka í þáttasafn</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#1c1c1e] text-white">
            {/* Player / Hero — Apple TV style */}
            <div className="relative bg-black">
                {/* Back button */}
                <Link href="/sermons" className="absolute top-5 left-5 z-30 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-colors">
                    <ArrowLeft size={18} className="text-white" />
                </Link>

                {/* Player or Preview */}
                <div className="w-full max-w-[1400px] mx-auto">
                    {isReal ? (
                        <div className="aspect-video w-full">
                            <FuturisticPlayer videoId={id} libraryId={process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!} title={title} />
                        </div>
                    ) : (
                        <div className="aspect-video w-full relative">
                            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-110 transition-transform">
                                    <Play size={24} fill="black" className="ml-1 text-black" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Show info overlaid at bottom of player — Apple TV style */}
                <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                    <div className="max-w-[1400px] mx-auto px-[4%] pb-8">
                        <div className="inline-block px-3 py-1 rounded-sm bg-white/10 backdrop-blur-sm text-[11px] font-medium text-white/80 mb-3 tracking-wide">
                            Nýr þáttur
                        </div>
                        <h1 className="text-[32px] md:text-[42px] font-bold tracking-tight leading-none mb-2 uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                            {show}
                        </h1>
                        <p className="text-white/50 text-[13px] mb-3">
                            Þáttaröð · Kristin fræðsla
                        </p>
                        <p className="text-white/60 text-[14px] leading-relaxed max-w-lg mb-4">
                            {desc}
                        </p>
                        <p className="text-white/40 text-[12px]">
                            2026 · {duration} mín
                        </p>
                        <div className="flex gap-3 mt-5 pointer-events-auto">
                            <button className="flex items-center gap-2 bg-white text-black px-7 py-3 rounded-lg font-bold text-[14px] hover:bg-white/90 transition-colors">
                                <Play size={18} fill="currentColor" />
                                Spila þátt
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xl hover:bg-white/20 transition-colors">
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Season / Episodes — Apple TV style cards */}
            {related.length > 0 && (
                <div className="px-[4%] py-10 max-w-[1400px] mx-auto">
                    <h2 className="text-[19px] font-bold text-[#e5e5e5] mb-5 flex items-center gap-1" style={{ fontFamily: 'var(--font-sans)' }}>
                        {show}
                        <ChevronRight size={18} className="text-white/30" />
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {related.map((r) => (
                            <Link key={r.id} href={`/sermons/${r.id}`} className="group">
                                <div className="relative overflow-hidden rounded-xl bg-[#2c2c2e] group-hover:scale-[1.02] transition-transform duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                                    {/* Thumbnail */}
                                    <div className="aspect-video overflow-hidden">
                                        <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover" />
                                    </div>
                                    {/* Info below thumbnail — inside the card */}
                                    <div className="p-3.5">
                                        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1">{r.episode}</p>
                                        <p className="text-white text-[14px] font-semibold leading-snug mb-1.5">{r.title}</p>
                                        {r.desc && <p className="text-white/40 text-[12px] leading-relaxed line-clamp-2 mb-2">{r.desc}</p>}
                                        <p className="text-white/25 text-[11px] flex items-center gap-1">
                                            <Play size={9} fill="currentColor" /> {r.duration} mín
                                        </p>
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
