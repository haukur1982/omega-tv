import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function DevotionalInvitation() {
    return (
        <section aria-labelledby="devotional-invitation" className="border-y border-white/10 bg-[var(--mold)] px-6 py-10 text-[var(--ljos)] sm:px-10">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--nordurljos)]">Hugleiðingar á íslensku</p>
                    <h2 id="devotional-invitation" className="text-3xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>Stund í orði Guðs, í dagsins önn.</h2>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--moskva)]">Opnar öllum. Skráðu þig á póstlistann og við látum þig vita þegar daglegar sendingar hefjast.</p>
                </div>
                <Link href="/hugleidingar" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-lg bg-[#416b97] px-6 py-3 font-semibold text-white hover:bg-[#31577f]">
                    Hugleiðingar og skráning <ArrowRight size={18} aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}
