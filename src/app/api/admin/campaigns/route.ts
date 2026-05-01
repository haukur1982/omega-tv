import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    getAllCampaigns,
    createCampaign,
    setCampaignActive,
    deleteCampaign,
} from '@/lib/prayer-db';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    try {
        const campaigns = await getAllCampaigns();
        return NextResponse.json(campaigns);
    } catch {
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

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

export async function PATCH(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: { id?: string; is_active?: boolean } = {};
    try { body = await req.json(); } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }
    if (!body.id || typeof body.is_active !== 'boolean') {
        return NextResponse.json({ error: 'ID og is_active vantar.' }, { status: 400 });
    }
    const ok = await setCampaignActive(body.id, body.is_active);
    if (!ok) return NextResponse.json({ error: 'Tókst ekki að uppfæra.' }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: { id?: string } = {};
    try { body = await req.json(); } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }
    if (!body.id) return NextResponse.json({ error: 'ID vantar.' }, { status: 400 });
    const ok = await deleteCampaign(body.id);
    if (!ok) return NextResponse.json({ error: 'Tókst ekki að eyða.' }, { status: 500 });
    return NextResponse.json({ ok: true });
}
