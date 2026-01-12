import FuturisticPlayer from "@/components/player/FuturisticPlayer";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";

// Revalidate every minute
export const revalidate = 60;

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
    const videos = await getVideos();
    return videos.map((video) => ({
        id: video.guid,
    }));
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // We fetch all videos to find the metadata for this specific one
    // In a larger app, we would fetch just this video by ID, but Bunny's API is simple
    const videos = await getVideos();
    const video = videos.find(v => v.guid === id);

    if (!video) {
        return (
            <div className="min-h-screen bg-[var(--bg-deep)] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Myndband fannst ekki</h1>
                    <Link href="/sermons" className="text-[var(--accent-gold)] hover:underline">
                        Til baka í Brunninn
                    </Link>
                </div>
            </div>
        );
    }

    const meta = parseVideoMetadata(video);

    const relatedVideos = videos
        .filter(v => v.guid !== id && parseVideoMetadata(v).show === meta.show)
        .slice(0, 4); // Show max 4 related videos

    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col container mx-auto px-6 pt-24 pb-12">
                {/* Back Button */}
                <Link href="/sermons" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors mb-6 w-fit">
                    <ArrowLeft size={20} />
                    <span>Til baka</span>
                </Link>

                {/* Player Container */}
                <div className="aspect-video w-full bg-black rounded-[var(--radius-lg)] overflow-hidden shadow-2xl mb-8 border border-[var(--glass-border)]">
                    <FuturisticPlayer
                        videoId={id}
                        libraryId={process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!}
                        title={meta.title}
                    />
                </div>

                <div className="grid lg:grid-cols-[1fr_350px] gap-12">
                    {/* Main Content */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{meta.title}</h1>
                        <div className="flex items-center gap-4 text-[var(--text-secondary)] mb-6">
                            <span className="font-medium text-[var(--accent-gold)]">{meta.show}</span>
                            <span>•</span>
                            <span>{meta.dateDisplay}</span>
                            <span>•</span>
                            <span>{Math.floor(video.length / 60)} mín</span>
                        </div>

                        <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                            {/* If we had descriptions from Bunny, they would go here. */}
                            Horfðu á {meta.title} úr þættinum {meta.show}.
                        </p>

                        {/* Action Buttons Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                            <Link href="/baenatorg" className="flex items-center justify-between p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-900/40 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <Sparkles size={18} className="text-blue-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-100 group-hover:text-white">Senda Bæn</h3>
                                        <p className="text-xs text-blue-200/60">Við biðjum fyrir þér</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/give" className="flex items-center justify-between p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-900/40 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                        <Heart size={18} className="text-amber-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-amber-100 group-hover:text-white">Styrkja</h3>
                                        <p className="text-xs text-amber-200/60">Gerast bakhjarl</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar / Up Next */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="w-1 h-5 bg-[var(--accent-gold)] rounded-full" />
                            Fleira úr þáttaröðinni
                        </h3>

                        <div className="space-y-4">
                            {relatedVideos.length > 0 ? (
                                relatedVideos.map((v) => {
                                    const vMeta = parseVideoMetadata(v);
                                    return (
                                        <Link key={v.guid} href={`/sermons/${v.guid}`} className="flex gap-4 group p-2 rounded-lg hover:bg-[var(--white-5)] transition-colors">
                                            <div className="relative w-32 aspect-video rounded-md overflow-hidden shrink-0 border border-[var(--white-10)]">
                                                <Image
                                                    src={vMeta.thumbnail}
                                                    alt={vMeta.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-200 group-hover:text-[var(--accent-gold)] line-clamp-2 leading-tight mb-1">
                                                    {vMeta.title}
                                                </h4>
                                                <p className="text-xs text-[var(--text-muted)]">
                                                    {Math.floor(v.length / 60)} mín • {vMeta.dateDisplay}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-[var(--text-muted)] italic">Engin önnur myndbönd fundust.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
