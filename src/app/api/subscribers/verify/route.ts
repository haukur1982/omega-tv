import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/subscribers/verify?token=<uuid>
 *
 * Confirms a subscriber's email by matching the verification_token from
 * the verification email. On success: sets verified_at + is_verified.
 *
 * Idempotent via verified_at: the token is intentionally NOT cleared, so a
 * second click finds the row, sees verified_at set, and shows the same
 * success rather than looking "unknown".
 *
 * Honesty rule: an unknown/expired token must NOT be treated as success.
 * Telling someone "staðfest" while they sit unverified is a silent broken
 * promise. Unknown tokens go to ?verified=expired so they can request a
 * fresh link.
 */
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
        return NextResponse.redirect(new URL('/frettabref?verified=invalid', req.url));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;

    // Look the token up. If found, mark verified + clear the token.
    const { data: sub, error } = await sb
        .from('subscribers')
        .select('id, verified_at')
        .eq('verification_token', token)
        .maybeSingle();

    if (error) {
        console.error('verify lookup failed:', error);
        return NextResponse.redirect(new URL('/frettabref?verified=error', req.url));
    }

    if (!sub) {
        // Unknown or expired token. Do NOT claim success — that would tell
        // someone "staðfest" while they remain unverified. Send them to a
        // state that offers a fresh link.
        return NextResponse.redirect(new URL('/frettabref?verified=expired', req.url));
    }

    if (sub.verified_at) {
        // Already verified — same redirect.
        return NextResponse.redirect(new URL('/frettabref?verified=1', req.url));
    }

    const { error: updateErr } = await sb
        .from('subscribers')
        .update({
            verified_at: new Date().toISOString(),
            is_verified: true,
            // Token kept on purpose: a second click resolves via verified_at
            // (already-confirmed) instead of looking like an unknown token.
        })
        .eq('id', sub.id);

    if (updateErr) {
        console.error('verify update failed:', updateErr);
        return NextResponse.redirect(new URL('/frettabref?verified=error', req.url));
    }

    return NextResponse.redirect(new URL('/frettabref?verified=1', req.url));
}
