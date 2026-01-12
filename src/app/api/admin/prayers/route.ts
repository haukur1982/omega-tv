import { NextResponse } from 'next/server';
import { getAllPrayers, approvePrayer, deletePrayer } from '@/lib/prayer-db';

export async function GET() {
    const prayers = await getAllPrayers();
    return NextResponse.json(prayers);
}

export async function PATCH(request: Request) {
    const { id, action } = await request.json();

    if (action === 'approve') {
        const success = await approvePrayer(id);
        return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    const success = await deletePrayer(id);
    return NextResponse.json({ success });
}
