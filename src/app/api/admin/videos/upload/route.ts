import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

/**
 * POST /api/admin/videos/upload
 * Step 1: Creates a video entry in Bunny Stream, returns credentials for direct upload.
 * Step 2 (client): Client uploads the file directly to Bunny using the returned info.
 */
export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
    const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

    if (!BUNNY_API_KEY || !LIBRARY_ID) {
        return NextResponse.json({ error: 'Bunny configuration missing' }, { status: 500 });
    }

    try {
        const { title } = await request.json();
        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Create video entry in Bunny
        const bunnyRes = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`, {
            method: 'POST',
            headers: {
                'AccessKey': BUNNY_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ title }),
        });

        if (!bunnyRes.ok) {
            const err = await bunnyRes.text();
            console.error('Bunny create error:', err);
            return NextResponse.json({ error: 'Failed to create video entry' }, { status: 500 });
        }

        const video = await bunnyRes.json();

        // Return the GUID and upload credentials
        // Client will upload directly to Bunny (avoids proxying large files through our server)
        return NextResponse.json({
            guid: video.guid,
            libraryId: LIBRARY_ID,
            apiKey: BUNNY_API_KEY,  // Safe: only authenticated admins reach this endpoint
            uploadUrl: `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${video.guid}`,
        });
    } catch (error) {
        console.error('Upload init error:', error);
        return NextResponse.json({ error: 'Failed to initialize upload' }, { status: 500 });
    }
}
