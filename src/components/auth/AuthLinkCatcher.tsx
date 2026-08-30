'use client';

import { useEffect } from 'react';

/**
 * Catches auth tokens that land on the wrong page.
 *
 * Supabase only redirects auth emails to URLs on its allow-list; anything else
 * silently falls back to the project's Site URL. This project's allow-list is
 * empty and its Site URL is still the old preview domain, so every recovery
 * and magic link arrives at the site ROOT with its token in the fragment —
 * where nothing was listening, which is why "reset password" looked broken.
 *
 * Rather than depend on a dashboard setting being corrected, this forwards any
 * auth fragment to the page that knows what to do with it, keeping the
 * fragment intact so supabase-js can still read the token there:
 *
 *   recovery → /admin/nytt-lykilord   (choose a new password)
 *   anything else (magic link) → /admin  (which sends on to the dashboard)
 *
 * It stays correct after the Site URL is fixed: a link that already lands on
 * the right page carries no fragment by then, so this does nothing.
 */
export default function AuthLinkCatcher() {
    useEffect(() => {
        const hash = window.location.hash;
        if (!hash || hash.length < 2) return;

        const params = new URLSearchParams(hash.slice(1));
        const hasToken = params.has('access_token') || params.has('error_code');
        if (!hasToken) return;

        const target =
            params.get('type') === 'recovery' ? '/admin/nytt-lykilord' : '/admin';

        // Already where we need to be — let that page handle its own fragment.
        if (window.location.pathname === target) return;

        // replace(), not push(): the token must not sit in back-button history.
        window.location.replace(target + hash);
    }, []);

    return null;
}
