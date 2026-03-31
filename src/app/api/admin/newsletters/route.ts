import { NextRequest, NextResponse } from 'next/server';
import { getAllNewsletters, createNewsletter } from '@/lib/newsletter-db';
import { getSubscribers } from '@/lib/subscriber-db';
import { sendNewsletter } from '@/lib/email';

export async function GET() {
    try {
        const newsletters = await getAllNewsletters();
        return NextResponse.json(newsletters);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { title, subject, content, send } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: "Titill og innihald vantar" }, { status: 400 });
        }

        // Save newsletter to database
        const newsletter = await createNewsletter({
            title,
            author: 'Omega',
            content,
        });

        if (!newsletter) {
            return NextResponse.json({ error: "Gat ekki vistað fréttabréf" }, { status: 500 });
        }

        // If send flag is true, send to all subscribers
        if (send) {
            const subscribers = await getSubscribers();
            const emails = subscribers.map((s: { email: string }) => s.email);

            if (emails.length === 0) {
                return NextResponse.json({ ...newsletter, sent: 0, message: "Vistað en engir áskrifendur til að senda á" });
            }

            const result = await sendNewsletter(subject || title, content, emails);
            return NextResponse.json({ ...newsletter, ...result });
        }

        return NextResponse.json(newsletter);
    } catch (error) {
        return NextResponse.json({ error: "Villa við vistun fréttabréfs" }, { status: 500 });
    }
}
