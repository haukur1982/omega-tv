import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getBunnyVideoStatus } from '@/lib/bunny';

/**
 * GET /api/admin/videos/[id]/status
 *
 * Returns the Bunny encoding status for a single video. Used by the
 * draft editor to render the encoding chip — green when ready, yellow
 * during encoding, red on error. Wraps the BunnyEncodingStatus enum
 * from src/lib/bunny.ts.
 *
 * `[id]` is the Bunny GUID (the same value stored in `episodes.bunny_video_id`).
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Vantar Bunny ID.' }, { status: 400 });

    const result = await getBunnyVideoStatus(id);
    if (!result) {
        return NextResponse.json({ error: 'Tókst ekki að ná í Bunny.' }, { status: 502 });
    }

    return NextResponse.json(result);
}
