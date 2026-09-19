import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DevotionalSignup from '@/components/hugleidingar/DevotionalSignup';
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
        <main className="min-h-screen bg-[var(--mold)] pt-24 text-[var(--ljos)]">
            <Navbar />
            <article className="mx-auto max-w-3xl bg-[var(--skra)] px-6 py-12 text-[var(--skra-djup)] sm:px-14 sm:py-16">
                <Link href="/hugleidingar#lesa" className="inline-flex min-h-11 items-center text-[#31577f] underline underline-offset-4">← Allar hugleiðingar</Link>
                <header className="mb-10 mt-8 border-b border-[#1b1814]/15 pb-8">
                    <p className="mb-4 text-sm font-medium text-[#416b97]">Dagur {piece.day} · {piece.slot === 'morning' ? 'Morgunn' : 'Kvöld'}</p>
                    <h1 className="text-4xl leading-tight sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>{piece.title_is}</h1>
                    <p className="mt-5 text-base text-[var(--skra-mjuk)]">Wade E. Taylor · Íslensk þýðing</p>
                </header>
                <div className="space-y-6 text-xl leading-[1.8]" style={{ fontFamily: 'var(--font-serif)', overflowWrap: 'anywhere' }}>
                    {piece.body_is.map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}
                </div>
                <footer className="mt-12 space-y-4 border-t border-[#1b1814]/15 pt-8 text-sm leading-relaxed text-[var(--skra-mjuk)]">
                    <p>{DEVOTIONAL_ATTRIBUTION.author}</p>
                    <p>{DEVOTIONAL_ATTRIBUTION.scripture}</p>
                    <p>{DEVOTIONAL_ATTRIBUTION.sources}</p>
                    <Link href={DEVOTIONAL_ATTRIBUTION.moreHref} className="inline-flex min-h-11 items-center text-[#31577f] underline underline-offset-4">{DEVOTIONAL_ATTRIBUTION.moreLabel}</Link>
                </footer>
            </article>
            <div className="mx-auto max-w-3xl px-6 py-12 sm:px-0"><DevotionalSignup /></div>
            <Footer />
        </main>
    );
}
