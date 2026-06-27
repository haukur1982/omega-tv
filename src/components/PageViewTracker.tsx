'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Fires one fire-and-forget pageview per navigation to /api/track. Uses
 * sendBeacon so it never delays or blocks the page; admin paths are skipped.
 * Powers the "Vefumferð" panel on the admin Greining page.
 */
export default function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname || pathname.startsWith('/admin')) return;
        // On-air / campaign source: read ?q= (or ?utm_source=) on the landing URL
        // so a cable-driven arrival at /tv?q=ls is attributable. Only meaningful
        // on the first inbound load; internal navigations carry no q and report none.
        const source =
            typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('q') ||
                  new URLSearchParams(window.location.search).get('utm_source') ||
                  undefined
                : undefined;
        const payload = JSON.stringify({
            path: pathname,
            referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
            source,
        });
        try {
            const blob = new Blob([payload], { type: 'application/json' });
            if (navigator.sendBeacon?.('/api/track', blob)) return;
        } catch { /* fall through to fetch */ }
        fetch('/api/track', {
            method: 'POST',
            body: payload,
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
        }).catch(() => { /* analytics is best-effort */ });
    }, [pathname]);

    return null;
}
