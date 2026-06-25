'use client';

import { useEffect } from 'react';

/**
 * Toggles `.hk-nav-solid` on the fixed Heimakirkja nav once the page scrolls
 * past the hero, so the light wordmark stays legible over the cream sections.
 * Renders nothing.
 */
export function HkNavScroll() {
    useEffect(() => {
        const nav = document.getElementById('hk-nav');
        if (!nav) return;
        const onScroll = () => {
            nav.classList.toggle('hk-nav-solid', window.scrollY > 60);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return null;
}
