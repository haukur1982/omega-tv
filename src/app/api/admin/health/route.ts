import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getRecentEvents } from '@/lib/system-events';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/health
 *
 * Returns the most recent system events (cron runs, sends, imports,
 * Bunny ops). Read by the /admin/health admin page.
 */
export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? '100'), 500);
    const [events, vod] = await Promise.all([getRecentEvents(limit), getVodHealth()]);
    return NextResponse.json({ events, vod });
}

async function getVodHealth() {
    try {
        const sb = supabaseAdmin as any;
        const { data, error } = await sb
            .from('vod_intake_jobs')
            .select('status, created_at, error_message')
            .order('created_at', { ascending: false })
            .limit(250);
        if (error) throw error;

        const rows = (data ?? []) as Array<{ status: string; created_at: string; error_message: string | null }>;
        return {
            total: rows.length,
            received: rows.filter(r => r.status === 'received').length,
            metadata_pending: rows.filter(r => r.status === 'metadata_pending').length,
            poster_pending: rows.filter(r => r.status === 'poster_pending').length,
            draft_ready: rows.filter(r => r.status === 'draft_ready').length,
            needs_attention: rows.filter(r => r.status === 'needs_attention').length,
            failed: rows.filter(r => r.status === 'failed').length,
            last_error: rows.find(r => r.error_message)?.error_message ?? null,
            latest_at: rows[0]?.created_at ?? null,
        };
    } catch (error) {
        return {
            total: 0,
            received: 0,
            metadata_pending: 0,
            poster_pending: 0,
            draft_ready: 0,
            needs_attention: 0,
            failed: 0,
            last_error: error instanceof Error ? error.message : 'Could not read VOD intake jobs.',
            latest_at: null,
        };
    }
}
