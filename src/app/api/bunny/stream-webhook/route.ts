import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logEvent } from '@/lib/system-events';

/**
 * POST /api/bunny/stream-webhook
 *
 * Bunny Stream webhook receiver. Bunny payload shapes vary by event type, so
 * this endpoint extracts the video GUID defensively and records the event.
 *
 * Optional auth: set BUNNY_WEBHOOK_SECRET and send x-bunny-signature as an
 * HMAC-SHA256 hex digest of the raw body. If the env var is unset, the route
 * accepts the webhook but only mutates rows by Bunny GUID.
 */
export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const secret = process.env.BUNNY_WEBHOOK_SECRET;
    if (secret && !verifySignature(rawBody, req.headers.get('x-bunny-signature') ?? '', secret)) {
        return NextResponse.json({ error: 'Invalid Bunny signature.' }, { status: 401 });
    }

    let payload: Record<string, unknown>;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const bunnyVideoId = extractVideoGuid(payload);
    const bunnyStatus = extractStatus(payload);

    await logEvent('bunny.stream_webhook', 'info', 'Bunny Stream webhook received.', {
        bunny_video_id: bunnyVideoId,
        bunny_status: bunnyStatus,
        payload,
    }, 'bunny');

    if (bunnyVideoId) {
        const sb = supabaseAdmin as any;
        const isReady = bunnyStatus === 4 || bunnyStatus === '4' || String(bunnyStatus).toLowerCase() === 'finished';
        await sb
            .from('vod_intake_jobs')
            .update({
                status: isReady ? 'poster_pending' : 'metadata_pending',
                error_message: null,
            })
            .eq('bunny_video_id', bunnyVideoId)
            .in('status', ['received', 'metadata_pending']);
    }

    return NextResponse.json({ ok: true });
}

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const actual = signature.replace(/^sha256=/, '');
    const expectedBuffer = Buffer.from(expected, 'hex');
    const actualBuffer = Buffer.from(actual, 'hex');
    return expectedBuffer.length === actualBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function extractVideoGuid(payload: Record<string, unknown>): string | null {
    const candidates = [
        payload.videoGuid,
        payload.video_guid,
        payload.videoId,
        payload.video_id,
        payload.guid,
        payload.id,
        (payload.video as Record<string, unknown> | undefined)?.guid,
        (payload.video as Record<string, unknown> | undefined)?.id,
    ];
    const found = candidates.find((value) => typeof value === 'string' && value.length >= 8);
    return typeof found === 'string' ? found : null;
}

function extractStatus(payload: Record<string, unknown>): unknown {
    return payload.status
        ?? payload.videoStatus
        ?? payload.video_status
        ?? (payload.video as Record<string, unknown> | undefined)?.status
        ?? payload.event
        ?? payload.eventType;
}
