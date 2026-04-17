import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    // Allow searching for specific terms, or random nature if empty
    const endpoint = query
        ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=portrait&per_page=20`
        : `https://api.unsplash.com/photos/random?count=20&orientation=portrait&query=nature`;

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        return NextResponse.json({ error: 'Unsplash API key not configured' }, { status: 500 });
    }

    try {
        const res = await fetch(endpoint, {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        });

        if (!res.ok) {
            throw new Error(`Unsplash API error: ${res.statusText}`);
        }

        const data = await res.json();

        // Normalize response (search returns .results, random returns array directly)
        const images = Array.isArray(data) ? data : data.results;

        return NextResponse.json(images.map((img: any) => ({
            id: img.id,
            url: img.urls.regular,
            thumb: img.urls.small,
            photographer: img.user.name,
            photographer_url: img.user.links.html,
            download_location: img.links.download_location // Required by Unsplash API guidelines to trigger download event
        })));

    } catch (error: any) {
        console.error('Unsplash Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch images' }, { status: 500 });
    }
}
