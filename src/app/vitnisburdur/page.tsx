import Navbar from '@/components/layout/Navbar';
import TestimonialForm from '@/components/forms/TestimonialForm';
import { Quote, User, Calendar } from 'lucide-react';
import { getTestimonials } from '@/lib/testimonials-db';

export const revalidate = 0; // Ensure fresh data on every request

export default async function TestimonialPage() {
    const testimonials = await getTestimonials();

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] text-white pb-20">
            <Navbar />

            <main className="container mx-auto px-6 pt-32 max-w-4xl">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] mb-6 ring-1 ring-[var(--accent-gold)]/30">
                        <Quote size={32} />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-serif">Deildu þinni sögu</h1>
                    <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-2xl mx-auto">
                        Vitnisburður þinn getur uppörvað og styrkt trú annarra.
                        Við fögnum hverri sögu um Guðs verk í lífi fólks.
                    </p>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 mb-20">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <TestimonialForm />
                    </div>
                </div>

                {/* Approved Testimonials Section */}
                {testimonials && testimonials.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                        <h2 className="text-2xl font-bold mb-8 text-center">Nýlegir vitnisburðir</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {testimonials.map((t) => (
                                <div key={t.id} className="bg-[var(--bg-surface)] border border-[var(--glass-border)] p-6 rounded-xl hover:border-[var(--accent-gold)]/30 transition-colors">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-[var(--bg-deep)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--accent-gold)] shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--text-primary)]">{t.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                                                <Calendar size={12} />
                                                {new Date(t.created_at).toLocaleDateString('is-IS')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Quote size={16} className="absolute -top-1 -left-1 text-[var(--accent-gold)]/20 rotate-180" />
                                        <p className="text-[var(--text-secondary)] italic leading-relaxed pl-4">
                                            "{t.content}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center text-sm text-[var(--text-muted)]">
                    <p>Allir vitnisburðir eru lesnir yfir áður en þeir eru birtir á vefnum.</p>
                </div>
            </main>
        </div>
    );
}
