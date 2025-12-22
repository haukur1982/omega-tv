import FuturisticPlayer from "@/components/player/FuturisticPlayer";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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

                {/* Video Info */}
                <div className="max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{meta.title}</h1>
                    <div className="flex items-center gap-4 text-[var(--text-secondary)] mb-6">
                        <span className="font-medium text-[var(--accent-gold)]">{meta.show}</span>
                        <span>•</span>
                        <span>{meta.dateDisplay}</span>
                        <span>•</span>
                        <span>{Math.floor(video.length / 60)} mín</span>
                    </div>

                    <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                        {/* If we had descriptions from Bunny, they would go here. */}
                        Horfðu á {meta.title} úr þættinum {meta.show}.
                    </p>
                </div>
            </div>
        </main>
    );
}
