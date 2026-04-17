import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAllPrayers, approvePrayer, deletePrayer, markPrayerAnswered } from '@/lib/prayer-db';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const prayers = await getAllPrayers();
    return NextResponse.json(prayers);
}

export async function PATCH(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const { id, action } = await request.json();

    if (action === 'approve') {
        const success = await approvePrayer(id);
        return NextResponse.json({ success });
    }

    if (action === 'answered') {
        const success = await markPrayerAnswered(id);
        return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const { id } = await request.json();
    const success = await deletePrayer(id);
    return NextResponse.json({ success });
}
