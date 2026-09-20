'use client';

import { useState } from 'react';
import { Check, Copy, Minus, Plus, Share2 } from 'lucide-react';
import { devotionalReadingMinutes, splitScriptureParagraph } from '@/lib/devotional-presentation';

export default function DevotionalReader({ paragraphs, title, slug }: { paragraphs: string[]; title: string; slug: string }) {
    const [size, setSize] = useState(22);
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);
    async function share() {
        const url = `https://omega.is/hugleidingar/${encodeURIComponent(slug)}`;
        try {
            if (navigator.share) {
                await navigator.share({ title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setMessage('Slóð afrituð. Þú getur sent hana áfram.');
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            setMessage('Ekki tókst að deila. Þú getur afritað slóð síðunnar úr vafranum.');
        }
    }
    const button = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#1b1814]/20 px-3 text-[#31577f] hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#416b97] disabled:opacity-35';
    return <>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-y border-[#e3ddd3] py-4 sm:mb-12" aria-label="Lestrarstillingar">
            <span className="text-sm text-[#665e54]">{devotionalReadingMinutes(paragraphs)} mínútna lestur</span>
            <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Leturstærð" className="flex items-center gap-2">
                    <button type="button" className={button} disabled={size <= 18} aria-label="Minnka letur" aria-controls="devotional-text" onClick={() => setSize(s => Math.max(18, s - 2))}><Minus size={16} /></button>
                    <span className="min-w-6 text-center text-lg" aria-hidden="true">Aa</span>
                    <span className="sr-only" role="status">Leturstærð: {size}</span>
                    <button type="button" className={button} disabled={size >= 28} aria-label="Stækka letur" aria-controls="devotional-text" onClick={() => setSize(s => Math.min(28, s + 2))}><Plus size={16} /></button>
                </div>
                <button type="button" className={`${button} gap-2`} onClick={share}>{copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? 'Afritað' : 'Deila'}</button>
            </div>
        </div>
        <p role="status" className={message ? 'mb-6 text-sm text-[#31577f]' : 'sr-only'}>{message}</p>
        <div id="devotional-text" className="space-y-[1.4em] leading-[1.85] text-[#302b25]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: size, overflowWrap: 'break-word' }}>
            {paragraphs.map((paragraph, index) => {
                const scripture = splitScriptureParagraph(paragraph);
                return scripture ? <blockquote key={index} className="border-l-2 border-[#416b97] py-1 pl-5 text-[#31577f] sm:pl-7">
                    <p data-reading-paragraph className="whitespace-pre-line">{scripture.quote}<span className="mt-3 block font-sans text-[0.7em] font-medium leading-relaxed">{scripture.separator}{scripture.reference}</span></p>
                </blockquote> : <p key={index} data-reading-paragraph className="whitespace-pre-line">{paragraph}</p>;
            })}
        </div>
        <aside aria-label="Stöldrum við" className="mt-12 bg-[#f0ece3] p-6 sm:mt-14 sm:p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#416b97]">Stöldrum við</p>
            <p className="text-xl leading-[1.8]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Gefðu þér stund með Drottni. Taktu það sem snerti þig í lestrinum með þér í bæn og inn í daginn.</p>
        </aside>
        <div className="mt-7">
            <p className="text-sm leading-relaxed text-[#665e54]">Hugleiðingin er opin öllum. Þú mátt deila henni með öðrum.</p>
            <button type="button" onClick={share} className="mt-2 inline-flex min-h-11 items-center gap-2 text-[#31577f] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#416b97]"><Copy size={16} />Deila þessari hugleiðingu</button>
        </div>
    </>;
}
