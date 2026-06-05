import { NextResponse, type NextRequest } from 'next/server';
import { fetchBunnyThumbnailBuffer } from '@/lib/bunny-thumbnail';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ videoId: string }> },
) {
    const { videoId } = await params;
    if (!videoId || !/^[a-f0-9-]{20,}$/i.test(videoId)) {
        return NextResponse.json({ error: 'Vantar gilt Bunny myndbands-ID.' }, { status: 400 });
    }

    try {
        const { buffer, contentType } = await fetchBunnyThumbnailBuffer(videoId);
        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Tókst ekki að sækja smámynd.' },
            { status: 502 },
        );
    }
}
