import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Admin API for fundraising projects (first: nytt-studio).
 *
 *   GET    ?slug=nytt-studio          → project + all gifts + updates
 *   POST   { action:'gift',    slug, amount_isk, given_at?, donor_name?, show_name?, method?, note? }
 *   POST   { action:'update',  slug, title, body }
 *   POST   { action:'project', slug, goal_isk?, items? }   (items = full replacement array)
 *   DELETE ?giftId=… | ?updateId=…
 *
 * Bank-transfer gifts are entered here by hand today; the payment-gateway
 * webhook will insert into the same fundraising_gifts table later, so the
 * public board never has to change.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

async function loadProject(slug: string) {
    const { data } = await sb
        .from('fundraising_projects')
        .select('id, slug, title, subtitle, goal_isk, items, status')
        .eq('slug', slug)
        .maybeSingle();
    return data ?? null;
}

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') ?? 'nytt-studio';
    const project = await loadProject(slug);
    if (!project) return NextResponse.json({ error: 'Verkefni fannst ekki' }, { status: 404 });

    const [{ data: gifts }, { data: updates }] = await Promise.all([
        sb
            .from('fundraising_gifts')
            .select('id, amount_isk, given_at, donor_name, show_name, method, note, created_at')
            .eq('project_id', project.id)
            .order('given_at', { ascending: false })
            .order('created_at', { ascending: false }),
        sb
            .from('fundraising_updates')
            .select('id, title, body, published_at')
            .eq('project_id', project.id)
            .order('published_at', { ascending: false }),
    ]);

    return NextResponse.json({ success: true, project, gifts: gifts ?? [], updates: updates ?? [] });
}

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 });
    }

    const slug = typeof body.slug === 'string' ? body.slug : 'nytt-studio';
    const project = await loadProject(slug);
    if (!project) return NextResponse.json({ error: 'Verkefni fannst ekki' }, { status: 404 });

    if (body.action === 'gift') {
        const amount = Number(body.amount_isk);
        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Upphæð verður að vera stærri en 0' }, { status: 400 });
        }
        const donorName = typeof body.donor_name === 'string' && body.donor_name.trim()
            ? body.donor_name.trim().slice(0, 120)
            : null;
        const method = ['bank', 'aur', 'online'].includes(body.method as string)
            ? (body.method as string)
            : 'bank';
        const { error } = await sb.from('fundraising_gifts').insert({
            project_id: project.id,
            amount_isk: Math.round(amount),
            given_at: typeof body.given_at === 'string' && body.given_at ? body.given_at : undefined,
            donor_name: donorName,
            show_name: body.show_name === true && donorName !== null,
            method,
            note: typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 400) : null,
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    if (body.action === 'update') {
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        const text = typeof body.body === 'string' ? body.body.trim() : '';
        if (!title || !text) {
            return NextResponse.json({ error: 'Titill og texti eru nauðsynleg' }, { status: 400 });
        }
        const { error } = await sb.from('fundraising_updates').insert({
            project_id: project.id,
            title: title.slice(0, 160),
            body: text.slice(0, 2000),
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    if (body.action === 'project') {
        const patch: Record<string, unknown> = {};
        if (body.goal_isk !== undefined) {
            const goal = Number(body.goal_isk);
            if (!Number.isFinite(goal) || goal <= 0) {
                return NextResponse.json({ error: 'Markmið verður að vera stærra en 0' }, { status: 400 });
            }
            patch.goal_isk = Math.round(goal);
        }
        if (Array.isArray(body.items)) {
            const items = body.items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((i: any) => i && typeof i.label === 'string')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((i: any) => ({
                    key: String(i.key ?? '').slice(0, 40),
                    label: String(i.label).slice(0, 120),
                    amount_isk: Math.max(0, Math.round(Number(i.amount_isk) || 0)),
                    note: typeof i.note === 'string' ? i.note.slice(0, 300) : undefined,
                }));
            patch.items = items;
        }
        if (Object.keys(patch).length === 0) {
            return NextResponse.json({ error: 'Ekkert til að uppfæra' }, { status: 400 });
        }
        const { error } = await sb.from('fundraising_projects').update(patch).eq('id', project.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Óþekkt aðgerð' }, { status: 400 });
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('giftId');
    const updateId = searchParams.get('updateId');

    if (giftId) {
        const { error } = await sb.from('fundraising_gifts').delete().eq('id', giftId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }
    if (updateId) {
        const { error } = await sb.from('fundraising_updates').delete().eq('id', updateId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'giftId eða updateId vantar' }, { status: 400 });
}
