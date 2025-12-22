import Navbar from "@/components/layout/Navbar";
import FuturisticPlayer from "@/components/player/FuturisticPlayer";

export default function LivePage() {
    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white overflow-hidden">
            <Navbar />

            {/* Background Ambient Glow for the entire page */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-[var(--primary-glow)] opacity-[0.08] blur-[150px]" />
            </div>

            <div className="relative z-10 pt-28 pb-10 container mx-auto px-4 md:px-8 h-screen flex flex-col">

                {/* Header Area */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-red-400 font-bold uppercase tracking-widest text-xs">Bein Útsending</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">Sunnudags Samkoma</h1>
                    </div>
                    {/* <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                        <span className="font-mono text-[var(--accent-gold)]">1,240</span> Að Horfa
                    </div> */}
                </div>

                {/* Main Content Layout - Cinematic Single Column */}
                <div className="flex-1 flex flex-col items-center justify-center -mt-10">
                    <div className="w-full max-w-6xl aspect-video relative shadow-[0_0_100px_rgba(var(--primary-glow-rgb),0.2)] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--glass-border)] bg-black">
                        <FuturisticPlayer />
                    </div>
                </div>

            </div>
        </main>
    );
}
