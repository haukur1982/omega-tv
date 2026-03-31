import Navbar from "@/components/layout/Navbar";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import { Play, Clock, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export default async function SermonsPage() {
    const videos = await getVideos(1, 100);

    const latestVideo = videos[0];
    const heroMeta = latestVideo ? parseVideoMetadata(latestVideo) : null;

    // Group by show
    const grouped: Record<string, any[]> = {};
    videos.forEach(video => {
        const meta = parseVideoMetadata(video);
        if (!grouped[meta.show]) grouped[meta.show] = [];
        grouped[meta.show].push({ ...video, meta });
    });

    const categories = [
        { title: "Nýtt Efni", series: videos.slice(0, 10).map(v => ({ ...v, meta: parseVideoMetadata(v) })) },
        ...Object.keys(grouped).map(key => ({ title: key, series: grouped[key] }))
    ];

    return (
        <main className="min-h-screen bg-[#faf9f7]">
            {/* Light page uses a dark navbar variant */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-xl border-b border-black/5">
                <Link href="/" className="flex items-center gap-3">
                    <span className="text-[#5b8abf] font-bold text-2xl">Ω</span>
                    <span className="text-gray-900 font-semibold tracking-[0.15em] text-sm uppercase">Omega</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    {[
                        { href: '/live', label: 'Beint' },
                        { href: '/sermons', label: 'Þáttasafn' },
                        { href: '/baenatorg', label: 'Bænatorg' },
                        { href: '/frettabref', label: 'Fréttir' },
                        { href: '/about', label: 'Um okkur' },
                        { href: '/give', label: 'Styrkja' },
                    ].map(link => (
                        <Link key={link.href} href={link.href} className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500 hover:text-gray-900 transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>
                <Link href="/live" className="flex items-center gap-2 bg-[#5b8abf] text-white px-5 py-2 font-semibold text-xs uppercase tracking-[0.1em] hover:brightness-110 transition-all">
                    <Play size={14} fill="currentColor" />
                    Horfa
                </Link>
            </nav>

            {/* Hero — Featured content (if available) */}
            {latestVideo && heroMeta ? (
                <div className="relative h-[75vh] w-full flex items-end pt-16">
                    <div className="absolute inset-0">
                        <Image
                            src={heroMeta.thumbnail}
                            alt={heroMeta.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f7] via-black/30 to-black/10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-[#5b8abf] text-white font-bold px-3 py-1 text-xs uppercase tracking-wider">
                                    Nýtt
                                </span>
                                <span className="text-white/80 text-sm font-medium">{heroMeta.show}</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white tracking-tight leading-tight drop-shadow-lg">
                                {heroMeta.title}
                            </h1>
                            <div className="flex gap-4 mt-6">
                                <Link href={`/sermons/${latestVideo.guid}`} className="flex items-center gap-2 bg-white text-black px-8 py-3 font-bold text-sm hover:bg-gray-100 transition-colors">
                                    <Play size={18} fill="currentColor" />
                                    Spila
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty state */
                <div className="pt-32 pb-20 text-center max-w-3xl mx-auto px-6">
                    <p className="text-[#5b8abf] text-xs font-semibold uppercase tracking-[0.2em] mb-8">Þáttasafn</p>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[0.9] tracking-tight text-gray-900">
                        Efni í vinnslu.
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed">
                        Við erum að undirbúa þáttasafnið. Fljótlega verður hægt að horfa á þætti,
                        fræðsluefni og guðsþjónustur beint hér.
                    </p>
                </div>
            )}

            {/* Content Rows */}
            {videos.length > 0 && (
                <div className="relative z-20 py-12 max-w-7xl mx-auto px-6 space-y-16">
                    {categories.map((cat) => (
                        <section key={cat.title}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">{cat.title}</h2>
                                <button className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
                                    Sjá allt <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {cat.series.slice(0, 5).map((show: any) => (
                                    <Link
                                        href={`/sermons/${show.guid}`}
                                        key={show.guid}
                                        className="group"
                                    >
                                        <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 mb-3">
                                            <Image
                                                src={show.meta.thumbnail}
                                                alt={show.meta.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Play overlay on hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <Play size={20} fill="black" className="ml-0.5 text-black" />
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-[#5b8abf] transition-colors line-clamp-2">
                                            {show.meta.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                            <span>{show.meta.show}</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {Math.floor(show.length / 60)} mín
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
}
