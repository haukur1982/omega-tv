import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    getAllNewsAdmin,
    createNews,
    updateNews,
    deleteNews,
    getNewsAdminBySlug,
} from '@/lib/news-db';

/**
 * /api/admin/news
 *
 * GET    — list every news item (incl. unpublished) for the admin inbox
 * POST   — create a new item; rejects on duplicate slug
 * PATCH  — update an item by id
 * DELETE — remove an item by id
 *
 * Source attribution (sourceUrl + sourceName) is required on create —
 * non-negotiable. Missing either returns 400.
 */

export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;
    const items = await getAllNewsAdmin();
    return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }

    const { slug, title, summary, sourceUrl, sourceName } = body as Record<string, string | undefined>;
    if (!slug || !title || !summary) {
        return NextResponse.json({ error: 'Slóð, titill og útdráttur vantar.' }, { status: 400 });
    }
    if (!sourceUrl || !sourceName) {
        return NextResponse.json(
            { error: 'Heimild vantar (sourceUrl + sourceName). Allt fréttaefni þarf að tilgreina heimild.' },
            { status: 400 },
        );
    }

    const existing = await getNewsAdminBySlug(slug);
    if (existing) {
        return NextResponse.json(
            { error: `Slóðin „${slug}“ er þegar í notkun.` },
            { status: 409 },
        );
    }

    const created = await createNews({
        slug: String(slug),
        title: String(title),
        summary: String(summary),
        body: typeof body.body === 'string' ? body.body : null,
        sourceUrl: String(sourceUrl),
        sourceName: String(sourceName),
        sourcePublishedAt: typeof body.sourcePublishedAt === 'string' ? body.sourcePublishedAt : null,
        region: typeof body.region === 'string' ? body.region : null,
        category: typeof body.category === 'string' ? body.category : null,
        imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : null,
        editorNote: typeof body.editorNote === 'string' ? body.editorNote : null,
        isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : false,
    });

    if (!created) {
        return NextResponse.json({ error: 'Tókst ekki að vista frétt.' }, { status: 500 });
    }
    return NextResponse.json(created);
}

export async function PATCH(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }

    const { id, ...rest } = body as { id?: string } & Record<string, unknown>;
    if (!id) return NextResponse.json({ error: 'ID vantar.' }, { status: 400 });

    // If slug is changing, re-check uniqueness.
    const nextSlug = rest.slug;
    if (typeof nextSlug === 'string' && nextSlug.trim()) {
        const existing = await getNewsAdminBySlug(nextSlug);
        if (existing && existing.id !== id) {
            return NextResponse.json(
                { error: `Slóðin „${nextSlug}“ er þegar í notkun á annarri frétt.` },
                { status: 409 },
            );
        }
    }

    const updated = await updateNews(id, rest as Parameters<typeof updateNews>[1]);
    if (!updated) {
        return NextResponse.json({ error: 'Tókst ekki að uppfæra.' }, { status: 500 });
    }
    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: { id?: string } = {};
    try { body = await req.json(); } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }
    if (!body.id) return NextResponse.json({ error: 'ID vantar.' }, { status: 400 });
    const ok = await deleteNews(body.id);
    if (!ok) return NextResponse.json({ error: 'Tókst ekki að eyða.' }, { status: 500 });
    return NextResponse.json({ ok: true });
}
