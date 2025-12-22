import { getNewsletters } from '@/lib/newsletter-db';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default async function NewsletterPage() {
    const newsletters = await getNewsletters();
    const latest = newsletters[0];

    return (
        <main className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-[var(--accent-gold)] hover:underline mb-8">
                    <ArrowLeft size={16} />
                    <span>Til baka</span>
                </Link>

                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] rounded-full mb-6">
                        <BookOpen size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Bréf frá Gunnari</h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                        Hugleiðingar, fréttir og hvatning frá stofnanda Omega.
                    </p>
                </div>

                {latest ? (
                    <article className="bg-[#fcfbf9] text-gray-900 rounded-[var(--radius-lg)] p-8 md:p-16 shadow-2xl relative overflow-hidden">
                        {/* Paper Texture Effect overlay if needed, using simple color for now */}

                        <div className="relative z-10">
                            <header className="mb-10 text-center border-b border-gray-200 pb-10">
                                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight">
                                    {latest.title}
                                </h2>
                                <time className="text-gray-500 font-medium tracking-widest text-sm uppercase">
                                    {new Date(latest.date).toLocaleDateString('is-IS', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </time>
                            </header>

                            <div className="prose prose-lg prose-gray max-w-none font-serif leading-loose">
                                {latest.content.split('\n').map((paragraph, i) => (
                                    paragraph.trim() && <p key={i} className="mb-6">{paragraph}</p>
                                ))}
                            </div>

                            <footer className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
                                <div>
                                    <p className="font-bold font-serif text-lg">{latest.author}</p>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider">Stofnandi Omega</p>
                                </div>
                                {/* Signature effect could go here */}
                                <div className="text-4xl opacity-20 font-serif italic font-black">
                                    GÞ
                                </div>
                            </footer>
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-20 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--glass-border)]">
                        <p className="text-[var(--text-muted)]">Engin bréf fundust að svo stöddu.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
