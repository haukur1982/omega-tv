import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAdminSession } from '@/lib/admin-auth';
import { publishEpisode, unpublishEpisode } from '@/lib/vod-db';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Resolve episode id (the editor may pass the Bunny video guid).
    let realId = id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const byId = await sb.from('episodes').select('id').eq('id', id).maybeSingle();
    if (!byId.data) {
        const byGuid = await sb.from('episodes').select('id').eq('bunny_video_id', id).maybeSingle();
        if (byGuid.data) realId = byGuid.data.id;
    }

    const result = body.unpublish ? await unpublishEpisode(realId) : await publishEpisode(realId);
    if (!result) {
        return NextResponse.json({ error: 'Ekki tókst að breyta stöðu.' }, { status: 500 });
    }
    revalidateTag('vod', 'max');
    revalidatePath('/sermons');
    if (result.bunny_video_id) revalidatePath(`/sermons/${result.bunny_video_id}`);
    if (result.series_id) revalidatePath('/sermons');
    return NextResponse.json({ ok: true, episode: result });
}
