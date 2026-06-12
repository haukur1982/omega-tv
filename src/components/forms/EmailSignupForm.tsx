'use client';

import { useState, useTransition } from 'react';
import { subscribeAction } from '@/actions/subscribe';

interface EmailSignupFormProps {
    segment?: string;
    placeholder?: string;
    buttonText?: string;
    successMessage?: string;
    className?: string;
    showName?: boolean;
    layout?: 'inline' | 'stacked';
}

export default function EmailSignupForm({
    segment = 'newsletter',
    placeholder = 'Netfang',
    buttonText = 'Skrá mig',
    successMessage = 'Takk — þú ert komin/n á póstlistann.',
    className = '',
    showName = false,
    layout = 'inline'
}: EmailSignupFormProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (formData: FormData) => {
        formData.append('segment', segment);

        startTransition(async () => {
            const result = await subscribeAction(formData);
            if (result.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Villa kom upp.');
            }
        });
    };

    if (status === 'success') {
        return (
            <div className={`p-6 bg-[var(--kerti-gloed)] border border-[rgba(233,168,96,0.3)] rounded-xl text-center ${className}`}>
                <p className="text-[var(--kerti)] font-bold text-lg">{successMessage}</p>
            </div>
        );
    }

    const isInline = layout === 'inline';

    return (
        <form
            action={handleSubmit}
            className={`${isInline ? 'flex flex-col md:flex-row gap-4' : 'flex flex-col gap-3'} ${className}`}
        >
            {showName && (
                <input
                    type="text"
                    name="name"
                    placeholder="Nafn (valkvætt)"
                    className="flex-1 px-6 py-4 rounded-full bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-white placeholder-white/55 transition-colors"
                />
            )}
            <input
                type="email"
                name="email"
                placeholder={placeholder}
                required
                className={`flex-1 px-6 py-4 ${isInline ? 'rounded-full' : 'rounded-lg'} bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-white placeholder-white/55 transition-colors`}
            />
            <button
                type="submit"
                disabled={isPending}
                className={`px-8 py-4 ${isInline ? 'rounded-full' : 'rounded-lg'} bg-[var(--accent)] text-[var(--nott)] font-bold hover:bg-[var(--gull)] transition-colors shadow-[var(--shadow-soft)] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isPending ? 'Skrái...' : buttonText}
            </button>

            {status === 'error' && (
                <p className="text-red-400 text-sm mt-2 text-center md:text-left">{errorMessage}</p>
            )}
        </form>
    );
}
