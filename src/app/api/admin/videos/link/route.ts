import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/admin/videos/link
 * After a video is uploaded to Bunny, this creates/links the series + episode in Supabase.
 */
export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    try {
        const { bunnyGuid, seriesName, episodeTitle, episodeNumber, description } = await request.json();

        if (!bunnyGuid || !seriesName || !episodeTitle) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Slugify series name (handle Icelandic chars)
        const slug = seriesName.toLowerCase()
            .replace(/í/g, 'i').replace(/ð/g, 'd').replace(/þ/g, 'th')
            .replace(/ö/g, 'o').replace(/ó/g, 'o').replace(/á/g, 'a')
            .replace(/ú/g, 'u').replace(/é/g, 'e').replace(/ý/g, 'y')
            .replace(/æ/g, 'ae').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // 1. Find or create series
        let seriesId: string;
        const { data: existingSeries } = await supabaseAdmin
            .from('series')
            .select('id')
            .eq('title', seriesName)
            .single();

        if (existingSeries) {
            seriesId = existingSeries.id;
        } else {
            const { data: newSeries, error: seriesErr } = await supabaseAdmin
                .from('series')
                .insert({ title: seriesName, slug, description: '' })
                .select('id')
                .single();

            if (seriesErr || !newSeries) {
                console.error('Series create error:', seriesErr);
                return NextResponse.json({ error: 'Failed to create series' }, { status: 500 });
            }
            seriesId = newSeries.id;
        }

        // 2. Find or create Season 1
        let seasonId: string;
        const { data: existingSeason } = await supabaseAdmin
            .from('seasons')
            .select('id')
            .eq('series_id', seriesId)
            .eq('season_number', 1)
            .single();

        if (existingSeason) {
            seasonId = existingSeason.id;
        } else {
            const { data: newSeason, error: seasonErr } = await supabaseAdmin
                .from('seasons')
                .insert({ series_id: seriesId, season_number: 1, title: 'Sería 1' })
                .select('id')
                .single();

            if (seasonErr || !newSeason) {
                console.error('Season create error:', seasonErr);
                return NextResponse.json({ error: 'Failed to create season' }, { status: 500 });
            }
            seasonId = newSeason.id;
        }

        // 3. Create episode
        const { data: episode, error: epErr } = await supabaseAdmin
            .from('episodes')
            .insert({
                series_id: seriesId,
                season_id: seasonId,
                bunny_video_id: bunnyGuid,
                title: episodeTitle,
                episode_number: episodeNumber || 1,
                description: description || '',
                status: 'published',
                source: 'admin',
            })
            .select()
            .single();

        if (epErr || !episode) {
            console.error('Episode create error:', epErr);
            return NextResponse.json({ error: 'Failed to create episode' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            seriesId,
            seasonId,
            episodeId: episode.id,
        });
    } catch (error) {
        console.error('Link error:', error);
        return NextResponse.json({ error: 'Failed to link video' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    try {
        const { episodeId } = await request.json();
        if (!episodeId) {
            return NextResponse.json({ error: 'episodeId required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('episodes')
            .delete()
            .eq('id', episodeId);

        if (error) {
            return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Failed to delete episode' }, { status: 500 });
    }
}
