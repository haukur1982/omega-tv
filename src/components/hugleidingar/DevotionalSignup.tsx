'use client';

import { useId, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Mail } from 'lucide-react';
import { subscribeAction } from '@/actions/subscribe';
import { DEVOTIONAL_CONSENT } from '@/lib/subscription-input';

export default function DevotionalSignup() {
    const id = useId();
    const [pending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const [confirmation, setConfirmation] = useState<'sent' | 'already_sent' | 'failed'>('failed');
    const submittedForm = useRef<FormData | null>(null);

    function submit(form: FormData) {
        submittedForm.current = form;
        startTransition(async () => {
            try {
                const result = await subscribeAction(form);
                if (!result.success) {
                    setError(result.error || 'Ekki tókst að skrá netfangið. Reyndu aftur.');
                    setStatus('error');
                    return;
                }
                setConfirmation(result.confirmation ?? 'failed');
                setStatus('success');
            } catch {
                setError('Samband rofnaði. Athugaðu nettenginguna og reyndu aftur.');
                setStatus('error');
            }
        });
    }

    return (
        <section id="askrift" aria-labelledby={`${id}-heading`} className="scroll-mt-24 rounded-2xl border border-[#1b1814]/15 bg-[var(--skra)] p-6 text-[var(--skra-djup)] sm:p-9">
            <Mail size={25} className="mb-5 text-[#416b97]" aria-hidden="true" />
            <h2 id={`${id}-heading`} className="mb-3 text-3xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>Fáðu hugleiðingar í tölvupósti</h2>
            <p className="mb-6 text-base leading-relaxed text-[var(--skra-mjuk)]">
                Við erum að undirbúa daglegar sendingar. Skráðu þig núna og við látum þig vita þegar þær hefjast.
            </p>
            {status === 'success' ? (
                <div role="status" className="rounded-lg border border-[#416b97]/30 bg-white/60 p-5">
                    <Check aria-hidden="true" className="mb-3 text-[#416b97]" />
                    <p className="font-semibold">Takk fyrir skráninguna!</p>
                    <p className="mt-2 leading-relaxed">Netfangið þitt er komið á listann. Við látum þig vita þegar daglegar sendingar hefjast.</p>
                    <p className="mt-3 leading-relaxed">
                        {confirmation === 'sent' ? 'Við höfum sent þér staðfestingu í tölvupósti. Ef hún birtist ekki skaltu athuga ruslpóstinn.'
                            : confirmation === 'already_sent' ? 'Staðfesting hefur þegar verið send á netfangið þitt. Athugaðu einnig ruslpóstinn.'
                            : 'Skráningin tókst, en ekki tókst að senda staðfestingarpóstinn. Þú getur reynt sendinguna aftur.'}
                    </p>
                    {confirmation === 'failed' && (
                        <button type="button" disabled={pending} onClick={() => { if (submittedForm.current) submit(submittedForm.current); }}
                            className="mt-4 min-h-12 rounded-lg bg-[#416b97] px-5 py-3 font-semibold text-white disabled:opacity-60">
                            {pending ? 'Sendi…' : 'Reyna staðfestingarpóst aftur'}
                        </button>
                    )}
                    <Link href="/hugleidingar#lesa" className="mt-4 inline-flex min-h-11 items-center text-[#31577f] underline underline-offset-4">Skoða hugleiðingar</Link>
                </div>
            ) : (
                <form action={submit} className="flex flex-col gap-4" aria-busy={pending}>
                    <input type="hidden" name="segment" value="devotionals" />
                    <div className="hidden" aria-hidden="true">
                        <label htmlFor={`${id}-website`}>Vefsíða</label>
                        <input id={`${id}-website`} type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </div>
                    <div>
                        <label htmlFor={`${id}-email`} className="mb-2 block font-medium">Netfangið þitt</label>
                        <input id={`${id}-email`} name="email" type="email" required maxLength={254}
                            autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="nafn@netfang.is"
                            aria-describedby={status === 'error' ? `${id}-error` : undefined}
                            className="min-h-14 w-full min-w-0 rounded-lg border border-[#1b1814]/25 bg-white px-4 text-lg text-[#1b1814] outline-offset-4 focus:outline-2 focus:outline-[#416b97]" />
                    </div>
                    <label className="flex min-h-11 cursor-pointer items-start gap-3 text-base leading-relaxed">
                        <input type="checkbox" name="consent" value="true" required className="mt-1 h-5 w-5 shrink-0 accent-[#416b97]" />
                        <span>{DEVOTIONAL_CONSENT}</span>
                    </label>
                    <button type="submit" disabled={pending} className="min-h-14 rounded-lg bg-[#416b97] px-5 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#31577f] disabled:opacity-60">
                        {pending ? 'Skrái netfangið…' : 'Skrá mig á listann'}
                    </button>
                    {status === 'error' && <p id={`${id}-error`} role="alert" className="text-base text-[#a12622]">{error}</p>}
                    <p className="text-sm leading-relaxed text-[var(--skra-mjuk)]">
                        Ókeypis. Enginn aðgangur nauðsynlegur. Afskráning er í hverjum pósti.{' '}
                        <Link href="/personuverndarstefna" className="underline underline-offset-4">Persónuvernd</Link>.
                    </p>
                </form>
            )}
        </section>
    );
}
