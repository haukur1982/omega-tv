import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAllNewsletters, createNewsletter, deleteNewsletter } from '@/lib/newsletter-db';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    try {
        const newsletters = await getAllNewsletters();
        return NextResponse.json(newsletters);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    try {
        // Note: this endpoint only CREATES the newsletter row. Sending is a
        // separate step at /api/admin/newsletters/[id]/send so the
        // verified-only + unsubscribe-token policy is consistently enforced.
        // The legacy `send` flag was removed when double-opt-in shipped.
        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: "Titill og innihald vantar" }, { status: 400 });
        }

        const newsletter = await createNewsletter({
            title,
            author: 'Omega',
            content,
        });

        if (!newsletter) {
            return NextResponse.json({ error: "Gat ekki vistað fréttabréf" }, { status: 500 });
        }

        return NextResponse.json(newsletter);
    } catch (error) {
        return NextResponse.json({ error: "Villa við vistun fréttabréfs" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    try {
        const { id } = await req.json();
        const success = await deleteNewsletter(id);
        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ error: "Villa við eyðingu" }, { status: 500 });
    }
}
