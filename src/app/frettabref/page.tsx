import { getNewsletters } from '@/lib/newsletter-db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from "@/components/layout/Navbar";
import EmailSignupForm from '@/components/forms/EmailSignupForm';

export default async function NewsletterPage() {
    const newsletters = await getNewsletters();
    const latest = newsletters[0];

    return (
        <main className="min-h-screen bg-[var(--bg-deep)]">
            <Navbar />

            <div className="max-w-4xl mx-auto pt-40 pb-20 px-6">

                {/* Hero */}
                <div className="mb-20 text-center">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-8">
                        Fréttabréf
                    </p>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[0.9] tracking-tight">
                        Bréf frá Eiríki.
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        Hugleiðingar, fréttir og hvatning frá stofnanda Omega.
                    </p>
                </div>

                {/* Email Signup */}
                <div className="max-w-xl mx-auto mb-24 text-center">
                    <h3 className="text-xl font-bold mb-2">Vertu með í hópnum</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-6">Skráðu þig á póstlistann og fáðu vikulega uppörvun og fréttir af starfinu.</p>
                    <EmailSignupForm
                        segment="newsletter"
                        layout="stacked"
                        placeholder="Netfangið þitt"
                        successMessage="Takk! Við munum hafa samband."
                    />
                </div>

                {latest ? (
                    <article className="bg-[#fcfbf9] text-gray-900 p-8 md:p-16 relative overflow-hidden">
                        <header className="mb-10 text-center border-b border-gray-200 pb-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {latest.title}
                            </h2>
                            <time className="text-gray-500 font-medium tracking-widest text-sm uppercase">
                                {new Date(latest.date).toLocaleDateString('is-IS', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                        </header>

                        <div className="max-w-none font-serif text-lg leading-loose">
                            {latest.content.split('\n').map((paragraph: string, i: number) => (
                                paragraph.trim() && <p key={i} className="mb-6">{paragraph}</p>
                            ))}
                        </div>

                        <footer className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-lg">{latest.author}</p>
                                <p className="text-sm text-gray-500 uppercase tracking-wider">Omega Stöðin</p>
                            </div>
                        </footer>
                    </article>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-[var(--text-secondary)]">Engin bréf fundust að svo stöddu.</p>
                        <p className="text-[var(--text-muted)] text-sm mt-2">Skráðu þig á póstlistann til að fá fyrsta bréfið.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
