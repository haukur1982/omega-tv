import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateMetadata } from '../../../../../../../scripts/generate-metadata';

type RegenerateField = 'all' | 'title' | 'description' | 'editor_note' | 'chapters' | 'tags' | 'bible_ref';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    let body: { field?: RegenerateField } = {};
    try {
        body = await req.json();
    } catch {
        body = {};
    }
    const field = body.field ?? 'all';

    const sb = supabaseAdmin as any;
    const { data: episode, error: readError } = await sb
        .from('episodes')
        .select('id, title, bunny_video_id, transcript, language_primary, source_language')
        .eq('id', id)
        .single();

    if (readError || !episode) {
        return NextResponse.json({ error: readError?.message ?? 'Fann ekki þátt.' }, { status: 404 });
    }
    if (!episode.transcript || episode.transcript.trim().length < 40) {
        return NextResponse.json({ error: 'Transcript vantar. Ekki hægt að fylla út sjálfvirkt.' }, { status: 400 });
    }

    const meta = await generateMetadata({
        transcriptText: episode.transcript,
        bunnyVideoId: episode.bunny_video_id,
        filename: episode.title,
        language: episode.language_primary === 'en' ? 'en' : 'is',
    });

    const patch: Record<string, unknown> = {
        metadata_confidence: estimateMetadataConfidence(episode.transcript, meta),
    };

    const include = (name: RegenerateField) => field === 'all' || field === name;
    if (include('title')) patch.title = meta.title;
    if (include('description')) patch.description = meta.description || null;
    if (include('editor_note')) patch.editor_note = meta.editor_note || null;
    if (include('chapters')) patch.chapters = meta.chapters.length > 0 ? meta.chapters : null;
    if (include('tags')) patch.tags = meta.tags;
    if (include('bible_ref')) patch.bible_ref = meta.bible_ref;

    const { data: updated, error: updateError } = await sb
        .from('episodes')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, episode: updated, notes: meta.notes });
}

function estimateMetadataConfidence(transcript: string, meta: Awaited<ReturnType<typeof generateMetadata>>): number {
    let score = transcript.length > 2000 ? 0.55 : 0.3;
    if (meta.description.length > 120) score += 0.15;
    if (meta.chapters.length >= 3) score += 0.15;
    if (meta.tags.length >= 2) score += 0.05;
    if (meta.bible_ref) score += 0.05;
    return Math.min(0.95, Number(score.toFixed(3)));
}
