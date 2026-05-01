import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendNewsletter } from '@/lib/email';
import { logEvent } from '@/lib/system-events';

/**
 * POST /api/admin/newsletters/[id]/send
 *
 * Emails a newsletter to all VERIFIED subscribers. Verified-only is
 * non-negotiable — sending to unconfirmed addresses is the fastest way
 * to land on a spam list and cost the project deliverability.
 *
 * On success: stamps newsletters.sent_at with NOW() so the admin list
 * shows whether each newsletter is on-site only or has been emailed.
 *
 * Send is irreversible. The route refuses to re-send if sent_at is
 * already set — a follow-up "force resend" flag can be added later if
 * needed.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'ID vantar.' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;

    const { data: newsletter, error: nErr } = await sb
        .from('newsletters')
        .select('id, title, content, sent_at')
        .eq('id', id)
        .single();
    if (nErr || !newsletter) {
        return NextResponse.json({ error: 'Fréttabréf fannst ekki.' }, { status: 404 });
    }
    if (newsletter.sent_at) {
        return NextResponse.json(
            { error: `Þetta fréttabréf var sent ${new Date(newsletter.sent_at).toLocaleString('is-IS')}. Endursend ekki sjálfvirkt.` },
            { status: 409 },
        );
    }

    // Verified subscribers only — and only those who still have the
    // unsubscribe token (every row should, but defensive).
    const { data: subs, error: sErr } = await sb
        .from('subscribers')
        .select('email, unsubscribe_token')
        .not('verified_at', 'is', null)
        .not('unsubscribe_token', 'is', null);
    if (sErr) {
        return NextResponse.json({ error: sErr.message }, { status: 500 });
    }

    type Recipient = { email: string; unsubscribe_token: string };
    const recipients = (subs ?? []) as Recipient[];
    if (recipients.length === 0) {
        return NextResponse.json(
            { error: 'Engir staðfestir áskrifendur. Sending hætt.' },
            { status: 400 },
        );
    }

    const result = await sendNewsletter(
        newsletter.title,
        newsletter.content,
        recipients.map((r) => ({ email: r.email, unsubscribeToken: r.unsubscribe_token })),
    );

    // Stamp sent_at only if at least one email succeeded — pure failure
    // shouldn't lock the newsletter as sent.
    if (result.sent > 0) {
        await sb
            .from('newsletters')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', id);
    }

    await logEvent(
        'newsletter.send',
        result.failed === 0 ? 'info' : (result.sent === 0 ? 'error' : 'warn'),
        `${newsletter.title} — sent ${result.sent}/${recipients.length}, failed ${result.failed}.`,
        { newsletter_id: id, sent: result.sent, failed: result.failed, total: recipients.length },
    );

    return NextResponse.json({
        ok: result.success,
        sent: result.sent,
        failed: result.failed,
        total: recipients.length,
    });
}
