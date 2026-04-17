import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAllArticlesAdmin, createArticle, updateArticle, deleteArticle } from '@/lib/articles-db';

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
        const { title, slug, content, excerpt, author_name, featured_image, published_at } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Titill, slóð og innihald vantar' }, { status: 400 });
        }

        const article = await createArticle({
            title,
            slug,
            content,
            excerpt: excerpt || null,
            author_name: author_name || 'Omega',
            featured_image: featured_image || null,
            published_at: published_at || new Date().toISOString(),
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
