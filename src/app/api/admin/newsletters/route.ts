
import { NextResponse } from 'next/server';
import { getAllNewsletters } from '@/lib/newsletter-db';

export async function GET() {
    try {
        const newsletters = await getAllNewsletters();
        return NextResponse.json(newsletters);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 });
    }
}
