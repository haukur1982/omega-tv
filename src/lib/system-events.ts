/**
 * Minimal observability — write structured events to system_events.
 *
 * Use anywhere on the server side where "did this run? did it fail?"
 * is a question you'd want to answer later from /admin/health without
 * grepping Vercel logs.
 *
 *   await logEvent('cron.schedule_xml_sync', 'info', 'Imported 24 slots');
 *   await logEvent('newsletter.send', 'info', `Sent ${n} of ${total}`, { id, sent: n });
 *   await logEvent('bunny.upload', 'error', 'Encoding timed out', { videoId });
 *
 * Failure to write a log entry must NEVER break the calling code path —
 * we swallow errors here on purpose.
 */
import { supabaseAdmin } from './supabase';

export type EventSeverity = 'info' | 'warn' | 'error';

export interface SystemEvent {
    id: string;
    createdAt: string;
    eventType: string;
    severity: EventSeverity;
    message: string;
    payload: Record<string, unknown> | null;
    actor: string | null;
}

export async function logEvent(
    eventType: string,
    severity: EventSeverity,
    message: string,
    payload?: Record<string, unknown>,
    actor?: string,
): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sb = supabaseAdmin as any;
        await sb.from('system_events').insert({
            event_type: eventType,
            severity,
            message,
            payload: payload ?? null,
            actor: actor ?? null,
        });
    } catch (err) {
        // Logging must never break the caller. Surface to console in case
        // observability infra is what's broken.
        console.error('[system-events] failed to log:', eventType, err);
    }
}

/**
 * Read recent events for /admin/health.
 */
export async function getRecentEvents(limit = 50): Promise<SystemEvent[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { data, error } = await sb
        .from('system_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) {
        console.error('Failed to fetch system events:', error);
        return [];
    }
    return ((data ?? []) as Array<{
        id: string;
        created_at: string;
        event_type: string;
        severity: string;
        message: string;
        payload: Record<string, unknown> | null;
        actor: string | null;
    }>).map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        eventType: row.event_type,
        severity: (row.severity as EventSeverity) ?? 'info',
        message: row.message,
        payload: row.payload,
        actor: row.actor,
    }));
}
