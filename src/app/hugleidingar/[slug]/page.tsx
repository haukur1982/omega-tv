import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DevotionalSignup from '@/components/hugleidingar/DevotionalSignup';
import DevotionalReader from '@/components/hugleidingar/DevotionalReader';
import { DEVOTIONAL_ATTRIBUTION, getPublishedDevotional } from '@/lib/devotional-db';

export const dynamic = 'force-dynamic';
const getPiece = cache(getPublishedDevotional);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const piece = await getPiece(slug);
    if (!piece) return { title: 'Hugleiðing fannst ekki', robots: { index: false } };
    return {
        title: piece.title_is,
        description: piece.body_is.find(p => p.trim())?.slice(0, 160),
        alternates: { canonical: `/hugleidingar/${piece.slug}` },
    };
}

export default async function DevotionalPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const piece = await getPiece(slug);
    if (!piece) notFound();
    return (
        <main className="min-h-screen bg-[#eeeae3] pt-24 text-[#302b25] sm:pt-28">
            <Navbar tone="light" />
            <div className="mx-auto max-w-[760px] px-6 pb-4 sm:px-0">
                <Link href="/hugleidingar#lesa" className="inline-flex min-h-11 items-center text-sm text-[#31577f] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#416b97]">← Allar hugleiðingar</Link>
            </div>
            <article aria-labelledby="devotional-title" className="mx-auto max-w-[760px] border-t-[3px] border-[#416b97] bg-[#fffdf8] px-6 py-10 sm:px-16 sm:py-14">
                <header className="mb-8">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#416b97]">Dagur {piece.day} · {piece.slot === 'morning' ? 'Morgunn' : 'Kvöld'}</p>
                    <h1 id="devotional-title" className="text-[2.5rem] font-normal leading-[1.15] tracking-[-0.025em] sm:text-[3.25rem]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>{piece.title_is}</h1>
                    <p className="mt-6 text-base leading-relaxed text-[#665e54]">Wade E. Taylor · Íslensk þýðing</p>
                </header>
                <DevotionalReader paragraphs={piece.body_is} title={piece.title_is} slug={piece.slug} />
                <footer className="mt-10 space-y-4 border-t border-[#e3ddd3] pt-8 text-sm leading-[1.8] text-[#665e54]">
                    <p>{DEVOTIONAL_ATTRIBUTION.author}</p>
                    <p>{DEVOTIONAL_ATTRIBUTION.scripture}</p>
                    <p>{DEVOTIONAL_ATTRIBUTION.sources}</p>
                    <Link href={DEVOTIONAL_ATTRIBUTION.moreHref} className="inline-flex min-h-11 items-center text-[#31577f] underline underline-offset-4">{DEVOTIONAL_ATTRIBUTION.moreLabel}</Link>
                </footer>
            </article>
            <div className="mx-auto max-w-[760px] px-6 py-12 sm:px-0"><DevotionalSignup /></div>
            <div className="bg-[var(--mold)] text-[var(--ljos)]"><Footer /></div>
        </main>
    );
}
