import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    listAllDevotionals,
    getDevotionalBySlug,
    updateDevotional,
    getDevotionalProgress,
} from '@/lib/devotional-db';

/**
 * Admin API for Hugleiðingar (BookForge devotionals).
 *
 *   GET    ?slug=…      → one piece (full body, for the review workspace)
 *   GET                 → all pieces + review progress
 *   PATCH  { id, title_is?, body_is?, reviewed?, review_note?, status? }
 *
 * Publishing guard lives here too: a piece cannot be set to 'published'
 * unless it is reviewed — the translation is machine-produced and a native
 * read is required before anything reaches the public site.
 */

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const slug = new URL(request.url).searchParams.get('slug');
    if (slug) {
        const item = await getDevotionalBySlug(slug);
        if (!item) return NextResponse.json({ error: 'Fannst ekki' }, { status: 404 });
        return NextResponse.json({ success: true, item });
    }

    const [items, progress] = await Promise.all([listAllDevotionals(), getDevotionalProgress()]);
    // Keep the list light: the workspace fetches full bodies per piece.
    return NextResponse.json({
        success: true,
        progress,
        items: items.map((i) => ({
            id: i.id, day: i.day, slot: i.slot, slug: i.slug,
            title_is: i.title_is, reviewed: i.reviewed, status: i.status,
            paragraphs: i.body_is.length,
        })),
    });
}

export async function PATCH(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    let body: Record<string, unknown>;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 }); }

    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'id vantar' }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (typeof body.title_is === 'string' && body.title_is.trim()) {
        patch.title_is = body.title_is.trim().slice(0, 300);
    }
    if (Array.isArray(body.body_is)) {
        const paras = body.body_is
            .filter((p): p is string => typeof p === 'string')
            .map((p) => p.trim())
            .filter(Boolean);
        if (paras.length === 0) {
            return NextResponse.json({ error: 'Textinn má ekki vera tómur' }, { status: 400 });
        }
        patch.body_is = paras;
    }
    if (typeof body.reviewed === 'boolean') patch.reviewed = body.reviewed;
    if (typeof body.review_note === 'string') patch.review_note = body.review_note.slice(0, 1000);

    if (body.status === 'published' || body.status === 'draft') {
        if (body.status === 'published') {
            // Never publish an unread machine translation.
            const current = await getDevotionalBySlug(String(body.slug ?? ''));
            const willBeReviewed = patch.reviewed === true || current?.reviewed === true;
            if (!willBeReviewed) {
                return NextResponse.json(
                    { error: 'Ekki hægt að birta hugleiðingu sem hefur ekki verið yfirlesin.' },
                    { status: 400 },
                );
            }
        }
        patch.status = body.status;
    }

    if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: 'Ekkert til að uppfæra' }, { status: 400 });
    }

    const res = await updateDevotional(id, patch);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
    return NextResponse.json({ success: true });
}
