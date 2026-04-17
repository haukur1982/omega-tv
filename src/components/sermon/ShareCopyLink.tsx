'use client';

import { useState, useCallback } from 'react';

/**
 * Tiny client island for copying the sermon URL to clipboard.
 * Shows a confirmation label for ~1.6s after copy.
 */
export default function ShareCopyLink({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);

    const onCopy = useCallback(async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            // Silent fail — don't interrupt the page for a clipboard miss.
        }
    }, [url]);

    return (
        <button
            type="button"
            onClick={onCopy}
            className="type-merki muted-link"
            style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                letterSpacing: '0.18em',
                fontSize: '0.7rem',
            }}
        >
            {copied ? 'Afritað ✓' : 'Afrita hlekk'}
        </button>
    );
}
