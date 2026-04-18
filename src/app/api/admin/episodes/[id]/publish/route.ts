import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { publishEpisode, unpublishEpisode } from '@/lib/vod-db';

/**
 * POST /api/admin/episodes/[id]/publish
 * Body (optional): { unpublish?: boolean }
 *
 * Flips status to 'published' (or back to 'draft' when unpublish=true).
 * Sets published_at on publish.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    let body: { unpublish?: boolean } = {};
    try {
        body = await req.json();
    } catch {
        /* body optional */
    }

    const result = body.unpublish ? await unpublishEpisode(id) : await publishEpisode(id);
    if (!result) {
        return NextResponse.json({ error: 'Ekki tókst að breyta stöðu.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, episode: result });
}
