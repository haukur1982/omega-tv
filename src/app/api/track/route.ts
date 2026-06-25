import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * POST /api/track — privacy-friendly pageview ingest for the Greining page.
 *
 * No cookies, no stored IPs. "Unique visitor" is a one-way daily hash of
 * IP + user-agent + date, so it can't be reversed or used across days. Bots are
 * dropped, admin/api paths are ignored, and a failure here never blocks the
 * page (the client fires this fire-and-forget via sendBeacon).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SALT = process.env.ANALYTICS_SALT || 'omega-pv-v1';
const noContent = () => new NextResponse(null, { status: 204 });

function isBot(ua: string): boolean {
    return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|monitor|preview|curl|wget/i.test(ua);
}

export async function POST(request: Request) {
    let body: { path?: string; referrer?: string };
    try { body = await request.json(); } catch { return noContent(); }

    let path = (body.path || '').trim();
    if (!path.startsWith('/') || path.length > 512) return noContent();
    path = path.split('?')[0].split('#')[0];
    if (path.startsWith('/admin') || path.startsWith('/api')) return noContent();
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

    const ua = request.headers.get('user-agent') || '';
    if (!ua || isBot(ua)) return noContent();

    const country = request.headers.get('x-vercel-ip-country');
    const ip =
        (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        '';
    const day = new Date().toISOString().slice(0, 10);
    const visitorHash = createHash('sha256').update(`${ip}|${ua}|${day}|${SALT}`).digest('hex').slice(0, 32);

    let referrerHost: string | null = null;
    if (body.referrer) {
        try {
            const host = new URL(body.referrer).host;
            // Only record EXTERNAL referrers — internal navigation is noise here.
            if (host && !host.includes('omega')) referrerHost = host;
        } catch { /* ignore malformed referrer */ }
    }

    try {
        const db = supabaseAdmin as unknown as SupabaseClient;
        await db.from('page_views').insert({
            path,
            referrer_host: referrerHost,
            country: country || null,
            visitor_hash: visitorHash,
        });
    } catch { /* analytics must never break navigation */ }

    return noContent();
}
