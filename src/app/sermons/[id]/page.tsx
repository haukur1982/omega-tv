import FuturisticPlayer from "@/components/player/FuturisticPlayer";
import { ArrowLeft, Clock, Play } from "lucide-react";
import Link from "next/link";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";

export const revalidate = 60;

export async function generateStaticParams() {
    const videos = await getVideos();
    return videos.map((video) => ({ id: video.guid }));
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const videos = await getVideos();
    const video = videos.find(v => v.guid === id);

    if (!video) {
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

    const meta = parseVideoMetadata(video);
    const relatedVideos = videos
        .filter(v => v.guid !== id && parseVideoMetadata(v).show === meta.show)
        .slice(0, 6);

    return (
        <main className="min-h-screen bg-[#f8f7f4]">
            {/* Dark player section */}
            <div className="bg-black">
                {/* Minimal back button */}
                <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-3">
                    <Link href="/sermons" className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm">
                        <ArrowLeft size={16} />
                        <span>Þáttasafn</span>
                    </Link>
                </div>

                {/* Player */}
                <div className="max-w-[1200px] mx-auto px-6 pb-8">
                    <div className="aspect-video w-full bg-black overflow-hidden">
                        <FuturisticPlayer
                            videoId={id}
                            libraryId={process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!}
                            title={meta.title}
                        />
                    </div>
                </div>
            </div>

            {/* Content section — warm light background like Apple TV+ */}
            <div className="max-w-[1200px] mx-auto px-6 py-10">
                {/* Episode info */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-[#5b8abf] text-[11px] font-semibold uppercase tracking-[0.15em]">
                            {meta.show}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                            {meta.dateDisplay}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3" style={{ fontFamily: 'var(--font-sans)' }}>
                        {meta.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {Math.floor(video.length / 60)} mín
                        </span>
                    </div>
                    <p className="text-gray-500 leading-relaxed max-w-2xl">
                        Horfðu á {meta.title} úr þætti {meta.show}. Uppbyggilegt efni á íslensku frá Omega Stöðinni.
                    </p>
                </div>

                {/* Related — Season/Show episodes */}
                {relatedVideos.length > 0 && (
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-sans)' }}>
                            Fleira úr {meta.show}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {relatedVideos.map((v) => {
                                const vMeta = parseVideoMetadata(v);
                                return (
                                    <Link key={v.guid} href={`/sermons/${v.guid}`} className="group">
                                        <div className="relative aspect-video overflow-hidden rounded-2xl mb-2.5 bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-all duration-300">
                                            <img
                                                src={vMeta.thumbnail}
                                                alt={vMeta.title}
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-white/95 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                                                    <Play size={14} fill="black" className="ml-0.5 text-black" />
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-sans)' }}>
                                            {vMeta.title}
                                        </h3>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            {Math.floor(v.length / 60)} mín · {vMeta.dateDisplay}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Back to library */}
                <div className="mt-16 pt-8 border-t border-black/[0.06]">
                    <Link href="/sermons" className="text-[#5b8abf] text-sm font-medium hover:underline">
                        ← Til baka í þáttasafn
                    </Link>
                </div>
            </div>
        </main>
    );
}
