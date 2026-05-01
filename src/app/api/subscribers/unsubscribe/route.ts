import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET  /api/subscribers/unsubscribe?token=<uuid>  (link in email footer)
 * POST /api/subscribers/unsubscribe?token=<uuid>  (Gmail one-click button via List-Unsubscribe-Post header)
 *
 * Removes the subscriber row outright — no soft-delete state. Reasons:
 * GDPR-style "right to be forgotten" is the simplest answer, and a
 * subscriber who unsubscribes and re-subscribes later just goes through
 * the verification flow fresh. Permanent unsubscribes need only a
 * suppression list, which we don't have today.
 */

async function doUnsubscribe(token: string | null, redirectBase: string) {
    if (!token) {
        return NextResponse.redirect(new URL('/frettabref?unsubscribed=invalid', redirectBase));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { error } = await sb
        .from('subscribers')
        .delete()
        .eq('unsubscribe_token', token);
    if (error) {
        console.error('unsubscribe failed:', error);
        return NextResponse.redirect(new URL('/frettabref?unsubscribed=error', redirectBase));
    }
    return NextResponse.redirect(new URL('/frettabref?unsubscribed=1', redirectBase));
}

export async function GET(req: NextRequest) {
    return doUnsubscribe(req.nextUrl.searchParams.get('token'), req.url);
}

export async function POST(req: NextRequest) {
    return doUnsubscribe(req.nextUrl.searchParams.get('token'), req.url);
}
