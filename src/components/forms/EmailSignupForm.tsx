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
    successMessage = 'Takk fyrir skráninguna! 🙏',
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
            <div className={`p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center ${className}`}>
                <p className="text-green-400 font-bold text-lg">{successMessage}</p>
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
                    className="flex-1 px-6 py-4 rounded-full bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-white placeholder-white/30 transition-colors"
                />
            )}
            <input
                type="email"
                name="email"
                placeholder={placeholder}
                required
                className={`flex-1 px-6 py-4 ${isInline ? 'rounded-full' : 'rounded-lg'} bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-white placeholder-white/30 transition-colors`}
            />
            <button
                type="submit"
                disabled={isPending}
                className={`px-8 py-4 ${isInline ? 'rounded-full' : 'rounded-lg'} bg-[var(--accent)] text-white font-bold hover:scale-105 transition-transform shadow-[0_0_20px_var(--accent)] hover:shadow-[0_0_40px_var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isPending ? 'Skrái...' : buttonText}
            </button>

            {status === 'error' && (
                <p className="text-red-400 text-sm mt-2 text-center md:text-left">{errorMessage}</p>
            )}
        </form>
    );
}
