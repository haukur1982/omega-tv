import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import DevotionalSignup from '@/components/hugleidingar/DevotionalSignup';
import type { Devotional } from '@/lib/devotional-db';
import { devotionalReadingMinutes, splitScriptureParagraph } from '@/lib/devotional-presentation';

interface Props {
    piece: Devotional | null;
    unavailable?: boolean;
}

export default function HomeDevotional({ piece, unavailable = false }: Props) {
    const opening = piece?.body_is.find(paragraph => paragraph.trim()) ?? '';
    const scripture = splitScriptureParagraph(opening);

    return (
        <section id="hugleidingar" aria-labelledby="home-reading-heading" className="scroll-mt-24 bg-[#eeeae3] text-[#24211d]">
            <div className="mx-auto max-w-[80rem] px-[var(--rail-padding)] py-14 sm:py-20">
                <header className="mb-9 sm:mb-11">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#416b97]">Hugleiðingar á íslensku</p>
                    <h2 id="home-reading-heading" className="text-4xl leading-tight sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>Stund í orði Guðs.</h2>
                    <p className="mt-4 text-lg leading-relaxed text-[#59534b]">Rými til að staldra við, leita Guðs og hlusta. Opið öllum.</p>
                </header>

                <div className="grid items-start gap-7 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
                    <article className="min-w-0 rounded-2xl border border-[#24211d]/10 bg-[#fffdf8] p-7 shadow-[0_12px_40px_-28px_rgba(36,33,29,0.3)] sm:p-10">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#59534b]">
                            <BookOpen size={20} className="text-[#416b97]" aria-hidden="true" />
                            <span>Wade E. Taylor</span>
                            {piece && <span>· {devotionalReadingMinutes(piece.body_is)} mín lestur</span>}
                        </div>
                        <h3 className="mt-7 text-4xl leading-[1.15] sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                            {piece ? <Link href={`/hugleidingar/${piece.slug}`} className="hover:text-[#31577f]">{piece.title_is}</Link> : 'Hugleiðingar til að taka með sér'}
                        </h3>
                        {piece ? (
                            <>
                                {scripture ? (
                                    <blockquote className="mt-8 border-l-2 border-[#416b97]/50 pl-5 sm:pl-6">
                                        <p className="text-xl leading-[1.7] sm:text-[22px]" style={{ fontFamily: 'Georgia, serif' }}>{scripture.quote}</p>
                                        <footer className="mt-4 text-sm font-medium text-[#416b97]">{scripture.reference}</footer>
                                    </blockquote>
                                ) : <p className="mt-7 text-xl leading-[1.7]" style={{ fontFamily: 'Georgia, serif' }}>{opening}</p>}
                                <Link href={`/hugleidingar/${piece.slug}`} className="mt-8 inline-flex min-h-12 items-center gap-3 font-semibold text-[#31577f] underline decoration-[#416b97]/40 underline-offset-8 hover:decoration-current">
                                    Lesa hugleiðinguna <ArrowRight size={19} aria-hidden="true" />
                                </Link>
                                <p className="mt-4 text-sm text-[#59534b]">Þú þarft ekki að skrá þig til að lesa.</p>
                            </>
                        ) : (
                            <>
                                <p className="mt-7 text-lg leading-relaxed text-[#59534b]">
                                    {unavailable ? 'Ekki tókst að sækja hugleiðinguna. Þú getur reynt aftur á hugleiðingasíðunni.' : 'Hugleiðingar eftir Wade E. Taylor birtast hér í íslenskri þýðingu, að loknum yfirlestri.'}
                                </p>
                                <Link href="/hugleidingar#lesa" className="mt-6 inline-flex min-h-12 items-center gap-3 text-[#31577f] underline underline-offset-4">Skoða hugleiðingar <ArrowRight size={18} aria-hidden="true" /></Link>
                            </>
                        )}
                    </article>
                    <DevotionalSignup />
                </div>
            </div>
        </section>
    );
}
