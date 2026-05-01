import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    getAllArticlesAdmin,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleBySlug,
} from '@/lib/articles-db';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    try {
        const articles = await getAllArticlesAdmin();
        return NextResponse.json(articles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const { title, slug, content, excerpt, author_name, featured_image, published_at, category } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Titill, slóð og innihald vantar' }, { status: 400 });
        }

        // Slug uniqueness — articles are routed by slug at /greinar/[slug],
        // so a duplicate would silently shadow the existing article.
        const existing = await getArticleBySlug(slug);
        if (existing) {
            return NextResponse.json(
                { error: `Slóðin „${slug}“ er þegar í notkun. Veldu aðra slóð.` },
                { status: 409 },
            );
        }

        const article = await createArticle({
            title,
            slug,
            content,
            excerpt: excerpt || null,
            author_name: author_name || 'Omega',
            featured_image: featured_image || null,
            published_at: published_at || new Date().toISOString(),
            category: category || null,
        });

        if (!article) {
            return NextResponse.json({ error: 'Gat ekki búið til grein' }, { status: 500 });
        }

        return NextResponse.json(article);
    } catch (error) {
        return NextResponse.json({ error: 'Villa við vistun greinar' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    try {
        const { id, ...updates } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'ID vantar' }, { status: 400 });
        }

        // If the slug is changing, ensure no other article already owns it.
        if (typeof updates.slug === 'string' && updates.slug.trim()) {
            const existing = await getArticleBySlug(updates.slug);
            if (existing && existing.id !== id) {
                return NextResponse.json(
                    { error: `Slóðin „${updates.slug}“ er þegar í notkun á annarri grein.` },
                    { status: 409 },
                );
            }
        }

        const article = await updateArticle(id, updates);
        if (!article) {
            return NextResponse.json({ error: 'Gat ekki uppfært grein' }, { status: 500 });
        }

        return NextResponse.json(article);
    } catch (error) {
        return NextResponse.json({ error: 'Villa við uppfærslu' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    try {
        const { id } = await req.json();
        const success = await deleteArticle(id);
        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ error: 'Villa við eyðingu' }, { status: 500 });
    }
}
