import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * PATCH /api/admin/book-signups/[id] — body { status: 'new' | 'sent' }.
 * Flips a signup between "to send" and "sent" as staff mail the books.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    let body: { status?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }
    if (body.status !== 'new' && body.status !== 'sent') {
        return NextResponse.json({ error: 'Staða verður að vera new eða sent.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { data, error } = await sb
        .from('book_signups')
        .update({ status: body.status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, signup: data });
}
