import { NextResponse } from 'next/server';
import { getVideos } from '@/lib/bunny';

export async function GET(request: Request) {
    // Check if keys are configured
    if (!process.env.BUNNY_API_KEY || !process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID) {
        return NextResponse.json(
            { error: 'Bunny configuration missing' },
            { status: 500 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const search = searchParams.get('search') || '';

        const videos = await getVideos(page, 100); // Fetch 100 recent videos

        // Simple server-side filtering (Bunny API search is limited)
        const filteredVideos = search
            ? videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
            : videos;

        return NextResponse.json(filteredVideos);
    } catch (error) {
        console.error('Video fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}
