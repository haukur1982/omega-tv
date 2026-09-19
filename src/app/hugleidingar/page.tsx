import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowRight, BookOpen } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DevotionalSignup from '@/components/hugleidingar/DevotionalSignup';
import { listPublishedDevotionals, reykjavikDayOfMonth } from '@/lib/devotional-db';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Hugleiðingar',
    description: 'Hugleiðingar á íslensku til að staldra við í orði Guðs. Opnar öllum. Skráðu þig á póstlistann og fáðu fréttir þegar daglegar sendingar hefjast.',
    alternates: { canonical: '/hugleidingar' },
};

export default async function DevotionalsPage() {
    const { pieces, unavailable } = await listPublishedDevotionals().then(pieces => ({ pieces, unavailable: false })).catch(error => {
        console.error('Devotional index unavailable:', error);
        return { pieces: [], unavailable: true };
    });
    const today = reykjavikDayOfMonth();
    return (
        <main className="min-h-screen bg-[var(--mold)] text-[var(--ljos)]">
            <Navbar />
            <div className="mx-auto max-w-6xl px-6 pb-16 pt-32 sm:px-10 lg:pb-24 lg:pt-40">
                <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
                    <header className="lg:pt-6">
                        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--nordurljos)]">Hugleiðingar · Omega</p>
                        <h1 className="max-w-xl text-5xl leading-[1.08] sm:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>Stöldrum við<br />í orði Guðs.</h1>
                        <p className="mt-7 max-w-lg text-xl leading-relaxed text-[var(--moskva)]" style={{ fontFamily: 'var(--font-serif)' }}>
                            Hugleiðingar á íslensku sem hvetja okkur til að leita Guðs og ganga með honum í daglegu lífi.
                        </p>
                        <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--moskva)]">
                            Hér má lesa án skráningar. Ef þú vilt fá hugleiðingarnar sendar til þín geturðu skráð þig á póstlistann.
                        </p>
                        <Link href="#lesa" className="mt-6 inline-flex min-h-12 items-center gap-3 text-base text-[var(--nordurljos)] underline underline-offset-8">
                            {pieces.length ? 'Lesa hugleiðingar' : 'Um hugleiðingarnar'} <ArrowDown size={18} aria-hidden="true" />
                        </Link>
                    </header>
                    <DevotionalSignup />
                </div>
            </div>
            <section id="lesa" className="scroll-mt-20 bg-[var(--skra)] px-6 py-16 text-[var(--skra-djup)] sm:px-10 lg:py-24">
                <div className="mx-auto max-w-6xl">
                    <BookOpen className="mb-5 text-[#416b97]" size={30} aria-hidden="true" />
                    <h2 className="text-4xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>Orð til að taka með sér</h2>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--skra-mjuk)]">
                        Við byrjum á hugleiðingum eftir Wade E. Taylor, í íslenskri þýðingu. Þær birtast hér smám saman að loknum yfirlestri. Allar birtar hugleiðingar eru opnar öllum.
                    </p>
                    {unavailable ? (
                        <p role="status" className="mt-8 rounded-xl border border-[#1b1814]/20 p-6">Ekki tókst að sækja hugleiðingarnar. Reyndu að endurhlaða síðuna. Þú getur samt skráð þig á póstlistann hér fyrir ofan.</p>
                    ) : pieces.length === 0 ? (
                        <div className="mt-8 max-w-2xl border-l-2 border-[#416b97] pl-6">
                            <h3 className="text-xl font-semibold">Fyrstu hugleiðingarnar eru í undirbúningi</h3>
                            <p className="mt-2 text-lg leading-relaxed text-[var(--skra-mjuk)]">Þú getur skráð þig strax. Við látum þig vita þegar sendingar hefjast.</p>
                        </div>
                    ) : (
                        <div className="mt-10 grid gap-5 md:grid-cols-2">
                            {pieces.map(piece => (
                                <Link key={piece.id} href={`/hugleidingar/${piece.slug}`} className="group rounded-xl border border-[#1b1814]/15 bg-white/40 p-6 transition-colors hover:bg-white/80 sm:p-8">
                                    <p className="text-sm font-medium text-[#416b97]">{piece.day === today ? 'Í dag · ' : ''}Dagur {piece.day} · {piece.slot === 'morning' ? 'Morgunn' : 'Kvöld'}</p>
                                    <h3 className="mt-3 text-2xl leading-snug" style={{ fontFamily: 'var(--font-display)' }}>{piece.title_is}</h3>
                                    <p className="mt-4 line-clamp-3 text-lg leading-relaxed text-[var(--skra-mjuk)]" style={{ fontFamily: 'var(--font-serif)' }}>{piece.body_is.find(p => p.trim())}</p>
                                    <span className="mt-5 inline-flex min-h-11 items-center gap-2 font-medium text-[#31577f]">Lesa hugleiðingu <ArrowRight size={18} aria-hidden="true" /></span>
                                </Link>
                            ))}
                        </div>
                    )}
                    <Link href="/hugleidingar/thydingin" className="mt-8 inline-flex min-h-11 items-center text-[#31577f] underline underline-offset-4">Um þýðinguna og ritningarstaðina</Link>
                </div>
            </section>
            <Footer />
        </main>
    );
}
