import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getDraftEpisodes } from '@/lib/vod-db';

/**
 * GET /api/admin/drafts — the content-pipeline inbox feed.
 *
 * Service-role read (via getDraftEpisodes) so it works regardless of RLS and,
 * critically, so unpublished drafts — transcripts and all — are NEVER served to
 * the public anon key. The /admin/drafts inbox loads through here instead of
 * querying episodes directly from the browser.
 */
export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const drafts = await getDraftEpisodes();
    return NextResponse.json({ items: drafts });
}
