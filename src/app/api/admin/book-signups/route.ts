import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/book-signups — the Bókavinir work list.
 * Newest first; status 'new' rows are the envelopes still to send.
 */
export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { data, error } = await sb
        .from('book_signups')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ signups: data ?? [] });
}
