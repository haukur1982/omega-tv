import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { generateThumbnail } from '@/lib/thumbnail-generator';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/admin/videos/thumbnail
 * Generate a cinematic thumbnail for a video and save to Supabase Storage.
 */
export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    try {
        const { bunnyVideoId, seriesName, episodeTitle, episodeId } = await request.json();

        if (!bunnyVideoId) {
            return NextResponse.json({ error: 'bunnyVideoId is required' }, { status: 400 });
        }

        // Generate landscape thumbnail
        const thumbnailBuffer = await generateThumbnail({
            bunnyVideoId,
            seriesName: seriesName || undefined,
            episodeTitle: episodeTitle || undefined,
            format: 'landscape',
        });

        // Upload to Supabase Storage
        const filename = `${episodeId || bunnyVideoId}_landscape.png`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('thumbnails')
            .upload(filename, thumbnailBuffer, {
                contentType: 'image/png',
                upsert: true,
            });

        if (uploadError) {
            console.error('Thumbnail upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload thumbnail' }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('thumbnails')
            .getPublicUrl(filename);

        const thumbnailUrl = urlData.publicUrl;

        // Update episode record if episodeId provided
        if (episodeId) {
            await supabaseAdmin
                .from('episodes')
                .update({ thumbnail_custom: thumbnailUrl })
                .eq('id', episodeId);
        }

        return NextResponse.json({
            success: true,
            url: thumbnailUrl,
        });

    } catch (error) {
        console.error('Thumbnail generation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate thumbnail' },
            { status: 500 }
        );
    }
}
