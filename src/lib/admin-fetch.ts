'use client';

import { supabase } from './supabase';

/**
 * fetch() for protected /api/admin/* routes.
 *
 * Omega uses @supabase/supabase-js, which keeps the session in localStorage and
 * sets NO auth cookie. So a plain fetch() to an admin route sends no credential
 * and the server's verifyAdminSession() returns 401. Every admin API call MUST
 * attach the current access token as a Bearer header — this helper does that in
 * one place so no page can silently 401 again.
 *
 * Usage: replace `fetch('/api/admin/…', init)` with `authedFetch('/api/admin/…', init)`.
 * Caller-supplied headers are preserved (Content-Type for JSON; omit it for
 * FormData so the browser sets the multipart boundary itself).
 */
export async function authedFetch(
    input: string,
    init: RequestInit = {},
): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers(init.headers);
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    return fetch(input, { ...init, headers });
}
