import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/subscribers/verify?token=<uuid>
 *
 * Confirms a subscriber's email by matching the verification_token from
 * the verification email. On success: sets verified_at + clears the
 * token (single-use). Redirects to a friendly /frettabref?verified=1
 * page so the user lands on real content, not a JSON blob.
 *
 * Idempotent: hitting an already-verified token returns the same
 * success redirect rather than an error, so users who click twice
 * don't see "Villa".
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
        // Token unknown OR already used (we clear it on success).
        // Treat as success — user clicked the link, that's the intent.
        return NextResponse.redirect(new URL('/frettabref?verified=1', req.url));
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
            verification_token: null,
        })
        .eq('id', sub.id);

    if (updateErr) {
        console.error('verify update failed:', updateErr);
        return NextResponse.redirect(new URL('/frettabref?verified=error', req.url));
    }

    return NextResponse.redirect(new URL('/frettabref?verified=1', req.url));
}
