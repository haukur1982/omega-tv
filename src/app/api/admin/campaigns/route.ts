import { NextRequest, NextResponse } from 'next/server';
import { getAllCampaigns, createCampaign } from '@/lib/prayer-db';

export async function GET() {
    try {
        const campaigns = await getAllCampaigns();
        return NextResponse.json(campaigns);
    } catch {
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { title, description, imageUrl, startDate, endDate } = await req.json();
        if (!title || !endDate) {
            return NextResponse.json({ error: "Titill og lokadagur vantar" }, { status: 400 });
        }

        const campaign = await createCampaign({
            title,
            description,
            imageUrl,
            startDate: startDate || new Date().toISOString(),
            endDate,
        });

        if (!campaign) {
            return NextResponse.json({ error: "Gat ekki búið til herferð" }, { status: 500 });
        }

        return NextResponse.json(campaign);
    } catch {
        return NextResponse.json({ error: "Villa" }, { status: 500 });
    }
}
